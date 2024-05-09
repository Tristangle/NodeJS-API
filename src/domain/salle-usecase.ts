import { DataSource } from "typeorm";
import { Salle } from "../database/entities/salle";
import { boolean } from "joi";
import { Seance } from "../database/entities/seance";

export interface ListSalleFilter {
    limit: number
    page: number

}

export interface UpdateSalleParams {
    name?: string
    inMaintenance?:boolean
}

export interface PlanningSalleParams{
    dateDebut: Date
    dateFin?: Date
}

export class SalleUsecase{
    constructor(private readonly db: DataSource) { }
    async salleList(listSalleFilter: ListSalleFilter): Promise<{salle: Salle[]}>{
        const query = this.db.createQueryBuilder(Salle, 'salle');
        query.take(listSalleFilter.limit);
        const listeSalle = await query.getMany()
        return {salle:listeSalle};
    }

    async updateSalle(id: number, { name, inMaintenance }: UpdateSalleParams): Promise<Salle | null> {
        const repo = this.db.getRepository(Salle)
        const sallefound = await repo.findOneBy({ id })
        if (sallefound === null) return null

        if (name) {
            sallefound.name = name
        }
        if (inMaintenance) {
            sallefound.inMaintenance = inMaintenance
        }

        const salleUpdate = await repo.save(sallefound)
        return salleUpdate
    }

    async planningSeance(id:number,params: PlanningSalleParams): Promise<{seances: Seance[]}> {
        const query = this.db.createQueryBuilder(Seance, 'seance')
        query.andWhere('seance.salleId =:id AND seance.dateDebut >= :dateDebut',{id:id,dateDebut:params.dateDebut})
        if(params.dateFin){
            query.andWhere('seance.dateFin <= :dateFin',{dateFin:params.dateFin})
        }
        const listSeances = await query.getMany()
        return {seances:listSeances}

    }   
}
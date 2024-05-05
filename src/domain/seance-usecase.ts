import { DataSource } from "typeorm";
import { Seance } from "../database/entities/seance";
import { Salle } from "../database/entities/salle";
import { SeanceRequest } from "../handlers/validators/seance-validator";

export interface ListSeanceFilter {
    limit: number
    page: number

}

export interface UpdateSeanceParams {
    salle?: Salle
    date?: Date
    film?: string
}


export class SeanceUsecase{
    constructor(private readonly db: DataSource) { }
    async seanceList(listSeanceFilter: ListSeanceFilter): Promise<{seance: Seance[]}>{
        const query = this.db.createQueryBuilder(Seance, 'seance');
        query.take(listSeanceFilter.limit);
        const listeSeance = await query.getMany()
        return {seance:listeSeance};
    }

    async creerSeance(seanceRequest: SeanceRequest): Promise<Seance|null> {

        const repoSalle = this.db.getRepository(Salle)
        const salle = repoSalle.findOneBy({id:seanceRequest.idSalle});
        if (!salle) {
            throw new Error("La salle spécifiée n'existe pas.");
        }
       
        const simultaneCheck = this.db.createQueryBuilder(Seance, 'seance')
        simultaneCheck.andWhere('seance.film = :film AND seance.dateDebut = :dateDebut',{film:seanceRequest.film, dateDebut:seanceRequest.dateDebut})
        const seancesIdem = await simultaneCheck.getExists()
        if (seancesIdem){
            throw new Error("Il existe deja une seance pour ce film à cette heure.")

        }

        const query = this.db.createQueryBuilder(Seance, 'seance')
        query.andWhere('seance.salleId = :salleId',{salleId:seanceRequest.idSalle})
        const seances = await query.getMany()
        if (seances){
            let dateFinMax: Date = seances[0].dateFin;
            seances.forEach(seance => {
                if (seance.dateFin > dateFinMax) {
                    dateFinMax = seance.dateFin;
                }
            });
            if (dateFinMax > seanceRequest.dateDebut ) {
                throw new Error("La salle est déjà réservée pour une autre séance à cette heure.")
            }
        }
                
        const repoSeance= this.db.getRepository(Seance)
        const seanceCreate = await repoSeance.save(seanceRequest)
        return seanceCreate
    }

    async updateSeance(id: number, { salle, date, film }: UpdateSeanceParams): Promise<Seance | null> {
        const repo = this.db.getRepository(Seance)
        const Seancefound = await repo.findOneBy({ id })
        if (Seancefound === null) return null

        if (salle) {
            Seancefound.salle = salle
        }
        if (date) {
            Seancefound.dateDebut = date
        }
        if (film) {
            Seancefound.film = film 
        }

        const SeanceUpdate = await repo.save(Seancefound)
        return SeanceUpdate
    }
}
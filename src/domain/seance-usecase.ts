import { DataSource } from "typeorm";
import { Seance } from "../database/entities/seance";
import { Salle } from "../database/entities/salle";
import { SeanceRequest } from "../handlers/validators/seance-validator";
import { Film } from "../database/entities/film";
import {FilmUsecase} from "./film-usecase"
import { addMinutes } from "date-fns";

export interface ListSeanceFilter {
    limit: number
    page: number

}

export interface UpdateSeanceParams {
    salle?: Salle
    date?: Date
    idFilm?: number
}

interface SeanceWithDateFin extends SeanceRequest {
    dateFin: Date;
}


export class SeanceUsecase{
    constructor(private readonly db: DataSource) { }

    async getDateFinSeance(seanceRequest:SeanceRequest):Promise<Date | null>{
        const filmUsecase = new FilmUsecase(this.db)
        const filmDuration = await filmUsecase.getFilmDuration(seanceRequest.film.id)
        if (filmDuration === null) return null
        const dateFin = addMinutes(seanceRequest.dateDebut,filmDuration+30)
        return dateFin
    }

    async validSeance(seanceRequest:SeanceRequest){
        const repoSalle = this.db.getRepository(Salle)
        const salle = repoSalle.findOneBy({id:seanceRequest.salle.id});
        if (!salle) {
            throw new Error("La salle spécifiée n'existe pas.");
        }

        const repoFilm = this.db.getRepository(Film)
        const film = repoSalle.findOneBy({id:seanceRequest.film.id});
        if (!salle) {
            throw new Error("Le film spécifié n'existe pas.");
        }
       
        const simultaneCheck = this.db.createQueryBuilder(Seance, 'seance')
        simultaneCheck.andWhere('seance.filmId = :idFilm AND seance.dateDebut = :dateDebut',{idFilm:seanceRequest.film.id, dateDebut:seanceRequest.dateDebut})
        const seancesIdem = await simultaneCheck.getExists()
        if (seancesIdem){
            throw new Error("Il existe deja une seance pour ce film à cette heure.")

        }

        

        if ( seanceRequest.dateDebut.getHours() <   9 ) {
            throw new Error("L'heure début de séance doit être après 9h.")
        }

        const dateFin = await this.getDateFinSeance(seanceRequest);
        if (!dateFin) {
            throw new Error("Impossible de calculer la date de fin de la séance.(validation)");
        }

        const query = this.db.createQueryBuilder(Seance, 'seance')
        query.andWhere('seance.salleId = :salleId',{salleId:seanceRequest.salle.id})
        //query.orderBy('dateDebut')
        const seances = await query.getMany()
        if (seances.length>0){
            let dateFinMax: Date = seances[0].dateFin;
            seances.forEach(seance => {
                if ((seance.dateDebut < seanceRequest.dateDebut && seanceRequest.dateDebut < seance.dateFin) || (seanceRequest.dateDebut<seance.dateDebut && dateFin>seance.dateDebut   )) {
                    throw new Error("La salle est déjà réservée pour une autre séance à cette heure.")
                }
            });
        }

        if ( dateFin.getHours() > 20 ) {
            throw new Error("L'heure de fin séance doit être avant 20.")
        }

    }

    async seanceList(listSeanceFilter: ListSeanceFilter): Promise<{seance: Seance[]}>{
        const query = this.db.createQueryBuilder(Seance, 'seance');
        query.take(listSeanceFilter.limit)
        const listeSeance = await query.getMany()
        return {seance:listeSeance}
    }

    async createSeance(seanceRequest: SeanceRequest): Promise<Seance|null> {
        try {
            await this.validSeance(seanceRequest);
        } catch (error) {
            throw new Error(`Validation error: ${(error as Error).message}`)
        }
        const dateFin = await this.getDateFinSeance(seanceRequest);
        if (!dateFin) {
            throw new Error("Impossible de calculer la date de fin de la séance (création).");
        }
        const newSeance: SeanceWithDateFin = {
            ...seanceRequest, // Copy values from SeanceRequest
            dateFin: dateFin, // Add dateFin property
        };
        const repoSeance= this.db.getRepository(Seance)
        const seanceCreate = await repoSeance.save(newSeance)
        return seanceCreate
    }

    async updateSeance(id: number, { salle, date, idFilm }: UpdateSeanceParams): Promise<Seance | null> {
        const repo = this.db.getRepository(Seance)
        const Seancefound = await repo.findOneBy({ id })
        if (Seancefound === null) return null

        if (salle) {
            Seancefound.salle = salle
        }
        if (date) {
            Seancefound.dateDebut = date
        }

        const SeanceUpdate = await repo.save(Seancefound)
        return SeanceUpdate
    }

}
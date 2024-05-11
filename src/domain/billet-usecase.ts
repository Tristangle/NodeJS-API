import { DataSource } from "typeorm";
import { Billet } from "../database/entities/billet";
import { Seance } from "../database/entities/seance";
import { User } from "../database/entities/user";
import { BilletRequest } from "../handlers/validators/billet-validator";
import { UserUsecase } from "./user-usecase";
import { AppDataSource } from "../database/database";
import { addDays, eachDayOfInterval } from "date-fns";
import { number } from "joi";
import { Salle } from "../database/entities/salle";

export interface frequentationParams{
    dateDebut: Date
    dateFin: Date
}

export class BilletUsecase {

    constructor(private readonly db: DataSource) {}

    async createBillets(billetRequest:BilletRequest):Promise<BilletRequest|null>{
        const placeDispoCheck = this.db.createQueryBuilder(Billet, 'billet');
        placeDispoCheck.andWhere('billet.seanceId = :id',{id:billetRequest.seance.id})
        const numberOfBilletsBefore = await placeDispoCheck.getCount()
        console.log(billetRequest.seance)
        const repoSeance = this.db.getRepository(Seance)
        const seanceFound = await repoSeance.findOneBy({ id:billetRequest.seance.id })
        if (seanceFound && numberOfBilletsBefore === seanceFound.salle.capacity){
            throw new Error("La salle est complète pour cette séance")
        }
        const userRepository = AppDataSource.getRepository(User);
        const userFound = await userRepository.findOne({ where:{id: billetRequest.user.id }});
        if(!userFound){
            throw new Error("Mauvais id user")
        }
        if(billetRequest.prix > userFound.solde){
            throw new Error("Argent insuffisant pour faire la transaction")
        }
        userFound.solde -= billetRequest.prix;
        await userRepository.save(userFound);
        const repoBillet= this.db.getRepository(Billet)
        const billetCreate = await repoBillet.save(billetRequest)
        return billetRequest
    }
 
    async getBilletsByUserId(userId: number): Promise<Billet[]> {
        const billetRepo = this.db.getRepository(Billet);
        return billetRepo.find({
            where: { user: { id: userId } },
            relations: ["seance", "seance.film", "seance.salle"]
        });
    }
    async getFrequentation(range:frequentationParams): Promise<string>{
        const days = eachDayOfInterval({
            start: range.dateDebut,
            end : range.dateFin
        })
        console.log(days)
        let occupancyRates = new Map();
        for (const day of days) {
            const query = this.db.createQueryBuilder(Seance, 'seance');
            query.andWhere('seance.dateDebut >= :dateDebut', { dateDebut: day });
            if (range.dateFin) {
                query.andWhere('seance.dateFin < :dateFin', { dateFin: addDays(day, 1) });
            }
            const listSeances = await query.getMany();
            let billetsTotal = 0;
            let placesTotal = 0;
            
            for (const seance of listSeances) {
                const queryBillets = this.db.createQueryBuilder(Billet, 'billet');
                queryBillets.andWhere('billet.seanceId = :seanceId', { seanceId: seance.id });
                const billetsCount = await queryBillets.getCount();
                billetsTotal += billetsCount;
                placesTotal += seance.salle.capacity;
            }
            const occupancyRate = billetsTotal / placesTotal;
            occupancyRates.set(day, occupancyRate);

        }
        let message = ""
        let totalRate = 0;
        let totalCount = 0;
        occupancyRates.forEach((value, key)=>{
            message+=`${key.toISOString()} : ${value} % d'occupation\n`
            totalRate += value;
            totalCount++;
        })
        const averageRate = totalRate / totalCount;
        message += `${averageRate} de moyenne de frequentation sur la periode ${range.dateDebut.toISOString()} à ${range.dateFin.toISOString()}`
        return message
    }
}
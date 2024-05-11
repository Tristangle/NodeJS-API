import { DataSource } from "typeorm";
import { Billet } from "../database/entities/billet";
import { Seance } from "../database/entities/seance";
import { User } from "../database/entities/user";
import { BilletRequest } from "../handlers/validators/billet-validator";

export class BilletUsecase {

    constructor(private readonly db: DataSource) {}

    async createBillets(billetRequest:BilletRequest):Promise<BilletRequest|null>{
        const placeDispoCheck = this.db.createQueryBuilder(Billet, 'billet');
        placeDispoCheck.andWhere('billet.seanceId = :id',{id:billetRequest.seance.id})
        const numberOfBilletsBefore = await placeDispoCheck.getCount()
        if (numberOfBilletsBefore === billetRequest.seance.salle.capacity){
            throw new Error("La salle est complète pour cette séance")
        }
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
}

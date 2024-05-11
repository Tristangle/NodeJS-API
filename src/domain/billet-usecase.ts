import { DataSource } from "typeorm";
import { Billet } from "../database/entities/billet";
import { Seance } from "../database/entities/seance";
import { User } from "../database/entities/user";

export class BilletUsecase {

    constructor(private readonly db: DataSource) {}

 
    async getBilletsByUserId(userId: number): Promise<Billet[]> {
        const billetRepo = this.db.getRepository(Billet);
        return billetRepo.find({
            where: { user: { id: userId } },
            relations: ["seance", "seance.film", "seance.salle"]
        });
    }
}

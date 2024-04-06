import { DataSource } from "typeorm";
import { User } from "../database/entities/user";

export interface listUserFilter{
    page: number,
    result: number
}

export class UserUsecase{
    constructor(private readonly db: DataSource) { }

    async userList(listUserFilter: listUserFilter): Promise<{user: User[]}>{
        const query = this.db.createQueryBuilder(User, 'user');
        // Demander à prendre les utilisateurs en fonction de la limite
        query.take(listUserFilter.result);
        // retourner les utilisateurs
        const listeUser = await query.getMany()
        return {user:listeUser};
    }
}
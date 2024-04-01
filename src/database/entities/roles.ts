import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";


@Entity()
export class Role{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: String;

    @ManyToMany(() => User, user => user.roles)@JoinTable()
        user: User[];
    

    constructor(id: number, name: String, users: User[]) {
        this.id = id;
        this.name = name;
        this.user = users;
    }
}
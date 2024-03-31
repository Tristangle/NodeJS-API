import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";


@Entity()
export class Role{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: String;

    @ManyToMany(() => User, user => user.roles)@JoinTable()
        users: User[];
    

    constructor(id: number, name: String, users: User[] = []) {
        this.id = id;
        this.name = name;
        this.users = users;
    }
}
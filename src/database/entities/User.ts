import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable, ManyToOne } from "typeorm"
import { Token } from "./token";
import { Role } from "./roles";
import "reflect-metadata"

@Entity()
export class User{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @OneToMany(() => Token, token => token.user)
    tokens: Token[];

    @ManyToOne(() => Role, roles => roles.user)
    @JoinTable()
    roles: Role[];

    constructor(id: number, username: string,email: string, password: string, tokens: Token[], roles: Role[]){
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.tokens = tokens;
        this.roles = roles;
    }

}
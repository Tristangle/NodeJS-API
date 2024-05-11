import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from "typeorm"
import { Token } from "./token";
import { Role } from "./roles";
import { Billet } from "./billet";
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

    @ManyToMany(() => Role, roles => roles.user)
    @JoinTable()
    roles: Role[];

    @OneToMany(() => Billet, billet => billet.user)
    billets: Billet[];

    constructor(id: number, username: string,email: string, password: string, tokens: Token[], roles: Role[], billets: Billet[]){
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.tokens = tokens;
        this.roles = roles;
        this.billets = billets;
    }

}
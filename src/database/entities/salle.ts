import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Seance } from "./seance";

@Entity()
export class Salle{

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: String

    @Column()
    capacity: number

    @Column()
    inMaintenance: boolean

    @OneToMany(() => Seance, seances => seances.salle)
    seances: Seance[]
    
    constructor(id: number, name: String, capacity:number, inMaintenance:boolean, seances:Seance[]) {
        this.id = id
        this.name = name
        this.capacity = capacity
        this.inMaintenance = inMaintenance
        this.seances = seances
    }
}
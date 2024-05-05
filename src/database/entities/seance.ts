import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Salle } from "./salle";

@Entity()
export class Seance{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    dateDebut:Date

    @Column()
    dateFin:Date

    @ManyToOne(() => Salle, salle => salle.seances)
    salle: Salle;

    @Column()
    film: string;

    constructor(id: number, salle: Salle, dateDebut:Date, dateFin:Date, film:string) {
        this.id = id;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.salle = salle;
        this.film = film;
    }
}
import { Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Salle } from "./salle";
import { Film } from "./film";

@Entity()
export class Seance{

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    dateDebut:Date

    @Column()
    dateFin:Date

    @ManyToOne(() => Salle, salle => salle.seances, { eager: true }) 
    salle: Salle;

    @ManyToOne(() => Film, film => film.seances, { eager: true })
    film: Film;

    constructor(id: number, salle: Salle, dateDebut:Date, dateFin:Date, film:Film, placesVendues:number) {
        this.id = id
        this.dateDebut = dateDebut
        this.dateFin = dateFin
        this.salle = salle
        this.film = film
    }
}
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Salle } from "./salle";
import { Film } from "./film";

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

    @ManyToOne(() => Film, film => film.seances)
    film: Film;

    constructor(id: number, salle: Salle, dateDebut:Date, dateFin:Date, film:Film) {
        this.id = id;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.salle = salle;
        this.film = film;
    }
}
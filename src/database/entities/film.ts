import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "film" })
export class Film {
  @PrimaryGeneratedColumn()
  id: number;  

  @Column()
  title: string; 

  @Column()
  description: string;  

  @Column()
  duration: number;

  @Column()
  genre: string; 

  @Column()
  author: string; 

  @Column()
  affectedRoom:string;

  @Column()
  startDate:number;

  @Column()
  endDate:number

  constructor(id: number, title: string, description: string, duration: number,  genre: string, author: string, affectedRoom:string, startDate: number, endDate:number) {
    this.id = id
    this.title = title
    this.description = description
    this.duration = duration
    this.genre = genre
    this.author = author
    this.affectedRoom = affectedRoom
    this.startDate = startDate
    this.endDate = endDate
  }
}
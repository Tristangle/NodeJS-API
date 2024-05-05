import Joi from "joi";
import { Salle } from "../../database/entities/salle";

export interface SeanceRequest{
    idSalle : number,
    dateDebut: Date,
    dateFin: Date,
    film: string,
}

export const seanceValidation = Joi.object<SeanceRequest>({
    idSalle: Joi.number().required(),
    dateDebut: Joi.date().required(),
    film: Joi.string().required()
}).options({ abortEarly: false })

export interface SeanceIdRequest {
    id: number
}

export const seanceIdValidation = Joi.object<SeanceIdRequest>({
    id: Joi.number().required(),
})

export const listSeanceValidation = Joi.object<ListSeanceRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})


export interface ListSeanceRequest {
    page?: number
    limit?: number
}

export const updateSeanceValidation = Joi.object<UpdateSeanceRequest>({
    id: Joi.number().required(),
    date: Joi.date().optional(),
    film: Joi.string().min(1).optional()
})

export interface UpdateSeanceRequest {
    id: number
    date?: Date
    film?:boolean
}
import Joi from "joi";

export interface SalleRequest{
    name:string,
    capacity:number,
    inMaintenance:boolean,
}

export const salleValidation = Joi.object<SalleRequest>({
    name: Joi.string()
        .required(),
    capacity: Joi.number()
        .min(15)
        .max(30)
        .required(),
    inMaintenance: Joi.boolean()
        .required()

}).options({ abortEarly: false })

export interface SalleIdRequest {
    id: number
}

export const listSalleValidation = Joi.object<ListSalleRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})


export interface ListSalleRequest {
    page?: number
    limit?: number
}

export const salleIdValidation = Joi.object<SalleIdRequest>({
    id: Joi.number().required(),
})

export const updateSalleValidation = Joi.object<UpdateSalleRequest>({
    id: Joi.number().required(),
    name: Joi.string().min(1).optional(),
    inMaintenance: Joi.boolean().optional()
})

export interface UpdateSalleRequest {
    id: number
    name?: string
    inMaintenance?:boolean
}

export const planningSalleValidation = Joi.object<PlanningSalleRequest>({
    id: Joi.number().required(),
    dateDebut: Joi.date().required(),
    dateFin: Joi.date().optional(),
})

export interface PlanningSalleRequest{
    id: number
    dateDebut: Date
    dateFin?: Date
}
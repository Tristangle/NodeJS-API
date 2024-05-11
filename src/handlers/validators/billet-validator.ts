import Joi from 'joi';
import { Seance } from '../../database/entities/seance';
 
export const billetValidation = Joi.object<BilletRequest>({
    isSuperBillet: Joi.boolean()
        .required(),
    totalSessions: Joi.number()
        .integer()
        .min(1)
        .required()
        .when('isSuperBillet', { is: true, then: Joi.number().valid(10), otherwise: Joi.number().valid(1) }),
    seance: Joi.object<Seance>({
        id: Joi.number().required(),
    }).required(),
    userId: Joi.number()
        .integer()
        .min(1)
        .required(),
}).options({ abortEarly: false });
 
export interface BilletRequest {
    isSuperBillet: boolean;
    totalSessions: number;
    seance: Seance;
    userId: number;
}
export const getBilletsByUserId = Joi.object({
    id: Joi.number()
        .integer()
        .min(1)
        .required(),
});

 
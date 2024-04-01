import Joi from "joi";

// User validation create
export interface createUserValidationRequest {
    username: string;
    email: string;
    password: string;
}
export const createUserValidation = Joi.object<createUserValidationRequest>({
    username: Joi.string().alphanum().min(5).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
})
// User authentification valid

// User logout
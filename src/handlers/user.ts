import  express, { Request, Response } from "express";
import { AppDataSource } from "../database/database";
import { createUserValidation } from "./validators/user-validator";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { User } from "../database/entities/user";
import { hash } from "bcrypt";


export const UserHandler = (app: express.Express) => {
    // Créer un nouvel utilisateur
    app.post('/auth/signup', async(req:Request, res:Response) => {
        try {
            const userValidation = createUserValidation.validate(req.body);
            if(userValidation.error){
                res.status(400).send(generateValidationErrorMessage(userValidation.error.details));
                return;
            }
            const createUserRequest = userValidation.value;
            const hashedPassword = await hash(createUserRequest.password, 10);
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.save({
                username: createUserRequest.username,
                email: createUserRequest.email,
                password: hashedPassword
            });
            res.status(201).send({id: user.id, email: user.email});
            return;

        } catch (error) {
            console.log(error);
        }
    })
}
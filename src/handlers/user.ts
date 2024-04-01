import  express, { Request, Response } from "express";
import { AppDataSource } from "../database/database";
import { createUserValidation, loginUserValidation } from "./validators/user-validator";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { User } from "../database/entities/user";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { Token } from "../database/entities/token";


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
            res.status(500).send({ "error": "internal error retry later" });
            return;
        }
    });
    // Connexion d'un utilisateur
    app.post('/auth/login', async(req:Request, res: Response) => {
        try {
            const userValidation = loginUserValidation.validate(req.body);
            if(userValidation.error){
                res.status(400).send(generateValidationErrorMessage(userValidation.error.details));
                return;
            }
            const loginUserRequest = userValidation.value;
            const user = await AppDataSource.getRepository(User).findOneBy({username: loginUserRequest.username});
            if (!user) {
                res.status(400).send({ error: " Le premier username or password not valid" })
                return
            }
            // valid password for this user
            const isValid = await compare(loginUserRequest.password, user.password);
            if (!isValid) {
                res.status(400).send({ error: "Le username or password not valid" })
                return
            }
            const secret = process.env.JWT_SECRET ?? ""
            console.log(secret)
            const token = sign({ userId: user.id, username: user.username }, secret, { expiresIn: '1d' });
            await AppDataSource.getRepository(Token).save({ token: token, user: user })
            res.status(200).json({ token });
        } catch (error) {
            
            console.log(error);
            res.status(500).send({ "error": "internal error retry later" });
            return;
        }
    });
}
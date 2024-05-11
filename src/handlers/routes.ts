import express, { Request, Response } from "express";
import { UserHandler } from "./user";
import { authMiddleware } from "./middleware/auth-middleware";
import { roleMiddleware } from "./middleware/role-middleware";
import { userListValidation } from "./validators/user-validator";
import { creditUserValidation, debitUserValidation } from "./validators/argent-validator";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { UserUsecase } from "../domain/user-usecase";
import { AppDataSource } from "../database/database";
import { getUserIdFromToken } from "./utils/getUserId";
export const initRoutes = (app:express.Express) => {
    app.get('/users',authMiddleware, roleMiddleware, async(req: Request, res:Response)=>{

        const usersValidation = userListValidation.validate(req.body);
        if(usersValidation.error){
            res.status(400).send(generateValidationErrorMessage(usersValidation.error.details));
            return;
        }
        const userList = usersValidation.value;
        let result = 20
        if (userList.result) {
            result = userList.result
        }
        const page = userList.page ?? 1

        try {
            const userUsecase = new UserUsecase(AppDataSource);
            const listUser = await userUsecase.userList({ ... userList,page, result })
            res.status(200).send(listUser)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    });
    // Route pour crédit solde user
    app.patch('/credit', authMiddleware, async(req: Request, res: Response)=>{
       const creditValidation = creditUserValidation.validate(req.body);
       if(creditValidation.error){
            res.status(400).send(generateValidationErrorMessage(creditValidation.error.details));
            return;
       }
       const credit = creditValidation.value;
       const userId = getUserIdFromToken(req);
       try{
            const userUsecase = new UserUsecase(AppDataSource);
            const creditUser = await userUsecase.addCreditUser(credit, userId!)
            res.status(200).json(creditUser);
       } catch(error){
        console.log(error);
        res.status(500).send({error: "Internal error"});
       }
    })
    // Route pour retirer solde user
    app.patch('/debit', authMiddleware, async(req: Request, res: Response)=>{
        const debitValidation = debitUserValidation.validate(req.body);
        if(debitValidation.error){
             res.status(400).send(generateValidationErrorMessage(debitValidation.error.details));
             return;
        }
        const debit = debitValidation.value;
        const userId = getUserIdFromToken(req);
        try{
             const userUsecase = new UserUsecase(AppDataSource);
             const debitUser = await userUsecase.debitUser(debit, userId!)
             res.status(200).json(debitUser);
        } catch(error:any){
         console.log(error);
         res.status(500).send({ error: error.message });       
        }
    })
    // Route pour regarder transaction user
    UserHandler(app)
}
import express, { Request, Response } from "express";
import { UserHandler } from "./userHandler";
import { authMiddleware } from "./middleware/auth-middleware";
import { userListValidation } from "./validators/user-validator";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { UserUsecase } from "../domain/user-usecase";
import { AppDataSource } from "../database/database";
import { SalleUsecase } from "../domain/salle-usecase";
import { listSalleValidation, salleIdValidation, salleValidation, updateSalleValidation } from "./validators/salle-validator";
import { Salle } from "../database/entities/salle";
import { listSeanceValidation, seanceValidation } from "./validators/seance-validator";
import { Seance } from "../database/entities/seance";
import { SeanceUsecase } from "../domain/seance-usecase";
export const initRoutes = (app:express.Express) => {
    app.get('/users',authMiddleware,async(req: Request, res:Response)=>{

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
    })

    app.get("/salles", async (req: Request, res: Response) => {
        const validation = listSalleValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listSalleRequest = validation.value
        let limit = 20
        if (listSalleRequest.limit) {
            limit = listSalleRequest.limit
        }
        const page = listSalleRequest.page ?? 1

        try {
            const salleUsecase = new SalleUsecase(AppDataSource);
            const listSalle = await salleUsecase.salleList({ ...listSalleRequest, page, limit })
            res.status(200).send(listSalle)
        } catch (error) {   
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.patch("/salles/:id", async (req: Request, res: Response) => {

        const validation = updateSalleValidation.validate({...req.params, ...req.body})

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updateSalleRequest = validation.value

        try {
            const salleUsecase = new SalleUsecase(AppDataSource);
            const updatedSalle = await salleUsecase.updateSalle(updateSalleRequest.id, { ...updateSalleRequest })
            if (updatedSalle === null) {
                res.status(404).send({"error": `salle ${updateSalleRequest.id} not found`})
                return
            }
            res.status(200).send(updatedSalle)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.post("/salles", async (req: Request, res: Response) => {
        const validation = salleValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const salleRequest = validation.value
        const salleRepo = AppDataSource.getRepository(Salle)
        try {

            const collectionCreated = await salleRepo.save(
                salleRequest
            )
            res.status(201).send(collectionCreated)
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.delete("/salles/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = salleIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const salleId = validationResult.value

            const salleRepository = AppDataSource.getRepository(Salle)
            const salle = await salleRepository.findOneBy({ id: salleId.id })
            if (salle === null) {
                res.status(404).send({ "error": `salle ${salleId.id} not found` })
                return
            }

            const collectionDeleted = await salleRepository.remove(salle)
            res.status(200).send(collectionDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.post("/seances", async (req: Request, res: Response) => {
        const validation = seanceValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const seanceRequest = validation.value
        const seanceRepo = AppDataSource.getRepository(Seance)
        try {

            const collectionCreated = await seanceRepo.save(
                seanceRequest
            )
            res.status(201).send(collectionCreated)
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    })
    app.get("/seances", async (req: Request, res: Response) => {
        const validation = listSeanceValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listSeanceRequest = validation.value
        let limit = 20
        if (listSeanceRequest.limit) {
            limit = listSeanceRequest.limit
        }
        const page = listSeanceRequest.page ?? 1

        try {
            const seanceUsecase = new SeanceUsecase(AppDataSource);
            const listSeance= await seanceUsecase.seanceList({ ...listSeanceRequest, page, limit })
            res.status(200).send(listSeance)
        } catch (error) {   
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    UserHandler(app)
}
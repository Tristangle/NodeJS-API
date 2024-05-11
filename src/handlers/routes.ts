import express, { Request, Response } from "express";
import { UserHandler } from "./userHandler";
import { authMiddleware } from "./middleware/auth-middleware";
import { userListValidation } from "./validators/user-validator";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { UserUsecase } from "../domain/user-usecase";
import { AppDataSource } from "../database/database";
import { SalleUsecase } from "../domain/salle-usecase";
import { listSalleValidation, planningSalleValidation, salleIdValidation, salleValidation, updateSalleValidation } from "./validators/salle-validator";
import { Salle } from "../database/entities/salle";
import { listSeanceValidation, planningSeanceValidation, seanceIdValidation, seanceValidation, updateSeanceValidation } from "./validators/seance-validator";
import { Seance } from "../database/entities/seance";
import { SeanceUsecase } from "../domain/seance-usecase";
import { filmValidation,getByIdFilmValidation, getByTitleFilmValidation,deleteFilmValidation,updateFilmValidation,/*getFilmByTitleAndPeriod*/ } from "./validators/film-validator"; 
import { FilmUsecase } from "../domain/film-usecase";
import { Film } from "../database/entities/film";
import { Billet } from "../database/entities/billet";
import { BilletUsecase } from "../domain/billet-usecase";
import { getBilletsByUserId, billetValidation } from "./validators/billet-validator"; 

export const initRoutes = (app:express.Express) => {

    app.get("/billet/:userId", async (req: Request, res: Response) => { 
        try {
            const userId = parseInt(req.params.userId, 10);
            if (isNaN(userId)) {
                return res.status(400).send({"error": "Invalid user ID"});
            }
    
            const billetUsecase = new BilletUsecase(AppDataSource);
            const billets = await billetUsecase.getBilletsByUserId(userId);
    
            if (billets.length === 0) {
                return res.status(404).send({"error": "No tickets available for this user."});
            }
            res.status(200).send(billets);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.post("/billets", async (req: Request, res: Response) => {
        const validation = billetValidation.validate(req.body);
        
        if (validation.error) { 
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }
        
        const billetRequest = validation.value; 
        try {
            const billetUsecase = new BilletUsecase(AppDataSource)
            const billetCreated = await billetUsecase.createBillets(billetRequest)
            res.status(201).send(billetCreated)
        } catch (error) {
            res.status(500).send((error as Error).message)
        }
    });

    // Accessible pour tous les users
    app.get("/films", async (req: Request, res: Response) => { 

        try {
            const filmUsecase = new FilmUsecase(AppDataSource);

            const getFilm = await filmUsecase.getFilm()
            if (getFilm === null) {
                res.status(404).send({"error": `no movies available.`})
                return
            }
            res.status(200).send(getFilm)
        }catch (error){
            console.log(error)
            res.status(500).send({ error: "Internal error" }) 
        } 
    })
    // Accessible pour tous les users
    app.get("/films/:id", async (req: Request, res: Response) => { 
        const validation = getByIdFilmValidation.validate(req.params)
         
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
         
        const getByIdFilmRequest = validation.value

        try {
            const filmUsecase = new FilmUsecase(AppDataSource);

            const getByIdFilm = await filmUsecase.getFilmById(getByIdFilmRequest.id)
            if (getByIdFilm === null) {
                res.status(404).send({"error": `film ${getByIdFilmRequest.id} not found`})
                return
            }
            res.status(200).send(getByIdFilm)
        }catch (error){
            console.log(error)
            res.status(500).send({ error: "Internal error" }) 
        } 
    })

    // ICI Supp le double S quand le middleware fonctionne
    // Accessible pour les users authentifiés
    app.get("/filmss/:title", async (req: Request, res: Response) => { 
        const validation = getByTitleFilmValidation.validate(req.params)
         
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
         
        const getByTitleFilmRequest = validation.value

        try {
            const filmUsecase = new FilmUsecase(AppDataSource);

            const getByTitleFilm = await filmUsecase.getFilmByTitle(getByTitleFilmRequest.title)
            if (getByTitleFilm === null) {
                res.status(404).send({"error": `film ${getByTitleFilmRequest.title} not found`})
                return
            }
            res.status(200).send(getByTitleFilm)
        }catch (error){
            console.log(error)
            res.status(500).send({ error: "Internal error" }) 
        } 
    })

    // ICI Supp le double S quand le middleware fonctionne
    // Accessible pour les users authentifiés
    app.get("/filmss", async (req: Request, res: Response) => { 

        try {
            const filmUsecase = new FilmUsecase(AppDataSource);

            const getFilm = await filmUsecase.getFilmAuth()
            if (getFilm === null) {
                res.status(404).send({"error": `no movies available.`})
                return
            }
            res.status(200).send(getFilm)
        }catch (error){
            console.log(error)
            res.status(500).send({ error: "Internal error" }) 
        } 
    })

    // Accessible pour les admins
    app.post("/films", async (req: Request, res: Response) => {
        const validation = filmValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const filmRequest = validation.value
        const filmRepo = AppDataSource.getRepository(Film)
        try {
            const filmCreated = await filmRepo.save(
                filmRequest
            )
            res.status(201).send(filmCreated)
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    })

    // Accessible pour les admins
    app.delete("/films/:id", async (req: Request, res: Response) => {
        const validation = deleteFilmValidation.validate(req.params)

        if(validation.error){
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const deleteFilmRequest = validation.value
        try {
            const filmUsecase = new FilmUsecase(AppDataSource);

            const deleteFilm= await filmUsecase.deleteFilm(deleteFilmRequest.id)
            if (deleteFilm === null) {
                res.status(404).send({"error": `film ${deleteFilmRequest.id} not found`})
                return
            }
            res.status(200).send(deleteFilm)
        }catch (error){
            console.log(error)
            res.status(500).send({ error: "Internal error" }) 
        }
        
    })
    
    // Accessible pour les admins
    app.patch("/films/:id", async (req: Request, res: Response) => {

        const validation = updateFilmValidation.validate({...req.params, ...req.body})

        
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updateFilmRequest = validation.value

        try {
            const filmUsecase = new FilmUsecase(AppDataSource);
            const updatedFilm = await filmUsecase.updateFilm(updateFilmRequest.id, { ...updateFilmRequest })
            if (updatedFilm === null) {
                res.status(404).send({"error": `film ${updateFilmRequest.id} not found`})
                return
            }
            res.status(200).send(updatedFilm)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    
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

    app.get("/salles/:id/planning", async (req: Request, res: Response) => {

        const validation = planningSalleValidation.validate({...req.params, ...req.body})

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const planningSalleRequest = validation.value

        try {
            const salleUsecase = new SalleUsecase(AppDataSource);
            const listeSalles= await salleUsecase.planningSeance(planningSalleRequest.id, {...planningSalleRequest})
            if (listeSalles === null) {
                res.status(404).send({"error": `not seances found`})
                return
            }
            res.status(200).send(listeSalles)
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

            const salleCreated = await salleRepo.save(
                salleRequest
            )
            res.status(201).send(salleCreated)
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

            const salleDeleted = await salleRepository.remove(salle)
            res.status(200).send(salleDeleted)
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
        try {
            const seanceUsecase = new SeanceUsecase(AppDataSource)
            const createdSeance = await seanceUsecase.createSeance(seanceRequest)
            res.status(201).send(createdSeance)
        } catch (error) {
            res.status(500).send((error as Error).message)
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

    app.get("/seances/planning", async (req: Request, res: Response) => {

        const validation = planningSeanceValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const planningSalleRequest = validation.value

        try {
            const seanceUsecase = new SeanceUsecase(AppDataSource);
            const listSeances= await seanceUsecase.planningSeance(planningSalleRequest)
            if (listSeances === null) {
                res.status(404).send({"error": `not seances found`})
                return
            }
            res.status(200).send(listSeances)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.delete("/seances/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = seanceIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const seanceId = validationResult.value

            const seanceRepository = AppDataSource.getRepository(Seance)
            const seance = await seanceRepository.findOneBy({ id: seanceId.id })
            if (seance === null) {
                res.status(404).send({ "error": `salle ${seanceId.id} not found` })
                return
            }

            const salleDeleted = await seanceRepository.remove(seance)
            res.status(200).send(salleDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.patch("/seances/:id", async (req: Request, res: Response) => {
        
        const validation = updateSeanceValidation.validate({...req.params, ...req.body})

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updateSeanceRequest = validation.value
        console.log(updateSeanceRequest)
        try {
            const seanceUsecase = new SeanceUsecase(AppDataSource);
            const updatedSeance = await seanceUsecase.updateSeance(updateSeanceRequest.id, { ...updateSeanceRequest })
            if (updatedSeance === null) {
                res.status(404).send({"error": `seance ${updateSeanceRequest.id} not found`})
                return
            }
            res.status(200).send(updatedSeance)
        } catch (error) {
            console.log(error)
            res.status(500).send((error as Error).message)
        }
    })
    UserHandler(app)
}
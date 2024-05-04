import express, { Request, Response } from "express";
import { UserHandler } from "./user";
import { authMiddleware } from "./middleware/auth-middleware";
import { userListValidation } from "./validators/user-validator";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { UserUsecase } from "../domain/user-usecase";
import { AppDataSource } from "../database/database";
import { filmValidation,getByIdFilmValidation, getByTitleFilmValidation,deleteFilmValidation,updateFilmValidation,getFilmByTitleAndPeriod } from "./validators/film-validator"; 
import { FilmUsecase } from "../domain/film-usecase";
import { Film } from "../database/entities/film";

export const initRoutes = (app:express.Express) => {
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
    
    app.get("/filmss/:title/:startDate/:endDate", async (req: Request, res: Response) => { 
        const validation = getFilmByTitleAndPeriod.validate(req.params);
    
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }
        
        const { title, startDate, endDate } = validation.value;
    
        try {
            const filmUsecase = new FilmUsecase(AppDataSource);
    
            const films = await filmUsecase.getFilmByTitleAndPeriod(title, parseInt(startDate), parseInt(endDate));
            if (!films || films.length === 0) {
                res.status(404).send({"error": `No films found for "${title}" between ${startDate} and ${endDate}`});
                return;
            }
            res.status(200).send(films);
        } catch (error) { 
            console.log(error);
            res.status(500).send({ error: "Internal error" }); 
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
    UserHandler(app)
}
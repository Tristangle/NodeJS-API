import express, { Request, Response } from "express";
import { UserHandler } from "./user";

export const initRoutes = (app:express.Express) => { 
    UserHandler(app)
}
import { User } from "../../database/entities/user";
import { NextFunction, Response, Request } from "express";
import { AppDataSource } from "../../database/database";
import { Token } from "../../database/entities/token";
import { verify } from "jsonwebtoken";

// Objectif : vérifier qu'un utilisateur est connecté 
export const authMiddleware = async(req: Request, res: Response, next: NextFunction)=>{
    // Récupérer la valeur du token donné
    const tokenRepository = AppDataSource.getRepository(Token);
    const authToken = req.headers.authorization;

    
        // Vérifier si le token est null ou vide
        if(!authToken){
            // Redirection page login
            return res.status(401).json({"error": "Unauthorized"});
        }
        const token = authToken!.split(' ')[1];

        // Verify
        const verifiedToken = verify(token, 'apinodejs',(err,user)=>{
            if (err) return res.status(403).json({"error": "Access Forbidden"});
            (req as any).user = user;
            next();
        });
        const tokenVerified = await tokenRepository.findOne({where: {token}, relations:["user"] });
        const tokenRole = tokenVerified?.user.roles;
        if(verifiedToken === null){
            return res.status(401).json({"error": "Unauthorized"});
        }
        // Vérifier si le token existe
        
        if(!tokenVerified){
            return res.status(401).json({"error": "Unauthorized"});
        }
}



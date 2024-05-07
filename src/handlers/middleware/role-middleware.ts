import {NextFunction, Request, Response} from "express"
import { Role } from "../../database/entities/roles";
import { verify } from "jsonwebtoken";


export const roleMiddleware = async(req: Request, res: Response, next: NextFunction)=>{

    //Récupérer le rôle de l'utilisateur à partir du token
      const auth = req.headers.authorization;
      const authSeparation = auth!.split('.')[1];
      const decodedPayload = Buffer.from(authSeparation, 'base64').toString('utf-8');
      const user = JSON.parse(decodedPayload);
      console.log(user);
      const userRole = user.roles;
      console.log(`le role de l'utilisateur est ${userRole}`);
    //Si aucun rôle n'est spécifié pour la ressource
        //Passer à l'étape suivante (laisser l'accès)

    //Sinon

        //Vérifier si l'utilisateur possède au moins l'un des rôles spécifiés pour la ressource
        //Si l'utilisateur possède l'un des rôles spécifiés
        //if(){
        //}
        //Passer à l'étape suivante (laisser l'accès)
        //else{
            //Afficher une réponse 403 "Accès refusé"
        //}
        next();
}

    


    

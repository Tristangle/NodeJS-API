import {Request, Response} from "express"
import { Role } from "../../database/entities/roles";


export const roleMiddleware = async(req: Request, res: Response)=>{
    //Récupérer le rôle de l'utilisateur à partir du token
    console.log(req.headers);
    const authRole = req.headers;
    const userRole = "";
    //Si aucun rôle n'est spécifié pour la ressource
        //Passer à l'étape suivante (laisser l'accès)
    if(!authRole){
    
    }
    //Sinon
    else{
        //Vérifier si l'utilisateur possède au moins l'un des rôles spécifiés pour la ressource
        //Si l'utilisateur possède l'un des rôles spécifiés
        //if(){
        //}
        //Passer à l'étape suivante (laisser l'accès)
        //else{
            //Afficher une réponse 403 "Accès refusé"
        //}
    }
}

    


    

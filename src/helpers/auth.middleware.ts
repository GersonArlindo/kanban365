import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || "ik+-d8a3e*nio47=%n@#pbe-pr9x!5ths269g4++##3v-*oejb"; // Asegúrate de configurar esta variable de entorno

//*El CustomRequest lo que hara es que me estara devolviendo estas 3 propiedades en base al Jwt
export interface CustomRequest extends Request {
    id?: number;
    tenant_id?: string;
    created_by?: string;
}

export const authenticateJWT = (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
    
            jwt.verify(token, secretKey, (err, decodedToken) => {
                if (err) {
                    return res.sendStatus(403); 
                }
                const user = decodedToken as { id: number, tenant_id: string, created_by: string };
                req.id = user.id
                req.tenant_id = user.tenant_id;
                req.created_by = user.created_by;
                next();
            });
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        res.sendStatus(401);
    }
};

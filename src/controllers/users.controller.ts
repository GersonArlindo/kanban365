import { Application, Request, Response } from "express";
import { authenticateJWT } from "../helpers/auth.middleware"; // Importa el middleware
import Users from "../models/users"
var bcrypt = require('bcryptjs');


export const usersFunction = (app: Application): void => {
const salt = bcrypt.genSaltSync();
// Ruta POST de ejemplo
app.post("/user/add", authenticateJWT, async (req: Request, res: Response) => {
    // Asumimos que el cuerpo de la solicitud contiene un objeto JSON con los datos del nuevo tablero
    const { first_name, last_name, user_image, email, phone_number, rol_id, status, password, created_by, tenant_id } = req.body;
    try {
        const Newpassword = bcrypt.hashSync(password, salt);
        const newUser: any = await Users.create({ first_name, last_name, username: `${first_name} ${last_name}`, user_image, email, phone_number, rol_id, status, password: Newpassword, created_by, tenant_id });
        return res.status(201).json({
            user: newUser,
            msj: "Created"
        });
    } catch (error) {
        console.error("Error creating new user: ", error);
        return res.status(500).send("Internal Server Error");
    }
});
};

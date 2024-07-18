import { Application, Request, Response } from "express";
import { authenticateJWT, CustomRequest } from "../helpers/auth.middleware"; // Importa el middleware
import Users from "../models/users"
import { triggerWorkflows } from "./getAssociatedTriggers";
var bcrypt = require('bcryptjs');

export const usersFunction = (app: Application): void => {
const salt = bcrypt.genSaltSync();
    // Ruta POST de ejemplo
    app.post("/user/add", authenticateJWT, async (req: CustomRequest, res: Response) => {
        // Asumimos que el cuerpo de la solicitud contiene un objeto JSON con los datos del nuevo tablero
        const { first_name, last_name, user_image, email, phone_number, rol_id, status, password, created_by, tenant_id } = req.body;
        try {
            const Newpassword = bcrypt.hashSync(password, salt);
            const newUser: any = await Users.create({ first_name, last_name, username: `${first_name} ${last_name}`, user_image, email, phone_number, rol_id, status, password: Newpassword, created_by, tenant_id });
            const workflowExecution = await triggerWorkflows(9, tenant_id,  newUser);
            return res.status(201).json({
                user: newUser,
                msj: "Created"
            });
        } catch (error) {
            console.error("Error creating new user: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    app.put("/user/update/:id", authenticateJWT, async (req: Request, res: Response) => {
        const userId = req.params.id;
        const { first_name, last_name, email, phone_number, rol_id, status, password } = req.body;
    
        try {
            const user: any = await Users.findByPk(userId); // Buscar usuario por ID
            if (user) {
                // Actualizar solo los campos proporcionados en el cuerpo de la solicitud
                user.first_name = first_name ?? user.first_name;
                user.last_name = last_name ?? user.last_name;
                user.username = `${first_name ?? user.first_name} ${last_name ?? user.last_name}`;
                user.email = email ?? user.email;
                user.phone_number = phone_number ?? user.phone_number;
                user.rol_id = rol_id ?? user.rol_id;
                user.status = status ?? user.status;
    
                // Si se proporciona una nueva contraseña, hashéala
                if (password) {
                    user.password = bcrypt.hashSync(password, salt);
                }
    
                await user.save(); // Guardar los cambios
                return res.status(200).json({
                    user,
                    msj: "User updated"
                });
            } else {
                return res.status(404).json({
                    msj: "User not found"
                });
            }
        } catch (error) {
            console.error("Error updating user: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    // Ruta para desactivar un usuario
    app.put("/user/deactivate/:id",authenticateJWT, async (req: Request, res: Response) => {
        const userId = req.params.id;
        try {
            const user: any = await Users.findByPk(userId); // Buscar usuario por ID
            if (user) {
                user.status = 0; // Cambiar el status del usuario a 0 (desactivado)
                await user.save(); // Guardar los cambios
                return res.status(200).json({
                    user,
                    msj: "User deactivated"
                });
            } else {
                return res.status(404).json({
                    msj: "User not found"
                });
            }
        } catch (error) {
            console.error("Error deactivating user: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    // Ruta para desactivar un usuario
    app.put("/user/activate/:id", authenticateJWT, async (req: Request, res: Response) => {
        const userId = req.params.id;
        try {
            const user: any = await Users.findByPk(userId); // Buscar usuario por ID
            if (user) {
                user.status = 1; // Cambiar el status del usuario a 0 (desactivado)
                await user.save(); // Guardar los cambios
                return res.status(200).json({
                    user,
                    msj: "User activated"
                });
            } else {
                return res.status(404).json({
                    msj: "User not found"
                });
            }
        } catch (error) {
            console.error("Error deactivating user: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    // Ruta GET para traer todos los usuarios
    app.get("/users", authenticateJWT, async (req: CustomRequest, res: Response) => {
        const { tenant_id } = req;
        try {
            const existingUser = await Users.findAll({ where: { tenant_id } });
            if (existingUser) {
                return res.status(200).json({ users: existingUser });
            } else {
                return res.status(200).json({ exists: false });
            }
        } catch (error) {
            console.error("Error checking email existence: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    // Ruta GET para verificar si un email existe
    app.get("/user/check-email/:email", authenticateJWT, async (req: Request, res: Response) => {
        const email = req.params.email; // Obtener el parámetro 'email' de la consulta
        try {
            const existingUser = await Users.findOne({ where: { email: email } });
            if (existingUser) {
                return res.status(200).json({ exists: true, user: existingUser });
            } else {
                return res.status(200).json({ exists: false });
            }
        } catch (error) {
            console.error("Error checking email existence: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });
};

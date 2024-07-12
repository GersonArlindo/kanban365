import { Application, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Users  from "../models/users"
import Roles from "../models/roles"
var bcrypt = require('bcryptjs');


Users.belongsTo(Roles, { foreignKey: "rol_id" });
Roles.hasMany(Users, { foreignKey: "rol_id" });


const secretKey = process.env.JWT_SECRET || "ik+-d8a3e*nio47=%n@#pbe-pr9x!5ths269g4++##3v-*oejb";

export const AuthFunctions = (app: Application): void => {
    app.post('/login', async (req: Request, res: Response) => {
        const salt = bcrypt.genSaltSync();
        // En una aplicación real, verifica las credenciales del usuario en la base de datos
        const { email, password } = req.body;

        const usuario: any = await Users.findOne({ where: { email: email },
            include: [
                {
                  model: Roles,
                  attributes: [
                    "id",
                    "rol_name",
                    "rol_description"
                  ],
                }
            ]
         });
        if (!usuario) {
            return res.status(400).json({
                msg: "Email incorrecto"
            });
        }

        const validpassword = bcrypt.compareSync(password, usuario.password);
        if (!validpassword) {
            return res.status(400).json({
                msg: "Password incorrecto"
            });
        }

        if (usuario) {
            const token = jwt.sign({ 
                id: usuario.dataValues.id,
                first_name: usuario.dataValues.first_name,
                last_name: usuario.dataValues.last_name,
                username: usuario.dataValues.username,
                user_image: usuario.dataValues.user_image,
                email: usuario.dataValues.email,
                phone_number: usuario.dataValues.phone_number,
                rol_id: usuario.dataValues.rol_id,
                rol_name: usuario.tbl_role.dataValues.rol_name,
                status: usuario.dataValues.status,
                created_by: usuario.dataValues.first_name + ' ' + usuario.dataValues.last_name,
                tenant_id: usuario.dataValues.tenant_id
             }, secretKey, { expiresIn: '24h' });
            res.json({ token });
        } else {
            res.sendStatus(500);
        }
    });
};
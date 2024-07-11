import { Application, Request, Response } from "express";
import { authenticateJWT, CustomRequest } from "../helpers/auth.middleware"; // Importa el middleware
import GHLApiKey from "../models/ghlApiKey"


export const ghlApiKeyFunction = (app: Application): void => {
    // Ruta POST de ejemplo
    app.post("/ghlApiKey/add", authenticateJWT, async (req: CustomRequest, res: Response) => {
        const {id, tenant_id} = req;
        // Asumimos que el cuerpo de la solicitud contiene un objeto JSON con los datos del nuevo Apikey
        const { name, api_key, location_id, created_by } = req.body;
        try {
            const existingApiKey= await GHLApiKey.findAll({ where: { tenant_id } });
            if (existingApiKey) {
                for (let index = 0; index < existingApiKey.length; index++) {
                    const element = existingApiKey[index];
                    element.update({ status: 0 });  
                }
            }
            const newApiKey: any = await GHLApiKey.create({ name, api_key, location_id, status: 1, created_by, tenant_id });
            return res.status(201).json({
                apiKey: newApiKey,
                msj: "Created"
            });
        } catch (error) {
            console.error("Error creating new user: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    app.put("/ghlApiKey/edit/:apiKeyId", authenticateJWT, async (req: CustomRequest, res: Response) => {
        const apiKeyId = req.params.apiKeyId;
        // Asumimos que el cuerpo de la solicitud contiene un objeto JSON con los datos del apiKey
        const { name, api_key, location_id } = req.body;
        try {
            // Buscar el apiKey existente
            const apiKey: any = await GHLApiKey.findByPk(apiKeyId);
            if (!apiKey) {
                return res.status(404).send("ApiKey not found");
            }
            // Actualizamos
            apiKey.name = name;
            apiKey.api_key = api_key;
            apiKey.location_id = location_id;
            await apiKey.save();
            return res.status(200).json({
                apiKey: apiKey,
                msj: "Updated"
            });
        } catch (error) {
            console.error("Error creating new user: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    //Ruta GET para traer todas las ApiKey
    app.get("/ghlApiKey", authenticateJWT, async (req: CustomRequest, res: Response) => {
        const { tenant_id } = req;
        try {
            const existingApiKey = await GHLApiKey.findAll({ where: { tenant_id } });
            if (existingApiKey) {
                return res.status(200).json({ ghlApiKey: existingApiKey });
            } else {
                return res.status(200).json({ ghlApiKey: [] });
            }
        } catch (error) {
            console.error("Error checking email existence: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    // // Ruta GET para verificar si un email existe
    // app.get("/user/check-email/:email", authenticateJWT, async (req: Request, res: Response) => {
    //     const email = req.params.email; // Obtener el parámetro 'email' de la consulta
    //     try {
    //         const existingUser = await Users.findOne({ where: { email: email } });
    //         if (existingUser) {
    //             return res.status(200).json({ exists: true, user: existingUser });
    //         } else {
    //             return res.status(200).json({ exists: false });
    //         }
    //     } catch (error) {
    //         console.error("Error checking email existence: ", error);
    //         return res.status(500).send("Internal Server Error");
    //     }
    // });
};

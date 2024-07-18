import { Application, Request, Response } from "express";
import { authenticateJWT, CustomRequest } from "../helpers/auth.middleware"; // Importa el middleware
import Users from "../models/users"
import {TriggerFunctions, AssociatedTriggerFunctions} from '../models/triggerFunctions'

AssociatedTriggerFunctions.belongsTo(TriggerFunctions, { foreignKey: "trigger_id" });
TriggerFunctions.hasMany(AssociatedTriggerFunctions, { foreignKey: "trigger_id" });

export const triggersFunction = (app: Application): void => {
    //*FUNCIONES PARA LOS TRIGGERS DEL SISTEMA
    // Ruta POST de ejemplo
    app.post("/trigger/add", authenticateJWT, async (req: Request, res: Response) => {
        // Asumimos que el cuerpo de la solicitud contiene un objeto JSON con los datos del nuevo trigger
        const { name, description, created_by } = req.body;
        try {
            const newTrigger: any = await TriggerFunctions.create({ name, description,created_by });
            return res.status(201).json({
                user: newTrigger,
                msj: "Created"
            });
        } catch (error) {
            console.error("Error creating new user: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    app.put("/trigger/update/:id", authenticateJWT, async (req: Request, res: Response) => {
        const triggerId = req.params.id;
        const { name, description } = req.body;
    
        try {
            const trigger: any = await TriggerFunctions.findByPk(triggerId); // Buscar trigger por ID
            if (trigger) {
                // Actualizar solo los campos proporcionados en el cuerpo de la solicitud
                trigger.name = name ?? trigger.name;
                trigger.description = description ?? trigger.description;
    
                await trigger.save(); // Guardar los cambios
                return res.status(200).json({
                    trigger,
                    msj: "Trigger updated"
                });
            } else {
                return res.status(404).json({
                    msj: "Trigger not found"
                });
            }
        } catch (error) {
            console.error("Error updating user: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    // Ruta GET para traer todos los triggers
    app.get("/triggers", authenticateJWT, async (req: Request, res: Response) => {
        try {
            const existingTriggers = await TriggerFunctions.findAll();
            if (existingTriggers) {
                return res.status(200).json({ triggers: existingTriggers });
            } else {
                return res.status(200).json({ exists: false });
            }
        } catch (error) {
            return res.status(500).send("Internal Server Error");
        }
    });

    //*FUNCIONES PARA LAS VINCULACIONES DE LOS TRIGGERS
    app.post("/associatedTrigger/add", authenticateJWT, async (req: CustomRequest, res: Response) => {
        // Asumimos que el cuerpo de la solicitud contiene un objeto JSON con los datos del nuevo trigger
        const { trigger_id, trigger_link, status } = req.body;
        const {id, tenant_id, created_by } = req;

        if (!tenant_id || !created_by) {
            return res.sendStatus(403); // Debería ser imposible llegar aquí si el middleware funciona correctamente
        }
        try {
            const newAssociatedTrigger: any = await AssociatedTriggerFunctions.create({ trigger_id, trigger_link, status, created_by, tenant_id });
            return res.status(201).json({
                user: newAssociatedTrigger,
                msj: "Created"
            });
        } catch (error) {
            return res.status(500).send("Internal Server Error");
        }
    });

    app.get("/associatedTrigger", authenticateJWT, async (req: CustomRequest, res: Response) => {
        const {id, tenant_id, created_by } = req;
        try {
            const existingAssociatedTriggers = await AssociatedTriggerFunctions.findAll({ where: { tenant_id: tenant_id }});
            if (existingAssociatedTriggers) {
                return res.status(200).json({ triggers: existingAssociatedTriggers });
            } else {
                return res.status(200).json({ exists: false });
            }
        } catch (error) {
            return res.status(500).send("Internal Server Error");
        }
    });

    //*Esta funcion nos servira para poder traer los workflows asociados mediante el  id del trigger que vienen en un array
    app.post("/associatedTriggers", authenticateJWT, async (req: CustomRequest, res: Response) => {
        const triggerIds: string[] = req.body.ids;
        const {id, tenant_id, created_by } = req;
        if (!Array.isArray(triggerIds)) {
            return res.status(400).send("Bad Request: 'ids' should be an array");
        }
    
        try {
            const results = [];
            for (const triggerId of triggerIds) {
                const associatedTriggers: any = await AssociatedTriggerFunctions.findAll({
                    where: { 
                        trigger_id: triggerId,
                        tenant_id: tenant_id
                     },
                    include: [
                        {
                            model: TriggerFunctions,
                            attributes: ["id", "name", "description"],
                        },
                    ],
                });

                if (associatedTriggers.length > 0) {
                    for (const trigger of associatedTriggers) {
                        results.push({
                            trigger_id: triggerId,
                            name: trigger.tbl_trigger_function.dataValues.name,
                            id: trigger.id,
                            trigger_link: trigger.trigger_link,
                            status: trigger.status,
                            date_created: trigger.date_created,
                            created_by: trigger.created_by,
                            tenant_id: trigger.tenant_id,
                            trigger_function: trigger.TriggerFunction, // Esto incluirá el objeto con id, name y description
                        });
                    }
                } else {
                    results.push({
                        trigger_id: triggerId,
                        exists: false,
                    });
                }
            }

            return res.status(200).json(results);
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    });

    app.delete("/associatedTriggers/delete/:id", authenticateJWT, async (req, res) => {
        const id = req.params.id; // Obtiene el ID del registro a eliminar
    
        try {
            // Busca el registro asociado por su ID
            const associatedTrigger = await AssociatedTriggerFunctions.findByPk(id);
            
            if (!associatedTrigger) {
                return res.status(404).send("Not Found");
            }
    
            // Elimina el registro asociado
            await associatedTrigger.destroy();
    
            // Devuelve una respuesta exitosa
            return res.status(200).json({
                user: associatedTrigger,
                msj: "Deleted"
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send("Error interno del servidor");
        }
    });
    
};

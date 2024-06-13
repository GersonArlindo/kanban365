import { Application, Request, Response } from "express";
import CoursesData from "../../data/courses.json";
import { authenticateJWT } from "../helpers/auth.middleware"; // Importa el middleware


export const loadApiEndpoints = (app: Application): void => {

	app.get("/data", authenticateJWT, async (req: Request, res: Response) => {
		return res.status(200).send(CoursesData);
	});

	app.get("/", (req: Request, res: Response) => {
		return res.status(200).send("Bienvenido a Kanban365 Backend");
	});
};

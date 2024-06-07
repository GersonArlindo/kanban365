import { Application, Request, Response } from "express";
import CoursesData from "../../data/courses.json";


export const loadApiEndpoints = (app: Application): void => {

	app.get("/data", (req: Request, res: Response) => {
		return res.status(200).send(CoursesData);
	});

	app.get("/", (req: Request, res: Response) => {
		return res.status(200).send("Bienvenido a Kanban365 Backend");
	});
};

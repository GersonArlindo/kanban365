import express from "express";
import path from "path";
import dotenv from "dotenv"; // Importa la librería dotenv
import { loadApiEndpoints } from "./controllers/api";
import { BoardsFunctions } from "./controllers/boards.controller"
const cors = require('cors');



// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Create Express server
const app = express();
app.use(cors({
    origin: 'https://kanban365.ez-marketing-us.com', // Cambia esto por el dominio de tu frontend
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
  }));

// Express configuration
app.set("port", process.env.PORT ?? 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public"), { maxAge: 31557600000 }));

loadApiEndpoints(app);
BoardsFunctions(app)


export default app;

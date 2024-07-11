import express from "express";
import path from "path";
import dotenv from "dotenv"; // Importa la librería dotenv
import { loadApiEndpoints } from "./controllers/api";
import { BoardsFunctions } from "./controllers/boards.controller"
import { AuthFunctions } from "./controllers/auth.controller";
import { usersFunction } from "./controllers/users.controller"
import { ghlApiKeyFunction } from './controllers/ghlApiKey.controller'

const cors = require('cors');
var fs = require('fs')
var https = require('https')



// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Create Express server
const app = express();

https.createServer({
    cert: fs.readFileSync(path.join(__dirname, 'server.crt')),
    key: fs.readFileSync(path.join(__dirname, 'server.key'))
}, app)

app.use(cors())

// Express configuration
app.set("port", process.env.PORT ?? 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public"), { maxAge: 31557600000 }));

loadApiEndpoints(app);
BoardsFunctions(app);
AuthFunctions(app); 
usersFunction(app);
ghlApiKeyFunction(app);



export default app;

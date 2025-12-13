import express, { Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";
import { ValidJson } from "./middlewares/validJSON.middleware"
import { metricsMiddleware } from "./middlewares/metrics.middleware";
import { register } from "./metrics/prometheus";


const app = express();

const pathRutas = path.join(__dirname, "routes");

const corsOptions = {
  origin: process.env.HOSTSERVER,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-token",
    "x-api-key",
    "x-id-cliente",
    "timezone",
  ],
  exposedHeaders: ["x-token"],
};

/* =========================
   MIDDLEWARES BASE
========================= */

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(fileUpload({ limits: { fileSize: 100 * 1024 * 1024 } }));
app.use(metricsMiddleware);
app.use(ValidJson.valid);

/* =========================
   HEADERS
========================= */

app.use((req: any, res: Response, next: NextFunction) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin , X-Requested-With , Content-Type , Accept , Access-Control-Allow-Request-Method"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT , DELETE"
  );
  res.setHeader("Allow", "GET, POST, OPTIONS, PUT , DELETE");
  next();
});

/* =========================
   ENDPOINT MÉTRICAS
========================= */
app.get("/api/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

/* =========================
   RUTAS
========================= */

const cargarRutas = (rutaBase: string, urlBase: string) => {
  if (!fs.existsSync(rutaBase)) return;

  fs.readdirSync(rutaBase)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
    .forEach((file) => {
      const rutaImportada = require(path.join(rutaBase, file));
      const router = rutaImportada.default || rutaImportada;
      app.use(urlBase, router);
    });
};

cargarRutas(pathRutas, "/api");

/* =========================
   404
========================= */
app.use((req: any, res: Response) => {
  res.status(404).json({
    status: false,
    msg: "ENDPOINT NO EXISTENTE",
  });
});

export default app;
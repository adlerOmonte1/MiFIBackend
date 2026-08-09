import cors from "cors";
import express from "express";
import helmet from "helmet";
import { crearApiRouter } from "./composicion/contenedor";
import { manejadorErrores } from "./presentacion/middleware/manejadorErrores";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", crearApiRouter());

  // Siempre al final: es lo que hace que Express lo reconozca como
  // middleware de manejo de errores (firma de 4 argumentos).
  app.use(manejadorErrores);

  return app;
}

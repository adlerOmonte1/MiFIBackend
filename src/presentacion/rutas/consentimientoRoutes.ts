import { Router, type RequestHandler } from "express";
import type { ConsentimientoController } from "../controllers/ConsentimientoController";

/** Monta en /api/consentimiento (docs/openapi.yaml). */
export function crearConsentimientoRoutes(
  controller: ConsentimientoController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.post("/", authMiddleware, controller.aceptar);

  return router;
}

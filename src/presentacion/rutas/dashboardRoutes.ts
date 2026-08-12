import { Router, type RequestHandler } from "express";
import type { DashboardController } from "../controllers/DashboardController";

/** Monta en /api/dashboard (docs/openapi.yaml). Funcionalidad financiera: RF-49. */
export function crearDashboardRoutes(
  controller: DashboardController,
  authMiddleware: RequestHandler,
  consentimientoMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.get("/resumen", authMiddleware, consentimientoMiddleware, controller.resumen);

  return router;
}

import { Router, type RequestHandler } from "express";
import type { MetaAhorroController } from "../controllers/MetaAhorroController";

/**
 * Monta en /api/metas-ahorro (docs/openapi.yaml). Todas las rutas llevan
 * authMiddleware + consentimientoMiddleware (RF-49, RF-51) — funcionalidad
 * financiera de punta a punta, mismo criterio que /transacciones.
 */
export function crearMetaAhorroRoutes(
  controller: MetaAhorroController,
  authMiddleware: RequestHandler,
  consentimientoMiddleware: RequestHandler,
): Router {
  const router = Router();
  router.use(authMiddleware, consentimientoMiddleware);

  router.post("/", controller.crear);
  router.get("/", controller.listar);
  router.get("/:id", controller.obtener);
  router.delete("/:id", controller.eliminar);

  return router;
}

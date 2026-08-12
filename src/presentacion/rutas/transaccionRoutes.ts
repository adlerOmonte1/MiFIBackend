import { Router, type RequestHandler } from "express";
import type { TransaccionController } from "../controllers/TransaccionController";

/**
 * Monta en /api/transacciones (docs/openapi.yaml). Todas las rutas llevan
 * authMiddleware + consentimientoMiddleware (RF-49, RF-51): son
 * funcionalidades financieras de punta a punta, no solo la creación.
 */
export function crearTransaccionRoutes(
  controller: TransaccionController,
  authMiddleware: RequestHandler,
  consentimientoMiddleware: RequestHandler,
): Router {
  const router = Router();
  router.use(authMiddleware, consentimientoMiddleware);

  router.post("/", controller.crear);
  router.get("/", controller.listar);
  router.get("/:id", controller.obtener);
  router.put("/:id", controller.editar);
  router.delete("/:id", controller.eliminar);

  return router;
}

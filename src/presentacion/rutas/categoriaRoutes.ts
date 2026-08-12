import { Router, type RequestHandler } from "express";
import type { CategoriaController } from "../controllers/CategoriaController";

/**
 * Monta en /api/categorias (docs/openapi.yaml). Solo GET por ahora: crear/
 * renombrar/eliminar categoría propia son RF-53/RF-54, Sprint 3.
 */
export function crearCategoriaRoutes(
  controller: CategoriaController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.get("/", authMiddleware, controller.listar);

  return router;
}

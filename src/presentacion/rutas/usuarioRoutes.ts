import { Router, type RequestHandler } from "express";
import type { AuthController } from "../controllers/AuthController";

/** Monta en /api/usuarios (docs/openapi.yaml). */
export function crearUsuarioRoutes(
  controller: AuthController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.get("/me", authMiddleware, controller.me);

  return router;
}

import { Router, type RequestHandler } from "express";
import type { AuthController } from "../controllers/AuthController";

/** Monta en /api/auth (docs/openapi.yaml). */
export function crearAuthRoutes(
  controller: AuthController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.post("/registro", controller.registro);
  router.post("/login", controller.login);
  router.post("/logout", authMiddleware, controller.logout);

  return router;
}

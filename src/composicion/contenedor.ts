import { Router } from "express";
import { AceptarConsentimientoUseCase } from "../aplicacion/casos-uso/AceptarConsentimientoUseCase";
import { CerrarSesionUseCase } from "../aplicacion/casos-uso/CerrarSesionUseCase";
import { IniciarSesionUseCase } from "../aplicacion/casos-uso/IniciarSesionUseCase";
import { ObtenerPerfilUseCase } from "../aplicacion/casos-uso/ObtenerPerfilUseCase";
import { RegistrarUsuarioUseCase } from "../aplicacion/casos-uso/RegistrarUsuarioUseCase";
import { PrismaSesionRepository } from "../infraestructura/repositorios/PrismaSesionRepository";
import { PrismaUsuarioRepository } from "../infraestructura/repositorios/PrismaUsuarioRepository";
import { BcryptHashService } from "../infraestructura/servicios/BcryptHashService";
import { JwtTokenService } from "../infraestructura/servicios/JwtTokenService";
import { AuthController } from "../presentacion/controllers/AuthController";
import { ConsentimientoController } from "../presentacion/controllers/ConsentimientoController";
import { crearAuthMiddleware } from "../presentacion/middleware/authMiddleware";
import { crearAuthRoutes } from "../presentacion/rutas/authRoutes";
import { crearConsentimientoRoutes } from "../presentacion/rutas/consentimientoRoutes";
import { crearUsuarioRoutes } from "../presentacion/rutas/usuarioRoutes";

function resolverJwtSecret(): string {
  const secreto = process.env["JWT_SECRET"];
  if (secreto) return secreto;

  // Jest fija NODE_ENV=test automáticamente; en cualquier otro entorno
  // (dev/producción) un JWT_SECRET ausente es un error de configuración,
  // no algo que deba tener un valor por defecto silencioso.
  if (process.env["NODE_ENV"] === "test") return "secreto-de-pruebas-no-usar-en-produccion";

  throw new Error("JWT_SECRET no está definido. Configura tu .env (ver .env.example).");
}

/**
 * Composición manual de dependencias (composition root). Es el único
 * archivo del proyecto que conoce tanto el dominio como la infraestructura
 * concreta a la vez — por diseño: el resto de capas depende de interfaces
 * (ver skill mifi-arquitectura-solid, principio de Inversión de Dependencias).
 */
export function crearApiRouter(): Router {
  // Infraestructura
  const usuarioRepository = new PrismaUsuarioRepository();
  const sesionRepository = new PrismaSesionRepository();
  const hashService = new BcryptHashService();
  const tokenService = new JwtTokenService(resolverJwtSecret());

  // Casos de uso
  const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(
    usuarioRepository,
    sesionRepository,
    hashService,
    tokenService,
  );
  const iniciarSesionUseCase = new IniciarSesionUseCase(
    usuarioRepository,
    sesionRepository,
    hashService,
    tokenService,
  );
  const cerrarSesionUseCase = new CerrarSesionUseCase(sesionRepository);
  const obtenerPerfilUseCase = new ObtenerPerfilUseCase(usuarioRepository);
  const aceptarConsentimientoUseCase = new AceptarConsentimientoUseCase(usuarioRepository);

  // Presentación
  const authMiddleware = crearAuthMiddleware({ tokenService, sesionRepository, usuarioRepository });
  const authController = new AuthController(
    registrarUsuarioUseCase,
    iniciarSesionUseCase,
    cerrarSesionUseCase,
    obtenerPerfilUseCase,
  );
  const consentimientoController = new ConsentimientoController(aceptarConsentimientoUseCase);

  const apiRouter = Router();
  apiRouter.use("/auth", crearAuthRoutes(authController, authMiddleware));
  apiRouter.use("/usuarios", crearUsuarioRoutes(authController, authMiddleware));
  apiRouter.use(
    "/consentimiento",
    crearConsentimientoRoutes(consentimientoController, authMiddleware),
  );

  return apiRouter;
}

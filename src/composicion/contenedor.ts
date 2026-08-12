import { Router } from "express";
import { AceptarConsentimientoUseCase } from "../aplicacion/casos-uso/AceptarConsentimientoUseCase";
import { CerrarSesionUseCase } from "../aplicacion/casos-uso/CerrarSesionUseCase";
import { EditarTransaccionUseCase } from "../aplicacion/casos-uso/EditarTransaccionUseCase";
import { EliminarTransaccionUseCase } from "../aplicacion/casos-uso/EliminarTransaccionUseCase";
import { IniciarSesionUseCase } from "../aplicacion/casos-uso/IniciarSesionUseCase";
import { ListarCategoriasUseCase } from "../aplicacion/casos-uso/ListarCategoriasUseCase";
import { ListarTransaccionesUseCase } from "../aplicacion/casos-uso/ListarTransaccionesUseCase";
import { ObtenerPerfilUseCase } from "../aplicacion/casos-uso/ObtenerPerfilUseCase";
import { ObtenerResumenDashboardUseCase } from "../aplicacion/casos-uso/ObtenerResumenDashboardUseCase";
import { ObtenerTransaccionUseCase } from "../aplicacion/casos-uso/ObtenerTransaccionUseCase";
import { RegistrarTransaccionUseCase } from "../aplicacion/casos-uso/RegistrarTransaccionUseCase";
import { RegistrarUsuarioUseCase } from "../aplicacion/casos-uso/RegistrarUsuarioUseCase";
import { PrismaCategoriaRepository } from "../infraestructura/repositorios/PrismaCategoriaRepository";
import { PrismaSesionRepository } from "../infraestructura/repositorios/PrismaSesionRepository";
import { PrismaTransaccionRepository } from "../infraestructura/repositorios/PrismaTransaccionRepository";
import { PrismaUsuarioRepository } from "../infraestructura/repositorios/PrismaUsuarioRepository";
import { BcryptHashService } from "../infraestructura/servicios/BcryptHashService";
import { JwtTokenService } from "../infraestructura/servicios/JwtTokenService";
import { AuthController } from "../presentacion/controllers/AuthController";
import { CategoriaController } from "../presentacion/controllers/CategoriaController";
import { ConsentimientoController } from "../presentacion/controllers/ConsentimientoController";
import { DashboardController } from "../presentacion/controllers/DashboardController";
import { TransaccionController } from "../presentacion/controllers/TransaccionController";
import { crearAuthMiddleware } from "../presentacion/middleware/authMiddleware";
import { crearConsentimientoMiddleware } from "../presentacion/middleware/consentimientoMiddleware";
import { crearAuthRoutes } from "../presentacion/rutas/authRoutes";
import { crearCategoriaRoutes } from "../presentacion/rutas/categoriaRoutes";
import { crearConsentimientoRoutes } from "../presentacion/rutas/consentimientoRoutes";
import { crearDashboardRoutes } from "../presentacion/rutas/dashboardRoutes";
import { crearTransaccionRoutes } from "../presentacion/rutas/transaccionRoutes";
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

/** RF-38, D-08 — nunca hardcodeado, para que sea ajustable en la calibración. */
function resolverUmbralGastoHormiga(): number {
  const valor = Number(process.env["UMBRAL_GASTO_HORMIGA"]);
  if (Number.isFinite(valor) && valor > 0) return valor;

  if (process.env["NODE_ENV"] === "test") return 15;

  throw new Error(
    "UMBRAL_GASTO_HORMIGA no está definido o no es un número válido. Configura tu .env (ver .env.example).",
  );
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
  const transaccionRepository = new PrismaTransaccionRepository();
  const categoriaRepository = new PrismaCategoriaRepository();
  const hashService = new BcryptHashService();
  const tokenService = new JwtTokenService(resolverJwtSecret());
  const umbralGastoHormiga = resolverUmbralGastoHormiga();

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
  const registrarTransaccionUseCase = new RegistrarTransaccionUseCase(
    transaccionRepository,
    categoriaRepository,
    umbralGastoHormiga,
  );
  const listarTransaccionesUseCase = new ListarTransaccionesUseCase(transaccionRepository);
  const obtenerTransaccionUseCase = new ObtenerTransaccionUseCase(transaccionRepository);
  const editarTransaccionUseCase = new EditarTransaccionUseCase(
    transaccionRepository,
    categoriaRepository,
    umbralGastoHormiga,
  );
  const eliminarTransaccionUseCase = new EliminarTransaccionUseCase(transaccionRepository);
  const listarCategoriasUseCase = new ListarCategoriasUseCase(categoriaRepository);
  const obtenerResumenDashboardUseCase = new ObtenerResumenDashboardUseCase(
    transaccionRepository,
    categoriaRepository,
  );

  // Presentación
  const authMiddleware = crearAuthMiddleware({ tokenService, sesionRepository, usuarioRepository });
  const consentimientoMiddleware = crearConsentimientoMiddleware({ usuarioRepository });
  const authController = new AuthController(
    registrarUsuarioUseCase,
    iniciarSesionUseCase,
    cerrarSesionUseCase,
    obtenerPerfilUseCase,
  );
  const consentimientoController = new ConsentimientoController(aceptarConsentimientoUseCase);
  const transaccionController = new TransaccionController(
    registrarTransaccionUseCase,
    listarTransaccionesUseCase,
    obtenerTransaccionUseCase,
    editarTransaccionUseCase,
    eliminarTransaccionUseCase,
  );
  const categoriaController = new CategoriaController(listarCategoriasUseCase);
  const dashboardController = new DashboardController(obtenerResumenDashboardUseCase);

  const apiRouter = Router();
  apiRouter.use("/auth", crearAuthRoutes(authController, authMiddleware));
  apiRouter.use("/usuarios", crearUsuarioRoutes(authController, authMiddleware));
  apiRouter.use(
    "/consentimiento",
    crearConsentimientoRoutes(consentimientoController, authMiddleware),
  );
  apiRouter.use(
    "/transacciones",
    crearTransaccionRoutes(transaccionController, authMiddleware, consentimientoMiddleware),
  );
  apiRouter.use("/categorias", crearCategoriaRoutes(categoriaController, authMiddleware));
  apiRouter.use(
    "/dashboard",
    crearDashboardRoutes(dashboardController, authMiddleware, consentimientoMiddleware),
  );

  return apiRouter;
}

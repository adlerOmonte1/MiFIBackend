import type { NextFunction, Request, RequestHandler, Response } from "express";
import { NoAutenticadoError } from "../../aplicacion/errores/ErroresAplicacion";
import type { ISesionRepository } from "../../dominio/repositorios/ISesionRepository";
import type { IUsuarioRepository } from "../../dominio/repositorios/IUsuarioRepository";
import type { ITokenService } from "../../dominio/servicios/ITokenService";

export interface DependenciasAuthMiddleware {
  tokenService: ITokenService;
  sesionRepository: ISesionRepository;
  usuarioRepository: IUsuarioRepository;
}

/**
 * RF-51 — valida el JWT y el estado de la sesión (no revocada, no expirada)
 * en cada petición a un endpoint protegido, antes de ejecutar el caso de uso.
 * Los `throw` se propagan solos a manejadorErrores: Express 5 reenvía
 * automáticamente las excepciones de un handler async a next(err).
 */
export function crearAuthMiddleware({
  tokenService,
  sesionRepository,
  usuarioRepository,
}: DependenciasAuthMiddleware): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const encabezado = req.headers.authorization;
    if (!encabezado?.startsWith("Bearer ")) {
      throw new NoAutenticadoError();
    }

    const token = encabezado.slice("Bearer ".length);
    const payload = tokenService.verificar(token);
    if (!payload) {
      throw new NoAutenticadoError();
    }

    const sesion = await sesionRepository.buscarPorJti(payload.jti);
    if (!sesion || !sesion.esValida()) {
      throw new NoAutenticadoError();
    }

    const usuario = await usuarioRepository.buscarPorId(payload.usuarioId);
    if (!usuario) {
      throw new NoAutenticadoError();
    }

    req.usuarioId = usuario.id;
    req.jti = payload.jti;
    next();
  };
}

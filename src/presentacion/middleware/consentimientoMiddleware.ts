import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ConsentimientoRequeridoError } from "../../aplicacion/errores/ErroresAplicacion";
import type { IUsuarioRepository } from "../../dominio/repositorios/IUsuarioRepository";

export interface DependenciasConsentimientoMiddleware {
  usuarioRepository: IUsuarioRepository;
}

/**
 * RF-49, CON-01 — bloquea las funcionalidades financieras mientras el
 * estudiante no haya aceptado el consentimiento informado.
 *
 * Se monta SIEMPRE después de authMiddleware: depende de que `req.usuarioId`
 * ya venga validado del token (RF-51), nunca del cliente (RF-50, D-05).
 *
 * Consulta el usuario por su cuenta en vez de recibirlo de authMiddleware,
 * para que ambos middlewares sigan siendo independientes y testeables por
 * separado. El costo es una búsqueda extra por clave primaria, despreciable
 * frente al acoplamiento que evita.
 */
export function crearConsentimientoMiddleware({
  usuarioRepository,
}: DependenciasConsentimientoMiddleware): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const usuario = await usuarioRepository.buscarPorId(req.usuarioId as string);

    // Si el usuario desapareció entre un middleware y otro, se trata igual
    // que "sin consentimiento": nunca se deja pasar por defecto.
    if (!usuario?.haAceptadoConsentimiento()) {
      throw new ConsentimientoRequeridoError();
    }

    next();
  };
}

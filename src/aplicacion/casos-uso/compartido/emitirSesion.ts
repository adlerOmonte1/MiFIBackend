import { randomUUID } from "node:crypto";
import type { Usuario } from "../../../dominio/entidades/Usuario";
import type { ISesionRepository } from "../../../dominio/repositorios/ISesionRepository";
import type { ITokenService } from "../../../dominio/servicios/ITokenService";

export const DURACION_SESION_MS = 7 * 24 * 60 * 60 * 1000;

export interface DependenciasEmitirSesion {
  sesionRepository: ISesionRepository;
  tokenService: ITokenService;
}


export async function emitirSesion(
  usuario: Usuario,
  { sesionRepository, tokenService }: DependenciasEmitirSesion,
): Promise<string> {
  const jti = randomUUID();
  const fechaExpiracion = new Date(Date.now() + DURACION_SESION_MS);

  await sesionRepository.crear({ usuarioId: usuario.id, jti, fechaExpiracion });

  return tokenService.generar({ usuarioId: usuario.id, jti });
}

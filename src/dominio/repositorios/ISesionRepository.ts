import type { Sesion } from "../entidades/Sesion";

export interface DatosNuevaSesion {
  usuarioId: string;
  jti: string;
  fechaExpiracion: Date;
}

export interface ISesionRepository {
  crear(datos: DatosNuevaSesion): Promise<Sesion>;
  buscarPorJti(jti: string): Promise<Sesion | null>;
  /** RF-08 — marca la sesión como revocada; un JWT con ese jti se rechaza aunque no haya expirado. */
  revocarPorJti(jti: string): Promise<void>;
}

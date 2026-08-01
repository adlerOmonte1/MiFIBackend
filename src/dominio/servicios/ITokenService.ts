export interface PayloadToken {
  usuarioId: string;
  jti: string;
}

/**
 * Abstracción del esquema de sesión (D-01: JWT propio, RF-06). El dominio
 * depende de esta interfaz, nunca de jsonwebtoken directamente.
 */
export interface ITokenService {
  generar(payload: PayloadToken): string;
  /** Devuelve el payload si el token es válido (firma + expiración); null si no. */
  verificar(token: string): PayloadToken | null;
}

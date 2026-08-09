import jwt from "jsonwebtoken";
import type { ITokenService, PayloadToken } from "../../dominio/servicios/ITokenService";

/** D-01, RF-06 — JWT propio firmado por el backend. */
export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secreto: string,
    /** RF-06 — 7 días, en segundos (evita el tipo de cadena de duración de jsonwebtoken). */
    private readonly expiracionSegundos: number = 7 * 24 * 60 * 60,
  ) {}

  generar(payload: PayloadToken): string {
    return jwt.sign({}, this.secreto, {
      subject: payload.usuarioId,
      jwtid: payload.jti,
      expiresIn: this.expiracionSegundos,
    });
  }

  verificar(token: string): PayloadToken | null {
    try {
      const decodificado = jwt.verify(token, this.secreto);
      if (typeof decodificado === "string" || !decodificado["sub"] || !decodificado["jti"]) {
        return null;
      }
      return { usuarioId: decodificado["sub"], jti: decodificado["jti"] };
    } catch {
      return null;
    }
  }
}

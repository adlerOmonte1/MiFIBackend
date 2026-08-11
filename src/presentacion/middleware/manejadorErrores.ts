import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ErrorAplicacion } from "../../aplicacion/errores/ErroresAplicacion";

/**
 * Traduce el `codigo` de un ErrorAplicacion (capa de aplicación, sin
 * conocimiento de HTTP) al status HTTP del contrato (docs/openapi.yaml).
 */
const CODIGO_A_STATUS: Record<string, number> = {
  CORREO_YA_REGISTRADO: 409,
  CREDENCIALES_INVALIDAS: 401,
  CUENTA_BLOQUEADA: 423,
  CONSENTIMIENTO_YA_ACEPTADO: 409,
  CONSENTIMIENTO_REQUERIDO: 403, // RF-49
  USUARIO_NO_ENCONTRADO: 404,
  NO_AUTENTICADO: 401,
};

/**
 * Middleware de errores de Express (4 argumentos — la firma es lo que
 * Express usa para reconocerlo como tal). Debe montarse al final, después
 * de todas las rutas.
 */
export function manejadorErrores(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      codigo: "VALIDACION",
      mensaje: err.issues.map((problema) => problema.message).join("; "),
    });
    return;
  }

  if (err instanceof ErrorAplicacion) {
    const status = CODIGO_A_STATUS[err.codigo] ?? 400;
    res.status(status).json({ codigo: err.codigo, mensaje: err.message });
    return;
  }

  // RF-45/CAL-01 (registro de errores para el investigador) queda para un
  // sprint futuro; por ahora se deja constancia en el log del proceso.
  console.error(err);
  res.status(500).json({ codigo: "ERROR_INTERNO", mensaje: "Ocurrió un error inesperado." });
}

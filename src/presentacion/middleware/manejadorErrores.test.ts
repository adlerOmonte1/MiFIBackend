import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  CategoriaNoEncontradaError,
  ConsentimientoRequeridoError,
  CorreoYaRegistradoError,
  ErrorAplicacion,
  MetaAhorroInactivaError,
  MetaAhorroNoEncontradaError,
  TransaccionNoEncontradaError,
  UsuarioNoEncontradoError,
} from "../../aplicacion/errores/ErroresAplicacion";
import { manejadorErrores } from "./manejadorErrores";

function crearRes() {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response & { status: jest.Mock; json: jest.Mock };
}

const req = {} as Request;
const next = jest.fn() as NextFunction;

describe("manejadorErrores", () => {
  it("mapea ErrorAplicacion a su status HTTP declarado (ej. CORREO_YA_REGISTRADO -> 409)", () => {
    const res = crearRes();

    manejadorErrores(new CorreoYaRegistradoError(), req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      codigo: "CORREO_YA_REGISTRADO",
      mensaje: expect.any(String),
    });
  });

  it("mapea CONSENTIMIENTO_REQUERIDO a 403, como declara el contrato (RF-49)", () => {
    const res = crearRes();

    manejadorErrores(new ConsentimientoRequeridoError(), req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      codigo: "CONSENTIMIENTO_REQUERIDO",
      mensaje: expect.any(String),
    });
  });

  /**
   * D-05, RF-50 — el 404 es la defensa anti-IDOR: si alguno de estos
   * códigos mapeara a 403, el atacante sabría que el recurso existe pero es
   * de otro. Se comprobó con mutación que sin estas pruebas ese cambio
   * pasaba desapercibido.
   */
  it.each([
    ["TRANSACCION_NO_ENCONTRADA", new TransaccionNoEncontradaError()],
    ["CATEGORIA_NO_ENCONTRADA", new CategoriaNoEncontradaError()],
    ["META_AHORRO_NO_ENCONTRADA", new MetaAhorroNoEncontradaError()],
    ["USUARIO_NO_ENCONTRADO", new UsuarioNoEncontradoError()],
  ])("mapea %s a 404, nunca a 403 (anti-IDOR, RF-50/D-05)", (codigo, error) => {
    const res = crearRes();

    manejadorErrores(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ codigo, mensaje: expect.any(String) });
  });

  it("mapea META_AHORRO_INACTIVA a 409 (RF-32/AHO-01)", () => {
    const res = crearRes();

    manejadorErrores(new MetaAhorroInactivaError(), req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("mapea un error de validación de zod a 400 con codigo VALIDACION", () => {
    const res = crearRes();
    const resultado = z.object({ correo: z.string().email() }).safeParse({ correo: "no-es-email" });

    manejadorErrores(resultado.error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ codigo: "VALIDACION", mensaje: expect.any(String) });
  });

  it("mapea un error desconocido a 500 sin filtrar detalles internos al cliente", () => {
    const res = crearRes();
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    manejadorErrores(new Error("detalle interno sensible"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      codigo: "ERROR_INTERNO",
      mensaje: "Ocurrió un error inesperado.",
    });
    consoleErrorSpy.mockRestore();
  });

  it("usa 400 como status por defecto si el codigo no está mapeado", () => {
    const res = crearRes();
    class ErrorSinMapear extends ErrorAplicacion {
      constructor() {
        super("CODIGO_NO_MAPEADO", "algo no contemplado");
      }
    }

    manejadorErrores(new ErrorSinMapear(), req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

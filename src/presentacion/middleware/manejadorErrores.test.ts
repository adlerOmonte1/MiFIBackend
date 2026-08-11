import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  ConsentimientoRequeridoError,
  CorreoYaRegistradoError,
  ErrorAplicacion,
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

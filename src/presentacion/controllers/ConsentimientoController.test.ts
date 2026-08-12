import type { Request, Response } from "express";
import type { AceptarConsentimientoUseCase } from "../../aplicacion/casos-uso/AceptarConsentimientoUseCase";
import { Usuario } from "../../dominio/entidades/Usuario";
import { ConsentimientoController } from "./ConsentimientoController";

function crearUsuarioAceptado(): Usuario {
  return new Usuario({
    id: "usuario-1",
    nombre: "Ana Torres",
    correo: "ana@unmsm.pe",
    passwordHash: "hash-secreto",
    rol: "estudiante",
    intentosFallidos: 0,
    bloqueadoHasta: null,
    consentimientoAceptado: true,
    fechaConsentimiento: new Date("2026-01-01"),
    versionConsentimiento: "v1.0",
    fechaRegistro: new Date("2026-01-01"),
  });
}

function crearRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response & { status: jest.Mock; json: jest.Mock };
}

describe("ConsentimientoController", () => {
  it("responde con el esquema Usuario completo que declara el contrato (RF-47, RF-48)", async () => {
    const casoDeUso = {
      ejecutar: jest.fn().mockResolvedValue(crearUsuarioAceptado()),
    } as unknown as AceptarConsentimientoUseCase;
    const controller = new ConsentimientoController(casoDeUso);
    const res = crearRes();
    const req = { body: { versionTexto: "v1.0" }, usuarioId: "usuario-1" } as unknown as Request;

    await controller.aceptar(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    // docs/openapi.yaml -> POST /consentimiento devuelve components.schemas.Usuario
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "usuario-1",
        nombre: "Ana Torres",
        correo: "ana@unmsm.pe",
        rol: "estudiante",
        consentimientoAceptado: true,
        versionConsentimiento: "v1.0",
      }),
    );
  });

  it("toma el usuarioId del token, nunca del body del cliente (RF-50, D-05)", async () => {
    const ejecutar = jest.fn().mockResolvedValue(crearUsuarioAceptado());
    const controller = new ConsentimientoController({
      ejecutar,
    } as unknown as AceptarConsentimientoUseCase);
    const req = {
      // El cliente intenta hacerse pasar por otro usuario en el body.
      body: { versionTexto: "v1.0", usuarioId: "usuario-de-otro" },
      usuarioId: "usuario-del-token",
    } as unknown as Request;

    await controller.aceptar(req, crearRes());

    expect(ejecutar).toHaveBeenCalledWith({
      usuarioId: "usuario-del-token",
      versionTexto: "v1.0",
    });
  });
});

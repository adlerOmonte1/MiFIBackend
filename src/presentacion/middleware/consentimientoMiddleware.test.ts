import type { Request, Response } from "express";
import { ConsentimientoRequeridoError } from "../../aplicacion/errores/ErroresAplicacion";
import { UsuarioRepositoryFalso } from "../../test-utils/fakes";
import { crearConsentimientoMiddleware } from "./consentimientoMiddleware";

async function crearContexto() {
  const usuarioRepository = new UsuarioRepositoryFalso();
  const usuario = await usuarioRepository.crear({
    nombre: "Ana Torres",
    correo: "ana@unmsm.pe",
    passwordHash: "hash",
    rol: "estudiante",
  });
  const middleware = crearConsentimientoMiddleware({ usuarioRepository });
  const next = jest.fn();
  return { usuarioRepository, usuario, middleware, next };
}

function req(usuarioId: string): Request {
  return { usuarioId } as unknown as Request;
}

const res = {} as Response;

describe("consentimientoMiddleware (RF-49, CON-01)", () => {
  it("bloquea a un usuario autenticado que todavía no aceptó el consentimiento", async () => {
    const { middleware, next, usuario } = await crearContexto();

    await expect(middleware(req(usuario.id), res, next)).rejects.toThrow(
      ConsentimientoRequeridoError,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("deja pasar una vez que aceptó el consentimiento", async () => {
    const { middleware, next, usuario, usuarioRepository } = await crearContexto();
    usuario.aceptarConsentimiento("v1.0");
    await usuarioRepository.actualizar(usuario);

    await middleware(req(usuario.id), res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("bloquea si el usuario ya no existe — nunca deja pasar por defecto", async () => {
    const { middleware, next } = await crearContexto();

    await expect(middleware(req("usuario-inexistente"), res, next)).rejects.toThrow(
      ConsentimientoRequeridoError,
    );
    expect(next).not.toHaveBeenCalled();
  });
});

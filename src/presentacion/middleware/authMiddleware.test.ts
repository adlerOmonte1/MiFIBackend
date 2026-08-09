import type { Request, Response } from "express";
import { NoAutenticadoError } from "../../aplicacion/errores/ErroresAplicacion";
import {
  SesionRepositoryFalso,
  TokenServiceFalso,
  UsuarioRepositoryFalso,
} from "../../test-utils/fakes";
import { crearAuthMiddleware } from "./authMiddleware";

function crearContexto() {
  const tokenService = new TokenServiceFalso();
  const sesionRepository = new SesionRepositoryFalso();
  const usuarioRepository = new UsuarioRepositoryFalso();
  const middleware = crearAuthMiddleware({ tokenService, sesionRepository, usuarioRepository });
  const next = jest.fn();
  return { tokenService, sesionRepository, usuarioRepository, middleware, next };
}

function req(authorization?: string): Request {
  return { headers: { authorization } } as unknown as Request;
}

const res = {} as Response;

describe("authMiddleware (RF-51)", () => {
  it("rechaza si no hay header Authorization", async () => {
    const { middleware, next } = crearContexto();
    await expect(middleware(req(), res, next)).rejects.toThrow(NoAutenticadoError);
  });

  it("rechaza un token que no verifica", async () => {
    const { middleware, next } = crearContexto();
    await expect(middleware(req("Bearer token-invalido"), res, next)).rejects.toThrow(
      NoAutenticadoError,
    );
  });

  it("rechaza si la sesión fue revocada (RF-08)", async () => {
    const { middleware, next, tokenService, sesionRepository, usuarioRepository } = crearContexto();
    const usuario = await usuarioRepository.crear({
      nombre: "Ana",
      correo: "ana@unmsm.pe",
      passwordHash: "hash",
      rol: "estudiante",
    });
    await sesionRepository.crear({
      usuarioId: usuario.id,
      jti: "jti-1",
      fechaExpiracion: new Date(Date.now() + 60_000),
    });
    await sesionRepository.revocarPorJti("jti-1");
    const token = tokenService.generar({ usuarioId: usuario.id, jti: "jti-1" });

    await expect(middleware(req(`Bearer ${token}`), res, next)).rejects.toThrow(NoAutenticadoError);
  });

  it("deja pasar una sesión válida y adjunta usuarioId al request (D-05)", async () => {
    const { middleware, next, tokenService, sesionRepository, usuarioRepository } = crearContexto();
    const usuario = await usuarioRepository.crear({
      nombre: "Ana",
      correo: "ana@unmsm.pe",
      passwordHash: "hash",
      rol: "estudiante",
    });
    await sesionRepository.crear({
      usuarioId: usuario.id,
      jti: "jti-1",
      fechaExpiracion: new Date(Date.now() + 60_000),
    });
    const token = tokenService.generar({ usuarioId: usuario.id, jti: "jti-1" });

    const solicitud = req(`Bearer ${token}`);
    await middleware(solicitud, res, next);

    expect(solicitud.usuarioId).toBe(usuario.id);
    expect(solicitud.jti).toBe("jti-1");
    expect(next).toHaveBeenCalledTimes(1);
  });
});

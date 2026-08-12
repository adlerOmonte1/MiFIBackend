import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { CrearMetaAhorroUseCase } from "../../aplicacion/casos-uso/CrearMetaAhorroUseCase";
import type { EliminarMetaAhorroUseCase } from "../../aplicacion/casos-uso/EliminarMetaAhorroUseCase";
import type { ListarMetasAhorroUseCase } from "../../aplicacion/casos-uso/ListarMetasAhorroUseCase";
import type { ObtenerMetaAhorroUseCase } from "../../aplicacion/casos-uso/ObtenerMetaAhorroUseCase";
import type { MetaAhorroConProgreso } from "../../aplicacion/casos-uso/compartido/calcularProgresoMeta";
import { MetaAhorro } from "../../dominio/entidades/MetaAhorro";
import { MetaAhorroController } from "./MetaAhorroController";

function crearResultado(overrides?: Partial<MetaAhorroConProgreso>): MetaAhorroConProgreso {
  return {
    meta: new MetaAhorro({
      id: "meta-1",
      usuarioId: "usuario-del-token",
      nombre: "Celular",
      montoObjetivo: 2000,
      fechaLimite: null,
      estado: "activa",
      fechaCreacion: new Date("2026-01-01"),
    }),
    montoAhorrado: 0,
    porcentajeCumplimiento: 0,
    estado: "activa",
    ...overrides,
  };
}

function crearRes() {
  const res = { status: jest.fn(), json: jest.fn(), send: jest.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res as unknown as Response & { status: jest.Mock; json: jest.Mock; send: jest.Mock };
}

function crearController(overrides?: {
  crear?: jest.Mock;
  listar?: jest.Mock;
  obtener?: jest.Mock;
  eliminar?: jest.Mock;
}) {
  const crear = overrides?.crear ?? jest.fn().mockResolvedValue(crearResultado());
  const listar = overrides?.listar ?? jest.fn().mockResolvedValue([crearResultado()]);
  const obtener = overrides?.obtener ?? jest.fn().mockResolvedValue(crearResultado());
  const eliminar = overrides?.eliminar ?? jest.fn().mockResolvedValue({ tipo: "eliminada" });

  const controller = new MetaAhorroController(
    { ejecutar: crear } as unknown as CrearMetaAhorroUseCase,
    { ejecutar: listar } as unknown as ListarMetasAhorroUseCase,
    { ejecutar: obtener } as unknown as ObtenerMetaAhorroUseCase,
    { ejecutar: eliminar } as unknown as EliminarMetaAhorroUseCase,
  );

  return { controller, crear, listar, obtener, eliminar };
}

describe("MetaAhorroController", () => {
  describe("crear", () => {
    it("toma el usuarioId del token, nunca del body (RF-50, D-05)", async () => {
      const { controller, crear } = crearController();
      const req = {
        body: { nombre: "Celular", montoObjetivo: 2000, usuarioId: "usuario-de-otro" },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await controller.crear(req, crearRes());

      expect(crear).toHaveBeenCalledWith({
        usuarioId: "usuario-del-token",
        nombre: "Celular",
        montoObjetivo: 2000,
        fechaLimite: null,
      });
    });

    it("responde 201 con la meta creada", async () => {
      const { controller } = crearController();
      const req = {
        body: { nombre: "Celular", montoObjetivo: 2000 },
        usuarioId: "usuario-del-token",
      } as unknown as Request;
      const res = crearRes();

      await controller.crear(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: "meta-1" }));
    });

    it("rechaza montoObjetivo <= 0 (RF-31)", async () => {
      const { controller } = crearController();
      const req = {
        body: { nombre: "Celular", montoObjetivo: 0 },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await expect(controller.crear(req, crearRes())).rejects.toThrow(ZodError);
    });

    it("rechaza fechaLimite pasada o igual a hoy (RF-31)", async () => {
      const { controller } = crearController();
      const hoy = new Date().toISOString().slice(0, 10);
      const req = {
        body: { nombre: "Celular", montoObjetivo: 2000, fechaLimite: hoy },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await expect(controller.crear(req, crearRes())).rejects.toThrow(ZodError);
    });

    it("acepta fechaLimite null (D-14)", async () => {
      const { controller, crear } = crearController();
      const req = {
        body: { nombre: "Celular", montoObjetivo: 2000, fechaLimite: null },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await controller.crear(req, crearRes());

      expect(crear).toHaveBeenCalledWith(expect.objectContaining({ fechaLimite: null }));
    });
  });

  describe("listar", () => {
    it("mapea el filtro de estado al caso de uso", async () => {
      const { controller, listar } = crearController();
      const req = {
        query: { estado: "cumplida" },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await controller.listar(req, crearRes());

      expect(listar).toHaveBeenCalledWith({ usuarioId: "usuario-del-token", estado: "cumplida" });
    });

    it("responde 200 con el arreglo de metas", async () => {
      const { controller } = crearController();
      const req = { query: {}, usuarioId: "usuario-del-token" } as unknown as Request;
      const res = crearRes();

      await controller.listar(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([expect.objectContaining({ id: "meta-1" })]);
    });
  });

  describe("obtener", () => {
    it("pasa el id de la ruta y el usuarioId del token", async () => {
      const { controller, obtener } = crearController();
      const req = {
        params: { id: "meta-1" },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await controller.obtener(req, crearRes());

      expect(obtener).toHaveBeenCalledWith({
        metaAhorroId: "meta-1",
        usuarioId: "usuario-del-token",
      });
    });
  });

  describe("eliminar", () => {
    it("responde 204 sin cuerpo cuando se elimina de forma permanente", async () => {
      const { controller } = crearController();
      const req = {
        params: { id: "meta-1" },
        usuarioId: "usuario-del-token",
      } as unknown as Request;
      const res = crearRes();

      await controller.eliminar(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("responde 200 con la meta cuando se marca inactiva", async () => {
      const eliminar = jest.fn().mockResolvedValue({
        tipo: "marcada-inactiva",
        meta: crearResultado({ estado: "inactiva" }),
      });
      const { controller } = crearController({ eliminar });
      const req = {
        params: { id: "meta-1" },
        usuarioId: "usuario-del-token",
      } as unknown as Request;
      const res = crearRes();

      await controller.eliminar(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ estado: "inactiva" }));
    });
  });
});

import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { EditarTransaccionUseCase } from "../../aplicacion/casos-uso/EditarTransaccionUseCase";
import type { EliminarTransaccionUseCase } from "../../aplicacion/casos-uso/EliminarTransaccionUseCase";
import type { ListarTransaccionesUseCase } from "../../aplicacion/casos-uso/ListarTransaccionesUseCase";
import type { ObtenerTransaccionUseCase } from "../../aplicacion/casos-uso/ObtenerTransaccionUseCase";
import type { RegistrarTransaccionUseCase } from "../../aplicacion/casos-uso/RegistrarTransaccionUseCase";
import { Transaccion } from "../../dominio/entidades/Transaccion";
import { TransaccionController } from "./TransaccionController";

function crearTransaccion(): Transaccion {
  return new Transaccion({
    id: "trx-1",
    usuarioId: "usuario-del-token",
    categoriaId: "550e8400-e29b-41d4-a716-446655440000",
    metaAhorroId: null,
    monto: 25.5,
    tipo: "egreso",
    fecha: new Date("2026-08-10T00:00:00.000Z"),
    origen: "manual",
    esGastoHormiga: true,
    esGastoHormigaUsuario: null,
    umbralHormigaAplicado: 30,
    imagenUrl: null,
    fechaCreacion: new Date("2026-08-10T15:00:00.000Z"),
  });
}

function crearRes() {
  const res = { status: jest.fn(), json: jest.fn(), send: jest.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res as unknown as Response & { status: jest.Mock; json: jest.Mock; send: jest.Mock };
}

function crearController(overrides?: {
  registrar?: jest.Mock;
  listar?: jest.Mock;
  obtener?: jest.Mock;
  editar?: jest.Mock;
  eliminar?: jest.Mock;
}) {
  const registrar = overrides?.registrar ?? jest.fn().mockResolvedValue(crearTransaccion());
  const listar =
    overrides?.listar ?? jest.fn().mockResolvedValue({ datos: [crearTransaccion()], total: 1 });
  const obtener = overrides?.obtener ?? jest.fn().mockResolvedValue(crearTransaccion());
  const editar = overrides?.editar ?? jest.fn().mockResolvedValue(crearTransaccion());
  const eliminar = overrides?.eliminar ?? jest.fn().mockResolvedValue(undefined);

  const controller = new TransaccionController(
    { ejecutar: registrar } as unknown as RegistrarTransaccionUseCase,
    { ejecutar: listar } as unknown as ListarTransaccionesUseCase,
    { ejecutar: obtener } as unknown as ObtenerTransaccionUseCase,
    { ejecutar: editar } as unknown as EditarTransaccionUseCase,
    { ejecutar: eliminar } as unknown as EliminarTransaccionUseCase,
  );

  return { controller, registrar, listar, obtener, editar, eliminar };
}

const CUERPO_VALIDO = {
  monto: 25.5,
  tipo: "egreso" as const,
  categoriaId: "550e8400-e29b-41d4-a716-446655440000",
  fecha: "2026-08-10",
};

describe("TransaccionController", () => {
  describe("crear", () => {
    it("toma el usuarioId del token, nunca del body (RF-50, D-05)", async () => {
      const { controller, registrar } = crearController();
      const req = {
        body: { ...CUERPO_VALIDO, usuarioId: "usuario-de-otro" },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await controller.crear(req, crearRes());

      expect(registrar).toHaveBeenCalledWith({
        usuarioId: "usuario-del-token",
        categoriaId: CUERPO_VALIDO.categoriaId,
        monto: 25.5,
        tipo: "egreso",
        fecha: new Date("2026-08-10T00:00:00.000Z"),
      });
    });

    it("pasa metaAhorroId al caso de uso cuando el cliente lo manda (RF-33)", async () => {
      const { controller, registrar } = crearController();
      const req = {
        body: { ...CUERPO_VALIDO, metaAhorroId: "550e8400-e29b-41d4-a716-446655440099" },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await controller.crear(req, crearRes());

      expect(registrar).toHaveBeenCalledWith(
        expect.objectContaining({ metaAhorroId: "550e8400-e29b-41d4-a716-446655440099" }),
      );
    });

    it("no manda la clave metaAhorroId si el cliente la omite", async () => {
      const { controller, registrar } = crearController();
      const req = { body: CUERPO_VALIDO, usuarioId: "usuario-del-token" } as unknown as Request;

      await controller.crear(req, crearRes());

      expect(registrar).toHaveBeenCalledWith(
        expect.not.objectContaining({ metaAhorroId: expect.anything() }),
      );
    });

    it("responde 201 con la transacción creada", async () => {
      const { controller } = crearController();
      const req = { body: CUERPO_VALIDO, usuarioId: "usuario-del-token" } as unknown as Request;
      const res = crearRes();

      await controller.crear(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: "trx-1" }));
    });

    it("rechaza monto <= 0 (RF-10)", async () => {
      const { controller } = crearController();
      const req = {
        body: { ...CUERPO_VALIDO, monto: 0 },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await expect(controller.crear(req, crearRes())).rejects.toThrow(ZodError);
    });

    it("rechaza fecha futura (RF-11)", async () => {
      const { controller } = crearController();
      const mañana = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const req = {
        body: { ...CUERPO_VALIDO, fecha: mañana },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await expect(controller.crear(req, crearRes())).rejects.toThrow(ZodError);
    });
  });

  describe("listar", () => {
    it("mapea los filtros de query al caso de uso", async () => {
      const { controller, listar } = crearController();
      const req = {
        query: { periodo: "semana", tipo: "egreso", pagina: "2", tamanoPagina: "10" },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await controller.listar(req, crearRes());

      expect(listar).toHaveBeenCalledWith({
        usuarioId: "usuario-del-token",
        periodo: "semana",
        tipo: "egreso",
        pagina: 2,
        tamanoPagina: 10,
      });
    });

    it("responde 200 con datos y total", async () => {
      const { controller } = crearController();
      const req = { query: {}, usuarioId: "usuario-del-token" } as unknown as Request;
      const res = crearRes();

      await controller.listar(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ total: 1, datos: [expect.objectContaining({ id: "trx-1" })] }),
      );
    });
  });

  describe("obtener/editar/eliminar", () => {
    it("obtener pasa el id de la ruta y el usuarioId del token", async () => {
      const { controller, obtener } = crearController();
      const req = {
        params: { id: "trx-1" },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await controller.obtener(req, crearRes());

      expect(obtener).toHaveBeenCalledWith({
        transaccionId: "trx-1",
        usuarioId: "usuario-del-token",
      });
    });

    it("editar pasa el id de la ruta, no uno que venga en el body", async () => {
      const { controller, editar } = crearController();
      const req = {
        params: { id: "trx-1" },
        body: { ...CUERPO_VALIDO },
        usuarioId: "usuario-del-token",
      } as unknown as Request;

      await controller.editar(req, crearRes());

      expect(editar).toHaveBeenCalledWith(
        expect.objectContaining({ transaccionId: "trx-1", usuarioId: "usuario-del-token" }),
      );
    });

    it("eliminar responde 204 sin cuerpo", async () => {
      const { controller } = crearController();
      const req = {
        params: { id: "trx-1" },
        usuarioId: "usuario-del-token",
      } as unknown as Request;
      const res = crearRes();

      await controller.eliminar(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});

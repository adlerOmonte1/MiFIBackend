import type { Request, Response } from "express";
import type { ListarCategoriasUseCase } from "../../aplicacion/casos-uso/ListarCategoriasUseCase";
import { Categoria } from "../../dominio/entidades/Categoria";
import { CategoriaController } from "./CategoriaController";

function crearRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response & { status: jest.Mock; json: jest.Mock };
}

describe("CategoriaController", () => {
  it("usa el usuarioId del token, nunca de query/params (RF-50, D-05)", async () => {
    const ejecutar = jest.fn().mockResolvedValue([]);
    const controller = new CategoriaController({
      ejecutar,
    } as unknown as ListarCategoriasUseCase);
    const req = { usuarioId: "usuario-del-token" } as unknown as Request;

    await controller.listar(req, crearRes());

    expect(ejecutar).toHaveBeenCalledWith("usuario-del-token");
  });

  it("responde 200 con la lista mapeada al contrato", async () => {
    const categoria = new Categoria({
      id: "cat-1",
      usuarioId: null,
      nombre: "Comida",
      esPredefinida: true,
    });
    const controller = new CategoriaController({
      ejecutar: jest.fn().mockResolvedValue([categoria]),
    } as unknown as ListarCategoriasUseCase);
    const req = { usuarioId: "usuario-del-token" } as unknown as Request;
    const res = crearRes();

    await controller.listar(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: "cat-1", nombre: "Comida", esPredefinida: true }]);
  });
});

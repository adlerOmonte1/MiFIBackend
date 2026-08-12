import { Categoria } from "../../dominio/entidades/Categoria";
import { aRespuestaCategoria } from "./categoriaResponse";

describe("aRespuestaCategoria", () => {
  it("devuelve exactamente los campos que declara el contrato, ni más ni menos", () => {
    const categoria = new Categoria({
      id: "cat-1",
      usuarioId: "usuario-1",
      nombre: "Propina",
      esPredefinida: false,
    });

    const respuesta = aRespuestaCategoria(categoria);

    expect(Object.keys(respuesta).sort()).toEqual(["esPredefinida", "id", "nombre"]);
  });

  it("nunca expone usuarioId", () => {
    const categoria = new Categoria({
      id: "cat-1",
      usuarioId: "usuario-1",
      nombre: "Propina",
      esPredefinida: false,
    });

    const respuesta = aRespuestaCategoria(categoria) as Record<string, unknown>;

    expect(respuesta["usuarioId"]).toBeUndefined();
  });
});

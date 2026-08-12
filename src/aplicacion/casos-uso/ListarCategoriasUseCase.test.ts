import { CategoriaRepositoryFalso } from "../../test-utils/fakes";
import { Categoria } from "../../dominio/entidades/Categoria";
import { ListarCategoriasUseCase } from "./ListarCategoriasUseCase";

describe("ListarCategoriasUseCase", () => {
  it("devuelve las predefinidas y las propias del usuario, nunca las de otro (RF-36, RF-50)", async () => {
    const categoriaRepository = new CategoriaRepositoryFalso();
    categoriaRepository.agregar(
      new Categoria({ id: "1", usuarioId: null, nombre: "Comida", esPredefinida: true }),
    );
    categoriaRepository.agregar(
      new Categoria({ id: "2", usuarioId: "usuario-a", nombre: "Propina", esPredefinida: false }),
    );
    categoriaRepository.agregar(
      new Categoria({ id: "3", usuarioId: "usuario-b", nombre: "De otro", esPredefinida: false }),
    );

    const casoDeUso = new ListarCategoriasUseCase(categoriaRepository);
    const categorias = await casoDeUso.ejecutar("usuario-a");

    expect(categorias.map((c) => c.id).sort()).toEqual(["1", "2"]);
  });
});

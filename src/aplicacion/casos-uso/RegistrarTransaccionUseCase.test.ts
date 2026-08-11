import { CategoriaNoEncontradaError } from "../errores/ErroresAplicacion";
import { Categoria } from "../../dominio/entidades/Categoria";
import { CategoriaRepositoryFalso, TransaccionRepositoryFalso } from "../../test-utils/fakes";
import { RegistrarTransaccionUseCase } from "./RegistrarTransaccionUseCase";

const UMBRAL = 15;

function crearCasoDeUso() {
  const transaccionRepository = new TransaccionRepositoryFalso();
  const categoriaRepository = new CategoriaRepositoryFalso();

  // Categoría predefinida disponible en toda la suite, para no repetir el
  // seed en cada prueba que no le importa la validación de categoría.
  categoriaRepository.agregar(
    new Categoria({ id: "categoria-1", usuarioId: null, nombre: "Comida", esPredefinida: true }),
  );

  const casoDeUso = new RegistrarTransaccionUseCase(
    transaccionRepository,
    categoriaRepository,
    UMBRAL,
  );
  return { casoDeUso, transaccionRepository, categoriaRepository };
}

describe("RegistrarTransaccionUseCase (RF-09 a RF-11, RF-38)", () => {
  it("registra un egreso y lo marca como gasto hormiga si no supera el umbral", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const transaccion = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 8,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
    });

    expect(transaccion.esGastoHormiga).toBe(true);
    expect(transaccion.umbralHormigaAplicado).toBe(UMBRAL);
  });

  it("registra un egreso que no es hormiga, pero igual guarda el umbral evaluado (D-08)", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const transaccion = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 100,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
    });

    expect(transaccion.esGastoHormiga).toBe(false);
    expect(transaccion.umbralHormigaAplicado).toBe(UMBRAL);
  });

  it("nunca marca un ingreso como gasto hormiga, sin importar el monto", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const transaccion = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 5,
      tipo: "ingreso",
      fecha: new Date("2026-08-01"),
    });

    expect(transaccion.esGastoHormiga).toBe(false);
    expect(transaccion.umbralHormigaAplicado).toBeNull();
  });

  it("el origen siempre es 'manual' y metaAhorroId siempre null (Sprint 3 todavía no existe)", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const transaccion = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 20,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
    });

    expect(transaccion.origen).toBe("manual");
    expect(transaccion.metaAhorroId).toBeNull();
  });

  it("nunca opina por el estudiante: esGastoHormigaUsuario nace en null (RF-55, D-15)", async () => {
    const { casoDeUso } = crearCasoDeUso();

    const transaccion = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 8,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
    });

    expect(transaccion.esGastoHormigaUsuario).toBeNull();
  });

  it("persiste la transacción con el usuarioId recibido (queda disponible para listar después)", async () => {
    const { casoDeUso, transaccionRepository } = crearCasoDeUso();

    const creada = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "categoria-1",
      monto: 8,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
    });

    const encontrada = await transaccionRepository.buscarPorId(creada.id);
    expect(encontrada?.usuarioId).toBe("usuario-1");
  });

  describe("validación de la categoría (RF-36, RF-50 — hallazgo #7 de la auditoría)", () => {
    it("rechaza una categoría que no existe", async () => {
      const { casoDeUso } = crearCasoDeUso();

      await expect(
        casoDeUso.ejecutar({
          usuarioId: "usuario-1",
          categoriaId: "categoria-inexistente",
          monto: 8,
          tipo: "egreso",
          fecha: new Date("2026-08-01"),
        }),
      ).rejects.toThrow(CategoriaNoEncontradaError);
    });

    it("rechaza la categoría propia de OTRO usuario (anti-IDOR)", async () => {
      const { casoDeUso, categoriaRepository } = crearCasoDeUso();
      categoriaRepository.agregar(
        new Categoria({
          id: "categoria-de-otro",
          usuarioId: "usuario-2",
          nombre: "Secreta",
          esPredefinida: false,
        }),
      );

      await expect(
        casoDeUso.ejecutar({
          usuarioId: "usuario-1",
          categoriaId: "categoria-de-otro",
          monto: 8,
          tipo: "egreso",
          fecha: new Date("2026-08-01"),
        }),
      ).rejects.toThrow(CategoriaNoEncontradaError);
    });

    it("acepta la categoría propia del MISMO usuario", async () => {
      const { casoDeUso, categoriaRepository } = crearCasoDeUso();
      categoriaRepository.agregar(
        new Categoria({
          id: "categoria-propia",
          usuarioId: "usuario-1",
          nombre: "Mi categoría",
          esPredefinida: false,
        }),
      );

      const transaccion = await casoDeUso.ejecutar({
        usuarioId: "usuario-1",
        categoriaId: "categoria-propia",
        monto: 8,
        tipo: "egreso",
        fecha: new Date("2026-08-01"),
      });

      expect(transaccion.categoriaId).toBe("categoria-propia");
    });
  });
});

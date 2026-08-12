import { MetaAhorroNoEncontradaError } from "../errores/ErroresAplicacion";
import { MetaAhorroRepositoryFalso, TransaccionRepositoryFalso } from "../../test-utils/fakes";
import { EliminarMetaAhorroUseCase } from "./EliminarMetaAhorroUseCase";

describe("EliminarMetaAhorroUseCase", () => {
  it("elimina de forma permanente si no tiene transacciones vinculadas", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const transaccionRepository = new TransaccionRepositoryFalso();
    const meta = await metaAhorroRepository.crear({
      usuarioId: "usuario-1",
      nombre: "Celular",
      montoObjetivo: 2000,
      fechaLimite: null,
    });

    const casoDeUso = new EliminarMetaAhorroUseCase(metaAhorroRepository, transaccionRepository);
    const resultado = await casoDeUso.ejecutar({ metaAhorroId: meta.id, usuarioId: "usuario-1" });

    expect(resultado.tipo).toBe("eliminada");
    expect(await metaAhorroRepository.buscarPorId(meta.id)).toBeNull();
  });

  it("marca inactiva en vez de eliminar si tiene transacciones vinculadas", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const transaccionRepository = new TransaccionRepositoryFalso();
    const meta = await metaAhorroRepository.crear({
      usuarioId: "usuario-1",
      nombre: "Celular",
      montoObjetivo: 2000,
      fechaLimite: null,
    });
    await transaccionRepository.crear({
      usuarioId: "usuario-1",
      categoriaId: "cat-1",
      metaAhorroId: meta.id,
      monto: 300,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
      origen: "manual",
      esGastoHormiga: false,
      umbralHormigaAplicado: null,
      imagenUrl: null,
    });

    const casoDeUso = new EliminarMetaAhorroUseCase(metaAhorroRepository, transaccionRepository);
    const resultado = await casoDeUso.ejecutar({ metaAhorroId: meta.id, usuarioId: "usuario-1" });

    expect(resultado.tipo).toBe("marcada-inactiva");
    if (resultado.tipo === "marcada-inactiva") {
      expect(resultado.meta.meta.estado).toBe("inactiva");
      expect(resultado.meta.montoAhorrado).toBe(300);
    }
    const siguesExistiendo = await metaAhorroRepository.buscarPorId(meta.id);
    expect(siguesExistiendo?.estado).toBe("inactiva");
  });

  it("lanza MetaAhorroNoEncontradaError si no existe", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const transaccionRepository = new TransaccionRepositoryFalso();
    const casoDeUso = new EliminarMetaAhorroUseCase(metaAhorroRepository, transaccionRepository);

    await expect(
      casoDeUso.ejecutar({ metaAhorroId: "no-existe", usuarioId: "usuario-1" }),
    ).rejects.toThrow(MetaAhorroNoEncontradaError);
  });

  it("lanza MetaAhorroNoEncontradaError si es de otro usuario (RF-50, D-05)", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const transaccionRepository = new TransaccionRepositoryFalso();
    const meta = await metaAhorroRepository.crear({
      usuarioId: "usuario-1",
      nombre: "Celular",
      montoObjetivo: 2000,
      fechaLimite: null,
    });

    const casoDeUso = new EliminarMetaAhorroUseCase(metaAhorroRepository, transaccionRepository);

    await expect(
      casoDeUso.ejecutar({ metaAhorroId: meta.id, usuarioId: "usuario-2" }),
    ).rejects.toThrow(MetaAhorroNoEncontradaError);
  });
});

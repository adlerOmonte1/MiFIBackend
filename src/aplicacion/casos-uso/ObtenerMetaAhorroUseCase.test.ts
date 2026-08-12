import { MetaAhorroNoEncontradaError } from "../errores/ErroresAplicacion";
import { MetaAhorroRepositoryFalso, TransaccionRepositoryFalso } from "../../test-utils/fakes";
import { ObtenerMetaAhorroUseCase } from "./ObtenerMetaAhorroUseCase";

describe("ObtenerMetaAhorroUseCase", () => {
  it("devuelve la meta con su progreso cuando pertenece al usuario", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const transaccionRepository = new TransaccionRepositoryFalso();
    const meta = await metaAhorroRepository.crear({
      usuarioId: "usuario-1",
      nombre: "Celular",
      montoObjetivo: 2000,
      fechaLimite: null,
    });

    const casoDeUso = new ObtenerMetaAhorroUseCase(metaAhorroRepository, transaccionRepository);
    const resultado = await casoDeUso.ejecutar({
      metaAhorroId: meta.id,
      usuarioId: "usuario-1",
    });

    expect(resultado.meta.id).toBe(meta.id);
  });

  it("lanza MetaAhorroNoEncontradaError si no existe", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const transaccionRepository = new TransaccionRepositoryFalso();
    const casoDeUso = new ObtenerMetaAhorroUseCase(metaAhorroRepository, transaccionRepository);

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

    const casoDeUso = new ObtenerMetaAhorroUseCase(metaAhorroRepository, transaccionRepository);

    await expect(
      casoDeUso.ejecutar({ metaAhorroId: meta.id, usuarioId: "usuario-2" }),
    ).rejects.toThrow(MetaAhorroNoEncontradaError);
  });
});

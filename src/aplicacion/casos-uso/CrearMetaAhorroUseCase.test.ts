import { MetaAhorroRepositoryFalso } from "../../test-utils/fakes";
import { CrearMetaAhorroUseCase } from "./CrearMetaAhorroUseCase";

describe("CrearMetaAhorroUseCase (RF-30 a RF-32)", () => {
  it("crea la meta activa, con progreso 0", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const casoDeUso = new CrearMetaAhorroUseCase(metaAhorroRepository);

    const resultado = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      nombre: "Celular",
      montoObjetivo: 2000,
      fechaLimite: null,
    });

    expect(resultado.meta.nombre).toBe("Celular");
    expect(resultado.meta.estado).toBe("activa");
    expect(resultado.montoAhorrado).toBe(0);
    expect(resultado.porcentajeCumplimiento).toBe(0);
    expect(resultado.estado).toBe("activa");
  });

  it("acepta fechaLimite null (D-14 — sin fecha límite)", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const casoDeUso = new CrearMetaAhorroUseCase(metaAhorroRepository);

    const resultado = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      nombre: "Fondo de emergencia",
      montoObjetivo: 5000,
      fechaLimite: null,
    });

    expect(resultado.meta.fechaLimite).toBeNull();
  });

  it("persiste la meta con el usuarioId recibido", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const casoDeUso = new CrearMetaAhorroUseCase(metaAhorroRepository);

    const resultado = await casoDeUso.ejecutar({
      usuarioId: "usuario-1",
      nombre: "Celular",
      montoObjetivo: 2000,
      fechaLimite: null,
    });

    const encontrada = await metaAhorroRepository.buscarPorId(resultado.meta.id);
    expect(encontrada?.usuarioId).toBe("usuario-1");
  });
});

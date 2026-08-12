import { MetaAhorroRepositoryFalso, TransaccionRepositoryFalso } from "../../test-utils/fakes";
import { ListarMetasAhorroUseCase } from "./ListarMetasAhorroUseCase";

describe("ListarMetasAhorroUseCase (RF-32 a RF-34)", () => {
  it("lista solo las metas del usuario", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const transaccionRepository = new TransaccionRepositoryFalso();
    await metaAhorroRepository.crear({
      usuarioId: "usuario-1",
      nombre: "Celular",
      montoObjetivo: 2000,
      fechaLimite: null,
    });
    await metaAhorroRepository.crear({
      usuarioId: "usuario-2",
      nombre: "De otro",
      montoObjetivo: 1000,
      fechaLimite: null,
    });

    const casoDeUso = new ListarMetasAhorroUseCase(metaAhorroRepository, transaccionRepository);
    const resultado = await casoDeUso.ejecutar({ usuarioId: "usuario-1" });

    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.meta.nombre).toBe("Celular");
  });

  it("cada meta trae su progreso calculado", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const transaccionRepository = new TransaccionRepositoryFalso();
    const meta = await metaAhorroRepository.crear({
      usuarioId: "usuario-1",
      nombre: "Celular",
      montoObjetivo: 1000,
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

    const casoDeUso = new ListarMetasAhorroUseCase(metaAhorroRepository, transaccionRepository);
    const resultado = await casoDeUso.ejecutar({ usuarioId: "usuario-1" });

    expect(resultado[0]?.montoAhorrado).toBe(300);
    expect(resultado[0]?.porcentajeCumplimiento).toBe(30);
  });

  it("filtra por estado calculado, incluida 'cumplida' (no una columna real)", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const transaccionRepository = new TransaccionRepositoryFalso();
    const cumplida = await metaAhorroRepository.crear({
      usuarioId: "usuario-1",
      nombre: "Cumplida",
      montoObjetivo: 500,
      fechaLimite: null,
    });
    await transaccionRepository.crear({
      usuarioId: "usuario-1",
      categoriaId: "cat-1",
      metaAhorroId: cumplida.id,
      monto: 500,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
      origen: "manual",
      esGastoHormiga: false,
      umbralHormigaAplicado: null,
      imagenUrl: null,
    });
    await metaAhorroRepository.crear({
      usuarioId: "usuario-1",
      nombre: "Sin empezar",
      montoObjetivo: 1000,
      fechaLimite: null,
    });

    const casoDeUso = new ListarMetasAhorroUseCase(metaAhorroRepository, transaccionRepository);
    const resultado = await casoDeUso.ejecutar({ usuarioId: "usuario-1", estado: "cumplida" });

    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.meta.nombre).toBe("Cumplida");
  });

  it("sin filtro de estado, devuelve todas", async () => {
    const metaAhorroRepository = new MetaAhorroRepositoryFalso();
    const transaccionRepository = new TransaccionRepositoryFalso();
    await metaAhorroRepository.crear({
      usuarioId: "usuario-1",
      nombre: "Celular",
      montoObjetivo: 2000,
      fechaLimite: null,
    });
    await metaAhorroRepository.crear({
      usuarioId: "usuario-1",
      nombre: "PS5",
      montoObjetivo: 4000,
      fechaLimite: null,
    });

    const casoDeUso = new ListarMetasAhorroUseCase(metaAhorroRepository, transaccionRepository);
    const resultado = await casoDeUso.ejecutar({ usuarioId: "usuario-1" });

    expect(resultado).toHaveLength(2);
  });
});

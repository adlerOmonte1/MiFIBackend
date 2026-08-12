import { MetaAhorro } from "../../../dominio/entidades/MetaAhorro";
import { TransaccionRepositoryFalso } from "../../../test-utils/fakes";
import { calcularProgresoMeta } from "./calcularProgresoMeta";

function crearMeta(overrides?: Partial<ConstructorParameters<typeof MetaAhorro>[0]>) {
  return new MetaAhorro({
    id: "meta-1",
    usuarioId: "usuario-1",
    nombre: "Celular",
    montoObjetivo: 2000,
    fechaLimite: null,
    estado: "activa",
    fechaCreacion: new Date("2026-01-01"),
    ...overrides,
  });
}

describe("calcularProgresoMeta (RF-33 a RF-35)", () => {
  it("sin transacciones vinculadas, el progreso es 0 (FE1)", async () => {
    const transaccionRepository = new TransaccionRepositoryFalso();
    const meta = crearMeta();

    const resultado = await calcularProgresoMeta(meta, transaccionRepository);

    expect(resultado.montoAhorrado).toBe(0);
    expect(resultado.porcentajeCumplimiento).toBe(0);
    expect(resultado.estado).toBe("activa");
  });

  it("suma egresos vinculados (aportes) y resta ingresos vinculados (retiros)", async () => {
    const transaccionRepository = new TransaccionRepositoryFalso();
    const meta = crearMeta({ montoObjetivo: 1000 });
    await transaccionRepository.crear({
      usuarioId: "usuario-1",
      categoriaId: "cat-1",
      metaAhorroId: meta.id,
      monto: 500,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
      origen: "manual",
      esGastoHormiga: false,
      umbralHormigaAplicado: null,
      imagenUrl: null,
    });
    await transaccionRepository.crear({
      usuarioId: "usuario-1",
      categoriaId: "cat-1",
      metaAhorroId: meta.id,
      monto: 100,
      tipo: "ingreso",
      fecha: new Date("2026-08-05"),
      origen: "manual",
      esGastoHormiga: false,
      umbralHormigaAplicado: null,
      imagenUrl: null,
    });

    const resultado = await calcularProgresoMeta(meta, transaccionRepository);

    expect(resultado.montoAhorrado).toBe(400);
    expect(resultado.porcentajeCumplimiento).toBe(40);
  });

  it("ignora transacciones de otras metas", async () => {
    const transaccionRepository = new TransaccionRepositoryFalso();
    const meta = crearMeta();
    await transaccionRepository.crear({
      usuarioId: "usuario-1",
      categoriaId: "cat-1",
      metaAhorroId: "otra-meta",
      monto: 500,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
      origen: "manual",
      esGastoHormiga: false,
      umbralHormigaAplicado: null,
      imagenUrl: null,
    });

    const resultado = await calcularProgresoMeta(meta, transaccionRepository);

    expect(resultado.montoAhorrado).toBe(0);
  });

  it("estado 'cumplida' cuando el ahorrado alcanza el objetivo", async () => {
    const transaccionRepository = new TransaccionRepositoryFalso();
    const meta = crearMeta({ montoObjetivo: 500 });
    await transaccionRepository.crear({
      usuarioId: "usuario-1",
      categoriaId: "cat-1",
      metaAhorroId: meta.id,
      monto: 500,
      tipo: "egreso",
      fecha: new Date("2026-08-01"),
      origen: "manual",
      esGastoHormiga: false,
      umbralHormigaAplicado: null,
      imagenUrl: null,
    });

    const resultado = await calcularProgresoMeta(meta, transaccionRepository);

    expect(resultado.estado).toBe("cumplida");
    expect(resultado.porcentajeCumplimiento).toBe(100);
  });

  it("estado 'inactiva' es definitivo, aunque tenga progreso", async () => {
    const transaccionRepository = new TransaccionRepositoryFalso();
    const meta = crearMeta({ estado: "inactiva" });

    const resultado = await calcularProgresoMeta(meta, transaccionRepository);

    expect(resultado.estado).toBe("inactiva");
  });
});

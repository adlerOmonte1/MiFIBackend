import { Categoria } from "../../dominio/entidades/Categoria";
import {
  CategoriaRepositoryFalso,
  MetaAhorroRepositoryFalso,
  TransaccionRepositoryFalso,
} from "../../test-utils/fakes";
import { ObtenerResumenDashboardUseCase } from "./ObtenerResumenDashboardUseCase";
import { RegistrarTransaccionUseCase } from "./RegistrarTransaccionUseCase";

const UMBRAL = 15;
const HOY = new Date();

async function crearEscenario() {
  const transaccionRepository = new TransaccionRepositoryFalso();
  const categoriaRepository = new CategoriaRepositoryFalso();
  const metaAhorroRepository = new MetaAhorroRepositoryFalso();
  categoriaRepository.agregar(
    new Categoria({ id: "comida", usuarioId: null, nombre: "Comida", esPredefinida: true }),
  );
  categoriaRepository.agregar(
    new Categoria({ id: "transporte", usuarioId: null, nombre: "Transporte", esPredefinida: true }),
  );
  const registrar = new RegistrarTransaccionUseCase(
    transaccionRepository,
    categoriaRepository,
    metaAhorroRepository,
    UMBRAL,
  );
  const resumen = new ObtenerResumenDashboardUseCase(transaccionRepository, categoriaRepository);

  return { resumen, registrar, metaAhorroRepository };
}

describe("ObtenerResumenDashboardUseCase (RF-37, RF-39, RF-40, RF-41)", () => {
  it("suma ingresos y egresos por separado, y calcula el ahorro como la diferencia", async () => {
    const { resumen, registrar } = await crearEscenario();
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 100,
      tipo: "egreso",
      fecha: HOY,
    });
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 600,
      tipo: "ingreso",
      fecha: HOY,
    });

    const r = await resumen.ejecutar({ usuarioId: "usuario-1" });

    expect(r.ingresosTotal).toBe(600);
    expect(r.egresosTotal).toBe(100);
    expect(r.ahorroTotal).toBe(500);
  });

  it("agrupa los egresos por categoría, con su nombre resuelto", async () => {
    const { resumen, registrar } = await crearEscenario();
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 30,
      tipo: "egreso",
      fecha: HOY,
    });
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 20,
      tipo: "egreso",
      fecha: HOY,
    });
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "transporte",
      monto: 5,
      tipo: "egreso",
      fecha: HOY,
    });

    const r = await resumen.ejecutar({ usuarioId: "usuario-1" });

    const comida = r.gastosPorCategoria.find((g) => g.categoriaId === "comida");
    const transporte = r.gastosPorCategoria.find((g) => g.categoriaId === "transporte");
    expect(comida).toEqual({ categoriaId: "comida", nombre: "Comida", montoTotal: 50 });
    expect(transporte).toEqual({ categoriaId: "transporte", nombre: "Transporte", montoTotal: 5 });
  });

  it("calcula el % de gasto hormiga usando la marca AUTOMÁTICA, no el criterio del estudiante (D-15)", async () => {
    const { resumen, registrar } = await crearEscenario();
    // Hormiga automática (monto 8 <= umbral 15) que el estudiante marcó como "no era hormiga".
    const t1 = await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 8,
      tipo: "egreso",
      fecha: HOY,
    });
    t1.indicarCriterioUsuario(false); // opinión del estudiante, no debe afectar el indicador
    // Egreso grande, no es hormiga.
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 92,
      tipo: "egreso",
      fecha: HOY,
    });

    const r = await resumen.ejecutar({ usuarioId: "usuario-1" });

    expect(r.egresosTotal).toBe(100);
    expect(r.gastosHormiga.montoTotal).toBe(8);
    expect(r.gastosHormiga.porcentajeSobreEgresos).toBe(8);
  });

  it("no revienta con 0% si no hay egresos en el periodo (evita división por cero)", async () => {
    const { resumen, registrar } = await crearEscenario();
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 500,
      tipo: "ingreso",
      fecha: HOY,
    });

    const r = await resumen.ejecutar({ usuarioId: "usuario-1" });

    expect(r.egresosTotal).toBe(0);
    expect(r.gastosHormiga.montoTotal).toBe(0);
    expect(r.gastosHormiga.porcentajeSobreEgresos).toBe(0);
  });

  it("solo incluye transacciones del usuario que pide el resumen (RF-50, D-05)", async () => {
    const { resumen, registrar } = await crearEscenario();
    await registrar.ejecutar({
      usuarioId: "usuario-1",
      categoriaId: "comida",
      monto: 10,
      tipo: "egreso",
      fecha: HOY,
    });
    await registrar.ejecutar({
      usuarioId: "usuario-2",
      categoriaId: "comida",
      monto: 9999,
      tipo: "egreso",
      fecha: HOY,
    });

    const r = await resumen.ejecutar({ usuarioId: "usuario-1" });

    expect(r.egresosTotal).toBe(10);
  });

  it("usa 'mes' como periodo por defecto y lo refleja en la respuesta", async () => {
    const { resumen } = await crearEscenario();

    const r = await resumen.ejecutar({ usuarioId: "usuario-1" });

    expect(r.periodo).toBe("mes");
  });

  /**
   * Regresión de un bug real encontrado en la revisión de Sprint 3 (ADR
   * D-16). Antes de la corrección, estas cuatro pruebas fallaban: los
   * aportes a una meta se contaban como consumo y contaminaban los tres
   * indicadores de tesis que salen del dashboard.
   */
  describe("movimientos de ahorro excluidos del consumo (D-16)", () => {
    async function conMeta() {
      const escenario = await crearEscenario();
      const meta = await escenario.metaAhorroRepository.crear({
        usuarioId: "usuario-1",
        nombre: "Celular",
        montoObjetivo: 2000,
        fechaLimite: null,
      });
      return { ...escenario, meta };
    }

    it("apartar plata en una meta NO reduce el ahorro del periodo (RF-40)", async () => {
      const { resumen, registrar, meta } = await conMeta();
      await registrar.ejecutar({
        usuarioId: "usuario-1",
        categoriaId: "comida",
        monto: 1000,
        tipo: "ingreso",
        fecha: HOY,
      });
      await registrar.ejecutar({
        usuarioId: "usuario-1",
        categoriaId: "comida",
        metaAhorroId: meta.id,
        monto: 300,
        tipo: "egreso",
        fecha: HOY,
      });

      const r = await resumen.ejecutar({ usuarioId: "usuario-1" });

      expect(r.egresosTotal).toBe(0);
      expect(r.ahorroTotal).toBe(1000);
    });

    it("un aporte no aparece como gasto de su categoría (RF-37)", async () => {
      const { resumen, registrar, meta } = await conMeta();
      await registrar.ejecutar({
        usuarioId: "usuario-1",
        categoriaId: "comida",
        metaAhorroId: meta.id,
        monto: 300,
        tipo: "egreso",
        fecha: HOY,
      });

      const r = await resumen.ejecutar({ usuarioId: "usuario-1" });

      expect(r.gastosPorCategoria).toEqual([]);
    });

    it("un aporte chico no cuenta como gasto hormiga (RF-38, RF-39)", async () => {
      const { resumen, registrar, meta } = await conMeta();
      // Gasto hormiga real: una gaseosa de S/ 5.
      await registrar.ejecutar({
        usuarioId: "usuario-1",
        categoriaId: "comida",
        monto: 5,
        tipo: "egreso",
        fecha: HOY,
      });
      // Aporte de S/ 10 a la meta: bajo el umbral, pero es ahorro, no gasto.
      await registrar.ejecutar({
        usuarioId: "usuario-1",
        categoriaId: "comida",
        metaAhorroId: meta.id,
        monto: 10,
        tipo: "egreso",
        fecha: HOY,
      });

      const r = await resumen.ejecutar({ usuarioId: "usuario-1" });

      expect(r.egresosTotal).toBe(5);
      expect(r.gastosHormiga.montoTotal).toBe(5);
      expect(r.gastosHormiga.porcentajeSobreEgresos).toBe(100);
    });

    it("un retiro de la meta tampoco cuenta como ingreso corriente", async () => {
      const { resumen, registrar, meta } = await conMeta();
      await registrar.ejecutar({
        usuarioId: "usuario-1",
        categoriaId: "comida",
        metaAhorroId: meta.id,
        monto: 100,
        tipo: "ingreso",
        fecha: HOY,
      });

      const r = await resumen.ejecutar({ usuarioId: "usuario-1" });

      expect(r.ingresosTotal).toBe(0);
      expect(r.ahorroTotal).toBe(0);
    });
  });
});

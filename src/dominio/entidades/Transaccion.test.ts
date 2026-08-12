import { Transaccion, type TransaccionProps } from "./Transaccion";

const UMBRAL = 15;

function crearTransaccion(overrides: Partial<TransaccionProps> = {}): Transaccion {
  return new Transaccion({
    id: "transaccion-1",
    usuarioId: "usuario-1",
    categoriaId: "categoria-1",
    metaAhorroId: null,
    monto: 8,
    tipo: "egreso",
    fecha: new Date("2026-08-01"),
    origen: "manual",
    esGastoHormiga: false,
    esGastoHormigaUsuario: null,
    umbralHormigaAplicado: null,
    imagenUrl: null,
    fechaCreacion: new Date("2026-08-01"),
    ...overrides,
  });
}

describe("Transaccion", () => {
  describe("marcarComoGastoHormiga (RF-38, D-08)", () => {
    it("marca un egreso menor al umbral y guarda el snapshot del umbral usado", () => {
      const transaccion = crearTransaccion({ monto: 8 });

      transaccion.marcarComoGastoHormiga(UMBRAL);

      expect(transaccion.esGastoHormiga).toBe(true);
      expect(transaccion.umbralHormigaAplicado).toBe(UMBRAL);
    });

    it("marca un egreso exactamente igual al umbral (RF-38 dice 'igual o menor')", () => {
      const transaccion = crearTransaccion({ monto: UMBRAL });

      transaccion.marcarComoGastoHormiga(UMBRAL);

      expect(transaccion.esGastoHormiga).toBe(true);
    });

    it("no marca un egreso mayor al umbral, pero igual guarda el umbral evaluado", () => {
      const transaccion = crearTransaccion({ monto: 40 });

      transaccion.marcarComoGastoHormiga(UMBRAL);

      expect(transaccion.esGastoHormiga).toBe(false);
      expect(transaccion.umbralHormigaAplicado).toBe(UMBRAL);
    });

    it("nunca aplica a ingresos, aunque el monto sea menor al umbral (RF-38)", () => {
      const transaccion = crearTransaccion({ tipo: "ingreso", monto: 5 });

      transaccion.marcarComoGastoHormiga(UMBRAL);

      expect(transaccion.esGastoHormiga).toBe(false);
      expect(transaccion.umbralHormigaAplicado).toBeNull();
    });

    it("borra la marca previa si la transacción se edita de egreso a ingreso (RF-13, RF-38)", () => {
      const transaccion = crearTransaccion({ tipo: "egreso", monto: 8 });
      transaccion.marcarComoGastoHormiga(UMBRAL);
      expect(transaccion.esGastoHormiga).toBe(true);

      transaccion.tipo = "ingreso";
      transaccion.marcarComoGastoHormiga(UMBRAL);

      expect(transaccion.esGastoHormiga).toBe(false);
      expect(transaccion.umbralHormigaAplicado).toBeNull();
    });
  });

  describe("indicarCriterioUsuario (RF-55, D-15)", () => {
    it("registra el criterio del estudiante sin alterar la marca automática", () => {
      // Caso real: un pasaje de S/ 2 queda marcado por el umbral, pero el
      // estudiante lo considera un gasto necesario.
      const pasaje = crearTransaccion({ monto: 2 });
      pasaje.marcarComoGastoHormiga(UMBRAL);
      expect(pasaje.esGastoHormiga).toBe(true);

      pasaje.indicarCriterioUsuario(false);

      expect(pasaje.esGastoHormigaUsuario).toBe(false);
      expect(pasaje.esGastoHormiga).toBe(true); // la marca de la tesis no se toca
    });

    it("permite marcar como hormiga un gasto que el umbral no marcó", () => {
      const antojo = crearTransaccion({ monto: 25 });
      antojo.marcarComoGastoHormiga(UMBRAL);
      expect(antojo.esGastoHormiga).toBe(false);

      antojo.indicarCriterioUsuario(true);

      expect(antojo.esGastoHormigaUsuario).toBe(true);
      expect(antojo.esGastoHormiga).toBe(false);
    });

    it("permite volver al estado 'sin opinión' con null (CA06)", () => {
      const transaccion = crearTransaccion();
      transaccion.indicarCriterioUsuario(true);

      transaccion.indicarCriterioUsuario(null);

      expect(transaccion.esGastoHormigaUsuario).toBeNull();
    });

    it("no aplica a ingresos", () => {
      const ingreso = crearTransaccion({ tipo: "ingreso" });

      ingreso.indicarCriterioUsuario(true);

      expect(ingreso.esGastoHormigaUsuario).toBeNull();
    });
  });

  describe("difiereDelCriterioAutomatico (D-15)", () => {
    it("es false si el estudiante no opinó (null no es un desacuerdo)", () => {
      const transaccion = crearTransaccion({ monto: 2 });
      transaccion.marcarComoGastoHormiga(UMBRAL);

      expect(transaccion.difiereDelCriterioAutomatico()).toBe(false);
    });

    it("es true cuando el estudiante contradice a la marca automática", () => {
      const pasaje = crearTransaccion({ monto: 2 });
      pasaje.marcarComoGastoHormiga(UMBRAL);
      pasaje.indicarCriterioUsuario(false);

      expect(pasaje.difiereDelCriterioAutomatico()).toBe(true);
    });

    it("es false cuando ambos coinciden", () => {
      const transaccion = crearTransaccion({ monto: 3 });
      transaccion.marcarComoGastoHormiga(UMBRAL);
      transaccion.indicarCriterioUsuario(true);

      expect(transaccion.difiereDelCriterioAutomatico()).toBe(false);
    });
  });

  describe("perteneceA (RF-50, D-05)", () => {
    it("reconoce a su propietario", () => {
      expect(crearTransaccion().perteneceA("usuario-1")).toBe(true);
    });

    it("rechaza a cualquier otro usuario", () => {
      expect(crearTransaccion().perteneceA("usuario-2")).toBe(false);
    });
  });

  describe("esMovimientoDeAhorro (D-16)", () => {
    it("es false sin meta vinculada (consumo corriente)", () => {
      expect(crearTransaccion({ metaAhorroId: null }).esMovimientoDeAhorro()).toBe(false);
    });

    it("es true con meta vinculada, tanto para aportes como para retiros", () => {
      expect(
        crearTransaccion({ metaAhorroId: "meta-1", tipo: "egreso" }).esMovimientoDeAhorro(),
      ).toBe(true);
      expect(
        crearTransaccion({ metaAhorroId: "meta-1", tipo: "ingreso" }).esMovimientoDeAhorro(),
      ).toBe(true);
    });
  });

  /**
   * Regresión de un bug real encontrado en la revisión de Sprint 3: apartar
   * S/ 10 en una meta se marcaba como gasto hormiga y contaminaba el
   * indicador central de la tesis (RF-39). Ver ADR D-16.
   */
  describe("marcarComoGastoHormiga con movimientos de ahorro (D-16)", () => {
    it("NO marca un aporte a una meta, aunque el monto esté bajo el umbral", () => {
      const aporte = crearTransaccion({ metaAhorroId: "meta-1", monto: 10, tipo: "egreso" });

      aporte.marcarComoGastoHormiga(UMBRAL);

      expect(aporte.esGastoHormiga).toBe(false);
      expect(aporte.umbralHormigaAplicado).toBeNull();
    });

    it("borra la marca si una transacción marcada se vincula después a una meta (RF-13)", () => {
      const transaccion = crearTransaccion({ monto: 10, tipo: "egreso" });
      transaccion.marcarComoGastoHormiga(UMBRAL);
      expect(transaccion.esGastoHormiga).toBe(true);

      transaccion.metaAhorroId = "meta-1"; // el estudiante la reasigna a su meta
      transaccion.marcarComoGastoHormiga(UMBRAL);

      expect(transaccion.esGastoHormiga).toBe(false);
      expect(transaccion.umbralHormigaAplicado).toBeNull();
    });

    it("vuelve a evaluarla como consumo si se desvincula de la meta", () => {
      const transaccion = crearTransaccion({ metaAhorroId: "meta-1", monto: 10, tipo: "egreso" });
      transaccion.marcarComoGastoHormiga(UMBRAL);
      expect(transaccion.esGastoHormiga).toBe(false);

      transaccion.metaAhorroId = null; // ya no era para la meta
      transaccion.marcarComoGastoHormiga(UMBRAL);

      expect(transaccion.esGastoHormiga).toBe(true);
      expect(transaccion.umbralHormigaAplicado).toBe(UMBRAL);
    });
  });
});

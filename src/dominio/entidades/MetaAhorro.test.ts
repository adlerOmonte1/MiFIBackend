import { MetaAhorro, type MetaAhorroProps } from "./MetaAhorro";

function crearMeta(overrides?: Partial<MetaAhorroProps>) {
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

describe("MetaAhorro", () => {
  describe("perteneceA (RF-50, D-05)", () => {
    it("es true si el usuarioId coincide con el dueño", () => {
      expect(crearMeta().perteneceA("usuario-1")).toBe(true);
    });

    it("es false para cualquier otro usuario", () => {
      expect(crearMeta().perteneceA("usuario-2")).toBe(false);
    });
  });

  describe("tieneFechaLimite (D-14)", () => {
    it("es false cuando fechaLimite es null", () => {
      expect(crearMeta({ fechaLimite: null }).tieneFechaLimite()).toBe(false);
    });

    it("es true cuando hay fechaLimite", () => {
      expect(crearMeta({ fechaLimite: new Date("2026-12-31") }).tieneFechaLimite()).toBe(true);
    });
  });

  describe("calcularMontoAhorrado (RF-33 — modelo de alcancía)", () => {
    it("suma los egresos vinculados (aportes) menos los ingresos vinculados (retiros)", () => {
      const meta = crearMeta();

      expect(meta.calcularMontoAhorrado(500, 200)).toBe(300);
    });

    it("nunca es negativo, aunque los retiros superen los aportes", () => {
      const meta = crearMeta();

      expect(meta.calcularMontoAhorrado(100, 300)).toBe(0);
    });

    it("es 0 sin transacciones vinculadas (FE1)", () => {
      const meta = crearMeta();

      expect(meta.calcularMontoAhorrado(0, 0)).toBe(0);
    });
  });

  describe("calcularProgreso (RF-33, RF-34)", () => {
    it("calcula el porcentaje respecto al monto objetivo", () => {
      const meta = crearMeta({ montoObjetivo: 2000 });

      expect(meta.calcularProgreso(500)).toBe(25);
    });

    it("nunca supera 100% aunque el ahorrado exceda el objetivo (FA1)", () => {
      const meta = crearMeta({ montoObjetivo: 2000 });

      expect(meta.calcularProgreso(3000)).toBe(100);
    });

    it("es 0 sin nada ahorrado", () => {
      const meta = crearMeta({ montoObjetivo: 2000 });

      expect(meta.calcularProgreso(0)).toBe(0);
    });
  });

  describe("estadoVisible", () => {
    it("es 'activa' mientras no se cumplió el objetivo", () => {
      const meta = crearMeta({ montoObjetivo: 2000, estado: "activa" });

      expect(meta.estadoVisible(500)).toBe("activa");
    });

    it("es 'cumplida' cuando el ahorrado alcanza el objetivo, sin mutar el estado persistido", () => {
      const meta = crearMeta({ montoObjetivo: 2000, estado: "activa" });

      expect(meta.estadoVisible(2000)).toBe("cumplida");
      expect(meta.estado).toBe("activa");
    });

    it("'inactiva' es definitivo, aunque el ahorrado alcance el objetivo", () => {
      const meta = crearMeta({ montoObjetivo: 2000, estado: "inactiva" });

      expect(meta.estadoVisible(2000)).toBe("inactiva");
    });
  });
});

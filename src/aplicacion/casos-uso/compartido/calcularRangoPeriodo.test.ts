import { calcularRangoPeriodo } from "./calcularRangoPeriodo";

function soloFecha(d: Date): string {
  return d.toISOString().slice(0, 10);
}

describe("calcularRangoPeriodo (RF-41)", () => {
  describe("mes", () => {
    it("devuelve el primer y último día del mes de la fecha de referencia", () => {
      const { fechaInicio, fechaFin } = calcularRangoPeriodo("mes", new Date("2026-08-15"));

      expect(soloFecha(fechaInicio)).toBe("2026-08-01");
      expect(soloFecha(fechaFin)).toBe("2026-08-31");
    });

    it("un mes de 28 días (febrero, no bisiesto) calcula el último día correcto", () => {
      const { fechaFin } = calcularRangoPeriodo("mes", new Date("2027-02-10"));

      expect(soloFecha(fechaFin)).toBe("2027-02-28");
    });

    it("diciembre no se desborda hacia el año siguiente", () => {
      const { fechaInicio, fechaFin } = calcularRangoPeriodo("mes", new Date("2026-12-25"));

      expect(soloFecha(fechaInicio)).toBe("2026-12-01");
      expect(soloFecha(fechaFin)).toBe("2026-12-31");
    });
  });

  describe("semana", () => {
    it("un miércoles cae dentro de lunes a domingo de esa misma semana", () => {
      // 2026-08-12 es un miércoles.
      const { fechaInicio, fechaFin } = calcularRangoPeriodo("semana", new Date("2026-08-12"));

      expect(soloFecha(fechaInicio)).toBe("2026-08-10"); // lunes
      expect(soloFecha(fechaFin)).toBe("2026-08-16"); // domingo
    });

    it("un domingo pertenece a la semana que empezó el lunes anterior (caso borde de getDay() === 0)", () => {
      // 2026-08-16 es domingo.
      const { fechaInicio, fechaFin } = calcularRangoPeriodo("semana", new Date("2026-08-16"));

      expect(soloFecha(fechaInicio)).toBe("2026-08-10");
      expect(soloFecha(fechaFin)).toBe("2026-08-16");
    });

    it("una semana puede cruzar de un mes a otro sin romperse", () => {
      // 2026-08-31 es lunes.
      const { fechaInicio, fechaFin } = calcularRangoPeriodo("semana", new Date("2026-08-31"));

      expect(soloFecha(fechaInicio)).toBe("2026-08-31");
      expect(soloFecha(fechaFin)).toBe("2026-09-06");
    });
  });

  it("usa la fecha actual (en UTC) si no se pasa fechaReferencia", () => {
    const { fechaInicio, fechaFin } = calcularRangoPeriodo("mes");
    const ahora = new Date();

    expect(fechaInicio.getUTCMonth()).toBe(ahora.getUTCMonth());
    expect(fechaFin.getUTCMonth()).toBe(ahora.getUTCMonth());
  });
});

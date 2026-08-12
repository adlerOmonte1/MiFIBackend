import { MetaAhorro } from "../../dominio/entidades/MetaAhorro";
import type { MetaAhorroConProgreso } from "../../aplicacion/casos-uso/compartido/calcularProgresoMeta";
import { aRespuestaMetaAhorro } from "./metaAhorroResponse";

const CAMPOS_DEL_CONTRATO = [
  "id",
  "nombre",
  "montoObjetivo",
  "fechaLimite",
  "estado",
  "montoAhorrado",
  "porcentajeCumplimiento",
  "fechaCreacion",
];

function crearResultado(overrides?: Partial<MetaAhorroConProgreso>): MetaAhorroConProgreso {
  return {
    meta: new MetaAhorro({
      id: "meta-1",
      usuarioId: "usuario-1",
      nombre: "Celular",
      montoObjetivo: 2000,
      fechaLimite: new Date("2026-12-31T00:00:00.000Z"),
      estado: "activa",
      fechaCreacion: new Date("2026-01-01T10:00:00.000Z"),
    }),
    montoAhorrado: 300,
    porcentajeCumplimiento: 15,
    estado: "activa",
    ...overrides,
  };
}

describe("aRespuestaMetaAhorro", () => {
  it("devuelve exactamente los campos que declara el contrato, ni más ni menos", () => {
    const respuesta = aRespuestaMetaAhorro(crearResultado());

    expect(Object.keys(respuesta).sort()).toEqual([...CAMPOS_DEL_CONTRATO].sort());
  });

  it("nunca expone usuarioId", () => {
    const respuesta = aRespuestaMetaAhorro(crearResultado()) as Record<string, unknown>;

    expect(respuesta["usuarioId"]).toBeUndefined();
  });

  it("sirve fechaLimite como YYYY-MM-DD", () => {
    const respuesta = aRespuestaMetaAhorro(crearResultado());

    expect(respuesta.fechaLimite).toBe("2026-12-31");
  });

  it("fechaLimite es null cuando la meta no tiene fecha límite (D-14)", () => {
    const resultado = crearResultado({
      meta: new MetaAhorro({
        id: "meta-1",
        usuarioId: "usuario-1",
        nombre: "Fondo de emergencia",
        montoObjetivo: 5000,
        fechaLimite: null,
        estado: "activa",
        fechaCreacion: new Date("2026-01-01"),
      }),
    });

    expect(aRespuestaMetaAhorro(resultado).fechaLimite).toBeNull();
  });

  it("usa el estado calculado (estadoVisible), no el estado crudo de la entidad", () => {
    const resultado = crearResultado({ estado: "cumplida" });

    expect(aRespuestaMetaAhorro(resultado).estado).toBe("cumplida");
  });
});

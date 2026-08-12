import { Transaccion } from "../../dominio/entidades/Transaccion";
import { aRespuestaTransaccion } from "./transaccionResponse";

/**
 * Campos que docs/openapi.yaml declara en components.schemas.Transaccion
 * (TransaccionInput + los propios). Si el contrato cambia, esta lista y el
 * mapeador cambian juntos.
 */
const CAMPOS_DEL_CONTRATO = [
  "id",
  "monto",
  "tipo",
  "categoriaId",
  "metaAhorroId",
  "fecha",
  "esGastoHormigaUsuario",
  "origen",
  "esGastoHormiga",
  "umbralHormigaAplicado",
  "imagenUrl",
  "fechaCreacion",
];

function crearTransaccion(): Transaccion {
  return new Transaccion({
    id: "trx-1",
    usuarioId: "usuario-1",
    categoriaId: "cat-1",
    metaAhorroId: null,
    monto: 25.5,
    tipo: "egreso",
    fecha: new Date("2026-08-10T00:00:00.000Z"),
    origen: "manual",
    esGastoHormiga: true,
    esGastoHormigaUsuario: null,
    umbralHormigaAplicado: 30,
    imagenUrl: null,
    fechaCreacion: new Date("2026-08-10T15:30:00.000Z"),
  });
}

describe("aRespuestaTransaccion", () => {
  it("devuelve exactamente los campos que declara el contrato, ni más ni menos", () => {
    const respuesta = aRespuestaTransaccion(crearTransaccion());

    expect(Object.keys(respuesta).sort()).toEqual([...CAMPOS_DEL_CONTRATO].sort());
  });

  it("nunca expone usuarioId (sale del token, no de la respuesta)", () => {
    const respuesta = aRespuestaTransaccion(crearTransaccion()) as Record<string, unknown>;

    expect(respuesta["usuarioId"]).toBeUndefined();
  });

  it("sirve fecha como YYYY-MM-DD sin corrimiento de día", () => {
    const respuesta = aRespuestaTransaccion(crearTransaccion());

    expect(respuesta.fecha).toBe("2026-08-10");
  });
});

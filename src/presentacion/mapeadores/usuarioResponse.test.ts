import { Usuario } from "../../dominio/entidades/Usuario";
import { aRespuestaUsuario } from "./usuarioResponse";

/**
 * Campos que docs/openapi.yaml declara en components.schemas.Usuario.
 * Si el contrato cambia, esta lista y el mapeador cambian juntos.
 */
const CAMPOS_DEL_CONTRATO = [
  "id",
  "nombre",
  "correo",
  "rol",
  "consentimientoAceptado",
  "fechaConsentimiento",
  "versionConsentimiento",
  "fechaRegistro",
];

function crearUsuario(): Usuario {
  return new Usuario({
    id: "usuario-1",
    nombre: "Ana Torres",
    correo: "ana@unmsm.pe",
    passwordHash: "hash-secreto-que-nunca-debe-salir",
    rol: "estudiante",
    intentosFallidos: 3,
    bloqueadoHasta: new Date("2026-01-02"),
    consentimientoAceptado: true,
    fechaConsentimiento: new Date("2026-01-01"),
    versionConsentimiento: "v1.0",
    fechaRegistro: new Date("2026-01-01"),
  });
}

describe("aRespuestaUsuario", () => {
  it("devuelve exactamente los campos que declara el contrato, ni más ni menos", () => {
    const respuesta = aRespuestaUsuario(crearUsuario());

    expect(Object.keys(respuesta).sort()).toEqual([...CAMPOS_DEL_CONTRATO].sort());
  });

  it("nunca expone passwordHash ni el estado interno de bloqueo (D-02)", () => {
    const respuesta = aRespuestaUsuario(crearUsuario()) as Record<string, unknown>;

    expect(respuesta["passwordHash"]).toBeUndefined();
    expect(respuesta["intentosFallidos"]).toBeUndefined();
    expect(respuesta["bloqueadoHasta"]).toBeUndefined();
    expect(JSON.stringify(respuesta)).not.toContain("hash-secreto");
  });
});

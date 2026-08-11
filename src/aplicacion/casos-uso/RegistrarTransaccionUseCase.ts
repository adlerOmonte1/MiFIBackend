import { Transaccion, type TipoTransaccion } from "../../dominio/entidades/Transaccion";
import type { ITransaccionRepository } from "../../dominio/repositorios/ITransaccionRepository";

export interface DatosRegistroTransaccion {
  usuarioId: string;
  categoriaId: string;
  monto: number;
  tipo: TipoTransaccion;
  fecha: Date;
}

/**
 * RF-09 a RF-11, RF-38 — UC-TRX-01.
 *
 * Pendiente a propósito, no un olvido: no acepta `metaAhorroId` todavía
 * (Sprint 3) ni valida que `categoriaId` pertenezca al usuario o sea
 * predefinida (falta ICategoriaRepository) — ver auditoría de seguridad,
 * hallazgos #6 y #7. Cerrar antes de exponer el endpoint HTTP (Paso 6).
 */
export class RegistrarTransaccionUseCase {
  constructor(
    private readonly transaccionRepository: ITransaccionRepository,
    /** RF-38, D-08 — resuelto en la composición desde variable de entorno, nunca hardcodeado. */
    private readonly umbralGastoHormiga: number,
  ) {}

  async ejecutar(datos: DatosRegistroTransaccion): Promise<Transaccion> {
    // Entidad "borrador" solo para reusar la regla de negocio de
    // marcarComoGastoHormiga() (Paso 2) — el id real lo asigna el
    // repositorio al persistir, este se descarta.
    const borrador = new Transaccion({
      id: "",
      usuarioId: datos.usuarioId,
      categoriaId: datos.categoriaId,
      metaAhorroId: null,
      monto: datos.monto,
      tipo: datos.tipo,
      fecha: datos.fecha,
      origen: "manual",
      esGastoHormiga: false,
      esGastoHormigaUsuario: null,
      umbralHormigaAplicado: null,
      imagenUrl: null,
      fechaCreacion: new Date(),
    });
    borrador.marcarComoGastoHormiga(this.umbralGastoHormiga);

    return this.transaccionRepository.crear({
      usuarioId: datos.usuarioId,
      categoriaId: datos.categoriaId,
      metaAhorroId: null,
      monto: datos.monto,
      tipo: datos.tipo,
      fecha: datos.fecha,
      origen: "manual",
      esGastoHormiga: borrador.esGastoHormiga,
      umbralHormigaAplicado: borrador.umbralHormigaAplicado,
      imagenUrl: null,
    });
  }
}

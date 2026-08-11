import { Transaccion, type TipoTransaccion } from "../../dominio/entidades/Transaccion";
import type { ICategoriaRepository } from "../../dominio/repositorios/ICategoriaRepository";
import type { ITransaccionRepository } from "../../dominio/repositorios/ITransaccionRepository";
import { CategoriaNoEncontradaError } from "../errores/ErroresAplicacion";

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
 * (Sprint 3) — ver auditoría de seguridad, hallazgo #6. Cerrar antes de
 * exponer el endpoint HTTP (Paso 6).
 */
export class RegistrarTransaccionUseCase {
  constructor(
    private readonly transaccionRepository: ITransaccionRepository,
    private readonly categoriaRepository: ICategoriaRepository,
    /** RF-38, D-08 — resuelto en la composición desde variable de entorno, nunca hardcodeado. */
    private readonly umbralGastoHormiga: number,
  ) {}

  async ejecutar(datos: DatosRegistroTransaccion): Promise<Transaccion> {
    // RF-36, RF-50 — anti-IDOR: mismo error si no existe o si es la
    // categoría propia de otro estudiante (hallazgo #7 de la auditoría).
    const categoria = await this.categoriaRepository.buscarPorId(datos.categoriaId);
    if (!categoria?.puedeSerUsadaPor(datos.usuarioId)) {
      throw new CategoriaNoEncontradaError();
    }

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

import type { TipoTransaccion, Transaccion } from "../../dominio/entidades/Transaccion";
import type { ICategoriaRepository } from "../../dominio/repositorios/ICategoriaRepository";
import type { IMetaAhorroRepository } from "../../dominio/repositorios/IMetaAhorroRepository";
import type { ITransaccionRepository } from "../../dominio/repositorios/ITransaccionRepository";
import {
  CategoriaNoEncontradaError,
  MetaAhorroInactivaError,
  MetaAhorroNoEncontradaError,
  TransaccionNoEncontradaError,
} from "../errores/ErroresAplicacion";

export interface DatosEdicionTransaccion {
  transaccionId: string;
  usuarioId: string;
  categoriaId: string;
  /** RF-33 — reemplazo completo como el resto de los campos: undefined/null = sin meta (desvincula). */
  metaAhorroId?: string | null;
  monto: number;
  tipo: TipoTransaccion;
  fecha: Date;
  /** RF-55, D-15. undefined = no tocar; null = volver a "sin opinión". */
  esGastoHormigaUsuario?: boolean | null;
}

/** RF-13, RF-15 — UC-TRX-02. Reemplazo completo (mismo TransaccionInput que crear). */
export class EditarTransaccionUseCase {
  constructor(
    private readonly transaccionRepository: ITransaccionRepository,
    private readonly categoriaRepository: ICategoriaRepository,
    private readonly metaAhorroRepository: IMetaAhorroRepository,
    /** RF-38, D-08 — mismo umbral vigente que al crear (congelado durante la medición). */
    private readonly umbralGastoHormiga: number,
  ) {}

  async ejecutar(datos: DatosEdicionTransaccion): Promise<Transaccion> {
    const transaccion = await this.transaccionRepository.buscarPorId(datos.transaccionId);
    // RF-50, D-05 — mismo error si no existe o si es de otro usuario.
    if (!transaccion || !transaccion.perteneceA(datos.usuarioId)) {
      throw new TransaccionNoEncontradaError();
    }

    // RF-36, RF-50 — misma validación anti-IDOR que al crear (hallazgo #7).
    const categoria = await this.categoriaRepository.buscarPorId(datos.categoriaId);
    if (!categoria?.puedeSerUsadaPor(datos.usuarioId)) {
      throw new CategoriaNoEncontradaError();
    }

    const metaAhorroId = datos.metaAhorroId ?? null;
    if (metaAhorroId !== null) {
      // RF-33, RF-50 — mismo error anti-IDOR que categoriaId si no existe o es de otro.
      const meta = await this.metaAhorroRepository.buscarPorId(metaAhorroId);
      if (!meta || !meta.perteneceA(datos.usuarioId)) {
        throw new MetaAhorroNoEncontradaError();
      }
      // RF-32/AHO-01 — una meta inactiva ya no admite aportes ni retiros nuevos.
      if (meta.estado === "inactiva") {
        throw new MetaAhorroInactivaError();
      }
    }

    transaccion.categoriaId = datos.categoriaId;
    transaccion.metaAhorroId = metaAhorroId;
    transaccion.monto = datos.monto;
    transaccion.tipo = datos.tipo;
    transaccion.fecha = datos.fecha;

    // Se reevalúa siempre, no solo si monto/tipo cambiaron: es más simple y
    // correcto que comparar contra el valor anterior, y es lo que cubre el
    // caso egreso -> ingreso por error de tipeo (RF-13, RF-38 — fix del Paso 2).
    transaccion.marcarComoGastoHormiga(this.umbralGastoHormiga);

    if (datos.esGastoHormigaUsuario !== undefined) {
      transaccion.indicarCriterioUsuario(datos.esGastoHormigaUsuario);
    }

    await this.transaccionRepository.actualizar(transaccion);
    return transaccion;
  }
}

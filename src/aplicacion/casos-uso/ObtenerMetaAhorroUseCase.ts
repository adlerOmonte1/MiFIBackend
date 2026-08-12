import type { IMetaAhorroRepository } from "../../dominio/repositorios/IMetaAhorroRepository";
import type { ITransaccionRepository } from "../../dominio/repositorios/ITransaccionRepository";
import { MetaAhorroNoEncontradaError } from "../errores/ErroresAplicacion";
import {
  calcularProgresoMeta,
  type MetaAhorroConProgreso,
} from "./compartido/calcularProgresoMeta";

export interface DatosObtenerMetaAhorro {
  metaAhorroId: string;
  usuarioId: string;
}

/** GET /metas-ahorro/{id} — UC-AHO-02. */
export class ObtenerMetaAhorroUseCase {
  constructor(
    private readonly metaAhorroRepository: IMetaAhorroRepository,
    private readonly transaccionRepository: ITransaccionRepository,
  ) {}

  async ejecutar(datos: DatosObtenerMetaAhorro): Promise<MetaAhorroConProgreso> {
    const meta = await this.metaAhorroRepository.buscarPorId(datos.metaAhorroId);
    // RF-50, D-05 — mismo error si no existe o si es de otro usuario.
    if (!meta || !meta.perteneceA(datos.usuarioId)) {
      throw new MetaAhorroNoEncontradaError();
    }
    return calcularProgresoMeta(meta, this.transaccionRepository);
  }
}

import type { Transaccion } from "../../dominio/entidades/Transaccion";
import type { ITransaccionRepository } from "../../dominio/repositorios/ITransaccionRepository";
import { TransaccionNoEncontradaError } from "../errores/ErroresAplicacion";

export interface DatosObtenerTransaccion {
  transaccionId: string;
  usuarioId: string;
}

/** GET /transacciones/{id} — UC-TRX-01. */
export class ObtenerTransaccionUseCase {
  constructor(private readonly transaccionRepository: ITransaccionRepository) {}

  async ejecutar(datos: DatosObtenerTransaccion): Promise<Transaccion> {
    const transaccion = await this.transaccionRepository.buscarPorId(datos.transaccionId);
    // RF-50, D-05 — mismo error si no existe o si es de otro usuario.
    if (!transaccion || !transaccion.perteneceA(datos.usuarioId)) {
      throw new TransaccionNoEncontradaError();
    }
    return transaccion;
  }
}

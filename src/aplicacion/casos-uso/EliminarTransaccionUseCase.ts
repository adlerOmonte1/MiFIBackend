import type { ITransaccionRepository } from "../../dominio/repositorios/ITransaccionRepository";
import { TransaccionNoEncontradaError } from "../errores/ErroresAplicacion";

export interface DatosEliminacionTransaccion {
  transaccionId: string;
  usuarioId: string;
}

/**
 * RF-14, RF-15 — UC-TRX-02. La confirmación ("¿estás seguro?") ocurre en el
 * cliente antes de llamar acá (detalle de UC-TRX-02) — este caso de uso
 * elimina directamente, sin pedir confirmación de nuevo.
 */
export class EliminarTransaccionUseCase {
  constructor(private readonly transaccionRepository: ITransaccionRepository) {}

  async ejecutar(datos: DatosEliminacionTransaccion): Promise<void> {
    const transaccion = await this.transaccionRepository.buscarPorId(datos.transaccionId);
    // RF-50, D-05 — mismo error si no existe o si es de otro usuario.
    if (!transaccion || !transaccion.perteneceA(datos.usuarioId)) {
      throw new TransaccionNoEncontradaError();
    }

    await this.transaccionRepository.eliminar(datos.transaccionId);
  }
}

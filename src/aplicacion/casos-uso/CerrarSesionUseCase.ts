import type { ISesionRepository } from "../../dominio/repositorios/ISesionRepository";

/** RF-08 — UC-AUT-02 (logout). */
export class CerrarSesionUseCase {
  constructor(private readonly sesionRepository: ISesionRepository) {}

  async ejecutar(jti: string): Promise<void> {
    await this.sesionRepository.revocarPorJti(jti);
  }
}

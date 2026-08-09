import bcrypt from "bcryptjs";
import type { IHashService } from "../../dominio/servicios/IHashService";

/** D-02 — bcrypt, factor de costo 12. */
const FACTOR_COSTO = 12;

export class BcryptHashService implements IHashService {
  async hashear(passwordPlano: string): Promise<string> {
    return bcrypt.hash(passwordPlano, FACTOR_COSTO);
  }

  async comparar(passwordPlano: string, hash: string): Promise<boolean> {
    return bcrypt.compare(passwordPlano, hash);
  }
}

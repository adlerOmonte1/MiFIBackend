/**
 * Abstracción del algoritmo de hash de contraseñas (D-02: bcrypt, costo 12).
 * El dominio depende de esta interfaz, nunca de bcrypt directamente.
 */
export interface IHashService {
  hashear(passwordPlano: string): Promise<string>;
  comparar(passwordPlano: string, hash: string): Promise<boolean>;
}

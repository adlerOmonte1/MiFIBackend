import type { Request, Response } from "express";
import { z } from "zod";
import type { AceptarConsentimientoUseCase } from "../../aplicacion/casos-uso/AceptarConsentimientoUseCase";
import { aRespuestaUsuario } from "../mapeadores/usuarioResponse";

const esquemaConsentimiento = z.object({
  versionTexto: z.string().min(1), // RF-48
});

export class ConsentimientoController {
  constructor(private readonly aceptarConsentimientoUseCase: AceptarConsentimientoUseCase) {}

  aceptar = async (req: Request, res: Response): Promise<void> => {
    const { versionTexto } = esquemaConsentimiento.parse(req.body);

    const usuario = await this.aceptarConsentimientoUseCase.ejecutar({
      usuarioId: req.usuarioId as string, // ver nota en AuthController
      versionTexto,
    });

    // El contrato (docs/openapi.yaml) promete el esquema Usuario completo.
    res.status(200).json(aRespuestaUsuario(usuario));
  };
}

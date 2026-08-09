import type { Request, Response } from "express";
import { z } from "zod";
import type { AceptarConsentimientoUseCase } from "../../aplicacion/casos-uso/AceptarConsentimientoUseCase";

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

    res.status(200).json({
      id: usuario.id,
      consentimientoAceptado: usuario.consentimientoAceptado,
      fechaConsentimiento: usuario.fechaConsentimiento,
      versionConsentimiento: usuario.versionConsentimiento,
    });
  };
}

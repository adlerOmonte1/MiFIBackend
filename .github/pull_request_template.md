## Qué cambia y por qué

<!-- Resume el cambio. Si implementa un requisito, referencia su código. -->

**RF/HU/UC relacionados:** <!-- ej. RF-09 a RF-12, UC-TRX-01 -->

## Checklist (ver skill `mifi-checklist-pr` para el detalle)

- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` pasan localmente
- [ ] Si toqué un endpoint, `docs/openapi.yaml` quedó sincronizado con el código
- [ ] Si agregué una regla de negocio nueva, quedó documentada en `docs/RequerimientosFuncionales.md` (o adenda)
- [ ] Todo endpoint sobre un recurso de usuario usa el `usuarioId` del JWT, nunca uno recibido del cliente
- [ ] Recurso ajeno responde 404 (anti-IDOR, D-05), no 403 ni 200
- [ ] Hay prueba unitaria del caso de uso (camino feliz + al menos un error del RF)
- [ ] Sin secretos ni credenciales en el diff

## Cómo probarlo

<!-- Pasos para que quien revise pueda verificarlo, o comando(s) puntuales. -->

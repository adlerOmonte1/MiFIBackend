---
name: mifi-checklist-pr
description: Checklist previo a cerrar una tarea, hacer el commit final o abrir un Pull Request en MiFiBackend — cubre SOLID, trazabilidad RF/HU, seguridad anti-IDOR, y que lint/typecheck/tests/build pasen limpios. Úsalo antes de dar por terminada una funcionalidad, antes de un commit final, o cuando el usuario pida "revisa esto antes de hacer PR" o "está listo para commitear".
metadata:
  version: "1.1.0"
  proyecto: MiFi
---

# Checklist previo a commit/PR — MiFiBackend

No es un sustituto de `/code-review` ni de `/security-review` — es el
checklist específico de las convenciones de este proyecto. Úsalo además
de esas herramientas, no en lugar de ellas.

## 1. Pipeline de calidad (bloqueante — debe pasar sin errores)

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Si tocaste `prisma/schema.prisma`, además: `npx prisma validate`.

**Ojo con esto:** correr el pipeline local no alcanza si vas a comitear solo
*parte* de lo que cambiaste (commits chicos, un paso a la vez). El pipeline
local corre contra **todo el directorio de trabajo**, no contra lo que
quedó en `git add`. Un archivo puede compilar perfecto en tu máquina y
romper igual en GitHub si te olvidaste de agregarlo al commit — ya pasó
dos veces en este proyecto (`test-utils/fakes.ts` y
`presentacion/tipos/express.d.ts`, un archivo `.d.ts` que ningún `grep
import` detecta porque nadie lo importa explícitamente, TypeScript lo
toma solo). Antes de correr el commit:

- [ ] `grep "^import"` de cada archivo nuevo — ¿todo lo que importa ya
      está comiteado o va en este mismo commit?
- [ ] ¿Hay algún `.d.ts` nuevo (declaración de tipos ambiental, sin
      import explícito en ningún lado) que el código nuevo necesite?
- [ ] Después de `git add`, `git status` — confirmá que lo que quedó en
      verde es *exactamente* lo que pensás que es, ni más ni menos.

## 2. SOLID (ver `mifi-arquitectura-solid` para el detalle de cada uno)

- [ ] ¿Alguna clase nueva mezcla más de una responsabilidad?
- [ ] ¿Algún caso de uso importa una clase concreta de `infraestructura/`
      en vez de una interfaz de `dominio/`?
- [ ] ¿Una interfaz nueva quedó demasiado grande (mezcla responsabilidades
      que un consumidor no necesita todas juntas)?

## 3. Trazabilidad y documentación

- [ ] ¿El código nuevo referencia su RF/HU/UC de origen (comentario o
      nombre de caso de uso)?
- [ ] Si tocaste un endpoint, ¿`docs/openapi.yaml` quedó sincronizado?
- [ ] Si agregaste una regla de negocio nueva que no estaba en ningún RF,
      ¿la documentaste en `docs/RequerimientosFuncionales.md` (con una
      adenda si ya se cerraron los RF originales) en vez de dejarla solo
      en el código?

## 4. Seguridad (D-05, D-06, D-09 — ver `docs/README.md §6`)

- [ ] Todo endpoint sobre un recurso de usuario, ¿usa el `usuarioId` del
      JWT, nunca uno recibido del cliente?
- [ ] Si el recurso no pertenece al usuario autenticado, ¿responde 404
      (no 403, no 200 con datos ajenos)?
- [ ] ¿Algún secreto, token o credencial quedó hardcodeado o en un
      archivo que no está en `.gitignore`? (`git status` antes de
      commitear, revisa contenido de archivos nuevos que parezcan
      inocuos)

## 5. Pruebas

- [ ] ¿Hay al menos una prueba unitaria del caso de uso nuevo/modificado?
- [ ] ¿Cubre el camino feliz y al menos un caso de error del RF?
- [ ] Si el endpoint opera sobre un recurso de usuario, ¿hay una prueba
      anti-IDOR (usuario A contra recurso de usuario B → 404)?

## 6. Commit / PR

- Mensaje de commit siguiendo la convención del proyecto (ver
  `CONTRIBUTING.md`): tipo en inglés (`feat`, `fix`, `test`, `docs`,
  `chore`...), descripción en español, referencia al RF/HU cuando aplique.
  Ejemplo: `feat(auth): RF-01 registro de estudiante con validación de correo único`.
- El CI (`.github/workflows/ci.yml`) corre exactamente los mismos pasos
  del punto 1 — si falla localmente, va a fallar en el PR.

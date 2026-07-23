-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" VARCHAR(20) NOT NULL,
    "intentos_fallidos" SMALLINT NOT NULL DEFAULT 0,
    "bloqueado_hasta" TIMESTAMP(3),
    "consentimiento_aceptado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_consentimiento" TIMESTAMP(3),
    "version_consentimiento" VARCHAR(20),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "jti" VARCHAR(64) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "revocada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "es_predefinida" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacciones" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "meta_ahorro_id" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "fecha" DATE NOT NULL,
    "origen" VARCHAR(10) NOT NULL DEFAULT 'manual',
    "es_gasto_hormiga" BOOLEAN NOT NULL DEFAULT false,
    "umbral_hormiga_aplicado" DECIMAL(10,2),
    "imagen_url" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metas_ahorro" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "monto_objetivo" DECIMAL(10,2) NOT NULL,
    "fecha_limite" DATE NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activa',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metas_ahorro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sugerencias_transaccion" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "fecha" DATE NOT NULL,
    "origen" VARCHAR(10) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sugerencias_transaccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conexiones_gmail" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token_acceso" TEXT NOT NULL,
    "token_refresco" TEXT NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',
    "fecha_conexion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conexiones_gmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encuestas_sus" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "respuestas" JSONB NOT NULL,
    "puntaje" DECIMAL(5,2) NOT NULL,
    "fecha_respuesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encuestas_sus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_error" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modulo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "registros_error_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presupuestos_categoria" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "monto_limite" DECIMAL(10,2) NOT NULL,
    "mes" SMALLINT NOT NULL,
    "anio" SMALLINT NOT NULL,

    CONSTRAINT "presupuestos_categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_jti_key" ON "sesiones"("jti");

-- CreateIndex
CREATE INDEX "sesiones_usuario_id_revocada_idx" ON "sesiones"("usuario_id", "revocada");

-- CreateIndex
CREATE INDEX "transacciones_usuario_id_fecha_idx" ON "transacciones"("usuario_id", "fecha");

-- CreateIndex
CREATE INDEX "transacciones_meta_ahorro_id_idx" ON "transacciones"("meta_ahorro_id");

-- CreateIndex
CREATE INDEX "sugerencias_transaccion_usuario_id_estado_idx" ON "sugerencias_transaccion"("usuario_id", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "conexiones_gmail_usuario_id_key" ON "conexiones_gmail"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "encuestas_sus_usuario_id_key" ON "encuestas_sus"("usuario_id");

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_meta_ahorro_id_fkey" FOREIGN KEY ("meta_ahorro_id") REFERENCES "metas_ahorro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metas_ahorro" ADD CONSTRAINT "metas_ahorro_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sugerencias_transaccion" ADD CONSTRAINT "sugerencias_transaccion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conexiones_gmail" ADD CONSTRAINT "conexiones_gmail_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuestas_sus" ADD CONSTRAINT "encuestas_sus_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presupuestos_categoria" ADD CONSTRAINT "presupuestos_categoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presupuestos_categoria" ADD CONSTRAINT "presupuestos_categoria_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

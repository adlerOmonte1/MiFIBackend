-- AlterTable
ALTER TABLE "categorias" ADD COLUMN     "usuario_id" TEXT;

-- AlterTable
ALTER TABLE "metas_ahorro" ALTER COLUMN "fecha_limite" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categorias_usuario_id_nombre_key" ON "categorias"("usuario_id", "nombre");

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;


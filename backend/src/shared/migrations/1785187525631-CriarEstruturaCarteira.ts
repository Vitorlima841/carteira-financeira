import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarEstruturaCarteira1785187525631 implements MigrationInterface {
  name = 'CriarEstruturaCarteira1785187525631';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."tipo_transacao_enum" AS ENUM('DEPOSITO', 'TRANSFERENCIA', 'ESTORNO')`);
    await queryRunner.query(`CREATE TYPE "public"."status_transacao_enum" AS ENUM('PENDENTE', 'CONCLUIDA', 'ESTORNADA', 'FALHOU')`);
    await queryRunner.query(
      `CREATE TABLE "transacoes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tipo" "public"."tipo_transacao_enum" NOT NULL, "status" "public"."status_transacao_enum" NOT NULL DEFAULT 'PENDENTE', "valor" numeric(18,2) NOT NULL, "conta_origem_id" uuid, "conta_destino_id" uuid, "transacao_estornada_id" uuid, "metadados" jsonb, "criado_em" TIMESTAMP NOT NULL DEFAULT now(), "atualizado_em" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_72bf4f6aae74d1dc175bf09e500" UNIQUE ("transacao_estornada_id"), CONSTRAINT "PK_19e05c3d8e87df1545fcc6c8505" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_transacoes_conta_destino_id" ON "transacoes" ("conta_destino_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_transacoes_conta_origem_id" ON "transacoes" ("conta_origem_id") `);
    await queryRunner.query(`CREATE TYPE "public"."direcao_lancamento_enum" AS ENUM('DEBITO', 'CREDITO')`);
    await queryRunner.query(
      `CREATE TABLE "lancamentos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transacao_id" uuid NOT NULL, "conta_id" uuid NOT NULL, "direcao" "public"."direcao_lancamento_enum" NOT NULL, "valor" numeric(18,2) NOT NULL, "criado_em" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_863ece961e659a6e426dcff9d90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_lancamentos_transacao_id" ON "lancamentos" ("transacao_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_lancamentos_conta_id" ON "lancamentos" ("conta_id") `);
    await queryRunner.query(
      `CREATE TABLE "contas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "saldo_cache" numeric(18,2) NOT NULL DEFAULT '0', "moeda" character varying(3) NOT NULL DEFAULT 'BRL', "criado_em" TIMESTAMP NOT NULL DEFAULT now(), "atualizado_em" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_3b256ec1ae4debfee508cd2c4b" UNIQUE ("usuario_id"), CONSTRAINT "PK_f5a347b0829de9a7a38cf1d052f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_contas_usuario_id" ON "contas" ("usuario_id") `);
    await queryRunner.query(
      `CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(150) NOT NULL, "email" character varying(255) NOT NULL, "senha_hash" character varying(255) NOT NULL, "criado_em" TIMESTAMP NOT NULL DEFAULT now(), "atualizado_em" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "transacoes" ADD CONSTRAINT "FK_c2f8e0131e299ea5fbac6399e99" FOREIGN KEY ("conta_origem_id") REFERENCES "contas"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transacoes" ADD CONSTRAINT "FK_773578661142a5c47731855b21c" FOREIGN KEY ("conta_destino_id") REFERENCES "contas"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transacoes" ADD CONSTRAINT "FK_72bf4f6aae74d1dc175bf09e500" FOREIGN KEY ("transacao_estornada_id") REFERENCES "transacoes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lancamentos" ADD CONSTRAINT "FK_11a1ab17569439f4bd6d83547fd" FOREIGN KEY ("transacao_id") REFERENCES "transacoes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lancamentos" ADD CONSTRAINT "FK_8557199511c4b9cde973881d3f1" FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contas" ADD CONSTRAINT "FK_3b256ec1ae4debfee508cd2c4b0" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contas" DROP CONSTRAINT "FK_3b256ec1ae4debfee508cd2c4b0"`);
    await queryRunner.query(`ALTER TABLE "lancamentos" DROP CONSTRAINT "FK_8557199511c4b9cde973881d3f1"`);
    await queryRunner.query(`ALTER TABLE "lancamentos" DROP CONSTRAINT "FK_11a1ab17569439f4bd6d83547fd"`);
    await queryRunner.query(`ALTER TABLE "transacoes" DROP CONSTRAINT "FK_72bf4f6aae74d1dc175bf09e500"`);
    await queryRunner.query(`ALTER TABLE "transacoes" DROP CONSTRAINT "FK_773578661142a5c47731855b21c"`);
    await queryRunner.query(`ALTER TABLE "transacoes" DROP CONSTRAINT "FK_c2f8e0131e299ea5fbac6399e99"`);
    await queryRunner.query(`DROP TABLE "usuarios"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_contas_usuario_id"`);
    await queryRunner.query(`DROP TABLE "contas"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_lancamentos_conta_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_lancamentos_transacao_id"`);
    await queryRunner.query(`DROP TABLE "lancamentos"`);
    await queryRunner.query(`DROP TYPE "public"."direcao_lancamento_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_transacoes_conta_origem_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_transacoes_conta_destino_id"`);
    await queryRunner.query(`DROP TABLE "transacoes"`);
    await queryRunner.query(`DROP TYPE "public"."status_transacao_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tipo_transacao_enum"`);
  }
}

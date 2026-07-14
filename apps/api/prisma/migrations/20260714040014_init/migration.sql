-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'analyst', 'viewer');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('signup', 'login', 'password_reset');

-- CreateEnum
CREATE TYPE "AuthEventType" AS ENUM ('login_success', 'login_failed', 'google_login', 'otp_sent', 'otp_verified', 'password_reset_requested', 'password_reset_completed', 'two_factor_enabled', 'two_factor_disabled', 'logout');

-- CreateEnum
CREATE TYPE "TwoFactorEventType" AS ENUM ('setup_started', 'enabled', 'disabled', 'verified', 'failed_attempt');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('leve', 'moderado', 'grave');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('aprovado', 'rejeitado', 'aguardando');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('rg_falso', 'cnh', 'procuracoes', 'contratos', 'notas_fiscais', 'balancos', 'adulteracoes', 'documentos_ia');

-- CreateEnum
CREATE TYPE "CaseAction" AS ENUM ('bloquear', 'liberar', 'created', 'auto_evaluated');

-- CreateEnum
CREATE TYPE "CorporateCategory" AS ENUM ('empresas', 'socios', 'cpf', 'cnpj', 'pix', 'ip', 'dispositivo', 'telefone', 'contas_bancarias', 'fornecedores', 'outros');

-- CreateEnum
CREATE TYPE "GraphNodeType" AS ENUM ('empresa', 'pessoa', 'banco', 'conta', 'ip', 'dispositivo');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('rede_relacionamentos', 'nos_suspeitos', 'casca_cebola');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('queued', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "AutomationTriggerType" AS ENUM ('congelar_pix_ted');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('triggered', 'confirmed', 'failed');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('pix', 'ted', 'doc', 'boleto');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('baixo', 'medio', 'alto');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('aprovada', 'bloqueada', 'suspeita');

-- CreateEnum
CREATE TYPE "SupplierCategory" AS ENUM ('processos_judiciais', 'protestos_cartorio', 'nfe_fantasmas', 'historico_fiscal', 'fornecedores_suspeitos', 'triangulacao_nfe');

-- CreateEnum
CREATE TYPE "BlockStatus" AS ENUM ('ativo', 'em_analise', 'liberado');

-- CreateEnum
CREATE TYPE "SourceRecordType" AS ENUM ('document_case', 'corporate_entity', 'payment_transaction', 'supplier_alert');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('user', 'assistant');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('briefing', 'question', 'answer', 'system');

-- CreateEnum
CREATE TYPE "UnblockStatus" AS ENUM ('requested', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "RuleAction" AS ENUM ('bloquear', 'revisar', 'alertar');

-- CreateEnum
CREATE TYPE "RuleEventAction" AS ENUM ('created', 'updated', 'activated', 'deactivated', 'deleted');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'analyst',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "google_id" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "email" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "event_type" "AuthEventType" NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_type" "TwoFactorEventType" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_cases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "case_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "CaseStatus" NOT NULL,
    "requester_name" TEXT NOT NULL,
    "requester_email" TEXT NOT NULL,
    "requester_cpf" TEXT NOT NULL,
    "document_url" TEXT,
    "fraud_reason" TEXT,
    "confidence_score" DECIMAL(5,2) NOT NULL,
    "decided_at" TIMESTAMP(3),
    "decided_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_case_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_case_id" UUID NOT NULL,
    "actor_id" UUID,
    "from_status" "CaseStatus",
    "to_status" "CaseStatus" NOT NULL,
    "action" "CaseAction" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_case_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_entities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entity_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "doc_number" TEXT,
    "category" "CorporateCategory" NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "CaseStatus" NOT NULL,
    "layers_count" INTEGER NOT NULL DEFAULT 0,
    "ubo_identified" BOOLEAN NOT NULL DEFAULT false,
    "ubo_name" TEXT,
    "confidence_score" DECIMAL(5,2) NOT NULL,
    "decided_at" TIMESTAMP(3),
    "decided_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corporate_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_entity_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "corporate_entity_id" UUID NOT NULL,
    "actor_id" UUID,
    "from_status" "CaseStatus",
    "to_status" "CaseStatus" NOT NULL,
    "action" "CaseAction" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corporate_entity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph_nodes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "corporate_entity_id" UUID NOT NULL,
    "node_type" "GraphNodeType" NOT NULL,
    "label" TEXT NOT NULL,
    "metadata" JSONB,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,

    CONSTRAINT "graph_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph_edges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "corporate_entity_id" UUID NOT NULL,
    "source_node_id" UUID NOT NULL,
    "target_node_id" UUID NOT NULL,
    "relation_type" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "graph_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph_report_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "corporate_entity_id" UUID NOT NULL,
    "requested_by" UUID,
    "report_type" "ReportType" NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'queued',
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "graph_report_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_triggers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "corporate_entity_id" UUID NOT NULL,
    "triggered_by" UUID,
    "trigger_type" "AutomationTriggerType" NOT NULL,
    "status" "AutomationStatus" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "external_ref" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "description" TEXT,
    "account_age_days" INTEGER,
    "destination" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transaction_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payment_transaction_id" UUID NOT NULL,
    "actor_id" UUID,
    "from_status" "PaymentStatus",
    "to_status" "PaymentStatus" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transaction_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_daily_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "metric_date" DATE NOT NULL,
    "total_transactions" INTEGER NOT NULL,
    "blocked" INTEGER NOT NULL,
    "suspicious" INTEGER NOT NULL,
    "active_automations" INTEGER NOT NULL,

    CONSTRAINT "payment_daily_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "alert_number" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_cnpj" TEXT NOT NULL,
    "category" "SupplierCategory" NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "CaseStatus" NOT NULL,
    "description" TEXT,
    "evidence" JSONB,
    "confidence_score" DECIMAL(5,2) NOT NULL,
    "decided_at" TIMESTAMP(3),
    "decided_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_alert_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplier_alert_id" UUID NOT NULL,
    "actor_id" UUID,
    "from_status" "CaseStatus",
    "to_status" "CaseStatus" NOT NULL,
    "action" "CaseAction" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_alert_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_report_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplier_alert_id" UUID NOT NULL,
    "requested_by" UUID,
    "recipient_email" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'queued',
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_report_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "Severity" NOT NULL,
    "status" "BlockStatus" NOT NULL,
    "source_module_id" UUID,
    "source_record_type" "SourceRecordType" NOT NULL,
    "source_record_id" UUID NOT NULL,
    "liberado_at" TIMESTAMP(3),
    "liberado_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "block_id" UUID NOT NULL,
    "actor_id" UUID,
    "from_status" "BlockStatus",
    "to_status" "BlockStatus" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "block_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_briefings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "block_id" UUID NOT NULL,
    "why_blocked" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "history" JSONB NOT NULL,
    "connections" JSONB NOT NULL,
    "decision_explanation" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generator_version" TEXT NOT NULL DEFAULT 'simulated-v1',

    CONSTRAINT "investigation_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "block_id" UUID NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "content" TEXT NOT NULL,
    "message_type" "MessageType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investigation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unblock_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "block_id" UUID NOT NULL,
    "requested_by" UUID,
    "reason" TEXT,
    "status" "UnblockStatus" NOT NULL DEFAULT 'requested',
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unblock_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "region_risk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "region_code" TEXT NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "incident_count" INTEGER NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "metric_date" DATE NOT NULL,

    CONSTRAINT "region_risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_kpi_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "metric_date" DATE NOT NULL,
    "total_incidents" INTEGER NOT NULL,
    "frauds_detected" INTEGER NOT NULL,
    "active_blocks" INTEGER NOT NULL,
    "estimated_roi" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "executive_kpi_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "module_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "condition_expression" TEXT NOT NULL,
    "threshold" DECIMAL(14,2),
    "output_severity" "Severity" NOT NULL,
    "action" "RuleAction" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" UUID NOT NULL,
    "actor_id" UUID,
    "action" "RuleEventAction" NOT NULL,
    "before_state" JSONB,
    "after_state" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_executions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" UUID NOT NULL,
    "target_record_type" TEXT NOT NULL,
    "target_record_id" UUID NOT NULL,
    "matched" BOOLEAN NOT NULL,
    "evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation_seeds" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "module_key" TEXT NOT NULL,
    "seed_key" TEXT NOT NULL,
    "seed_value" JSONB NOT NULL,

    CONSTRAINT "simulation_seeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_expires_at_idx" ON "refresh_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "otp_codes_email_purpose_expires_at_idx" ON "otp_codes"("email", "purpose", "expires_at");

-- CreateIndex
CREATE INDEX "auth_events_user_id_created_at_idx" ON "auth_events"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "two_factor_events_user_id_created_at_idx" ON "two_factor_events"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "modules_key_key" ON "modules"("key");

-- CreateIndex
CREATE UNIQUE INDEX "document_cases_case_number_key" ON "document_cases"("case_number");

-- CreateIndex
CREATE INDEX "document_cases_status_idx" ON "document_cases"("status");

-- CreateIndex
CREATE INDEX "document_cases_severity_idx" ON "document_cases"("severity");

-- CreateIndex
CREATE INDEX "document_cases_category_idx" ON "document_cases"("category");

-- CreateIndex
CREATE INDEX "document_cases_created_at_idx" ON "document_cases"("created_at");

-- CreateIndex
CREATE INDEX "document_case_events_document_case_id_created_at_idx" ON "document_case_events"("document_case_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "corporate_entities_entity_number_key" ON "corporate_entities"("entity_number");

-- CreateIndex
CREATE INDEX "corporate_entities_status_idx" ON "corporate_entities"("status");

-- CreateIndex
CREATE INDEX "corporate_entities_category_idx" ON "corporate_entities"("category");

-- CreateIndex
CREATE INDEX "corporate_entity_events_corporate_entity_id_created_at_idx" ON "corporate_entity_events"("corporate_entity_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "graph_nodes_corporate_entity_id_idx" ON "graph_nodes"("corporate_entity_id");

-- CreateIndex
CREATE INDEX "graph_edges_corporate_entity_id_idx" ON "graph_edges"("corporate_entity_id");

-- CreateIndex
CREATE INDEX "graph_report_requests_corporate_entity_id_created_at_idx" ON "graph_report_requests"("corporate_entity_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "automation_triggers_corporate_entity_id_created_at_idx" ON "automation_triggers"("corporate_entity_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_external_ref_key" ON "payment_transactions"("external_ref");

-- CreateIndex
CREATE INDEX "payment_transactions_status_created_at_idx" ON "payment_transactions"("status", "created_at");

-- CreateIndex
CREATE INDEX "payment_transactions_type_idx" ON "payment_transactions"("type");

-- CreateIndex
CREATE INDEX "payment_transaction_events_payment_transaction_id_created_a_idx" ON "payment_transaction_events"("payment_transaction_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "payment_daily_metrics_metric_date_key" ON "payment_daily_metrics"("metric_date");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_alerts_alert_number_key" ON "supplier_alerts"("alert_number");

-- CreateIndex
CREATE INDEX "supplier_alerts_status_idx" ON "supplier_alerts"("status");

-- CreateIndex
CREATE INDEX "supplier_alerts_category_idx" ON "supplier_alerts"("category");

-- CreateIndex
CREATE INDEX "supplier_alert_events_supplier_alert_id_created_at_idx" ON "supplier_alert_events"("supplier_alert_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "supplier_report_requests_supplier_alert_id_created_at_idx" ON "supplier_report_requests"("supplier_alert_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "blocks_code_key" ON "blocks"("code");

-- CreateIndex
CREATE INDEX "blocks_status_idx" ON "blocks"("status");

-- CreateIndex
CREATE INDEX "blocks_source_module_id_idx" ON "blocks"("source_module_id");

-- CreateIndex
CREATE INDEX "block_events_block_id_created_at_idx" ON "block_events"("block_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "investigation_briefings_block_id_key" ON "investigation_briefings"("block_id");

-- CreateIndex
CREATE INDEX "investigation_messages_block_id_created_at_idx" ON "investigation_messages"("block_id", "created_at");

-- CreateIndex
CREATE INDEX "unblock_requests_block_id_created_at_idx" ON "unblock_requests"("block_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "region_risk_region_code_metric_date_key" ON "region_risk"("region_code", "metric_date");

-- CreateIndex
CREATE UNIQUE INDEX "executive_kpi_snapshots_metric_date_key" ON "executive_kpi_snapshots"("metric_date");

-- CreateIndex
CREATE INDEX "rules_module_id_idx" ON "rules"("module_id");

-- CreateIndex
CREATE INDEX "rule_events_rule_id_created_at_idx" ON "rule_events"("rule_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "rule_executions_rule_id_evaluated_at_idx" ON "rule_executions"("rule_id", "evaluated_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "simulation_seeds_module_key_seed_key_key" ON "simulation_seeds"("module_key", "seed_key");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_events" ADD CONSTRAINT "auth_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_events" ADD CONSTRAINT "two_factor_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_cases" ADD CONSTRAINT "document_cases_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_case_events" ADD CONSTRAINT "document_case_events_document_case_id_fkey" FOREIGN KEY ("document_case_id") REFERENCES "document_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_case_events" ADD CONSTRAINT "document_case_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_entities" ADD CONSTRAINT "corporate_entities_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_entity_events" ADD CONSTRAINT "corporate_entity_events_corporate_entity_id_fkey" FOREIGN KEY ("corporate_entity_id") REFERENCES "corporate_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_entity_events" ADD CONSTRAINT "corporate_entity_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_nodes" ADD CONSTRAINT "graph_nodes_corporate_entity_id_fkey" FOREIGN KEY ("corporate_entity_id") REFERENCES "corporate_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_corporate_entity_id_fkey" FOREIGN KEY ("corporate_entity_id") REFERENCES "corporate_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_source_node_id_fkey" FOREIGN KEY ("source_node_id") REFERENCES "graph_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_target_node_id_fkey" FOREIGN KEY ("target_node_id") REFERENCES "graph_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_report_requests" ADD CONSTRAINT "graph_report_requests_corporate_entity_id_fkey" FOREIGN KEY ("corporate_entity_id") REFERENCES "corporate_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_report_requests" ADD CONSTRAINT "graph_report_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_triggers" ADD CONSTRAINT "automation_triggers_corporate_entity_id_fkey" FOREIGN KEY ("corporate_entity_id") REFERENCES "corporate_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_triggers" ADD CONSTRAINT "automation_triggers_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction_events" ADD CONSTRAINT "payment_transaction_events_payment_transaction_id_fkey" FOREIGN KEY ("payment_transaction_id") REFERENCES "payment_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction_events" ADD CONSTRAINT "payment_transaction_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_alerts" ADD CONSTRAINT "supplier_alerts_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_alert_events" ADD CONSTRAINT "supplier_alert_events_supplier_alert_id_fkey" FOREIGN KEY ("supplier_alert_id") REFERENCES "supplier_alerts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_alert_events" ADD CONSTRAINT "supplier_alert_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_report_requests" ADD CONSTRAINT "supplier_report_requests_supplier_alert_id_fkey" FOREIGN KEY ("supplier_alert_id") REFERENCES "supplier_alerts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_report_requests" ADD CONSTRAINT "supplier_report_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_source_module_id_fkey" FOREIGN KEY ("source_module_id") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_liberado_by_fkey" FOREIGN KEY ("liberado_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_events" ADD CONSTRAINT "block_events_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_events" ADD CONSTRAINT "block_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_briefings" ADD CONSTRAINT "investigation_briefings_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_messages" ADD CONSTRAINT "investigation_messages_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unblock_requests" ADD CONSTRAINT "unblock_requests_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unblock_requests" ADD CONSTRAINT "unblock_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rules" ADD CONSTRAINT "rules_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rules" ADD CONSTRAINT "rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_events" ADD CONSTRAINT "rule_events_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_events" ADD CONSTRAINT "rule_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_executions" ADD CONSTRAINT "rule_executions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

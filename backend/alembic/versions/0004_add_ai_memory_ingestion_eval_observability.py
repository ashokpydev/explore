"""add AI memory ingestion eval observability

Revision ID: 0004_ai_ops
Revises: 0003_add_ai_knowledge_sources
Create Date: 2026-06-12
"""

from alembic import op

revision = "0004_ai_ops"
down_revision = "0003_add_ai_knowledge_sources"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS ai_conversations (
          id UUID PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          title VARCHAR(180) NOT NULL DEFAULT 'Hyderabad trip chat',
          language VARCHAR(16) NOT NULL DEFAULT 'en',
          summary TEXT,
          memory JSON NOT NULL DEFAULT '{}',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_ai_conversations_language ON ai_conversations(language);

        CREATE TABLE IF NOT EXISTS ai_conversation_messages (
          id UUID PRIMARY KEY,
          conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
          role VARCHAR(24) NOT NULL,
          content TEXT NOT NULL,
          citations JSON NOT NULL DEFAULT '[]',
          message_metadata JSON NOT NULL DEFAULT '{}',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_ai_conversation_messages_conversation_id
          ON ai_conversation_messages(conversation_id);

        CREATE TABLE IF NOT EXISTS ai_request_logs (
          id UUID PRIMARY KEY,
          conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
          operation VARCHAR(80) NOT NULL,
          model VARCHAR(120) NOT NULL,
          status VARCHAR(40) NOT NULL DEFAULT 'ok',
          prompt_tokens INTEGER NOT NULL DEFAULT 0,
          completion_tokens INTEGER NOT NULL DEFAULT 0,
          total_tokens INTEGER NOT NULL DEFAULT 0,
          latency_ms INTEGER NOT NULL DEFAULT 0,
          estimated_cost_usd DOUBLE PRECISION NOT NULL DEFAULT 0,
          retrieved_count INTEGER NOT NULL DEFAULT 0,
          request_metadata JSON NOT NULL DEFAULT '{}',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_ai_request_logs_conversation_id
          ON ai_request_logs(conversation_id);
        CREATE INDEX IF NOT EXISTS ix_ai_request_logs_operation ON ai_request_logs(operation);
        CREATE INDEX IF NOT EXISTS ix_ai_request_logs_status ON ai_request_logs(status);

        CREATE TABLE IF NOT EXISTS ai_ingestion_runs (
          id UUID PRIMARY KEY,
          source_kind VARCHAR(60) NOT NULL,
          status VARCHAR(40) NOT NULL DEFAULT 'completed',
          documents_seen INTEGER NOT NULL DEFAULT 0,
          chunks_indexed INTEGER NOT NULL DEFAULT 0,
          embedded INTEGER NOT NULL DEFAULT 0,
          errors JSON NOT NULL DEFAULT '[]',
          run_metadata JSON NOT NULL DEFAULT '{}',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_ai_ingestion_runs_source_kind
          ON ai_ingestion_runs(source_kind);
        CREATE INDEX IF NOT EXISTS ix_ai_ingestion_runs_status ON ai_ingestion_runs(status);

        CREATE TABLE IF NOT EXISTS rag_evaluation_runs (
          id UUID PRIMARY KEY,
          name VARCHAR(180) NOT NULL,
          total_cases INTEGER NOT NULL DEFAULT 0,
          average_score DOUBLE PRECISION NOT NULL DEFAULT 0,
          pass_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
          results JSON NOT NULL DEFAULT '[]',
          run_metadata JSON NOT NULL DEFAULT '{}',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS rag_evaluation_runs;
        DROP TABLE IF EXISTS ai_ingestion_runs;
        DROP TABLE IF EXISTS ai_request_logs;
        DROP TABLE IF EXISTS ai_conversation_messages;
        DROP TABLE IF EXISTS ai_conversations;
        """
    )

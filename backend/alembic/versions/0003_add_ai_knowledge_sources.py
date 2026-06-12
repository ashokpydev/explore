"""add AI knowledge sources

Revision ID: 0003_add_ai_knowledge_sources
Revises: 0002_add_placekind_orm_names
Create Date: 2026-06-12
"""

from alembic import op

revision = "0003_add_ai_knowledge_sources"
down_revision = "0002_add_placekind_orm_names"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS ai_knowledge_sources (
          id UUID PRIMARY KEY,
          source_kind VARCHAR(40) NOT NULL,
          source_id UUID,
          title VARCHAR(220) NOT NULL,
          content TEXT NOT NULL,
          citation VARCHAR(600) NOT NULL,
          language VARCHAR(16) NOT NULL DEFAULT 'en',
          trust_level DOUBLE PRECISION NOT NULL DEFAULT 0.8,
          freshness_at TIMESTAMPTZ,
          source_metadata JSON NOT NULL DEFAULT '{}',
          embedding VECTOR(1536),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT one_ai_source_per_entity UNIQUE(source_kind, source_id)
        );
        CREATE INDEX IF NOT EXISTS ix_ai_knowledge_sources_source_kind ON ai_knowledge_sources(source_kind);
        CREATE INDEX IF NOT EXISTS ix_ai_knowledge_sources_source_id ON ai_knowledge_sources(source_id);
        CREATE INDEX IF NOT EXISTS ix_ai_knowledge_sources_title ON ai_knowledge_sources(title);
        CREATE INDEX IF NOT EXISTS ix_ai_knowledge_sources_language ON ai_knowledge_sources(language);
        CREATE INDEX IF NOT EXISTS ix_ai_knowledge_sources_text
          ON ai_knowledge_sources USING GIN(to_tsvector('english', title || ' ' || content));
        CREATE INDEX IF NOT EXISTS ix_ai_knowledge_sources_embedding
          ON ai_knowledge_sources USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS ai_knowledge_sources")

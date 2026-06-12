"""add ORM enum names for place kind

Revision ID: 0002_add_placekind_orm_names
Revises: 0001_initial_schema
Create Date: 2026-06-09
"""

from alembic import op

revision = "0002_add_placekind_orm_names"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE placekind ADD VALUE IF NOT EXISTS 'getaway'")
    op.execute("ALTER TYPE placekind ADD VALUE IF NOT EXISTS 'experience'")


def downgrade() -> None:
    # PostgreSQL cannot drop enum values directly. Keep this migration irreversible.
    pass

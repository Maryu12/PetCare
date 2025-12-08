"""Add status column to appointment

Revision ID: a1b2c3d4e5f6
Revises: 79c77e7cbe3e
Create Date: 2025-12-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '79c77e7cbe3e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add status column to appointment table."""
    op.add_column('appointment', sa.Column('status', sa.String(length=20), nullable=True))


def downgrade() -> None:
    """Remove status column from appointment table."""
    op.drop_column('appointment', 'status')

"""empty message

Revision ID: a470930f89e5
Revises: 7db4cf7a994a
Create Date: 2025-06-16 20:12:25.827048

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlmodel import SQLModel


# revision identifiers, used by Alembic.
revision: str = 'a470930f89e5'
down_revision: Union[str, None] = '7db4cf7a994a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('message', 'timestamp',
               existing_type=sa.VARCHAR(),
               type_=sa.DateTime(),
               existing_nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('message', 'timestamp',
               existing_type=sa.DateTime(),
               type_=sa.VARCHAR(),
               existing_nullable=False)
    # ### end Alembic commands ###

"""empty message

Revision ID: 7db4cf7a994a
Revises: ddeabfe04f24
Create Date: 2025-06-11 21:52:57.040785

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlmodel import SQLModel


# revision identifiers, used by Alembic.
revision: str = '7db4cf7a994a'
down_revision: Union[str, None] = 'ddeabfe04f24'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('room', 'description')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('room', sa.Column('description', sa.VARCHAR(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###

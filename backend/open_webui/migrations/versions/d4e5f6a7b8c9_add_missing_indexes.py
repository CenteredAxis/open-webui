"""Add missing indexes for user_id and join columns

Revision ID: d4e5f6a7b8c9
Revises: b2c3d4e5f6a7
Create Date: 2026-02-19 00:00:00.000000

Tables covered and rationale:
- group.user_id              — "list groups owned by user"
- group_member.user_id       — "which groups does this user belong to?" (auth hot-path)
- file.user_id               — "list files owned by user"
- folder.user_id             — "list folders owned by user"
- folder.parent_id           — "list children of a folder" (hierarchical queries)
- knowledge.user_id          — "list knowledge bases owned by user"
- knowledge_file.file_id     — reverse lookup: which KBs contain a file?
                               (knowledge_id is already the leading key of the
                                uq_knowledge_file_knowledge_file unique constraint)
- knowledge_file.user_id     — "list knowledge files owned by user"
- note.user_id               — "list notes owned by user"
- message.channel_id         — "list all messages in a channel" (channel-load hot-path)
- message.parent_id          — "list replies to a message" (thread loading)
- message.user_id            — "list messages by user"
- message_reaction.message_id— "list reactions for a message"
- feedback.user_id           — "list feedback submitted by user"
- feedback.type              — "filter feedback by type"
- chat_file.file_id          — reverse lookup: which chats reference a file?
                               (chat_id is already the leading key of the
                                uq_chat_file_chat_file unique constraint)
- chat_file.user_id          — "list chat files owned by user"
- chat_file.message_id       — "list files attached to a specific message"
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # group
    op.create_index("idx_group_user_id", "group", ["user_id"])

    # group_member — user_id is the critical missing index; (group_id, user_id) is
    # already covered by the uq_group_member_group_user unique constraint
    op.create_index("idx_group_member_user_id", "group_member", ["user_id"])

    # file
    op.create_index("idx_file_user_id", "file", ["user_id"])

    # folder
    op.create_index("idx_folder_user_id", "folder", ["user_id"])
    op.create_index("idx_folder_parent_id", "folder", ["parent_id"])

    # knowledge
    op.create_index("idx_knowledge_user_id", "knowledge", ["user_id"])

    # knowledge_file
    op.create_index("idx_knowledge_file_file_id", "knowledge_file", ["file_id"])
    op.create_index("idx_knowledge_file_user_id", "knowledge_file", ["user_id"])

    # note
    op.create_index("idx_note_user_id", "note", ["user_id"])

    # message
    op.create_index("idx_message_channel_id", "message", ["channel_id"])
    op.create_index("idx_message_parent_id", "message", ["parent_id"])
    op.create_index("idx_message_user_id", "message", ["user_id"])

    # message_reaction
    op.create_index(
        "idx_message_reaction_message_id", "message_reaction", ["message_id"]
    )

    # feedback
    op.create_index("idx_feedback_user_id", "feedback", ["user_id"])
    op.create_index("idx_feedback_type", "feedback", ["type"])

    # chat_file — (chat_id, file_id) unique constraint already covers chat_id lookups
    op.create_index("idx_chat_file_file_id", "chat_file", ["file_id"])
    op.create_index("idx_chat_file_user_id", "chat_file", ["user_id"])
    op.create_index("idx_chat_file_message_id", "chat_file", ["message_id"])


def downgrade() -> None:
    op.drop_index("idx_group_user_id", table_name="group")
    op.drop_index("idx_group_member_user_id", table_name="group_member")
    op.drop_index("idx_file_user_id", table_name="file")
    op.drop_index("idx_folder_user_id", table_name="folder")
    op.drop_index("idx_folder_parent_id", table_name="folder")
    op.drop_index("idx_knowledge_user_id", table_name="knowledge")
    op.drop_index("idx_knowledge_file_file_id", table_name="knowledge_file")
    op.drop_index("idx_knowledge_file_user_id", table_name="knowledge_file")
    op.drop_index("idx_note_user_id", table_name="note")
    op.drop_index("idx_message_channel_id", table_name="message")
    op.drop_index("idx_message_parent_id", table_name="message")
    op.drop_index("idx_message_user_id", table_name="message")
    op.drop_index(
        "idx_message_reaction_message_id", table_name="message_reaction"
    )
    op.drop_index("idx_feedback_user_id", table_name="feedback")
    op.drop_index("idx_feedback_type", table_name="feedback")
    op.drop_index("idx_chat_file_file_id", table_name="chat_file")
    op.drop_index("idx_chat_file_user_id", table_name="chat_file")
    op.drop_index("idx_chat_file_message_id", table_name="chat_file")

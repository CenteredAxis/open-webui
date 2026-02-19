import time
import uuid
from typing import Optional

from sqlalchemy.orm import Session
from open_webui.internal.db import Base, get_db_context
from open_webui.internal.crud import CRUDBase
from pydantic import BaseModel, ConfigDict
from sqlalchemy import BigInteger, Column, String, Text

####################
# Memory DB Schema
####################


class Memory(Base):
    __tablename__ = "memory"

    id = Column(String, primary_key=True, unique=True)
    user_id = Column(String)
    content = Column(Text)
    updated_at = Column(BigInteger)
    created_at = Column(BigInteger)


class MemoryModel(BaseModel):
    id: str
    user_id: str
    content: str
    updated_at: int  # timestamp in epoch
    created_at: int  # timestamp in epoch

    model_config = ConfigDict(from_attributes=True)


####################
# Forms
####################


class MemoriesTable(CRUDBase[Memory, MemoryModel]):
    def __init__(self):
        super().__init__(Memory, MemoryModel)

    def insert_new_memory(
        self,
        user_id: str,
        content: str,
        db: Optional[Session] = None,
    ) -> Optional[MemoryModel]:
        now = int(time.time())
        return self._insert(
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "content": content,
                "created_at": now,
                "updated_at": now,
            },
            db,
        )

    def update_memory_by_id_and_user_id(
        self,
        id: str,
        user_id: str,
        content: str,
        db: Optional[Session] = None,
    ) -> Optional[MemoryModel]:
        with get_db_context(db) as db:
            try:
                memory = db.get(Memory, id)
                if not memory or memory.user_id != user_id:
                    return None

                memory.content = content
                memory.updated_at = int(time.time())

                db.commit()
                db.refresh(memory)
                return MemoryModel.model_validate(memory)
            except Exception:
                return None

    def get_memories(self, db: Optional[Session] = None) -> list[MemoryModel]:
        with get_db_context(db) as db:
            try:
                memories = db.query(Memory).all()
                return [MemoryModel.model_validate(memory) for memory in memories]
            except Exception:
                return None

    # one-line wrappers — preserve existing call sites in routers unchanged
    def get_memories_by_user_id(
        self, user_id: str, db: Optional[Session] = None
    ) -> list[MemoryModel]:
        return self.get_by_user_id(user_id, db)

    def get_memory_by_id(
        self, id: str, db: Optional[Session] = None
    ) -> Optional[MemoryModel]:
        return self.get_by_id(id, db)

    def delete_memory_by_id(self, id: str, db: Optional[Session] = None) -> bool:
        return self.delete_by_id(id, db)

    def delete_memories_by_user_id(
        self, user_id: str, db: Optional[Session] = None
    ) -> bool:
        with get_db_context(db) as db:
            try:
                db.query(Memory).filter_by(user_id=user_id).delete()
                db.commit()

                return True
            except Exception:
                return False

    def delete_memory_by_id_and_user_id(
        self, id: str, user_id: str, db: Optional[Session] = None
    ) -> bool:
        with get_db_context(db) as db:
            try:
                memory = db.get(Memory, id)
                if not memory or memory.user_id != user_id:
                    return None

                # Delete the memory
                db.delete(memory)
                db.commit()

                return True
            except Exception:
                return False


Memories = MemoriesTable()

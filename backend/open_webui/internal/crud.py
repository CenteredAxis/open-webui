from typing import Generic, Optional, Type, TypeVar

from pydantic import BaseModel
from sqlalchemy.orm import Session

from open_webui.internal.db import get_db_context

SQLModel = TypeVar("SQLModel")
PydanticModel = TypeVar("PydanticModel", bound=BaseModel)


class CRUDBase(Generic[SQLModel, PydanticModel]):
    """
    Generic base for simple model managers.

    Provides four standard operations that are otherwise copy-pasted across every
    manager class: insert a row (_insert), fetch by primary key (get_by_id), fetch
    all rows for a user (get_by_user_id), and delete by primary key (delete_by_id).

    Domain-specific methods — search, ownership checks, versioning, access grants,
    hierarchical deletes, etc. — live in the concrete subclass.

    Usage::

        class MemoriesTable(CRUDBase[Memory, MemoryModel]):
            def __init__(self):
                super().__init__(Memory, MemoryModel)

            # domain-specific name preserved as a one-liner
            def get_memory_by_id(self, id, db=None):
                return self.get_by_id(id, db)
    """

    def __init__(self, model: Type[SQLModel], schema: Type[PydanticModel]):
        self.model = model
        self.schema = schema

    # ── internal helpers ───────────────────────────────────────────────────

    def _validate(self, obj) -> Optional[PydanticModel]:
        """Validate a SQLAlchemy row into the Pydantic schema, or return None."""
        return self.schema.model_validate(obj) if obj is not None else None

    def _insert(self, data: dict, db: Optional[Session] = None) -> PydanticModel:
        """
        Insert *data* as a new row and return the validated Pydantic model.
        Handles session management via get_db_context.
        """
        with get_db_context(db) as db:
            obj = self.model(**data)
            db.add(obj)
            db.commit()
            db.refresh(obj)
            return self.schema.model_validate(obj)

    # ── standard CRUD ──────────────────────────────────────────────────────

    def get_by_id(
        self, id: str, db: Optional[Session] = None
    ) -> Optional[PydanticModel]:
        with get_db_context(db) as db:
            obj = db.query(self.model).filter_by(id=id).first()
            return self._validate(obj)

    def get_by_user_id(
        self, user_id: str, db: Optional[Session] = None
    ) -> list[PydanticModel]:
        with get_db_context(db) as db:
            return [
                self.schema.model_validate(obj)
                for obj in db.query(self.model).filter_by(user_id=user_id).all()
            ]

    def delete_by_id(self, id: str, db: Optional[Session] = None) -> bool:
        with get_db_context(db) as db:
            db.query(self.model).filter_by(id=id).delete()
            db.commit()
            return True

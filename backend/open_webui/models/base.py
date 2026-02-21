from typing import Optional, Type

from pydantic import BaseModel
from sqlalchemy.orm import Session

from open_webui.models.access_grants import AccessGrantModel, AccessGrants


class ResourceTableMixin:
    """
    Mixin providing shared access-grant helpers for resource table classes.

    Subclasses must define a ``_resource_type`` class-level string that matches
    the resource type string used in the access_grant table (e.g. "skill",
    "tool", "prompt").
    """

    _resource_type: str  # e.g. "skill", "tool", "prompt"

    def _get_access_grants(
        self, resource_id: str, db: Optional[Session] = None
    ) -> list[AccessGrantModel]:
        return AccessGrants.get_grants_by_resource(
            self._resource_type, resource_id, db=db
        )

    def _to_resource_model(
        self,
        resource,
        model_class: Type[BaseModel],
        db: Optional[Session] = None,
    ):
        """Validate *resource* into *model_class*, then attach access grants."""
        data = model_class.model_validate(resource).model_dump(
            exclude={"access_grants"}
        )
        data["access_grants"] = self._get_access_grants(data["id"], db=db)
        return model_class.model_validate(data)

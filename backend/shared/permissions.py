from __future__ import annotations

import json
import os

from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.request import Request
from rest_framework.views import APIView


def _get_admin_allowlist() -> set[str]:
    """Return the set of lowercased email addresses allowed admin access.

    Combines emails from the ``VECTOR_AUTO_INJECTED_ORG_MEMBER_LIST`` env var
    (parsed as JSON array first, falling back to comma-separated string) with
    the hardcoded ``sam@govector.ai`` entry.
    """
    raw = os.environ.get("VECTOR_AUTO_INJECTED_ORG_MEMBER_LIST", "")
    emails: list[str] = []
    if raw.strip():
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                emails = [str(e) for e in parsed]
            else:
                emails = [s for s in raw.split(",") if s.strip()]
        except (json.JSONDecodeError, TypeError):
            emails = [s for s in raw.split(",") if s.strip()]

    allowlist = {e.strip().lower() for e in emails if e.strip()}
    allowlist.add("sam@govector.ai")
    return allowlist


def is_org_admin(email: str) -> bool:
    """Check whether *email* is in the organisation admin allowlist."""
    return email.strip().lower() in _get_admin_allowlist()


class ReadOnlyOrAuthenticated(BasePermission):
    """Allow anyone to perform safe (read-only) requests.

    Write operations (POST, PUT, PATCH, DELETE) require an authenticated user.

    SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')
    """

    message = "Authentication is required to submit scores."

    def has_permission(self, request: Request, view: APIView) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class IsOrgAdmin(BasePermission):
    """Grant access only to users whose email is in the org admin allowlist."""

    message = "You do not have admin access."

    def has_permission(self, request: Request, view: APIView) -> bool:
        if not (request.user and request.user.is_authenticated):
            return False
        return is_org_admin(request.user.email)

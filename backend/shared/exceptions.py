from __future__ import annotations

import logging

from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied, ValidationError
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc: Exception, context: dict) -> Response | None:
    """Return consistent JSON error responses with ``status`` and ``message`` fields.

    Shape:
        {
            "status": 422,
            "message": "Validation failed.",
            "errors": { ... }   # only present for ValidationError
        }
    """
    # Let DRF turn the exception into a Response first (handles 401, 403, 404, etc.)
    response = drf_exception_handler(exc, context)

    if response is None:
        # Unhandled exception — log it and return a generic 500
        logger.exception("Unhandled exception in %s", context.get("view"))
        return Response(
            {"status": 500, "message": "An unexpected error occurred. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Determine a human-readable message
    if isinstance(exc, ValidationError):
        message = "Validation failed."
        payload: dict = {
            "status": response.status_code,
            "message": message,
            "errors": response.data,
        }
    elif isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        message = "Authentication required."
        payload = {"status": response.status_code, "message": message}
    elif isinstance(exc, PermissionDenied):
        message = "You do not have permission to perform this action."
        payload = {"status": response.status_code, "message": message}
    elif isinstance(exc, Http404):
        message = "The requested resource was not found."
        payload = {"status": 404, "message": message}
    else:
        # Generic DRF exception — use whatever detail DRF provided
        detail = response.data.get("detail", str(exc)) if isinstance(response.data, dict) else str(exc)
        message = str(detail)
        payload = {"status": response.status_code, "message": message}

    response.data = payload
    return response

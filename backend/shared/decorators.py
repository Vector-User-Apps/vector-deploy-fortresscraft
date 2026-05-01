from __future__ import annotations

import functools
import logging
import time
from collections.abc import Callable
from typing import Any

logger = logging.getLogger(__name__)

SLOW_REQUEST_THRESHOLD_MS = 500


def track_execution_time(func: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator that measures API view method execution time and logs slow requests.

    Logs a WARNING when the handler takes longer than SLOW_REQUEST_THRESHOLD_MS (500ms).
    Always logs execution time at DEBUG level.

    Usage:
        class MyView(APIView):
            @track_execution_time
            def get(self, request):
                ...
    """

    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            elapsed_ms = (time.perf_counter() - start) * 1000
            view_name = func.__qualname__

            logger.debug("%.2fms — %s", elapsed_ms, view_name)

            if elapsed_ms > SLOW_REQUEST_THRESHOLD_MS:
                logger.warning(
                    "Slow request detected: %s took %.2fms (threshold: %dms)",
                    view_name,
                    elapsed_ms,
                    SLOW_REQUEST_THRESHOLD_MS,
                )

    return wrapper

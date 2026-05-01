from __future__ import annotations

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class ScoreSubmitUserThrottle(UserRateThrottle):
    """Limit authenticated users to 5 score submissions per minute."""

    scope = "score_submit_user"
    rate = "5/min"


class ScoreSubmitAnonThrottle(AnonRateThrottle):
    """Limit anonymous users to 2 score submissions per minute.

    Unauthenticated requests are already blocked by ReadOnlyOrAuthenticated,
    but this provides an extra layer of protection at the throttling level.
    """

    scope = "score_submit_anon"
    rate = "2/min"

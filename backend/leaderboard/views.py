from __future__ import annotations

from datetime import timedelta

from django.core.cache import cache
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from leaderboard.models import HighScore, LeaderboardEntry
from leaderboard.pagination import LeaderboardPagination
from leaderboard.serializers import HighScoreSerializer, LeaderboardEntrySerializer
from shared.decorators import track_execution_time
from shared.permissions import ReadOnlyOrAuthenticated
from shared.throttles import ScoreSubmitAnonThrottle, ScoreSubmitUserThrottle

LEADERBOARD_CACHE_KEY = "leaderboard:list"
TOP_SCORES_CACHE_KEY = "leaderboard:top10"
CACHE_TTL = 60 * 5  # 5 minutes


@extend_schema(
    summary="List leaderboard entries",
    description="Returns all leaderboard entries ordered by score descending, paginated 10 per page.",
    responses={200: LeaderboardEntrySerializer(many=True)},
)
class LeaderboardListView(generics.ListAPIView):
    """GET leaderboard entries ordered by score descending, paginated 10 per page."""

    serializer_class = LeaderboardEntrySerializer
    permission_classes = [AllowAny]
    pagination_class = LeaderboardPagination

    def get_queryset(self) -> list[LeaderboardEntry]:
        return LeaderboardEntry.objects.order_by("-score")

    @track_execution_time
    def list(self, request: Request, *args: object, **kwargs: object) -> Response:
        cached = cache.get(LEADERBOARD_CACHE_KEY)
        if cached is not None:
            return Response(cached)

        response = super().list(request, *args, **kwargs)
        cache.set(LEADERBOARD_CACHE_KEY, response.data, CACHE_TTL)
        return response


@extend_schema(
    summary="Top 10 high scores",
    description="Returns the top 10 high scores ordered by score descending. Optionally filter by minimum score.",
    parameters=[
        OpenApiParameter(name="min_score", type=int, location=OpenApiParameter.QUERY, required=False, description="Only return scores >= this value."),
    ],
    responses={200: HighScoreSerializer(many=True)},
)
class TopHighScoresView(generics.ListAPIView):
    """GET top 10 high scores ordered by score descending.

    Query parameters:
        min_score (int, optional): Only return entries with score >= this value.
            When provided the cache is bypassed so the filter is always applied.
    """

    serializer_class = HighScoreSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def _min_score(self) -> int | None:
        raw = self.request.query_params.get("min_score")
        if raw is None:
            return None
        try:
            value = int(raw)
        except ValueError:
            raise ValidationError({"min_score": "Must be a non-negative integer."})
        if value < 0:
            raise ValidationError({"min_score": "Must be a non-negative integer."})
        return value

    def get_queryset(self) -> list[HighScore]:
        min_score = self._min_score()
        if min_score is not None:
            return HighScore.objects.filter(score__gte=min_score).order_by("-score")[:10]
        return HighScore.objects.top(10)

    @track_execution_time
    def list(self, request: Request, *args: object, **kwargs: object) -> Response:
        # Only use the cache when no filter is applied
        if self._min_score() is None:
            cached = cache.get(TOP_SCORES_CACHE_KEY)
            if cached is not None:
                return Response(cached)

            response = super().list(request, *args, **kwargs)
            cache.set(TOP_SCORES_CACHE_KEY, response.data, CACHE_TTL)
            return response

        return super().list(request, *args, **kwargs)


@extend_schema(
    summary="Submit a high score",
    description="Create a new high score entry. Requires authentication. Throttled to 5 submissions per minute.",
    request=HighScoreSerializer,
    responses={201: HighScoreSerializer},
)
class HighScoreSubmitView(generics.CreateAPIView):
    """POST to submit a new high score entry.

    Accepts: { playerName, score, level }
    Returns: the created high score object with 201.
    Invalidates leaderboard caches on success.
    Requires authentication — unauthenticated requests receive 403.
    Throttled to 5 submissions per minute per authenticated user.
    """

    serializer_class = HighScoreSerializer
    permission_classes = [ReadOnlyOrAuthenticated]
    throttle_classes = [ScoreSubmitUserThrottle, ScoreSubmitAnonThrottle]
    pagination_class = None

    def perform_create(self, serializer: HighScoreSerializer) -> None:
        super().perform_create(serializer)
        cache.delete(LEADERBOARD_CACHE_KEY)
        cache.delete(TOP_SCORES_CACHE_KEY)


@extend_schema(
    summary="Submit a leaderboard entry",
    description="Create a new leaderboard entry. Requires authentication. Throttled to 5 submissions per minute.",
    request=LeaderboardEntrySerializer,
    responses={201: LeaderboardEntrySerializer},
)
class ScoreSubmitView(generics.CreateAPIView):
    """POST to submit a new leaderboard entry.

    Invalidates leaderboard list cache on success.
    Requires authentication — unauthenticated requests receive 403.
    Throttled to 5 submissions per minute per authenticated user.
    """

    serializer_class = LeaderboardEntrySerializer
    permission_classes = [ReadOnlyOrAuthenticated]
    throttle_classes = [ScoreSubmitUserThrottle, ScoreSubmitAnonThrottle]
    pagination_class = None

    def perform_create(self, serializer: LeaderboardEntrySerializer) -> None:
        super().perform_create(serializer)
        cache.delete(LEADERBOARD_CACHE_KEY)


@extend_schema(
    summary="Search high scores by player name",
    description="Case-insensitive substring search on player name. Results ordered by score descending.",
    parameters=[
        OpenApiParameter(name="name", type=str, location=OpenApiParameter.QUERY, required=True, description="Substring to match against player names."),
    ],
    responses={200: HighScoreSerializer(many=True)},
)
class HighScoreSearchView(generics.ListAPIView):
    """GET /api/scores/search/?name=<query> — search high scores by player name.

    Query parameters:
        name (str, required): Case-insensitive substring match against player_name.
            Must be at least 1 character after stripping whitespace.

    Returns results ordered by score descending.
    """

    serializer_class = HighScoreSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self) -> list[HighScore]:
        name = self.request.query_params.get("name", "").strip()
        if not name:
            raise ValidationError({"name": "A non-empty name query parameter is required."})
        return HighScore.objects.filter(player_name__icontains=name).order_by("-score")

    @track_execution_time
    def list(self, request: Request, *args: object, **kwargs: object) -> Response:
        return super().list(request, *args, **kwargs)


WEEKLY_CACHE_KEY = "leaderboard:weekly"


@extend_schema(
    summary="Weekly leaderboard",
    description="Returns up to 10 high scores submitted in the last 7 days, ordered by score descending. Cached for 5 minutes.",
    responses={200: HighScoreSerializer(many=True)},
)
class WeeklyLeaderboardView(generics.ListAPIView):
    """GET /api/v1/leaderboard/weekly/ — top scores from the last 7 days.

    Returns up to 10 entries with timestamp >= now - 7 days, ordered by score
    descending. Results are cached for 5 minutes and the cache is bypassed on
    cache miss only, so fresh submissions appear within one cache cycle.
    """

    serializer_class = HighScoreSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self) -> list[HighScore]:
        cutoff = timezone.now() - timedelta(days=7)
        return HighScore.objects.filter(timestamp__gte=cutoff).order_by("-score")[:10]

    @track_execution_time
    def list(self, request: Request, *args: object, **kwargs: object) -> Response:
        cached = cache.get(WEEKLY_CACHE_KEY)
        if cached is not None:
            return Response(cached)

        response = super().list(request, *args, **kwargs)
        cache.set(WEEKLY_CACHE_KEY, response.data, CACHE_TTL)
        return response


@extend_schema(
    summary="Delete a high score",
    description="Permanently remove a high score entry by ID. Returns 204 on success, 404 if not found. Requires authentication.",
    responses={204: None},
)
class HighScoreDeleteView(generics.DestroyAPIView):
    """DELETE /api/scores/{id}/ — remove a specific high score entry.

    Returns 204 on success, 404 if the entry does not exist.
    Invalidates leaderboard caches on success.
    Requires authentication — unauthenticated requests receive 403.
    """

    queryset = HighScore.objects.all()
    permission_classes = [ReadOnlyOrAuthenticated]

    def perform_destroy(self, instance: HighScore) -> None:
        super().perform_destroy(instance)
        cache.delete(LEADERBOARD_CACHE_KEY)
        cache.delete(TOP_SCORES_CACHE_KEY)

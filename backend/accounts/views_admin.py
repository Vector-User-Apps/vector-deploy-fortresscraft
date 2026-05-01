from __future__ import annotations

from django.db.models import Count, IntegerField, OuterRef, QuerySet, Subquery
from django.db.models.functions import Coalesce
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.serializers_admin import AdminUserSerializer
from leaderboard.models import LeaderboardEntry
from shared.permissions import IsOrgAdmin, is_org_admin


class AdminAccessCheckView(APIView):
    """GET /api/admin/check-access/ — check whether the current user is an org admin."""

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        return Response({"is_admin": is_org_admin(request.user.email)})


class AdminUserListView(ListAPIView):
    """GET /api/admin/users/ — paginated list of all users with game stats."""

    permission_classes = [IsAuthenticated, IsOrgAdmin]
    serializer_class = AdminUserSerializer

    def get_queryset(self) -> QuerySet[User]:
        """Annotate each user with best_score, best_wave, and games_played.

        LeaderboardEntry links to users by ``player_name`` (no FK), so we use
        correlated subqueries matching on the player_name field.
        """
        leaderboard_for_user = LeaderboardEntry.objects.filter(
            player_name=OuterRef("first_name"),
        )

        return User.objects.annotate(
            best_score=Coalesce(
                Subquery(
                    leaderboard_for_user.order_by("-score").values("score")[:1],
                    output_field=IntegerField(),
                ),
                0,
            ),
            best_wave=Coalesce(
                Subquery(
                    leaderboard_for_user.order_by("-wave_reached").values("wave_reached")[:1],
                    output_field=IntegerField(),
                ),
                0,
            ),
            games_played=Coalesce(
                Subquery(
                    leaderboard_for_user.values("player_name")
                    .annotate(cnt=Count("id"))
                    .values("cnt")[:1],
                    output_field=IntegerField(),
                ),
                0,
            ),
        ).order_by("-created_at")

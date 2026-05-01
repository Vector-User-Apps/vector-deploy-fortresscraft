from __future__ import annotations

from django.contrib import admin
from django.urls import include, path, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from accounts.views_admin import AdminAccessCheckView, AdminUserListView
from config.views import spa_index
from leaderboard.views import HighScoreSearchView, HighScoreSubmitView
from shared.views import GameTipView, HealthCheckView, RandomFactView, ServerStatusView, StatsView

urlpatterns = [
    path("admin/", admin.site.urls),
    # OpenAPI schema + interactive docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/accounts/", include("accounts.urls")),
    path("api/v1/leaderboard/", include("leaderboard.urls", namespace="leaderboard")),
    path("api/scores/submit/", HighScoreSubmitView.as_view(), name="highscore-submit"),
    path("api/scores/search/", HighScoreSearchView.as_view(), name="highscore-search"),
    path("api/random-fact/", RandomFactView.as_view(), name="random-fact"),
    path("api/game-tips/", GameTipView.as_view(), name="game-tips"),
    path("api/health/", HealthCheckView.as_view(), name="health"),
    path("api/server-status/", ServerStatusView.as_view(), name="server-status"),
    path("api/stats/", StatsView.as_view(), name="stats"),
    path("api/admin/check-access/", AdminAccessCheckView.as_view(), name="admin-check-access"),
    path("api/admin/users/", AdminUserListView.as_view(), name="admin-users"),
    # SPA catch-all: serve index.html for any route not matched above.
    # This lets React Router handle client-side routing in production.
    # Must be last — Django tries patterns in order.
    re_path(r"^(?!api/|admin/|static/|assets/).*$", spa_index),
]

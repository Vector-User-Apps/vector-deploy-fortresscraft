from __future__ import annotations

from django.urls import path

from leaderboard.views import HighScoreDeleteView, LeaderboardListView, ScoreSubmitView, TopHighScoresView, WeeklyLeaderboardView

app_name = "leaderboard"

urlpatterns = [
    path("", LeaderboardListView.as_view(), name="leaderboard-list"),
    path("submit/", ScoreSubmitView.as_view(), name="score-submit"),
    path("top/", TopHighScoresView.as_view(), name="leaderboard-top"),
    path("weekly/", WeeklyLeaderboardView.as_view(), name="leaderboard-weekly"),
    path("<uuid:pk>/", HighScoreDeleteView.as_view(), name="highscore-delete"),
]

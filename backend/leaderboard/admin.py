from __future__ import annotations

from django.contrib import admin

from leaderboard.models import HighScore, LeaderboardEntry


@admin.register(HighScore)
class HighScoreAdmin(admin.ModelAdmin):
    list_display = ("player_name", "score", "level", "timestamp")
    list_filter = ("level",)
    search_fields = ("player_name",)
    ordering = ("-score",)
    readonly_fields = ("timestamp",)


@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = ("player_name", "score", "wave_reached", "enemies_killed", "submitted_at")
    search_fields = ("player_name",)
    ordering = ("-score",)
    readonly_fields = ("submitted_at",)

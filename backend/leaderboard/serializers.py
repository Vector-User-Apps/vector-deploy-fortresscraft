from __future__ import annotations

from rest_framework import serializers

from leaderboard.models import HighScore, LeaderboardEntry
from shared.utils import validate_player_name


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaderboardEntry
        fields = [
            "id",
            "player_name",
            "score",
            "wave_reached",
            "enemies_killed",
            "submitted_at",
        ]
        read_only_fields = ["id", "submitted_at"]

    def validate_player_name(self, value: str) -> str:
        try:
            return validate_player_name(value)
        except ValueError as e:
            raise serializers.ValidationError(str(e)) from e

    def validate_score(self, value: int) -> int:
        if value <= 0:
            raise serializers.ValidationError("Score must be greater than 0.")
        return value

    def validate_wave_reached(self, value: int) -> int:
        if value <= 0:
            raise serializers.ValidationError("Wave reached must be greater than 0.")
        return value


class HighScoreSerializer(serializers.ModelSerializer):
    playerName = serializers.CharField(source="player_name", max_length=100)

    class Meta:
        model = HighScore
        fields = ["id", "playerName", "score", "level", "difficulty_level", "timestamp"]
        read_only_fields = ["id", "timestamp"]

    def validate_playerName(self, value: str) -> str:
        try:
            return validate_player_name(value)
        except ValueError as e:
            raise serializers.ValidationError(str(e)) from e

    def validate_score(self, value: int) -> int:
        if value < 0:
            raise serializers.ValidationError("Score must be a non-negative integer.")
        return value

    def validate_level(self, value: int) -> int:
        if value < 1:
            raise serializers.ValidationError("Level must be at least 1.")
        return value

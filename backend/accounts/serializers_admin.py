from __future__ import annotations

from rest_framework import serializers

from accounts.models import User


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for the admin user list with aggregated game statistics."""

    full_name = serializers.ReadOnlyField()
    best_score = serializers.IntegerField(read_only=True, default=0)
    best_wave = serializers.IntegerField(read_only=True, default=0)
    games_played = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "picture",
            "is_active",
            "created_at",
            "best_score",
            "best_wave",
            "games_played",
        ]

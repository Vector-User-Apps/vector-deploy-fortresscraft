from __future__ import annotations

import random
from datetime import datetime, timezone

from django.db.models import Avg
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.utils import extend_schema
from leaderboard.models import HighScore
from shared.decorators import track_execution_time

FACTS = [
    "The first tower defense game was a custom Warcraft II map from 1998.",
    "Tower defense games popularized the 'creep' terminology for enemy units.",
    "The longest winning streak in competitive tower defense is 47 consecutive games.",
    "A well-placed Frost tower can reduce an enemy wave's speed by up to 50%.",
    "The optimal tower placement angle is 45° to maximize splash damage coverage.",
    "Sniper towers deal 3× more damage to armored units than arrow towers.",
    "The fastest speedrun of a tower defense map uses exactly 0 splash towers.",
    "Chess and tower defense share the same core mechanic: controlling territory.",
    "The average tower defense player places 3.7 towers before the first wave.",
    "Tesla towers were inspired by Nikola Tesla's real wireless energy experiments.",
]


TIPS = [
    {"tip": "Place Frost towers at chokepoints to slow enemies before they reach your base.", "category": "strategy", "difficulty_level": 2},
    {"tip": "Upgrade your Arrow towers first — early DPS pays off through the first 10 waves.", "category": "beginner", "difficulty_level": 1},
    {"tip": "Tesla towers chain lightning, so cluster enemies before they enter their range.", "category": "advanced", "difficulty_level": 4},
    {"tip": "Save at least 200 gold in reserve so you can react to surprise heavy-armor waves.", "category": "strategy", "difficulty_level": 3},
    {"tip": "Cannon towers deal splash damage — place them where paths cross for double value.", "category": "strategy", "difficulty_level": 2},
]


@extend_schema(
    summary="Random game fact",
    description="Returns a random fun fact about tower defense games.",
    responses={200: {"type": "object", "properties": {"fact": {"type": "string"}}}},
)
class RandomFactView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request: Request) -> Response:
        return Response({"fact": random.choice(FACTS)})


@extend_schema(
    summary="Random game tip",
    description="Returns a random gameplay tip with category and difficulty level.",
    responses={200: {"type": "object", "properties": {"tip": {"type": "string"}, "category": {"type": "string"}, "difficulty_level": {"type": "integer"}}}},
)
class GameTipView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request: Request) -> Response:
        return Response(random.choice(TIPS))


@extend_schema(
    summary="Health check",
    description="Returns server status and current UTC time. Always returns 200 if the server is running.",
    responses={200: {"type": "object", "properties": {"status": {"type": "string"}, "server_time": {"type": "string", "format": "date-time"}}}},
)
class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request: Request) -> Response:
        return Response({
            "status": "ok",
            "server_time": datetime.now(timezone.utc).isoformat(),
        })


@extend_schema(
    summary="Server status",
    description="Returns whether the server is online and the current UTC time.",
    responses={200: {"type": "object", "properties": {"status": {"type": "string"}, "server_time": {"type": "string", "format": "date-time"}}}},
)
class ServerStatusView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request: Request) -> Response:
        return Response({
            "status": "online",
            "server_time": datetime.now(timezone.utc).isoformat(),
        })


@extend_schema(
    summary="Game statistics",
    description="Returns aggregate statistics: total distinct players, total score entries, and average score.",
    responses={200: {"type": "object", "properties": {"total_players": {"type": "integer"}, "total_entries": {"type": "integer"}, "average_score": {"type": "number", "nullable": True}}}},
)
class StatsView(APIView):
    """GET /api/stats/ — aggregate stats across all high score entries.

    Returns:
        total_players: distinct count of player names
        average_score: mean score across all entries (null if no entries)
        total_entries: total number of high score records
    """

    authentication_classes = []
    permission_classes = []

    @track_execution_time
    def get(self, request: Request) -> Response:
        qs = HighScore.objects.all()
        total_entries: int = qs.count()
        total_players: int = qs.values("player_name").distinct().count()
        avg: float | None = qs.aggregate(avg=Avg("score"))["avg"]
        average_score = round(avg, 2) if avg is not None else None
        return Response({
            "total_players": total_players,
            "average_score": average_score,
            "total_entries": total_entries,
        })

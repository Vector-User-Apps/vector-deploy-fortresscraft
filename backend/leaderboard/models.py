from __future__ import annotations

from django.db import models

from shared.models import BaseModel


class LeaderboardEntry(BaseModel):
    player_name = models.CharField(max_length=50)
    score = models.PositiveIntegerField()
    wave_reached = models.PositiveIntegerField()
    enemies_killed = models.PositiveIntegerField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-score"]
        verbose_name_plural = "leaderboard entries"

    def __str__(self) -> str:
        return f"{self.player_name} - {self.score}"


class HighScoreManager(models.Manager["HighScore"]):
    def top(self, n: int = 10) -> models.QuerySet["HighScore"]:
        """Return the top N high scores ordered by score descending.

        Uses LIMIT in SQL so only the required rows are fetched, making it
        more efficient than slicing a fully-evaluated queryset.
        """
        if n < 1:
            raise ValueError("n must be a positive integer")
        return self.order_by("-score")[:n]


class HighScore(BaseModel):
    class Difficulty(models.TextChoices):
        EASY = "easy", "Easy"
        MEDIUM = "medium", "Medium"
        HARD = "hard", "Hard"

    objects = HighScoreManager()

    player_name = models.CharField(max_length=100)
    score = models.PositiveIntegerField(db_index=True)
    level = models.PositiveIntegerField()
    difficulty_level = models.CharField(
        max_length=6,
        choices=Difficulty.choices,
        default=Difficulty.MEDIUM,
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-score"]
        verbose_name = "high score"
        verbose_name_plural = "high scores"

    def __str__(self) -> str:
        return f"{self.player_name} - {self.score} (level {self.level})"

    def get_rank(self) -> int:
        """Return the 1-based rank of this score among all HighScore entries.

        Rank 1 is the highest score. Entries with a strictly higher score
        count as being ranked above this one, so ties share the same rank
        (e.g. two entries with score 500 both receive rank 1 if no higher
        score exists).
        """
        return HighScore.objects.filter(score__gt=self.score).count() + 1

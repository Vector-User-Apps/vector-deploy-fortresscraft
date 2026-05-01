from __future__ import annotations

from django.core.management.base import BaseCommand

from leaderboard.models import HighScore, LeaderboardEntry


class Command(BaseCommand):
    help = "Clears all high scores from the database"

    def add_arguments(self, parser: object) -> None:
        parser.add_argument(
            "--yes",
            action="store_true",
            help="Skip confirmation prompt",
        )

    def handle(self, *args: object, **options: object) -> None:
        if not options["yes"]:
            confirm = input("This will delete ALL high scores. Type 'yes' to confirm: ")
            if confirm.lower() != "yes":
                self.stdout.write(self.style.WARNING("Aborted."))
                return

        hs_count, _ = HighScore.objects.all().delete()
        le_count, _ = LeaderboardEntry.objects.all().delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {hs_count} high score(s) and {le_count} leaderboard entry(ies)."
            )
        )

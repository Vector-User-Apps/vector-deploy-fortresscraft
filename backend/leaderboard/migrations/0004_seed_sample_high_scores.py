from __future__ import annotations

from django.db import migrations


SAMPLE_SCORES = [
    {"player_name": "Commander_X", "score": 98500, "level": 25},
    {"player_name": "TowerMaster", "score": 74200, "level": 20},
    {"player_name": "FrostGuard",  "score": 61800, "level": 17},
    {"player_name": "IronDefense", "score": 45300, "level": 13},
    {"player_name": "ArrowStorm",  "score": 28900, "level": 9},
]


def seed_high_scores(apps, schema_editor):
    HighScore = apps.get_model("leaderboard", "HighScore")
    for entry in SAMPLE_SCORES:
        HighScore.objects.get_or_create(
            player_name=entry["player_name"],
            defaults={"score": entry["score"], "level": entry["level"]},
        )


def unseed_high_scores(apps, schema_editor):
    HighScore = apps.get_model("leaderboard", "HighScore")
    names = [e["player_name"] for e in SAMPLE_SCORES]
    HighScore.objects.filter(player_name__in=names).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("leaderboard", "0003_alter_highscore_score"),
    ]

    operations = [
        migrations.RunPython(seed_high_scores, reverse_code=unseed_high_scores),
    ]

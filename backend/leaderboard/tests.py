from __future__ import annotations

from django.test import TestCase
from rest_framework.test import APIClient

from leaderboard.models import HighScore
from leaderboard.serializers import HighScoreSerializer


class HighScoreModelTest(TestCase):
    """Unit tests for HighScore model creation and field behaviour."""

    def test_create_valid_high_score(self) -> None:
        hs = HighScore.objects.create(player_name="Hero123", score=5000, level=3)
        self.assertEqual(hs.player_name, "Hero123")
        self.assertEqual(hs.score, 5000)
        self.assertEqual(hs.level, 3)

    def test_timestamp_auto_populated(self) -> None:
        hs = HighScore.objects.create(player_name="Alpha", score=100, level=1)
        self.assertIsNotNone(hs.timestamp)

    def test_str_representation(self) -> None:
        hs = HighScore.objects.create(player_name="Knight", score=9999, level=5)
        self.assertEqual(str(hs), "Knight - 9999 (level 5)")

    def test_default_ordering_by_score_descending(self) -> None:
        HighScore.objects.create(player_name="Low", score=100, level=1)
        HighScore.objects.create(player_name="High", score=9000, level=2)
        HighScore.objects.create(player_name="Mid", score=4500, level=3)
        scores = list(HighScore.objects.values_list("score", flat=True))
        self.assertEqual(scores, [9000, 4500, 100])

    def test_zero_score_is_valid(self) -> None:
        hs = HighScore.objects.create(player_name="NewPlayer", score=0, level=1)
        self.assertEqual(hs.score, 0)


class HighScoreSerializerTest(TestCase):
    """Unit tests for HighScoreSerializer validation logic."""

    def _serialize(self, data: dict) -> HighScoreSerializer:
        s = HighScoreSerializer(data=data)
        s.is_valid()
        return s

    def test_valid_data_passes(self) -> None:
        s = self._serialize({"playerName": "Ace", "score": 1000, "level": 2})
        self.assertTrue(s.is_valid(), s.errors)

    def test_player_name_too_short_fails(self) -> None:
        s = self._serialize({"playerName": "AB", "score": 100, "level": 1})
        self.assertIn("playerName", s.errors)

    def test_player_name_too_long_fails(self) -> None:
        s = self._serialize({"playerName": "A" * 21, "score": 100, "level": 1})
        self.assertIn("playerName", s.errors)

    def test_player_name_with_special_chars_fails(self) -> None:
        s = self._serialize({"playerName": "bad name!", "score": 100, "level": 1})
        self.assertIn("playerName", s.errors)

    def test_player_name_alphanumeric_passes(self) -> None:
        s = self._serialize({"playerName": "Player99", "score": 500, "level": 1})
        self.assertTrue(s.is_valid(), s.errors)

    def test_player_name_strips_whitespace(self) -> None:
        s = self._serialize({"playerName": "  Ace  ", "score": 100, "level": 1})
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["player_name"], "Ace")

    def test_negative_score_fails(self) -> None:
        s = self._serialize({"playerName": "Ace", "score": -1, "level": 1})
        self.assertIn("score", s.errors)

    def test_zero_score_passes(self) -> None:
        s = self._serialize({"playerName": "Ace", "score": 0, "level": 1})
        self.assertTrue(s.is_valid(), s.errors)

    def test_level_zero_fails(self) -> None:
        s = self._serialize({"playerName": "Ace", "score": 100, "level": 0})
        self.assertIn("level", s.errors)

    def test_level_one_passes(self) -> None:
        s = self._serialize({"playerName": "Ace", "score": 100, "level": 1})
        self.assertTrue(s.is_valid(), s.errors)

    def test_missing_required_fields_fails(self) -> None:
        s = self._serialize({})
        self.assertFalse(s.is_valid())
        self.assertIn("playerName", s.errors)
        self.assertIn("score", s.errors)
        self.assertIn("level", s.errors)


class HighScoreSubmitAPITest(TestCase):
    """Integration tests for the POST /api/scores/submit/ endpoint."""

    def setUp(self) -> None:
        self.client = APIClient()
        self.url = "/api/scores/submit/"

    def test_valid_submission_creates_record(self) -> None:
        resp = self.client.post(self.url, {"playerName": "Hero", "score": 2000, "level": 3}, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(HighScore.objects.count(), 1)
        self.assertEqual(HighScore.objects.first().score, 2000)

    def test_response_contains_expected_fields(self) -> None:
        resp = self.client.post(self.url, {"playerName": "Hero", "score": 500, "level": 1}, format="json")
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertIn("id", data)
        self.assertIn("playerName", data)
        self.assertIn("score", data)
        self.assertIn("level", data)
        self.assertIn("timestamp", data)

    def test_invalid_player_name_returns_400(self) -> None:
        resp = self.client.post(self.url, {"playerName": "!!", "score": 100, "level": 1}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_negative_score_returns_400(self) -> None:
        resp = self.client.post(self.url, {"playerName": "Hero", "score": -5, "level": 1}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_missing_body_returns_400(self) -> None:
        resp = self.client.post(self.url, {}, format="json")
        self.assertEqual(resp.status_code, 400)


class HighScoreDeleteAPITest(TestCase):
    """Integration tests for DELETE /api/v1/leaderboard/{id}/"""

    def setUp(self) -> None:
        self.client = APIClient()
        self.hs = HighScore.objects.create(player_name="Target", score=1234, level=2)
        self.url = f"/api/v1/leaderboard/{self.hs.pk}/"

    def test_delete_existing_entry_returns_204(self) -> None:
        resp = self.client.delete(self.url)
        self.assertEqual(resp.status_code, 204)

    def test_delete_removes_record_from_db(self) -> None:
        self.client.delete(self.url)
        self.assertFalse(HighScore.objects.filter(pk=self.hs.pk).exists())

    def test_delete_nonexistent_entry_returns_404(self) -> None:
        import uuid
        resp = self.client.delete(f"/api/v1/leaderboard/{uuid.uuid4()}/")
        self.assertEqual(resp.status_code, 404)


class TopHighScoresFilterTest(TestCase):
    """Tests for ?min_score= filter on /api/v1/leaderboard/top/"""

    def setUp(self) -> None:
        self.client = APIClient()
        self.url = "/api/v1/leaderboard/top/"
        HighScore.objects.create(player_name="Low", score=100, level=1)
        HighScore.objects.create(player_name="Mid", score=500, level=2)
        HighScore.objects.create(player_name="High", score=1000, level=3)

    def test_no_filter_returns_all(self) -> None:
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 3)

    def test_min_score_filters_below_threshold(self) -> None:
        resp = self.client.get(self.url, {"min_score": 500})
        self.assertEqual(resp.status_code, 200)
        scores = [e["score"] for e in resp.json()]
        self.assertNotIn(100, scores)
        self.assertIn(500, scores)
        self.assertIn(1000, scores)

    def test_min_score_zero_returns_all(self) -> None:
        resp = self.client.get(self.url, {"min_score": 0})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 3)

    def test_min_score_above_all_returns_empty(self) -> None:
        resp = self.client.get(self.url, {"min_score": 9999})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), [])

    def test_invalid_min_score_returns_400(self) -> None:
        resp = self.client.get(self.url, {"min_score": "abc"})
        self.assertEqual(resp.status_code, 400)

    def test_negative_min_score_returns_400(self) -> None:
        resp = self.client.get(self.url, {"min_score": -1})
        self.assertEqual(resp.status_code, 400)

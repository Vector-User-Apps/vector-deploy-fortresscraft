from __future__ import annotations

import re


def validate_player_name(name: str) -> str:
    """Validate that a player name is 3-20 alphanumeric characters.

    Returns the stripped name if valid.
    Raises ValueError with a descriptive message if invalid.
    """
    name = name.strip()

    if len(name) < 3 or len(name) > 20:
        raise ValueError("Player name must be between 3 and 20 characters.")

    if not re.fullmatch(r"[A-Za-z0-9]+", name):
        raise ValueError("Player name must contain only letters and numbers.")

    return name

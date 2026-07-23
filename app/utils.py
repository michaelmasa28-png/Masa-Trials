import re
from app.models import Member


def generate_username(full_name: str, db):
    """
    Generate a unique username from the member's full name.

    Example:
        Michael Masa -> michaelmasa
        Michael Masa (duplicate) -> michaelmasa2
    """

    # Convert to lowercase
    username = full_name.lower()

    # Remove spaces
    username = username.replace(" ", "")

    # Remove everything except letters and numbers
    username = re.sub(r"[^a-z0-9]", "", username)

    # Keep the original username
    base_username = username

    counter = 2

    # Ensure uniqueness
    while db.query(Member).filter(Member.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    return username


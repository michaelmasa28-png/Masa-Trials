from sqlalchemy import text
from app.database import engine


columns = [
    """
    ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS message_type VARCHAR DEFAULT 'text';
    """,

    """
    ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
    """,

    """
    ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL;
    """,

    """
    ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT FALSE;
    """,

    """
    ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP NULL;
    """,

    """
    ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
    """
]


def fix_messages():

    with engine.begin() as connection:

        for sql in columns:

            print("Running:")
            print(sql)

            connection.execute(text(sql))


    print("\n✅ Messages table fixed successfully")


if __name__ == "__main__":
    fix_messages()
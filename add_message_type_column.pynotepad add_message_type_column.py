from sqlalchemy import text

from app.database import engine


def add_message_type_column():

    with engine.connect() as connection:

        result = connection.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='messages'
            AND column_name='message_type';
        """))

        exists = result.fetchone()


        if exists:

            print("✅ message_type column already exists")


        else:

            print("Adding message_type column...")


            connection.execute(text("""
                ALTER TABLE messages
                ADD COLUMN message_type VARCHAR DEFAULT 'text';
            """))


            connection.commit()


            print("✅ message_type column added successfully")



if __name__ == "__main__":

    add_message_type_column()
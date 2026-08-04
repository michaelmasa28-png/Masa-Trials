from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("Adding columns...")
    
    try:
        conn.execute(text("ALTER TABLE conversation_members ADD COLUMN last_read_message_id INTEGER"))
        conn.commit()
        print("✅ Added last_read_message_id")
    except Exception as e:
        if "already exists" in str(e).lower():
            print("ℹ️ last_read_message_id already exists")
        else:
            print(f"Error: {e}")
    
    try:
        conn.execute(text("ALTER TABLE conversation_members ADD COLUMN muted BOOLEAN DEFAULT FALSE"))
        conn.commit()
        print("✅ Added muted")
    except Exception as e:
        if "already exists" in str(e).lower():
            print("ℹ️ muted already exists")
        else:
            print(f"Error: {e}")
    
    try:
        conn.execute(text("ALTER TABLE conversation_members ADD COLUMN muted_at TIMESTAMP"))
        conn.commit()
        print("✅ Added muted_at")
    except Exception as e:
        if "already exists" in str(e).lower():
            print("ℹ️ muted_at already exists")
        else:
            print(f"Error: {e}")
    
    try:
        conn.execute(text("ALTER TABLE conversation_members ADD COLUMN archived BOOLEAN DEFAULT FALSE"))
        conn.commit()
        print("✅ Added archived")
    except Exception as e:
        if "already exists" in str(e).lower():
            print("ℹ️ archived already exists")
        else:
            print(f"Error: {e}")
    
    try:
        conn.execute(text("ALTER TABLE conversation_members ADD COLUMN archived_at TIMESTAMP"))
        conn.commit()
        print("✅ Added archived_at")
    except Exception as e:
        if "already exists" in str(e).lower():
            print("ℹ️ archived_at already exists")
        else:
            print(f"Error: {e}")
    
    print("\n✅ Database fix complete!")
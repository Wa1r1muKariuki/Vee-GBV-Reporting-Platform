# view_db.py
import sqlite3

DB_PATH = "db.sqlite"

def show_latest():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    print("Incident reports (last 5):")
    for row in cur.execute("SELECT id, county, incident_type, severity_level, notes_encrypted, timestamp FROM incident_reports ORDER BY id DESC LIMIT 5"):
        print(row)
    print("\nConversations (last 5):")
    for row in cur.execute("SELECT id, user_id, user_id_encrypted, user_message, bot_reply, timestamp FROM conversations ORDER BY id DESC LIMIT 5"):
        print(row)
    conn.close()

if __name__ == "__main__":
    show_latest()

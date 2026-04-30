from werkzeug.security import generate_password_hash
import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()
db_password=os.getenv("DB_PASSWORD")
s_a_p=os.getenv("SUPER_ADMIN_PASSWORD")
s_a_m=os.getenv("SUPER_ADMIN_EMAIL")
conn = mysql.connector.connect(
    host     = "localhost",
    user     = "root",
    password = db_password,  # ← change this to your MySQL password
    database = "missing_finder"
)

hashed = generate_password_hash(s_a_p)
cursor = conn.cursor()
cursor.execute(
    "UPDATE organizations SET password = %s WHERE email = %s",
    (hashed, s_a_m)
)
conn.commit()
conn.close()
print("✅ Done!")
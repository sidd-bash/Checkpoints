from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

MONGO_DB_URI = os.getenv("MONGO_DB_URI")
client = AsyncIOMotorClient(
    MONGO_DB_URI,
    tlsCAFile=certifi.where()  # Use system trusted certs
)
db = client.get_default_database()

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi
import asyncio

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_DB_URI")  # make sure this is correct

# Create async Mongo client with proper CA bundle
client = AsyncIOMotorClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()  # ensures Atlas cert is trusted
)

db = client.test

async def main():
    collections = await db.list_collection_names()
    print(collections)

asyncio.run(main())
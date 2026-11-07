import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/shoppilot_ai")
client = AsyncIOMotorClient(MONGODB_URI)
database = client.get_default_database()

# MongoDB Collections
users_collection = database.get_collection("users")
products_collection = database.get_collection("products")
carts_collection = database.get_collection("carts")
orders_collection = database.get_collection("orders")
transactions_collection = database.get_collection("transactions")
shopping_history_collection = database.get_collection("shopping_history")

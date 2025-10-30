from pymongo import MongoClient
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")

client = MongoClient(mongo_uri, tlsCAFile=certifi.where())  # <-- Important change
db = client[db_name]
print("Connected to MongoDB:", client.list_database_names())

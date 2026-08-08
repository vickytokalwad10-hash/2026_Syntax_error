import os
import logging
import asyncio
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("agripulse.database")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/agripulse_ai")
DB_NAME = "agripulse_ai"

# In-Memory Asynchronous Fallback Store for offline / standalone development
class InMemoryCursor:
    def __init__(self, data):
        self._data = list(data)

    def sort(self, key, direction=1):
        reverse = direction < 0
        try:
            self._data.sort(key=lambda x: x.get(key, ""), reverse=reverse)
        except Exception:
            pass
        return self

    def limit(self, n):
        self._data = self._data[:n]
        return self

    async def to_list(self, length=100):
        if length is None:
            return list(self._data)
        return list(self._data[:length])

    def __aiter__(self):
        self._iter = iter(self._data)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration


class InMemoryCollection:
    def __init__(self, name):
        self.name = name
        self.documents = []

    async def find_one(self, query):
        for doc in reversed(self.documents):
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return dict(doc)
        return None

    def find(self, query=None):
        if not query:
            return InMemoryCursor(self.documents)
        matched = []
        for doc in self.documents:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                matched.append(doc)
        return InMemoryCursor(matched)

    async def insert_one(self, document):
        doc_copy = dict(document)
        if "_id" not in doc_copy:
            import uuid
            doc_copy["_id"] = str(uuid.uuid4())
        self.documents.append(doc_copy)
        class InsertResult:
            inserted_id = doc_copy["_id"]
        return InsertResult()

    async def update_one(self, query, update):
        target = await self.find_one(query)
        if target:
            if "$set" in update:
                for k, v in update["$set"].items():
                    target[k] = v
            return True
        return False

    async def count_documents(self, query):
        count = 0
        for doc in self.documents:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                count += 1
        return count


class FallbackDatabase:
    def __init__(self):
        self.farmers = InMemoryCollection("farmers")
        self.buyers = InMemoryCollection("buyers")
        self.chat_logs = InMemoryCollection("chat_logs")
        self.offtopic_logs = InMemoryCollection("offtopic_logs")
        self.transactions = InMemoryCollection("transactions")
        self.crop_listings = InMemoryCollection("crop_listings")
        self.otp_codes = InMemoryCollection("otp_codes")
        self.is_connected = False
        self._seed_default_listings()

    def _seed_default_listings(self):
        # Pre-seed realistic crop listings for buyer marketplace
        self.crop_listings.documents.extend([
            {
                "_id": "crop_lot_101",
                "listing_id": "crop_lot_101",
                "farmer_id": "farmer_dev_01",
                "farmer_name": "Ramesh Patil",
                "farmer_phone": "9876543210",
                "crop_name": "Wheat (Sharbati Gold)",
                "category": "Grains",
                "variety": "A-Grade Sharbati",
                "quantity_quintals": 120,
                "price_per_quintal": 2750,
                "total_value": 330000,
                "location": "Nashik, Maharashtra",
                "harvest_date": "2026-03-15",
                "quality_grade": "Grade A Premium",
                "moisture_pct": 11.2,
                "status": "available",
                "created_at": datetime.now().isoformat()
            },
            {
                "_id": "crop_lot_102",
                "listing_id": "crop_lot_102",
                "farmer_id": "farmer_dev_02",
                "farmer_name": "Suresh Deshmukh",
                "farmer_phone": "9823114455",
                "crop_name": "Soybean (JS-335)",
                "category": "Oilseeds",
                "variety": "JS-335 Certified",
                "quantity_quintals": 85,
                "price_per_quintal": 4850,
                "total_value": 412250,
                "location": "Latur, Maharashtra",
                "harvest_date": "2026-03-20",
                "quality_grade": "Export Grade",
                "moisture_pct": 10.5,
                "status": "available",
                "created_at": datetime.now().isoformat()
            },
            {
                "_id": "crop_lot_103",
                "listing_id": "crop_lot_103",
                "farmer_id": "farmer_dev_03",
                "farmer_name": "Balwant Singh",
                "farmer_phone": "9814022334",
                "crop_name": "Basmati Rice (1121 Steam)",
                "category": "Paddy / Rice",
                "variety": "Pusa 1121",
                "quantity_quintals": 200,
                "price_per_quintal": 4200,
                "total_value": 840000,
                "location": "Karnal, Haryana",
                "harvest_date": "2026-03-10",
                "quality_grade": "Top Export Standard",
                "moisture_pct": 12.0,
                "status": "available",
                "created_at": datetime.now().isoformat()
            },
            {
                "_id": "crop_lot_104",
                "listing_id": "crop_lot_104",
                "farmer_id": "farmer_dev_01",
                "farmer_name": "Ramesh Patil",
                "farmer_phone": "9876543210",
                "crop_name": "Red Onion (Garwa)",
                "category": "Vegetables",
                "variety": "Nashik Garwa",
                "quantity_quintals": 50,
                "price_per_quintal": 1850,
                "total_value": 92500,
                "location": "Lasalgaon, Maharashtra",
                "harvest_date": "2026-03-25",
                "quality_grade": "Grade A Solid",
                "moisture_pct": 14.1,
                "status": "available",
                "created_at": datetime.now().isoformat()
            }
        ])


db = FallbackDatabase()
client = None

try:
    from motor.motor_asyncio import AsyncIOMotorClient
    # Check if we can connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=1500)
    mongo_db = client[DB_NAME]
    # We will use mongo_db if client succeeds, otherwise db stays as FallbackDatabase
except Exception as e:
    logger.warning(f"MongoDB not reachable ({e}). Using resilient in-memory async store.")


async def get_db():
    global db
    if client:
        try:
            # Quick ping test with timeout
            await asyncio.wait_for(client.admin.command('ping'), timeout=1.0)
            return client[DB_NAME]
        except Exception:
            return db
    return db

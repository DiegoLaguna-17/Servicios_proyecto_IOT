import json
import os

DB_PATH = "storage/embeddings.json"

def load_db():
    if not os.path.exists(DB_PATH):
        return {}
    with open(DB_PATH, "r") as f:
        return json.load(f)

def save_db(db):
    db_float = {}
    for k, v in db.items():
        # Si v[0] es lista, significa que está anidado
        if isinstance(v[0], list):
            v = v[0]
        db_float[k] = [float(x) for x in v]
    with open(DB_PATH, "w") as f:
        json.dump(db_float, f, indent=2)
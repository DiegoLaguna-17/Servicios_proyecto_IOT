from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
import numpy as np
from database import load_db, save_db
from model import get_embedding, compare_embeddings
import os
from pymongo import MongoClient
import cv2
import time
from datetime import datetime
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Definimos los orígenes permitidos. Solo tu frontend.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

load_dotenv()
# Cargar "DB"
db = load_db()

# ---------------------------------------------------------
# CONFIGURACIÓN MONGODB
# ---------------------------------------------------------
MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client.get_default_database(default="IOT") 
coleccion_asistencias = mongo_db["asistencias"]

# Configuración de la cámara (puedes mover esto a un archivo .env después)
CAM_URL = "http://192.168.1.102:8080/video"
@app.post("/recognize-stream")
async def recognize_stream():
    cap = cv2.VideoCapture(CAM_URL)

    if not cap.isOpened():
        raise HTTPException(status_code=500, detail="No se pudo conectar a la cámara IP")

    resultados = []
    frames_analizados = 0
    caras_detectadas = 0

    max_frames = 5  # 🔥 Subimos para mejor precisión

    # 🔥 Variables de liveness
    prev_embedding = None
    movimiento_detectado = False

    print("📸 Iniciando análisis con liveness...")

    while frames_analizados < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        embedding = get_embedding(frame)

        if embedding is not None:
            caras_detectadas += 1
            current = embedding.squeeze()

            # 🧠 DETECTAR MOVIMIENTO
            if prev_embedding is not None:
                diff = np.linalg.norm(current - prev_embedding)

                # 🔥 UMBRAL CLAVE (ajustable)
                if diff > 0.05:
                    movimiento_detectado = True

            prev_embedding = current

            # 🔍 RECONOCIMIENTO
            best_match = None
            best_score = 0

            for name, saved_emb in db.items():
                score = compare_embeddings(current, np.array(saved_emb))

                if score > best_score:
                    best_score = score
                    best_match = name

            if best_score > 0.60:
                resultados.append(best_match)

        frames_analizados += 1
        time.sleep(0.1)

    cap.release()

    # ---------------------------------------------------------
    # EVALUACIÓN DE RESULTADOS Y GUARDADO EN MONGODB
    # ---------------------------------------------------------
    resultado_final = ""
    frames_validos = 0
    liveness_status = False

    # 1. Determinar el estado final
    if caras_detectadas == 0:
        resultado_final = "NoFace"
    elif not movimiento_detectado:
        resultado_final = "Fake"
    elif len(resultados) == 0:
        resultado_final = "Desconocido"
    else:
        resultado_final = max(set(resultados), key=resultados.count)
        frames_validos = len(resultados)
        liveness_status = True

    # 2. Crear documento y guardar en Mongo
    documento = {
        "fecha_hora": datetime.now(),
        "resultado": resultado_final,
        "movimiento_detectado": movimiento_detectado
    }
    
    coleccion_asistencias.insert_one(documento)
    print(f"📝 Registro guardado en MongoDB: {resultado_final}")

    # 3. Retornar la respuesta al frontend
    if resultado_final in ["NoFace", "Fake", "Desconocido"]:
        return {"result": resultado_final}

    return {
        "result": resultado_final,
        "frames_validos": frames_validos,
        "liveness": liveness_status
    }
def create_master_vector(embeddings_list: list) -> np.ndarray:
    """
    Toma una lista de embeddings (arrays 1D), calcula el promedio
    y devuelve un único vector normalizado.
    """
    # 1. Convertir la lista de vectores en una matriz matemática
    matrix = np.array(embeddings_list)
    
    # 2. Calcular el promedio de cada dimensión (columna por columna)
    avg_vector = np.mean(matrix, axis=0)
    
    # 3. Normalizar el vector resultante (L2 norm) para la similitud del coseno
    master_vector = avg_vector / np.linalg.norm(avg_vector)
    
    return master_vector
# 🧪 Health check
@app.get("/health")
def health():
    return {"status": "ok"}

# 📸 Convertir imagen
def read_image(file):
    contents = file.file.read()
    nparr = np.frombuffer(contents, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

# 🧾 Registrar alumno
# 🧾 Registrar alumno (Múltiples fotos)
@app.post("/register")
async def register(name: str, files: List[UploadFile] = File(...)):
    valid_embeddings = []

    # Procesar cada imagen subida
    for file in files:
        image = read_image(file)
        embedding = get_embedding(image)

        if embedding is not None:
            # Aseguramos que sea un vector 1D de (512,) y lo agregamos
            valid_embeddings.append(embedding.squeeze())
        else:
            print(f"⚠️ No se detectó rostro en una de las imágenes de {name}")

    # Verificamos si al menos una foto tuvo un rostro válido
    if not valid_embeddings:
        raise HTTPException(
            status_code=400, 
            detail="No se detectó ningún rostro en las imágenes proporcionadas."
        )

    # Crear el Vector Maestro promediando todos los embeddings válidos
    master_vector = create_master_vector(valid_embeddings)

    # Guardar en la base de datos como una lista plana simple
    if name not in db:
        db[name] = []
        
    db[name] = master_vector.tolist()
    save_db(db)

    return {
        "message": f"{name} registrado correctamente.",
        "fotos_procesadas": len(valid_embeddings),
        "fotos_recibidas": len(files)
    }
# 🧠 Reconocer rostro
# 🧠 Reconocer rostro
@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    image = read_image(file)
    embedding = get_embedding(image)

    if embedding is None:
        return {"result": "No face detected"}

    best_match = None
    best_score = 0
    input_vector = embedding.squeeze()

    # Búsqueda lineal eficiente
    for name, saved_emb in db.items():
        score = compare_embeddings(input_vector, np.array(saved_emb))

        if score > best_score:
            best_score = score
            best_match = name

    # Ajusta tu umbral (0.65 es un buen punto de partida para ArcFace)
    if best_score > 0.60:
        return {"result": best_match, "score": float(best_score)}
    else:
        return {"result": "Desconocido", "score": float(best_score)}
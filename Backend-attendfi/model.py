import cv2
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from inference import FaceAnalysis

app_model = FaceAnalysis()

def get_embedding(image):
    return app_model.get_embedding(image)

def compare_embeddings(emb1, emb2):
    # Asegúrate de que emb1 y emb2 sean numpy arrays 1D
    return np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
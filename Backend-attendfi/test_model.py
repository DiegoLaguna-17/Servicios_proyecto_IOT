from inference import FaceAnalysis
import numpy as np

app = FaceAnalysis()

emb1 = app.get_embedding("lagu1.jpeg")
emb2 = app.get_embedding("yit.jpeg")

def cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

score = cosine(emb1, emb2)

print("Similitud:", score)
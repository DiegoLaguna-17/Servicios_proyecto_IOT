import cv2
import numpy as np
from insightface.app import FaceAnalysis as InsightFaceApp
import os
# Desactiva la búsqueda de aceleración por hardware de ONNX antes de importar insightface
os.environ['ORT_LOGGING_LEVEL'] = '3'
class FaceAnalysis:
    def __init__(self, device='cpu'):
        # Puedes cambiar a 'cuda' si instalaste onnxruntime-gpu y tienes NVIDIA
        print(f"🚀 Inicializando InsightFace en {device}...")
        ctx_id = 0 if device == 'cuda' else -1
        
        # Cargamos el paquete 'buffalo_l' (Es el estándar de la industria, incluye detector SCRFD y reconocedor ArcFace ResNet50)
        self.app = InsightFaceApp(name='buffalo_l')
        
        # det_size=(640, 640) es el tamaño de la imagen que el detector analiza. 
        # Es un buen equilibrio entre velocidad y precisión.
        self.app.prepare(ctx_id=ctx_id, det_size=(640, 640))
        print("✅ Sistema InsightFace Listo!")

    def get_embedding(self, image_source):
        """
        Recibe una imagen, detecta rostros, los alinea automáticamente
        y extrae el embedding normalizado del rostro más grande.
        """
        # 1. Asegurar que la imagen sea un Numpy Array BGR (Formato OpenCV)
        if isinstance(image_source, str):
            img_bgr = cv2.imread(image_source)
        elif isinstance(image_source, np.ndarray):
            # Asumimos que viene de cv2.imdecode (ya es BGR) en FastAPI
            img_bgr = image_source
        else:
            raise ValueError("El formato de imagen no es soportado. Usa path o numpy array BGR.")

        # 2. La magia: Detección, Alineación y Extracción en una sola línea
        faces = self.app.get(img_bgr)

        # 3. Manejo de casos sin rostros
        if len(faces) == 0:
            print("⚠️ Warning: No face detected.")
            return None

        # 4. Seleccionar el rostro más grande (ideal para registros y validación 1 a 1)
        best_face = faces[0]
        max_area = 0
        
        for face in faces:
            box = face.bbox
            area = (box[2] - box[0]) * (box[3] - box[1])
            if area > max_area:
                max_area = area
                best_face = face

        # 5. Retornar el vector de características (ya viene normalizado y en numpy 1D)
        # Esto reemplaza tu tensor.squeeze().numpy() anterior
        embedding = best_face.normed_embedding
        
        return embedding
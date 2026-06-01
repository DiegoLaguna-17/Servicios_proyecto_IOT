import axios from "axios";

const apiFacial = axios.create({
  baseURL: "http://localhost:8000",
  // No fijamos el Content-Type global para que Axios ponga automáticamente multipart/form-data y su boundary
});

export const registrarRostro = async (ci, files) => {
    try {
        const formData = new FormData();

        // ❌ NO enviar name en formData
        // formData.append("name", ci); ← ELIMINAR

        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        const response = await apiFacial.post(
            `/register?name=${ci}`, // 🔥 AQUÍ VA
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );
        
        return { success: true, data: response.data };

    } catch (error) {
        if (error.response) {
            return { success: false, data: error.response.data };
        }
        return { success: false, message: "Error de conexión con el servidor facial (8000)" };
    }
};
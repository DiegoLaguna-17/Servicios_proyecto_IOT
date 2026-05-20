import apiIOT from "./apiIOT";

export const obtenerAsistenciasIOT = async () => {
    try {
        const response = await apiIOT.get("/asistencias");
        return response.data;
    } catch (error) {
        if (error.response) return error.response.data;
        return { success: false, message: "Error de conexión con el servidor IOT (3000)" };
    }
};

import api from "../../../services";

const getToken = () => localStorage.getItem("token");

export const obtenerMiProgreso = async (materiaId) => {
  try {
    const token = getToken();

    const response = await api.get(
      `/asistencias/mis-asistencias/${materiaId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return {
      exito: true,
      mensaje: response.data.message || "Progreso obtenido correctamente",
      data: response.data.data
    };

  } catch (error) {
    if (error.response) {
      return {
        exito: false,
        mensaje: error.response.data.message || "Error al obtener progreso",
        errores: error.response.data.data || [],
        status: error.response.status
      };
    }

    return {
      exito: false,
      mensaje: "Error de conexión con el servidor",
      errores: ["No se pudo conectar con el backend"]
    };
  }
};

export const listarNotasMaterias= async (materiaId) => {
  return api.get(`/estudiantes/mis-notas/${materiaId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};


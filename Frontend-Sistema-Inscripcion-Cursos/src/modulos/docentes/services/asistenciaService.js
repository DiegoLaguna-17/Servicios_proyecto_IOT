import api from "../../../services";

// Función auxiliar para obtener el token
const getToken = () => {
  return localStorage.getItem("token");
};

// Obtener historial de asistencias de una materia
export const obtenerHistorialMateria = async (materiaId) => {
  try {
    const token = getToken();

    const response = await api.get(`/asistencias/materia/${materiaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      exito: true,
      mensaje: response.data.message || "Historial obtenido correctamente",
      data: response.data.data || [],
    };

  } catch (error) {
    if (error.response) {
      return {
        exito: false,
        mensaje: error.response.data.message || "Error al obtener historial",
        errores: error.response.data.data || [],
        status: error.response.status,
      };
    }

    return {
      exito: false,
      mensaje: "Error de conexión con el servidor",
      errores: ["No se pudo conectar con el backend"],
    };
  }
};


// Registrar asistencia de toda la clase
export const registrarAsistenciaClase = async (materiaId, datos) => {
  try {
    const token = getToken();

    const response = await api.post(
      `/asistencias/materia/${materiaId}`,
      datos,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      exito: true,
      mensaje: response.data.message || "Asistencia registrada correctamente",
      data: response.data.data,
    };

  } catch (error) {
    if (error.response) {
      return {
        exito: false,
        mensaje: error.response.data.message || "Error al registrar asistencia",
        errores: error.response.data.data || [],
        status: error.response.status,
      };
    }

    return {
      exito: false,
      mensaje: "Error de conexión con el servidor",
      errores: ["No se pudo conectar con el backend"],
    };
  }
};
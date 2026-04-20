import api from "../../../services";

const token = localStorage.getItem("token");


export const listarCarreras = async () => {
  return api.get("/carreras", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

 export const verCarrera = async (id) => {
  return api.get(`/carreras/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const listarCursos = async () => {
  return api.get("/cursos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const listarExtra = async () => {
  return api.get("/cursos-extracurriculares", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const registrarCarrera = async (datos) => {
  try {
    const response = await api.post("/carreras", datos, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    return {
      exito: false,
      mensaje: "Error de conexion con el servidor",
      errores: ["No se pudo conectar con el backend"],
    };
  }
};
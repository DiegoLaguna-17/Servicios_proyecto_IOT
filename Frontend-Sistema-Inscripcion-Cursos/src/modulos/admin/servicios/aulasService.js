import api from "../../../services";

const token = localStorage.getItem("token");

export const listAllAulas = async () => {
  try {
    const response = await api.get("/aulas/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) return error.response.data;
    return {
      exito: false,
      mensaje: "Error al conectarse con el servidor",
      errores: ["No se pudo conectar al servidor"],
    };
  }
};

export const registrarAula = async (data) => {
  try {
    const response = await api.post("/aulas/nuevaAula", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) return error.response.data;
    return {
      exito: false,
      mensaje: "Error al conectarse con el servidor",
      errores: ["No se pudo conectar al servidor"],
    };
  }
};

import api from "../../../services";

export const listarMisMaterias = async (ci) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(`/docentes/${ci}/materias`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.log("Error al listar materias del docente:", error);

    return {
      exito: false,
      mensaje: error.response?.data?.mensaje || "Error al obtener las materias",
      status: error.response?.status || 500,
    };
  }
};

export const listarNotasMateria = async (id_materia) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(`/docentes/${id_materia}/notas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.log("Error al listar notas de la materia:", error);

    return {
      exito: false,
      mensaje: error.response?.data?.mensaje || "Error al obtener las notas",
      status: error.response?.status || 500,
    };
  }
};

export const registrarNotas = async (datos) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/docentes/registrar-notas", datos, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      exito: true,
      mensaje: response.data.mensaje,
      data: response.data.data,
    };
  } catch (error) {
    console.log("Error al registrar notas:", error);

    return {
      exito: false,
      mensaje: error.response?.data?.mensaje || "Error al registrar notas",
      errores: error.response?.data?.errores || [],
      status: error.response?.status || 500,
    };
  }
};

export const editarNotas = async (datos) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put("/docentes/editar-notas", datos, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      exito: true,
      mensaje: response.data.mensaje,
      data: response.data.data,
      errores: response.data.errores || [],
    };
  } catch (error) {
    console.log("Error al editar notas:", error);
    console.log("STATUS:", error.response?.status);
    console.log("DATA BACK:", error.response?.data);

    return {
      exito: false,
      mensaje: error.response?.data?.mensaje || "Error al actualizar notas",
      errores: error.response?.data?.errores || [],
      status: error.response?.status || 500,
    };
  }
};

export const enviarCertificadosLote = async (payload) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.post("/certificados/enviar-lote", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      exito: true,
      mensaje: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error enviando lote de certificados:", error);
    return {
      exito: false,
      mensaje:
        error.response?.data?.message || "Error al enviar los certificados",
      status: error.response?.status || 500,
    };
  }
};

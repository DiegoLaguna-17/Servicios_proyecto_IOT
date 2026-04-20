import api from "../../../services";

const token = localStorage.getItem("token");

export const logout =async ()=>{
    try{
        return api.post("/auth/logout");
    }catch(error){
        if (error.response) {
      return error.response.data;
    }
    return {
      exito: false,
      mensaje: "Error de conexion con el servidor",
      errores: ["No se pudo conectar con el backend"],
    };
    }

}

export const listarAdministradores = async () => {
  return api.get("/administradores", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const listarEstudiantes = async () => {
  return api.get("/estudiantes", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const listarDocentes = async () => {
  return api.get("/docentes", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const registrarAdministrador = async (datos) => {
  try {
    const response = await api.post("/administradores/registro", datos, {
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

export const registrarEstudiante = async (datos) => {
  try {
    const response = await api.post("/estudiantes", datos, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    return {
      exito: true,
      mensaje: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    return {
      exito: false,
      mensaje:
        error.response?.data?.message || "Error de conexión con el servidor",
      status: error.response?.status || 500,
    };
  }
};

export const registrarDocente = async (datos) => {
  try {
    const response = await api.post("/docentes", datos, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    return response;
  } catch (error) {
    return (
      error.response || { status: 500, data: { message: "Error de conexión" } }
    );
  }
};

export const editarAdministrador = async (ci, datos) => {
  try {
    const response = await api.patch(`/administradores/${ci}`, datos, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

    // response.data es lo que devuelve tu backend
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    return {
      exito: false,
      mensaje: "Error de conexión con el servidor",
      errores: ["No se pudo conectar con el backend"],
    };
  }
};

export const editarDocente = async (ci, datosActualizar) => {
  try {
    const response = await api.put(`/docentes/${ci}`, datosActualizar, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

    // Axios devuelve el objeto dentro de response.data
    return response.data;
  } catch (error) {
    if (error.response) return error.response.data;

    return {
      success: false,
      message: "Error de conexión con el servidor",
      error: "No se pudo conectar al backend",
    };
  }
};



export const editarEstudiante= async(ci,datos)=>{
    try{
        const response= await api.put(`/estudiantes/${ci}`,datos,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        return response.data;
    }catch(error){
        if (error.response) return error.response.data;

    return {
      success: false,
      message: "Error de conexión con el servidor",
      error: "No se pudo conectar al backend",
    };
    }
}
export const eliminarEstudiante = async (ci) => {
  try {
    const response = await api.delete(`/estudiantes/${ci}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    return response.data;
  } catch (error) {
    if (error.response) return error.response.data;

    return {
      success: false,
      message: "Error de conexión",
      error: "No se pudo establecer conexión con el backend",
    };
  }
};

export const eliminarDocente = async (ci) => {
  try {
    const response = await api.delete(`/docentes/${ci}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    return response.data;
  } catch (error) {
    if (error.response) return error.response.data;

    return {
      success: false,
      message: "Error de conexión",
      error: "No se pudo establecer conexión con el backend",
    };
  }
};

export const eliminarAdministrador = async (ci) => {
  try {
    const response = await api.delete(`/administradores/${ci}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    return response.data;
  } catch (error) {
    if (error.response) return error.response.data;

    return {
      success: false,
      message: "Error de conexión",
      error: "No se pudo establecer conexión con el backend",
    };
  }
};

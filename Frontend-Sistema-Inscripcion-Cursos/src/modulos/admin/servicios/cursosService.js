import api from "../../../services";

// Función auxiliar para obtener el token
const getToken = () => {
  return localStorage.getItem("token");
};

// ============================================
// CURSOS NORMALES (Por Carrera)
// ============================================

/**
 * Registrar un curso normal (obligatorio)
 * POST /api/cursos
 */
export const registrarCurso = async (datos) => {
  try {
    const token = getToken();
    const response = await api.post("/cursos", datos, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      exito: true,
      mensaje: response.data.message || "Curso registrado correctamente",
      data: response.data.data,
    };
  } catch (error) {
    if (error.response) {
      return {
        exito: false,
        mensaje: error.response.data.message || "Error al registrar el curso",
        errores: error.response.data.errores || [],
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

/**
 * Editar un curso existente
 * PUT /api/cursos/:id
 */
export const editarCurso = async (id, datos) => {
  try {
    const token = getToken();
    const response = await api.put(`/cursos/${id}`, datos, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      exito: true,
      mensaje: response.data.message || "Curso actualizado correctamente",
      data: response.data.data,
    };
  } catch (error) {
    if (error.response) {
      return {
        exito: false,
        mensaje: error.response.data.message || "Error al editar el curso",
        errores: error.response.data.errores || [],
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

/**
 * Eliminar un curso
 * DELETE /api/cursos/:id
 */
export const eliminarCurso = async (id) => {
  try {
    const token = getToken();
    const response = await api.delete(`/cursos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: true,
      message: response.data.message || "Curso eliminado correctamente",
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || "Error al eliminar el curso",
      };
    }
    return {
      success: false,
      message: "Error de conexión con el servidor",
    };
  }
};

// ============================================
// CURSOS EXTRACURRICULARES (Sin Carrera)
// ============================================

/**
 * Registrar un curso extracurricular
 * POST /api/cursos-extracurriculares
 */
export const registrarCursoExtracurricular = async (datos) => {
  try {
    const token = getToken();
    
    // Asegurar que no se envíen campos que el backend no necesita
    const { tipo, carrera, ...datosLimpios } = datos;
    
    const response = await api.post("/cursos-extracurriculares", datosLimpios, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      exito: true,
      mensaje: response.data.message || "Curso extracurricular registrado correctamente",
      data: response.data.data,
    };
  } catch (error) {
    if (error.response) {
      return {
        exito: false,
        mensaje: error.response.data.message || "Error al registrar el curso extracurricular",
        errores: error.response.data.errores || [],
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

/**
 * Editar un curso extracurricular
 * PUT /api/cursos-extracurriculares/:id
 */
export const editarCursoExtracurricular = async (id, datos) => {
  try {
    const token = getToken();
    
    // Asegurar que no se modifiquen campos restringidos
    const { tipo, carrera_codigo, carrera, ...datosLimpios } = datos;
    
    const response = await api.put(`/cursos-extracurriculares/${id}`, datosLimpios, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      exito: true,
      mensaje: response.data.message || "Curso extracurricular actualizado correctamente",
      data: response.data.data,
    };
  } catch (error) {
    if (error.response) {
      return {
        exito: false,
        mensaje: error.response.data.message || "Error al editar el curso extracurricular",
        errores: error.response.data.errores || [],
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

/**
 * Eliminar un curso extracurricular
 * DELETE /api/cursos-extracurriculares/:id
 */
export const eliminarCursoExtracurricular = async (id) => {
  try {
    const token = getToken();
    const response = await api.delete(`/cursos-extracurriculares/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: true,
      message: response.data.message || "Curso extracurricular eliminado correctamente",
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || "Error al eliminar el curso extracurricular",
      };
    }
    return {
      success: false,
      message: "Error de conexión con el servidor",
    };
  }
};

// ============================================
// DOCENTES
// ============================================

/**
 * Listar todos los docentes disponibles
 * GET /api/docentes
 */
export const listarDocentes = async () => {
  try {
    const token = getToken();
    const response = await api.get("/docentes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      exito: true,
      data: response.data.data || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    if (error.response) {
      return {
        exito: false,
        mensaje: error.response.data.mensaje || "Error al listar docentes",
        data: [],
      };
    }
    return {
      exito: false,
      mensaje: "Error de conexión con el servidor",
      data: [],
    };
  }
};

// ============================================
// AULAS
// ============================================

/**
 * Listar todas las aulas disponibles
 * GET /api/aulas
 */
export const listarAulas = async () => {
  try {
    const token = getToken();
    const response = await api.get("/aulas", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      exito: true,
      data: response.data.data || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    if (error.response) {
      return {
        exito: false,
        mensaje: error.response.data.mensaje || "Error al listar aulas",
        data: [],
      };
    }
    return {
      exito: false,
      mensaje: "Error de conexión con el servidor",
      data: [],
    };
  }
};

// ============================================
// INFORMACIÓN DE PAGOS POR CURSO
// ============================================

/**
 * Obtener lista de estudiantes y sus pagos de un curso
 * GET /api/cursos/:id/estudiantes-pagos
 */
export const obtenerEstudiantesPagosCurso = async (id) => {
  try {
    const token = getToken();
    const response = await api.get(`/cursos/${id}/estudiantes-pagos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      exito: true,
      data: response.data.data,
      mensaje: response.data.message || "Datos obtenidos correctamente",
    };
  } catch (error) {
    if (error.response) {
      return {
        exito: false,
        mensaje: error.response.data.message || "Error al obtener los datos",
        data: null,
        status: error.response.status,
      };
    }
    return {
      exito: false,
      mensaje: "Error de conexión con el servidor",
      data: null,
    };
  }
};

/**
 * Obtener resumen de pagos de un curso
 * GET /api/cursos/:id/resumen-pagos
 */
export const obtenerResumenPagosCurso = async (id) => {
  try {
    const token = getToken();
    const response = await api.get(`/cursos/${id}/resumen-pagos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      exito: true,
      data: response.data.data,
      mensaje: response.data.message || "Resumen obtenido correctamente",
    };
  } catch (error) {
    if (error.response) {
      return {
        exito: false,
        mensaje: error.response.data.message || "Error al obtener el resumen",
        data: null,
        status: error.response.status,
      };
    }
    return {
      exito: false,
      mensaje: "Error de conexión con el servidor",
      data: null,
    };
  }
};
import api from "../../../services";



export const obtenerSeries=async()=>{
    return api.get("/series")
}


export const crearCalculo=async(datos)=>{
    try{
        const response=await api.post("/calculos",datos)
        return response.data;
    }catch (error) {
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

export const obtenerSeriesDatos=async(id)=>{
    return api.get(`/calculos/serie/${id}`)
}



export const obtenerAsistencias = async () => {
    try {
        const response = await api.get("/asistencias");
        return response.data;
    } catch (error) {
        if (error.response) return error.response.data;
        return { success: false, message: "Error de conexión con el servidor" };
    }
};
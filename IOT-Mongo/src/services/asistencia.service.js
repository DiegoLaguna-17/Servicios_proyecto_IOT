const { MongoClient } = require("mongodb");
require("dotenv").config();
const axios=require("axios")
// Configuración de conexión usando tu variable de entorno
const MONGO_URI = process.env.MONGO_URI;
const client = new MongoClient(MONGO_URI);
const SIXSEVEN=process.env.SIXSEVEN_URL;

const obtenerHistorialAsistencias = async () => {
    try {
        await client.connect();
        const db = client.db("IOT");
        const coleccion = db.collection("asistencias");

        // Obtenemos todos los registros y ocultamos el _id nativo de Mongo
        const asistencias = await coleccion.find({}, { projection: { _id: 0 } }).toArray();
        return asistencias;
    } catch (error) {
        throw new Error("Error al consultar la base de datos de MongoDB: " + error.message);
    }
};


const consultarHorariosCursosDia = async (dia, aula) => {
    try {
        // Hacemos la petición GET al endpoint que creamos antes
        // No enviamos token porque lo dejamos público
        const response = await axios.get(`${SIXSEVEN}/cursos/buscar?dia=${dia}&aula=${aula}`);

        // Retornamos los datos que devuelve tu endpoint
        return response.data;
    } catch (error) {
        console.error("❌ Error al llamar al servicio de cursos:", error);
        throw new Error("No se pudo obtener la información del cronograma");
    }
};
module.exports = {
    obtenerHistorialAsistencias,
    consultarHorariosCursosDia
};
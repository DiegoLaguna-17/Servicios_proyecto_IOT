const asistenciaService = require("../services/asistencia.service");

const getAsistencias = async (req, res) => {
    try {
        // Llamamos al servicio
        const data = await asistenciaService.obtenerHistorialAsistencias();
        
        // Respondemos al frontend
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error("❌ ERROR BACKEND ASISTENCIAS:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



async function checkHorarioMateria(req, res) {
    try {
        const { dia, aula } = req.query;

        // Llamamos al servicio que consume el otro endpoint
        const resultado = await asistenciaService.consultarHorariosCursosDia(dia, aula);

        return res.status(200).json({
            success: true,
            message: "Información recuperada desde el servicio de Cursos",
            info: resultado
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}



module.exports = {
    getAsistencias,
    checkHorarioMateria
};
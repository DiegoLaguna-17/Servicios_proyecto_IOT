const asistenciaService = require("../services/asistencia.service");


// DOCENTE
async function registrarAsistenciaClase(req, res, next) {
  try {

    const { materiaId } = req.params;
    const { fecha, asistencias } = req.body;

    if (!fecha) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
        data: ["La fecha es obligatoria"]
      });
    }

    if (!Array.isArray(asistencias) || asistencias.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
        data: ["Debe enviar la lista de asistencias"]
      });
    }

    const result = await asistenciaService.registrarAsistenciaClase(
      materiaId,
      fecha,
      asistencias
    );

    res.status(201).json({
      success: true,
      message: "Registro creado exitosamente",
      data: result
    });

  } catch (error) {
    next(error);
  }
}


async function obtenerHistorialMateria(req, res, next) {
   try {

    const { materiaId } = req.params;

    const result = await asistenciaService.obtenerHistorialMateria(materiaId);

    res.status(200).json({
      success: true,
      message: "Datos obtenidos correctamente",
      data: result
    });

  } catch (error) {
    next(error);
  }
}


// ESTUDIANTE
async function misAsistenciasPorMateria(req, res, next) {
  try {

    const { materiaId } = req.params;
    const estudianteId = req.usuario.ci;

    const result = await asistenciaService.misAsistenciasPorMateria(
      estudianteId,
      materiaId
    );

    res.status(200).json({
      success: true,
      message: "Datos obtenidos correctamente",
      data: result,
    });

  } catch (error) {
    next(error);
  }
}


// Reutilizamos tus funciones de respuesta
function ok(res, message, data = null, status = 200) {
    return res.status(status).json({
        ok: true,
        message,
        data
    });
}

function fail(res, message, data = null, status = 400) {
    return res.status(status).json({ success: false, message, data });
}

async function registrarAsistenciaESP(req, res) {
    try {
        const { usuario_ci, materia_id_materia } = req.body;

        // 👇 DEBUG: ver qué está llegando realmente
        console.log("BODY COMPLETO:", req.body);
        console.log("CI:", usuario_ci);
        console.log("Materia:", materia_id_materia);

        if (!usuario_ci || !materia_id_materia) {
            return fail(res, "El CI del usuario y el ID de la materia son obligatorios");
        }

        // 👇 Prueba temporal (sin service)
        const asistencia = await asistenciaService.registrarAsistenciaESP(
            usuario_ci,
            materia_id_materia
        );

       return ok(res, "Asistencia registrada", {
          usuario_ci,
          materia_id_materia
      }, 200);

        // 🔥 Luego vuelves a esto:
        // const asistencia = await asistenciaService.registrarAsistenciaEstudiante(usuario_ci, materia_id_materia);
        // return ok(res, "Asistencia registrada exitosamente", asistencia, 201);

    } catch (err) {
        const status = err.status || 500;
        return fail(res, err.message, err.data || null, status);
    }
}


module.exports = {
  registrarAsistenciaClase,
  obtenerHistorialMateria,
  misAsistenciasPorMateria,
  registrarAsistenciaESP
};
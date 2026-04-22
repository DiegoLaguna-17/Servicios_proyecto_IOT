const supabase = require("../config/supabase");

// registrar asistencia de toda la clase
async function registrarAsistenciaClase(materiaId, fecha, asistencias) {

  const registros = asistencias.map(a => ({
    materia_id_materia: materiaId,
    usuario_ci: a.ci,
    fecha: fecha,
    estado: a.estado
  }));

  const { data, error } = await supabase
    .from("asistencia")
    .insert(registros)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// historial para docente
async function obtenerHistorialMateria(materiaId) {
 try {

    const { data, error } = await supabase
  .from("inscripciones_materia")
  .select(`
    materia_id_materia,
    inscripcion:inscripcion_id_inscripcion (
      usuario:usuario_ci (
        ci,
        nombre,
        asistencia:asistencia!asistencia_usuario (
          fecha,
          estado,
          materia_id_materia
        )
      )
    )
  `)
  .eq("materia_id_materia", materiaId)
  .eq("estado_academico","EN_CURSO");

    if (error) throw error;

    const estudiantes = data.map((e) => {

      const usuario = e.inscripcion?.usuario;

      const asistencias =
        (usuario?.asistencia || [])
          .filter(a => a.materia_id_materia === materiaId)
          .map(a => ({
            fecha: a.fecha,
            estado: a.estado
          }));

      return {
        ci: usuario?.ci,
        nombre: usuario?.nombre ?? "Sin nombre",
        asistencias: asistencias.length > 0
          ? asistencias
          : [
              {
                fecha: null,
                estado: null
              }
            ]
      };

    });

    return estudiantes;

  } catch (error) {
    console.error("Error en obtenerAsistenciaClase:", error);
    throw error;
  }
}

// conteo de asistencias del estudiante
async function misAsistenciasPorMateria(estudianteId, materiaId) {

  const { data, error } = await supabase
    .from("asistencia")
    .select("estado")
    .eq("usuario_ci", estudianteId)
    .eq("materia_id_materia", materiaId);

  if (error) {
    throw new Error(error.message);
  }

  const presentes = data.filter(a => a.estado).length;
  const faltas = data.filter(a => !a.estado).length;

  return {
    presentes,
    faltas,
    total: data.length
  };
}

async function registrarAsistenciaESP(usuario_ci, materia_id) {
    try {
        // 1️⃣ Verificar inscripción REAL (Corregido con !inner)
        // El !inner fuerza un INNER JOIN. Si el CI no está inscrito en esa materia, no devuelve nada.
        const { data: inscripcion, error: errorInscripcion } = await supabase
            .from('inscripciones_materia')
            .select(`
                materia_id_materia,
                inscripcion!inner (
                    usuario_ci
                )
            `)
            .eq('materia_id_materia', materia_id)
            .eq('inscripcion.usuario_ci', usuario_ci)
            .maybeSingle();

        if (errorInscripcion) {
            const err = new Error("Error al consultar la base de datos para la inscripción");
            err.status = 500;
            err.data = errorInscripcion;
            throw err;
        }

        if (!inscripcion) {
            const err = new Error("El estudiante no está inscrito en esta materia");
            err.status = 403;
            throw err;
        }

        // 2️⃣ EVITAR DUPLICADOS
        // La fecha en formato YYYY-MM-DD encaja perfecto con tu columna 'date' de Postgres
        const hoy = new Date().toISOString().split('T')[0];

        const { data: existente } = await supabase
            .from('asistencia')
            .select('id_asistencia')
            .eq('usuario_ci', usuario_ci)
            .eq('materia_id_materia', materia_id)
            .eq('fecha', hoy)
            .maybeSingle();

        if (existente) {
            return {
                ok: true,
                message: "La asistencia ya fue registrada exitosamente el día de hoy",
                // Devolvemos el ID existente por si el frontend lo necesita
                data: existente 
            };
        }

        // 3️⃣ Insertar asistencia
        // Las llaves foráneas coinciden perfectamente con tu esquema
        const { data: nuevaAsistencia, error: errorAsistencia } = await supabase
            .from('asistencia')
            .insert([{
                usuario_ci: usuario_ci,
                materia_id_materia: materia_id,
                fecha: hoy,
                estado: true
            }])
            .select()
            .single();

        if (errorAsistencia) {
            const err = new Error("Error al guardar el registro de asistencia");
            err.status = 500;
            err.data = errorAsistencia;
            throw err;
        }

        // 4️⃣ Respuesta limpia
        return {
            ok: true,
            message: "Asistencia registrada correctamente",
            data: nuevaAsistencia
        };

    } catch (error) {
        throw error;
    }
}

module.exports = {
  registrarAsistenciaClase,
  obtenerHistorialMateria,
  misAsistenciasPorMateria,
  registrarAsistenciaESP
};
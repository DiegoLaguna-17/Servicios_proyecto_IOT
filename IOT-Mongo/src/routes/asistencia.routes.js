const express = require("express");
const router = express.Router();
const asistenciaController = require("../controllers/asistencia.controller");

// Ruta GET: /api/asistencias
router.get("/", asistenciaController.getAsistencias);

// /verificar-aula?dia=Lunes&aula=Lab-4

router.get("/verificar-aula", asistenciaController.checkHorarioMateria);

module.exports = router;
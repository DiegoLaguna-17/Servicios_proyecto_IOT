const express = require("express");
const router = express.Router();
const camController = require("../controllers/ipcam.controller");

// cam.routes.js
router.post("/foto", (req, res) => {
  const { materia } = req.body;
  camController.procesarReconocimientoDirecto(materia);
  res.json({ status: "proceso_iniciado" }); // Respuesta rápida al ESP32
  
});


module.exports = router;
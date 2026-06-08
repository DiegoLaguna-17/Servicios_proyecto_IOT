const express = require("express");
const router = express.Router();
const camController = require("../controllers/ipcam.controller");

// cam.routes.js
router.post("/foto", async (req, res) => {
  const { materia, ip_esp, aula } = req.body;

  try {
    const respuesta = await camController.procesarReconocimientoDirecto(materia, ip_esp);

    res.json(respuesta); // 👈 aquí mandas el color al ESP

  } catch (error) {
    console.error("Error en /foto:", error.message);

    res.json({
      color: [65535, 0, 65535],
      interval: 5,
      command: "error"
    });
  }
});
module.exports = router;
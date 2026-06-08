const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
require("dotenv").config();

// 🟢 IMPORTAR EL SOCKET
// Ajusta la ruta '../socket' dependiendo de en qué carpeta esté tu ipcam.controller.js
const { getIO }=require("../socket")

const CAM_IP = process.env.CAM_IP;
const CAM_PORT = process.env.CAM_PORT;
const USUARIO = process.env.CAM_USER;
const PASSWORD = process.env.CAM_PASS;
//const ESP_IP = "192.168.1.105"; 
const FASTAPI_URL = "http://attendfi:8000/recognize-stream";

let grabando = false;
let procesando = false;

async function setESPColor(esp_ip,r, g, b) {
  try {
    const url = `http://${esp_ip}/rgb?r=${r}&g=${g}&b=${b}`;
    await axios.get(url, { timeout: 1500 });
    console.log(`[ESP32] ${esp_ip} Color actualizado -> R:${r} G:${g} B:${b}`);
  } catch (error) {
    console.warn(`[ESP32] ${esp_ip} Error comunicando color:`, error.message);
  }
}

async function notificarESP(req, res) {
  const esp_ip = req.body.ip_esp;
  await setESPColor(esp_ip,0, 0, 65535);
  res.json({ status: "notificado, brillando azul por 3s" });

  setTimeout(() => {
    console.log("Fin de notificación, volviendo a verde...");
    setESPColor(esp_ip,0, 65535, 0); 
  }, 3000);
}

// ipcam.controller.js optimizado


// URL de tu backend principal (ajusta el puerto si es necesario)
const BACKEND_ASISTENCIAS_URL = "http://inscripciones:3001/api/asistencias/registrarESP";

// 💡 NOTA: Ahora la función recibe 'materia_id_materia' como parámetro
async function procesarReconocimientoDirecto(materia_id_materia, esp_ip) {
  if (procesando) return { color: [0,0,0], interval: 5 };

  procesando = true;

  console.log(`🔴 Procesando... ${esp_ip}`);

  // 👉 color inicial (procesando)
  let responseESP = {
    color: [65535, 0, 0],
    interval: 5,
    command: "none"
  };

  try {
    const response = await axios.post(FASTAPI_URL);
    const data = response?.data;

    if (!data || !data.result) {
      throw new Error("Respuesta inválida del backend");
    }

    // SOCKET (igual que antes)
    try {
      const io = getIO();
      io.emit("nuevaAsistencia", {
        fecha_hora: new Date().toISOString(),
        resultado: data.result,
        movimiento_detectado: data.result !== "Fake" && data.result !== "NoFace"
      });
    } catch (e) {}

    // 🟡 NO FACE
    if (data.result === "NoFace") {
      console.log("🚫 No hay rostro");
      responseESP.color = [65535, 65535, 0];
    }

    // 🟣 FAKE
    else if (data.result === "Fake") {
      console.log("🚫 Fake");
      responseESP.color = [65535, 0, 65535];
    }

    // 🔴 DESCONOCIDO
    else if (data.result === "Desconocido") {
      console.log("❌ Desconocido");
      responseESP.color = [65535, 0, 0];
    }

    // 🔵 RECONOCIDO
    else {
      const usuario_ci = data.result;

      if (!materia_id_materia || materia_id_materia === "Aula libre / Sin clase") {
        console.log("⚠️ Reconocido pero sin clase");
        responseESP.color = [0, 65535, 65535];
      } else {
        try {
          await axios.post(BACKEND_ASISTENCIAS_URL, {
            usuario_ci,
            materia_id_materia
          });

          console.log(`✅ OK ${usuario_ci} en ${materia_id_materia}`);
          responseESP.color = [0, 0, 65535];

        } catch (dbError) {
          console.error("❌ DB error");
          responseESP.color = [65535, 32768, 0];
        }
      }
    }

  } catch (error) {
    console.error("❌ Error general:", error.message);
    responseESP.color = [65535, 0, 65535];
  } finally {
    procesando = false;
  }

  return responseESP;
}
module.exports = {
  notificarESP,
  setESPColor,
  procesarReconocimientoDirecto,
};
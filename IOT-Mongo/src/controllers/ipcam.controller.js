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
const ESP_IP = "192.168.1.105"; 
const FASTAPI_URL = "http://attendfi:8000/recognize-stream";

let grabando = false;
let procesando = false;

async function setESPColor(r, g, b) {
  try {
    const url = `http://${ESP_IP}/rgb?r=${r}&g=${g}&b=${b}`;
    await axios.get(url, { timeout: 1500 });
    console.log(`[ESP32] Color actualizado -> R:${r} G:${g} B:${b}`);
  } catch (error) {
    console.warn("[ESP32] Error comunicando color:", error.message);
  }
}

async function notificarESP(req, res) {
  await setESPColor(0, 0, 65535);
  res.json({ status: "notificado, brillando azul por 3s" });

  setTimeout(() => {
    console.log("Fin de notificación, volviendo a verde...");
    setESPColor(0, 65535, 0); 
  }, 3000);
}

// ipcam.controller.js optimizado
async function procesarReconocimientoDirecto() {
  if (procesando) return;
  procesando = true;

  console.log("🔴 Estado: Grabando/Procesando...");
  await setESPColor(65535, 0, 0);

  try {
    const response = await axios.post(FASTAPI_URL);
    const data = response?.data;

    if (!data || !data.result) {
      throw new Error("Respuesta inválida del backend");
    }

    // 🟢 EMITIR A VUE POR SOCKET.IO
    try {
      const io = getIO();
      // Construimos el objeto tal como Vue espera recibirlo de MongoDB
      const eventoParaVue = {
        fecha_hora: new Date().toISOString(),
        resultado: data.result,
        // Si fue Fake (foto), no hubo movimiento. En los demás casos (reconocido o desconocido) asumimos que sí.
        movimiento_detectado: data.result !== "Fake" && data.result !== "NoFace"
      };
      
      io.emit("nuevaAsistencia", eventoParaVue);
      console.log("📡 Evento emitido al frontend de Vue:", eventoParaVue.resultado);
    } catch (socketErr) {
      console.warn("⚠️ Advertencia: No se pudo emitir por socket:", socketErr.message);
    }

    // ------------------------------------------------
    // LÓGICA DE COLORES ESP32
    // ------------------------------------------------

    // 🟡 NADIE
    if (data.result === "NoFace") {
      console.log("🚫 No hay rostro");
      await setESPColor(65535, 65535, 0);
      await new Promise(r => setTimeout(r, 1500));
    }

    // 🟣 FOTO / SPOOFING
    else if (data.result === "Fake") {
      console.log("🚫 Posible intento con foto");
      await setESPColor(65535, 0, 65535);
      await new Promise(r => setTimeout(r, 2000));
    }

    // 🔴 DESCONOCIDO
    else if (data.result === "Desconocido") {
      console.log("❌ No reconocido");
      await setESPColor(65535, 0, 0);
      await new Promise(r => setTimeout(r, 1500));
    }

    // 🔵 RECONOCIDO
    else {
      console.log(`🏆 ASISTENCIA: ${data.result.toUpperCase()}`);
      await setESPColor(0, 0, 65535);
      await new Promise(r => setTimeout(r, 2000));
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    await setESPColor(65535, 0, 65535);
  } finally {
    console.log("🟢 Listo");
    await setESPColor(0, 65535, 0);
    procesando = false;
  }
}

module.exports = {
  notificarESP,
  setESPColor,
  procesarReconocimientoDirecto,
};
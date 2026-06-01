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
async function procesarReconocimientoDirecto(materia_id_materia,esp_ip,) {
  if (procesando) return;
  procesando = true;

  console.log(`🔴 Estado: Grabando/Procesando... ${esp_ip}`);
  await setESPColor(esp_ip,65535, 0, 0);

  try {
    const response = await axios.post(FASTAPI_URL);
    const data = response?.data;

    if (!data || !data.result) {
      throw new Error("Respuesta inválida del backend");
    }

    // 🟢 EMITIR A VUE POR SOCKET.IO
    try {
      const io = getIO();
      const eventoParaVue = {
        fecha_hora: new Date().toISOString(),
        resultado: data.result,
        movimiento_detectado: data.result !== "Fake" && data.result !== "NoFace"
      };
      io.emit("nuevaAsistencia", eventoParaVue);
    } catch (socketErr) {
      console.warn("⚠️ Advertencia: No se pudo emitir por socket:", socketErr.message);
    }

    // ------------------------------------------------
    // LÓGICA DE COLORES Y REGISTRO EN DB
    // ------------------------------------------------

    // 🟡 NADIE
    if (data.result === "NoFace") {
      console.log("🚫 No hay rostro");
      await setESPColor(esp_ip,65535, 65535, 0);
      await new Promise(r => setTimeout(r, 1500));
    }

    // 🟣 FOTO / SPOOFING
    else if (data.result === "Fake") {
      console.log("🚫 Posible intento con foto");
      await setESPColor(esp_ip,65535, 0, 65535);
      await new Promise(r => setTimeout(r, 2000));
    }

    // 🔴 DESCONOCIDO
    else if (data.result === "Desconocido") {
      console.log("❌ No reconocido");
      await setESPColor(esp_ip,65535, 0, 0);
      await new Promise(r => setTimeout(r, 1500));
    }

    // 🔵 RECONOCIDO
    else {
      // Si FastAPI devuelve el CI, lo guardamos
      const usuario_ci = data.result; 
      console.log(`🏆 ASISTENCIA DETECTADA: CI ${usuario_ci}`);

      // Verificamos si hay una clase activa (el ESP32 manda "Aula libre / Sin clase" si no hay nada)
      if (!materia_id_materia || materia_id_materia === "Aula libre / Sin clase" || materia_id_materia === "Error de servidor") {
          console.log("⚠️ Rostro reconocido, pero el aula está libre. No se registra en DB.");
          await setESPColor(esp_ip,0, 65535, 65535); // Cian: Reconocido pero sin clase
      } else {
        console.log(`mandando ${usuario_ci} y ${materia_id_materia}`)
          // 🚀 HACEMOS POST AL BACKEND DE ASISTENCIAS
          
          try {
              const resAsistencia = await axios.post(BACKEND_ASISTENCIAS_URL, {
                  usuario_ci: usuario_ci,
                  materia_id_materia: materia_id_materia
              });

              console.log("✅ Asistencia Guardada DB:", resAsistencia.data.message);
              await setESPColor(esp_ip,0, 0, 65535); // Azul: Todo perfecto
              
          } catch (dbError) {
              // Si el backend de DB responde con error (ej. No está inscrito 403)
              const errorMsj = dbError.response?.data?.message || dbError.message;
              console.error("❌ Error DB Asistencia:", errorMsj);
              
              // Naranja: Lo reconoció la cámara, pero la base de datos lo rechazó (no inscrito)
              await setESPColor(esp_ip,65535, 32768, 0); 
          }
      }
      
      await new Promise(r => setTimeout(r, 2000));
    }

  } catch (error) {
    console.error("❌ Error general:",{
  message: error.message,
  status: error.response?.status,
  data: error.response?.data
});
    await setESPColor(esp_ip,65535, 0, 65535);
  } finally {
    console.log("🟢 Listo para el siguiente");
    await setESPColor(esp_ip,0, 65535, 0);
    procesando = false;
  }
}

module.exports = {
  notificarESP,
  setESPColor,
  procesarReconocimientoDirecto,
};
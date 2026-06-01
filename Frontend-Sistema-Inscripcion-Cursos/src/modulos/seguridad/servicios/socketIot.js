import { io } from "socket.io-client";

// Iniciamos desconectado para evitar consumo innecesario
// Solo conectaremos cuando se monte la vista de Asistencias
const socketIot = io("http://localhost:3000", {
  autoConnect: false
});

export default socketIot;

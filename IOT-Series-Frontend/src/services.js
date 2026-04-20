import axios from "axios";

const HOST =window.location.hostname
const api = axios.create({
  baseURL: `http://${HOST}:3000/api`, // cambia si usas otro puerto
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;

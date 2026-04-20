import api from "../../../services";

export default {
  login(correo, contrasenia) {
    return api.post(`/usuarios/login`, {
      correo,
      contrasenia
    });
  }
}
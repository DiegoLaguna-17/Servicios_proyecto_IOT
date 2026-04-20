import { createRouter, createWebHistory } from "vue-router"

import UsuarioLayout from "../layouts/UsuarioLayout.vue"

import login from "../modulos/login/views/login.vue"
import MisCalculos from "../modulos/usuario/views/MisCalculos.vue"
import GenerarCalculo from "../modulos/usuario/views/GenerarCalculo.vue"
import Asistencias from "../modulos/usuario/views/Asistencias.vue"
const routes = [
  {
    path: "/login",
    name: "login",
    component: login
  },
  {
    path: "/",
    redirect: "/login"
  },
  {
    path:"/usuario",
    component:UsuarioLayout,
    children:[
        {
            path:"",
            redirect:{name:"misCalculos"}
        },
        {
            path:"/misCalculos",
            name:"misCalculos",
            component:MisCalculos
        },
        {
          path:"/generarCalculo",
          name:"generarCalculo",
          component:GenerarCalculo
        },
        {
          path:"/asistencias",
          name:"asistencias",
          component:Asistencias
        }

    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
import { createRouter, createWebHistory } from "vue-router";
import SeguridadLayout from "../layouts/SeguridadLayout.vue";
import RegistrarAdmin from "../modulos/seguridad/views/RegistrarAdmin.vue";
import ListarEstudiantes from "../modulos/seguridad/views/ListarEstudiantes.vue";
import ListarDocentes from "../modulos/seguridad/views/ListarDocentes.vue";
import ListarAdministradores from "../modulos/seguridad/views/ListarAdministradores.vue";
import RegistrarEstudiantes from "../modulos/seguridad/views/RegistrarEstudiantes.vue";
import RegistrarDocentes from "../modulos/seguridad/views/RegistrarDocentes.vue";

import AdminLayout from "../layouts/AdminLayout.vue";
import ListarCarreras from "../modulos/admin/views/ListarCarreras.vue";
import RegistrarCarrera from "../modulos/admin/views/RegistrarCarrera.vue";
//import ListarExtra from "../modulos/admin/views/ListarExtra.vue";
import VerCarrera from "../modulos/admin/views/VerCarrera.vue";

//import ListarCursos from "../modulos/admin/views/ListarCursos.vue";
import DocenteLayout from "../layouts/DocenteLayout.vue";

import EstudianteLayout from "../layouts/EstudianteLayout.vue";
import Login from "../modulos/seguridad/views/Login.vue";

// Importar vistas del admin
import RegistrarCursos from "../modulos/admin/views/RegistrarCursos.vue";
import RegistrarCursosExtra from "../modulos/admin/views/RegistrarCursosExtra.vue";
import ListarCursos from "../modulos/admin/views/ListarCursos.vue";
import ListarExtra from "../modulos/admin/views/ListarExtra.vue";
import InfoCurso from "../modulos/admin/views/InfoCurso.vue";

//Importar vistas del estudiante
import OfertaAcademica from "../modulos/estudiantes/views/OfertaAcademica.vue";
import MiCarrera from "../modulos/estudiantes/views/miCarrera.vue";
import MisMaterias from "../modulos/estudiantes/views/MisMaterias.vue";
import Pagos from "../modulos/pagos/components/Pagos.vue";
import MiPerfil from "../modulos/estudiantes/views/MiPerfil.vue";
import EstadoAcademico from "../modulos/estudiantes/views/EstadoAcademico.vue";
import MiProgreso from "../modulos/estudiantes/views/MiProgreso.vue";

//Importar vistas del docente
import MateriasDocente from "../modulos/docentes/views/MateriasDocente.vue";
import NotasMateria from "../modulos/docentes/views/NotasMateria.vue";
import AsistenciaMateria from "../modulos/docentes/views/AsistenciaMateria.vue";
import ListarAulas from "../modulos/admin/views/ListarAulas.vue";

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/seguridad",
    component: SeguridadLayout,
    children: [
      {
        path: "",
        redirect: { name: "listarAdministradores" },
      },
      {
        path: "listarAdministradores",
        name: "listarAdministradores",
        component: ListarAdministradores,
      },
      {
        path: "listarEstudiantes",
        name: "listarEstudiantes",
        component: ListarEstudiantes,
      },
      {
        path: "listarDocentes",
        name: "listarDocentes",
        component: ListarDocentes,
      },
      {
        path: "registrarEstudiantes",
        name: "registrarEstudiantes",
        component: RegistrarEstudiantes,
      },
      {
        path: "registrarDocentes",
        name: "registrarDocentes",
        component: RegistrarDocentes,
      },
      {
        path: "registrarAdmin",
        name: "registrarAdmin",
        component: RegistrarAdmin,
      },
    ],
  },
  {
    path: "/administrador",
    component: AdminLayout,
    children: [
      {
        path: "listarCursos",
        name: "listarCursos",
        component: ListarCursos,
      },
      {
        path: "registrarCursos",
        name: "registrarCursos",
        component: RegistrarCursos,
      },
      {
        path: "registrarCursosExtra",
        name: "registrarCursosExtra",
        component: RegistrarCursosExtra,
      },
      {
        path: "listarExtra",
        name: "listarExtra",
        component: ListarExtra,
      },
      {
        path: "listarAulas",
        name: "listarAulas",
        component: ListarAulas,
      },
      {
        path: "",
        redirect: { name: "listarCarreras" },
      },
      {
        path: "listarCarreras",
        name: "listarCarreras",
        component: ListarCarreras,
      },
      {
        path: "registrarCarrera",
        name: "registrarCarrera",
        component: RegistrarCarrera,
      },
      {
        path: "listarCursos",
        name: "listarCursos",
        component: ListarCursos,
      },
      {
        path: "listarExtra",
        name: "listarExtra",
        component: ListarExtra,
      },
      {
        path: "verCarrera/:codigo",
        name: "verCarrera",
        component: VerCarrera,
      },
      {
        path: "info-curso/:id",
        name: "infoCurso",
        component: () => import("../modulos/admin/views/InfoCurso.vue"), 
      }
    ],
  },
  {
    path: "/docente",
    component: DocenteLayout,
    children: [
      {
        path: "",
        redirect: { name: "MateriasDocente" },
      },
      {
        path: "MateriasDocente",
        name: "MateriasDocente",
        component: MateriasDocente,
      },
      {
        path: "NotasMateria/:id_materia",
        name: "NotasMateria",
        component: NotasMateria,
      },
      {
        path: "AsistenciaMateria/:id_materia",
        name: "AsistenciaMateria",
        component: AsistenciaMateria,
      },
    ],
  },
  {
    path: "/estudiante",
    component: EstudianteLayout,
    children: [
      {
        path: "",
        redirect: { name: "ofertaAcademica" },
      },
      {
        path: "ofertaAcademica",
        name: "ofertaAcademica",
        component: OfertaAcademica,
      },
      {
        path: "miCarrera",
        name: "miCarrera",
        component: MiCarrera,
      },
      {
        path: "misMaterias",
        name: "misMaterias",
        component: MisMaterias,
      },
      {
        path: "estadoAcademico",
        name: "estadoAcademico",
        component: EstadoAcademico,
      },
      {
        path: "pagarCarrito",
        name: "pagarCarrito",
        component: Pagos,
      },
      {
        path: "miProgreso/:id_materia",
        name: "miProgreso",
        component: MiProgreso,
      },
      {
        path:"miPerfil",
        name:"miPerfil",
        component:MiPerfil
      }
    ],
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});

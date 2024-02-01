<template>
  <div class="index">
    <PageTitle title="Proyectos" />
    <div class="app-box">
      <b-container>
        <!-- Barra de búsqueda -->
        <b-row>
          <b-col>
            <b-form-group>
              <b-form-input v-model="search" class="form-input" type="text" placeholder="BUSCAR..."
                @change="getProjects"></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>

        <!-- Lista -->
        <b-row>
          <div v-if="loading" class="loader-container">
            <b-spinner v-if="loading" class="loader" ></b-spinner>
          </div>

          <ul>
            <li v-for="(project, index) in filteredProjects" :key="index" >
              <ListsItemProject @loadProject="loadProject" :project="project" />
              <hr />
            </li>
          </ul>
        </b-row>
      </b-container>
    </div>

    <!-- Modal de detalles del proyecto -->
    <AppModal @close="closeProjectDetails" v-if="projectLoaded" title="Detalles del proyecto">
      <InfoProject :project="projectLoaded" />
    </AppModal>

    <!-- Modal con el formulario de añadir tarea -->
    <AppModal @close="closeNewTaskModal" v-if="projectToAddTask" title="Añadir Tarea">
      <FormsNewTask :projectToAddTask="projectToAddTask" />
    </AppModal>
  </div>
</template>

<script>
import moment from "moment";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      search: "",
      projects: [],
      tasks: [],
      projectLoaded: null,
      projectToAddTask: null,
      loading: false,
      render: false,
    };
  },
  computed: {
    projectsWithTasks() {
      // Relacionamos las tareas con los proyectos y se ordenan
      let projectsWithTasks = [];

      this.projects.forEach((project) => {
        const taskFromProject = this.tasks.find(task =>
          project.fieldData.ProyectoNumero === task.fieldData.Proyecto
        );

        if (taskFromProject) {
          project.tasks = taskFromProject;
          project.fieldData.Inicio = taskFromProject.fieldData.Inicio;
        }
        projectsWithTasks.push(project)
      });

      return [...projectsWithTasks].sort((a, b) =>
        (Object.hasOwn(a.fieldData, "Inicio") ? a.fieldData.Inicio : "") >
          (Object.hasOwn(b.fieldData, "Inicio") ? b.fieldData.Inicio : "")
          ? -1
          : (Object.hasOwn(b.fieldData, "Inicio") ? b.fieldData.Inicio : "") >
            (Object.hasOwn(a.fieldData, "Inicio") ? a.fieldData.Inicio : "")
            ? 1
            : 0
      );
    },
    filteredProjects() {
    return this.projects.filter(project => {
      const projectName = project.fieldData.NombreEmpresa;
      // Retorna proyectos que no están terminados y, si hay término de búsqueda, que coinciden con la búsqueda
      return project.fieldData.Estado !== 'TERMINADO' &&
             (this.search.trim() === '' || (projectName && projectName.toLowerCase().includes(this.search.toLowerCase())));
    });
  },
  },
  methods: {
    loadProject(project) {
      this.projectLoaded = project;
    },

    closeProjectDetails() {
      this.projectLoaded = null;
    },

    closeNewTaskModal() {
      this.projectToAddTask = null;
    },

    openAddTaskForm(project) {
      this.projectToAddTask = project;
    },

    async getProjects() {
      // Obtenemos proyectos
      this.loading = true;
      const url = "/api/proyectos/";

      try {
        let response = await this.$axios.$get(
          url,
          {
            headers: {
              Authorization: `Bearer ${this.$cookies.get("TOKEN")}`,
            },
          }
        );

        this.projects = response.response.data;
        this.loading = false;

      } catch (e) {
        this.error = true;
        console.log(e);
        this.loading = false;
      }
    },
    getTasksFromUser() {
      // Obtenemos las tareas de los proyectos de un usuario
      const url = `/api/projects/user`;
      this.$axios
        .get(url, {
          headers: { Authorization: `Bearer ${this.$cookies.get("TOKEN")}` },
        })
        .then((response) => {
          this.tasks = response.data.tasks;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.render = true;
        });
    },
  },
  created() {
    this.getProjects();
  },
};
</script>

<style scoped>
li {
  list-style: none;
  padding: 2% 0;
  width: 90vw;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

ul {
  padding: 0 4%;
}
.loader-container {
  display: flex;
  justify-content: center; /* Centrar horizontalmente */
  align-items: center; /* Centrar verticalmente */
  width: 100%;
}
</style>

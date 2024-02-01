<template>
  <div class="widget" v-if="render">
    <b-container>
      <b-row align-h="center">
        <div
          v-for="(project, index) in projects"
          :key="index"
          v-show="findStartedProjects()"
        >
          <li v-if="project.fieldData.Inicio">
            <ListsItemProject
              @clickAddTask="openAddTaskForm"
              @loadProject="loadProject"
              :project="project"
            />
          </li>
        </div>
      </b-row>
    </b-container>
    <AppModal
      @close="closeProjectDetails"
      v-if="projectLoaded"
      title="Detalles del proyecto"
    >
      <InfoProject :project="projectLoaded" />
    </AppModal>

    <!-- Modal con el formulario de añadir tarea -->
    <AppModal
      @close="closeNewTaskModal"
      v-if="projectToAddTask"
      title="Añadir Tarea"
    >
      <FormsNewTask :projectToAddTask="projectToAddTask" />
    </AppModal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      search: "",
      projects: [],
      projectLoaded: null,
      projectToAddTask: null,
      loading: false,
      render: false,
    };
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

    getProjects() {
      // Obtenemos proyectos
      this.loading = true;
      const url = this.search
        ? `/api/projects/?search=${this.search}`
        : "/api/projects/";

      this.$axios
        .get(url, {
          headers: { Authorization: `Bearer ${this.$cookies.get("TOKEN")}` },
        })
        .then((response) => {
          this.projects = response.data.projects;
          this.getTasksFromUser();
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getTasksFromUser() {
      // Obtenemos las tareas de los proyectos de un usuario
      const url = `/api/projects/user`;
      this.$axios
        .get(url, {
          headers: { Authorization: `Bearer ${this.$cookies.get("TOKEN")}` },
        })
        .then((response) => {
          const tasks = response.data.tasks;
          this.projects.forEach((project) => {
            const taskFromProject = tasks.find(
              (task) =>
                project.fieldData.ProyectoNumero === task.fieldData.Proyecto
            );
            if (taskFromProject) {
              project.tasks = taskFromProject;
              project.fieldData.Inicio = taskFromProject.fieldData.Inicio;
            }
          });
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.render = true;
        });
    },
    findStartedProjects() {
      return this.projects.some((project) => project.fieldData.Inicio != "");
    },
  },

  created() {
    this.getProjects();
    // Event Listener
    this.$nuxt.$on("clickAddTask", (project) => {
      this.projectToAddTask = project;
    });
  },
};
</script>

<style>
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

.app-button.sm {
  width: 50px;
  height: 50px;
}
</style>

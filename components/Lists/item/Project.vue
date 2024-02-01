<template>
    <div class="project-item" :class="timer ? 'task-started' : ''">
      <div class="details">
        <div class="estado">
          <span class="estado-color " :class="`estado-${estadoFormateado}`"></span>
          {{ estadoFormateado }}
        </div>
        <div class="subtitle">
          {{ project.fieldData.ProyectoNumero }} |
          <strong>{{ project.fieldData.NombreEmpresa }}</strong>
        </div>
        <div class="description">{{ project.fieldData.DescripcionProyecto }}</div>
        <div class="subtitle" v-if="timer">
          <b-icon icon="clock"></b-icon> Iniciado a las: {{ formatDateStart }}
        </div>
      </div>
      <div class="actions">
        <button
          @click="$emit('loadProject', project)"
          class="app-button secondary"
        >
          <b-icon icon="eye"></b-icon>
          <span>Detalles</span>
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import moment from "moment";
  import Swal from "sweetalert2";
  
  export default {
    props: ["project"],
    emits: ["clickAddTask"],
    data() {
      return {
        estadoFormateado: this.project.fieldData.Estado.replace(" ", "-")
          .replace(".", "")
          .toLowerCase(),
        dateStart: "",
        dateEnd: null,
        now: null,
        timer: false,
        position: {
          longitude: null,
          latitude: null,
          altitude: null,
        },
        actionsList: {
          "PETICIÓN PRESUPUESTO": "PETICIÓN PRESUPUESTO",
          LLAMADA: "LLAMADA",
          GESTION: "GESTIÓN",
          VARIOS: "VARIOS",
          RECLAMACION: "RECLAMACIÓN",
          "VISITA OBRA": "VISITA OBRA",
        },
      };
    },
    methods: {
      async newTask() {
        this.saveLocation();
        /*const havePermissions = await this.checkPermission();
        if (!havePermissions) {
          Swal.fire({
            icon: "error",
            title: "Se ha producido un error",
            text: "Por favor, habilite la ubicación para poder introducir horas",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#cf112b",
          });
          return;
        }*/
        
        if (!this.dateStart) {
          Swal.fire({
            title: "Crear tarea",
            text: "¿Quieres una tarea para este proyecto?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Iniciar",
          }).then((result) => {
            if (result.isConfirmed) {
              const start = moment().format("LTS");
  
              // Enviamos la tarea a Express por Axios
              this.$axios
                .$post(
                  "/api/projects/tasks/new",
                  {
                    start: start,
                    projectToAddTask: this.project.fieldData.ProyectoNumero,
                    Location: this.position
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${this.$cookies.get("TOKEN")}`,
                    },
                  }
                )
                .then((response) => {
                  this.project.tasks = response.data;
                  this.dateStart = start;
                  this.checkTimer();
  
                  Swal.fire({
                    icon: "success",
                    title: "Insertado en FileMaker",
                    text: "Tarea insertada en Filemaker",
                    confirmButtonText: "Entendido",
                    confirmButtonColor: "#cf112b",
                  });
                })
                .catch((error) => {
                  console.log(error);
                  Swal.fire({
                    icon: "error",
                    title: "Se ha producido un error",
                    text: "Por favor, intentelo de nuevo",
                    confirmButtonText: "Entendido",
                    confirmButtonColor: "#cf112b",
                  });
                });
            }
          });
        } else {
          if (moment(this.project.tasks.fieldData.Fecha).isBefore(this.now, 'day')) {
            Swal.fire({
              icon: "error",
              title: "Se ha producido un error",
              text: "No se puede cerrar una tarea si ha sido abierta en una fecha diferente. Por favor, póngase en contacto con oficina.",
              confirmButtonText: "Entendido",
              confirmButtonColor: "#cf112b",
            });
            return;
          }
          // Una vez ya iniciada la tarea, el segundo click abre el modal.
          this.$nuxt.$emit("clickAddTask", this.project);
        }
      },
  
      updateNow() {
        this.now = moment();
      },
  
      checkTimer() {
        this.dateStart != null ? (this.timer = true) : (this.timer = false);
      },
  
      saveLocation() {
        navigator.geolocation.getCurrentPosition((position) => {
          this.position.longitude = position.coords.longitude;
          this.position.latitude = position.coords.latitude;
          this.position.altitude = position.coords.altitude;
        });
      },
  
      async checkPermission() {
        const geolocationConsent = await navigator.permissions.query({
          name: "geolocation",
        });
        return geolocationConsent.state === "granted";
      },
    },
    computed: {
      timeDiff() {
        if (this.dateStart && this.now) {
          const totalMs =
            this.now.diff(moment(this.dateStart, "LTS"), "seconds") * 1000;
          const result = new Date(totalMs).toISOString().slice(11, 19);
  
          return result;
        }
      },
      formatDateStart() {
        return moment(this.dateStart, "LTS").format("LTS");
      },
    },
    created() {
      // Event Listener
      this.$nuxt.$on("submitFinished", () => {
        this.timer = false;
        this.timeDiff;
        this.dateEnd = null;
      });
    },
    mounted() {
      moment.locale("es");
      this.now = moment();
      this.dateStart = this.project.fieldData.Inicio;
      this.checkTimer();
      setInterval(() => (this.now = moment()), 1000);
    },
  };
  </script>
  
  <style scoped>
  .project-item{
    display: flex;
  }
  .estado {
    font-size: 14px;
    padding: 1% 0;
    text-align: center;
    display: flex;
    margin-top: 5px;
  }
  
  .app-button {
    width: 137.77px;
  }
  
  .actions {
    margin-top: 10px;
  }
  
  .estado-color {
    height: 20px;
    width: 20px;
    margin-right: 10px;
  }
  
  .subtitle {
    font-size: 12px;
  }
  
  .description {
    font-weight: 500;
  }
  
  .details {
    width: 100%;
  }
  
  .estado-rechazado {
    background-color: #FF2712;
  }
  
  .estado-pendiente {
    background-color: #FFA39E;
  }
  
  .estado-diseño {
    background-color:#AE00F0;
  }
  
  .estado-parado {
    background-color: #4D4D4D;
  }
  
  .estado-aceptado {
    background-color: #C2E5A6;
  }
  
  .estado-abierto {
    background-color: #ECBAFE;
  }
  
  .estado-finalizado {
    background-color: #66B132;
  }
  
  .estado-facturado {
    background-color: #FEBB64;
  }
  .estado-terminado {
    background-color: #FFFA83;
  }
  
  .btn-pressed {
    background-color: rgb(126, 218, 83);
  }
  .task-started {
    background-color: rgb(243 249 240);
  }
  </style>
  
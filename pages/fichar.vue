<template>
  <div style="flex-direction: column;">
    <div v-if="this.loading === true" class="spinner-parent">
      <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
      <p>Cargando...</p>
    </div>
    <div class="boton-retorno mb-4">
      <NuxtLink to="/">&lt; <span>VOLVER</span></NuxtLink>
    </div>
    <div class="mx-4" >
      <div v-if="!this.ficha && this.loading === false">
        No se ha fichado el dia {{ this.formatearFecha(this.dia) }}, ¿deseas fichar?
        <div class="w-100 d-flex mt-2"><b-button variant="primary" class="mx-auto" @click="setFichaje()">Fichar</b-button>
        </div>
      </div>
      <div v-if="this.ficha && this.loading === false">
        <h2 class="text-center">Día: {{ this.formatearFecha(this.dia) }}</h2>
        <b-row class="mt-4">
          <b-col class="text-center">
            <div v-if="this.ficha" class="boton-fichar">
              <b-button :variant="this.ficha[0].fieldData.ETaller ? 'success' : 'danger'"
                :disabled="!!this.ficha[0].fieldData.ETaller"><b-icon icon="clock"
                  v-if="this.ficha[0].fieldData.ETaller"></b-icon> Entrada</b-button>
            </div>
          </b-col>
          <b-col class="text-center">
            <div class="boton-fichar">
              <b-button :variant="this.ficha[0].fieldData.STaller ? 'success' : 'danger'"
                :disabled="!!this.ficha[0].fieldData.STaller" @click="endFichaje()"><b-icon icon="clock"
                  v-if="this.ficha[0].fieldData.STaller"></b-icon> Salida</b-button>
            </div>
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>
<script>
import Swal from "sweetalert2";
export default {
  middleware: "authentication",
  data() {
    return {
      loading: true,
      ficha: null,
      limite: 5,
      error: false,
      dia: '',
      fichaId: '',
      fechaUbiFormat: ''
    };
  },
  methods: {
    getTodayDate() {
      // Obtener la fecha actual
      var fecha = new Date();

      // Obtener el día, el mes y el año
      var dia = fecha.getDate();
      var mes = fecha.getMonth() + 1; // getMonth() devuelve un número entre 0 y 11, por lo que sumamos 1 para obtener el mes correcto
      var anio = fecha.getFullYear();

      // Formatear el día y el mes para asegurarnos de que siempre tengan dos dígitos
      if (dia < 10) dia = '0' + dia;
      if (mes < 10) mes = '0' + mes;

      // Crear la cadena de fecha en el formato deseado
      var fechaFormateada = mes + '-' + dia + '-' + anio;

      this.fechaUbiFormat = mes + '/' + dia + '/' + anio;
      this.dia = fechaFormateada;
    },
    formatearFecha(fecha) {
      // Dividir la fecha en un array [MM, DD, YYYY]
      var partes = fecha.split('-');

      // Verificar si la fecha tiene el formato correcto
      if (partes.length !== 3 || partes[0].length !== 2 || partes[1].length !== 2 || partes[2].length !== 4) {
        return 'Fecha no válida';
      }

      // Cambiar el orden de los elementos para obtener el formato DD-MM-YYYY
      var nuevaFecha = partes[1] + '-' + partes[0] + '-' + partes[2];

      return nuevaFecha;
    },
    agregarCeroSiNecesario(numero) {
      return (numero < 10 ? '0' : '') + numero;
    },
    obtenerHoraActual() {
      var ahora = new Date();
      var horas = this.agregarCeroSiNecesario(ahora.getHours());
      var minutos = this.agregarCeroSiNecesario(ahora.getMinutes());
      var segundos = this.agregarCeroSiNecesario(ahora.getSeconds());
      var horaFormateada = horas + ':' + minutos + ':' + segundos;
      return horaFormateada;
    },
    getUserLocation() {
      return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
          const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          };
          navigator.geolocation.getCurrentPosition(
            (position) => {
              let lat = position.coords.latitude.toString();
              let lon = position.coords.longitude.toString();
              lat = lat.replace(',', '.');
              lon = lon.replace(',', '.');
              let ubi = lat + ", " + lon;
              resolve(ubi);
            },
            (error) => {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                confirmButtonColor: "#000",
                text: `La geolocalización no está disponible o el usuario no dio permiso. `,
              });
              console.error(error);
              reject('La geolocalización no está disponible o el usuario no dio permiso.');
            }, options
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            confirmButtonColor: "#000",
            text: `La geolocalización no está disponible en tu navegador. `,
          });
          reject('La geolocalización no está disponible en tu navegador.');
        }
      });
    },
    async getFichaje() {
      let tec = this.$store.state.User;
      try {
        let response = await this.$axios.$post(
          "/api/fichaje/find",
          { Tec: tec, Fecha: this.dia },
          {
            headers: {
              Authorization: `Bearer ${this.$cookies.get("TOKEN")}`,
            },
          }
        );

        if (response == 'Vacio!') {
          this.ficha = false;
          this.loading = false;
          return;
        }

        this.ficha = response;
        this.fichaId = this.ficha[0].recordId;

      } catch (e) {
        this.error = true;
        console.log(e);
        this.loading = false;
      }
      this.loading = false;
    },
    async setFichaje() {
      let tec = this.$store.state.User;
      let horaActual = this.obtenerHoraActual();
      let userLocation = "";
      try {
        userLocation = await this.getUserLocation();
        // Resto del código ...
      } catch (e) {
        this.error = true;
        console.log(e);
      }
      if (userLocation) {
        try {
          let response = await this.$axios.$post(
            "/api/fichaje/new",
            { Tec: tec, horaEntrada: horaActual, UserLocation: userLocation, fecha: this.fechaUbiFormat },
            {
              headers: {
                Authorization: `Bearer ${this.$cookies.get("TOKEN")}`,
              },
            }
          );
          if (response) {
            window.location.href = window.location.href
          }
        } catch (e) {
          this.error = true;
          console.log(e);
        }
      }

      this.loading = false;
    },
    async endFichaje(id) {
      let tec = this.$store.state.User;
      let horaActual = this.obtenerHoraActual();
      let userLocation = "";
      let noComida = "Si";
      let noMerienda = "Si";
      let comDesde = "";
      let comHasta = "";
      let merDesde = "";
      let merHasta = "";
      try {
        userLocation = await this.getUserLocation();
        const { value: merendar } = await Swal.fire({
          title: '¿Has parado para merendar?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'No'
        });
        if (merendar) {
          noMerienda = "";
          const { value: horarioMerendar } = await Swal.fire({
            title: 'Indica el horario de merienda',
            html:
              '<input id="hora-inicioM" class="swal2-input" type="time" placeholder="Hora de inicio" value="11:00">' +
              '<input id="hora-finM" class="swal2-input" type="time" placeholder="Hora de fin" value="11:15">',
            focusConfirm: false,
            preConfirm: () => {
              return [
                document.getElementById('hora-inicioM').value,
                document.getElementById('hora-finM').value
              ]
            }
          });
          merDesde = horarioMerendar[0];
          merHasta = horarioMerendar[1];
        }
        const { value: comer } = await Swal.fire({
          title: '¿Has parado para comer?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'No'
        });
        if (comer) {
          noComida = "";
          const { value: horarioComer } = await Swal.fire({
            title: 'Indica el horario de comida',
            html:
              '<input id="hora-inicio" class="swal2-input" type="time" placeholder="Hora de inicio" value="14:00">' +
              '<input id="hora-fin" class="swal2-input" type="time" placeholder="Hora de fin" value="15:00">',
            focusConfirm: false,
            preConfirm: () => {
              return [
                document.getElementById('hora-inicio').value,
                document.getElementById('hora-fin').value
              ]
            }
          });
          comDesde = horarioComer[0];
          comHasta = horarioComer[1];
        }

        // Resto del código ...
      } catch (e) {
        this.error = true;
        console.log(e);
      }
      try {
        let response = await this.$axios.$patch(
          `/api/fichaje/edit/${this.fichaId}`,
          { horaSalida: horaActual, UserLocation: userLocation, Tec: tec, fecha: this.fechaUbiFormat, NoComida: noComida, NoMerienda: noMerienda, ComDesde: comDesde, ComHasta: comHasta, MerDesde: merDesde, MerHasta: merHasta },
          {
            headers: {
              Authorization: `Bearer ${this.$cookies.get("TOKEN")}`,
            },
          }
        );
        if (response) {
          window.location.href = window.location.href
        }
      } catch (e) {
        this.error = true;
        console.log(e);
      }
      this.loading = false;
    },

  },
  mounted() {
    this.getTodayDate();
    this.getFichaje();
  },
};
</script>
<style scoped>
.boton-fichar>div>button {
  width: 115px;
}
</style>

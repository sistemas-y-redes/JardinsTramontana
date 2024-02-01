<template>
  <div>
    <div class="project-info">
      <b-row class="project-info-row">
        <b-col class="project-info-item">
          <span class="project-item-heading">Proyecto</span>
          <span class="project-item-text">{{
            project.fieldData.ProyectoNumero
          }}</span>
        </b-col>
        <b-col class="project-info-item">
          <span class="project-item-heading">Fecha</span>
          <span class="project-item-text">{{ project.fieldData.Fecha }}</span>
        </b-col>
        <b-col class="project-info-item">
          <span class="project-item-heading">Estado</span>
          <span class="project-item-text">{{
            project.fieldData.EstadoProyecto
          }}</span>
        </b-col>
      </b-row>

      <b-row class="project-info-row">
        <b-col class="project-info-item">
          <span class="project-item-heading">Empresa</span>
          <span class="project-item-text">{{
            project.fieldData.NombreEmpresa
          }}</span>
        </b-col>
      </b-row>

      <b-row class="project-info-row">
        <b-col class="project-info-item">
          <span class="project-item-heading">Descripción</span>
          <span class="project-item-text">{{
            project.fieldData.DescripcionProyecto
          }}</span>
        </b-col>
      </b-row>
    </div>

    <hr />
    <div class="project-address">
      <b-row class="project-info-row">
        <b-col col xs="10" class="project-info-item">
          <span class="project-item-heading">Dirección</span>
          <span class="project-item-text">{{ project.fieldData.DireccionObra }}</span>
        </b-col>
        <a :href="googleMapsUri" target="_blank" class="maps-button">
          <b-icon icon="pin-map"></b-icon>
        </a>
      </b-row>
      <b-row>
        <iframe
          :src="googleIframeUrl"
          width="100%"
          height="400"
          style="border: 0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </b-row>
    </div>
  </div>
</template>

<script>
export default {
  props: ["project"],
  data() {
    return {
      googleMapsUri: `http://local.google.es/maps/?q=${
        this.project.fieldData["C.P.Obra"]
      }+${this.project.fieldData.DireccionObra.replace(
        /\s/g,
        "+"
      )}+${this.project.fieldData.CiudadObra.replace(" ", "+")}`,
      direccionObra: null,
      numDireccionObra: null,
      cpDireccionObra: null,
      ciudadObra: null,
      comunidadAutonomaObra: null,
      googleIframeUrl: null,
    };
  },
  methods: {
    rellenarCamposDireccion() {
      //Quito números y comas de la dirección para luego reemplazar los espacios en ASCII
      this.direccionObra = this.project.fieldData.DireccionObra.replace(
        /[0-9]/g,
        ""
      );
      this.direccionObra = this.direccionObra.replace(/,/g, "");
      this.direccionObra = this.direccionObra.replace(/\s/g, "%20");
      this.numDireccionObra = this.project.fieldData.DireccionObra.replace(
        /[A-z]|\s|,/g,
        ""
      );
      this.cpDireccionObra = this.project.fieldData["C.P.Obra"];
      this.ciudadObra = this.project.fieldData.CiudadObra.replace(/\s/, "%20");
      this.comunidadAutonomaObra = "Illes%20Balears";
      this.googleIframeUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d!2d2.!3d!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x129789cdf6c9dddb%3A0x88af9f1f47e29edf!2s${this.direccionObra}%2C%20${this.numDireccionObra}%2C%20${this.cpDireccionObra}%20${this.ciudadObra}%2C%20${this.comunidadAutonomaObra}!5e0!3m2!1ses!2ses!4v1679648467944!5m2!1ses!2ses`;
    },
  },
  mounted() {
    this.rellenarCamposDireccion();
  },
};
</script>

<style scoped>
.project-info-row {
  margin: 2.5% 0;
}

.project-info-item {
  display: grid;
}

.project-item-text {
  font-size: 13px;
  text-transform: uppercase;
}

.project-item-heading {
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
}

.maps-button {
  width: 50px;
  border-radius: 0px;
  border: none;
  background-color: #5a99f8;
  margin: 0 2.5%;
  color: white;
  text-decoration: none;
  text-align: center;
  font-size: 30px;
}
</style>

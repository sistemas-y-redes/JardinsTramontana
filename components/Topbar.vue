<template>
  <div class="Topbar">
    <div class="top-content">
      <NuxtLink to="/" class="logoImg"><img class="logo" src="/logo.png" /></NuxtLink>
      <div class="usuario-options">
        <b-button class="refresh-button" @click="refreshPage()">
          <b-icon icon="arrow-repeat"></b-icon>
          <small>{{ $config.clientVersion }}</small>
        </b-button>
        <svg @click="logOut()" class="icono-rojo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path
            d="M160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96C43 32 0 75 0 128V384c0 53 43 96 96 96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H96c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32h64zM504.5 273.4c4.8-4.5 7.5-10.8 7.5-17.4s-2.7-12.9-7.5-17.4l-144-136c-7-6.6-17.2-8.4-26-4.6s-14.5 12.5-14.5 22v72H192c-17.7 0-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32H320v72c0 9.6 5.7 18.2 14.5 22s19 2 26-4.6l144-136z" />
        </svg>
      </div>
    </div>
    <div class="usuario-name-container">
      <p class="usuario-name">{{ this.$store.state.User }}</p>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  methods: {
    logOut() {
      let borrarToken = false;
      Swal.fire({
        text: "¿Desea cerrar sesión?",
        showDenyButton: true,
        confirmButtonText: "Salir",
        confirmButtonColor: "#000",

      }).then((result) => {
        if (result.isConfirmed) {
          this.$axios.post("/api/usuarios/logout", {
            headers: {
              Authorization: `Bearer ${this.$cookies.get("TOKEN")}`,
            },
          })
          this.$store.state.User = null;
          this.$cookies.set("TOKEN", "");
          borrarToken = true;
          this.$router.push("/login");
        }
      });
    },
    refreshPage: function () {
      window.location.href = window.location.href
    }
  },
};
</script>

<style scoped>
.Topbar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  max-width: 425px;
  margin-top: 1rem;
}

.top-content {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.logoImg {
  width: 40%;
  margin-left: 1rem !important;
}

.usuario-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.usuario-name-container {
  width: 100%; 
  display: flex;
  justify-content: flex-end;
}

.usuario-name {
  font-size: 0.8rem;
  color: darkgray;
  text-align: right;
  margin-right: 0.3rem;
}

.icono-rojo {
  width: 24px;
  height: 24px;
  fill: red;
  margin-right: 0.3rem;
}

.logo {
  width: 200px;
}

.swal2-title {
  font-size: 1.25rem ! important;
}

.refresh-button {
  background-color: transparent;
  border: none;
  color: rgb(123, 123, 123);
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-button small {
  padding: 0 4%;
}

@media (max-width: 375px) {
  .logo {
    width: 150px;
  }

  .logoImg {
    width: 30%;
  }

  .usuario-options {
    gap: 0.8rem;
  }
}
</style>

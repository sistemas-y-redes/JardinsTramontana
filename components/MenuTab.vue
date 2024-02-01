<template>
    <nav class="navigation-bar">
        <div class="navigation-link" v-for="(link, index) in filteredLinks" :key="index">
            <div :class="$nuxt.$route.path == link.link ? 'active' : ''">
                <nuxt-link :to="link.link" class="navigation-link-button">
                    <b-icon :icon="link.icon"></b-icon>
                    <!-- <div class="link-name">{{ link.name }}</div> -->
                </nuxt-link>
            </div>
        </div>
    </nav>
</template>
  
<script>
export default {
    computed: {
        isEncargadoOrGerente() {
            const userInfo = this.$store.state.UserInfo;
            return userInfo ? (userInfo.GrupoPermisos === 'ENCARGADO' || userInfo.GrupoPermisos === 'GERENTE') : false;
        },
        filteredLinks() {
            return this.links.filter(link => {
                if (link.name === 'Proyectos') {
                    return this.isEncargadoOrGerente;
                }
                return true;
            });
        }
    },
    data() {
        return {
            links: [
                {
                    name: "Inicio",
                    link: "/",
                    icon: "house",
                    color: "black",
                },
                {
                    name: "Fichar",
                    link: "/fichar",
                    icon: "clock",
                    color: "black",
                },
                {
                    name: "Proyectos",
                    link: "/proyectos",
                    icon: "gear",
                    color: "standard",
                },
                {
                    name: "Tareas",
                    link: "/tareas",
                    icon: "card-checklist",
                    color: "standard",
                },
                {
                    name: "Vacaciones",
                    link: "/vacaciones",
                    icon: "calendar2-day",
                    color: "standard",
                },
            ],
        };
    },
    methods: {

    },

};
</script>
  
<style scoped>
.navigation-bar {
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    backdrop-filter: blur(12.5px);
    -webkit-backdrop-filter: blur(12.5px);

    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2% 0%;
    width: 100vw;

    position: fixed;
    /* Fija el menú en una posición absoluta */
    bottom: 0;
    /* Ubica el menú en la parte inferior de la pantalla */
    left: 0;
    /* Asegura que el menú se extienda desde el lado izquierdo */
}

.navigation-link {
    display: flex;
  justify-content: center; /* Centra horizontalmente */
  align-items: center;     /* Centra verticalmente */
  height: 50px;
    width: 30px;
    margin: 0 5%;
    text-align: center;
}

.link-name {
    font-size: 0.8em;
    text-align: center;
    text-transform: uppercase;
}

.navigation-link-button {
    border-radius: var(--border-radius);
    color: black;
    background-color: transparent;
    border: none;
    font-size: 5vw;
    padding: 0%;
    margin: auto;
}

.button-label {
    text-align: center;
}

.nuxt-link-exact-active {
    font-weight: bold;
    color: blue;
}
</style>

  
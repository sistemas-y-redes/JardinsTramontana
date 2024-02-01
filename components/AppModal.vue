<template>
    <div class="modal-overlay">
        <div id="project-details-modal" class="app-box slide-in-bottom">
            <button class="close-button" @click="$emit('close')">
                <b-icon icon="x"></b-icon>
            </button>
            <h2>{{title}}</h2>
            <slot></slot>
        </div>
    </div>  
</template>

<script>
export default {
    props: ["title"]
}
</script>

<style scoped>
    /** Animación entrada */
    @-webkit-keyframes slide-in-bottom {
        0% {
            -webkit-transform: translateY(1000px);
                    transform: translateY(1000px);
            opacity: 0;
        }
        100% {
            -webkit-transform: translateY(0);
                    transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes slide-in-bottom {
        0% {
            -webkit-transform: translateY(1000px);
                    transform: translateY(1000px);
            opacity: 0;
        }
        100% {
            -webkit-transform: translateY(0);
                    transform: translateY(0);
            opacity: 1;
        }
    }

    .slide-in-bottom {
	    -webkit-animation: slide-in-bottom 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        animation: slide-in-bottom 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }

    #project-details-modal {
        position: absolute;
        bottom: 0;
        width: 100vw;
        min-height: 60vh;
        z-index: 10
    }
    
    h2 {
        font-size: 15px;
        font-weight: 300;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin: 0 4.1%;
    }
    
    .close-button {
        border: none;
        background-color: rgba(0, 0, 0, 0);
        float: right;
        font-size: 20px;
        margin: 0 20px;
    }
    .modal-overlay {
    background-color: rgba(0, 0, 0, 0.291);
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
}
.app-box {
    background-color: white;
    box-shadow: var(--box-shadow);
    padding: 5% 1%;
}

</style>
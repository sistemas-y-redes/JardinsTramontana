<template>
    <div class="page-name">
        <h1>{{title}}</h1>
    </div>
</template>

<script>
export default {
    props: ["title"]
}
</script>

<style scoped>
.page-name {
    margin: 2%;
}

.page-name h1 {
    font-size: 15px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 2px;
}
</style>
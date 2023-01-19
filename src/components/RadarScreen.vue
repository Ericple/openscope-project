<template>
    <div class="radar" id="radar"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    name: 'RadarScreen',
    mounted: function () {
        (window as any).radar.init('radar')
    },
})
</script>

<style scoped>
.radar {
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgb(32, 32, 32);
}

canvas {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
}
</style>
<template>
    <div class="draggable" id="MetarContainer" @click="toTop">
        <div class="dragarea" @mousedown="beginMove" @mouseup="endMove" @dblclick="toggle" align="center">
            Weather Information
        </div>
        <div class="content">
            <a-input-search id="searchbox" placeholder="Search for Wx information" @search="searchWx" v-model:value="searchValue" :loading="isSearching"/>
        </div>
        <div class="content">
            <a-collapse v-model:activeKey="activeKey" :bordered="false" id="metarList">
                <a-collapse-panel v-for="wX in wXAirports" :header="wX.icao" :key="wX.icao">
                    <p>METAR: {{ wX.metar }}</p>
                    <p>last update at: {{ wX.updateTime }}</p>
                </a-collapse-panel>
            </a-collapse>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
export default defineComponent({
    name: 'MetarContainer',
    data() {
        return {
            show: true,
            activeKey: ref(['1']),
            wXAirports: (window as any).weather.weatherData(),
            searchValue: '',
            isSearching: (window as any).weather.searchStatus()
        }
    },
    methods: {
        beginMove(e: MouseEvent) {
            const el = document.getElementById('MetarContainer')
            if (!el) {
                return
            }
            const disX = e.clientX - el.offsetLeft
            const disY = e.clientY - el.offsetTop
            document.onmousemove = function (e) {
                const tX = e.clientX - disX
                const tY = e.clientY - disY
                el.style.left = `${tX}px`
                if (tY >= 44) el.style.top = `${tY}px`
            }
        },
        endMove() {
            document.onmousemove = null
        },
        toggle() {
            const el = document.getElementById('MetarContainer')
            if (!el) return
            this.show = !this.show;
            if (this.show) {
                el.style.maxHeight = '400px'
            } else {
                el.style.maxHeight = '24px'
            }
        },
        toTop() {
            const el = document.getElementById('MetarContainer')
            const drags = document.getElementsByClassName('draggable')
            if(!el) return
            for (let index = 0; index < drags.length; index++) {
                if(parseInt((drags[index] as HTMLElement).style.zIndex) >= parseInt(el.style.zIndex)) el.style.zIndex = (parseInt((drags[index] as HTMLElement).style.zIndex) + 1).toString()
            }
        },
        searchWx() {
            (window as any).weather.requestWx(this.searchValue);
        },
    },
    mounted: function(){
        setInterval(() => {
            this.wXAirports = (window as any).weather.weatherData()
            this.isSearching = (window as any).weather.searchStatus()
        },3000)
    }
})
</script>

<style scoped>
.draggable {
    top: 45px;
    border: 1px solid whitesmoke;
    max-height: 400px;
    max-width: 640px;
    position: fixed;
    background-color: whitesmoke;
    box-shadow: 0 1px 12px 2px #49494946;
    overflow: hidden;
    border-radius: 4px;
    z-index: 1;
}

.dragarea {
    width: 100%;
    height: 20px;
    background-color: whitesmoke;
    user-select: none;
    padding: 0 20px 0 20px;
    color: #494949;
}

.content {
    overflow-y: auto;
    max-height: 300px;
    padding: 8px;
}
</style>
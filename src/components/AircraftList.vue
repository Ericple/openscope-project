<template>
    <div class="draggable" id="AircraftList" @click="toTop">
        <div class="dragarea" @mousedown="beginMove" @mouseup="endMove" @dblclick="toggle" align="center">
            ACF List
        </div>
        <div class="tab">
            <a-tabs v-model:activeKey="activeKey" size="small" style="color: whitesmoke;">
                <a-tab-pane v-for="list in Lists" :key="list.key" :tab="list.title">
                    <div class="content">
                        <table>
                            <tr>
                                <th v-for="col in list.cols" :key="col">{{ col }}</th>
                            </tr>
                            <a-dropdown :trigger="['click']">
                                <tr v-for="aircraft in list.aircrafts" :key="aircraft['C/S']">
                                    <td v-for="col in list.cols" :key="col">{{ aircraft[col] }}</td>
                                </tr>
                                <template #overlay>
                                    <a-menu>
                                        <a-menu-item>
                                            Flight plan dialog
                                        </a-menu-item>
                                        <a-sub-menu v-for="menu in list.contextMenu" :key="menu" :title="menu.title">
                                            <a-menu-item v-for="item in menu.items" :key="item">
                                                {{ item }}
                                            </a-menu-item>
                                        </a-sub-menu>
                                    </a-menu>
                                </template>
                            </a-dropdown>

                        </table>
                    </div>
                </a-tab-pane>
            </a-tabs>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
export default defineComponent({
    name: 'AircraftList',
    data() {
        return {
            Lists: (window as any).acflist.aircraftData(),
            activeKey: ref('1'),
            show: true,
        }
    },
    methods: {
        beginMove(e: MouseEvent) {
            const el = document.getElementById('AircraftList')
            if (!el) return
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
            const el = document.getElementById('AircraftList')
            if (!el) return
            this.show = !this.show;
            if (this.show) {
                el.style.maxHeight = '800px'
            } else {
                el.style.maxHeight = '24px'
            }
        },
        toTop() {
            const el = document.getElementById('AircraftList')
            // console.log(`el zindex = ${el?.style.zIndex}`)
            const drags = document.getElementsByClassName('draggable')
            // const a = $(".draggable").get().forEach((o) => {
            //     console.log(o.style.zIndex)
            // })
            // console.log(a)
            if (!el) return
            for (let index = 0; index < drags.length; index++) {
                // console.log(`${(drags[index] as HTMLElement).style.zIndex} >= ${el.style.zIndex}`)
                if (parseInt((drags[index] as HTMLElement).style.zIndex) >= parseInt(el.style.zIndex)) el.style.zIndex = (parseInt((drags[index] as HTMLElement).style.zIndex) + 1).toString()
            }
        },
    },
    mounted: function () {
        setInterval(() => {
            this.Lists = (window as any).acflist.aircraftData()
        }, 5000)
    }
})
</script>

<style scoped>
.draggable {
    max-height: 600px;
    max-width: 800px;
    position: fixed;
    overflow: hidden;
    border-radius: 4px;
    z-index: 1;
}

.dragarea {
    width: 100%;
    height: 24px;
    background-color: whitesmoke;
    user-select: none;
    padding: 0 20px 0 20px;
    color: #494949;
    border-radius: 4px;
}

div.content {
    overflow-y: auto;
    max-height: 700px;
    color: orange;
}

table {
    user-select: none;
    text-align: center;
}

table td {
    padding-left: 4px;
    padding-right: 4px;
}
</style>
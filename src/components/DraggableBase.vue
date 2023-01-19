<template>
    <div class="draggable" id="draggable">
        <div class="dragarea" @mousedown="beginMove" @mouseup="endMove" align="center">
            title-subwindow
        </div>
        <div class="content">
            <a-button>submit</a-button><a-button>submit</a-button><a-button>submit</a-button>
        </div>

    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'DraggableBase',
    methods: {
        beginMove(e: MouseEvent) {
            const el = document.getElementById('draggable')
            if (!el) {
                return
            }
            const disX = e.clientX - el.offsetLeft
            const disY = e.clientY - el.offsetTop
            document.onmousemove = function (e) {
                const tX = e.clientX - disX
                const tY = e.clientY - disY
                if (tX >= 0 && tX <= window.innerWidth - el.offsetWidth) el.style.left = `${tX}px`
                if (tY >= 0 && tY <= window.innerHeight - el.offsetHeight && tY >= 44) el.style.top = `${tY}px`
            }
        },
        endMove() {
            document.onmousemove = null
        }
    }
})
</script>

<style scoped>
.draggable {
    border: 1px solid #494949;
    max-height: 208px;
    max-width: 600px;
    position: fixed;
    background-color: whitesmoke;
    box-shadow: 0 1px 12px 2px #49494946;
}

.dragarea {
    width: 100%;
    height: 20px;
    background-color: #494949;
    user-select: none;
    padding: 0 20px 0 20px;
    color: white;
}

.content {
    overflow-y: auto;
    max-height: 100px;
}
</style>
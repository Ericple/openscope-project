<template>
    <div class="draggable" id="MessageContainer" @click="toTop">
        <div class="dragarea" @mousedown="beginMove" @mouseup="endMove" @dblclick="toggle" align="center">
            Messages
        </div>
        <div class="tab">
            <a-tabs v-model:activeKey="activeKey" size="small">
                <a-tab-pane v-for="channel in channels" :key="channel.key" :tab="channel.title">
                    <div class="content">
                        <p v-for="message in channel.messages" :key="message.time">
                            [{{ message.time }}] {{ message.type }}: {{ message.message }}
                        </p>
                    </div>
                </a-tab-pane>
            </a-tabs>
            <a-input type="text" size="small" placeholder="Message" id="tool-bar-messagebox" class="tool-bar-messagebox" spellcheck="false" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    name: 'MessageContainer',
    data() {
        return {
            channels: [
                {
                    title: 'system',
                    key: '1',
                    messages: [
                        {
                            type: 'info',
                            time: '10:50:00',
                            message: 'You have the latest alpha release'
                        },
                    ]
                },
                {
                    title: 'server',
                    key: '2',
                    messages: [
                        {
                            type: 'info',
                            time: '10:50:11',
                            message: 'Hello World!'
                        }
                    ]
                }
            ],
            activeKey: ref('1'),
            show: true
        }
    },
    methods: {
        beginMove(e: MouseEvent) {
            const el = document.getElementById('MessageContainer')
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
        toggle(){
            const el = document.getElementById('MessageContainer')
            if(!el) return
            this.show = !this.show;
            if(this.show){
                el.style.maxHeight='208px'
            }else{
                el.style.maxHeight='24px'
            }
        },
        toTop() {
            const el = document.getElementById('MessageContainer')
            const drags = document.getElementsByClassName('draggable')
            if(!el) return
            for (let index = 0; index < drags.length; index++) {
                // console.log(`${(drags[index] as HTMLElement).style.zIndex} >= ${el.style.zIndex}`)
                if(parseInt((drags[index] as HTMLElement).style.zIndex) >= parseInt(el.style.zIndex)) el.style.zIndex = (parseInt((drags[index] as HTMLElement).style.zIndex) + 1).toString()
            }
        },
    }
})
</script>

<style scoped>
.draggable {
    top: 45px;
    max-height: 208px;
    max-width: 600px;
    position: fixed;
    background-color: whitesmoke;
    box-shadow: 0 1px 12px 2px #49494946;
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
}

div.content {
    overflow-y: auto;
    max-height: 100px;
    color: #494949;
}
div.tab{
    padding-left: 8px;
    padding-right: 8px;
    padding-bottom: 8px;
}
</style>
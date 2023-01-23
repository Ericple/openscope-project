<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
    <div id="app-bar" class="app-bar">
        <a-tooltip>
            <template #title>Connect</template>
            <button class="appbar-menu-item button-connect codicon codicon-vm-connect"></button>
        </a-tooltip>
        <a class="appbar-menu-item appbar-connection-info">{{ connectionInfo }}</a>
        <a-tooltip>
            <template #title>Voice & ATIS</template>
            <button class="appbar-menu-item button-atis codicon codicon-radio-tower"></button>
        </a-tooltip>
        <a class="appbar-menu-item appbar-frequency">{{ currentFreq }}</a>

        <a class="appbar-menu-item appbar-atis-info">{{ atisInfo }}</a>
        <a-tooltip>
            <template #title>Display filter</template>
            <button class="appbar-menu-item button-display codicon codicon-filter"></button>
        </a-tooltip>
        <a class="appbar-menu-item appbar-utc-time">{{ time }}</a>
        <a-tooltip>
            <template #title>Active runway</template>
            <button class="appbar-menu-item button-runway" id="button-runway"></button>
        </a-tooltip>
        <a-tooltip>
            <template #title>Open sector</template>
            <button class="appbar-menu-item button-select-sector codicon codicon-folder-opened" @click="openSector"></button>
        </a-tooltip>
        <a class="appbar-menu-item appbar-current-sector" id="appbar-current-sector">NULL</a>
        <a-tooltip>
            <template #title>Setting</template>
            <button class="appbar-menu-item button-setting codicon codicon-settings"></button>
        </a-tooltip>
        <!-- <a-tooltip>
            <template #title>Toggle theme</template>
            <button class="appbar-menu-item button-theme-toggle"></button>
        </a-tooltip> -->
        <a-tooltip>
            <template #title>Position Indicator</template>
            <div id="appbar-coordinate"></div>
        </a-tooltip>
        <button class="appbar-win-control button-close-app codicon codicon-chrome-close" @click="quitApp"></button>
        <button class="appbar-win-control button-restore-app codicon codicon-chrome-maximize" id="maxBtn"
            @click="maxApp"></button>
        <button class="appbar-win-control button-minimize-app codicon codicon-chrome-minimize" @click="minApp"></button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import '@vscode/codicons/dist/codicon.css'

export default defineComponent({
    name: 'AppBar',
    methods: {
        quitApp() {
            (window as any).appbar.quitApp()
        },
        minApp() {
            (window as any).appbar.minimizeApp()
        },
        maxApp() {
            (window as any).appbar.maximizeApp()
            const btn = document.getElementById('maxBtn');
            if (!btn) return;
            if (this.isMaximized) {
                btn.className = "appbar-win-control button-restore-app codicon codicon-chrome-maximize"
            } else {
                btn.className = "appbar-win-control button-restore-app codicon codicon-chrome-restore"
            }
            this.isMaximized = !this.isMaximized
        },
        openSector() {
            (window as any).appbar.openSector()
        }
    },
    data() {
        return {
            checked: false,
            currentFreq: 199.998,
            connectionInfo: "----_---(---)",
            atisInfo: "(-) ---.---",
            time: '',
            isMaximized: false
        }
    },
    mounted: function () {
        setInterval(() => {
            this.time = (window as any).appbar.updateTime()
        }, 1000);
    }
})
</script>

<style scoped>
@media (prefers-color-scheme: dark) {
    div.app-bar {
        background-color: #353535;
    }

    a.appbar-menu-item {
        color: whitesmoke;
    }
    button.appbar-menu-item {
        color: whitesmoke;
    }

    button.button-runway {
        background: url('../assets/image/runway.white.large.svg') no-repeat center;
    }

    button.button-theme-toggle {
        background: url('../assets/image/lightmode.grey.svg') no-repeat center;
    }

    button.appbar-win-control {
        color: whitesmoke;
    }
}

button.button-close-app {
    right: 0px;
}

button.button-minimize-app {
    right: 72px;
}

button.button-restore-app {
    right: 36px;
}

div.app-bar {
    -webkit-app-region: drag;
    position: fixed;
    border: none;
    height: 45px;
    width: 100%;
    padding: 4px;
    box-shadow: 0 9px 28px 8px rgba(0, 0, 0, 0.1);
    z-index: 99;
}

a.appbar-menu-item {
    /* text-decoration: none; */
    line-height: 36px;
    font-size: 12px;
    width: 100px;
    position: relative;
    height: 36px;
    margin-right: 6px;
    padding: 0;
    top: -13px;
    margin-left: 0px;
    user-select: none;
}

button {
    border-radius: 4px;
    margin-right: 8px;
}

button.appbar-menu-item {
    -webkit-app-region: no-drag;
    width: 36px;
    height: 36px;
    position: relative;
    border: none;
    background-color: transparent;
    transition: all 0.2s;
    margin-right: 6px;
    top: -8.5px;
}

button#button-runway {
    top: 0;
}

button:hover {
    /* box-shadow: 0 5px 12px 4px rgba(0, 0, 0, 0.09); */
    cursor: pointer;
    background-color: #1f1d1d65;
}

button.button-atis:hover {
    background-color: #726e6e65;
}

button.button-display:hover {
    background-color: #726e6e65;
}

button.button-runway:hover {
    background-color: #726e6e65;
}

button.button-select-sector:hover {
    background-color: #726e6e65;
}

button.button-setting:hover {
    background-color: #726e6e65;
}

button.button-theme-toggle:hover {
    background-color: #726e6e65;
}

button.appbar-menu-item {
    -webkit-app-region: no-drag;
    width: 36px;
    height: 36px;
    position: relative;
    border: none;
    background-color: transparent;
    transition: all 0.2s;
}

button.button-connect {
    width: 65px;
    background-color: rgb(0, 119, 255);
    margin-right: 8px;
}

button.button-connect:hover {
    background-color: rgb(33, 136, 253);
}

button.button-connect:active {
    background-color: rgb(0, 68, 146);
}

button.appbar-win-control {
    -webkit-app-region: no-drag;
    width: 28px;
    height: 28px;
    position: fixed;
    top: 9px;
    border: none;
    background-color: transparent;
    transition: all 0.2s;
    text-align: center;
    align-items: center;
}

button.button-minimize-app:hover {
    background-color: #726e6e65;
}

button.button-restore-app:hover {
    background-color: #726e6e65;
}

button.button-close-app:hover {
    background-color: darkred;
}
</style>

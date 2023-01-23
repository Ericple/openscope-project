<template>
  <AppBar />
  <MessageContainer />
  <MetarContainer />
  <DepartureList />
  <RadarScreen />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppBar from './components/AppBar.vue'
import MessageContainer from './components/MessageContainer.vue'
import MetarContainer from './components/MetarContainer.vue'
import RadarScreen from './components/RadarScreen.vue'
import DepartureList from './components/AircraftList.vue'

export default defineComponent({
  name: 'App',
  components: {
    AppBar,
    MessageContainer,
    MetarContainer,
    RadarScreen,
    DepartureList
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0;
}

::-webkit-scrollbar {
    width: 4px;
}

::-webkit-scrollbar-thumb {
    background-color: #8f8f8f;
    border-radius: 2px;
}
.app-bar {
  z-index: 2;
}
</style>

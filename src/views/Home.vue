<template>
<div class="main">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <div class='header'>

    <Header/>
    
    </div>
  <sui-container>

    <MainForm msg="Welcome to Your Vue.js App"/>
  </sui-container>
</div>
</template>

<script>
// @ is an alias to /src
import MainForm from '@/components/MainForm.vue'
import Header from '@/components/Header.vue'

export default {
  name: 'Home',
  components: {
    MainForm,
    Header
  }
}
</script>
<style>
div.headerbar{
  background-color:rgb(27, 27, 27);
}

.main{
  padding-bottom:7em;
}
</style>
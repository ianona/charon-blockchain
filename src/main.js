import Vue from 'vue'
import App from './App.vue'
import SuiVue from 'semantic-ui-vue';
import router from './router'

Vue.config.productionTip = false
Vue.use(SuiVue);
Vue.use(require('vue-moment'))
Vue.use(require('vue-cookies'))

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')


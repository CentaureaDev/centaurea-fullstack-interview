import { createApp } from 'vue'
import 'centaurea-ui-shared/styles'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .mount('#app')

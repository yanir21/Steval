import Vue from 'vue';
import App from './App.vue';
import router from './common/router';
import store from './common/store';
import axios from 'axios';
import VueAxios from 'vue-axios';
import apolloProvider from './common/vue-apollo';
import './common/vue-adal'; // FOR AAD AUTHENTICATION
import vuetify from './plugins/vuetify';

Vue.use(VueAxios, axios);
Vue.use(require('vue-shortkey'));

Vue.config.productionTip = false;

new Vue({
	vuetify,
	router,
	store,
	apolloProvider,
	render: h => h(App)
}).$mount('#app');

import Vue from 'vue';
import { default as Adal, AuthenticationContext } from 'vue-adal';
import router from './router';

const tenant = process.env.VUE_APP_TENANT_ID;
const clientId = process.env.VUE_APP_CLIENT_ID;
const redirectUri = process.env.VUE_APP_REDIRECT_URI;

Vue.use(Adal, {
	config: {
		tenant,
		clientId,
		redirectUri,
		cacheLocation: 'localStorage'
	},
	requireAuthOnInitialize: true,
	router: router
});

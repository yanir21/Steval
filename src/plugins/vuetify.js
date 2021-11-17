import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
	rtl: true,
	icons: {
		iconfont: 'md'
	},
	theme: {
		themes: {
			dark: {
				primary: '#074b8f'
			}
		}
	}
});

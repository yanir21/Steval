import Vue from 'vue';
import Router from 'vue-router';
import home from '@/pages/HomePage.vue';
import TestPage from '@/pages/TestPage.vue';
import ErrorPage from '@/pages/ErrorPage.vue';
import AboutPage from '@/pages/AboutPage.vue';
import ManagementPage from '@/pages/ManagementPage.vue';
import IndependencyPage from '@/pages/IndependencyPage.vue';

Vue.use(Router);

const router = new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			component: home
		},
		{
			path: '/test',
			component: TestPage
		},
		{
			path: '/error',
			component: ErrorPage
		},
		{
			path: '/about',
			component: AboutPage
		},
		{
			path: '/manage',
			component: ManagementPage
		},
		{
			path: '/independency',
			component: IndependencyPage
		}
	]
});

export default router;

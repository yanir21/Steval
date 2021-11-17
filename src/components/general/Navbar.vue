<template>
	<div id="app">
		<v-toolbar dark color="primary">
			<a>
				<router-link to="/" exact tag="div">
					<img src="@/assets/logo.png" id="logo" />
				</router-link>
			</a>
			<v-spacer></v-spacer>
			<article id="selector">
				<v-select
					v-if="rootsList.length > 1"
					v-model="currRoot"
					class="mt-7"
					:items="rootsList"
					item-text="name"
					item-value="id"
					label="עץ הערכה"
					outlined
					dense
				></v-select>
			</article>
			<router-link to="/manage" id="manage" tag="div">
				<v-btn icon text>
					<v-icon medium class="work-tool">build</v-icon>
				</v-btn>
			</router-link>
			<v-btn icon text @click="redirectToGitLlab">
				<v-icon medium class="work-tool">{{ bugReport }}</v-icon>
			</v-btn>
			<v-btn icon text @click="toggleDarkMode">
				<v-icon medium class="work-tool" id="light">{{
					this.darkMode ? this.darkModeIcon : this.lightModeIcon
				}}</v-icon>
			</v-btn>
		</v-toolbar>
		<v-progress-linear
			:indeterminate="loading"
			color="grey darken-1"
			height="6"
		></v-progress-linear>
	</div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { getCourseByRoot } from '@/queries/StudentsQueries';

export default {
	apollo: {
		cycles: {
			query() {
				return getCourseByRoot;
			},
			variables() {
				return {
					rootId: this.userRootMegama.root
				};
			},
			skip() {
				return !this.userRootMegama || !this.userRootMegama.root;
			},
			result({loading, data}) {
				if (!loading) {
					const courses = data.cycles[0].group.courses.map(course => ({
						name: course.group.name,
						id: course.group.id
					}));

					this.loadCoursesList(courses);
					this.chooseCourse(courses[0].id);
				}
			}
		}
	},
	data() {
		return {
			bugReport: 'bug_report',
			lightModeIcon: 'brightness_2',
			darkModeIcon: 'wb_sunny'
		};
	},
	computed: {
		...mapGetters(['loading']),
		...mapState(['darkMode', 'rootsList', 'userRootMegama']),
		currRoot: {
			set(root) {
				localStorage.setItem('currentRoot', root);
				this.changeUserRoot(root);
				if (this.$router.currentRoute.path === '/test') {
					this.$router.push({
						path: '/'
					});
				}
			},
			get() {
				return this.userRootMegama.root;
			}
		}
	},
	methods: {
		...mapActions(['changeUserRoot', 'loadCoursesList', 'chooseCourse']),
		redirectToGitLlab() {
			window.open('http://gitlab.it.bsmch.net/toval/steval3/-/issues/new');
		},
		toggleDarkMode() {
			localStorage.setItem('darkMode', !this.$vuetify.theme.dark);
			this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
			this.$store.dispatch('changeDarkMode', !this.darkMode);
		}
	}
};
</script>

<style lang="css">
#logo {
	margin-top: 5px;
}
#navbar {
	margin: 1.5vw 0 0 0;
}
#manage {
	margin-right: 2%;
}
#selector {
	max-width: 12vw;
}
</style>

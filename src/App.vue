<template>
	<v-app>
		<navbar></navbar>
		<router-view></router-view>
		<generic-dialog
			:title="dialog.title"
			:content="dialog.content"
			:dialog="dialog.show"
			@commit="dialog.show = false"
		></generic-dialog>
	</v-app>
</template>

<script>
import Navbar from '@/components/general/Navbar.vue';
import GenericDialog from '@/components/general/GenericDialog';
import { mapActions, mapState } from 'vuex';
import { userDetailsBySoldierId } from '@/queries/UsersQueries';
import { getRootByMegama } from '@/queries/MegamotQueries';
import {
	getCourseByRoot,
	GetCourseId,
	getLinkedRootsAndGroupsBySoldierId
} from '@/queries/StudentsQueries';
import { AuthenticationContext } from 'vue-adal';
import { reAuthenticate } from '@/common/vue-apollo';

export default {
	name: 'App',
	components: {
		navbar: Navbar,
		GenericDialog
	},
	async created() {
		if (JSON.parse(localStorage.getItem('darkMode'))) {
			this.turnOnDarkMode();
		}

		if (this.isAuthenticated) {
			this.conectedSoldierId = this.isAuthenticated.userName.substr(1, 7); // For debugging, put a relevent soldier id here

			const rootMegama = await this.getRootMegama();

			this.initUserRootMegama(rootMegama);

			this.selectCurrentCourse();
		} else {
			reAuthenticate();
		}
	},
	data() {
		return {
			conectedSoldierId: '',
			dialog: {
				show: false,
				title: 'אנחנו לא מוצאים שום עץ הערכה :(',
				content:
					'היי, חיפשנו במערכת ונראה שאין עץ הערכה שמקושר אליך, זה יכול לקרות בגלל אחת מ2 סיבות, יכול להיות שהמחזור הנוכחי נגמר / עוד לא התחיל ויכול להיות שעוד לא פתחו את עץ ההערכה בiGrade. אם ישנו עץ הערכה בiGrade והמחזור הנוכחי פעיל פנו אל צוות Steval.'
			}
		};
	},
	computed: {
		...mapState(['darkMode', 'userRootMegama'])
	},
	methods: {
		...mapActions(['initUserRootMegama', 'changeRootsList', 'loadCoursesList', 'chooseCourse']),
		turnOnDarkMode() {
			this.$vuetify.theme.dark = true;
			localStorage.setItem('darkMode', true);
			this.$store.dispatch('changeDarkMode', true);
		},
		async selectCurrentCourse() {
			let {
				data: { cycles }
			} = await this.$apollo.query({
				query: getCourseByRoot,
				variables: {
					rootId: this.userRootMegama.root
				},
				fetchPolicy: 'no-cache'
			});

			const courses = cycles[0].group.courses.map((course) => ({
				name: course.group.name,
				id: course.group.id
			}));

			this.loadCoursesList(courses);

			const courseId = (
				await this.$apollo.query({
					query: GetCourseId,
					variables: {
						soldier_id: this.conectedSoldierId
					},
					fetchPolicy: 'no-cache'
				})
			).data.courseId[0].assignments[0].course_id;

			this.chooseCourse(
				courseId && courses.find(course => course.id === courseId)
					? courseId
					: courses[0].id
			);
		},
		async getMegama() {
			const {
				data: { userDetailsBySoldierId: userDetails }
			} = await this.$apollo.query({
				query: userDetailsBySoldierId,
				variables: {
					soldier_id: this.conectedSoldierId
				}
			});

			if (userDetails[0].assignments.length) {
				return userDetails[0].assignments[0].megama_id;
			}
			this.dialog = {
				show: true,
				title: 'היי, לא מצאנו קישור למגמה :(',
				content:
					'היי, חיפשנו ולא מצאנו שם קישור שלך למגמה, יכול להיות שנגמר הקורס? אם לא אז כנראה הייתה בעייה בפתיחה התשתיתית, נסו לדבר עם מתקן.'
			};

			return null;
		},
		async getRoot(megama_id) {
			const {
				data: { api_all_tree_roots: roots }
			} = await this.$apollo.query({
				query: getRootByMegama,
				variables: {
					megama_id
				}
			});

			this.changeRootsList(roots);

			const {
				data: { roots: linkedRoots }
			} = await this.$apollo.query({
				query: getLinkedRootsAndGroupsBySoldierId,
				variables: {
					soldierId: this.conectedSoldierId
				}
			});

			const myRoot = JSON.parse(localStorage.getItem('currentRoot'));
			if (myRoot && roots.find(root => root.id === myRoot)) {
				return myRoot;
			}

			if (linkedRoots.length) {
				return linkedRoots[0].root_id;
			}
			this.dialog.show = !roots.length;

			return roots[0].id;
		},
		async getRootMegama() {
			const megama = await this.getMegama();
			const root = await this.getRoot(megama);

			return {
				megama,
				root
			};
		}
	}
};
</script>
<style>
.v-dialog {
	box-shadow: none !important;
	-webkit-box-shadow: none !important;
	-webkit-user-select: none;
	-ms-user-select: none;
	user-select: none;
}
#fab {
	opacity: 0.8;
}
</style>

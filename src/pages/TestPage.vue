<template>
	<v-container>
		<v-row align="start" justify="space-between">
			<v-col>
				<test-title
					class="pa-3"
					:relevantCourses="relevantCourses"
					:testList="testList"
					@error-bar="showError($event)"
					@change-test="changeTestDetails()"
				></test-title>
				<v-row>
					<students-dropdown
						v-if="!teamTest"
						class="dropdown"
						:studentsListDrop="studentsListWithState"
						@update-filled-students="updateFilledStudents()"
					></students-dropdown>
					<teams-dropdown
						v-else
						class="dropdown"
						:studentsListDrop="studentsListWithState"
						@update-filled-students="updateFilledStudents()"
					></teams-dropdown>
					<meetings-dropdown
						v-if="chosenStudentID || chosenTeam"
						class="dropdown"
					></meetings-dropdown>
				</v-row>
			</v-col>
			<v-col justify="start">
				<v-row>
					<test-status
						:total="studentsList.length"
						:filled="filledStudentAmount"
						:halfFilled="halfFilledStudentAmount"
						:notFilled="notFilledStudentAmount"
					></test-status>
				</v-row>
			</v-col>
		</v-row>
		<v-row>
			<v-col cols="3">
				<students-list
					v-if="!teamTest && chosenStudentList.length"
					class="studentList"
				></students-list>
				<teams-list v-else-if="teams.length" class="studentList"></teams-list>
			</v-col>
			<v-col cols="9">
				<v-row>
					<eval></eval>
				</v-row>
			</v-col>
		</v-row>
		<v-snackbar v-model="showErrorSnackbar" :color="`error`" :left="true" :timeout="2000">{{
			errorMsg
		}}</v-snackbar>
	</v-container>
</template>

<script>
import StudentsDropdown from '@/components/testInfo/StudentsDropdown.vue';
import MeetingsDropdown from '@/components/testInfo/MeetingsDropdown.vue';
import TeamsDropdown from '@/components/testInfo/TeamsDropdown.vue';
import TestStatus from '@/components/testInfo/TestStatus.vue';
import TestTitle from '@/components/testInfo/TestTitle.vue';
import Eval from '@/components/eval/Eval.vue';
import StudentsList from '@/components/testInfo/StudentsList.vue';
import TeamsList from '@/components/testInfo/TeamsList.vue';
import { getTestCriterionsAmount, getTestNames } from '@/queries/TestQueries';
import { countTeamsStudents } from '@/queries/TeamsQueries';
import { studentsFilledGardesPerTestCount } from '@/queries/GradesQueries';
import { getAllStudents } from '@/queries/StudentsQueries';
import { getTestGradesAmount } from '@/DAL/tests.js';
import { mapState } from 'vuex';
import EventBus from '@/plugins/eventbus';
import { mapActions } from 'vuex';

export default {
	apollo: {
		testList: {
			query() {
				return getTestNames;
			},
			variables() {
				return {
					root_id: this.userRootMegama.root
				};
			},
			skip() {
				return !this.userRootMegama.root;
			},
			result() {
				if (!this.test) {
					this.loadTest(this.testList[0]);
				}
			}
		},
		studentsList: {
			query() {
				return getAllStudents;
			},
			variables() {
				return {
					courses: this.chosenCourse
				};
			},
			result() {
				this.updateStudentsListWithState();
			}
		},
		filledGrades: {
			query() {
				return studentsFilledGardesPerTestCount;
			},
			variables() {
				return {
					milestone_id: this.test.id,
					student_ids: this.studentsList.map(student => student.user_role.id)
				};
			},
			skip() {
				return !this.studentsList || !this.test.id;
			},
			result({
				data: {
					filledGrades: { nodes: grades }
				}
			}) {
				let gradesCountPerStudent = this.getGradeCountPerStudent(grades);

				this.updateFilledStatus(gradesCountPerStudent);
			},
			fetchPolicy: 'no-cache'
		}
	},
	components: {
		TestTitle,
		TestStatus,
		StudentsDropdown,
		MeetingsDropdown,
		TeamsDropdown,
		StudentsList,
		TeamsList,
		Eval
	},
	async mounted() {
		if (this.teamTest) {
			const teams = await this.$apollo.query({
				query: countTeamsStudents,
				variables: {
					milestone_id: this.test.id
				},
				fetchPolicy: 'no-cache'
			});
			this.teamsCount = teams.data.teamsCount;
		}
	},
	data() {
		return {
			testList: [],
			teamsCount: [{ team_members_aggregate: { aggregate: { count: 0 } } }],
			gradesPerTeam: [
				{
					team: {
						name: '',
						assigns: [{ users_role: { grades_aggregate: { aggregate: { count: 0 } } } }]
					}
				},
				{
					team: {
						name: '',
						assigns: [{ users_role: { grades_aggregate: { aggregate: { count: 0 } } } }]
					}
				}
			],
			showErrorSnackbar: false,
			studentsList: [],
			filledStudentsStatus: [],
			studentsListWithState: [],
			errorMsg: ''
		};
	},
	created() {
		this.updateFilledStudents();
		EventBus.$on('studentGradeFilled', () => this.updateFilledStudents());
	},
	computed: {
		...mapState([
			'teamTest',
			'test',
			'chosenCourse',
			'coursesList',
			'chosenStudentList',
			'chosenStudentID',
			'chosenTeam',
			'teams',
			'userRootMegama'
		]),
		filledStudentAmount() {
			return this.studentsListWithState.filter(student => student.filledStatus === 'FILLED')
				.length;
		},
		halfFilledStudentAmount() {
			return this.studentsListWithState.filter(
				student => student.filledStatus === 'HALF_FILLED'
			).length;
		},
		notFilledStudentAmount() {
			return this.studentsListWithState.filter(
				student => student.filledStatus === 'NOT_FILLED'
			).length;
		},
		relevantCourses() {
			const chosen = this.chosenCourse;
			return chosen ? [chosen] : this.coursesList.map(course => course.id);
		}
	},
	methods: {
		...mapActions(['changeMeeting']),
		showError(msg) {
			this.errorMsg = msg;
			this.showErrorSnackbar = false;
			this.showErrorSnackbar = true;
		},
		getGradeCountPerStudent(allGradesAsStudentId) {
			let gradesCountPerStudent = {};

			allGradesAsStudentId.forEach(student =>
				!gradesCountPerStudent[student.student_id]
					? (gradesCountPerStudent[student.student_id] = 1)
					: gradesCountPerStudent[student.student_id]++
			);

			return gradesCountPerStudent;
		},
		updateFilledStudents() {
			this.$apollo.queries.filledGrades.refetch();
		},
		async changeTestDetails() {
			await this.updateFilledStudents();
			this.changeMeeting(null);
		},
		async updateFilledStatus(gradesCountPerStudent) {
			const testCriterionsAmount = await getTestGradesAmount(this, this.test.id);

			this.filledStudentsStatus = this.filledStudentsStatus.filter(
				student => gradesCountPerStudent[student.id]
			);

			const oldFilledIds = this.filledStudentsStatus;

			Object.keys(gradesCountPerStudent).forEach(key => {
				const currStudent = oldFilledIds.find(student => student.id == key);

				const currStudentFilledStatus =
					gradesCountPerStudent[key] === testCriterionsAmount ? 'FILLED' : 'HALF_FILLED';

				if (!currStudent) {
					oldFilledIds.push({
						id: key,
						filledStatus: currStudentFilledStatus
					});
				} else {
					currStudent.filledStatus = currStudentFilledStatus;
				}
			});

			this.updateStudentsListWithState();
		},
		updateStudentsListWithState() {
			let listDropItems = [];

			this.studentsList.forEach(student => {
				let currStudent = this.filledStudentsStatus.find(
					currStudent => currStudent.id == student.user_role.id
				);
				listDropItems.push({
					displayName: `${student.user_role.details.student_number} - ${student.user_role.user.first_name} ${student.user_role.user.last_name}`,
					id: student.user_role.id,
					soldierId: student.user_role.user.soldier_id,
					filledStatus: currStudent ? currStudent.filledStatus : 'NOT_FILLED'
				});
			});
			this.studentsListWithState = listDropItems.sort((a, b) =>
				a.displayName > b.displayName ? 1 : -1
			);
		}
	},
	watch: {
		studentsList() {
			this.updateFilledStudents();
		}
	}
};
</script>

<style lang="css" scoped>
.dropdown {
	margin-top: 2vh;
	max-width: 20vw;
	margin-right: 3vw;
}
.studentList {
	max-width: 25vw;
}
</style>

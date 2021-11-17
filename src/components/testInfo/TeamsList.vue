<template>
	<v-card>
		<v-card-text class="studentList">
			<v-list nav>
				<v-list-group
					v-model="openTeams[teamIndex]"
					v-for="(team, teamIndex) in teamStudentsList"
					:key="team.id"
					dir="ltr"
				>
					<template v-slot:activator>
						<v-btn icon @click="!selectCoolDown ? removeTeam(team.id) : null">
							<v-icon>
								highlight_off
							</v-icon>
						</v-btn>
						<v-list-item-title dir="rtl">צוות {{ team.name }}</v-list-item-title>
					</template>
					<v-list-item
						dir="rtl"
						v-for="(student, index) in team.team_members"
						:key="index"
						two-line
						class="studentDetails"
						@click="chooseStudent(student.id)"
						:class="chosenStudentID === student.id ? 'selectedStudent' : null"
					>
						<v-list-item-avatar>
							<v-img
								class="studentImage"
								:src="`http://imageservice.it.bsmch.net/${student.soldierId}`"
								aspect-ratio="1"
							>
							</v-img>
						</v-list-item-avatar>
						<v-list-item-content>
							<v-list-item-title v-text="student.name"> </v-list-item-title>
							<v-list-item-subtitle v-text="student.studentId">
							</v-list-item-subtitle>
							<v-list-item-subtitle>
								<progress-bar
									:maxValue="maximumAmountOfCriterions"
									:currentValue="student.gradeCount"
								/>
							</v-list-item-subtitle>
						</v-list-item-content>
					</v-list-item>
				</v-list-group>
			</v-list>
		</v-card-text>
	</v-card>
</template>

<script>
import ProgressBar from '@/components/testInfo/ProgressBar.vue';
import { mapState, mapGetters, mapActions } from 'vuex';
import { getTeamStudents } from '@/queries/TeamsQueries';
import { getTestCriterionsAmount } from '@/queries/TestQueries';
import EventBus from '@/plugins/eventbus';

export default {
	apollo: {
		teamStudentsList: {
			query() {
				return getTeamStudents;
			},
			skip() {
				return !this.teams || !this.test.id;
			},
			variables() {
				return {
					milestone_id: this.test.id,
					group_id: this.teams
				};
			},
			result() {
				this.teamStudentsList.map((team, index) => {
					team.team_members.map(student => {
						student.name = `${student.users_role.user.first_name} ${student.users_role.user.last_name}`;
						student.studentId = student.users_role.details.student_number;
						student.id = student.users_role.id;
						student.soldierId = student.users_role.user.soldier_id;
						student.gradeCount = student.users_role.grade.aggregate.count;
					});

					if (index === 0) {
						this.chooseTeam(team.id);
					}
				});
			},
			fetchPolicy: 'no-cache'
		},
		maximumAmountOfCriterions: {
			query() {
				return getTestCriterionsAmount;
			},
			variables() {
				return {
					milestone_id: this.test.id
				};
			},
			skip() {
				return !this.test.id;
			},
			result({ data: { maximumAmountOfCriterions } }) {
				this.maximumAmountOfCriterions = maximumAmountOfCriterions.aggregate.count;
			},
			fetchPolicy: 'no-cache'
		}
	},
	data() {
		return {
			maximumAmountOfCriterions: 0,
			selectCoolDown: false,
			teamStudentsList: [],
			openTeams: [true]
		};
	},
	components: {
		ProgressBar
	},
	created() {
		EventBus.$on('studentGradeFilled', () => this.$apollo.queries.teamStudentsList.refetch());
	},
	computed: {
		...mapState(['chosenStudentID', 'test', 'teams', 'chosenTeam'])
	},
	methods: {
		...mapActions(['chooseTeam', 'chooseStudent', 'updateTeams']),
		removeTeam(id) {
			const filterdTeams = this.teams.filter(team => team !== id);
			this.selectCoolDown = true;
			setTimeout(() => (this.selectCoolDown = false), 1);
			this.updateTeams(filterdTeams);
			if (filterdTeams.length === 0) {
				this.chooseTeam('');
				this.chooseStudent('');
			}
		}
	},
	watch: {
		openTeams() {
			const openTeamsCount = this.openTeams.filter(team => team).length;
			if (openTeamsCount == 1) {
				const teamIndex = this.openTeams.findIndex(team => team);
				this.chooseTeam(this.teams[teamIndex]);
			} else if (openTeamsCount === 0) {
				this.chooseTeam('');
			}
		},

		chosenTeam() {
			if (this.chosenTeam) {
				this.chooseStudent(
					this.teamStudentsList.find(currTeam => this.chosenTeam == currTeam.id)
						.team_members[0].id
				);
			} else {
				this.chooseStudent('');
			}
		}
	}
};
</script>

<style scoped>
.studentList {
	max-height: 400px;
	width: 22vw;
	overflow-y: auto;
}
.studentImage {
	background-size: cover;
	background-image: url('../../assets/bsmh.png');
	box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
.selectedStudent {
	background: rgb(130, 164, 226);
	transition: 0.5s;
}
.studentDetails:hover:not(.selectedStudent) {
	background: gainsboro;
}
</style>

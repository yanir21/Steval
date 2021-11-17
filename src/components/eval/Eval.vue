<template>
	<v-row v-if="chosenStudentID || chosenTeam" justify="space-around" align="start">
		<v-card class="mx-5 " :width="$vuetify.breakpoint.xl ? 1200 : 800">
			<run-meeting-info
				v-if="isRunMeeting"
				:criterionsList="criterionsList()"
				@meetingChanged="updateLastFiller"
			></run-meeting-info>
			<star-meeting-info
				v-else
				:criterionsList="criterionsList()"
				@meetingChanged="updateLastFiller"
			></star-meeting-info>
		</v-card>
	</v-row>
</template>

<script>
import EventBus from '@/plugins/eventbus';
import StarMeetingInfo from '@/components/eval/stars/StarMeetingInfo.vue';
import RunMeetingInfo from '@/components/eval/run/RunMeetingInfo.vue';
import { getTeamStudents } from '@/queries/TeamsQueries';
import { getTestMeetingCriterions } from '@/queries/TestQueries';
import { mapState } from 'vuex';

export default {
	apollo: {
		teamStudentsList: {
			query() {
				return getTeamStudents;
			},
			skip() {
				return !this.$store.state.chosenTeam || !this.$store.state.test.id;
			},
			variables() {
				return {
					milestone_id: this.$store.state.test.id,
					group_id: [this.chosenTeam]
				};
			},
			fetchPolicy: 'no-cache'
		},
		meetingCriterionsList: {
			query() {
				return getTestMeetingCriterions;
			},
			skip() {
				return !this.$store.getters.currentMeeting;
			},

			variables() {
				return {
					meeting_id: this.$store.getters.currentMeeting
				};
			}
		}
	},
	components: {
		StarMeetingInfo,
		RunMeetingInfo
	},

	data() {
		return {
			teamStudentsList: [],
			meetingCriterionsList: [],
			bsmhImg: 'bsmh.png',
			was: true
		};
	},
	created() {
		EventBus.$on('studentGradeFilled', () => this.$apollo.queries.teamStudentsList.refetch());
	},
	computed: {
		...mapState(['chosenStudentID', 'chosenTeam', 'teamTest']),
		img() {
			if (this.chosenStudent.name == '') {
				return '';
			}
			return this.bsmhImg;
		},
		isStudentChosen() {
			return !(this.chosenStudentID == '');
		},
		meetingName() {
			return this.meetingCriterionsList.length ? this.meetingCriterionsList[0].name : '';
		},
		isRunMeeting() {
			if (this.meetingCriterionsList[0] && this.meetingCriterionsList[0]) {
				return this.meetingCriterionsList[0].tags.some(
					tag => tag.currentTag.name === 'ריצה'
				);
			}

			return false;
		},
		showStudDetails() {
			return this.isStudentChosen;
		}
	},
	methods: {
		updateLastFiller(studentsGradesPerMeeting) {
			const newAuthorRoldId = !studentsGradesPerMeeting.length
				? ''
				: studentsGradesPerMeeting[studentsGradesPerMeeting.length - 1].author_id;
			this.$store.dispatch('changeLastFillerUserRole', newAuthorRoldId);
		},
		studentsList() {
			const fixedArray = [];
			if (this.teamStudentsList.length) {
				this.teamStudentsList[0].team_members.forEach(assign => {
					fixedArray.push({
						name: `${assign.users_role.user.first_name} ${assign.users_role.user.last_name}`,
						id: assign.users_role.id,
						studentNumber: assign.users_role.details.student_number,
						filledCriterions: assign.users_role.grade.aggregate.count
					});
				});
			}
			return fixedArray;
		},
		criterionsList() {
			let fixedArray = [];
			if (this.meetingCriterionsList.length > 0) {
				this.meetingCriterionsList[0].criterions.forEach(criterion => {
					fixedArray.push({ name: criterion.name, id: criterion.id });
				});
			}
			return fixedArray;
		}
	},
	watch: {
		teamStudentsList(currTeam, oldTeam) {
			if (
				!this.$store.state.chosenStudentID ||
				!oldTeam[0] ||
				currTeam[0].id != oldTeam[0].id
			) {
				// this.$store.commit('chooseStudent', this.studentsList()[0].id);
				const list = this.teamStudentsList[0].team_members.map(stud => stud.users_role.id);
				this.$store.dispatch('updateChosenStudentList', list);
			}
		}
	}
};
</script>

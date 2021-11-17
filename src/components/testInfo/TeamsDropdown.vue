<template>
	<div>
		<v-autocomplete
			height="25"
			auto-select-first
			:items="teamsListDrop"
			v-model="chosenTeamsList"
			chips
			item-text="name"
			item-value="id"
			:label="teamPlaceHolder"
			persistent-hint
			multiple
		>
			<template v-slot:selection="{ item, index }">
				<span v-if="index === 0">{{ item.name }}</span>
				<span v-if="index === 1" class="caption">
					&nbsp;&nbsp;(+{{ chosenTeamsList.length - 1 }}
					{{ chosenTeamsList.length - 1 > 1 ? 'נוספים' : 'נוסף' }})
				</span>
			</template>
			<template v-slot:item="{ item }">
				<template>
					<v-list-item-avatar>
						<v-icon
							class="light_opacity"
							style="color: #e52b50;"
							v-if="item.filledStatus === 'NOT_FILLED'"
							>{{ 'radio_button_unchecked' }}</v-icon
						>
						<v-icon
							class="light_opacity"
							style="color: #4fa1ff;"
							v-else-if="item.filledStatus === 'HALF_FILLED'"
							>{{ 'remove_circle_outline' }}</v-icon
						>
						<v-icon class="light_opacity" style="color: #4ae683;" v-else>{{
							'check_circle_outline'
						}}</v-icon>
					</v-list-item-avatar>
					<v-list-item-content>
						<v-list-item-title v-html="item.name"></v-list-item-title>
					</v-list-item-content>
				</template>
			</template>
		</v-autocomplete>
	</div>
</template>

<script>
import { getTestTeams } from '@/queries/TeamsQueries';
import { getTestGradesAmount } from '@/DAL/tests.js';
import { getTestTeamsWithStudents } from '@/DAL/teams.js';
import { mapState, mapActions } from 'vuex';
import EventBus from '@/plugins/eventbus';

export default {
	created() {
		EventBus.$on('studentGradeFilled', () => this.updateFilledTeams());
	},
	apollo: {
		teamsList: {
			query() {
				return getTestTeams;
			},
			variables() {
				return {
					milestone_id: this.$store.state.test.id
				};
			}
		}
	},
	data() {
		return {
			teamsListWithFillStatus: [],
			teamsList: [],
			teamPlaceHolder: 'בחר צוות'
		};
	},
	watch: {
		teamsList() {
			this.updateFilledTeams();
		}
	},
	methods: {
		...mapActions(['updateTeams']),
		sortFilledStatusTeamList() {
			this.teamsListWithFillStatus.sort(function(a, b) {
				return a.name - b.name;
			});
		},

		async updateFilledTeams() {
			const testCriterionsAmount = await getTestGradesAmount(this, this.$store.state.test.id);
			const currTeamsList = await getTestTeamsWithStudents(this, this.$store.state.test.id);

			// adding the filled status
			currTeamsList.forEach(team => {
				const currTeamGradesAmount = (team.filledStatus = team.team_members.reduce(
					(totalGradesAccumulator, currStudentDetails) =>
						totalGradesAccumulator +
						currStudentDetails.users_role.grade.aggregate.count,
					0
				));

				team.filledStatus =
					currTeamGradesAmount === testCriterionsAmount * team.team_members.length
						? 'FILLED'
						: currTeamGradesAmount > 0
						? 'HALF_FILLED'
						: 'NOT_FILLED';
			});

			this.teamsListWithFillStatus = currTeamsList;
		}
	},
	computed: {
		...mapState(['teams']),
		chosenTeamsList: {
			get() {
				return this.teams;
			},
			set(teams) {
				this.updateTeams(teams);
			}
		},
		teamsListDrop() {
			this.sortFilledStatusTeamList();
			return this.teamsListWithFillStatus.map(team => {
				return {
					name: 'צוות ' + team.name,
					id: team.id,
					filledStatus: team.filledStatus
				};
			});
		}
	}
};
</script>

<style lang="css" scoped></style>

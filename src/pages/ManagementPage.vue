<template>
	<v-container fluid>
		<v-row justify="space-around" align="center" class="head-content">
			<v-col id="test-name" class="text-h4 font-weight-medium">
				<span dir="rtl" class="font-weight-bold" v-if="!!currTest.name"
					>{{ currTest.subject.name }}:
				</span>
				<span
					dir="rtl"
					class="sub-title "
					:class="meetingTitle !== '' ? 'clickable' : ''"
					@click="meetingTitle !== '' ? getDetailsAndUpdateTree(currTest) : ''"
				>
					{{ title }}</span
				>
				<span v-show="meetingTitle" class="sub-title"> > {{ meetingTitle }}</span>
			</v-col>
			<v-dialog v-model="finalSpecialPricingsDialog" max-width="50vw">
				<manage-special-pricing
					v-if="finalSpecialPricingsDialog"
					:criterion="active"
					@close="finalSpecialPricingsDialog = false"
				></manage-special-pricing>
			</v-dialog>
			<v-col cols="auto">
				<v-switch
					v-model="isActive"
					class="pl-5"
					v-if="active.id && active.id == currTest.id"
					:label="isActive ? 'רץ עכשיו!' : 'רץ עכשיו?'"
					color="green darken-1"
					id="run-switch"
					@change="activateTest()"
				></v-switch>
				<v-tooltip top>
					<label>אפשר להחליף סוג פגישה רק כאשר אין לפגישה קריטריונים</label>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-checkbox
								v-if="active.id && active.id !== currTest.id"
								class="switch pa-1"
								v-model="isRunMeeting"
								label="בודקים ריצה?"
								color="primary"
								:disabled="criterionsCount.aggregate.count !== 0"
								@change="updateMeetingType"
							></v-checkbox>
						</div>
					</template>
				</v-tooltip>
			</v-col>
		</v-row>
		<v-row justify="space-around" align="start">
			<v-col id="test-list" cols="3">
				<test-list
					:testList="testList"
					@select-test="getDetails($event)"
					:selectedValue="selectedInTree"
				></test-list>
			</v-col>

			<v-col>
				<v-container>
					<manage-criterion-list
						ref="manageCriterionList"
						:active="active"
						@refetch-criterion-count="$apollo.queries.criterionsCount.refetch()"
						@final-pricing-dialog="finalSpecialPricingsDialog = true"
						@select-test="getDetailsAndUpdateTree($event)"
					></manage-criterion-list>
				</v-container>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import ManageSpecialPricing from '@/components/management/ManageSpecialPricing';
import ManageTestList from '@/components/management/ManageTestList';
import ManageCriterionList from '@/components/management/ManageCriterionList';
import { testNamesAndMeetings, countCriterions } from '@/queries/TestQueries';
import { getActiveTag } from '@/queries/ManageQueries';
import { deleteMilestoneTag, insertMilestoneTag } from '@/DAL/tags.js';
import { insertGradeToStudentByRoot } from '@/BL/independencyGrades';
import { mapActions, mapState } from 'vuex';

export default {
	apollo: {
		testList: {
			query() {
				return testNamesAndMeetings;
			},
			variables() {
				return {
					root_id: this.$store.state.userRootMegama.root
				};
			},
			skip() {
				return !this.$store.state.userRootMegama.root;
			},
			fetchPolicy: 'no-cache'
		},
		activeTag: {
			query() {
				return getActiveTag;
			}
		},
		criterionsCount: {
			query() {
				return countCriterions;
			},
			variables() {
				return {
					meeting_id: this.active.id
				};
			},
			skip() {
				return !this.active.id || this.active.id === this.currTest.id;
			}
		}
	},
	data() {
		return {
			title: '',
			meetingTitle: '',
			testList: [],
			active: {},
			activeTag: {},
			criterionsCount: { aggregate: { count: -1 } },
			currTest: {},
			isRunMeeting: false,
			isTeamTest: false,
			isActive: false,
			confirmedPercentage: false,
			finalSpecialPricingsDialog: false,
			selectedInTree: {},
			showErrorSnackbar: false,
			errorMessage: 'אופס! הייתה שגיאה בתקשורת עם השרת...'
		};
	},
	mounted() {
		this.$store.dispatch('resetStore');
		sessionStorage.clear();
	},
	components: {
		'test-list': ManageTestList,
		ManageSpecialPricing,
		ManageCriterionList
	},
	computed: { ...mapState(['userRootMegama']) },
	methods: {
		...mapActions(['changeManageTest', 'changeManageRunMeeting']),

		getDetails(selectedTest) {
			if (!selectedTest) {
				this.currTest = {};
				this.active = {};
				this.title = '';
				this.meetingTitle = '';
			} else {
				this.active = selectedTest;
				this.confirmedPercentage = false;

				if (this.tagExists(selectedTest, 'ריצה')) {
					this.changeManageRunMeeting(selectedTest);
					this.isRunMeeting = true;
				} else {
					this.isRunMeeting = false;
				}

				if (this.tagExists(this.active, 'מבחן') || this.tagExists(this.active, 'תר"ץ')) {
					this.currTest = selectedTest;
					this.title = selectedTest.name;
					this.meetingTitle = '';
				} else {
					this.currTest = this.testList.find(test =>
						test.children.find(meeting => meeting.id == this.active.id)
					);
					this.title = this.currTest.name;
					this.meetingTitle = this.active.name;
				}

				this.changeManageTest(this.currTest);
				this.isActive = this.tagExists(this.currTest, 'פעיל');
			}
		},
		getDetailsAndUpdateTree(selectedTest) {
			this.getDetails(selectedTest);
			this.selectedInTree = selectedTest;
		},
		tagExists(test, tagName) {
			return (
				!!test.milestones_tags && test.milestones_tags.find(tag => tag.tag.tag == tagName)
			);
		},
		async activateTest() {
			if (!this.isActive) {
				this.currTest = await deleteMilestoneTag(
					this,
					this.currTest.id,
					this.activeTag[0].id
				);
			} else {
				this.currTest = await insertMilestoneTag(
					this,
					this.currTest.id,
					this.activeTag[0].id
				);
				// Todo: לפי תג
				const independencyCriterion = this.currTest.children.find(
					milestone => milestone.name === 'עצמאות'
				);

				if (independencyCriterion) {
					insertGradeToStudentByRoot(
						this,
						100,
						independencyCriterion.id,
						this.userRootMegama.root
					);
				}
			}

			const index = this.testList.findIndex(test => test.id == this.currTest.id);
			this.$set(this.testList, index, this.currTest);
		},
		async updateTestList() {
			let newTests = await this.$apollo.query({
				query: testNamesAndMeetings,
				variables: {
					root_id: this.$store.state.userRootMegama.root
				},
				fetchPolicy: 'no-cache'
			});

			this.testList = newTests.data.testList;

			let currTest = this.testList.find(test => test.id == this.active.id);
			if (!currTest) {
				this.testList.forEach(test => {
					let tempTest = test.children.find(childTest => childTest.id === this.active.id);

					currTest = tempTest ? tempTest : currTest;
				});
			}

			this.getDetails(currTest);
		},
		showError(errorMsg) {
			this.errorMessage = errorMsg;
			this.showErrorSnackbar = false;
			this.showErrorSnackbar = true;
		},
		async updateMeetingType() {
			const RUN_MEETING_TAG_ID = 35;
			if (this.isRunMeeting) {
				await insertMilestoneTag(this, this.active.id, RUN_MEETING_TAG_ID);
			} else {
				await deleteMilestoneTag(this, this.active.id, RUN_MEETING_TAG_ID);
			}
			await this.updateTestList();

			this.$refs.manageCriterionList.refetchList();
		}
	}
};
</script>

<style scoped>
#precentage-label {
	margin: 0 0 0 1vh;
}

#test-name {
	height: 7vw;
}

.sub-title {
	font-weight: normal;
}

.clickable {
	cursor: pointer;
	text-decoration: underline;
}

.switch {
	margin-top: 1.5em;
}
</style>

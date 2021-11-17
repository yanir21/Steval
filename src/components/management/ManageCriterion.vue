<template>
	<v-row dense>
		<v-badge
			v-if="isCriterion"
			overlap
			:content="criterionIndex"
			class="mt-12"
			:color="
				selected
					? 'black'
					: $vuetify.theme.dark
					? 'primary lighten-2 black--text'
					: 'primary lighten-4 black--text'
			"
		>
		</v-badge>
		<v-col cols="12">
			<v-card
				@click="
					isAddBtn ? $emit('add-dialog') : isMeeting ? enterMeeting() : updateSelection()
				"
				:class="isAddBtn ? 'clickable' : null"
				:color="
					selected
						? this.$vuetify.theme.dark
							? 'grey darken-3'
							: 'grey lighten-1'
						: null
				"
			>
				<v-card-text>
					<v-row align="center" justify="start">
						<v-col v-if="isCriterion && !isSingle" cols="1" class="pr-3">
							<v-icon color="grey" class="handle">swap_vert</v-icon>
						</v-col>
						<v-col
							cols="1"
							align-self="center"
							class="px-0 mx-0"
							:class="isMeeting || isSingle ? 'mr-3' : null"
						>
							<v-scale-transition hide-on-leave>
								<v-btn
									icon
									outlined
									v-if="!!exists && !edit"
									:color="
										this.$vuetify.theme.dark
											? 'grey lighten-1'
											: 'grey darken-2'
									"
									class="pa-5"
									@click="isCriterion ? editWeight() : null"
									>{{ criterion.weight }}%</v-btn
								>
							</v-scale-transition>
							<v-scale-transition hide-on-leave>
								<v-text-field
									v-if="edit && !!exists"
									v-model="newWeight"
									autofocus
									height="1vw"
									single-line
									:rules="[rules.precentage]"
									prefix="%"
									type="number"
									@keyup.escape="edit = false"
									@keypress.enter="updateWeight"
									@keypress.space="updateWeight"
									@blur="updateWeight"
									id="text"
								></v-text-field>
							</v-scale-transition>
						</v-col>

						<v-col class="py-0">
							<v-row v-if="isCriterion">
								<span class="text-subtitle-2">תיאור המקרה:</span></v-row
							>
							<v-row>
								<span class="text-h5">{{ criterion.name }}</span></v-row
							>
						</v-col>
						<v-col cols="auto" v-if="!isRunCriterion">
							<star-bar :descriptions="descriptions" :criterionId="criterion.id">
							</star-bar>
						</v-col>
						<v-col cols="auto" v-if="isCriterion">
							<v-tooltip top>
								<label>{{
									isRunCriterion ? 'תמחורים מיוחדים' : ACTIONS[3].name
								}}</label>
								<template v-slot:activator="{ on }">
									<v-btn
										v-on="on"
										@click="
											isRunCriterion
												? forceRerender()
												: doAction(ACTIONS[3].action)
										"
										text
										icon
										color="grey darken-2"
									>
										<v-icon>{{
											isRunCriterion ? 'add_comment' : 'edit'
										}}</v-icon>
									</v-btn>
								</template>
							</v-tooltip>
							<v-dialog v-model="specialPricingsDialog" max-width="50vw">
								<special-pricings
									:key="componentKey"
									:criterion="criterion"
									@close="specialPricingsDialog = false"
								></special-pricings>
							</v-dialog>
						</v-col>
						<v-col cols="auto" v-if="isCriterion">
							<title-menu
								icon="more_vert"
								:list="availableActions"
								@choose-item="doAction($event.action)"
							>
							</title-menu>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</v-col>
		<v-dialog v-model="starsDialog" width="unset">
			<manage-stars
				:criterion="this.criterion"
				@close="
					starsDialog = false;
					$apollo.queries.descriptions.refetch();
					$emit('reload-criterion');
				"
				:descriptions="descriptions"
			></manage-stars>
		</v-dialog>
	</v-row>
</template>

<script>
import Swal from 'sweetalert2';
import { editCriterionWeight } from '@/queries/ManageQueries';
import { descriptionsByCriterion } from '@/queries/DescriptionsQueries';
import ManageStars from '@/components/management/ManageStars';
import TitleMenu from '@/components/testInfo/TitleMenu';
import SpecialPricings from '@/components/management/ManageSpecialPricing';
import StarBar from '@/components/management/StarsBar';

export default {
	apollo: {
		descriptions: {
			query() {
				return descriptionsByCriterion;
			},
			variables() {
				return {
					milestone_id: this.criterion.id
				};
			},
			fetchPolicy: 'no-cache'
		}
	},
	components: {
		SpecialPricings,
		'manage-stars': ManageStars,
		TitleMenu,
		StarBar
	},
	props: {
		criterion: Object,
		isSingle: {
			type: Boolean,
			default: false
		},
		criterionIndex: {
			type: Number,
			default: 1
		}
	},
	data() {
		return {
			ACTIONS: [
				{ name: 'מחק', action: 'delete-criterion' },
				{ name: 'ערוך', action: 'edit-criterion' },
				{ name: 'ערוך תמחורים מיוחדים', action: 'edit-spaciel-pricing' },
				{ name: 'ערוך', action: 'edit-stars' }
			],
			specialPricingsDialog: false,
			starsDialog: false,
			edit: false,
			newWeight: 0,
			descriptions: [],
			rules: {
				precentage: value => (value >= 0 && value <= 100) || 'לא משקל תקין'
			},
			componentKey: 0,
			selected: false
		};
	},
	methods: {
		async openModal() {
			if (this.isRunCriterion) {
				this.specialPricingsDialog = true;
			} else {
				this.starsDialog = true;
			}
		},
		async updateWeight() {
			try {
				let tempWeight = parseInt(this.newWeight);
				let returningObject = {};

				if (tempWeight < 0) {
					Swal.fire({
						title: '<strong>רגע רגע, משקל לא יכול להיות שלילי</strong>',
						type: 'error',
						confirmButtonText: 'טעות שלי'
					});
				} else {
					returningObject = await this.$apollo.query({
						query: editCriterionWeight,
						variables: {
							criterion: this.criterion.id,
							weight: tempWeight
						},
						fetchPolicy: 'no-cache'
					});

					this.$emit('update-weight', returningObject.data.criterion.returning[0]);
				}
			} catch (error) {
				Swal.fire({
					title: '<strong>משהו השתבש</strong>',
					type: 'error',
					confirmButtonText: 'לא נורא'
				});
				log('error', "Can't update weight", this, error);
			} finally {
				this.edit = false;
			}
		},
		editWeight() {
			this.edit = true;
			this.newWeight = this.criterion.weight;
		},
		forceRerender() {
			this.componentKey += 1;
			this.specialPricingsDialog = true;
			
			if (!this.selected){
				this.updateSelection();
			}
		},
		enterMeeting() {
			if (this.isMeeting) {
				this.$emit('select-test', this.criterion);
			}
		},
		updateSelection() {
			this.selected = !this.selected;
			this.$emit('update-selection', { criterion: this.criterion, selected: this.selected });
		},
		tagExist(tagName) {
			return (
				this.criterion.milestones_tags &&
				this.criterion.milestones_tags.find(tag => tag.tag.tag === tagName)
			);
		},
		doAction(action) {
			if (!this.selected && action !== this.ACTIONS[1].action) {
				this.updateSelection();
			}

			if (action === this.ACTIONS[0].action || action === this.ACTIONS[1].action) {
				this.$emit(action);
			} else if (action === this.ACTIONS[3].action) {
				this.openModal();
			} else if (action === this.ACTIONS[2].action) {
				this.forceRerender();
			}
		},
		resetSelection() {
			this.selected = false;
		}
	},
	computed: {
		availableActions() {
			let availableActions = [];

			if (this.isCriterion) {
				availableActions.push(this.ACTIONS[0]);
				if (this.isRunCriterion) {
					availableActions.push(this.ACTIONS[1]);
					// availableActions.push(this.ACTIONS[2]);
				} 
				// else {
				// 	availableActions.push(this.ACTIONS[3]);
				// }
			}

			return availableActions;
		},
		exists() {
			return this.criterion.weight == 0 ? '0' : this.criterion.weight;
		},
		isRunCriterion() {
			if (!this.criterion.parent_milestone) {
				return false;
			}
			if (
				this.criterion.parent_milestone.milestones_tags.find(tag => tag.tag.tag === 'ריצה')
			) {
				return true;
			}

			return false;
		},
		isMeeting() {
			return this.tagExist('פגישה');
		},
		isCriterion() {
			return this.tagExist('קריטריון');
		},
		isAddBtn() {
			return this.tagExist('הוסף');
		}
	}
};
</script>

<style scoped>
.v-badge {
	z-index: 1;
}

.handle {
	cursor: grab;
}

.handle:click {
	cursor: grabbing;
}
</style>

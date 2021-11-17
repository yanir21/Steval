<template>
	<v-container>
		<v-row>
			<criterions-actions
				ref="criterionsAcrions"
				:criterionList="criterions"
				:selectedCriterions="selectedCriterions"
				:active="active"
				:totalPrecentage="totalPrecentage"
				@final-pricing-dialog="$emit('final-pricing-dialog')"
				@reload-criterion="refetchList"
				@update-test-list="$emit('update-test-list')"
			></criterions-actions>
		</v-row>
		<v-row>
			<v-col cols="12" class="criterions pr-5" v-if="criterions.length && active.id">
				<draggable
					v-model="criterions"
					handle=".handle"
					v-bind="dragOptions"
					@start="drag = true"
					@end="drag = false"
				>
					<transition-group type="transition" :name="!drag ? 'flip-list' : null">
						<criterion
							:ref="`criterion-${item.id}`"
							v-for="(item, index) in criterions"
							:key="item.id"
							:criterionIndex="index + 1"
							:criterion="item"
							:isSingle="criterions.length <= 1"
							@update-weight="refetchList"
							@select-test="$emit('select-test', $event)"
							@reload-criterion="refetchList"
							@update-selection="updateCriterionSelection($event)"
							@edit-criterion="$refs.criterionsAcrions.openAddEditDialog(item)"
							@add-dialog="$refs.criterionsAcrions.openAddEditDialog"
							@delete-criterion="$refs.criterionsAcrions.openDialog"
						></criterion>
					</transition-group> </draggable
			></v-col>
			<v-col v-else>
				<v-card
					@click="cardMsg.action ? $refs.criterionsAcrions.openAddEditDialog() : null"
				>
					<v-card-text>
						<p class="text-h5">{{ cardMsg.title }}</p>
						<p v-if="cardMsg.subtitle" class="text-h6">{{ cardMsg.subtitle }}</p>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import CriterionsActions from '@/components/management/CriterionsActions';
import draggable from 'vuedraggable';
import ManageCriterion from '@/components/management/ManageCriterion';
import { getMilestonesByParent } from '@/queries/TestQueries';
import { changeOrder, deleteMilestone, updateMilestoneListOrder } from '@/queries/ManageQueries';
import Swal from 'sweetalert2';

export default {
	apollo: {
		criterions: {
			query() {
				return getMilestonesByParent;
			},
			variables() {
				return { meeting_id: this.active.id };
			},
			skip() {
				return !this.active.id;
			},
			fetchPolicy: 'no-cache'
		}
	},
	props: {
		active: {
			type: Object,
			require: true
		}
	},
	data() {
		return {
			drag: false,
			selectedCriterions: [],
			criterions: [],
			chooseTestMsg: {
				title: 'רוצה קצת נתונים? תבחר מבחן!',
				action: false
			},
			addCriterionMsg: {
				title: 'תלחץ עלי ותוסיף קצת קריטריונים',
				subtitle:
					'שים לב שלאחר הוספת קריטריונים אי אפשר לשנות את סוג הפגישה (כוכבים / ריצה)',
				action: true
			}
		};
	},
	components: {
		criterion: ManageCriterion,
		draggable,
		CriterionsActions
	},
	methods: {
		refetchList() {
			this.$apollo.queries.criterions.refetch();
			this.$emit('refetch-criterion-count');
		},
		createOrderdList(newList) {
			let filterdList = [];
			newList.map((criterion, index) => {
				if (criterion.id !== this.criterions[criterion.order].id) {
					this.criterions[index] = criterion;
					this.criterions[index].order = index;
				}

				filterdList.push({
					name: criterion.name,
					weight: criterion.weight,
					id: criterion.id,
					order: criterion.order
				});
			});

			return filterdList;
		},
		createOptimisticResponseTags(tags) {
			return tags.map(tag => {
				return {
					tag: {
						tag: tag.tag.tag,
						__typename: 'eval_tag'
					},
					__typename: 'eval_milestones_tags'
				};
			});
		},
		createOptimisticResponse() {
			return {
				__typename: 'Mutation',
				criterions: {
					returning: this.criterions.map(criterion => {
						return {
							__typename: 'eval_milestones',
							id: criterion.id,
							name: criterion.name,
							order: criterion.order,
							weight: criterion.name,
							milestones_tags: this.createOptimisticResponseTags(
								criterion.milestones_tags
							),
							parent_milestone: {
								__typename: 'eval_milestones',
								id: criterion.parent_milestone.id,
								milestones_tags: this.createOptimisticResponseTags(
									criterion.parent_milestone.milestones_tags
								)
							}
						};
					}),
					__typename: 'eval_milestones_mutation_response"'
				}
			};
		},
		updateOrder(filterdList) {
			this.$apollo
				.mutate({
					mutation: updateMilestoneListOrder,
					variables: { milestones: filterdList },
					optimisticResponse: this.createOptimisticResponse()
				})
				.then(
					({
						data: {
							criterions: { returning }
						}
					}) => {
						if (!returning.length) {
							this.$emit('show-error', 'אופס! יש בעיה בנתונים...');
							this.refetchList();
						} else {
							this.criterions = returning;
						}
					}
				);
		},
		updateCriterionSelection(selecteCriterion) {
			let index = this.selectedCriterions.findIndex(
				item => item.id === selecteCriterion.criterion.id
			);
			if (selecteCriterion.selected) {
				if (index === -1) {
					this.selectedCriterions.push(selecteCriterion.criterion);
				}
			} else {
				this.selectedCriterions.splice(index, 1);
			}
		},
		tagExist(tagName, criterion) {
			return (
				criterion.milestones_tags &&
				criterion.milestones_tags.find(tag => tag.tag.tag === tagName)
			);
		}
	},
	computed: {
		totalPrecentage() {
			let sum = this.criterions.reduce((x, y) => x + y.weight, 0);
			return sum;
		},
		dragOptions() {
			return {
				animation: 200,
				group: 'description',
				disabled: false,
				ghostClass: 'ghost'
			};
		},
		cardMsg() {
			return this.active.id ? this.addCriterionMsg : this.chooseTestMsg;
		}
	},
	watch: {
		criterions() {
			this.selectedCriterions.forEach(criterion => {
				this.$refs[`criterion-${criterion.id}`][0].resetSelection();
			});
			this.selectedCriterions = [];
		},
		drag(val) {
			if (!val) {
				this.updateOrder(this.createOrderdList(this.criterions));
			}
		}
	}
};
</script>

<style scoped>
.criterions {
	max-height: 65vh;
	overflow: auto;
}</style
>>

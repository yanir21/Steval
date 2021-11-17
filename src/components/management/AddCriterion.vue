<template>
	<v-card>
		<v-card-title class="text-h4"
			>{{ editCriterion.id ? 'ערוך' : 'הוסף ' }} קריטריון</v-card-title
		>
		<v-card-text>
			<v-form v-model="valid" ref="form">
				<v-row>
					<v-text-field
						v-model="name"
						:rules="[rules.name]"
						required
						label="תיאור המקרה:"
					></v-text-field> </v-row
				><v-row>
					<v-text-field
						:rules="[rules.precentage]"
						v-model="weight"
						label="משקל"
						type="number"
						required
					></v-text-field>
				</v-row>
			</v-form>
		</v-card-text>
		<v-card-actions>
			<v-spacer></v-spacer>
			<v-btn color="red darken-1" text @click="cancel">התחרטתי</v-btn>
			<v-btn
				color="green darken-1"
				text
				@click="editCriterion.id ? update() : add()"
				v-shortkey="['enter']"
				@shortkey="add"
				:disabled="!valid"
			>
				נראה טוב</v-btn
			>
		</v-card-actions>
	</v-card>
</template>

<script>
import { getTags, insertMilestone, insertTag, updateMilestone } from '@/queries/ManageQueries';
import { insertDescriptions } from '@/queries/DescriptionsQueries';

import log from '@/common/tovalogger.js';

export default {
	apollo: {
		tags: {
			query() {
				return getTags;
			}
		}
	},
	data() {
		return {
			name: '',
			weight: 0,
			tags: [],
			isAtp: false,
			valid: false,
			rules: {
				precentage: value => (value > 0 && value <= 100) || 'לא משקל תקין',
				name: value => value !== '' || 'עליך להוסיף תיאור'
			}
		};
	},
	props: {
		parent: {
			type: Object,
			default: () => {
				return {};
			}
		},
		order: {
			type: Number,
			default: 0
		},
		dialog: {
			type: Boolean,
			require: true
		},
		editCriterion: {
			type: Object,
			default: () => {
				return {};
			}
		}
	},
	mounted() {
		if (this.editCriterion.id) {
			this.weight = this.editCriterion.weight;
			this.name = this.editCriterion.name;
		}
	},
	methods: {
		cancel() {
			this.$emit('cancel');
			this.resetDialog();
		},
		async add() {
			if (this.dialog) {
				try {
					let newMilestone = await this.$apollo.query({
						query: insertMilestone,
						variables: {
							name: this.name,
							order: this.order,
							weight: this.weight,
							parent_id: this.parent.id
						},
						fetchPolicy: 'no-cache'
					});

					newMilestone = newMilestone.data.insert_eval_milestones.insertedCriterion[0];
					let requiredTags = [];

					if (this.isParentTest) {
						requiredTags.push(this.tags.find(tag => tag.tag == 'פגישה'));

						if (this.isAtp) {
							requiredTags.push(this.tags.find(tag => tag.tag == 'ריצה'));
						}
					} else {
						requiredTags.push(this.tags.find(tag => tag.tag == 'קריטריון'));
					}

					for (let index = 0; index < requiredTags.length; index++) {
						await this.$apollo.mutate({
							mutation: insertTag,
							variables: {
								milestone_id: newMilestone.id,
								tag_id: requiredTags[index].id
							}
						});
					}

					if (this.isParentStarMeeting) {
						this.addEmptyStars(newMilestone.id);
					}

					this.$emit('add');
				} catch (error) {
					log('error', "Can't add milestone", this, error);
				} finally {
					this.resetDialog();
				}
			}
		},
		update() {
			this.$apollo
				.mutate({
					mutation: updateMilestone,
					variables: {
						milestoneId: this.editCriterion.id,
						weight: this.weight,
						name: this.name
					}
				})
				.then(() => {
					this.$emit('add');
					this.resetDialog();
				});
		},
		resetDialog() {
			this.weight = 0;
			this.name = '';
			this.isAtp = false;
		},
		getInsertData(milestoneId) {
			let descriptions = [];
			for (let starNum = 1; starNum <= 5; starNum++) {
				descriptions.push({
					description: 'x',
					stars: starNum,
					milestone_id: milestoneId
				});
			}

			return descriptions;
		},
		addEmptyStars(milestoneId) {
			let descriptions = this.getInsertData(milestoneId);
			this.$apollo.mutate({
				mutation: insertDescriptions,
				variables: {
					descriptions: descriptions
				}
			});
		}
	},
	computed: {
		isParentTest() {
			return (
				!this.parent &&
				!!this.parent.milestones_tags.find(
					tag => tag.tag.tag == 'מבחן' || tag.tag.tag == 'תר"ץ'
				)
			);
		},
		isParentStarMeeting() {
			return (
				!!this.parent.milestones_tags.find(tag => tag.tag.tag === 'פגישה') &&
				!this.parent.milestones_tags.find(tag => tag.tag.tag === 'ריצה')
			);
		}
	},
	watch: {
		editCriterion() {
			if (this.editCriterion.id) {
				this.weight = this.editCriterion.weight;
				this.name = this.editCriterion.name;
			} else {
				this.resetDialog();
			}
		}
	}
};
</script>

<style scoped></style>

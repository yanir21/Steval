<template>
	<v-card class="test-list" max-height="75vh">
		<v-card-text class="py-4 px-3 pb-7">
			<v-treeview
				ref="treeview"
				hoverable
				transition
				return-object
				:active.sync="selected"
				item-key="id"
				item-text="name"
				:open.sync="open"
				@update:active="openMilestone"
				activatable
				:items="sortBySubjects"
			>
				<template v-slot:prepend="{ item }">
					<v-icon v-if="!isSubject(item)">{{ returnIcons(item) }}</v-icon>
				</template>
			</v-treeview>
		</v-card-text>
	</v-card>
</template>

<script>
export default {
	props: {
		testList: {
			type: Array,
			default: () => {
				return [];
			}
		},
		selectedValue: {
			type: Object,
			default: () => {
				return {};
			}
		}
	},
	data() {
		return {
			selected: [],
			open: []
		};
	},
	computed: {
		sortBySubjects() {
			let sortBySubjectsList = [];

			this.testList.forEach(test => {
				let subjectIndex = sortBySubjectsList.findIndex(
					subject => subject.name === test.subject.name
				);
				if (subjectIndex === -1) {
					sortBySubjectsList.push({
						id: test.subject.id,
						name: test.subject.name,
						children: [test],
						order: test.subject.order
					});
				} else {
					sortBySubjectsList[subjectIndex].children.push(test);
				}
			});

			sortBySubjectsList.sort((a, b) => a.order - b.order);

			return sortBySubjectsList;
		}
	},
	watch: {
		selected: function(val) {
			if (!val[0]) {
				this.$emit('select-test', undefined);
			} else if (this.isSubject(val[0])) {
				this.$emit('select-test', undefined);
			} else {
				this.$emit('select-test', val[0]);
			}
		},
		selectedValue: function() {
			this.selected = [];
			this.selected[0] = this.selectedValue;
		}
	},
	methods: {
		tagExists(test, tagName) {
			return (
				!!test.milestones_tags && test.milestones_tags.find(tag => tag.tag.tag == tagName)
			);
		},
		isSubject(item) {
			return !item.milestones_tags;
		},
		returnIcons(milestone) {
			if (this.tagExists(milestone, 'מבחן') || this.tagExists(milestone, 'תר"ץ')) {
				return 'description';
			} else if (this.tagExists(milestone, 'ריצה')) {
				return 'bookmark';
			} else if (this.tagExists(milestone, 'פגישה')) {
				// Todo: לפי תג כוכבים
				return 'stars';
			} else {
				// Todo: לפי תג עצמאות
				return 'people_alt';
			}
		},
		openMilestone(openMilestone) {
			openMilestone = openMilestone[0];
			if (!this.open.find(milestone => milestone == openMilestone)) {
				this.open.push(openMilestone);
			}
		}
	}
};
</script>

<style scoped>
.test-list {
	overflow-y: auto;
	-ms-user-select: none; /* Internet Explorer/Edge */
	user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
	cursor: pointer;
}
</style>

<template>
	<div>
		<v-expand-x-transition>
			<v-autocomplete
			height="25"
				v-model="chosenStudentListComputed"
				:items="studentsListDrop"
				chips
				:label="studentPlaceHolder"
				item-text="displayName"
				item-value="displayName"
				return-object
				multiple
				id="studentsDropdown"
			>
				<template v-slot:selection="{ item, index }">
					<span v-if="index === 0">{{ item.displayName }}</span>
					<span v-if="index === 1" class="caption">
						&nbsp;&nbsp;(+{{ chosenStudentListComputed.length - 1 }}
						{{ chosenStudentListComputed.length - 1 > 1 ? 'נוספים' : 'נוסף' }})
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
							<v-list-item-title v-html="item.displayName"></v-list-item-title>
						</v-list-item-content>
					</template>
				</template>
			</v-autocomplete>
		</v-expand-x-transition>
	</div>
</template>

<script>
import { getTestGradesAmount } from '@/DAL/tests.js';
import { mapState, mapActions } from 'vuex';

export default {
	props: {
		studentsListDrop: {
			type: Array,
			requierd: true
		}
	},
	data() {
		return {
			studentPlaceHolder: 'בחר חניכים',
			firstStudentID: ''
		};
	},
	methods: {
		...mapActions(['chooseStudent', 'updateChosenStudentList']),
		studentDisplayNameToId(studentDisplayName) {
			return this.studentsListDrop.find(student => student.displayName == studentDisplayName)
				.id;
		},
		deleteDropdownSearchRest() {
			setTimeout(() => {
				studentsDropdown.value = '';
			}, 0);
		}
	},
	watch: {
		chosenStudentListComputed(newStudents, oldStudents) {
			this.deleteDropdownSearchRest();
			if (this.chosenStudentListComputed.length) {
				let newStudentDiff = newStudents.filter(
					currStudent => !oldStudents.includes(currStudent)
				);
				if (newStudentDiff.length) {
					this.chooseStudent(newStudentDiff[0].id);
				} else {
					const removedStudent = oldStudents.filter(
						currStudent => !newStudents.includes(currStudent)
					)[0];
					if (this.chosenStudentID === removedStudent.id) {
						const removedStudentIndex = oldStudents.indexOf(removedStudent);
						const newChosenId =
							removedStudentIndex === oldStudents.length - 1
								? oldStudents[removedStudentIndex - 1].id
								: oldStudents[removedStudentIndex + 1].id;
						this.chooseStudent(newChosenId);
					}
				}
			} else {
				this.chooseStudent('');
			}
		}
	},
	computed: {
		...mapState(['chosenStudentID', 'chosenStudentList']),
		chosenStudentListComputed: {
			get() {
				return this.chosenStudentList;
			},
			set(students) {
				this.updateChosenStudentList(students);
			}
		}
	}
};
</script>

<style lang="css" scoped>
.light_opacity {
	opacity: 0.7;
}
</style>

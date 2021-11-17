<template>
	<v-card>
		<v-card-text class="studentList">
			<v-list nav>
				<v-list-item
					v-for="(student, index) in mapedStudentsList"
					:key="index"
					two-line
					class="studentDetails"
					@click="!selectCoolDown ? chooseStudent(student.id) : null"
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
					<v-list-item-content >
						<v-list-item-title v-text="student.name"> </v-list-item-title>
						<v-list-item-subtitle v-text="student.studentId"> </v-list-item-subtitle>
					</v-list-item-content>
					<v-list-item-action>
						<v-btn icon @click="removeStudent(student.id)">
							<v-icon>
								highlight_off
							</v-icon>
						</v-btn>
					</v-list-item-action>
				</v-list-item>
			</v-list>
		</v-card-text>
	</v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
	data() {
		return {
			selectCoolDown: false
		}
	},
	computed: {
		...mapState(['chosenStudentID', 'chosenStudentList']),
		mapedStudentsList() {
			return this.chosenStudentList.map(student => {
				return {
					id: student.id,
					soldierId: student.soldierId,
					name: student.displayName.substring(5, student.displayName.length),
					studentId: parseInt(student.displayName.substring(0, 3))
				};
			});
		}
	},
	methods: {
		...mapActions(['updateChosenStudentList', 'chooseStudent']),
		removeStudent(id) {
			const currList = this.chosenStudentList.filter(
				student => student.id !== id
			);

			this.selectCoolDown = true;
			setTimeout(() => this.selectCoolDown = false, 1);

			this.updateChosenStudentList(currList);
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

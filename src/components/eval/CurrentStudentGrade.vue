<template>
	<v-container class="pa-0">
		<v-row justify="center">
			<v-col class="text-center font-weight-medium pa-0">
				ציון ריצה
			</v-col>
		</v-row>
		<v-row justify="center">
			<v-progress-circular
				:rotate="-90"
				:size="60"
				:width="3"
				color="primary"
				:value="100"
			>
				<span
					class="subtitle-2"
					:class="$vuetify.theme.dark ? 'white--text' : 'black--text'"
					>{{ currentGrade.toFixed(2) }}</span
				>
			</v-progress-circular>
		</v-row>
	</v-container>
</template>

<script>
import { getMeetingFinalGrade } from '@/BL/grades.js';
import EventBus from '@/plugins/eventbus';

export default {
	props: {
		student_id: {
			type: Number,
			required: true
		},
		meeting_id: {
			type: Number,
			required: true
		},
		networkUpdates: {
			default: null
		}
	},
	data() {
		return {
			currentGrade: 0
		};
	},
	mounted() {
		this.refetchGrade();
	},
	watch: {
		student_id() {
			this.refetchGrade();
		},
		meeting_id() {
			this.refetchGrade();
		},
		async networkUpdates() {
			await this.networkUpdates;
			this.refetchGrade();
		}
	},
	methods: {
		async refetchGrade() {
			this.currentGrade = await getMeetingFinalGrade(this, this.student_id, this.meeting_id);
		}
	}
};
</script>

<style></style>

<template>
	<DropDownSelector
		:height="28"
		:placeholder="meetingPlaceholder"
		:list="meetingsListDrop"
		:defaultSelect="meetingsListDrop[0]"
		@selected="changeMeeting($event.id)"
 		id="meetingsDropdown"
		no-data-text="! אין פה עדיין פגישות"
	>
	</DropDownSelector>
</template>

<script>
import DropDownSelector from '@/components/testInfo/DropDownSelector.vue';
import { getTestMeetings } from '@/queries/TestQueries';
import { mapActions } from 'vuex';

export default {
	apollo: {
		meetingsList: {
			query() {
				return getTestMeetings;
			},
			variables() {
				return {
					milestone_id: this.$store.state.test.id
				};
			},
			skip() {
				return !this.$store.state.test.id;
			},
			result({ data: { meetingsList } }) {
				this.changeMeeting(meetingsList[0].id);
			},
			fetchPolicy: 'no-cache'
		}
	},
	data() {
		return {
			meetingPlaceholder: 'בחר פגישה',
			meetingsList: []
		};
	},
	methods: {
		...mapActions(['changeMeeting'])
	},
	components: {
		DropDownSelector
	},
	computed: {
		meetingsListDrop() {
			return this.meetingsList.map(({ name, id }) => ({ name, id }));
		}
	}
};
</script>

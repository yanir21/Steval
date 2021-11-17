<template>
	<v-container>
		<v-row style="height: 2em;"></v-row>
		<v-row justify="center">
			<v-col id="testChosen" class="text-h1 font-weight-thin text-center text--primary">
				איזה מבחן בא לך?</v-col
			>
		</v-row>
		<v-row justify="center">
			<v-col cols="7">
				<test-menu cardHeight="250" :tests="testList"></test-menu>
			</v-col>
		</v-row>
		<v-row justify="center">
			<v-col cols="auto">
				<router-link to="/Independency" tag="div">
					<v-btn>שומר על מבחן?</v-btn>
				</router-link>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import TestMenu from '@/components/general/TestMenu.vue';
import { getTestNames } from '@/queries/TestQueries';
import { mapState } from 'vuex';
export default {
	apollo: {
		testList: {
			query() {
				return getTestNames;
			},
			variables() {
				return {
					root_id: this.$store.state.userRootMegama.root
				};
			},
			skip() {
				return !this.$store.state.userRootMegama.root;
			}
		}
	},
	async mounted() {
		this.$store.dispatch('resetStore');
		sessionStorage.clear();
	},
	components: {
		TestMenu
	},
	data() {
		return {
			testList: []
		};
	},
	computed: {
		...mapState(['userRootMegama'])
	}
};
</script>

<style scoped>
#testChosen {
	font-size: 5em !important;
}
</style>

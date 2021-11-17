<template>
	<div>
		<v-row justify="center" align="center" class="text-center">
			<v-spacer v-show="search == 'about'" />
			<v-col cols="6">
				<v-text-field
					v-model="search"
					prepend-icon="search"
					label="נסה לחפש משהו..."
					clearable
				></v-text-field>
			</v-col>
			<v-col class="pa-0" v-show="search == 'about'">
				<router-link :to="`/about`" tag="div">
					<v-btn>אודות</v-btn>
				</router-link>
			</v-col>
		</v-row>
		<v-card>
			<v-container v-if="megamot.length > 0">
				<v-tabs v-model="tab" centered slider-color="blue">
					<v-tabs-slider></v-tabs-slider>
					<v-tab v-for="(title, index) in titles" :key="index">{{ title }}</v-tab>
				</v-tabs>
				<v-col></v-col>
				<v-tabs-items v-model="tab">
					<v-tab-item v-for="(title, index) in titles.length" :key="index">
						<tests-table
							:testsList="index === 0 ? filteredTestsAndProjects : filteredMegamot"
						></tests-table>
					</v-tab-item>
				</v-tabs-items>
			</v-container>
			<v-container v-else>
				<tests-table
					:testsList="filteredAllTests"
				></tests-table>
			</v-container>
		</v-card>
	</div>
</template>

<script>
import TestsTable from '@/components/general/TestsTable';
import { mapState } from 'vuex';
export default {
	components: {
		TestsTable
	},
	props: {
		cardHeight: {
			default: 500
		},
		menuColor: {
			default: '#1976d2'
		},
		tests: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			search: '',
			tab: null,
			titles: ['מבחנים', 'מגמות בחירה']
		};
	},
	computed: {
		filteredTestsAndProjects() {
			return this.tests
				.filter(test => !test.parent_milestone.name.includes('מגמת בחירה'))
				.filter(this.filterTests);
		},
		megamot() {
			return this.tests.filter(test => test.parent_milestone.name.includes('מגמת בחירה'));
		},
		filteredMegamot() {
			return this.megamot.filter(this.filterTests).map(({ parent_milestone, ...rest }) => ({
				...rest,
				parent_milestone: { name: parent_milestone.name.slice(13) }
			}));
		},
		filteredAllTests() {
			return this.tests.filter(this.filterTests);
		}
	},
	methods: {
		filterTests(test) {
			let fullName = test.name.concat('-', test.parent_milestone.name);
			return !this.search || fullName.toLowerCase().includes(this.search.toLowerCase());
		}
	}
};
</script>

<style>
::-webkit-scrollbar {
	width: 8px;
	height: 10px;
}

::-webkit-scrollbar-thumb {
	border-radius: 8px;
	background: #c2c9d2;
}
</style>

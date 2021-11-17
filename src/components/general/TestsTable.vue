<template>
	<v-virtual-scroll :items="testsList" :item-height="80" height="350">
		<template v-slot="{ item }">
			<router-link :to="`/test`" class="text-decoration-none">
				<v-list-item @click="updateTestInStore(item)">
					<v-row justify="center" align="center" class="text-center">
						<v-col class="text-h5 text--secondary pa-2">{{ item.name }}</v-col>
						<v-col class="text-h5 text--secondary pa-2">
							{{ item.parent_milestone.name }}
						</v-col>
					</v-row>
				</v-list-item>
			</router-link>
			<v-divider></v-divider>
		</template>
	</v-virtual-scroll>
</template>

<script>
export default {
	props: {
		testsList: {
			type: Array
		}
	},
	methods: {
		updateTestInStore(test) {
			this.$store.dispatch('loadTest', test);
		}
	}
};
</script>

<style lang="scss" scoped></style>

<template>
	<v-menu open-on-click>
		<template #activator="{ on: menu }">
			<v-btn icon v-on="{ ...menu }">
				<v-icon>
					{{ icon }}
				</v-icon>
			</v-btn>
		</template>
		<v-list class="menu">
			<v-list-item
				v-for="(item, index) in list"
				:key="index"
				@click="$emit('choose-item', item)"
			>
				<v-list-item-title>{{ item.name }}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-menu>
</template>

<script>
export default {
	props: {
		list: {
			required: true
		},
		icon: {
			type: String,
			required: true
		}
	}
};
</script>

<style scoped>
.menu {
	max-height: 30vh;
}
</style>

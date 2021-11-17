<template>
	<v-autocomplete
		:height="height"
		v-model="select"
		:items="list"
		:hint="hint"
		chips
		:color="darkMode ? 'blue-grey lighten-3' : 'primary'"
		:item-text="itemText"
		item-value="id"
		:label="placeholder"
		return-object
		persistent-hint
		@change="changeValue"
		no-data-text="עוד לא הוכנס מידע :("
	>
		<template v-slot:selection="{ item, index }">
			<span v-if="index === 0">{{ item[itemText] }}</span>
		</template>
	</v-autocomplete>
</template>

<script>
import { mapState } from 'vuex';
export default {
	props: {
		list: Array,
		placeholder: String,
		defaultSelect: Object,
		height: {
			type: Number,
			default: 25
		},
		itemText: {
			type: String,
			default: 'name'
		},
		hint: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			select: {}
		};
	},
	mounted() {
		if (this.defaultSelect) {
			this.select = this.defaultSelect;
		}
	},
	methods: {
		changeValue() {
			this.$emit('selected', this.select);
		}
	},
	computed: {
		...mapState(['darkMode'])
	},
	watch: {
		defaultSelect() {
			this.select = this.defaultSelect;
		}
	}
};
</script>

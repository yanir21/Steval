<template>
	<v-menu offset-y>
		<template v-slot:activator="{ on }">
			<v-text-field
				v-on="on"
				:rules="rules"
				height="30"
				v-model="contentText"
				required
				clearable
				:label="label"
				@input="handleInput"
			></v-text-field>
		</template>
		<v-list v-show="showMenu">
			<v-list-item
				v-for="(item, index) in filterdList"
				:key="index"
				@click="itemSelected(item)"
			>
				<v-list-item-title>{{ item[itemText] }}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-menu>
</template>

<script>
export default {
	props: {
		label: {
			type: String,
			default: ''
		},
		value: {
			type: String,
			default: ''
		},
		suggestList: {
			type: Array,
			default: () => []
		},
		maxLength: {
			type: Number,
			default: 5
		},
		rules: {
			default: ''
		},
		itemText: {
			default: ''
		}
	},
	data() {
		return {
			contentText: this.value,
			boxShadow: 'true'
		};
	},
	computed: {
		filterdList() {
			let filteredList = this.suggestList.filter(
				(value, index, self) =>
					!this.contentText || value[this.itemText].includes(this.contentText)
			);

			let distincetList = [];

			filteredList = filteredList.filter(item => {
				if (!distincetList.includes(item[this.itemText])) {
					distincetList.push(item[this.itemText]);
					return true;
				}

				return false;
			});

			return filteredList.slice(0, this.maxLength);
		},
		showMenu() {
			return this.filterdList.length && this.contentText;
		}
	},
	methods: {
		handleInput() {
			this.$emit('input', this.contentText);
		},
		itemSelected(item) {
			this.contentText = item[this.itemText];
			this.handleInput();
			this.$emit('selectedObject', item);
		}
	}
};
</script>

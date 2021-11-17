<template>
	<v-list-item @click="selectPricing">
			<v-list-item-action>
				<v-checkbox :input-value="checkbox"></v-checkbox>
			</v-list-item-action>
			<v-list-item-content>
				<v-list-item-title v-text="pricing"></v-list-item-title>
			</v-list-item-content>
	</v-list-item>
</template>

<script>
export default {
	props: {
		pricing: {
			required: true
		},
		isChecked: {
			default: false
		}
	},
	data() {
		return {
			checkbox: false
		};
	},
	watch: {
		isChecked: function() {
			this.checkbox = this.isChecked;
		}
	},
	mounted() {
		this.checkbox = this.isChecked;
	},
	methods: {
		selectPricing() {
			if (!this.checkbox) {
				this.$emit('selectPricing', this.pricing);
			} else {
				this.$emit('removePricing', this.pricing);
			}
		}
	}
};
</script>

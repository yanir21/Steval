<template>
	<div>
		<v-card-text>
			<v-container v-if="pricingList.length > 0">
				<v-row v-for="(price, index) in pricingList" :key="index">
					<v-col cols="1">
						<special-pricing-menu
							:specialPricing_id="price.text.id"
							:milestone_id="price.milestone_id"
							:price="price.text"
							@refetch-price="$emit('refetch-price')"
							@update-price="$emit('update-price', $event)"
						></special-pricing-menu>
					</v-col>
					<v-col cols="1">
						<v-btn icon outlined color="primary" class="precentage"
							>{{ price.text.price }}%</v-btn
						>
					</v-col>
					<v-col>
						<v-chip>{{ price.text.description }}</v-chip>
					</v-col>
				</v-row>
			</v-container>
			<v-container v-else>
				<v-row>
					<span primary-title class="font-weight-medium text-h5"
						>לא קיימים תמחורים כרגע!</span
					>
				</v-row>
			</v-container>
		</v-card-text>
	</div>
</template>

<script>
import SpecialPricingMenu from '@/components/management/SpecialPricingMenu';
export default {
	components: {
		SpecialPricingMenu
	},
	props: {
		pricingList: {
			type: Array
		}
	}
};
</script>

<style scoped></style>

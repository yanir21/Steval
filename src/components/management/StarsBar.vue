<template>
	<div>
		<span v-for="(star, index) in fixedRatingList" :key="index">
			<v-tooltip transition="slide-y-transition" offset-overflow bottom max-width="140">
				<template v-slot:activator="{ on }">
					<v-icon class="star" slot="activator" large :color="star.active ? 'amber darken-1' : 'gray'" v-on="on"
						>star
					</v-icon>
				</template>
				<span class="text-body-1">{{ star.description }}</span>
			</v-tooltip>
		</span>
	</div>
</template>

<script>
import { descriptionsByCriterion } from '../../queries/DescriptionsQueries';

export default {
	// apollo: {
	// 	descriptions: {
	// 		query() {
	// 			return descriptionsByCriterion;
	// 		},
	// 		variables() {
	// 			return {
	// 				milestone_id: this.criterionId
	// 			};
	// 		},
	// 		fetchPolicy: 'no-cache'
	// 	}
	// },
	props: {
		criterionId: {
			type: Number,
			required: true
        },
        descriptions: {
            type: Array,
			required: true
        }
	},
	// data() {
	// 	return {
	// 		descriptions: []
	// 	};
	// },
	computed: {
		fixedRatingList() {
			return this.descriptions.map(rating => {
				return {
					id: rating.id,
					description: rating.description !== 'x' ? rating.description : 'אין לי הערכה!',
					active: rating.description !== 'x'
				};
			});
		}
	}
};
</script>

<style scoped>
.star{
    cursor: auto;
}
</style>

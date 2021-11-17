<template>
	<div
		@mouseout="updateTempRating(0)"
		@mouseleave="mousehover = false"
		@mouseenter="mousehover = true"
	>
		<span v-for="(star, index) in ratingInfo" :key="index">
			<span v-if="index < displayRating">
				<star
					:starColor="starColor"
					:icon="markedIcon"
					:starValue="star.point"
					:description="starInfo(star)"
					@starRating="updateTempRating"
					@setRating="setActualRating"
					:canRate="canRate(star.description)"
				>
				</star>
			</span>
			<span v-else>
				<star
					:starColor="'amber lighten-3'"
					:icon="unmarkedIcon"
					:starValue="star.point"
					:description="starInfo(star)"
					@starRating="updateTempRating"
					@setRating="setActualRating"
					:canRate="canRate(star.description)"
				>
				</star>
			</span>
		</span>
	</div>
</template>

<script>
import Star from '@/components/eval/stars/Star';

export default {
	components: {
		star: Star
	},

	props: {
		starsNum: {
			type: Number,
			default: 5
		},
		markedIcon: {
			type: String,
			default: 'star'
		},
		unmarkedIcon: {
			type: String,
			default: 'star_border'
		},
		ratingInfo: {
			required: true
		},
		criterionGrade: {
			required: true
		}
	},

	data() {
		return {
			tempRating: 0,
			mousehover: false
		};
	},

	computed: {
		actualRating() {
			return this.criterionGrade / 20;
		},
		displayRating() {
			return this.mousehover || this.actualRating === 0 ? this.tempRating : this.actualRating;
		},
		starColor() {
			return this.canRate(this.ratingInfo[this.displayRating - 1].description)
				? 'amber'
				: 'gray';
		}
	},
	methods: {
		starInfo(star) {
			if (this.canRate(star.description)) {
				return star.description;
			} else {
				return 'אי אפשר לעשות את זה!';
			}
		},

		updateTempRating(rating) {
			this.tempRating = rating;
		},

		setActualRating(rating) {
			const gradeMultiply = 20;
			this.$emit('insertGrade', rating * gradeMultiply);
		},

		canRate(ratingDesc) {
			return ratingDesc != 'x';
		}
	}
};
</script>

<template>
	<div>
		<v-progress-linear
			class="progress"
			:color="barColor"
			:height="height"
			:value="filledPrecentage"
		>
		</v-progress-linear>
	</div>
</template>

<script>
export default {
	props: {
		maxValue: {
			required: true
		},
		currentValue: {
			required: true
		},
		height: {
			default: 15
		}
	},
	computed: {
		filledPrecentage() {
			return (parseInt(this.currentValue) / parseInt(this.maxValue)) * 100;
		},
		barColor() {
			let R;
			let G;
			let B = 0;
			let shade_factor = 0.2;

			//calculate the color according to the progress value, from red to green.
			R =
				this.filledPrecentage < 50
					? 255
					: Math.floor(255 - ((this.filledPrecentage * 2 - 100) * 255) / 100);
			G =
				this.filledPrecentage > 50
					? 255
					: Math.floor((this.filledPrecentage * 2 * 255) / 100);

			R *= 1 - shade_factor;
			G *= 1 - shade_factor;
			return 'rgb(' + R + ',' + G + ',' + B + ', 0.7)';
		}
	}
};
</script>

<style scoped>
.progress {
	border-radius: 25px;
}
</style>

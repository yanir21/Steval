<template>
	<form :id="currCriterionId" class="toggle_radio" :class="{ dark: darkMode }">
		<label :form="currCriterionId">
			<input
				type="radio"
				@click="changeGrade"
				class="toggle_option"
				name="toggle_option"
				:value="MIN_VALUE"
				data-testid="xMark"
			/>
			<span class="toggle-icon"><i class="material-icons">clear</i></span>
		</label>
		<label :form="currCriterionId">
			<input
				type="radio"
				@click="changeGrade"
				class="toggle_option"
				name="toggle_option"
				:value="DEFAULT_VALUE"
				data-testid="noMark"
			/>
			<span></span>
		</label>
		<label :form="currCriterionId">
			<input
				type="radio"
				@click="changeGrade"
				class="toggle_option"
				name="toggle_option"
				:value="MAX_VALUE"
				data-testid="vMark"
			/>
			<span><i class="material-icons">done</i></span>
		</label>
		<section
			class="toggle_option_slider"
			:class="{ min: isMin, default: isDefault, max: isMax }"
			data-testid="slider"
		></section>
	</form>
</template>

<script>
import { mapState } from 'vuex';

export default {
	data() {
		return {
			isMin: false,
			isDefault: true,
			isMax: false,
			MIN_VALUE: '0',
			DEFAULT_VALUE: 'NO_VALUE',
			MAX_VALUE: '100',
			grade: undefined
		};
	},
	computed: {
		darkMode() {
			return this.$vuetify.theme.dark;
		}
	},
	props: {
		currCriterionId: {
			required: true
		},
		criterionGrade: {
			required: false
		}
	},
	watch: {
		criterionGrade() {
			this.grade = this.criterionGrade;
		},
		grade() {
			this.grade === false
				? this.toggleChange(this.DEFAULT_VALUE)
				: this.toggleChange(this.grade.toString());
		}
	},
	methods: {
		toggleChange(elementValue) {
			this.isMin = false;
			this.isDefault = false;
			this.isMax = false;

			if (elementValue === this.MIN_VALUE) {
				this.isMin = true;
			} else if (elementValue > this.MIN_VALUE && elementValue !== this.DEFAULT_VALUE) {
				this.isMax = true
			} else {
				this.isDefault = true;
			}
		},

		changeGrade(event) {
			this.grade = event.target.value;
			setTimeout(() => {
				this.$emit('gradePressed', this.grade);
			}, 250);
		}
	},
	mounted() {
		this.grade = this.criterionGrade;
	}
};
</script>
<style lang="css" scoped>
i {
	padding-top: 0.35vh;
	font-size: 2.5vh;
}
.toggle_radio {
	position: relative;
	background: rgba(10, 10, 10, 0.05);
	overflow: hidden;
	padding: 0 !important;
	border-radius: 50px;
	position: relative;
	height: 4.5vh;
	width: 8.3vw;
}
.toggle_radio > * {
	float: left;
}
.toggle_radio input[type='radio'] {
	display: none;
}
.toggle_radio label {
	font-size: 150%;
	color: rgba(20, 20, 20, 0.9);
	display: block;
	width: 2.3vw;
	height: 3.9vh;
	margin: 0.9vh 0.2vh 0 0.4vh;
	border-radius: 50px;
	cursor: pointer;
	z-index: 1;
	text-align: center;
	justify-content: space-between;
}
.toggle_radio label:first-of-type {
	padding: 0 0 0 0.4vh;
}
ַ .toggle_radio label:last-of-type {
	padding: 0 1vh 0 0;
}
.toggle_option_slider {
	width: 2.5vw;
	height: 3.6vh;
	position: absolute;
	top: 0.5vh;
	border-radius: 50px;
	transition: all 0.2s linear;
}
.min.toggle_option_slider {
	background: rgba(249, 126, 126, 0.3);
	left: 0.3vw;
}
.default.toggle_option_slider {
	background: rgba(255, 255, 255, 0.8);
	left: 3vw;
}
.max.toggle_option_slider {
	background: rgba(141, 211, 95, 0.3);
	left: 5.5vw;
}
.dark {
	background: #262626;
}
</style>

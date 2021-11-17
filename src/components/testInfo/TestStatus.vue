<template>
	<v-row align="center">
		<v-col dir="ltr" class="pr-2" cols="10">
			<v-col>
				<v-row align="center">
					<v-col cols="1" class="pa-0">
						<span class="text-h6">
							{{ notFilled }}
						</span>
					</v-col>
					<v-col cols="1" class="pa-0">
						<v-icon class="light_opacity ma-0 pa-0" style="color: #e52b50;"
							>radio_button_unchecked</v-icon
						>
					</v-col>
				</v-row>
				<v-row align="center">
					<v-col cols="1" class="pa-0">
						<span class="text-h6">
							{{ halfFilled }}
						</span>
					</v-col>
					<v-col cols="1" class="pa-0">
						<v-icon class="light_opacity" style="color: #4fa1ff;"
							>remove_circle_outline</v-icon
						>
					</v-col>
				</v-row>
				<v-row align="center">
					<v-col cols="1" class="pa-0">
						<span class="text-h6">
							{{ filled }}
						</span>
					</v-col>
					<v-col cols="1" class="pa-0">
						<v-icon class="light_opacity" style="color: #4ae683;"
							>check_circle_outline</v-icon
						>
					</v-col>
				</v-row>
			</v-col>
		</v-col>
		<v-col cols="2">
			<v-progress-circular
				pr-10
				:rotate="-90"
				:size="105"
				:width="8"
				class="ma-0 float-left ml-n5"
				:color="precentageTheme"
				:value="precentage"
				><span class="text-h5"
					><span :color="precentageTheme">{{ filled }}</span>
					<span class="text-h5" :class="darkMode ? 'white--text' : 'black--text'"
						>/{{ total }}</span
					>
				</span>
			</v-progress-circular>
		</v-col>
	</v-row>
</template>

<script>
import { mapState } from 'vuex';
export default {
	props: {
		total: {
			type: Number,
			required: true
		},
		filled: {
			type: Number,
			required: true
		},
		halfFilled: {
			type: Number,
			required: true
		},
		notFilled: {
			type: Number,
			required: true
		}
	},
	computed: {
		...mapState(['darkMode']),
		precentage() {
			return (this.filled / this.total) * 100;
		},
		precentageTheme() {
			let red, green;
			if (this.precentage < 50) {
				red = 255;
				green = Math.round(5.1 * this.precentage);
			} else {
				green = 200;
				red = Math.round(510 - 5.1 * this.precentage);
			}
			let h = red * 0x10000 + green * 0x100 + 0 * 0x1;
			return `#${('000000' + h.toString(16)).slice(-6)}`;
		}
	}
};
</script>

<style scoped>
.light_opacity {
	opacity: 0.7;
}

.status {
	margin-left: 2vh;
}
</style>

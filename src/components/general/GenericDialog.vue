<template>
	<v-dialog v-model="dialog" :max-width="maxWidth" @click:outside="$emit('cancle')">
		<v-card>
			<v-card-title>
				<p class="h5">{{ title }}</p>
			</v-card-title>
			<v-card-text>
				{{ content }}
				<slot name="content"></slot>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn v-if="cancle" color="red darken-1" text @click="$emit('cancle')"
					>התחרטתי</v-btn
				>
				<v-btn
					v-if="commit"
					color="green darken-1"
					text
					@click="$emit('commit')"
					v-shortkey="['enter']"
					@shortkey="$emit('commit')"
				>
					נראה טוב</v-btn
				>
				<v-btn
					v-else
					color="primary darken-1"
					text
					@click="$emit('commit')"
					v-shortkey="['enter']"
					@shortkey="$emit('commit')"
				>
					סבבה</v-btn
				>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	props: {
		title: {
			type: String,
			default: ''
		},
		content: {
			type: [String, Number],
			default: ''
		},
		commit: {
			type: Boolean,
			default: false
		},
		cancle: {
			type: Boolean,
			default: false
		},
		dialog: {
			type: Boolean,
			required: true
		},
		maxWidth: {
			type: [Number, String],
			default: '60vw'
		}
	}
};
</script>

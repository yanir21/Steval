import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import TriToggle from '@/components/TriToggle.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('TriToggle', () => {
	let getters;
	let store;
	let wrapper;
	beforeEach(() => {
		getters = {
			darkMode: () => false
		};

		store = new Vuex.Store({
			getters
		});
		wrapper = shallowMount(TriToggle, {
			propsData: {
				currCriterionId: 622
			},
			store,
			localVue
		});
	});

	test('Marking case as working emits grade update event after 250ms', async () => {
		wrapper.find('[data-testid="xMark"]').trigger('click');
		setTimeout(() => {
			const fillEventCalls = wrapper.emitted('gradePressed');
			expect(fillEventCalls).toHaveLength(1);
		}, 250);
	});

	test('Slider moves to red position after a click on x', async () => {
		const slider = wrapper.find('[data-testid="slider"]');
		wrapper.find('[data-testid="xMark"]').trigger('click');
		setTimeout(() => {
			expect(slider.classes()).toContain('min');
		}, 250);
	});

	test('Slider moves to green position after a click on v', async () => {
		const slider = wrapper.find('[data-testid="slider"]');
		wrapper.find('[data-testid="vMark"]').trigger('click');
		setTimeout(() => {
			expect(slider.classes()).toContain('max');
		}, 250);
	});

	test('Slider moves to default position after a click in the middle', async () => {
		const slider = wrapper.find('[data-testid="slider"]');
		wrapper.find('[data-testid="noMark"]').trigger('click');
		expect(slider.classes()).toContain('default');
	});
});

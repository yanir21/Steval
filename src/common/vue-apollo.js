import Vue from 'vue';
import VueApollo from 'vue-apollo';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import { AuthenticationContext } from 'vue-adal';
import log from './tovalogger.js';

const AUTH_TOKEN = 'adal.idtoken';

const httpEndpoint = process.env.VUE_APP_GRAPHQL_HTTP;

const wsEndpoint = process.env.VUE_APP_GRAPHQL_WS;

const authLink = setContext((_, { headers }) => {
	return acquireJWT().then(token => {
		return {
			headers: {
				...headers,
				'content-type': 'application/json',
				authorization: `Bearer ${token}`
			}
		};
	});
});

const acquireJWT = () => {
	return new Promise((resolve, reject) => {
		AuthenticationContext.acquireToken(
			process.env.VUE_APP_CLIENT_ID,
			(error_description, token, error) => {
				if (error) {
					log('error', 'Apollo error', this, error);
					reject(error);
				} else {
					resolve(token);
				}
			}
		);
	});
};

const httpLink = createHttpLink({
	uri: httpEndpoint
});

const wsLink = new WebSocketLink({
	uri: wsEndpoint,
	options: {
		reconnect: true,
		connectionParams: {
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN)}`
			}
		}
	}
});

const link = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
	},
	wsLink,
	authLink.concat(httpLink)
);
const client = new ApolloClient({
	link,
	connectToDevTools: true,
	cache: new InMemoryCache({ freezeResults: false })
});

const apolloProvider = new VueApollo({
	defaultClient: client,
	defaultOptions: {
		$query: {
			fetchPolicy: 'cache-and-network'
		}
	},
	watchLoading(isLoading, countModifier) {
		if (isLoading && !this.$store.getters.loading) {
			this.$store.commit('turnOnLoading');
		} else if (!isLoading) {
			setTimeout(() => {
				this.$store.commit('turnOffLoading');
			}, 500);
		}
	},
	errorHandler(error) {
		if (error.message.includes('authorization')) {
			localStorage.removeItem(AUTH_TOKEN);
			acquireJWT().then(jwt => {
				localStorage.setItem(AUTH_TOKEN, jwt);
				if (!localStorage.getItem('retried')) {
					localStorage.setItem('retried', 'true');
					window.location.href = '/';
				} else
					setTimeout(() => {
						localStorage.removeItem('retried');
					}, 3000);
			});
		}
		log('error', 'apollo error', this, error);
		this.$router.push({
			path: 'error',
			params: {
				errorMessage: encodeURIComponent(error.message)
			}
		});
	}
});

export const reAuthenticate = () => {
	localStorage.removeItem(AUTH_TOKEN);
	acquireJWT().then(jwt => {
		localStorage.setItem(AUTH_TOKEN, jwt);
		if (!localStorage.getItem('retried')) {
			localStorage.setItem('retried', 'true');
			window.location.href = '/';
		} else
			setTimeout(() => {
				localStorage.removeItem('retried');
			}, 3000);
	});
};

Vue.use(VueApollo);

export default apolloProvider;

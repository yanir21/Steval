const log = (level, message, { $options }, ...logData) => {
	const INDEX_NAME =
		process.env.VUE_APP_LOG_INDEX_NAME || 'http://10.1.0.82:9200/steval-dev/logs';
	fetch(INDEX_NAME, {
		method: 'POST',
		headers: {
			Authorization: 'Basic ********',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			component: $options.name,
			level,
			message,
			logData: { ...logData }
		})
	});
};

export default log;

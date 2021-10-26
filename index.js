const app = require('./src/app');
const pool = require('./src/pool');

pool
	.connect({
		host: 'localhost',
		post: 5432,
		database: 'socialnetwork',
		user: 'postgres',
		password: '12580963'
	})
	.then(() => {
		app().listen(8000, () => {
			console.log('DB connected');
		});
	})
	.catch((err) => {
		console.log(err.message);
	});

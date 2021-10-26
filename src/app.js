const express = require('express');
const userRouter = require('./routers/userRouter');

module.exports = () => {
	const app = express();

	app.use(userRouter);
	app.use(express.json());

	return app;
};

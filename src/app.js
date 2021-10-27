const express = require("express");
const userRouter = require("./routers/userRouter");

module.exports = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(userRouter);

  return app;
};

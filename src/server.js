const express = require("express");
const mongoose = require("mongoose");
const listEndPoints = require("express-list-endpoints");
const cors = require("cors");

const {
  notFoundHandler,
  forbiddenHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./errorHandlers");

const userRouter = require("./users/index");

const server = express();

server.use(cors());
server.use(express.json());

server.use("/users", userRouter);

server.use(badRequestHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);
console.log(listEndPoints(server));

mongoose.set("debug", true);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .then(
    server.listen(process.env.PORT, () => {
      console.log("Server started at port: ", process.env.PORT);
    })
  )
  .catch(console.error);

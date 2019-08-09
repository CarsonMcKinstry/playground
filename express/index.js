import express from "express";
const logger = require("morgan");

const app = express();

app.use(logger);

app.get("/", (_, res) => res.send("OK"));

app.listen(8080, () => console.log("Hello from 8080"));

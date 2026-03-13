const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongodb = require("./config/database");
const path = require("path");
const createHelper = require("./src/start/helper");

const app = express();
const PORT = 3300;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(require("./src/router/kafedraList"));
app.use(require("./src/router/admin"));

async function bootstrap() {
  await mongodb();
  await createHelper();
  app.listen(PORT, () => {
    console.log("Server is running", PORT);
  });
}
bootstrap().catch((e) => {
  console.error("BOOTSTRAP ERROR:", e.message);
  process.exit(1);
});

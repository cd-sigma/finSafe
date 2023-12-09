const express = require("express");
const bodyParser = require("body-parser");
const { PORT } = require("./config.json");
const path = __dirname + "/build/";
const app = express();
app.use(express.static(path));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("*", function (req, res) {
  res.sendFile(path + "index.html");
});

app.listen(PORT, () => {
  console.log(`react frontend is running on port no. ${PORT}.`);
});

const fs = require("fs");
const errorUtil = require("../util/error.util");

const envFilePath = __dirname + "/../.env";
if (!fs.existsSync(envFilePath)) {
  errorUtil.throwErr("env file does not exist");
}
require("dotenv").config({ path: envFilePath });

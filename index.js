const fs = require("fs");
const processLog = require("./parser");
const logPath = "data/qgames.log"; // Change this to the correct path

try {
  // Try to read the file
  const logText = fs.readFileSync(logPath, "utf-8");
  // You can process the file content as desired here
  const games = processLog(logText);
  console.log(games);
} catch (error) {
  // If there is an error (such as the file not existing), it will be caught here
  console.error(`Error reading the file: ${error.message}`);
}

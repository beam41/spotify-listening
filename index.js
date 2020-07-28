const core = require("@actions/core");
const github = require("@actions/github");

try {
  // `who-to-greet` input defined in action metadata file
  const content = core.getInput("content");
  console.log(content);
} catch (error) {
  core.setFailed(error.message);
}

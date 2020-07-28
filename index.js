const core = require("@actions/core");
const fetch = require("node-fetch");

async function main() {
  const content = core.getInput("content");
  const token = core.getInput("token");
  console.log(content);
  const res = await fetch(
    "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5",
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();
  console.log(data)
}

main().catch((err) => core.setFailed(err.message));

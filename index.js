const core = require("@actions/core");
const fetch = require("node-fetch");

async function main() {
  const content = core.getInput("content");
  const token = core.getInput("token");
  const clientId = core.getInput("clientId");
  const cliSecret = core.getInput("cliSecret");
  const secret = `${clientId}:${cliSecret}`;
  const secretBase64 = Buffer.from(secret).toString("base64");
  const tokenRequest = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${secretBase64}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token,
    }),
  });
  const tokenRequestData = await tokenRequest.json();

  const res = await fetch(
    "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5",
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenRequestData.access_token}`,
      },
    }
  );
  const data = await res.json();
  console.log(data)
  const dataTable = `
|${data.items
    .map(({ images }) => `<img src="${images[images.length - 1].url}">`)
    .join("|")}|
| :---: | :---: | :---: | :---: | :---: | :---: |
|${data.items.map(({ name }) => `<b>${name}</b>`).join("|")}|
  `.trim();
  console.log(dataTable);
}

main().catch((err) => core.setFailed(err.message));

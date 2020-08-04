const core = require("@actions/core");
const fetch = require("node-fetch");

async function main() {
  let content = core.getInput("content");
  const token = core.getInput("token");
  const clientId = core.getInput("clientId");
  const cliSecret = core.getInput("cliSecret");
  // access token expired quickly so I have to use refresh token to get access token first
  console.log("Getting access token..");
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
  console.log("Access token received");

  // artists
  console.log("Fetch artist data");
  // only get top 5 now might make it able to change amount later (if requested)
  const resArtist = await fetch(
    "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5",
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenRequestData.access_token}`,
      },
    }
  );
  const dataArtist = await resArtist.json();
  console.log("Artist data fetched");
  console.log("Write an artist table");
  // this code generate exacly 5 seperator but you can't change amount so I think it's work for now
  const dataTableArtist = `<!-- table start -->
|${dataArtist.items
    // last image is smallest and it's enough
    .map(({ images }) => `<img src="${images[images.length - 1].url}">`)
    .join("|")}|
| :---: | :---: | :---: | :---: | :---: |
|${dataArtist.items.map(({ name }) => `<b>${name}</b>`).join("|")}|

Updated at \`${new Date().toString().replace(/ *\([^]*\)/, "")}\`
<!-- table end -->`;
  console.log("Write new readme for artist");
  // might make it able to change placeholder text
  content = content.replace(
    /<!-- *table start *-->[^]*<!-- *table end *-->/gi,
    dataTableArtist
  );

  // songs
  console.log("Fetch artist data");
  // only get top 5 now might make it able to change amount later (if requested)
  const resSong = await fetch(
    "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5",
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenRequestData.access_token}`,
      },
    }
  );
  const dataSong = await resSong.json();
  console.log("Artist data fetched");
  console.log("Write an artist table");
  // this code generate exacly 5 seperator but you can't change amount so I think it's work for now
  const dataTableSong = `<!-- table song start -->
|${dataSong.items
    // last image is smallest and it's enough
    .map(({ album }) => `<img src="${album.images[1].url}">`)
    .join("|")}|
| :---: | :---: | :---: | :---: | :---: |
|${dataSong.items
    .map(
      ({ name, artists }) =>
        `<p><b>${name}</b></p> ${artists.map((v) => v.name).join(", ")}`
    )
    .join("|")}|

Updated at \`${new Date().toString().replace(/ *\([^]*\)/, "")}\`
<!-- table song end -->`;
  console.log("Write new readme for song");
  // might make it able to change placeholder text
  content = content.replace(
    /<!-- *table song start *-->[^]*<!-- *table song end *-->/gi,
    dataTableSong
  );
  core.setOutput("content", content);
}

main().catch((err) => core.setFailed(err.message));

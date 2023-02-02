const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const url = require("url");

const SCOPES = ["https://www.googleapis.com/auth/documents.readonly"];

const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  // const oauth2Client = new google.auth.OAuth2(
  //   "534885382543-jps4050gvcci2n2rs22d5oj9s2ldk05q.apps.googleusercontent.com",
  //   "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"
  // );
  // const authorizationUrl = oauth2Client.generateAuthUrl({
  //   // 'online' (default) or 'offline' (gets refresh_token)
  //   /** Pass in the scopes array defined above.
  //    * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
  //   scope: SCOPES,
  //   // Enable incremental authorization. Recommended as a best practice.
  //   include_granted_scopes: true,
  // });
  // console.log(authorizationUrl)
  // let { tokens } = await oauth2Client.getToken("dsadsadsa");
  // console.log(tokens);

  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function printDoc(id) {
  try {
    const auth = await authorize();
    const docs = google.docs({ version: "v1", auth });
    const res = await docs.documents
      .get({
        documentId: id,
      })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        console.log(error);
        return error;
      });
    return res;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  printDoc,
};

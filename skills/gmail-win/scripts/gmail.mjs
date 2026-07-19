#!/usr/bin/env node
/**
 * agenti-gmail — Gmail CLI for Agent-I on Windows
 *
 * Commands:
 *   auth      --credentials <path>        Authenticate with Google (opens browser)
 *   list      [--max N] [--account EMAIL] List inbox emails
 *   read      <messageId>                 Read a full email
 *   search    <query> [--max N]           Search Gmail
 *   send      --to --subject --body       Send an email
 *   reply     --to --subject --body --reply-to <id>  Reply to an email
 *   drafts    create --to --subject --body            Create a draft
 *
 * Token stored at: %USERPROFILE%\.agenti\gmail-token.json
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { google } from "googleapis";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOKEN_DIR = path.join(os.homedir(), ".agenti");
const TOKEN_PATH = path.join(TOKEN_DIR, "gmail-token.json");
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.modify",
];

// ─── Argument Parsing ─────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = { _: [] };
  let i = 0;
  while (i < args.length) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : true;
      result[key] = val;
    } else {
      result._.push(args[i]);
    }
    i++;
  }
  return result;
}

// ─── OAuth ────────────────────────────────────────────────────────────────────

function loadCredentials(credPath) {
  if (!fs.existsSync(credPath)) {
    die(`client_secret.json not found at: ${credPath}\nRun: node gmail.mjs auth --credentials <path>`);
  }
  const raw = JSON.parse(fs.readFileSync(credPath, "utf8"));
  const cred = raw.installed || raw.web;
  if (!cred) die("Invalid client_secret.json format.");
  return cred;
}

function buildOAuth2(cred) {
  return new google.auth.OAuth2(
    cred.client_id,
    cred.client_secret,
    "http://localhost:4242/oauth2callback"
  );
}

function loadToken() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  } catch {
    return null;
  }
}

function saveToken(token) {
  fs.mkdirSync(TOKEN_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
}

async function getAuthenticatedClient(credPath) {
  const token = loadToken();
  if (!token) {
    die(
      `Not authenticated. Run first:\n  node gmail.mjs auth --credentials <path/to/client_secret.json>\n\nSee setup guide: skills/gmail-win/scripts/setup.md`
    );
  }

  // If we have credentials path, use it; otherwise reconstruct minimal client
  let oauth2;
  if (credPath && fs.existsSync(credPath)) {
    const cred = loadCredentials(credPath);
    oauth2 = buildOAuth2(cred);
  } else {
    // Try to reconstruct from token metadata (client_id/secret stored alongside token)
    if (token.client_id && token.client_secret) {
      const fakeOauth = new google.auth.OAuth2(
        token.client_id,
        token.client_secret,
        "http://localhost:4242/oauth2callback"
      );
      fakeOauth.setCredentials(token);
      return fakeOauth;
    }
    die(
      `Cannot refresh token without credentials. Run:\n  node gmail.mjs auth --credentials <path/to/client_secret.json>`
    );
  }

  oauth2.setCredentials(token);

  // Auto-refresh if expired
  oauth2.on("tokens", (newTokens) => {
    const merged = { ...token, ...newTokens, client_id: oauth2._clientId, client_secret: oauth2._clientSecret };
    saveToken(merged);
  });

  return oauth2;
}

// ─── Auth Command ─────────────────────────────────────────────────────────────

async function cmdAuth(args) {
  const credPath = args.credentials;
  if (!credPath) die("Usage: gmail.mjs auth --credentials <path/to/client_secret.json>");

  const cred = loadCredentials(credPath);
  const oauth2 = buildOAuth2(cred);

  const authUrl = oauth2.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\n🔐 Open this URL in your browser to authorize:\n");
  console.log("  " + authUrl);
  console.log("\nWaiting for OAuth callback on http://localhost:4242 ...\n");

  // Start local server to capture the code
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, "http://localhost:4242");
      const code = url.searchParams.get("code");
      if (code) {
        res.end("<html><body><h2>✅ Authenticated! You can close this tab.</h2></body></html>");
        server.close();
        resolve(code);
      } else {
        res.end("<html><body><h2>❌ No code found. Try again.</h2></body></html>");
        server.close();
        reject(new Error("No code in callback"));
      }
    });
    server.listen(4242, "localhost");
    server.on("error", reject);
  });

  const { tokens } = await oauth2.getToken(code);
  // Store client_id/secret alongside token so we can refresh without credentials file
  tokens.client_id = cred.client_id;
  tokens.client_secret = cred.client_secret;
  saveToken(tokens);

  console.log(`✅ Authentication successful!\nToken saved to: ${TOKEN_PATH}`);
  console.log('\nTest with: node gmail.mjs list --max 5');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function die(msg) {
  console.error("❌ " + msg);
  process.exit(1);
}

function decodeBase64(str) {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function extractBody(payload) {
  if (!payload) return "";

  // Direct body
  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  // Multipart: prefer text/plain, fallback to text/html
  if (payload.parts) {
    const plain = payload.parts.find((p) => p.mimeType === "text/plain");
    if (plain?.body?.data) return decodeBase64(plain.body.data);

    const html = payload.parts.find((p) => p.mimeType === "text/html");
    if (html?.body?.data) {
      // Strip HTML tags for readability
      return decodeBase64(html.body.data).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    // Nested multipart
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }

  return "";
}

function getHeader(headers, name) {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function formatDate(internalDate) {
  if (!internalDate) return "Unknown";
  return new Date(parseInt(internalDate)).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ─── List Command ─────────────────────────────────────────────────────────────

async function cmdList(args) {
  const max = parseInt(args.max ?? "10", 10);
  const account = args.account ?? process.env.GMAIL_ACCOUNT;
  const oauth2 = await getAuthenticatedClient(args.credentials);
  const gmail = google.gmail({ version: "v1", auth: oauth2 });

  const listRes = await gmail.users.messages.list({
    userId: "me",
    maxResults: max,
    labelIds: ["INBOX"],
  });

  const messages = listRes.data.messages ?? [];
  if (messages.length === 0) {
    console.log("📭 No messages found.");
    return;
  }

  console.log(`📬 Last ${messages.length} inbox emails:\n`);

  for (const msg of messages) {
    const detail = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    });

    const headers = detail.data.payload?.headers ?? [];
    const from = getHeader(headers, "From");
    const subject = getHeader(headers, "Subject");
    const date = formatDate(detail.data.internalDate);
    const snippet = detail.data.snippet ?? "";

    console.log(`─────────────────────────────────────`);
    console.log(`ID:      ${msg.id}`);
    console.log(`From:    ${from}`);
    console.log(`Subject: ${subject}`);
    console.log(`Date:    ${date}`);
    console.log(`Preview: ${snippet.slice(0, 120)}...`);
  }
  console.log(`─────────────────────────────────────`);
}

// ─── Read Command ─────────────────────────────────────────────────────────────

async function cmdRead(args) {
  const msgId = args._[1];
  if (!msgId) die("Usage: gmail.mjs read <messageId>");

  const oauth2 = await getAuthenticatedClient(args.credentials);
  const gmail = google.gmail({ version: "v1", auth: oauth2 });

  const detail = await gmail.users.messages.get({
    userId: "me",
    id: msgId,
    format: "full",
  });

  const headers = detail.data.payload?.headers ?? [];
  const from = getHeader(headers, "From");
  const to = getHeader(headers, "To");
  const subject = getHeader(headers, "Subject");
  const date = formatDate(detail.data.internalDate);
  const body = extractBody(detail.data.payload);

  console.log(`─────────────────────────────────────`);
  console.log(`From:    ${from}`);
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Date:    ${date}`);
  console.log(`─────────────────────────────────────`);
  console.log(body || "(No readable body)");
}

// ─── Search Command ───────────────────────────────────────────────────────────

async function cmdSearch(args) {
  const query = args._[1];
  if (!query) die("Usage: gmail.mjs search <query> [--max N]");

  const max = parseInt(args.max ?? "10", 10);
  const oauth2 = await getAuthenticatedClient(args.credentials);
  const gmail = google.gmail({ version: "v1", auth: oauth2 });

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: max,
  });

  const messages = listRes.data.messages ?? [];
  if (messages.length === 0) {
    console.log(`🔍 No results for: "${query}"`);
    return;
  }

  console.log(`🔍 Search results for "${query}" (${messages.length} found):\n`);

  for (const msg of messages) {
    const detail = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    });

    const headers = detail.data.payload?.headers ?? [];
    const from = getHeader(headers, "From");
    const subject = getHeader(headers, "Subject");
    const date = formatDate(detail.data.internalDate);
    const snippet = detail.data.snippet ?? "";

    console.log(`─────────────────────────────────────`);
    console.log(`ID:      ${msg.id}`);
    console.log(`From:    ${from}`);
    console.log(`Subject: ${subject}`);
    console.log(`Date:    ${date}`);
    console.log(`Preview: ${snippet.slice(0, 120)}...`);
  }
  console.log(`─────────────────────────────────────`);
}

// ─── Send Command ─────────────────────────────────────────────────────────────

function buildRawEmail({ to, subject, body, bodyHtml, replyToMessageId, from }) {
  const boundary = "agenti_boundary_" + Date.now();
  const isHtml = !!bodyHtml;

  let raw = [
    `From: ${from ?? "me"}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
  ];

  if (replyToMessageId) {
    raw.push(`In-Reply-To: ${replyToMessageId}`);
    raw.push(`References: ${replyToMessageId}`);
  }

  if (isHtml) {
    raw.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    raw.push("");
    raw.push(`--${boundary}`);
    raw.push(`Content-Type: text/plain; charset=utf-8`);
    raw.push("");
    raw.push(bodyHtml.replace(/<[^>]+>/g, " "));
    raw.push(`--${boundary}`);
    raw.push(`Content-Type: text/html; charset=utf-8`);
    raw.push("");
    raw.push(bodyHtml);
    raw.push(`--${boundary}--`);
  } else {
    raw.push(`Content-Type: text/plain; charset=utf-8`);
    raw.push("");
    raw.push(body ?? "");
  }

  const encoded = Buffer.from(raw.join("\r\n")).toString("base64url");
  return encoded;
}

async function cmdSend(args) {
  const to = args.to;
  const subject = args.subject;
  const body = args.body;
  const bodyHtml = args["body-html"];
  const bodyFile = args["body-file"];
  const replyTo = args["reply-to-message-id"];

  if (!to || !subject) die("Usage: gmail.mjs send --to <email> --subject <text> --body <text>");

  let finalBody = body;
  if (bodyFile) {
    if (bodyFile === "-") {
      // Read from stdin
      finalBody = fs.readFileSync("/dev/stdin", "utf8");
    } else {
      finalBody = fs.readFileSync(bodyFile, "utf8");
    }
  }

  const oauth2 = await getAuthenticatedClient(args.credentials);
  const gmail = google.gmail({ version: "v1", auth: oauth2 });

  // Get sender's email
  const profile = await gmail.users.getProfile({ userId: "me" });
  const from = profile.data.emailAddress;

  const raw = buildRawEmail({ to, subject, body: finalBody, bodyHtml, replyToMessageId: replyTo, from });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  console.log(`✅ Email sent to ${to}`);
  console.log(`   Subject: ${subject}`);
}

// ─── Draft Commands ───────────────────────────────────────────────────────────

async function cmdDraftsCreate(args) {
  const to = args.to;
  const subject = args.subject;
  const body = args.body;
  const bodyFile = args["body-file"];

  if (!to || !subject) die("Usage: gmail.mjs drafts create --to <email> --subject <text> --body <text>");

  let finalBody = body;
  if (bodyFile) {
    if (bodyFile === "-") {
      finalBody = fs.readFileSync("/dev/stdin", "utf8");
    } else {
      finalBody = fs.readFileSync(bodyFile, "utf8");
    }
  }

  const oauth2 = await getAuthenticatedClient(args.credentials);
  const gmail = google.gmail({ version: "v1", auth: oauth2 });

  const profile = await gmail.users.getProfile({ userId: "me" });
  const from = profile.data.emailAddress;

  const raw = buildRawEmail({ to, subject, body: finalBody, from });

  const draft = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw } },
  });

  console.log(`✅ Draft created: ${draft.data.id}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);
  const cmd = args._[0];

  try {
    switch (cmd) {
      case "auth":
        await cmdAuth(args);
        break;
      case "list":
        await cmdList(args);
        break;
      case "read":
        await cmdRead(args);
        break;
      case "search":
        await cmdSearch(args);
        break;
      case "send":
        await cmdSend(args);
        break;
      case "drafts":
        if (args._[1] === "create") {
          await cmdDraftsCreate(args);
        } else {
          die(`Unknown drafts subcommand: ${args._[1]}`);
        }
        break;
      default:
        console.log(`
agenti-gmail — Gmail CLI for Agent-I

Commands:
  auth    --credentials <path>          Authenticate (run once)
  list    [--max N]                     List inbox emails  
  read    <messageId>                   Read a full email
  search  <query> [--max N]            Search Gmail
  send    --to --subject --body         Send email
  drafts  create --to --subject --body  Create a draft

Environment:
  GMAIL_ACCOUNT   Default account email (optional)

Examples:
  node gmail.mjs auth --credentials client_secret.json
  node gmail.mjs list --max 5
  node gmail.mjs search "from:github.com newer_than:7d"
  node gmail.mjs read 18a1b2c3d4e5f6
  node gmail.mjs send --to user@example.com --subject "Hi" --body "Hello!"
        `.trim());
    }
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      die("Could not connect to Google. Check your internet connection.");
    }
    if (err.response?.data?.error === "invalid_grant") {
      die(`Token expired or revoked. Re-authenticate:\n  node gmail.mjs auth --credentials <path>`);
    }
    console.error("❌ Error:", err.message ?? err);
    process.exit(1);
  }
}

main();

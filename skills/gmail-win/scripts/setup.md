# Setting Up Gmail OAuth Credentials

This is a one-time setup. Takes about 5 minutes.

---

## Step 1: Create a Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Name it (e.g. `agenti-gmail`) → **Create**

---

## Step 2: Enable the Gmail API

1. In your new project, go to **APIs & Services → Library**
2. Search for **"Gmail API"**
3. Click it → **Enable**

---

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. If prompted to configure the consent screen:
   - Choose **External** → **Create**
   - Fill in App name (e.g. `Agent-I Gmail`)
   - Add your email as developer contact
   - Click **Save and Continue** through all screens
   - Under **Test users**, click **+ Add Users** and add your Gmail address
4. Back in Credentials → **Create Credentials → OAuth client ID**:
   - Application type: **Desktop app**
   - Name: `agenti-gmail`
   - Click **Create**
5. Click **Download JSON** → save as `client_secret.json`

---

## Step 4: Run Authentication

```powershell
cd d:\panda-ai\panda-ai\skills\gmail-win
npm install
node scripts/gmail.mjs auth --credentials C:\path\to\client_secret.json
```

This opens a browser window. Sign in with your Gmail account and click **Allow**.

The token is saved to `~/.agenti/gmail-token.json` and reused automatically.

---

## Step 5: Test It

```powershell
node d:\panda-ai\panda-ai\skills\gmail-win\scripts\gmail.mjs list --max 5
```

You should see your last 5 emails.

---

## Troubleshooting

- **"This app is blocked"**: You need to add yourself as a test user (Step 3 above).
- **"invalid_client"**: The `client_secret.json` path is wrong or the file is malformed.
- **Token expired**: Run `auth` again to refresh.

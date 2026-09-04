# Gemini Reflection Journal & AI Brainstorming Companion

A secure, full-stack reflection journal powered by **Gemini 3.6 Flash** and **Cloud Firestore** with **Firebase Authentication (Google Identity)**. The architecture guarantees complete user data isolation, resilient multi-model fallback, and secret management hygiene.

---

## Architecture Overview

- **Frontend**: React 19 + Vite + Tailwind CSS + Lucide Icons.
- **Backend API**: Express server orchestrating Gemini API calls server-side (zero browser exposure of API keys).
- **Identity**: Firebase Authentication using Google Sign-In (no storage of raw credentials or passwords).
- **Persistence**: Cloud Firestore with owner-isolated security rules restricting read/write access to `/users/{userId}/interactions/{interactionId}`.
- **AI Processing**: Gemini 3.6 Flash with automated fallback ladder (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash`).

---

## 1. Environment & Prerequisites

Ensure the following Google Cloud and Firebase tools are available:
- **Google Cloud SDK (`gcloud` CLI)**
- **Firebase CLI (`firebase-tools`)**
- Node.js 20+

### Enable Required Google Cloud APIs

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com
```

---

## 2. Secret Management Setup

Gemini API keys and runtime secrets are stored securely in Google Cloud Secret Manager rather than embedded in code or container images.

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration

Deploy owner-bound security rules to ensure user isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy the rules via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Local Development

```bash
# Install dependencies
npm install

# Start the full-stack dev server (Express + Vite) on port 3000
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 5. Production Build & Cloud Run Deployment

Build and bundle the production assets:
```bash
npm run build
```

Deploy directly from source using `gcloud run deploy`:
```bash
gcloud run deploy gemini-reflection-journal \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

---

## 6. Required Campaign Verification Binding

Apply the mandatory resource label to register the service for automated challenge verification:

```bash
gcloud run services update gemini-reflection-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region asia-southeast1
```

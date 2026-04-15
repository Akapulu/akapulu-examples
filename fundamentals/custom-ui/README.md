# custom-ui

Sample app for a **fully custom** conversation UI using `@akapulu/react` (provider, hooks, Daily primitives) and server-side API routing (`@akapulu/server`).

You build the call surface yourself: video tiles, mic/camera/end controls, transcript, loading and error states, and tool toasts.

## Quickstart

### 1) Install dependencies

```bash
npm install
```

### 2) Add your Akapulu API key

```bash
cp .env.example .env.local
```

Set:

```env
AKAPULU_API_KEY=your_api_key_here
```

### 3) Create a scenario

Create a scenario in the Akapulu dashboard and copy the scenario UUID.

### 4) Set scenario ID in connect route

Edit:

- `app/api/akapulu/connect/route.ts`

In `connectPayload`, replace the `<your-scenario-id>` placeholder:

```ts
const connectPayload = {
  scenario_id: "<your-scenario-id>",
  // ...
};
```

You can keep the included public avatar ID, or replace `avatar_id` inside the `connectPayload` block.

### 5) Run

```bash
npm run dev
```

Open:

- `http://localhost:3000`

You should see the custom call surface with a **Start call** button. Click it to enter `connecting` with spinner/progress, then transition to the connected layout with video tiles, mic/cam/end controls, transcript, node chip, and tool toasts.

When the call ends, the app automatically redirects to `/view-conversation-details/[conversationId]` so you can review the conversation metadata, transcript, and recording status.

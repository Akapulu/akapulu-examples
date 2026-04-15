# prebuilt-ui

Sample app for Akapulu’s prebuilt conversation UI (`@akapulu/react-ui` / `AkapuluConversation`) with server-side API routing (`@akapulu/server`).

This project includes two variants so you can compare side by side:

- **Default** — baseline `AkapuluConversation` (route: `/default`)
- **Styled** — same component with style slots, custom transcript rows, and custom tool toast (route: `/styled`)

Each variant uses its own API route prefix under `app/api/` so connect and updates stay isolated.

## Quickstart

### 1) Prepare dependencies

Install dependencies:

```bash
npm install
```

### 2) Add your Akapulu API key

Copy env file:

```bash
cp .env.example .env.local
```

Set:

```env
AKAPULU_API_KEY=your_api_key_here
```

### 3) Create a scenario

Create a [scenario](https://docs.akapulu.com/guides/scenarios/overview) in the Akapulu dashboard and copy the scenario UUID.

### 4) Configure and run **Default** (`/default`)

Edit:

- `app/api/default/akapulu/connect/route.ts`

In `connectPayload`, replace the `<your-scenario-id>` placeholder:

```ts
const connectPayload = {
  scenario_id: "<your-scenario-id>",
  // ...
};
```

Then run:

```bash
npm run dev
```

Open:

- `http://localhost:3000/default`

You should see the baseline prebuilt `AkapuluConversation` UI. Click **Start Call** to move into `connecting` with a loading spinner, progress bar, and setup status text. When setup is ready, it switches to the connected layout with video, controls, and transcript. This route does not redirect when the call ends.

### 5) Configure and run **Styled** (`/styled`)

Edit:

- `app/api/styled/akapulu/connect/route.ts`

In `connectPayload`, replace the `<your-scenario-id>` placeholder:

```ts
const connectPayload = {
  scenario_id: "<your-scenario-id>",
  // ...
};
```

Then open:

- `http://localhost:3000/styled`

You should see a dark-themed version of the same prebuilt component with style overrides. Click **Start Call** for the same loading-to-connected flow. Transcript rows are custom rendered (`User` / `Assistant`), tool events use a custom toast, and conversation events are logged in the browser console.

When the call ends on `/styled`, the app automatically redirects to `/view-conversation-details/[conversationId]` so you can review the conversation metadata, transcript, and recording status.

You can keep the included public avatar ID, or replace `avatar_id` inside the `connectPayload` block in both connect routes.

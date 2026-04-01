# next-react-ui-demo

Next.js fundamentals example using Akapulu's prebuilt conversation UI (`@akapulu/react-ui`) and server-side API routing (`@akapulu/server`).

This app has two demos:

- `/default` - baseline prebuilt UI
- `/customized` - prebuilt UI with style and behavior overrides

Both demos run the same core flow with different API prefixes so you can compare side by side.

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

Create a scenario in the Akapulu dashboard and copy the scenario UUID.

### 4) Configure and run **Default** demo (`/default`)

Edit:

- `app/api/default/akapulu/connect/route.ts`

Set:

```ts
const SCENARIO_ID = "<your-scenario-id>";
```

Then run:

```bash
npm run dev
```

Open:

- `http://localhost:3000/default`

You should see the baseline prebuilt `AkapuluConversation` UI. Click **Start Call** to move into `connecting` with a loading spinner, progress bar, and setup status text. When setup is ready, it switches to the connected layout with video, controls, and transcript.

### 5) Configure and run **Customized** demo (`/customized`)

Edit:

- `app/api/customized/akapulu/connect/route.ts`

Set:

```ts
const SCENARIO_ID = "<your-scenario-id>";
```

Then open:

- `http://localhost:3000/customized`

You should see a dark themed customized version of the same prebuilt component. Click **Start Call** for the same loading-to-connected flow. Transcript rows are custom rendered (`User` / `Assistant`), tool events use a custom dark toast, and conversation events are logged in the browser console.

You can keep the included public avatar ID, or replace `AVATAR_ID` in both connect routes.

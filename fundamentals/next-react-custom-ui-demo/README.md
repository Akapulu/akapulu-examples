# next-react-custom-ui-demo

Next.js fundamentals example using Akapulu's headless React hooks (`@akapulu/react`) and server-side API routing (`@akapulu/server`).

This demo builds the entire call UI manually (video, controls, transcript, loading, errors, tool toasts) without `@akapulu/react-ui`.

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

Set:

```ts
const SCENARIO_ID = "<your-scenario-id>";
```

You can keep the included public avatar ID, or replace `AVATAR_ID`.

### 5) Run

```bash
npm run dev
```

Open:

- `http://localhost:3000`

You should see the custom call surface with a **Start call** button. Click it to enter `connecting` with spinner/progress, then transition to the connected custom layout with video tiles, mic/cam/end controls, transcript, node chip, and tool toasts.

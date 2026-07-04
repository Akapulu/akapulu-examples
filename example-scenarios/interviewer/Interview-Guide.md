# Senior Frontend Engineer — Interview Guide

The reference the AI interviewer searches (via a RAG / knowledge base tool) to ask grounded questions and judge answers. Swap the role details to make it any job you want.

## Role summary

Senior Frontend Engineer at a Series B product company. Owns major features end to end in a large React and TypeScript codebase, partners with design and backend, and mentors mid level engineers. This is a hands on building role, not a pure management role.

## What the role actually requires

- Deep React experience, including hooks, rendering behavior, and when to reach for context, memoization, or a state library versus keeping state local.
- Strong TypeScript, comfortable modeling real domain types rather than reaching for `any`.
- Real ownership of a shipped feature or system, from ambiguity through launch and iteration, not just assigned tickets.
- Clear reasoning about tradeoffs: performance versus simplicity, speed versus correctness, build versus buy.
- Communication: can explain a technical decision to a non engineer and defend it under a follow up question.

## Key competencies and how to probe them

**1. React depth.** Ask how they decide where state should live, or how they debugged a nasty re render or performance issue. Probe for a concrete example, not a textbook definition.

**2. TypeScript maturity.** Ask about a time types saved them, or how they model a tricky piece of domain state. Weak candidates describe types as annoying overhead; strong ones use them as a design tool.

**3. Ownership.** Ask them to walk through a project they drove. Probe: what was ambiguous, what tradeoff did they make, what broke, what would they do differently. Listen for first person ownership ("I decided", "I owned") versus passive ("we were told to").

**4. Tradeoff reasoning.** Push back once on any answer. A strong candidate can defend a decision and also name its downside. A weak one either caves immediately or cannot articulate the cost.

**5. Communication.** Throughout, notice whether they explain clearly and concisely, or hide behind jargon.

## What a strong answer looks like

- Specific and first person. Names the actual situation, their decision, the result.
- Volunteers the tradeoff or the mistake without being asked twice.
- Holds up under one layer of "why" and can say what they would change.
- Concise. Answers the question asked, then stops.

## What a weak answer looks like

- Vague or purely theoretical ("you should always use X"). No concrete example.
- All "we", no "I". Cannot say what they personally decided or owned.
- Collapses the moment you push back, or doubles down without acknowledging any downside.
- Rambling, buzzword heavy, never quite answers the question.

## The bar

Advance a candidate only if they show real React and TypeScript depth with a concrete example, demonstrate genuine ownership of a past project, and reason clearly about at least one tradeoff under a follow up. Do not advance on confidence or vibes alone. A candidate who is pleasant but only speaks in generalities does not meet the bar.

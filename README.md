
**Deprecated:** This repo are no longer maintained. Use the standalone example repos instead:

- [prebuilt-ui](https://github.com/Akapulu/prebuilt-ui) — minimal prebuilt `AkapuluConversation` demo
- [prebuilt-ui-styled](https://github.com/Akapulu/prebuilt-ui-styled) — styled prebuilt UI + post-call review
- [customized-ui](https://github.com/Akapulu/customized-ui) — custom hooks + Daily video UI + post-call review



# Akapulu Labs Examples

<img src="logo.png" alt="Akapulu Labs" width="96" />

Practical examples for building with Akapulu Labs.


## File tree

```text
akapulu-examples/
  README.md

  fundamentals/
    prebuilt-ui/
    custom-ui/

  example-scenarios/
    healthcare-intake-scheduling/
    sales-roleplay-training/
```

## Examples

### fundamentals

- `fundamentals/prebuilt-ui`  
  Shows the prebuilt conversation UI path with both a minimal baseline and a styled variant. It also demonstrates post-call review with conversation details and recording retrieval.

- `fundamentals/custom-ui`  

  Shows a more customizable path using Akapulu Labs hooks instead of the full prebuilt conversation component. This example gives you tighter control over layout, transcript rendering, and in-call controls.
### example-scenarios

- `example-scenarios/healthcare-intake-scheduling`  
  Simulates a virtual front-desk conversation where a patient shares intake details, symptoms, and scheduling preferences. The flow then guides the patient into booking an appointment, an FAQ section, and then concludes the screening process.

- `example-scenarios/sales-roleplay-training`  
  Runs an AI-powered sales roleplay where the avatar plays a specific named prospect across a discovery call — intro, discovery, pitch, objection handling, and close — so the sales rep can practice the full flow end-to-end.

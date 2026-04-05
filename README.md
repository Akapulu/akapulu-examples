# Akapulu Examples

<img src="logo.png" alt="Akapulu" width="72" />

Practical examples for building with Akapulu.

## File tree

```text
akapulu-examples/
  README.md

  fundamentals/
    prebuilt-ui/
    custom-ui/

  example-scenarios/
    healthcare-intake-scheduling/
```

## Examples

### fundamentals

- `fundamentals/prebuilt-ui`  
  Shows the prebuilt conversation UI path with both a minimal baseline and a styled variant. It also demonstrates post-call review with conversation details and recording retrieval.

- `fundamentals/custom-ui`  

  Shows a more customizable path using Akapulu hooks instead of the full prebuilt conversation component. This example gives you tighter control over layout, transcript rendering, and in-call controls.
### example-scenarios

- `example-scenarios/healthcare-intake-scheduling`  
  Simulates a virtual front-desk conversation where a patient shares intake details, symptoms, and scheduling preferences. The flow then guides the patient into booking an appointment, an FAQ section, and then concludes the screening process.

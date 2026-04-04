# Fix AI Token MaxSteps Compilation Error

## Background
During the token optimization process, I changed `stopWhen: stepCountIs(5)` to `maxSteps: 2` in `src/ai/actions/llm-action.ts` to reduce tool-calling overhead. However, the current version of the Vercel AI SDK being used does not support `maxSteps` inside `streamText`. This causes `npm run build` to fail with a TypeScript error.

## Objective
Revert `maxSteps` to `stopWhen` so that the code compiles successfully while maintaining the new tool-call limit of 2 steps.

## Plan
1. Change `maxSteps: 2` back to `stopWhen: stepCountIs(2)` in `src/ai/actions/llm-action.ts`.
2. Run `npm run build` to verify the type error is gone.
3. Commit the fix.
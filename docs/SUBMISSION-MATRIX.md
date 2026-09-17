# GenLayer Verifiable Consensus — Submission Matrix

This document is the source of truth for the current contribution submission. Every action exposed by the live dashboard is mapped to a checked-in Intelligent Contract method and an active GenLayer Testnet Bradbury deployment. The legacy prediction deployment `0x72f6BE503a8319A40515641536C1d74378623914` is intentionally excluded.

## Contract and action matrix

| Contract | Dashboard action | Checked-in source | Active deployment |
|---|---|---|---|
| Content Moderator | `moderate()` | `apps/content-moderator/contracts/moderator.py` — `@gl.public.write def moderate` | `0x235F51b11b9F96d6673df37553Ef58373c4324F9` |
| Content Moderator | `enforce()` | `apps/content-moderator/contracts/moderator.py` — `@gl.public.write def enforce` | `0x235F51b11b9F96d6673df37553Ef58373c4324F9` |
| Content Moderator | `appeal(note)` | `apps/content-moderator/contracts/moderator.py` — `@gl.public.write def appeal` | `0x235F51b11b9F96d6673df37553Ef58373c4324F9` |
| Content Moderator | `resolve_appeal()` | `apps/content-moderator/contracts/moderator.py` — `@gl.public.write def resolve_appeal` | `0x235F51b11b9F96d6673df37553Ef58373c4324F9` |
| Prediction Market | `stake(side)` payable | `apps/prediction-market/contracts/prediction_market.py` — `@gl.public.write.payable def stake` | `0x2dc09cDbb8319303eAc78E85D5d055BB53bdA6BE` and lifecycle proof `0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0` |
| Prediction Market | `resolve()` | `apps/prediction-market/contracts/prediction_market.py` — `@gl.public.write def resolve` | `0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0` |
| Prediction Market | `dispute(reason)` | `apps/prediction-market/contracts/prediction_market.py` — `@gl.public.write def dispute` | `0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0` |
| Prediction Market | `resolve_dispute()` | `apps/prediction-market/contracts/prediction_market.py` — `@gl.public.write def resolve_dispute` | `0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0` |
| Prediction Market | `settle()` | `apps/prediction-market/contracts/prediction_market.py` — `@gl.public.write def settle` | `0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0` |
| Prediction Market | `void()` | `apps/prediction-market/contracts/prediction_market.py` — `@gl.public.write def void` | `0x2dc09cDbb8319303eAc78E85D5d055BB53bdA6BE` |
| Prediction Market | `finalize()` | `apps/prediction-market/contracts/prediction_market.py` — `@gl.public.write def finalize` | `0x2dc09cDbb8319303eAc78E85D5d055BB53bdA6BE` |
| Prediction Market | `claim()` | `apps/prediction-market/contracts/prediction_market.py` — `@gl.public.write def claim` | `0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0` |
| Prediction Market | `refund()` | `apps/prediction-market/contracts/prediction_market.py` — `@gl.public.write def refund` | `0x2dc09cDbb8319303eAc78E85D5d055BB53bdA6BE` |
| Multi-Source Oracle | `update(key)` | `apps/multi-source-oracle/contracts/oracle.py` — `@gl.public.write def update` | `0x9bEcbdF8f3Cd6fABAeE5F737CE5B1B765ef9a1F5` |

The dashboard exposes these actions according to contract phase, deadline, wallet role, and caller position. It does not claim that all 14 buttons are visible at once. Content Moderator actions are phase- and role-gated; Prediction Market actions are lifecycle- and position-gated; Oracle update is available when a feed is registered.

## Accepted-receipt lifecycle

Every frontend write is routed through `src/lib/genlayer.ts`:

```text
writeContract()
  -> waitForTransactionReceipt(status = ACCEPTED)
  -> classify txExecutionResultName
  -> success only for FINISHED or FINISHED_WITH_RETURN
  -> only after success: refresh get_state / contract state
```

`FINISHED_WITH_ERROR`, `NOT_VOTED`, `UNDETERMINED`, `LEADER_TIMEOUT`, transport ambiguity, and unknown results are not treated as success. The dashboard does not optimistically refresh state for those outcomes. A pending hash may remain visible for Explorer verification, but it does not produce a false success state.

The main action panel is implemented in `src/components/actions-panel.tsx`. The AI Escrow route uses the same `sendWriteEx` receipt gate and refreshes only after `confirmed === true`.

## Evidence rules for the current submission

Use only the new repository URLs, the new live deployment URL, the active Bradbury addresses above, exact contract source-file URLs, and explorer transaction/address URLs that correspond to those deployments. Do not include the legacy `0x72f6...` address or links to the rejected contribution.

## Independent verification

```bash
npm ci
npm test
npx tsc --noEmit
npm run build
node tests/smoke.onchain.mjs
```

The current repository has passing unit tests, a clean TypeScript check, a successful static build, and live `get_state` smoke reads for Content Moderator, both Prediction Market deployments, and Multi-Source Oracle.

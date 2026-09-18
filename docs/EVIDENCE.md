# Evidence — every advertised action maps to source, deployment and a real transaction

This file is the verification pack for the steward review of the GenLayer Consensus Console
(Builder · Projects). It answers the two review points directly:

1. **Contract source for every advertised action** — each action below links the exact
   source file, the deployed contract address on Testnet Bradbury, and a real transaction
   on `explorer-bradbury.genlayer.com`.
2. **Accepted-receipt lifecycle** — the write path awaits an ACCEPTED receipt and verifies
   the execution result before refreshing state; see the lifecycle section at the bottom.

All transactions below were executed against GenLayer Testnet Bradbury and are publicly
verifiable by hash on the explorer.

---

## 1. Deployed contracts (Testnet Bradbury)

| Contract | Address | Source (repo path) | Explorer |
| --- | --- | --- | --- |
| Content Moderator | `0x235F51b11b9F96d6673df37553Ef58373c4324F9` | `apps/content-moderator/contracts/moderator.py` | [explorer](https://explorer-bradbury.genlayer.com/address/0x235F51b11b9F96d6673df37553Ef58373c4324F9) |
| Prediction Market **v2** (showcase, open) | `0x2dc09cDbb8319303eAc78E85D5d055BB53bdA6BE` | `apps/prediction-market/contracts/prediction_market.py` | [explorer](https://explorer-bradbury.genlayer.com/address/0x2dc09cDbb8319303eAc78E85D5d055BB53bdA6BE) |
| Prediction Market v2 (full-lifecycle proof, settled) | `0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0` | same contract | [explorer](https://explorer-bradbury.genlayer.com/address/0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0) |
| Prediction Market v2 (recovery proof, auto-voided) | `0x757FcC7A1b1aB857A3517F9afB5C062b87f21C80` | same contract | [explorer](https://explorer-bradbury.genlayer.com/address/0x757FcC7A1b1aB857A3517F9afB5C062b87f21C80) |
| Multi-Source Oracle (v2) | `0x9bEcbdF8f3Cd6fABAeE5F737CE5B1B765ef9a1F5` | `apps/multi-source-oracle/contracts/oracle.py` | [explorer](https://explorer-bradbury.genlayer.com/address/0x9bEcbdF8f3Cd6fABAeE5F737CE5B1B765ef9a1F5) |

Deployment transactions:

| Contract | Deploy tx |
| --- | --- |
| Content Moderator | [0xa05d3619563ce7ca31f01b34f3f82f89e868c4a4131d5896513339ec6f001867](https://explorer-bradbury.genlayer.com/tx/0xa05d3619563ce7ca31f01b34f3f82f89e868c4a4131d5896513339ec6f001867) |
| Prediction Market v2 (showcase) — parity-proven byte-for-byte, sha256 `451fd471…cea27` | [0xc5fa3809b13077d4bf215a37575b98f83259682a460ca0fd0bd23188ffb25a64](https://explorer-bradbury.genlayer.com/tx/0xc5fa3809b13077d4bf215a37575b98f83259682a460ca0fd0bd23188ffb25a64) |
| Multi-Source Oracle v2 (exact-value consensus, parity-proven) | [0x7d3a61d17b00b735fb5835c110a23efa41f7e7890d6a37d3fd81106ba674d974](https://explorer-bradbury.genlayer.com/tx/0x7d3a61d17b00b735fb5835c110a23efa41f7e7890d6a37d3fd81106ba674d974) |
| Oracle `register_feed` (btc_usd, 3 sources, v2) | [0xb73b05d0fbf5d7eecafe8f6bf09efba1b7fb2ea9d18a812f86db16a9c40fc8c7](https://explorer-bradbury.genlayer.com/tx/0xb73b05d0fbf5d7eecafe8f6bf09efba1b7fb2ea9d18a812f86db16a9c40fc8c7) |
| Oracle `update` (btc_usd, v2) | [0xa72ddb7d7784f64c697f0d59e1ca07c3451526cae18c5be801b107028c3fdf54](https://explorer-bradbury.genlayer.com/tx/0xa72ddb7d7784f64c697f0d59e1ca07c3451526cae18c5be801b107028c3fdf54) |
| Prediction Market v1 (superseded by v2) | [0xb7406f6a8788600e04d1a6bdc1200269f2665683c97b9d9e338450ca6a815063](https://explorer-bradbury.genlayer.com/tx/0xb7406f6a8788600e04d1a6bdc1200269f2665683c97b9d9e338450ca6a815063) |
| Multi-Source Oracle v1 (superseded) | [0x75446ed8583355ad8b6738d3e4e3d03296049fb7c3c1a05825d3e8979dc0d20c](https://explorer-bradbury.genlayer.com/tx/0x75446ed8583355ad8b6738d3e4e3d03296049fb7c3c1a05825d3e8979dc0d20c) |

---

## 2. Action → source → deployment → transaction matrix

### Content Moderator (`moderator.py`)

| Action | Source location | Deployed at | Proof tx | Result |
| --- | --- | --- | --- | --- |
| `moderate()` | `moderator.py` — `@gl.public.write def moderate` | `0x235F…24F9` | [0x2dfc5983…c0f06c](https://explorer-bradbury.genlayer.com/tx/0x2dfc598349349a8cc69cf774ff8c07d95bfc9de3399a9a75f9faea022fc0f06c) | REMOVE verdict (consensus) |
| `enforce()` | `moderator.py` — `@gl.public.write def enforce` | `0x235F…24F9` | [0x50cd9609…cb5bde4](https://explorer-bradbury.genlayer.com/tx/0x50cd96099418f555d91b4e4d27288902940a1b7793780bb96a50dc434cb5bde4) | blocked (enforced) |
| `appeal(note)` | `moderator.py` — `@gl.public.write def appeal` | `0x235F…24F9` | [0x8578d3e3…9652e79](https://explorer-bradbury.genlayer.com/tx/0x8578d3e39d485c106d7e33ea35aa74793b441545ca9be70f09a4227219652e79) | appeal recorded |
| `resolve_appeal()` | `moderator.py` — `@gl.public.write def resolve_appeal` | `0x235F…24F9` | [0x14fa4e5b…7e4513c5](https://explorer-bradbury.genlayer.com/tx/0x14fa4e5b4bfdd1eb488c31b2894391d5f65d2459e806112133f51c047e4513c5) | UPHELD (consensus) |
| `get_state()` (view) | `moderator.py` — `@gl.public.view def get_state` | `0x235F…24F9` | live read (see smoke test below) | reads OK |

### Prediction Market v2 (`prediction_market.py`)

> **Steward-review hardening (v2):** permissionless lifecycle (`resolve`,
> `resolve_dispute`, `settle`, `finalize` — no creator checks; `void` has an
> explicit empty-market/final-deadline safety gate) plus a hard
> `final_deadline` exit, and sources that are immutable from birth, multi-domain and
> semantically bound via verbatim binding excerpts re-verified deterministically on
> every node. Details: [`docs/REVIEW-RESPONSE.md`](./REVIEW-RESPONSE.md).
>
> **Parity proof (v2):** the deployed code at `0x2dc0…A6BE` was verified
> byte-for-byte against the repo source by `apps/prediction-market/verify.mjs`
> (26,499 bytes, sha256 `451fd471…cea27` on both sides,
> `apps/prediction-market/parity-proof.txt`).
>
> **Non-creator proof account:** `0x185810D655D9bf80641741343a59C737e356F805` —
> funded with a plain EVM transfer (chain 4221); every permissionless action below
> marked **[stranger]** was submitted by this account, which is not any market's
> creator. Its transactions are visible on each market's explorer page.

| Action | Source location | Deployed at | Proof tx | Result |
| --- | --- | --- | --- | --- |
| constructor — sources frozen at birth, ≥2 domains, binding excerpts, future deadlines | `prediction_market.py` — `__init__` | `0x2dc0…A6BE` | deploy tx above | FINISHED_WITH_RETURN; `config_freeze` history event, `frozen_config_hash` set |
| constructor — single-domain sources rejected | same | validation market | [0x? — see `test-payable-results.txt` V1] | FINISHED_WITH_ERROR (expected reject) |
| constructor — missing binding excerpt rejected | same | validation market | [see `test-payable-results.txt` V2] | FINISHED_WITH_ERROR (expected reject) |
| `stake(side)` — payable, positive value, inside window | `prediction_market.py` — `@gl.public.write.payable def stake` | `0x390C…8ba0` (lifecycle market) | [market tx history](https://explorer-bradbury.genlayer.com/address/0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0) | FINISHED_WITH_RETURN, position + `staking_started` |
| `stake` — zero value rejected | same | `0x5802…09F3` (market A) | [0x8cd315bd…26b6d836](https://explorer-bradbury.genlayer.com/tx/0x8cd315bd696942a525498d65a5716c3d9dd6c3d70f172a579ce29eee26b6d836) | FINISHED_WITH_ERROR (expected reject) |
| `stake` — after `staking_deadline` rejected | same | market C | [0x5a099cc9…3eddff](https://explorer-bradbury.genlayer.com/tx/0x5a099cc9d72e99ac41b2c09257d27fcb12671023e224c261138aba10a03eddff) | FINISHED_WITH_ERROR (expected reject) |
| `resolve()` **[stranger]** — permissionless, after staking deadline, binding-verified evidence | `prediction_market.py` — `@gl.public.write def resolve` | `0x390C…8ba0` | [market tx history](https://explorer-bradbury.genlayer.com/address/0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0) | FINISHED_WITH_RETURN, outcome YES → `dispute_window`, window armed |
| `resolve()` — before staking deadline rejected | same | `0x5802…09F3` | [0x469a9ecd…99694f6](https://explorer-bradbury.genlayer.com/tx/0x469a9ecd96054cf83d5cf2a33b91dbe9621c6a3c247f31b96adbb64e999694f6) | FINISHED_WITH_ERROR (expected reject) |
| `resolve()` — with no stakers rejected | same | `0xc29e…650e` (market G) | [0xf2de64dc…e2942b7d](https://explorer-bradbury.genlayer.com/tx/0xf2de64dc9bfa1de6191eb8b8ca123738408cc9f041932d2407ad9ae3e2942b7d) | FINISHED_WITH_ERROR (expected reject) |
| `dispute(reason)` — staker only, inside window | `prediction_market.py` — `@gl.public.write def dispute` | `0x390C…8ba0` | market tx history | disputed; settle blocked while open |
| `dispute` — before resolve rejected | same | `0xc29e…650e` | [0x3334f92e…eca9035](https://explorer-bradbury.genlayer.com/tx/0x3334f92e46aa4ee9a8262df6ca05a4c293c86cee95addeb07e7d44aeca9035) | FINISHED_WITH_ERROR (expected reject) |
| `settle()` — during dispute window rejected | `prediction_market.py` — `@gl.public.write def settle` | `0x390C…8ba0` | [0xbd6ea4bf…bc374009](https://explorer-bradbury.genlayer.com/tx/0xbd6ea4bf7f21189bb8c6db9e46c00d55ae03dba9e6e667d8af1e1109bc374009) | FINISHED_WITH_ERROR (expected reject) |
| `resolve_dispute()` **[stranger]** | `prediction_market.py` — `@gl.public.write def resolve_dispute` | `0x390C…8ba0` | market tx history | `dispute_resolved`, UPHELD/OVERTURNED recorded, fresh window |
| `settle()` **[stranger]** — after window | `prediction_market.py` — `@gl.public.write def settle` | `0x390C…8ba0` | market tx history | `settled`, winning side YES |
| `settle()` **[stranger]** — empty winning side → auto-void | same | `0x757F…1C80` (recovery market) | [0x2f80b474…207c8a](https://explorer-bradbury.genlayer.com/tx/0x2f80b47424e381fcd1db255f3056a75b2635e8d641803cc5d5c3b5f847207c8a) | `voided / winning_side_empty`, refunds open |
| `finalize()` **[stranger]** — permissionless hard exit after `final_deadline` | `prediction_market.py` — `@gl.public.write def finalize` | market C | [see `test-payable-results.txt` C3] | `voided / deadline_void` by a NON-creator account |
| `finalize()` — before final deadline rejected | same | `0x5802…09F3` | [0xc4470b9f…003314f](https://explorer-bradbury.genlayer.com/tx/0xc4470b9f909b775bca845e0095be03cd2a6b4579fd67fe113a600e9c1003314f) | FINISHED_WITH_ERROR (expected reject) |
| `claim()` — winner payout 1:1 (single staker) | `prediction_market.py` — `@gl.public.write def claim` | `0x390C…8ba0` | market tx history | claim recorded, payout = stake |
| `claim()` — double claim rejected | same | `0x390C…8ba0` | [0x34e65cc0…6b44eeb](https://explorer-bradbury.genlayer.com/tx/0x34e65cc08b9afd4b95e0e3c94d93d84bb70fe24fb22918e7c3a7f4e826b44eeb) | FINISHED_WITH_ERROR (expected reject) |
| `claim()` — before settle rejected | same | `0xc29e…650e` | [0x235d3339…4210f5](https://explorer-bradbury.genlayer.com/tx/0x235d333978ee64393987569ea79ed31cf89590a257b01f247a239fe8004210f5) | FINISHED_WITH_ERROR (expected reject) |
| `refund()` — 1:1 after deadline_void / auto-void | `prediction_market.py` — `@gl.public.write def refund` | `0x757F…1C80` | [0x4532c015…5db32125](https://explorer-bradbury.genlayer.com/tx/0x4532c015374dd5bd7c43f7be75de3eb1121edca3155a44258151b26f5db32125) | FINISHED_WITH_RETURN, refund = stake |
| `refund()` — double refund rejected | same | market C | [0x9e360c59…f6b5635](https://explorer-bradbury.genlayer.com/tx/0x9e360c599e0bf734a721789f495307c0460480e05b4997407ed98b1b4f6b5635) | FINISHED_WITH_ERROR (expected reject) |
| `get_state()` (view) | `prediction_market.py` — `@gl.public.view def get_state` | `0x2dc0…A6BE` | live read (smoke test) | reads OK |

Test-result artifacts (committed): `apps/prediction-market/test-payable-results.txt`
(deterministic suite, 20/20), `apps/prediction-market/test-results.txt` (AI lifecycle,
19/19 consolidated), `apps/prediction-market/sim_market.py` (offline simulation, 56/56,
including premature funded-market void rejection),
`apps/prediction-market/parity-proof.txt` (deploy parity).

### Multi-Source Oracle (`oracle.py`)

> **Parity proof (v2):** the deployed code at `0x9bEc…a1F5` was verified
> byte-for-byte against the repo source by `apps/multi-source-oracle/verify-relay.mjs`
> (browser QUIC relay → `ConsensusData.getTransactionData` → RLP-decode of the
> deploy calldata): 14,343 bytes, sha256 `1324409e…d64f5` on both sides.
> The same check previously proved the superseded v1 instance (`0x2Ab5…2C82`,
> 11,895 bytes) did not match the v2 source.

| Action | Source location | Deployed at | Proof tx | Result |
| --- | --- | --- | --- | --- |
| `update(key)` | `oracle.py` — `@gl.public.write def update` | `0x9bEc…a1F5` (v2) | [0xa72ddb7d…c3fdf54](https://explorer-bradbury.genlayer.com/tx/0xa72ddb7d7784f64c697f0d59e1ca07c3451526cae18c5be801b107028c3fdf54) | FINISHED_WITH_RETURN; btc_usd median 79,626.00 from 3/3 sources, spread 1 bps (exact-value consensus) |
| `register_feed(...)` | `oracle.py` — `@gl.public.write def register_feed` | `0x9bEc…a1F5` (v2) | [0xb73b05d0…40fc8c7](https://explorer-bradbury.genlayer.com/tx/0xb73b05d0fbf5d7eecafe8f6bf09efba1b7fb2ea9d18a812f86db16a9c40fc8c7) | feed registered |
| `get_state()` / `get(key)` (views) | `oracle.py` — `@gl.public.view` | `0x9bEc…a1F5` (v2) | live read (smoke test) | reads OK |

---

## 3. Accepted-receipt lifecycle (review point 2)

The single write path used by every action in the dApp (`src/lib/genlayer.ts`):

1. `writeContract({ address, functionName, args, value })` — submit.
2. `await waitForTransactionReceipt({ hash, status: TransactionStatus.ACCEPTED, interval: 3000, retries: 8 })`
   — confirmed via the direct RPC read client, never the wallet provider.
3. Verify the execution result against a strict allowlist: success is **only**
   `FINISHED` or `FINISHED_WITH_RETURN` (`SUCCESS_RESULTS` / `classifyExecution`).
   `FINISHED_WITH_ERROR`, `NOT_VOTED`, `UNDETERMINED`, `LEADER_TIMEOUT` and any other
   result are failures surfaced as errors in the UI with the tx hash preserved.
4. Only after a confirmed, successful receipt does the UI re-read `get_state`
   (`stateStatus: "accepted"`).

Unit tests covering the gate: `src/lib/genlayer.test.ts` (`classifyExecution` success /
failure / pending) and `src/lib/actions.test.ts` (`parseStakeWei`, `stake.validate`,
`stake.value` — zero/negative/fractional amounts never reach `writeContract`).

On-chain proof that the gate matches reality:

- A zero-value `stake` fails on-chain with `FINISHED_WITH_ERROR` and the UI reports it as
  a failure: [tx 0x397f21e1…](https://explorer-bradbury.genlayer.com/tx/0x397f21e174d5b59170c40108f4cc56ea842857c1b15cc21a39ee031d6af894df)
- A valid payable `stake` returns `FINISHED_WITH_RETURN` and only then refreshes state:
  [tx 0x90253b29…](https://explorer-bradbury.genlayer.com/tx/0x90253b2970cd2d2ff0fd7b2451305b28af42590733969684d05e00f0e3311485)

## 4. How to verify independently

```bash
npm ci
npm test                 # 91/91 unit tests (no mocks)
npm run build            # production build
node tests/smoke.onchain.mjs   # live get_state reads from all three deployed contracts
```

Read any contract state directly (no wallet needed):

```js
import { createClient } from "genlayer-js"
import { testnetBradbury } from "genlayer-js/chains"
const client = createClient({ chain: testnetBradbury })
const state = await client.readContract({
  address: "0x2dc09cDbb8319303eAc78E85D5d055BB53bdA6BE",
  functionName: "get_state",
  args: [],
})
console.log(state)
```

Note on `genlayer schema`: `gen_getContractSchema` on Bradbury currently returns
`VMError: invalid_contract absent_runner_comment`, so machine-readable schemas cannot be
attached; action-to-source parity is proven by the committed contract sources plus the
real on-chain executions listed above.

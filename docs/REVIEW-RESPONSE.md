# Review response — submission bb930d5e (GenLayer Consensus Console)

Steward request (Pavel Kolosov, Sep 6, 2026):

> "The main thing holding this back is that prediction-market funds can remain locked
> if the creator stops progressing the lifecycle, while source authority remains
> creator-controlled. For a stronger version, add permissionless deadline-based
> resolution or refunds and enforce independent, semantically bound evidence sources."

Both points are fully addressed in **Prediction Market v2**
([`apps/prediction-market/contracts/prediction_market.py`](../apps/prediction-market/contracts/prediction_market.py)),
redeployed, re-tested on-chain and moved to this repository. Full evidence pack:
[`docs/EVIDENCE.md`](./EVIDENCE.md).

## Point 1 — funds can never lock: permissionless lifecycle + hard deadline exit

The v2 contract removes **every creator check from the lifecycle**:

| Action | v1 | v2 |
| --- | --- | --- |
| `resolve()` | creator only | **anyone** (after `staking_deadline`, with ≥1 staker) |
| `resolve_dispute()` | creator only | **anyone** |
| `settle()` | creator only | **anyone** (after the dispute window closes) |
| `void()` | creator only | **anyone with a safety gate**: empty unresolved markets before the deadline, or funded unresolved markets only after `final_deadline` |
| `finalize()` | did not exist | **anyone** — new permissionless hard exit |
| `stake()` / `claim()` / `refund()` / `dispute()` | already permissionless / staker-gated | unchanged |

Deadlines make the guarantee absolute:

- `staking_deadline` (set at creation, future-validated) bounds trading;
- `final_deadline` (also creation-time, must be after `staking_deadline`) bounds the
  whole market: once it passes, **any account** can call `finalize()`, which always
  finishes the market — settling (paying the winners) when a definite outcome survived
  its dispute window, otherwise voiding it (`void_reason = "deadline_void"`) so every
  participant can refund 1:1. Fail-safe by construction: no state of the world keeps a
  staker locked past `final_deadline`, and a contested outcome never pays anyone —
  it refunds everyone.

On-chain proof (all executed by **`0x185810D655D9bf80641741343a59C737e356F805`, an
account that is NOT the market creator**, funded with a plain EVM transfer so its
transactions are independently attributable):

- Full lifecycle market `0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0`:
  history `config_freeze → first_stake → initial → dispute → resolve_dispute → settle → claim`,
  where **resolve, resolve_dispute and settle were all called by the non-creator
  account** and the claim paid 1:1 (single staker). Final state: `settled`,
  outcome YES, binding-verified evidence.
- Deterministic suite (`test-payable-results.txt`, 20/20): `finalize()` **called by the
  non-creator account** after `final_deadline` → `voided / deadline_void` → the staker
  refunded 1:1 → double refund reverted. Also verified on-chain: staking-window gates
  (stake accepted before the deadline, rejected after), resolve-before-deadline and
  finalize-before-deadline reverts.
- Offline simulation (`sim_market.py`, 54/54): T5/T10/T11/T16–T18 drive the permissionless
  flows with an explicitly non-creator `STRANGER` address, including the fail-safe
  branch (definite outcome + still-open dispute window at `final_deadline` → void +
  refunds, no misallocation) and settle-or-void preference.

## Point 2 — sources: immutable from birth, independent, semantically bound

v1 let the creator `add_source` until the first stake — creator-controlled evidence
authority. v2 removes that authority entirely:

1. **Immutable from birth.** `add_source` no longer exists. The source set, question,
   rules and bindings are fixed in the constructor and hash-frozen
   (`frozen_config_hash`, `config_freeze` history event at creation, before any stake).
   Nothing about the evidence can change after deployment.
2. **Structurally independent.** The constructor enforces ≥ 2 sources from ≥ 2
   **different registrable domains** (deterministic last-two-host-labels comparison —
   pure string logic, identical on every node, conservatively strict: subdomains of the
   same site never count as independent). Single-domain creation is rejected on-chain
   (verified: `test-payable-results.txt` V1).
3. **Semantically bound.** Every source must carry a **binding excerpt** — a verbatim
   8..400-char quote anchoring that source to the market question. During resolution
   every node re-fetches the source and deterministically verifies that the
   whitespace-normalized excerpt appears verbatim in the rendered page (pure substring
   check, no tolerance). Sources that fail the check — or fail to load — are **excluded
   from the evidence** the resolver model may use; the model sees them marked EXCLUDED
   and is instructed to ignore them. The model never decides which evidence is
   admissible: the deterministic binding check does, identically on every node.
   Missing binding excerpts are rejected at creation (verified on-chain: V2).

On-chain proof:

- The showcase market `0x2dc09cDbb8319303eAc78E85D5d055BB53bdA6BE`
  ("Does HTCPCP define HTTP status code 418 as 'I'm a teapot'?") uses
  `https://www.rfc-editor.org/rfc/rfc2324.txt` and the Wikipedia HTCPCP article — two
  registrable domains — each with a verbatim binding excerpt from the actual GenVM
  text render.
- The lifecycle market resolved **YES from binding-verified admissible evidence**
  (resolve executed by the non-creator account), demonstrating the binding checks pass
  on real renders across all validators.
- The simulation attacks the mechanism directly: a tampered/absent excerpt excludes the
  source (T6); one failing + one passing binding yields an outcome from the admissible
  source only (T7); leader/validator divergence on the binding check fails consensus
  with no state change and no money moved (T8).

## What stayed strong from v1

- Comparative-equivalence consensus over web evidence with prompt-injection defenses
  (untrusted source text and dispute notes).
- Mandatory time-based dispute window, bounded disputes (max 2), UPHELD/OVERTURNED
  audit trail, parimutuel payouts, single-use claims/refunds.
- Exact-value validator binding in the Multi-Source Oracle (unchanged).
- Receipt-verified write path (`classifyExecution` allowlist) — steward point 2 of the
  previous review, still enforced and unit-tested.

## Verification

```bash
npm test                                   # 91/91 unit tests
npx tsc --noEmit                           # clean
npm run build                              # passes
python apps/prediction-market/sim_market.py        # 54/54 offline checks
node apps/prediction-market/verify.mjs     # byte-for-byte deploy parity (sha256)
node tests/smoke.onchain.mjs               # live reads of all deployed contracts
```

Deploy parity: the v2 market deployed at `0x2dc09cDbb8319303eAc78E85D5d055BB53bdA6BE`
(deploy tx
[0xc5fa…5a64](https://explorer-bradbury.genlayer.com/tx/0xc5fa3809b13077d4bf215a37575b98f83259682a460ca0fd0bd23188ffb25a64))
is proven byte-for-byte identical to the repository source (sha256
`451fd471…cea27`, see `apps/prediction-market/parity-proof.txt`).

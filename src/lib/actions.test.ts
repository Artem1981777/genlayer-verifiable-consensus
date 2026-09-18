import { describe, it, expect } from "vitest"
import { ACTIONS, canDo, whyNot, visibleActions, isCreator, isAuthor, hasStake, winningStake, alreadyClaimed, alreadyRefunded, disputeRounds, disputeDeadline, disputeWindowSeconds, disputeWindowOpen, disputeWindowRemaining, frozenSources, sourcesFrozen, voidReasonLabel, canVoid, stakingDeadline, finalDeadline, stakingOpen, stakingRemaining, canFinalize } from "./actions"
const NOW = () => Math.floor(Date.now() / 1000)
const futureDeadline = (sec = 3600) => NOW() + sec
const pastDeadline = (sec = 3600) => NOW() - sec
const CREATOR = "0x198a1952BD58984281f57CF824d264cdbd412814"
const AUTHOR = "0xB596E244aabBccDDeeFF00112233445566778899"
const JUDGE = "0xdc6778C5F8cC74b10aED11c48306D4Cfc5737FBD"
const V = (p: string, st: any, acct?: string | null) => visibleActions(p, st, acct).map((a) => a.fn).sort()
const posOf = (m: any) => JSON.stringify(m)
const disputes = (n: number) => JSON.stringify(Array.from({ length: n }, (_, i) => ({ round: i + 1, kind: "dispute" })))
const PM = ACTIONS.prediction
const find = (fn: string) => PM.find((a) => a.fn === fn)!
const cases: Array<[string, string, any, string | null, string[]]> = [
  // ---- v2: the market lifecycle is PERMISSIONLESS (no creator-only actions),
  // sources are immutable from creation (no add_source), stake/resolve/finalize
  // are deadline-gated. ----
  ["pred non-creator open", "prediction", { status: "open", creator: CREATOR }, JUDGE, ["stake", "void"]],
  ["pred creator open (same as anyone)", "prediction", { status: "open", creator: CREATOR }, CREATOR, ["stake", "void"]],
  ["pred open staking deadline passed without stakers", "prediction", { status: "open", creator: CREATOR, staking_deadline: pastDeadline() }, JUDGE, ["void"]],
  ["pred open stakers + deadline passed: ANYONE may resolve", "prediction", { status: "open", creator: CREATOR, staking_started: true, staking_deadline: pastDeadline() }, JUDGE, ["resolve", "void"]],
  ["pred open stakers + deadline future: resolve waits", "prediction", { status: "open", creator: CREATOR, staking_started: true, staking_deadline: futureDeadline() }, JUDGE, ["stake", "void"]],
  ["pred open staking closed: stake hidden", "prediction", { status: "open", creator: CREATOR, staking_deadline: pastDeadline() }, JUDGE, ["void"]],
  ["pred dispute_window non-participant", "prediction", { status: "dispute_window", outcome: "YES", dispute_deadline: futureDeadline(), creator: CREATOR }, JUDGE, []],
  ["pred dispute_window participant", "prediction", { status: "dispute_window", outcome: "YES", dispute_deadline: futureDeadline(), creator: CREATOR, positions: posOf({ [JUDGE]: { YES: 100, NO: 0 } }) }, JUDGE, ["dispute"]],
  ["pred dispute_window dispute-limit", "prediction", { status: "dispute_window", outcome: "YES", dispute_deadline: futureDeadline(), creator: CREATOR, positions: posOf({ [JUDGE]: { YES: 100, NO: 0 } }), history: disputes(2) }, JUDGE, []],
  ["pred dispute_window closed participant", "prediction", { status: "dispute_window", outcome: "YES", dispute_deadline: pastDeadline(), creator: CREATOR, positions: posOf({ [JUDGE]: { YES: 100, NO: 0 } }) }, JUDGE, ["settle"]],
  ["pred dispute_window closed: ANYONE may settle", "prediction", { status: "dispute_window", outcome: "YES", dispute_deadline: pastDeadline(), creator: CREATOR }, JUDGE, ["settle"]],
  ["pred dispute_window open creator cannot settle", "prediction", { status: "dispute_window", outcome: "YES", dispute_deadline: futureDeadline(), creator: CREATOR }, CREATOR, []],
  ["pred dispute_resolved fresh window participant", "prediction", { status: "dispute_resolved", outcome: "NO", dispute_deadline: futureDeadline(), creator: CREATOR, positions: posOf({ [JUDGE]: { YES: 0, NO: 40 } }), history: disputes(1) }, JUDGE, ["dispute"]],
  ["pred dispute_resolved closed anyone settles", "prediction", { status: "dispute_resolved", outcome: "NO", dispute_deadline: pastDeadline(), creator: CREATOR }, JUDGE, ["settle"]],
  ["pred disputed: ANYONE may resolve the dispute", "prediction", { status: "disputed", outcome: "YES", creator: CREATOR }, JUDGE, ["resolve_dispute"]],
  ["pred disputed creator", "prediction", { status: "disputed", outcome: "YES", creator: CREATOR }, CREATOR, ["resolve_dispute"]],
  ["pred dispute_window UNRESOLVED outcome cannot settle", "prediction", { status: "dispute_window", outcome: "UNRESOLVED", dispute_deadline: pastDeadline(), creator: CREATOR }, CREATOR, ["void"]],
  // ---- finalize: the permissionless hard-deadline exit ----
  ["pred funded open before final deadline: no premature void", "prediction", { status: "open", creator: CREATOR, total_pool: 100, final_deadline: futureDeadline() }, JUDGE, ["stake"]],
  ["pred empty open after final deadline: ANYONE may finalize or void", "prediction", { status: "open", creator: CREATOR, staking_deadline: pastDeadline(), final_deadline: pastDeadline(), total_pool: 0 }, JUDGE, ["finalize", "void"]],
  ["pred dispute_window after final deadline: settle + finalize", "prediction", { status: "dispute_window", outcome: "YES", dispute_deadline: pastDeadline(), final_deadline: pastDeadline(), creator: CREATOR }, JUDGE, ["finalize", "settle"]],
  ["pred settled after final deadline: finalize hidden", "prediction", { status: "settled", creator: CREATOR, winning_side: "YES", final_deadline: pastDeadline() }, JUDGE, []],
  ["pred settled winner unclaimed", "prediction", { status: "settled", creator: CREATOR, winning_side: "YES", positions: posOf({ [JUDGE]: { YES: 100, NO: 0 } }) }, JUDGE, ["claim"]],
  ["pred settled winner claimed", "prediction", { status: "settled", creator: CREATOR, winning_side: "YES", positions: posOf({ [JUDGE]: { YES: 100, NO: 0 } }), claims: posOf({ [JUDGE]: { claimed: true } }) }, JUDGE, []],
  ["pred settled loser", "prediction", { status: "settled", creator: CREATOR, winning_side: "YES", positions: posOf({ [JUDGE]: { YES: 0, NO: 100 } }) }, JUDGE, []],
  ["pred settled non-participant", "prediction", { status: "settled", creator: CREATOR, winning_side: "YES" }, JUDGE, []],
  ["pred voided participant", "prediction", { status: "voided", creator: CREATOR, positions: posOf({ [JUDGE]: { YES: 0, NO: 80 } }) }, JUDGE, ["refund"]],
  ["pred voided refunded", "prediction", { status: "voided", creator: CREATOR, positions: posOf({ [JUDGE]: { YES: 0, NO: 80 } }), claims: posOf({ [JUDGE]: { claimed: true } }) }, JUDGE, []],
  ["pred voided non-participant", "prediction", { status: "voided", creator: CREATOR }, JUDGE, []],
  ["mod pending any", "moderator", { status: "pending", creator: CREATOR, author: CREATOR }, JUDGE, ["moderate"]],
  ["mod moderated creator", "moderator", { status: "moderated", creator: CREATOR, author: AUTHOR }, CREATOR, ["enforce"]],
  ["mod moderated judge", "moderator", { status: "moderated", creator: CREATOR, author: AUTHOR }, JUDGE, []],
  ["mod enforced author REMOVE", "moderator", { status: "enforced", verdict: "REMOVE", creator: CREATOR, author: AUTHOR }, AUTHOR, ["appeal"]],
  ["mod enforced author ALLOW", "moderator", { status: "enforced", verdict: "ALLOW", creator: CREATOR, author: AUTHOR }, AUTHOR, []],
  ["mod enforced judge", "moderator", { status: "enforced", verdict: "REMOVE", creator: CREATOR, author: AUTHOR }, JUDGE, []],
  ["mod appealed creator", "moderator", { status: "appealed", creator: CREATOR, author: AUTHOR }, CREATOR, ["resolve_appeal"]],
  ["mod resolved terminal", "moderator", { status: "resolved", verdict: "REMOVE", creator: CREATOR, author: AUTHOR }, JUDGE, []],
  ["oracle feeds", "oracle", { feeds: JSON.stringify({ btc_usd: {} }) }, JUDGE, ["update"]],
  ["oracle empty feeds", "oracle", { feeds: "{}" }, JUDGE, []],
  ["oracle no feeds", "oracle", {}, JUDGE, []],
  ["oracle bad json", "oracle", { feeds: "not json" }, JUDGE, []],
]
describe("role/phase/precondition action visibility", () => {
  for (const [name, proj, st, acct, expected] of cases) {
    it(name, () => { expect(V(proj, st, acct)).toEqual([...expected].sort()) })
  }
})
describe("precise whyNot reasons for per-caller gating", () => {
  it("claim no winning stake", () => { expect(whyNot(find("claim"), { status: "settled", winning_side: "YES" }, JUDGE)).toBe("No winning stake to claim") })
  it("claim already claimed", () => { expect(whyNot(find("claim"), { status: "settled", winning_side: "YES", positions: posOf({ [JUDGE]: { YES: 10, NO: 0 } }), claims: posOf({ [JUDGE]: { claimed: true } }) }, JUDGE)).toBe("Already claimed") })
  it("dispute non-participant", () => { expect(whyNot(find("dispute"), { status: "dispute_window", dispute_deadline: futureDeadline() }, JUDGE)).toBe("Only a participant who staked this market can dispute") })
  it("dispute limit", () => { expect(whyNot(find("dispute"), { status: "dispute_window", dispute_deadline: futureDeadline(), positions: posOf({ [JUDGE]: { YES: 5, NO: 0 } }), history: disputes(2) }, JUDGE)).toBe("Dispute limit reached (max 2) for this market") })
  it("dispute window closed", () => { expect(whyNot(find("dispute"), { status: "dispute_window", dispute_deadline: pastDeadline(), positions: posOf({ [JUDGE]: { YES: 5, NO: 0 } }) }, JUDGE)).toBe("Dispute window has closed; the resolved outcome is final") })
  it("settle while window open", () => { expect(whyNot(find("settle"), { status: "dispute_window", outcome: "YES", dispute_deadline: futureDeadline(), creator: CREATOR }, CREATOR)).toBe("Dispute window is still open; settlement unlocks after the deadline") })
  it("refund nothing", () => { expect(whyNot(find("refund"), { status: "voided" }, JUDGE)).toBe("Nothing to refund") })
  it("void definite outcome", () => { expect(whyNot(find("void"), { status: "open", creator: CREATOR, outcome: "YES" }, CREATOR)).toBe("Cannot void a market with a definite YES/NO outcome; settle it instead") })
  it("resolve needs stakers", () => { expect(whyNot(find("resolve"), { status: "open", creator: CREATOR }, JUDGE)).toBe("Nobody has staked this market yet") })
  it("resolve waits for staking deadline", () => { expect(whyNot(find("resolve"), { status: "open", creator: CREATOR, staking_started: true, staking_deadline: futureDeadline() }, JUDGE)).toBe("Resolution opens after the staking deadline") })
  it("stake closed after deadline", () => { expect(whyNot(find("stake"), { status: "open", creator: CREATOR, staking_deadline: pastDeadline() }, JUDGE)).toBe("Staking deadline has passed; the market is closed for trading") })
  it("finalize before final deadline", () => { expect(whyNot(find("finalize"), { status: "open", creator: CREATOR, final_deadline: futureDeadline() }, JUDGE)).toBe("Final deadline has not passed yet") })
  it("wrong-phase message", () => { expect(whyNot(find("claim"), { status: "open", creator: CREATOR }, JUDGE)).toBe("Not available in the current phase") })
  it("creator-only message (moderator enforce)", () => { expect(whyNot(ACTIONS.moderator.find((a) => a.fn === "enforce")!, { status: "moderated", creator: CREATOR }, JUDGE)).toBe("Only the market creator can do this") })
})
describe("dispute-window helpers", () => {
  it("deadline + window seconds parsing", () => {
    expect(disputeDeadline({ dispute_deadline: 1750000000 })).toBe(1750000000)
    expect(disputeDeadline({})).toBe(0)
    expect(disputeWindowSeconds({ dispute_window_seconds: 600 })).toBe(600)
    expect(disputeWindowSeconds({ dispute_window_seconds: -5 })).toBe(0)
  })
  it("window open/closed by status and deadline", () => {
    const now = NOW()
    expect(disputeWindowOpen({ status: "dispute_window", dispute_deadline: now + 100 }, now)).toBe(true)
    expect(disputeWindowOpen({ status: "dispute_resolved", dispute_deadline: now + 100 }, now)).toBe(true)
    expect(disputeWindowOpen({ status: "dispute_window", dispute_deadline: now - 100 }, now)).toBe(false)
    expect(disputeWindowOpen({ status: "dispute_window", dispute_deadline: now }, now)).toBe(false)
    expect(disputeWindowOpen({ status: "open", dispute_deadline: now + 100 }, now)).toBe(false)
    expect(disputeWindowOpen({ status: "dispute_window" }, now)).toBe(false)
  })
  it("remaining seconds bounded", () => {
    const now = NOW()
    expect(disputeWindowRemaining({ status: "dispute_window", dispute_deadline: now + 90 }, now)).toBe(90)
    expect(disputeWindowRemaining({ status: "dispute_window", dispute_deadline: now - 90 }, now)).toBe(0)
  })
})
describe("market deadline helpers (v2 staking/final)", () => {
  it("stakingDeadline / finalDeadline parsing", () => {
    expect(stakingDeadline({ staking_deadline: 1750000000 })).toBe(1750000000)
    expect(stakingDeadline({})).toBe(0)
    expect(finalDeadline({ final_deadline: 1750000900 })).toBe(1750000900)
    expect(finalDeadline({})).toBe(0)
  })
  it("stakingOpen: default open when no deadline recorded (legacy markets)", () => {
    const now = NOW()
    expect(stakingOpen({ status: "open" }, now)).toBe(true)
    expect(stakingOpen({ status: "open", staking_deadline: now + 60 }, now)).toBe(true)
    expect(stakingOpen({ status: "open", staking_deadline: now - 60 }, now)).toBe(false)
    expect(stakingOpen({ status: "dispute_window", staking_deadline: now + 60 }, now)).toBe(false)
  })
  it("stakingRemaining bounded", () => {
    const now = NOW()
    expect(stakingRemaining({ status: "open", staking_deadline: now + 45 }, now)).toBe(45)
    expect(stakingRemaining({ status: "open", staking_deadline: now - 45 }, now)).toBe(0)
  })
  it("canFinalize only after the final deadline and before terminal states", () => {
    const now = NOW()
    expect(canFinalize({ status: "open", final_deadline: now - 1 }, now)).toBe(true)
    expect(canFinalize({ status: "disputed", final_deadline: now - 1 }, now)).toBe(true)
    expect(canFinalize({ status: "open", final_deadline: now + 1 }, now)).toBe(false)
    expect(canFinalize({ status: "open" }, now)).toBe(false)
    expect(canFinalize({ status: "settled", final_deadline: now - 1 }, now)).toBe(false)
    expect(canFinalize({ status: "voided", final_deadline: now - 1 }, now)).toBe(false)
  })
})
describe("freeze + void helpers", () => {
  it("frozenSources parses JSON array of strings", () => {
    expect(frozenSources({ frozen_sources: JSON.stringify(["https://a.example", "https://b.example"]) })).toEqual(["https://a.example", "https://b.example"])
    expect(frozenSources({ frozen_sources: "not json" })).toEqual([])
    expect(frozenSources({})).toEqual([])
  })
  it("sourcesFrozen strict boolean", () => {
    expect(sourcesFrozen({ sources_frozen: true })).toBe(true)
    expect(sourcesFrozen({ sources_frozen: "true" })).toBe(false)
    expect(sourcesFrozen({})).toBe(false)
  })
  it("voidReasonLabel maps on-chain reasons (v1 + v2)", () => {
    expect(voidReasonLabel({ status: "voided", void_reason: "winning_side_empty" })).toMatch(/nobody backed the winning side/i)
    expect(voidReasonLabel({ status: "voided", void_reason: "creator_void" })).toMatch(/voided by the creator/i)
    expect(voidReasonLabel({ status: "voided", void_reason: "deadline_void" })).toMatch(/permissionless final deadline/i)
    expect(voidReasonLabel({ status: "voided", void_reason: "permissionless_void" })).toMatch(/permissionless/i)
    expect(voidReasonLabel({ status: "voided" })).toMatch(/voided, refunds are open/i)
    expect(voidReasonLabel({ status: "settled" })).toBe("")
  })
  it("canVoid allows empty unresolved markets but blocks funded markets before final deadline", () => {
    expect(canVoid({ status: "open", outcome: "" })).toBe(true)
    expect(canVoid({ status: "open", outcome: "UNRESOLVED" })).toBe(true)
    expect(canVoid({ status: "dispute_window", outcome: "UNRESOLVED" })).toBe(true)
    expect(canVoid({ status: "open", outcome: "UNRESOLVED", total_pool: 100, final_deadline: 200 }, 199)).toBe(false)
    expect(canVoid({ status: "open", outcome: "UNRESOLVED", total_pool: 100, final_deadline: 200 }, 200)).toBe(true)
    expect(canVoid({ status: "open", outcome: "YES" })).toBe(false)
    expect(canVoid({ status: "settled", outcome: "YES" })).toBe(false)
  })
})
describe("identity + helpers", () => {
  it("identity case-insensitive", () => { expect(isCreator({ creator: CREATOR }, CREATOR.toLowerCase())).toBe(true); expect(isAuthor({ author: AUTHOR }, AUTHOR.toUpperCase())).toBe(true) })
  it("stake/winning/claimed/disputeRounds helpers", () => {
    const st = { winning_side: "NO", positions: posOf({ [JUDGE]: { YES: 0, NO: 30 } }), claims: posOf({ [JUDGE]: { claimed: true } }), history: disputes(1) }
    expect(hasStake(st, JUDGE)).toBe(true); expect(winningStake(st, JUDGE)).toBe(30); expect(alreadyClaimed(st, JUDGE)).toBe(true); expect(disputeRounds(st)).toBe(1)
  })
  it("canDo composition", () => {
    const a = find("stake")
    expect(canDo(a, { status: "open" }, JUDGE)).toBe(true)
    expect(canDo(a, { status: "settled" }, JUDGE)).toBe(false)
  })
})

describe("field validation + refund record", () => {
  const disp = find("dispute")
  it("dispute requires non-empty reason", () => { expect(disp.validate!({ reason: "" })).toBe("Enter a reason to dispute"); expect(disp.validate!({ reason: "   " })).toBe("Enter a reason to dispute"); expect(disp.validate!({ reason: "re-check sources" })).toBeNull() })
  it("refund double-spend gated by shared claims map", () => { const st = { status: "voided", creator: CREATOR, positions: posOf({ [JUDGE]: { YES: 0, NO: 80 } }), claims: posOf({ [JUDGE]: { claimed: true } }) }; expect(alreadyRefunded(st, JUDGE)).toBe(true); expect(whyNot(find("refund"), st, JUDGE)).toBe("Already refunded") })
})

import { parseStakeWei } from "./actions"
describe("stake amount validation (strict, pre-wallet)", () => {
  const stake = ACTIONS.prediction.find((a) => a.fn === "stake")!
  it("parseStakeWei rejects empty/zero/negative/fractional/non-numeric", () => {
    expect(parseStakeWei("")).toBeNull()
    expect(parseStakeWei("0")).toBeNull()
    expect(parseStakeWei("-5")).toBeNull()
    expect(parseStakeWei("1.5")).toBeNull()
    expect(parseStakeWei("abc")).toBeNull()
    expect(parseStakeWei(" 10 ")).toBe(10n)
    expect(parseStakeWei("100")).toBe(100n)
  })
  it("stake.validate blocks bad side/amount and passes valid input", () => {
    expect(stake.validate!({ side: "YES", amount: "0" })).toMatch(/positive/i)
    expect(stake.validate!({ side: "YES", amount: "" })).toMatch(/positive/i)
    expect(stake.validate!({ side: "YES", amount: "-1" })).toMatch(/positive/i)
    expect(stake.validate!({ side: "YES", amount: "1.2" })).toMatch(/positive/i)
    expect(stake.validate!({ side: "MAYBE", amount: "10" })).toMatch(/side/i)
    expect(stake.validate!({ side: "YES", amount: "100" })).toBeNull()
    expect(stake.validate!({ side: "NO", amount: "1" })).toBeNull()
  })
  it("stake.value returns exact positive wei and throws on invalid", () => {
    expect(stake.value!({ amount: "250", side: "YES" })).toBe(250n)
    expect(() => stake.value!({ amount: "0", side: "YES" })).toThrow()
  })
})

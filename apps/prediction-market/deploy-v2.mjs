// deploy-v2.mjs — fee-funded Bradbury deployment using genlayer-js 2.0.0-rc.1.
// Do not use deploy.mjs: it targets the pre-v0.6 SDK API.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createAccount, createClient, isSuccessful } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

const key = process.env.PRIVATE_KEY;
if (!key) throw new Error("PRIVATE_KEY missing; use node --env-file=.env deploy-v2.mjs");
const account = createAccount(key);
const client = createClient({ chain: testnetBradbury, account });

const source = readFileSync(new URL("./contracts/prediction_market.py", import.meta.url), "utf8");
const code = new TextEncoder().encode(source);
const QUESTION = "According to the cited sources, does the Hyper Text Coffee Pot Control Protocol (HTCPCP) define the HTTP status code 418 as \"I'm a teapot\"?";
const RULES = "Resolve YES if the admissible evidence clearly states that HTCPCP defines HTTP status code 418 as \"I'm a teapot\". Resolve NO if it clearly states otherwise. Otherwise UNRESOLVED.";
const SOURCE1 = "https://www.rfc-editor.org/rfc/rfc2324.txt";
const BINDING1 = "Any attempt to brew coffee with a teapot should result in the error code \"418 I'm a teapot\"";
const SOURCE2 = "https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol";
const BINDING2 = "The Hyper Text Coffee Pot Control Protocol (HTCPCP) is a facetious communication protocol for controlling, monitoring, and diagnosing coffee pots";
const args = [QUESTION, RULES, SOURCE1, SOURCE2, "", BINDING1, BINDING2, "", "htcpcp-418-teapot", Number(process.env.DISPUTE_WINDOW_SECONDS || 3600), Math.floor(Date.now() / 1000) + 86400, Math.floor(Date.now() / 1000) + 7 * 86400];

// Defaults mirror the official GenLayerJS fee-estimation example. For a measured
// project profile, override these values in .env before running this script.
const profile = {
  leaderTimeunitsAllocation: BigInt(process.env.FEE_LEADER_TIMEUNITS || "125"),
  validatorTimeunitsAllocation: BigInt(process.env.FEE_VALIDATOR_TIMEUNITS || "250"),
  executionBudgetPerRound: BigInt(process.env.FEE_EXECUTION_BUDGET || "786500"),
  totalMessageFees: 0n,
  appealRounds: 1n,
  rotations: [1n, 1n],
};

console.log("deploying fee-funded PredictionMarketResolver v2 from", account.address);
console.log("fee profile:", Object.fromEntries(Object.entries(profile).map(([k, v]) => [k, Array.isArray(v) ? v.map(String) : String(v)])));
const estimate = await client.estimateTransactionFees(profile);
console.log("fee value:", estimate.feeValue.toString());
const txHash = await client.deployContract({ code, args, fees: { distribution: estimate.distribution, feeValue: estimate.feeValue } });
console.log("deploy tx:", txHash);
writeFileSync("deploy-tx.txt", `${txHash}\n`);
const receipt = await client.waitForFinalization({ hash: txHash });
console.log("statusName:", receipt.statusName);
console.log("txExecutionResultName:", receipt.txExecutionResultName);
if (!isSuccessful(receipt)) throw new Error(`Deployment failed: ${receipt.statusName} / ${receipt.txExecutionResultName}`);
const address = receipt.txDataDecoded?.contractAddress ?? receipt.recipient;
if (!address) throw new Error("Successful deployment has no contract address");
writeFileSync("contract.txt", `${address}\n`);
let env = existsSync(".env") ? readFileSync(".env", "utf8") : "";
env = env.replace(/^CONTRACT_ADDRESS=.*$/m, "").replace(/\n{3,}/g, "\n\n").trimEnd();
writeFileSync(".env", `${env}\nCONTRACT_ADDRESS=${address}\n`);
console.log("contract address:", address);
console.log("saved: contract.txt, deploy-tx.txt, CONTRACT_ADDRESS in .env");
console.log(`Explorer: https://explorer-bradbury.genlayer.com/address/${address}`);
console.log(">>> DEPLOYED");

import { ProjectDef } from "./types"
export const PROJECTS: ProjectDef[] = [
  {
    id: "moderator",
    name: "Content Moderator",
    tagline: "Self-calibrating AI moderation",
    icon: "ShieldCheck",
    accent: "#b6ff6c",
    repo: "https://github.com/Artem1981777/genlayer-verifiable-consensus/tree/main/apps/content-moderator",
    demo: "https://artem1981777.github.io/genlayer-verifiable-consensus/",
    decisionField: "verdict",
    decisions: [
      { value: "APPROVE", label: "Approve", tone: "ok" },
      { value: "FLAG", label: "Flag", tone: "warn" },
      { value: "REMOVE", label: "Remove", tone: "bad" },
    ],
    seedContracts: [
      "0x2d8257E5C7343f40F7Da5380E0d26b599a6036DE",
      "0x391Cd354F2D74058F5dCAA42D80ECF158A2043Cf",
      "0xc87881c7223e1d47Bf13EBDC50ADFaA0d0EFC4dC",
      "0xF83a360cBA484C09E34018D3FF2f3800d6470DC3",
      "0x0747802565F083d1784ED3f8Ff973Bf0920A61ea",
      "0xD7E2ef74a1ACAAF579E97b2843Cac02EefE15A2c",
      "0x235f51b11b9f96d6673df37553ef58373c4324f9",
    ],
  },
  {
    id: "prediction",
    name: "Prediction Market",
    tagline: "Web-evidenced resolver + disputes",
    icon: "TrendingUp",
    accent: "#8ee63a",
    repo: "https://github.com/Artem1981777/genlayer-verifiable-consensus/tree/main/apps/prediction-market",
    demo: "https://artem1981777.github.io/genlayer-verifiable-consensus/",
    decisionField: "outcome",
    decisions: [
      { value: "YES", label: "Yes", tone: "ok" },
      { value: "NO", label: "No", tone: "bad" },
      { value: "UNRESOLVED", label: "Unresolved", tone: "muted" },
    ],
    seedContracts: [
      "0x2dc09cDbb8319303eAc78E85D5d055BB53bdA6BE", // v2 showcase (open, live staking)
      "0x390CAd661cEf8e2bBAc9b6a1B8A152d9083F8ba0", // v2 full lifecycle (settled, permissionless resolve/settle)
    ],
  },
  {
    id: "oracle", kind: "oracle",
    name: "Multi-Source Oracle",
    tagline: "Median-consensus price feeds",
    icon: "Radio",
    accent: "#5ad1ff",
    repo: "https://github.com/Artem1981777/genlayer-verifiable-consensus/tree/main/apps/multi-source-oracle",
    demo: "https://explorer-bradbury.genlayer.com/address/0x9bEcbdF8f3Cd6fABAeE5F737CE5B1B765ef9a1F5",
    decisionField: "verdict",
    decisions: [],
    seedContracts: ["0x9bEcbdF8f3Cd6fABAeE5F737CE5B1B765ef9a1F5"],
  },
]
export const getProject = (id: string) => PROJECTS.find((p) => p.id === id) || PROJECTS[0]

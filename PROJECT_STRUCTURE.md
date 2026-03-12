# Stacks Aegis: Project Structure & File Map

This document provides a comprehensive overview of the files and directories that make up the Stacks Aegis project.

## Directory Tree

```text
.
├── contracts/                # Clarity Smart Contracts
│   ├── aegis-traits.clar     # Core Trait Definitions
│   ├── aegis-vault.clar      # Circuit Breaker Protection Vault
│   ├── risk-oracle.clar      # Market Data & Stability Calculation
│   └── safe-vault.clar       # Secure Capital Destination
├── dashboard/                # React Mission Control (Frontend)
│   ├── src/
│   │   ├── modules/          # Feature-based logic
│   │   │   ├── dashboard/    # Mission Control & Timeline
│   │   │   ├── risk/         # Risk Radar & Gauges
│   │   │   └── vaults/       # Exposure Tracking
│   │   ├── components/       # Shadcn UI library
│   │   ├── assets/           # Images & Icons
│   │   ├── App.tsx           # Entry Component
│   │   └── index.css         # Tailwind & Neobrutalist Styles
│   ├── public/               # Static assets
│   ├── tailwind.config.ts    # Design System Config
│   ├── vite.config.ts        # Build tool config
│   └── package.json          # Node dependencies
├── tests/                    # Quality Assurance
│   ├── aegis-vault.test.ts   # Vault logic tests
│   ├── risk-oracle.test.ts   # Oracle calculation tests
│   └── ...                   # Contract unit tests
├── settings/                 # Network Configurations
│   ├── Devnet.toml
│   ├── Testnet.toml
│   └── Mainnet.toml
├── dashboard-backup/         # Legacy static implementation (v1)
├── Clarinet.toml             # Stacks/Clarity project config
├── ARCHITECTURE.md           # System design & interconnections
├── package.json              # Root project scripts
└── README.md                 # Project introduction
```

## Key Component Descriptions

### [Contracts](file:///home/ebendttl/Stacks-Aegis/stacks-aegis/contracts)
The backbone of the protocol. These Clarity files define how funds are secured, how risk is calculated on-chain, and how emergency exits are performed without relying on a centralized intermediary.

### [Dashboard](file:///home/ebendttl/Stacks-Aegis/stacks-aegis/dashboard)
A modern React/TypeScript application built with Vite. It serves as the "Mission Control," providing institutional users with high-fidelity visuals of their risk exposure and manual overrides for automated systems.

### [Tests](file:///home/ebendttl/Stacks-Aegis/stacks-aegis/tests)
A robust suite of tests using the Clarinet SDK and Vitest to ensure the mathematical correctness of stability scores and the security of the vault's withdrawal logic.

### [Settings](file:///home/ebendttl/Stacks-Aegis/stacks-aegis/settings)
Environment-specific settings for the Stacks blockchain, allowing the protocol to be deployed and tested seamlessly across Devnet, Testnet, and Mainnet environments.

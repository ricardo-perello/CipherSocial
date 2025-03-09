
# CipherSocial – Private Set Intersection on the Hyle Blockchain with RISC Zero

CipherSocial is a decentralized, privacy-preserving networking application that lets people discover shared interests without exposing their raw data. It combines:

- **[Paillier Homomorphic Encryption]** for Private Set Intersection (PSI)  
- **[RISC Zero’s zkVM]** for zero-knowledge verification of contract execution  
- **[Hyle Blockchain]** as a verifiable ledger for state tracking  
- **[Next.js]** (React) for a user-friendly frontend that connects to an EVM wallet  

By harnessing these technologies, CipherSocial demonstrates how a modern, decentralized app can perform privacy-preserving matching while providing cryptographic proofs of correctness.

---

## Table of Contents
1. [Features](#features)
2. [Architecture](#architecture)
3. [Project Layout](#project-layout)
4. [Requirements](#requirements)
5. [Installation & Setup](#installation--setup)
6. [Usage](#usage)
7. [Technical Overview](#technical-overview)
8. [Contributing](#contributing)
9. [License](#license)

---

## Features

- **Private Set Intersection (PSI)**  
  Users’ answers or interests are encrypted client-side (via Paillier) and processed homomorphically to discover matches without revealing any unencrypted data.

- **Zero-Knowledge Verification**  
  Critical operations, such as verifying the correctness of PSI, happen inside a RISC Zero zkVM, yielding a cryptographic proof that the server’s computations are honest—without exposing sensitive details.

- **On-Chain State in Hyle**  
  All state transitions (e.g., new “merkle roots” or hashed user data) are recorded on the [Hyle blockchain](https://github.com/hyle-org/hyle), creating an auditable, tamper-evident record of events.

- **Next.js Frontend (EVM Wallet Integration)**  
  A React-based web app (Next.js) allows users to connect via MetaMask or another EVM-compatible wallet. This bridges the user experience of Web3 with RISC0-based proofs and Hyle-based state updates.

---

## Architecture

```
┌───────────────────┐   (1) Next.js (React)
│     Frontend      │◄─┐    - UI for user input,
│   (Next.js, EVM)  │  │    - client-side encryption,
└───────────────────┘  │    - wallet interaction
                       ▼
┌────────────────────────────────────────────────────────────────┐
│                          Host (Rust)                           │
│   - Receives requests from Next.js front-end                   │
│   - Prepares data & sends transactions to Hyle node            │
│   - Integrates with the RISC0 zkVM to prove correctness        │
└────────────────────────────────────────────────────────────────┘
                       ▲
                       │
┌──────────────────────┴─────────────────────────────────────────┐
│                RISC0 zkVM & Contract (Rust)                    │
│    - Paillier encryption & homomorphic operations for PSI      │
│    - Merkle root computations & ZK-proof generation            │
│    - State transitions verified & recorded on Hyle             │
└────────────────────────────────────────────────────────────────┘

                  ┌─────────────────────────────────────────────┐
                  │           Hyle Node & Blockchain            │
                  │    - Receives, stores, and verifies         │
                  │      contract state transitions             │
                  │    - Persists proofs & state digests        │
                  └─────────────────────────────────────────────┘
```

1. A user visits the Next.js app, enters their interests or answers, and signs transactions with an EVM wallet (e.g., MetaMask).  
2. The Rust host server receives these encrypted inputs, constructs transactions, and offloads zero-knowledge proof generation to the RISC0 zkVM.  
3. The RISC0 guest code performs the homomorphic operations for set intersection, verifying correctness without leaking user data.  
4. The Hyle blockchain logs each state update and proof, making the entire process verifiable and tamper-resistant.

---

## Project Layout

Below is a *typical* layout when you include both the RISC0 + Hyle-based backend and a Next.js frontend. Adjust folder names as needed for your repo.

```
CipherSocial/
├── contract
│   ├── Cargo.toml
│   └── src
│       └── lib.rs       <-- Hyle contract logic & Paillier-based PSI
├── host
│   ├── Cargo.toml
│   └── src
│       ├── api.rs       <-- Interacts with the Hyle node (REST calls)
│       ├── http_server.rs
│       └── main.rs      <-- CLI & server for receiving requests from Next.js
├── methods
│   ├── Cargo.toml
│   ├── build.rs
│   ├── guest
│   │   ├── Cargo.toml
│   │   └── src
│   │       └── main.rs  <-- RISC0 guest code (ZK proof generation)
│   └── src
│       └── lib.rs
├── next-frontend
│   ├── pages
│   ├── components
│   ├── public
│   ├── package.json
│   └── ...             <-- Next.js app for user interactions
├── Cargo.toml           <-- Workspace root
├── LICENSE
├── README.md            <-- (You are here)
└── hashed-interests.json
```

- **`contract/`**: Defines the on-chain contract recognized by the Hyle node, implementing:
  - Merkle root updates
  - Paillier-based set intersection
  - Verified transitions
- **`host/`**: A Rust server that:
  - Exposes RESTful endpoints for the Next.js frontend  
  - Manages zero-knowledge proofs via RISC0  
  - Submits verified transactions to the Hyle node
- **`methods/`**: Contains the “guest” code for RISC0. Responsible for generating and verifying proofs of correct contract execution.
- **`next-frontend/`**: A Next.js (React) application enabling:
  - User login via EVM wallet (MetaMask, etc.)  
  - Client-side encryption of user interests (Paillier)  
  - Submitting user data to the Rust host for PSI

---

## Requirements

1. **Rust** (latest stable)  
   - [Install via Rustup](https://rustup.rs).
2. **RISC0 Tools**  
   - [Installation guide here](https://dev.risczero.com/api/zkvm/install).
3. **Hyle Node**  
   - Clone [Hyle](https://github.com/hyle-org/hyle).  
   - Check out the relevant tag (e.g., `v0.12.1`) and run a local devnet:
     ```sh
     export RISC0_DEV_MODE=1
     cargo run -- --pg
     ```
   - Accessible at `http://localhost:4321`.
4. **(Optional) Next.js**  
   - Node.js >=16 and NPM/Yarn for the frontend.

---

## Installation & Setup

1. **Clone this repository**:
   ```bash
   git clone https://github.com/USERNAME/cipher-social.git
   cd cipher-social
   ```
2. **Build the Rust workspace**:
   ```bash
   cargo build
   ```
3. **(Optional) Build RISC0 guest explicitly**:
   ```bash
   cd methods
   cargo build
   ```
4. **Run the Hyle devnet** (in a separate terminal):
   ```bash
   # In your local Hyle clone:
   export RISC0_DEV_MODE=1
   cargo run -- --pg
   ```

---

## Usage

### 1. Register the Contract on the Local Devnet

```bash
cargo run --bin host -- --cli register-contract
```
- Compiles the host binary and registers the contract (e.g., `counter` or `cipher_social`) on the Hyle devnet.

### 2. Post Merkle Root & Interests

```bash
cargo run --bin host -- --cli post-root --interests "1 2 3 4 5"
```
- Demonstrates how to submit a set of user interests (encrypted via Paillier).
- Includes automatically generating a zero-knowledge proof (via RISC0) and posting the proof to Hyle.

### 3. Run as an HTTP Server

```bash
cargo run --bin host
```
- Starts an HTTP server (default `127.0.0.1:8080`) that your Next.js app can call:
  - `POST /register-contract`
  - `POST /post-root`
  - `POST /receive-interests`
  - etc.

### 4. Next.js Front-End

> *For a typical Next.js project in `next-frontend/`:*

1. **Install dependencies**:
   ```bash
   cd next-frontend
   npm install
   ```
2. **Run the Next.js server**:
   ```bash
   npm run dev
   ```
3. **Open** `http://localhost:3000` in your browser.
4. **Connect your EVM wallet** (MetaMask, etc.).
5. **Submit your interests**. The frontend encrypts your data (Paillier), the Rust host runs PSI under RISC0, and Hyle records the verified outcome.

---

## Technical Overview

### Paillier Encryption for PSI

1. Each user’s answers are combined into numeric form.  
2. A user encrypts these answers locally with the Paillier public key `(n, g)`.  
3. The host and RISC0 code compare encrypted sets homomorphically:
   - E.g., multiply user A’s ciphertext by the inverse of user B’s ciphertext.  
   - A resulting zero or a known pattern indicates a match, all without ever decrypting raw data on the server side.

### Zero-Knowledge Proof with RISC0

- **RISC0** ensures the contract logic, including Paillier-based set intersection, is run faithfully.
- A cryptographic proof is generated that can be verified on-chain, showing correctness of the intersection.

### Hyle Integration

- **Blockchain**: The Hyle node receives transactions and proofs.
- **On-Chain State**: Critical data (e.g., merkle roots of user sets) are kept on the Hyle ledger so that tampering is easily detectable.
- **Proof Verification**: The node checks the RISC0-generated proof to confirm the contract execution’s integrity.

---

## Contributing

We welcome contributions to enhance and expand CipherSocial. To contribute:

1. **Fork** the repository.
2. **Create a new branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Make your changes** and commit them:
   ```bash
   git commit -m "Add my new feature"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```
5. **Open a Pull Request** in this repo, describing your changes and linking any related issue.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for more details.

---

*Thank you for checking out **CipherSocial**! We hope it serves as a useful example of privacy-preserving decentralized applications. If you have questions or suggestions, please open an issue or reach out.*
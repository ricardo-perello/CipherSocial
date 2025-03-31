# CipherSocial

**Privacy-Preserving Social Networking on the Hyle Blockchain**

CipherSocial enables users to find shared interests while preserving their privacy. Using cryptography (Private Set Intersection via Paillier partially homomorphic encryption verified by a ZK-proof), users can discover common preferences without revealing their actual responses.

![Find Shared Interests](/assets/find-shared-interests.png)

## How It Works

1. **Create a Meet**: Set up a new meeting with custom questions for participants to answer
2. **Join a Meet**: Participants connect their wallet and answer questions about their interests
3. **Find Matches**: The app uses partially homomorphic encryption to identify shared interests without exposing non-shared preferences of the other user

![Create a Meet](/assets/create-meet.png)

## Technology Stack

- **Frontend**: Next.js (React) with EVM wallet integration
- **Backend**: Rust-based server with zero-knowledge proof generation
- **Privacy**: Paillier partially homomorphic encryption for Private Set Intersection (PSI)
- **Zero-Knowledge Proofs**: RISC Zero's zkVM for verifying computations (the computation being the other user's encryption - you want to verify they aren't lying and sending you encrypted preferences that are different than the preferences they have already committed)
- **Blockchain**: Hyle for on-chain state and verification

## Setup

### Requirements

- Rust (latest stable)
- RISC0 Tools
- Hyle (local or testnet) so docker
- Node.js and npm (for frontend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ssocolow/CipherSocial.git
   cd CipherSocial
   ```

2. **Build the Rust backend**
   ```bash
   cd backend/zk-hyle/host
   export RISC0_DEV_MODE=1
   cargo run
   ```

3. **Set up the Hyle node**
   ```bash
   # In your local Hyle clone (https://docs.hyle.eu/quickstart/devnet/)
   export RISC0_DEV_MODE=1
   cargo run -- --pg
   ```

4. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

5. **Start the frontend development server**
   ```bash
   npm run dev
   ```

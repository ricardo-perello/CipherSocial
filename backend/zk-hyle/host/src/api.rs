// host/src/api.rs

use anyhow::Result;
use contract::Meetup;
use contract::MeetupAction;
use client_sdk::rest_client::NodeApiHttpClient;
use client_sdk::helpers::risc0::Risc0Prover;
use sdk::{ContractInput, HyleContract, ProofTransaction, BlobTransaction, BlobIndex, ProgramId};
use sdk::Digestable;
use methods::{GUEST_ELF, GUEST_ID};

pub async fn register_contract(
    host: &str,
    contract_name: &str,
) -> Result<String> {
    let client = NodeApiHttpClient::new(host.to_string())?;
    let initial_state = Meetup {
        merkle_roots: Vec::new(),
        encrypted_message_hash: String::new(),
    };

    let res = client.register_contract(
        &sdk::api::APIRegisterContract {
            verifier: "risc0".into(),
            program_id: ProgramId(sdk::to_u8_array(&GUEST_ID).to_vec()),
            state_digest: initial_state.as_digest(),
            contract_name: contract_name.into(),
        }
    ).await?;
    
    Ok(res.to_string())
}

pub async fn post_root(
    host: &str,
    contract_name: &str,
    interests: String,
) -> Result<String> {
    // Initialize the client and identity.
    let client = NodeApiHttpClient::new(host.to_string())?;
    let identity = format!("none.{}", contract_name);

    // Fetch the initial state from the node.
    let mut initial_state: Meetup = client
        .get_contract(&contract_name.into())
        .await?
        .state
        .into();

    // ---- Build and send the blob transaction ----
    let action = MeetupAction::PostRoot {};
    let blobs = vec![action.as_blob(contract_name)];
    let blob_tx = BlobTransaction::new(identity.clone(), blobs.clone());
    let blob_tx_hash = client.send_tx_blob(&blob_tx).await?;
    println!("✅ Blob tx sent. Tx hash: {}", blob_tx_hash);

    // ---- Prove the state transition ----
    let inputs = ContractInput {
        state: initial_state.as_bytes()?,
        identity: identity.clone().into(),
        tx_hash: blob_tx_hash.clone(),
        private_input: interests.as_bytes().to_vec(),
        tx_ctx: None,
        blobs: blobs.clone(),
        index: BlobIndex(0),
    };

    let (program_outputs, _, _) = initial_state
        .execute(&inputs)
        .map_err(|e| anyhow::anyhow!(e))?;
    println!("🚀 Executed: {}", program_outputs);

    // Create the prover and generate the proof.
    let prover = Risc0Prover::new(GUEST_ELF);
    let proof = prover.prove(inputs).await?;

    // Build and send the proof transaction.
    let proof_tx = ProofTransaction {
        proof,
        contract_name: contract_name.into(),
    };

    let proof_tx_hash = client.send_tx_proof(&proof_tx).await?;
    println!("✅ Proof tx sent. Tx hash: {}", proof_tx_hash);

    Ok(proof_tx_hash.to_string())
}

pub async fn post_enc(
    host: &str,
    contract_name: &str,
    p: u128,
    q: u128,
    interests: String,
) -> Result<String> {
    // Initialize the client and identity.
    let client = NodeApiHttpClient::new(host.to_string())?;
    let identity = format!("none.{}", contract_name);

    // Fetch the initial state from the node.
    let mut initial_state: Meetup = client
        .get_contract(&contract_name.into())
        .await?
        .state
        .into();

    // ---- Build and send the blob transaction ----
    let action = MeetupAction::AddEncryption {};
    let blobs = vec![action.as_blob(contract_name)];
    let blob_tx = BlobTransaction::new(identity.clone(), blobs.clone());
    let blob_tx_hash = client.send_tx_blob(&blob_tx).await?;
    println!("✅ Blob tx sent. Tx hash: {}", blob_tx_hash);

    // ---- Prove the state transition ----
    let mut private_input = p.to_string();
    private_input.push_str(" ");
    private_input.push_str(q.to_string().as_str());
    private_input.push_str(" ");
    private_input.push_str(interests.as_str());

    let inputs = ContractInput {
        state: initial_state.as_bytes()?,
        identity: identity.clone().into(),
        tx_hash: blob_tx_hash.clone(),
        private_input: private_input.as_bytes().to_vec(),
        tx_ctx: None,
        blobs: blobs.clone(),
        index: BlobIndex(0),
    };

    let (program_outputs, _, _) = initial_state
        .execute(&inputs)
        .map_err(|e| anyhow::anyhow!(e))?;
    println!("🚀 Executed: {}", program_outputs);

    // Create the prover and generate the proof.
    let prover = Risc0Prover::new(GUEST_ELF);
    let proof = prover.prove(inputs).await?;

    // Build and send the proof transaction.
    let proof_tx = ProofTransaction {
        proof,
        contract_name: contract_name.into(),
    };

    let proof_tx_hash = client.send_tx_proof(&proof_tx).await?;
    println!("✅ Proof tx sent. Tx hash: {}", proof_tx_hash);

    Ok(proof_tx_hash.to_string())
}

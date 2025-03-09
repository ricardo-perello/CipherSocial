use borsh::{io::Error, BorshDeserialize, BorshSerialize};
use serde::{forward_to_deserialize_any, Deserialize, Serialize};

use sdk::{Digestable, HyleContract, RunResult};
use sha2::{Digest, Sha256};


impl HyleContract for Meetup {
    /// Entry point of the contract's logic
    fn execute(&mut self, contract_input: &sdk::ContractInput) -> RunResult {
        // Parse contract inputs
        let (action, ctx) = sdk::utils::parse_raw_contract_input::<MeetupAction>(contract_input)?;

        // Execute the contract logic
        match action {
            MeetupAction::PostRoot => {
                // interest1, interest2, interest3, ...
                let data = core::str::from_utf8(&contract_input.private_input).unwrap();
                let numbers: Vec<u128> = data.split(" ").map(|x| x.parse().unwrap()).collect();

                // create hash
                let hash = Meetup::create_merkle_tree(&numbers);
                self.merkle_roots.push(hash);
            }
            MeetupAction::AddEncryption => {
                let mut hasher = Sha256::new();
                hasher.update(&contract_input.private_input);

                // p, q, interest1, interest2, interest3, ...
                let data = core::str::from_utf8(&contract_input.private_input).unwrap();
                let numbers: Vec<u128> = data.split(" ").map(|x| x.parse().unwrap()).collect();

                let p: u128 = numbers[0];
                let q: u128 = numbers[1];
                let (pk, sk) = Meetup::prepare_key(p, q);
                let encrypted_messages: Vec<u128> = numbers.iter().map(|msg| Meetup::encrypt(*msg, pk)).collect();
                let encrypted_messages_str = encrypted_messages.iter().map(|x| x.to_string()).collect::<Vec<String>>().join(" ");
                hasher.update(encrypted_messages_str.as_bytes());
                let result = hasher.finalize();
                let hash = format!("{:x}", result);
                self.encrypted_message_hash = hash;
            }
        }

        // program_output might be used to give feedback to the user
        //let program_output = format!("new value: {}", self.merkle_roots[0]);
        Ok(("".to_string(), ctx, vec![]))
    }
}

impl Meetup {
    // Helper for Encryption
    fn l_function(x: u128, n: u128) -> u128 {
        (x - 1) / n
    }

    fn mod_inv(a: u128, m: u128) -> u128 {
        let (g, x, _) = Self::extended_gcd(a as i128, m as i128);
        if g == 1 {
            ((x % m as i128 + m as i128) % m as i128) as u128
        } else {
            panic!("No modular inverse exists!");
        }
    }

    fn extended_gcd(a: i128, b: i128) -> (i128, i128, i128) {
        if a == 0 {
            return (b, 0, 1);
        }
        let (g, x1, y1) = Self::extended_gcd(b % a, a);
        let x = y1 - (b / a) * x1;
        let y = x1;
        (g, x, y)
    }

    fn mod_exp(mut base: u128, mut exp: u128, modulus: u128) -> u128 {
        let mut result = 1;
        base = base % modulus;
        while exp > 0 {
            if exp % 2 == 1 {
                result = (result * base) % modulus;
            }
            exp = exp >> 1;
            base = (base * base) % modulus;
        }
        result
    }

    // paillier
    fn prepare_key (p: u128, q: u128) -> ([u128; 2], [u128; 3]) {
        let n = p * q;
        let lambda = num_integer::lcm(p - 1, q - 1);
        let g = n + 1; // Standard choice for g
        let mu = Self::mod_inv(Self::l_function(Self::mod_exp(g, lambda, n * n), n), n);

        ([n, g], [n, lambda, mu])
    }

    fn encrypt(m: u128, pk: [u128; 2]) -> u128 {
        let [n, g] = pk;
        let n_sq = n * n;
        let r = 3; // Fixed r for simplicity (should be random < n)
        (Self::mod_exp(g, m, n_sq) * Self::mod_exp(r, n, n_sq)) % n_sq
    }

    fn decrypt(c: u128, sk: [u128; 3]) -> u128 {
        let [n, lambda, mu] = sk;
        let n_sq = n * n;
        let l_value = Self::l_function(Self::mod_exp(c, lambda, n_sq), n);
        (l_value * mu) % n
    }

    fn create_merkle_tree(values: &Vec<u128>) -> u128 {
        // Check if input size is a power of 2
        let mut values = values.clone();
        while !values.len().is_power_of_two() {
            values.push(0);
        }

        // Convert values to u128 hashes for leaf nodes
        let mut current_level: Vec<u128> = values
            .iter()
            .map(|&x| {
                let mut hasher = Sha256::new();
                hasher.update(x.to_string().as_bytes());
                let result = hasher.finalize();
                // Take first 16 bytes and convert to u128
                let bytes: [u8; 16] = result[..16].try_into().unwrap();
                u128::from_be_bytes(bytes)
            })
            .collect();

        // Build the tree bottom-up
        while current_level.len() > 1 {
            let mut next_level = Vec::new();
            
            // Process pairs of nodes
            for chunk in current_level.chunks(2) {
                let mut hasher = Sha256::new();
                // Hash both numbers together
                hasher.update(&chunk[0].to_be_bytes());
                hasher.update(&chunk[1].to_be_bytes());
                let result = hasher.finalize();
                // Take first 16 bytes and convert to u128
                let bytes: [u8; 16] = result[..16].try_into().unwrap();
                next_level.push(u128::from_be_bytes(bytes));
            }
            
            current_level = next_level;
        }

        // Return root hash as u128
        current_level[0]
    }

    // Updated verification function to work with u128 hashes
    fn verify_merkle_proof(root: u128, values: &Vec<u128>) -> bool {
        Self::create_merkle_tree(&values) == root
    }
}

/// The action represents the different operations that can be done on the contract
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum MeetupAction {
    PostRoot,
    AddEncryption,
}

/// The state of the contract, in this example it is fully serialized on-chain
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Debug, Clone)]
pub struct Meetup {
    pub merkle_roots: Vec<u128>,
    pub encrypted_message_hash: String,
}

/// Utils function for the host
impl Meetup {
    pub fn as_bytes(&self) -> Result<Vec<u8>, Error> {
        borsh::to_vec(self)
    }
}

/// Utils function for the host
impl MeetupAction {
    pub fn as_blob(&self, contract_name: &str) -> sdk::Blob {
        sdk::Blob {
            contract_name: contract_name.into(),
            data: sdk::BlobData(borsh::to_vec(self).expect("failed to encode BlobData")),
        }
    }
}

/// Helpers to transform the contrat's state in its on-chain state digest version.
/// In an optimal version, you would here only returns a hash of the state,
/// while storing the full-state off-chain
impl Digestable for Meetup {
    fn as_digest(&self) -> sdk::StateDigest {
        sdk::StateDigest(borsh::to_vec(self).expect("Failed to encode Balances"))
    }
}
impl From<sdk::StateDigest> for Meetup {
    fn from(state: sdk::StateDigest) -> Self {
        borsh::from_slice(&state.0)
            .map_err(|_| "Could not decode hyllar state".to_string())
            .unwrap()
    }
}

// host/src/http_server.rs

use actix_web::{post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::fs;
use std::collections::HashMap;
use crate::api;
use awc::Client;
use actix_cors::Cors;
use actix_web::{middleware};
use sdk::{BlobIndex, ContractInput};
use contract::{Meetup, MeetupAction};
use methods::GUEST_ELF;

const HYLE_BLOCKCHAIN_SERVER: &str = "http://localhost:4321";
const HYLE_BLOCKCHAIN_URL: &str = "http://localhost:4321/v1";

#[derive(Debug, Deserialize)]
struct RegisterContractRequest {
    contract_name: String,
}

#[derive(Debug, Deserialize)]
struct PostRootRequest {
    host: String,
    contract_name: String,
    answers: Vec<AnsweredQuestions>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AnsweredQuestions {
    id: u128,
    answerId: u128,
}

#[derive(Debug, Deserialize)]
struct InterestsRequest {
    meetCode: String,
    address: String,
    answers: Vec<AnsweredQuestions>,
}

#[post("/register-contract")]
async fn register_contract(req: web::Json<RegisterContractRequest>) -> impl Responder {
    println!("Received data: {:?}", req);
    
    match api::register_contract(HYLE_BLOCKCHAIN_SERVER, &req.contract_name).await {
        Ok(tx_hash) => {
            // Return original tx_hash regardless of POST result
            HttpResponse::Ok().json(serde_json::json!({ "tx_hash": tx_hash }))
        },
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[post("/post-root")]
async fn post_root(req: web::Json<PostRootRequest>) -> impl Responder {
    println!("Received root data: {:?}", req);

    let alice_interests_vec: Vec<u128> = req.answers.iter().map(
        |x| x.id * 5 + x.answerId
    ).collect();
    let alice_interests_string = alice_interests_vec.iter().map(
        |x| x.to_string()
    ).collect::<Vec<String>>().join(" ");
    
    // Can also publish Bob's merkle root
    let BOB_INTERESTS = vec![
        AnsweredQuestions{ id: 0, answerId: 1 },
        AnsweredQuestions{ id: 1, answerId: 4 },
        AnsweredQuestions{ id: 2, answerId: 2 },
        AnsweredQuestions{ id: 3, answerId: 3 },
    ];
    
    match api::post_root(&req.host, &req.contract_name, alice_interests_string).await {
        Ok(tx_hash) => HttpResponse::Ok().json(serde_json::json!({ "tx_hash": tx_hash })),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[post("/receive-interests")]
async fn receive_interests(req: web::Json<InterestsRequest>) -> impl Responder {
    println!("Received interests: {:?}", req);

    let BOB_INTERESTS = vec![
        AnsweredQuestions{ id: 0, answerId: 1 },
        AnsweredQuestions{ id: 1, answerId: 4 },
        AnsweredQuestions{ id: 2, answerId: 2 },
        AnsweredQuestions{ id: 3, answerId: 3 },
    ];


    let bob_interests_vec: Vec<u128> = BOB_INTERESTS.iter().map(
        |x| x.id * 5 + x.answerId
    ).collect();
    let alice_interests_vec: Vec<u128> = req.answers.iter().map(
        |x| x.id * 5 + x.answerId
    ).collect();
    let alice_interests_string = alice_interests_vec.iter().map(
        |x| x.to_string()
    ).collect::<Vec<String>>().join(" ");

    let p = 7759;
    let q = 6983;
    let (pk, sk) = prepare_key(p, q);
    let alice_interests_vec_enc = alice_interests_vec.iter().map(
        |x| encrypt(*x, pk)
    ).collect();

    let result = server_code_batch(bob_interests_vec, alice_interests_vec_enc, pk);

    /*
    // Save back to file
    match serde_json::to_string_pretty(&hashed_interests) {
        Ok(json_str) => {
            if let Err(e) = fs::write("hashed-interests.json", json_str) {
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": format!("Failed to write to file: {}", e)
                }));
            }
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to serialize data: {}", e)
            }));
        }
    }
    */

    let intersection_numbers = client_find_intersection(result, sk);
    let mut intersection = Vec::new();
    for i in 0..intersection_numbers.len() {
        if intersection_numbers[i] {
            intersection.push(BOB_INTERESTS[i].clone());
        }
    }
    match api::post_enc(
        HYLE_BLOCKCHAIN_SERVER,
        "test4",
        p,
        q,
        alice_interests_string,
    ).await {
        Ok(tx_hash) =>
            HttpResponse::Ok().json(serde_json::json!({
            "intersection": intersection,
            "tx_hash": tx_hash,
        })),
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    }
}

// pub async fn run_server() -> std::io::Result<()> {
//     println!("Starting HTTP server on 127.0.0.1:8080");
//     HttpServer::new(|| {
//         App::new()
//             .service(register_contract)
//             .service(post_root)
//             .service(receive_hashed_interests)
//     })
//     .bind(("127.0.0.1", 8080))?
//     .run()
//     .await
// }
fn server_code_batch(y_secret: Vec<u128>, c_x: Vec<u128>, pk: [u128; 2]) -> Vec<u128> {
    let mut result : Vec<u128> = Vec::new();
    assert!(y_secret.len() == c_x.len());
    let m = c_x.len();
    for i in 0..m {
        let c_y = encrypt(y_secret[i], pk);
        let c_y_inv = invert_cipher(c_y, pk[0]);
        result.push((c_x[i] * c_y_inv) % (pk[0] * pk[0]));
    }
    result
}

fn invert_cipher(c: u128, n: u128) -> u128 {
    let n_sq = n * n;
    mod_exp(c, n - 1, n_sq)
}

fn l_function(x: u128, n: u128) -> u128 {
    (x - 1) / n
}

fn mod_inv(a: u128, m: u128) -> u128 {
    let (g, x, _) = extended_gcd(a as i128, m as i128);
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
    let (g, x1, y1) = extended_gcd(b % a, a);
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
    let mu = mod_inv(l_function(mod_exp(g, lambda, n * n), n), n);

    ([n, g], [n, lambda, mu])
}

fn encrypt(m: u128, pk: [u128; 2]) -> u128 {
    let [n, g] = pk;
    let n_sq = n * n;
    let r = 3; // Fixed r for simplicity (should be random < n)
    (mod_exp(g, m, n_sq) * mod_exp(r, n, n_sq)) % n_sq
}

fn decrypt(c: u128, sk: [u128; 3]) -> u128 {
    let [n, lambda, mu] = sk;
    let n_sq = n * n;
    let l_value = l_function(mod_exp(c, lambda, n_sq), n);
    (l_value * mu) % n
}

fn client_find_intersection(c_y: Vec<u128>, sk: [u128; 3]) -> Vec<bool> {
    let mut result : Vec<bool> = Vec::new();
    for c in c_y{
        result.push(decrypt(c, sk) == 0);
    }
    result
}

pub async fn run_server() -> std::io::Result<()> {
    println!("Starting HTTP server on 127.0.0.1:8080");
    HttpServer::new(|| {
        // Configure CORS middleware
        let cors = Cors::default()
            .allow_any_origin() // Change to your allowed domain
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec![
                actix_web::http::header::CONTENT_TYPE,
                actix_web::http::header::AUTHORIZATION,
            ])
            .supports_credentials();
        
        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .service(register_contract)
            .service(post_root)
            .service(receive_interests)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
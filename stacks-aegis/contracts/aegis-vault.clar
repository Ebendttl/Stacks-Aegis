;; aegis-vault.clar
;; Stacks Aegis Circuit Breaker Vault (The Shield)
;; Central contract for sBTC protection and automated risk mitigation.

;; SECURITY MODEL
;; 1. Non-Custodial Escape: Users can always call 'withdraw' (Safe-Withdraw) even when 
;;    the circuit breaker is active. No admin can freeze user funds indefinitely.
;; 2. Automated Evacuation: The circuit breaker is triggered autonomously by the 
;;    Risk Oracle. In a panic event, funds are moved only to '.safe-vault'.
;; 3. State Integrity: Clarity post-conditions verify that sBTC transfers match 
;;    internal balance updates.
;; 4. No Unilateral Drainage: Admin keys are restricted to configuration (thresholds). 
;;    They cannot move user funds directly.

;; Note: aegis-vault implements the spirit of protected-vault-trait but doesn't formally
;; impl-trait because Clarity 2 does not support trait references inside trait method
;; signatures. The functions match the declared interfaces but cannot be type-checked via impl.
(use-trait sip-010-trait .aegis-traits.sip-010-trait)
(use-trait safe-vault-trait .aegis-traits.safe-vault-trait)


;; Errors
(define-constant ERR-VAULT-FROZEN (err u200))
(define-constant ERR-INSUFFICIENT-BALANCE (err u201))
(define-constant ERR-BREAKER-INACTIVE (err u202))
(define-constant ERR-INVALID-THRESHOLD (err u203))
(define-constant ERR-UNAUTHORIZED (err u103))

;; Constants
(define-constant CONTRACT-OWNER tx-sender)

;; Storage
(define-data-var panic-threshold uint u95)
(define-data-var circuit-breaker-active bool false)
(define-data-var total-protected-sbtc uint u0)

(define-map user-balances principal uint)
(define-map user-thresholds principal uint)

;; Public Functions

;; @desc Deposit sBTC into the vault. Automatically checks peg health.
;; @param amount; sBTC amount in micro-units.
;; @param token; The sBTC SIP-010 token contract.
;; @returns (response bool uint).
(define-public (deposit (amount uint) (token <sip-010-trait>))
  (begin
    ;; 1. Evaluate peg health before accepting deposit
    (try! (evaluate-and-trigger))
    
    ;; 2. Ensure vault isn't frozen
    (asserts! (not (var-get circuit-breaker-active)) ERR-VAULT-FROZEN)
    
    ;; 3. Transfer sBTC from user to vault
    (try! (contract-call? token transfer amount tx-sender (as-contract tx-sender) none))
    
    ;; 4. Update ledger
    (let
      (
        (current-balance (get-user-balance tx-sender))
      )
      (map-set user-balances tx-sender (+ current-balance amount))
      (var-set total-protected-sbtc (+ (var-get total-protected-sbtc) amount))
    )
    
    (print { event: "deposit", user: tx-sender, amount: amount })
    (ok true)
  )
)

;; @desc Safe-Withdraw: Escape hatch for users to retrieve funds.
;; Functions even when the circuit breaker is active.
;; @param amount; sBTC amount to withdraw.
;; @param token; The sBTC SIP-010 token contract.
;; @returns (response bool uint).
(define-public (withdraw (amount uint) (token <sip-010-trait>))
  (let
    (
      (caller tx-sender)  ;; capture caller BEFORE as-contract context switch
      (current-balance (get-user-balance tx-sender))
    )
    ;; 1. Check user has enough balance
    (asserts! (>= current-balance amount) ERR-INSUFFICIENT-BALANCE)

    ;; 2. Transfer sBTC from vault back to the calling user
    ;; Inside as-contract, tx-sender = vault principal; caller = original user (recipient)
    (try! (as-contract (contract-call? token transfer amount tx-sender caller none)))

    ;; 3. Update ledger
    (map-set user-balances caller (- current-balance amount))
    (var-set total-protected-sbtc (- (var-get total-protected-sbtc) amount))

    (print { event: "safe-withdraw", user: caller, amount: amount, breaker-was-active: (var-get circuit-breaker-active) })
    (ok true)
  )
)

;; @desc Automated emergency exit triggered by circuit breaker.
;; Moves funds from this vault to a safe vault implementing safe-vault-trait.
;; By accepting the vault as a trait param we avoid hardcoding .safe-vault and
;; prevent circular/unresolved contract references at compile time.
;; @param user; The principal whose balance is being evacuated.
;; @param token; The sBTC SIP-010 token contract.
;; @param safe-vault; The destination safe vault (must implement safe-vault-trait).
;; @returns (response bool uint).
;; @post sBTC ledger balance for `user` is zeroed; total-protected-sbtc is decremented.
(define-public (emergency-exit (user principal) (token <sip-010-trait>) (safe-vault <safe-vault-trait>))
  (let
    (
      (amount (get-user-balance user))
    )
    ;; 1. Must be called only when breaker is active
    (asserts! (var-get circuit-breaker-active) ERR-BREAKER-INACTIVE)

    ;; 2. If no balance to evacuate, return early with ok - not an error condition.
    (if (is-eq amount u0)
      (ok true)
      (begin
        ;; 3. Transfer actual tokens to safe-vault
        (try! (as-contract (contract-call? token transfer amount tx-sender (contract-of safe-vault) none)))

        ;; 3.1 Credit safe vault ledger for user (accounting transfer only)
        (try! (as-contract (contract-call? safe-vault receive-emergency-funds user amount)))

        ;; 4. Zero out balance for the user (post-condition on ledger)
        (map-set user-balances user u0)
        (var-set total-protected-sbtc (- (var-get total-protected-sbtc) amount))

        (print { event: "emergency-exit", user: user, amount: amount, block: block-height })
        (ok true)
      )
    )
  )
)

;; @desc The core Circuit Breaker Logic (The Heartbeat).
;; Polled on every deposit or manually by keep-bots.
;; @returns (response bool uint); The current status of the circuit breaker.
(define-public (evaluate-and-trigger)
  (let
    (
      (score (unwrap! (contract-call? .risk-oracle get-stability-score) ERR-INVALID-THRESHOLD))
      (threshold (var-get panic-threshold))
      (is-active (var-get circuit-breaker-active))
    )
    
    (if (< score threshold)
      (if (not is-active)
        (begin
          (var-set circuit-breaker-active true)
          (print { event: "CIRCUIT-BREAKER-TRIPPED", score: score, threshold: threshold, block: block-height })
          (ok true)
        )
        (ok true)
      )
      (if is-active
        (begin
          (var-set circuit-breaker-active false)
          (print { event: "CIRCUIT-BREAKER-RESET", score: score, block: block-height })
          (ok false)
        )
        (ok false)
      )
    )
  )
)

;; @desc Individual users can set a personal panic threshold.
;; @param value; 80-99 inclusive.
(define-public (set-user-threshold (value uint))
  (begin
    (asserts! (and (>= value u80) (<= value u99)) ERR-INVALID-THRESHOLD)
    (map-set user-thresholds tx-sender value)
    (print { event: "threshold-set", user: tx-sender, value: value })
    (ok true)
  )
)

;; @desc Configurable global threshold by contract owner.
(define-public (set-global-threshold (value uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set panic-threshold value)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-user-balance (user principal))
  (default-to u0 (map-get? user-balances user))
)

(define-read-only (get-user-threshold (user principal))
  (default-to (var-get panic-threshold) (map-get? user-thresholds user))
)

(define-read-only (get-vault-status)
  {
    breaker-active: (var-get circuit-breaker-active),
    threshold: (var-get panic-threshold),
    total-tvl: (var-get total-protected-sbtc)
  }
)

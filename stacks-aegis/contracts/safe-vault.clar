;; safe-vault.clar
;; Stacks Aegis Safe Vault (The Anchor)
;; Final secure destination for sBTC during protocol emergencies.

;; THREAT MODEL
;; 1. What it defends against: 
;;    - Compromise of the primary Aegis Vault logic or parameters.
;;    - Oracle manipulation that might lead to secondary drain (Safe Vault holds funds purely).
;;    - Unauthorized incoming transfers (only official Aegis Vault can push funds).
;; 2. What it does NOT protect against:
;;    - Compromise of the underlying SIP-010 token (sBTC) itself.
;;    - Catastrophic Stacks L1 reorgs.
;; 3. Trust Assumption: 
;;    - The AEGIS-VAULT-PRINCIPAL whitelist is the primary security gate. 
;;      We trust that only the official vault can evacuate funds here.

(use-trait sip-010-trait .aegis-traits.sip-010-trait)

;; Errors
(define-constant ERR-UNAUTHORIZED (err u300))
(define-constant ERR-INSUFFICIENT-BALANCE (err u301))
(define-constant ERR-ZERO-AMOUNT (err u302))
(define-constant ERR-TRANSFER-FAILED (err u303))
(define-constant ERR-VAULT-LOCKED (err u304))
(define-constant ERR-BREAKER-STILL-ACTIVE (err u305))

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
;; The deployed address of the Aegis Vault. 
;; In production, this would be a specific fully-qualified principal.
(define-constant AEGIS-VAULT-PRINCIPAL .aegis-vault)

;; Storage
(define-map safe-balances principal uint)
(define-data-var total-safe-tvl uint u0)

;; This is a last-resort governance lever. 
;; It should never be used except during active smart contract exploit investigation.
(define-data-var vault-locked bool false)

;; Public Functions

;; @desc Receive funds evacuated from the protected vault during a panic.
;; Only callable by the official Aegis Vault.
;; @param user; The original owner of the funds.
;; @param amount; The amount moved.
;; @param token; The sBTC token contract.
(define-public (receive-emergency-funds (user principal) (amount uint) (token <sip-010-trait>))
  (begin
    ;; 1. STYRICT AUTH CHECK: First assertion as mandated.
    (asserts! (is-eq contract-caller AEGIS-VAULT-PRINCIPAL) ERR-UNAUTHORIZED)
    
    ;; 2. Basic validation
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    
    ;; 3. Execute SIP-010 transfer from Aegis Vault to here
    ;; We use 'as-contract' because the Aegis Vault initiates the call, 
    ;; but it must pull the funds from its own contract principal.
    (try! (contract-call? token transfer amount contract-caller (as-contract tx-sender) none))
    
    ;; 4. Update Ledger
    (let
      (
        (current-balance (default-to u0 (map-get? safe-balances user)))
      )
      (map-set safe-balances user (+ current-balance amount))
      (var-set total-safe-tvl (+ (var-get total-safe-tvl) amount))
    )
    
    (print { event: "emergency-funds-received", user: user, amount: amount, block: block-height, source: contract-caller })
    (ok true)
  )
)

;; @desc Safe-Withdraw: Protocol escape hatch.
;; @param amount; sBTC to retrieve.
;; @param token; The sBTC token contract.
;; @returns (response bool uint).
;; @post Verify balance decrease (enforced by Stacks post-conditions in production).
(define-public (safe-withdraw (amount uint) (token <sip-010-trait>))
  (let
    (
      (current-balance (default-to u0 (map-get? safe-balances tx-sender)))
    )
    ;; 1. Governance Lock Check
    (asserts! (not (var-get vault-locked)) ERR-VAULT-LOCKED)
    
    ;; 2. Balance Check
    (asserts! (>= current-balance amount) ERR-INSUFFICIENT-BALANCE)
    
    ;; 3. Execute Transfer back to user
    (try! (as-contract (contract-call? token transfer amount tx-sender tx-sender none)))
    
    ;; 4. Update Ledger
    (let
      ((new-balance (- current-balance amount)))
      (map-set safe-balances tx-sender new-balance)
      (var-set total-safe-tvl (- (var-get total-safe-tvl) amount))
      
      (print { event: "safe-vault-withdrawal", user: tx-sender, amount: amount, remaining-balance: new-balance, block: block-height })
      (ok true)
    )
  )
)

;; @desc Re-Enter Protection: Path back to Aegis once crisis is resolved.
;; @param amount; sBTC to re-deposit.
;; @param token; The sBTC token contract.
(define-public (re-enter-protection (amount uint) (token <sip-010-trait>))
  (let
    (
      (vault-status (unwrap! (contract-call? .aegis-vault get-vault-status) ERR-TRANSFER-FAILED))
      (current-balance (default-to u0 (map-get? safe-balances tx-sender)))
    )
    ;; 1. Verify breaker is RESET
    (asserts! (not (get breaker-active vault-status)) ERR-BREAKER-STILL-ACTIVE)
    
    ;; 2. Check balance
    (asserts! (>= current-balance amount) ERR-INSUFFICIENT-BALANCE)
    
    ;; 3. Re-deposit on behalf of user
    ;; This pulls funds from THIS contract and deposits into Aegis Vault
    (try! (as-contract (contract-call? .aegis-vault deposit amount token)))
    
    ;; 4. Update Ledger
    (map-set safe-balances tx-sender (- current-balance amount))
    (var-set total-safe-tvl (- (var-get total-safe-tvl) amount))
    
    (print { event: "re-entered-protection", user: tx-sender, amount: amount, block: block-height })
    (ok true)
  )
)

;; Governance Functions

;; @desc Last-resort lock to pause all activity.
;; Replace contract-owner check with DAO proposal execution at mainnet.
(define-public (toggle-vault-lock)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set vault-locked (not (var-get vault-locked)))
    (ok (var-get vault-locked))
  )
)

;; Read-Only Functions

(define-read-only (get-safe-balance (user principal))
  (default-to u0 (map-get? safe-balances user))
)

(define-read-only (get-safe-vault-status)
  { 
    total-tvl: (var-get total-safe-tvl), 
    vault-locked: (var-get vault-locked) 
  }
)

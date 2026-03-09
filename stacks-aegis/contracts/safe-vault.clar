;; safe-vault.clar
;; Stacks Aegis Safe Vault
;; Phase 5: Safe Vault Implementation

(use-trait sip-010-trait .aegis-traits.sip-010-trait)

;; Errors
(define-constant ERR-UNAUTHORIZED (err u103))
(define-constant ERR-INSUFFICIENT-BALANCE (err u105))

;; Storage
(define-map user-balances { token: principal, owner: principal } uint)

;; Public Functions
(define-public (deposit-safe (token <sip-010-trait>) (amount uint) (recipient principal))
  (begin
    ;; Route funds here via SIP-010 transfer
    (try! (contract-call? token transfer amount tx-sender (as-contract tx-sender) none))
    (map-set user-balances 
      { token: (contract-of token), owner: recipient }
      (+ (default-to u0 (map-get? user-balances { token: (contract-of token), owner: recipient })) amount)
    )
    (ok true)
  )
)

(define-public (withdraw-safe (token <sip-010-trait>) (amount uint))
  (let
    (
      (balance (default-to u0 (map-get? user-balances { token: (contract-of token), owner: tx-sender })))
      (caller tx-sender)
    )
    (asserts! (>= balance amount) ERR-INSUFFICIENT-BALANCE)
    (map-set user-balances { token: (contract-of token), owner: caller } (- balance amount))
    (as-contract (contract-call? token transfer amount tx-sender caller none))
  )
)

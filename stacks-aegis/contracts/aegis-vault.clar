;; aegis-vault.clar
;; Stacks Aegis Circuit Breaker Vault (The Shield)
;; Phase 4: Circuit Breaker Vault

(impl-trait .aegis-traits.protected-vault-trait)

;; Errors
(define-constant ERR-UNAUTHORIZED (err u103))
(define-constant ERR-COOLDOWN-ACTIVE (err u104))
(define-constant ERR-INSUFFICIENT-BALANCE (err u105))
(define-constant ERR-PEG-UNSTABLE (err u102))
(define-constant ERR-NOT-IN-PANIC (err u106))

;; Constants
(define-constant PANIC-THRESHOLD u98)
(define-constant COOLDOWN-PERIOD u144) ;; ~1 day of blocks

;; Data Variables
(define-data-var vault-liquidity uint u0)
(define-data-var last-trigger-height uint u0)
(define-data-var circuit-breaker-active bool false)

;; Trait Implementation

;; Deposit funds into the vault
(define-public (deposit (amount uint))
  (begin
    (asserts! (not (var-get circuit-breaker-active)) ERR-PEG-UNSTABLE)
    (var-set vault-liquidity (+ (var-get vault-liquidity) amount))
    (ok true)
  )
)

;; Withdraw funds from the vault
(define-public (withdraw (amount uint))
  (begin
    (asserts! (not (var-get circuit-breaker-active)) ERR-PEG-UNSTABLE)
    (asserts! (>= (var-get vault-liquidity) amount) ERR-INSUFFICIENT-BALANCE)
    (var-set vault-liquidity (- (var-get vault-liquidity) amount))
    (ok true)
  )
)

;; Emergency exit mechanism for circuit breaker triggers
(define-public (emergency-exit)
  (begin
    (asserts! (var-get circuit-breaker-active) ERR-NOT-IN-PANIC)
    ;; In a full deployment, this routes funds to safe-vault using SIP-010
    ;; Simulated action for safety exit
    (var-set vault-liquidity u0)
    (ok true)
  )
)

;; Get the current risk status of the vault
(define-read-only (get-risk-status)
  (if (var-get circuit-breaker-active)
    (ok u0) ;; 0 = panic
    (ok u1) ;; 1 = safe
  )
)

;; Get the current liquidity available in the vault
(define-read-only (get-vault-liquidity)
  (ok (var-get vault-liquidity))
)

;; Circuit Breaker Automation Logic

;; Evaluate the oracle data and trigger circuit breaker if necessary
;; Features Anti-Flip-Flop (Cooldown) Protection and Atomic Execution
(define-public (evaluate-and-trigger)
  (let
    (
      (current-score (unwrap-panic (contract-call? .risk-oracle get-stability-score)))
      (blocks-since-last (if (> block-height (var-get last-trigger-height)) (- block-height (var-get last-trigger-height)) u0))
    )
    ;; Only enforce cooldown if it has ever been triggered
    (if (> (var-get last-trigger-height) u0)
      (asserts! (>= blocks-since-last COOLDOWN-PERIOD) ERR-COOLDOWN-ACTIVE)
      true
    )
    
    (if (< current-score PANIC-THRESHOLD)
      (begin
        (var-set circuit-breaker-active true)
        (var-set last-trigger-height block-height)
        ;; Automatically trigger emergency exit routing
        (try! (emergency-exit))
        (ok true)
      )
      (begin
        (var-set circuit-breaker-active false)
        (ok false)
      )
    )
  )
)

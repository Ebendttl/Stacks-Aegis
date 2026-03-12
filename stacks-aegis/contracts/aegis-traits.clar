;; aegis-traits.clar
;; Stacks Aegis Core Trait Architecture
;; Pure interface definitions for the Aegis protocol.

;; SIP-010 Fungible Token Trait (Standard)
(define-trait sip-010-trait
  (
    ;; Transfer from the caller to a new principal
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))

    ;; the human readable name of the token
    (get-name () (response (string-ascii 32) uint))

    ;; the ticker symbol, or empty if none
    (get-symbol () (response (string-ascii 10) uint))

    ;; the number of decimals used, e.g. 6 or 8
    (get-decimals () (response uint uint))

    ;; the balance of the passed principal
    (get-balance (principal) (response uint uint))

    ;; the current total supply (optional)
    (get-total-supply () (response uint uint))

    ;; an optional URI for metadata of this token
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)

;; @desc Protected Vault Trait
;; Interface for vaults managed by the Aegis circuit breaker.
;; NOTE on Clarity 2 Trait Limitations: Clarity 2 does not support trait 
;; references inside trait method signatures. Functions accepting multiple contract 
;; arguments (token + vault) cannot be expressed here. Those functions are 
;; implemented directly on the vault contracts as public functions beyond the trait.
(define-trait protected-vault-trait
  (
    ;; @desc Deposit sBTC into the vault. Token contract passed as argument.
    ;; @param amount; The amount of sBTC (uint) to deposit.
    ;; @param token; The SIP-010 sBTC token contract.
    ;; @returns (response bool uint); (ok true) on success, (err uint) on failure.
    (deposit (uint <sip-010-trait>) (response bool uint))

    ;; @desc Standard withdrawal of sBTC from the vault. Token contract passed as argument.
    ;; @param amount; The amount of sBTC (uint) to withdraw.
    ;; @param token; The SIP-010 sBTC token contract.
    ;; @returns (response bool uint); (ok true) on success, (err uint) on failure.
    (withdraw (uint <sip-010-trait>) (response bool uint))
  )
)

;; @desc Risk Oracle Trait
;; Interface for oracles providing stability scores for sBTC peg health.
(define-trait risk-oracle-trait
  (
    ;; @desc Fetch the current stability score of the sBTC peg.
    ;; @returns (response uint uint); (ok score) where score is 0-100.
    (get-stability-score () (response uint uint))
  )
)

;; @desc Safe Vault Trait
;; Minimal interface for the Safe Vault, used by aegis-vault to avoid circular dependencies.
(define-trait safe-vault-trait
  (
    ;; @desc Receive emergency funds from the protected vault during a circuit-breaker event.
    ;; @param user; The original owner of the funds.
    ;; @param amount; The amount of sBTC being moved.
    ;; @returns (response bool uint); (ok true) on success.
    (receive-emergency-funds (principal uint) (response bool uint))
  )
)

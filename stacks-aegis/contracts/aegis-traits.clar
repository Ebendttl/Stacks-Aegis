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
;; Interface for vaults that can be protected by the Aegis circuit breaker.
(define-trait protected-vault-trait
  (
    ;; @desc Deposit sBTC into the vault.
    ;; @param amount; The amount of sBTC (uint) to deposit.
    ;; @returns (response bool uint); Returns (ok true) on success, or (err uint) for error propagation.
    (deposit (uint) (response bool uint))

    ;; @desc Standard withdrawal of sBTC from the vault.
    ;; @param amount; The amount of sBTC (uint) to withdraw.
    ;; @returns (response bool uint); Returns (ok true) on success, or (err uint) for error propagation.
    (withdraw (uint) (response bool uint))

    ;; @desc Emergency exit mechanism for circuit breaker triggers.
    ;; @param amount; The amount of sBTC (uint) to be evacuated from the vault.
    ;; @returns (response bool uint); Returns (ok true) on success, or (err uint) for error propagation.
    (emergency-exit (uint) (response bool uint))
  )
)

;; @desc Risk Oracle Trait
;; Interface for oracles providing stability scores for sBTC peg health.
(define-trait risk-oracle-trait
  (
    ;; @desc Fetch the current stability score of the sBTC peg.
    ;; @returns (response uint uint); Returns (ok uint) representing the score, or (err uint) for error propagation.
    (get-stability-score () (response uint uint))
  )
)

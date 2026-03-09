;; risk-oracle.clar
;; Stacks Aegis Risk Oracle (The Brain)
;; Phase 3: Risk Oracle Implementation

(use-trait protected-vault-trait .aegis-traits.protected-vault-trait)

;; Errors
(define-constant ERR-ORACLE-STALE (err u100))
(define-constant ERR-VAULT-LOW-LIQUIDITY (err u101))
(define-constant ERR-UNAUTHORIZED (err u103))

;; Constants
(define-constant MAX-LATENCY u5) ;; maximum 5 blocks latency for oracle freshness
(define-constant BASE-SCORE u100) ;; 100 represents 1.00 (perfect stability)
(define-constant MIN-VAULT-LIQUIDITY u100000000) ;; simulated minimum liquidity (1.0 sBTC)

;; Data Variables
(define-data-var current-stability-score uint u100)
(define-data-var last-oracle-update uint u0)

;; Public Functions

;; Update the oracle data and calculate the stability score
;; The components are passed in to simulate reading from Pyth/RedStone
;; score range: 0-100
(define-public (update-oracle-data
    (price-deviation uint) ;; deviation from peg (0-100)
    (liquidity-depth uint) ;; available simulated liquidity
    (volatility uint)      ;; volatility index (0-100)
  )
  (begin
    (let
      (
        (score (calculate-stability-score price-deviation volatility))
      )
      
      ;; Update state
      (var-set current-stability-score score)
      (var-set last-oracle-update block-height)
      (ok score)
    )
  )
)

;; Get the current stability score. Validates data freshness.
(define-read-only (get-stability-score)
  (let
    ((freshness (- block-height (var-get last-oracle-update))))
    (if (> freshness MAX-LATENCY)
      ERR-ORACLE-STALE
      (ok (var-get current-stability-score))
    )
  )
)

;; Liquidity Awareness: Check destination vault depth
(define-public (check-vault-liquidity (vault <protected-vault-trait>))
  (let
    ((liquidity (unwrap! (contract-call? vault get-vault-liquidity) ERR-VAULT-LOW-LIQUIDITY)))
    (if (< liquidity MIN-VAULT-LIQUIDITY)
      ERR-VAULT-LOW-LIQUIDITY
      (ok true)
    )
  )
)

;; Private Functions
(define-private (calculate-stability-score (deviation uint) (volatility uint))
  (let
    (
      (penalty (+ deviation volatility))
    )
    (if (>= penalty BASE-SCORE)
      u0
      (- BASE-SCORE penalty)
    )
  )
)

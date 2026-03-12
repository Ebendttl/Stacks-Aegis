;; risk-oracle.clar
;; Stacks Aegis Risk Oracle (The Brain)
;; Single source of truth for sBTC peg health.

(impl-trait .aegis-traits.risk-oracle-trait)

;; Errors
(define-constant ERR-FEED-INVALID (err u100))
(define-constant ERR-UNAUTHORIZED (err u101))

;; Constants
;; tx-sender at deployment time.
;; In a mainnet production environment, this would be replaced by a DAO governance or multisig principal.
(define-constant ADMIN tx-sender)

;; Price Feed Data Variables (simulating Pyth + RedStone + On-Chain)
;; Using data-vars to allow test simulation of depegs via set-feed.
;; Values represent sBTC/BTC ratio scaled to 1,000,000.

;; In production, this would be replaced by a Pyth contract-call.
(define-data-var feed-pyth uint u998500)     ;; 0.9985 BTC

;; In production, this would be replaced by a RedStone contract-call.
(define-data-var feed-redstone uint u997800) ;; 0.9978 BTC

;; In production, this would be derived from a mock liquidity depth or another on-chain source.
(define-data-var feed-onchain uint u999100)  ;; 0.9991 BTC

;; Normalization Constants
(define-constant PEG-MIN u950000)   ;; 0.95 BTC = Score 0
(define-constant SCORE-DIVISOR u500) ;; (1,000,000 - 950,000) / 100

;; Data Maps
(define-map protocol-safety-scores principal uint)

;; Read-Only Functions

;; @desc Fetch the current stability score of the sBTC peg.
;; Calculated by averaging three feeds and normalizing to a 0-100 scale using integer arithmetic.
;; @returns (response uint uint); (ok score) where score is 0-100.
(define-read-only (get-stability-score)
  (let
    (
      (average (/ (+ (var-get feed-pyth) (+ (var-get feed-redstone) (var-get feed-onchain))) u3))
    )
    (if (< average PEG-MIN)
      (ok u0) ;; Guard against negative results
      (ok (/ (- average PEG-MIN) SCORE-DIVISOR))
    )
  )
)

;; @desc Returns individual feed values for transparency and comparison.
;; @returns (response { pyth: uint, redstone: uint, onchain: uint } uint).
(define-read-only (get-raw-feeds)
  (ok {
    pyth:     (var-get feed-pyth),
    redstone: (var-get feed-redstone),
    onchain:  (var-get feed-onchain)
  })
)

;; @desc Get the safety score for a specific DeFi protocol.
;; @param protocol; The principal address of the protocol contract.
;; @returns uint; The score 0-100, defaults to 50 if unset.
(define-read-only (get-protocol-score (protocol principal))
  (default-to u50 (map-get? protocol-safety-scores protocol))
)

;; Public Functions

;; @desc Admin-only: Set individual feed values for testnet simulation and future oracle upgrades.
;; @post Changes the state of feed-pyth, feed-redstone, or feed-onchain.
(define-public (set-feeds (pyth uint) (redstone uint) (onchain uint))
  (begin
    (asserts! (is-eq tx-sender ADMIN) ERR-UNAUTHORIZED)
    (var-set feed-pyth pyth)
    (var-set feed-redstone redstone)
    (var-set feed-onchain onchain)
    (ok true)
  )
)

;; @desc Set the safety score for a specific protocol.
;; @param protocol; The principal address of the protocol.
;; @param score; The safety score to assign (0-100).
;; @post Changes the state of the protocol-safety-scores map by updating the value for the given protocol.
(define-public (set-protocol-score (protocol principal) (score uint))
  (begin
    ;; Admin restricted access
    (asserts! (is-eq tx-sender ADMIN) ERR-UNAUTHORIZED)
    ;; Validate score range
    (asserts! (<= score u100) ERR-FEED-INVALID)
    ;; State mutation
    (map-set protocol-safety-scores protocol score)
    (ok true)
  )
)

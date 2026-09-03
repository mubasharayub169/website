# Appointment Booking Setup

The website form is ready, but it needs a Google Apps Script Web App URL before it can accept live requests.

## 1. Create the Google Sheet

1. Sign in with the hospital's Google account.
2. Create a new Google Sheet named `Ikram Hospital Appointments`.
3. In the Sheet, open **Extensions > Apps Script**.
4. Delete the sample code in `Code.gs`.
5. Paste the complete contents of `google-apps-script-appointments.gs` into `Code.gs`.
6. Open **Project Settings** and set the time zone to **(GMT+05:00) Pakistan Standard Time - Karachi**.
7. Save the Apps Script project as `Ikram Hospital Appointment API`.

The `Appointments` tab and its headings are created automatically when the first valid paid request arrives.

## 2. Configure Payments

At the top of `Code.gs`, set the verified WhatsApp number that will receive payment screenshots. Use the country code without `+`, spaces, or dashes:

```javascript
const PAYMENT_WHATSAPP_NUMBER = '923338438730';
```

The approved receiving details are configured for all three payment methods:

```javascript
const PAYMENT_ACCOUNTS = {
	JazzCash: { number: '03338438730', title: 'Syed Tayyab Abbas Kazmi' },
	Easypaisa: { number: '03338438730', title: 'Syed Tayyab Abbas Kazmi' },
	Raast: { number: '03338438730', title: 'Syed Tayyab Abbas Kazmi' }
};
```

All consultants currently have the same advance fee:

```javascript
const DOCTOR_ADVANCE_FEES = {
	'Dr. Zain Safdar': 3000,
	'Dr. Soban Sarwar Gondal': 3000
	// All remaining doctors are also configured at PKR 3,000.
};
```

Doctors without a configured fee cannot accept online bookings. The backend checks the fee again, so changing the amount in the browser cannot bypass it.

## 3. Deploy the Web App

1. In Apps Script, select **Deploy > New deployment**.
2. Click **Select type > Web app**.
3. Set **Execute as** to `Me`.
4. Set **Who has access** to `Anyone`.
5. Click **Deploy** and complete Google's authorization prompts.
6. Copy the Web App URL ending in `/exec`.

Do not use the development URL ending in `/dev`.

## 4. Connect the Website

In `appointment-booking.html`, find:

```javascript
const APPOINTMENT_SCRIPT_URL = '';
```

Paste the deployed `/exec` URL:

```javascript
const APPOINTMENT_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

Commit, push, and redeploy the website on Vercel.

## 5. Test Before Launch

1. Open the `/exec` URL directly. It should return JSON containing `"ok":true`.
2. Select a configured doctor and confirm the correct fee and payment accounts appear.
3. Use the WhatsApp button and confirm its prefilled message includes the doctor, fee, and transaction ID.
4. Send the screenshot, tick the confirmation checkbox, and submit one test request with a unique transaction ID.
5. Confirm the `Appointments` row includes `Payment Verification Pending`, payment method, exact fee, transaction ID, and `Yes` under `Screenshot Sent on WhatsApp`.
6. Submit the same transaction ID again. It must be rejected.
7. Submit the same doctor, date, and time again. The slot must be unavailable.

## Daily Workflow

- Review each new `Payment Verification Pending` request against the receiving account before confirming it.
- Change the Sheet status to `Confirmed`, `Payment Rejected`, `Cancelled`, or `Completed` manually.
- A `Cancelled` row releases its appointment slot. Use `Cancelled` after rejecting or refunding a payment when the slot should become available again.
- Restrict Sheet access to authorized hospital staff only.
- Do not ask patients to place reports, diagnoses, ID numbers, or highly sensitive medical details in the notes field.

When `google-apps-script-appointments.gs` changes later, use **Deploy > Manage deployments > Edit**, select **New version**, and deploy again. The existing `/exec` URL will continue working.
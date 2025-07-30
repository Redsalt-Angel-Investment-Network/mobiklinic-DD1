# MobiKlinic Payment Feature

This implementation adds a comprehensive payment system to the MobiKlinic mobile application.

## Features Implemented

### 1. Payment Screen
- Service selection dropdown with non-communicable diseases options
- Amount input in Uganda Shillings (UGX)
- Phone number input for mobile money payments
- Payment summary display
- Integration with Flutterwave payment gateway (configured for mobile money)

### 2. Dashboard Integration
- Added Payment card to the dashboard for easy access
- Users can navigate to payment screen from main dashboard

### 3. Payment History
- View all past payment transactions
- Filter by user name
- Show payment status, amounts, dates, and transaction details
- Refresh functionality to get latest payments

### 4. Backend Integration
- Created Strapi content type for payments
- API endpoints for creating and retrieving payments
- Payment transaction recording with full details

## Services Available for Payment

1. Non-Communicable Diseases
2. Cardiovascular Disease
3. Diabetes Care
4. Hypertension Management
5. Cancer Screening
6. Mental Health Services

## Payment Flow

1. User clicks Payment card on dashboard
2. Selects service from dropdown
3. Enters amount in UGX
4. Enters mobile money phone number
5. Payment is processed via Flutterwave
6. Transaction is recorded in backend
7. User receives confirmation

## Files Created/Modified

### Frontend (React Native)
- `components/screens/payment.js` - Main payment screen
- `components/screens/payment-history.js` - Payment history screen
- `components/screens/dashboard.js` - Added payment card
- `components/navigators/AuthStack.js` - Added navigation routes
- `components/constants/styles.js` - Added color constants

### Backend (Strapi)
- `src/api/payment/content-types/payment/schema.json` - Payment data model
- `src/api/payment/controllers/payment.ts` - Payment API controller
- `src/api/payment/routes/payment.ts` - Payment API routes
- `src/api/payment/services/payment.ts` - Payment business logic

## Payment Data Structure

Each payment record includes:
- Amount paid
- Service paid for
- User name
- Phone number
- Payment date
- Payment status (pending, completed, failed, cancelled)
- Payment method (mobile_money, credit_card, bank_transfer)
- Currency (UGX)
- Transaction ID
- Flutterwave transaction reference
- Optional notes

## Setup Instructions

### Frontend
1. Install Flutterwave React Native SDK (already done)
2. Configure Flutterwave public key in payment.js
3. Update API endpoints if backend URL changes

### Backend
1. Deploy Strapi backend with new payment content type
2. Ensure API endpoints are accessible
3. Configure CORS for mobile app access

## Configuration Notes

### Flutterwave Integration
- Currently set up for testing mode
- Replace `FLWPUBK_TEST-XXXXXXXXXXXXX-X` with actual public key
- Configured for Uganda Shillings (UGX) and mobile money

### API Endpoints
- Create payment: `POST /api/payments`
- Get payments: `GET /api/payments`
- Get user payments: `GET /api/payments/user/:userName`
- Update payment status: `PUT /api/payments/:id/status`

## Security Considerations

1. Payment processing uses Flutterwave secure gateway
2. Backend validates all payment data
3. Transaction IDs are unique and generated server-side
4. User authentication required for all payment operations

## Future Enhancements

1. Add payment notifications
2. Implement payment receipts
3. Add payment analytics dashboard
4. Support multiple payment methods
5. Add payment reminders
6. Implement payment plans/subscriptions

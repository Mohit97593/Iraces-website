import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopNav from '../components/Navbar/TopNav';
import { authAPI } from '../services/authAPI';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    // Extract all payment details from URL parameters
    const details = {
      status: searchParams.get('status'),
      txnid: searchParams.get('txnid'),
      amount: searchParams.get('amount'),
      mihpayid: searchParams.get('mihpayid'),
      productinfo: searchParams.get('productinfo'),
      firstname: searchParams.get('firstname'),
      email: searchParams.get('email'),
      phone: searchParams.get('phone'),
      hash: searchParams.get('hash'),
      udf1: searchParams.get('udf1'),
      udf2: searchParams.get('udf2'),
      udf3: searchParams.get('udf3'),
      udf4: searchParams.get('udf4'),
      udf5: searchParams.get('udf5'),
    };

    console.log('✅ Payment Success - Details:', details);
    setPaymentDetails(details);

    // Check which payment gateway was used
    const gateway = searchParams.get('gateway') || 'payu'; // Default to PayU
    console.log('💳 Payment Gateway:', gateway);

    if (gateway === 'phonepe') {
      // PhonePe Flow: Only verify payment status
      if (details.txnid) {
        console.log('🔄 PhonePe Flow: Verifying payment status...');

        authAPI.phonepeVerifyStatus(details.txnid)
          .then(verifyResponse => {
            console.log('✅ PhonePe Verify API Response:', verifyResponse);

            if (verifyResponse.status === 'PAYMENT_SUCCESS') {
              console.log('✅ PhonePe Payment verified successfully!');
            } else {
              console.warn('⚠️ PhonePe Payment status:', verifyResponse.status);
            }
          })
          .catch(error => {
            console.error('❌ PhonePe Verify API Error:', error);
          });
      }
    } else {
      // PayU Flow: getEvents → getProfile → sendEmail
      console.log('🔄 PayU Flow: Starting payment success flow...');

      // Step 1: Call getEvents API
      authAPI.getEvents()
        .then(eventsResponse => {
          console.log('✅ Step 1: getEvents API Response:', eventsResponse);

          // Step 2: Call getProfile API
          return authAPI.getProfile();
        })
        .then(profileResponse => {
          console.log('✅ Step 2: getProfile API Response:', profileResponse);

          // Step 3: Send confirmation email
          // Extract booking_pay_id and event_id from URL params (udf1, udf2)
          const emailPayload = {
            booking_pay_id: details.udf1 || details.mihpayid, // Use udf1 or mihpayid as fallback
            event_id: details.udf2 || '', // Use udf2 for event_id
            event_url: details.udf3 || 'https://racesregistrations.com' // Use udf3 or default URL
          };

          console.log('📧 Step 3: Sending confirmation email with payload:', emailPayload);

          return authAPI.sendEmailPaymentSuccess(emailPayload);
        })
        .then(emailResponse => {
          console.log('✅ Step 3: Email sent successfully!', emailResponse);
          console.log('🎉 PayU payment success flow completed!');
        })
        .catch(error => {
          console.error('❌ PayU payment success flow error:', error);
          console.error('Error details:', error.message);
        });
    }

  }, [searchParams]);

  const handleViewBookings = () => {
    navigate('/registration-tracker');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (!paymentDetails) {
    return (
      <div className="payment-loading">
        <div className="spinner"></div>
        <p>Processing payment details...</p>
      </div>
    );
  }

  return (
    <div className="payment-success-page">
      <TopNav />

      <div className="payment-success-container">
        <div className="payment-success-card">
          {/* Success Icon */}
          <div className="success-icon-wrapper">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="success-title">Payment Successful!</h1>
          <p className="success-subtitle">
            Thank you for your registration. Your payment has been confirmed.
          </p>

          {/* Payment Details */}
          <div className="payment-details-box">
            <h3>Transaction Details</h3>

            <div className="detail-row">
              <span className="detail-label">
                <i className="fas fa-receipt"></i>
                Transaction ID
              </span>
              <span className="detail-value">{paymentDetails.txnid}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <i className="fas fa-credit-card"></i>
                Payment ID
              </span>
              <span className="detail-value">{paymentDetails.mihpayid}</span>
            </div>

            <div className="detail-row highlight-row">
              <span className="detail-label">
                <i className="fas fa-money-bill-wave"></i>
                Amount Paid
              </span>
              <span className="detail-value amount">₹{paymentDetails.amount}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <i className="fas fa-tag"></i>
                Event/Product
              </span>
              <span className="detail-value">{paymentDetails.productinfo}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <i className="fas fa-user"></i>
                Name
              </span>
              <span className="detail-value">{paymentDetails.firstname}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <i className="fas fa-envelope"></i>
                Email
              </span>
              <span className="detail-value">{paymentDetails.email}</span>
            </div>

            {paymentDetails.phone && (
              <div className="detail-row">
                <span className="detail-label">
                  <i className="fas fa-phone"></i>
                  Phone
                </span>
                <span className="detail-value">{paymentDetails.phone}</span>
              </div>
            )}
          </div>

          {/* Confirmation Message */}
          <div className="confirmation-message">
            <i className="fas fa-info-circle"></i>
            <p>A confirmation email with all details has been sent to <strong>{paymentDetails.email}</strong></p>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleViewBookings}>
              <i className="fas fa-ticket-alt"></i>
              View My Registrations
            </button>
            <button className="btn-secondary" onClick={handleGoHome}>
              <i className="fas fa-home"></i>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

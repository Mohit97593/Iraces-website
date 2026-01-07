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
      event_id: searchParams.get('event_id'), // PhonePe sends event_id directly
      booking_pay_id: searchParams.get('booking_pay_id'), // PhonePe sends booking_pay_id directly
    };

    console.log('✅ Payment Success - Details:', details);
    setPaymentDetails(details);

    // Check which payment gateway was used - check both parameters
    const gateway = searchParams.get('gateway') || searchParams.get('payment_gateway') || 'payu';
    console.log(' Payment Gateway:', gateway);

    // Prepare email payload for both flows
    const emailPayload = {
      booking_pay_id: details.booking_pay_id || details.udf1 || details.mihpayid,
      event_id: details.event_id || details.udf2 || '',
      event_url: details.udf3 || 'https://racesregistrations.com'
    };

    console.log('📧 Email Payload:', emailPayload);

    // PhonePe Flow: Verify payment status first, then send email
    if (gateway === 'phonepe' && details.txnid) {
      console.log('🔄 PhonePe Flow: Verifying payment status...');

      authAPI.phonepeVerifyStatus(details.txnid)
        .then(verifyResponse => {
          console.log('✅ PhonePe Verify API Response:', verifyResponse);

          if (verifyResponse.status === 'PAYMENT_SUCCESS') {
            console.log('✅ PhonePe Payment verified successfully!');
          } else {
            console.warn('⚠️ PhonePe Payment status:', verifyResponse.status);
          }

          // Send confirmation email after verification
          console.log('📧 PhonePe: Sending confirmation email...');
          return authAPI.sendEmailPaymentSuccess(emailPayload);
        })
        .then(emailResponse => {
          console.log('✅ PhonePe: Email sent successfully!', emailResponse);
        })
        .catch(error => {
          console.error('❌ PhonePe Flow Error:', error);
        });
    } else {
      // PayU Flow: Send confirmation email directly
      console.log('📧 PayU: Sending confirmation email...');

      authAPI.sendEmailPaymentSuccess(emailPayload)
        .then(emailResponse => {
          console.log('✅ PayU: Email sent successfully!', emailResponse);
        })
        .catch(error => {
          console.error('❌ PayU Email Error:', error);
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

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopNav from '../components/Navbar/TopNav';
import './PaymentFailure.css';

export default function PaymentFailure() {
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
      error_Message: searchParams.get('error_Message'),
      udf1: searchParams.get('udf1'),
      udf2: searchParams.get('udf2'),
    };

    console.log('❌ Payment Failed - Details:', details);
    setPaymentDetails(details);

  }, [searchParams]);

  const handleTryAgain = () => {
    // Navigate back to event details or checkout page
    navigate(-1);
  };

  const handleContactSupport = () => {
    navigate('/contact');
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
    <div className="payment-failure-page">
      <TopNav />

      <div className="payment-failure-container">
        <div className="payment-failure-card">
          {/* Failure Icon */}
          <div className="failure-icon-wrapper">
            <div className="failure-cross">
              <svg className="cross" viewBox="0 0 52 52">
                <circle className="cross-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="cross-line" fill="none" d="M16 16 36 36 M36 16 16 36"/>
              </svg>
            </div>
          </div>

          {/* Failure Message */}
          <h1 className="failure-title">Payment Failed</h1>
          <p className="failure-subtitle">
            {paymentDetails.error_Message || 'Your payment could not be processed. Please try again.'}
          </p>

          {/* Payment Details */}
          <div className="payment-details-box">
            <h3>Transaction Details</h3>
            <div className="detail-row">
              <span className="detail-label">Transaction ID:</span>
              <span className="detail-value">{paymentDetails.txnid || 'N/A'}</span>
            </div>
            {paymentDetails.mihpayid && (
              <div className="detail-row">
                <span className="detail-label">PayU Payment ID:</span>
                <span className="detail-value">{paymentDetails.mihpayid}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Attempted Amount:</span>
              <span className="detail-value amount">₹{paymentDetails.amount}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="detail-value status-failed">Failed</span>
            </div>
          </div>

          {/* Error Info */}
          {paymentDetails.error_Message && (
            <div className="error-message-box">
              <i className="fas fa-exclamation-triangle"></i>
              <div>
                <strong>Error:</strong>
                <p>{paymentDetails.error_Message}</p>
              </div>
            </div>
          )}

          {/* Common Reasons */}
          <div className="common-reasons">
            <h4>Common reasons for payment failure:</h4>
            <ul>
              <li>Insufficient funds in your account</li>
              <li>Incorrect card details or OTP</li>
              <li>Bank server temporarily down</li>
              <li>Transaction limit exceeded</li>
              <li>Card expired or blocked</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleTryAgain}>
              <i className="fas fa-redo"></i>
              Try Again
            </button>
            <button className="btn-secondary" onClick={handleContactSupport}>
              <i className="fas fa-headset"></i>
              Contact Support
            </button>
            <button className="btn-tertiary" onClick={handleGoHome}>
              <i className="fas fa-home"></i>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import FeatureSelector from './FeatureSelector';
import OrderSummary from './OrderSummary';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedTemplate, selectedFeatures: initialFeatures } = location.state || {};
  const [selectedFeatures, setSelectedFeatures] = useState(initialFeatures || []);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedTemplate) {
    return (
      <div className="loading">
        No template selected. <button onClick={() => navigate('/')}>Go back</button>
      </div>
    );
  }

  const handleFeatureChange = (features) => {
    setSelectedFeatures(features);
  };

  const handleBuy = async () => {
  };

  const fullImageUrl = selectedTemplate.fullImageUrl || selectedTemplate.previewImageUrl;

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
      </div>
      <div className="checkout-content">
        <div className="checkout-preview">
          <h3>Live Preview (Full Image)</h3>
          <div className="preview-box full-preview-container">
            <div className="full-preview-scroll" style={{ height: '400px', overflowY: 'auto', background: '#e2e8f0', borderRadius: '8px' }}>
              <img src={fullImageUrl} alt={selectedTemplate.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <p>{selectedTemplate.name}</p>
          </div>
        </div>
        <div className="checkout-features">
          <h3>Additional Features</h3>
          <FeatureSelector selectedFeatures={selectedFeatures} onFeatureChange={handleFeatureChange} />
        </div>
        <div className="checkout-summary">
          <OrderSummary selectedTemplate={selectedTemplate} selectedFeatures={selectedFeatures} />
          <button className="buy-btn" onClick={handleBuy} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Buy Now'}
          </button>
          <button onClick={() => navigate('/')} className="back-btn" style={{ marginTop: '1rem' }}>
            Back to Templates
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
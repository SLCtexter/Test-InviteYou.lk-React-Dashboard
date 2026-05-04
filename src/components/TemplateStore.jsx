import React, { useState, useRef, useEffect } from 'react';
import TemplateGrid from './TemplateGrid';
import FeatureSelector from './FeatureSelector';
import OrderSummary from './OrderSummary';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const TemplateStore = () => {
const [category, setCategory] = useState('web');
const [selectedTemplate, setSelectedTemplate] = useState(null);
const [selectedFeatures, setSelectedFeatures] = useState([]);
const previewContentRef = useRef(null);
const autoScrollTimerRef = useRef(null);
const userScrollingRef = useRef(false); 

const startAutoScroll = (container) => {
  stopAutoScroll();
  if (userScrollingRef.current) return;
  container.scrollTop = 0;
  const maxScroll = container.scrollHeight - container.clientHeight;
  if (maxScroll <= 0) return;
  const duration = 4000;
  const startTime = performance.now();
  const animate = (now) => {
    if (userScrollingRef.current) {
      stopAutoScroll();
      return;
    }
    const elapsed = Math.min(1, (now - startTime) / duration);
    const ease = 1 - Math.pow(1 - elapsed, 3);
    container.scrollTop = maxScroll * ease;
    if (elapsed < 1) {
      autoScrollTimerRef.current = requestAnimationFrame(animate);
    } else {
      stopAutoScroll();
    }
  };
  autoScrollTimerRef.current = requestAnimationFrame(animate);
};

const stopAutoScroll = () => {
  if (autoScrollTimerRef.current) {
    cancelAnimationFrame(autoScrollTimerRef.current);
    autoScrollTimerRef.current = null;
  }
};

const handleUserScroll = () => {
  if (!userScrollingRef.current) {
    userScrollingRef.current = true;
    stopAutoScroll();
  }
};

const handleTemplateSelect = (template) => {
  setSelectedTemplate(template);
  setSelectedFeatures([]);
  if (previewContentRef.current) {
    previewContentRef.current.scrollTop = 0;
  }
  userScrollingRef.current = false;
  stopAutoScroll();
};

const handleFeatureChange = (features) => {
  setSelectedFeatures(features);
};

const handleBuy = async () => {
  if (!selectedTemplate) {
    alert("Please select a template first!");
    return;
  }
  const total = selectedTemplate.price + selectedFeatures.reduce((sum, f) => sum + f.price, 0);
  const orderData = {
    templateId: selectedTemplate.id,
    templateName: selectedTemplate.name,
    templatePrice: selectedTemplate.price,
    selectedFeatures: selectedFeatures.map(f => ({ id: f.id, name: f.name, price: f.price })),
    totalAmount: total,
    currency: "LKR",
    status: "pending",
    createdAt: new Date().toISOString()
  };
  try {
    const docRef = await addDoc(collection(db, "orders"), orderData);
    const orderId = docRef.id;
    const apiUrl = 'https://test-inviteyou-dashboard.infinityfreeapp.com/api/payhere-hash.php';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount: total })
    });
    const data = await response.json();
    if (!data.hash) throw new Error("Invalid hash response");
    const payhereHash = data.hash;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://sandbox.payhere.lk/pay/checkout';
    const fields = {
      merchant_id: '1234923',
      return_url: 'https://test-inviteyou-dashboard.infinityfreeapp.com/thankyou.html',
      cancel_url: 'https://test-inviteyou-dashboard.infinityfreeapp.com/',
      notify_url: 'https://test-inviteyou-dashboard.infinityfreeapp.com/api/payhere-hash.php',
      order_id: orderId,
      items: selectedTemplate.name,
      currency: 'LKR',
      amount: total.toFixed(2),
      first_name: 'Customer',
      last_name: 'User',
      email: 'customer@example.com',
      phone: '0771234567',
      address: 'Colombo',
      city: 'Colombo',
      country: 'Sri Lanka',
      hash: payhereHash,
    };
    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error("Payment error:", error);
    alert("Payment initialization failed. Please try again.");
  }
};

useEffect(() => {
  const container = previewContentRef.current;
  if (!container) return;

  const cleanup = () => {
    container.removeEventListener('scroll', handleUserScroll);
    stopAutoScroll();
  };
  cleanup();

  if (category === 'web' && selectedTemplate?.fullImageUrl) {
    container.addEventListener('scroll', handleUserScroll);
    userScrollingRef.current = false;
    container.scrollTop = 0;
    const img = container.querySelector('img');
    if (img && img.complete && img.naturalHeight > 0) {
      startAutoScroll(container);
    } else if (img) {
      img.onload = () => {
        if (category === 'web' && selectedTemplate?.fullImageUrl && !userScrollingRef.current) {
          startAutoScroll(container);
        }
      };
    }
  } else {
    if (container) container.scrollTop = 0;
  }

  return cleanup;
}, [selectedTemplate, category]);

return (
  <div className="dashboard">
    <div className="header">
      <h1>Template Store</h1>
      <p>Select a template and add features</p>
    </div>

    <div className="categories">
      {['web', 'pdf', 'image'].map(cat => (
        <button
          key={cat}
          className={`cat-btn ${category === cat ? 'active' : ''}`}
          onClick={() => {
            setCategory(cat);
            setSelectedTemplate(null);
            setSelectedFeatures([]);
          }}
        >
          {cat === 'web' ? 'Web Templates' : cat === 'pdf' ? 'PDF Templates' : 'Image Templates'}
        </button>
      ))}
    </div>

    <div className="content">
      <div className="templates-area">
        <h3>Available Templates</h3>
        <TemplateGrid
          category={category}
          onTemplateSelect={handleTemplateSelect}
          selectedTemplateId={selectedTemplate?.id}
        />
      </div>

      <div className="preview-panel">
          <div className="preview-box">
<strong>Live Preview</strong>
<div
  id="preview-content"
  style={{
    height: '250px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e2e8f0',
    borderRadius: '8px'
  }}
>
  {selectedTemplate ? (
    <img
      src={selectedTemplate.previewImageUrl}
      alt={selectedTemplate.name}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  ) : (
    'Select a template'
  )}
</div>
<span>{selectedTemplate?.name || 'No template selected'}</span>
</div>

        <div className="features">
          <strong>Additional Features</strong>
          <FeatureSelector
            selectedFeatures={selectedFeatures}
            onFeatureChange={handleFeatureChange}
          />
        </div>

        <OrderSummary
          selectedTemplate={selectedTemplate}
          selectedFeatures={selectedFeatures}
        />

        <button className="buy-btn" onClick={handleBuy} disabled={!selectedTemplate}>
          Buy Now
        </button>
        <p style={{ fontSize: '0.7rem', textAlign: 'center' }}>Select a template first</p>
      </div>
    </div>
    <footer>Template Store Dashboard</footer>
  </div>
);
};

export default TemplateStore;
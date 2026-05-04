import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateGrid from './TemplateGrid';

const TemplateStore = () => {
  const [category, setCategory] = useState('web');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const navigate = useNavigate();

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setSelectedFeatures([]);
  };

  const handleProceed = (template) => {
    navigate('/checkout', { state: { selectedTemplate: template, selectedFeatures: selectedFeatures } });
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setSelectedTemplate(null);
    setSelectedFeatures([]);
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Template Store</h1>
        <p>Select a template and proceed to checkout</p>
      </div>

      <div className="categories">
        {['web', 'pdf', 'image'].map(cat => (
          <button
            key={cat}
            className={`cat-btn ${category === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat === 'web' ? 'Web Templates' : cat === 'pdf' ? 'PDF Templates' : 'Image Templates'}
          </button>
        ))}
      </div>

      <div className="content" style={{ padding: '2rem' }}>
        <div className="templates-area" style={{ width: '100%' }}>
          <h3>Available Templates</h3>
          <TemplateGrid
            category={category}
            onTemplateSelect={handleTemplateSelect}
            selectedTemplateId={selectedTemplate?.id}
            onProceed={handleProceed}
          />
        </div>
      </div>

      <footer>Template Store Dashboard</footer>
    </div>
  );
};

export default TemplateStore;
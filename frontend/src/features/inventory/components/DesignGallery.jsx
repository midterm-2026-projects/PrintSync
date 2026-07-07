import React, { useState } from 'react';
import ImageModal from './ImageModal';

const DesignGallery = ({ designs = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!designs || designs.length === 0) {
    return <p><i>No designs found in repository.</i></p>;
  }

  return (
    <div id="design-repository" style={{ marginTop: '20px' }}>
      <h3>Custom Sublimation Designs</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 150px)', gap: '15px' }}>
        {designs.map((design) => (
          <img 
            key={design.id}
            src={design.url} 
            alt={design.title}
            onClick={() => setSelectedImage(design)}
            style={{ 
              width: '150px', 
              height: '150px', 
              objectFit: 'cover', 
              cursor: 'pointer',
              border: '1px solid #000'
            }}
          />
        ))}
      </div>

      {/* Extracted Modal Component */}
      <ImageModal 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
};

export default DesignGallery;
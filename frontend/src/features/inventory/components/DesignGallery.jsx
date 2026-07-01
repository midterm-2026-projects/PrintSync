import React, { useState } from 'react';

const DesignGallery = ({ designs = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Logic: Handle empty repository (Requirement)
  if (!designs || designs.length === 0) {
    return <p><i>No designs found in repository.</i></p>;
  }

  return (
    <div id="design-repository" style={{ marginTop: '20px' }}>
      <h3>Custom Sublimation Designs</h3>
      
      {/* Grid-based Gallery (Sub-task 1) */}
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

      {/* High-Resolution Image Previewer Modal (Sub-task 3) */}
      {selectedImage && (
        <div 
          data-testid="image-modal"
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', 
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div style={{ background: '#fff', padding: '20px', textAlign: 'center' }}>
            <h4>Full Resolution Preview: {selectedImage.title}</h4>
            <img 
              src={selectedImage.url} 
              alt="Full Res" 
              style={{ maxWidth: '80vw', maxHeight: '70vh', border: '2px solid #000' }} 
            />
            <br />
            <button 
              onClick={() => setSelectedImage(null)}
              style={{ marginTop: '20px', padding: '10px 20px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignGallery;
import React from 'react';

const ImageModal = ({ image, onClose }) => {
  // Logic: Only render if an image is selected
  if (!image) return null;

  return (
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
        <h4>Full Resolution Preview: {image.title}</h4>
        <img 
          src={image.url} 
          alt="Full Res" 
          style={{ maxWidth: '80vw', maxHeight: '70vh', border: '2px solid #000' }} 
        />
        <br />
        <button 
          onClick={onClose}
          style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
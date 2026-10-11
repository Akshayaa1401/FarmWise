import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#1b4332',
      color: '#b7e4c7',
      padding: '1.5rem 1.5rem',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center',
      fontSize: '0.85rem'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong style={{ color: '#ffffff' }}>FarmWise-New</strong> &copy; {new Date().getFullYear()} — Precision Agronomy Platform
        </div>
        <div>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', color: '#74c69d' }}>
            Spring Boot 3.x + MongoDB + React Phase 1
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

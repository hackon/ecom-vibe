import React from 'react';

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid #eaeaea', padding: '2rem', marginTop: 'auto', textAlign: 'center' }}>
      <p>&copy; {new Date().getFullYear()} Buildy McBuild - Quality Woodworking Supplies</p>
      <div style={{ marginTop: '1rem' }}>
        <a href="/about" style={{ margin: '0 1rem' }}>About Us</a>
        <a href="/contact" style={{ margin: '0 1rem' }}>Contact</a>
        <a href="/shipping" style={{ margin: '0 1rem' }}>Shipping Info</a>
      </div>
    </footer>
  );
};

export default Footer;

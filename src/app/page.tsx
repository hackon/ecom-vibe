import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to Buildy McBuild</h1>
        <p style={{ fontSize: '1.25rem', color: '#666' }}>
          Your one-stop shop for premium carpentry and woodworking supplies.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>Hardwoods</h2>
          <p>Oak, Walnut, Cherry, and more premium cuts for your finest projects.</p>
          <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Browse Wood
          </button>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>Precision Tools</h2>
          <p>Chisels, planes, and saws from the world&apos;s most trusted brands.</p>
          <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            View Tools
          </button>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>Hardware</h2>
          <p>Hinges, pulls, and finishes to give your work the perfect final touch.</p>
          <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Shop Hardware
          </button>
        </div>
      </section>

      <section style={{ marginTop: '4rem', padding: '2rem', backgroundColor: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
        <h2>Start Your Next Project Today</h2>
        <p>Quality materials for craftsmen who care about their work.</p>
      </section>
    </div>
  );
}

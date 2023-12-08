import React from 'react';

const HomePage = () => {
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)'}}>
      {/* Left Section */}
      <div style={{ flex: 1, backgroundColor: 'black', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div>
          <h2>Left Section</h2>
          <p>This is the left content.</p>
        </div>
      </div>

      {/* Right Section */}
      <div style={{ flex: 1, backgroundColor: 'black', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div>
          <h2>Right Section</h2>
          <p>This is the right content.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

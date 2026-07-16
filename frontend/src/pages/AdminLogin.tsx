import React, { useEffect } from 'react';

const AdminLogin: React.FC = () => {
  useEffect(() => {
    // Redirect to the static admin test page
    window.location.href = '/admin-static.html';
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: 12, textAlign: 'center' }}>
      <p>Yönlendiriliyorsunuz... Eğer tarayıcı sizi otomatik olarak yönlendirmezse <a href="/admin-static.html">buraya tıklayın</a>.</p>
    </div>
  );
};

export default AdminLogin;

import React from 'react';
import '../styles/Home.css';

const Home = () => {
   const [tab, setTab] = useState('dashboard');

  return (
 <div className="admin-layout">
      <aside className="sidebar">
        <h3>Quản trị</h3>
        <ul>
          <li className={tab==='dashboard' ? 'active' : ''} onClick={()=>setTab('dashboard')}>Thống kê</li>
          <li className={tab==='users' ? 'active' : ''} onClick={()=>setTab('users')}>Quản lý người dùng</li>
        </ul>
      </aside>
      <main className="main-content">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'users' && <User />}
      </main>
    </div>
  );

  

  // Dữ liệu cứng cho đơn hàng gần đây
}

export default Home; 
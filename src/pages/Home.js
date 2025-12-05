import React, { useState } from 'react';
import Dashboard from './Dashboard';
import User from './User';
import Product from './Product';
import Order from './Order';
import Banner from './Banner';
import '../styles/Home.css';
import Voucher from './voucher';
import AdminCategories from './AdminCategories';
import logo from '../assets/Logo-Cool-Mate_final.jpg';

const Home = () => {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <h3>Quản trị viên</h3>
        <ul>
          <li className={tab==='dashboard' ? 'active' : ''} onClick={()=>setTab('dashboard')}>Thống kê</li>
          <li className={tab==='users' ? 'active' : ''} onClick={()=>setTab('users')}>Quản lý người dùng</li>
          <li className={tab==='categories' ? 'active' : ''} onClick={()=>setTab('categories')}>Quản lý danh mục</li>
          <li className={tab==='products' ? 'active' : ''} onClick={()=>setTab('products')}>Quản lý sản phẩm</li>
          <li className={tab==='banner' ? 'active' : ''} onClick={()=>setTab('banner')}>Quản lý Banner</li>
          <li className={tab==='voucher' ? 'active' : ''} onClick={()=>setTab('voucher')}>Quản lý voucher</li>
          <li className={tab==='orders' ? 'active' : ''} onClick={()=>setTab('orders')}>Quản lý đơn hàng</li>
        </ul>
      </aside>

      <main className="main-content">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'users' && <User />}
        {tab === 'categories' && <AdminCategories />}
        {tab === 'products' && <Product />}
        {tab === 'orders' && <Order />}
        {tab === 'voucher' && <Voucher />}
        {tab === 'banner' && <Banner />}
      </main>
    </div>
  );
};

export default Home;

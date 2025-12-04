import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, Table, DatePicker, Space, Typography, Avatar, Tag, Modal, Button } from 'antd';
import {
    ShoppingOutlined, UserOutlined, DollarOutlined, CrownOutlined,
    CalendarOutlined, EyeOutlined, CheckCircleOutlined,
    CloseCircleOutlined, ClockCircleOutlined, CarOutlined, FileDoneOutlined
} from '@ant-design/icons';

import { productAPI, userAPI, orderAPI } from '../config/api';
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getStatusTag = (status) => {
    // Chuẩn hóa trạng thái về chữ thường
    const normalizedStatus = status ? status.toLowerCase() : '';
    switch (normalizedStatus) {
        case 'waiting': case 'pending': return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ xác nhận</Tag>;
        case 'confirmed': return <Tag icon={<FileDoneOutlined />} color="blue">Đã xác nhận</Tag>;
        case 'shipping': case 'delivering': return <Tag icon={<CarOutlined />} color="geekblue">Đang vận chuyển</Tag>;
        case 'delivered': case 'success': return <Tag icon={<CheckCircleOutlined />} color="success">Giao thành công</Tag>;
        case 'cancelled': case 'canceled': return <Tag icon={<CloseCircleOutlined />} color="error">Đã hủy</Tag>;
        default: return <Tag color="default">{status}</Tag>;
    }
};
const calculateTopUsers = (orders, users) => {
    if (!orders || !users) return [];
    const userSpendingMap = {};

    orders.forEach(order => {
        if (order.status === 'delivered') {
            
            const userId = order.userId; 
            
            if (userId) {
                if (!userSpendingMap[userId]) {
                    userSpendingMap[userId] = { totalSpent: 0, orderCount: 0 };
                }
                userSpendingMap[userId].totalSpent += (order.totalPrice || 0); 
                userSpendingMap[userId].orderCount += 1;
            }
        }
    });
    return users.map(user => {
        const stats = userSpendingMap[user._id] || { totalSpent: 0, orderCount: 0 };
        return { ...user, totalSpent: stats.totalSpent, orderCount: stats.orderCount };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);
};


const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalProducts: 0, totalUsers: 0, totalRevenue: 0, todayOrders: 0 });

    const [orders, setOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [topUsers, setTopUsers] = useState([]);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [productsData, usersData, ordersRes] = await Promise.all([
                productAPI.getAllProducts(),
                userAPI.getAllUsers(),
                orderAPI.getAllOrders()
            ]);

            const orderData = Array.isArray(ordersRes) ? ordersRes : ordersRes.data?.orders || ordersRes.data || [];
            const totalRevenue = orderData
                .filter(o => o.status === 'delivered')
                .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

            const today = dayjs().startOf('day');
            const todayOrders = orderData
                .filter(o => o.status === 'delivered' && dayjs(o.createdAt).isAfter(today))
                .reduce((sum, o) => {
                    const items = o.items || [];
                    return sum + items.reduce((q, item) => q + (item.purchaseQuantity || 0), 0);
                }, 0);

            setStats({
                totalProducts: productsData.length,
                totalUsers: usersData.length,
                totalRevenue, 
                todayOrders,
            });

            const sortedTopProducts = productsData
                .map(product => ({ name: product.name, sales: product.sold || 0 }))
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5);
            setTopProducts(sortedTopProducts);
            
            const rankedUsers = calculateTopUsers(orderData, usersData);
            setTopUsers(rankedUsers);
            
            setOrders(orderData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Gọi API khi component mount
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div style={{ padding: '0 12px' }}>
            <h2 style={{ marginBottom: 24 }}>Tổng quan hệ thống</h2>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}><Statistic title="Tổng số sản phẩm" value={stats.totalProducts} prefix={<ShoppingOutlined style={{ color: '#3f8600' }}/>} /></Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}><Statistic title="Tổng người dùng" value={stats.totalUsers} prefix={<UserOutlined style={{ color: '#1890ff' }}/>} /></Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}><Statistic title="Tổng doanh thu" value={stats.totalRevenue} prefix={<DollarOutlined style={{ color: '#cf1322' }}/>} formatter={(value) => formatCurrency(value)} /></Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}><Statistic title="Đã bán hôm nay" value={stats.todayOrders} prefix={<ShoppingOutlined style={{ color: '#722ed1' }}/>} /></Card>
                </Col>
            </Row>
            <div style={{ textAlign: 'center', color: '#888' }}>
                <p>...Dữ liệu chi tiết đang được xử lý...</p>
            </div>
        </div>
    );
};

export default Dashboard;
import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Table, DatePicker, Space, Typography, Avatar, Tag, Modal, Button } from 'antd';
import {
    ShoppingOutlined, UserOutlined, DollarOutlined, CrownOutlined,
    CalendarOutlined, EyeOutlined, CheckCircleOutlined,
    CloseCircleOutlined, ClockCircleOutlined, CarOutlined, FileDoneOutlined
} from '@ant-design/icons';

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

const Dashboard = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalProducts: 0, totalUsers: 0, totalRevenue: 0, todayOrders: 0 });

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
        </div>
    );
};

export default Dashboard;
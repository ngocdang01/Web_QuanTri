import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, Table, DatePicker, Space, Typography, Avatar, Tag, Modal, Button } from 'antd';
import {
    ShoppingOutlined, UserOutlined, DollarOutlined, CrownOutlined,
    CalendarOutlined, EyeOutlined, CheckCircleOutlined,
    CloseCircleOutlined, ClockCircleOutlined, CarOutlined, FileDoneOutlined
} from '@ant-design/icons';
// import thư viện biểu đồ
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { productAPI, userAPI, orderAPI } from '../config/api';
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

// Hàm định dạng tiền tệ VND
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getStatusTag = (status) => {
    // Chuẩn hóa trạng thái về chữ thường
    const normalizedStatus = status ? status.toLowerCase() : '';
    switch (normalizedStatus) {
        case 'waiting': case 'pending': return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ xử lý</Tag>;
        case 'confirmed': return <Tag icon={<FileDoneOutlined />} color="blue">Đã xác nhận</Tag>;
        case 'shipping': case 'delivering': case 'shipped': case 'shipper': return <Tag icon={<CarOutlined />} color="geekblue">Đang giao</Tag>;
        case 'delivered': case 'success': return <Tag icon={<CheckCircleOutlined />} color="success">Đã nhận hàng</Tag>;
        case 'cancelled': case 'canceled': return <Tag icon={<CloseCircleOutlined />} color="error">Đã hủy</Tag>;
        default: return <Tag color="default">{status}</Tag>;
    }
};

const calculateTopUsers = (orders, users) => {
    if (!orders || !users) return [];
    const userSpendingMap = {};

    orders.forEach(order => {
        if (order.status === 'delivered') {
            const userId = typeof order.userId === 'object' ? order.userId?._id : order.userId;            
            if (userId) {
                if (!userSpendingMap[userId]) {
                    userSpendingMap[userId] = { totalSpent: 0, orderCount: 0 };
                }
                userSpendingMap[userId].totalSpent += (order.finalTotal || 0); 
                userSpendingMap[userId].orderCount += 1;
            }
        }
    });

    return users.map(user => {
        const stats = userSpendingMap[user._id] || { totalSpent: 0, orderCount: 0 };
        return { ...user, totalSpent: stats.totalSpent, orderCount: stats.orderCount };
    })
    .filter(u => u.totalSpent > 0) 
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);
};

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalProducts: 0, totalUsers: 0, totalRevenue: 0, todayOrders: 0 });

    const [topProducts, setTopProducts] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [filteredRevenue, setFilteredRevenue] = useState(0);

    // State cho Modal chi tiết User
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);

    // --- API Fetching ---
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [productsData, usersData, ordersRes] = await Promise.all([
                productAPI.getAllProducts(),
                userAPI.getAllUsers(),
                orderAPI.getAllOrders()
            ]);

            const orderData = Array.isArray(ordersRes) ? ordersRes : ordersRes.data?.orders || ordersRes.data || [];
            
            // Tính toán thống kê
            const totalRevenue = orderData
                .filter(o => o.status === 'delivered')
                .reduce((sum, o) => sum + Number(o.finalTotal || 0), 0);

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

            // Top sản phẩm bán chạy nhất
            const sortedTopProducts = productsData
                .map(product => ({ name: product.name, sales: product.sold || 0 }))
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5);
            setTopProducts(sortedTopProducts);

            // Top khách hàng VIP
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

    // Lọc doanh thu theo khoảng thời gian
    useEffect(() => {
        if (dateRange && dateRange[0] && dateRange[1] && orders.length > 0) {
            const fromDate = dateRange[0].startOf('day');
            const toDate = dateRange[1].endOf('day');
            const total = orders
                .filter(order => {
                    const orderDate = dayjs(order.createdAt);
                    return order.status === 'delivered' && orderDate >= fromDate && orderDate <= toDate;
                })
                .reduce((sum, order) => sum + (order.finalTotal || 0), 0);
            setFilteredRevenue(total);
        }
    }, [dateRange, orders]);

    // --- Handlers cho Modal ---
    const handleShowUserDetail = (user) => {
        setSelectedUser(user);
        const specificOrders = orders.filter(order => {
            const orderUserId = typeof order.userId === 'object' ? order.userId?._id : order.userId;
            return orderUserId === user._id;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setUserOrders(specificOrders);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedUser(null);
    };

    // --- Cấu hình bảng ---
    const topUserColumns = [
        {
            title: 'Khách hàng', 
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} src={record.avatar} />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
             title: 'Số đơn', 
             dataIndex: 'orderCount', 
             key: 'orderCount', 
             align: 'center', 
             render: (count) => <Tag color="blue">{count} đơn</Tag> 
        },
        { 
            title: 'Tổng chi tiêu', 
            dataIndex: 'totalSpent', 
            key: 'totalSpent', 
            align: 'right', 
            render: (value) => <Text type="danger" strong>{formatCurrency(value)}</Text> 
        },
        { 
            title: '', 
            key: 'action', 
            render: (_, record) => (
                <Button 
                    type="link" 
                    icon={<EyeOutlined />} 
                    onClick={() => handleShowUserDetail(record)} 
                    /> 
            ),
        }
    ];

    const orderDetailColumns = [
        { 
            title: 'Mã đơn', 
            dataIndex: '_id', 
            key: '_id', 
            render: (text) => <Text code>{text.slice(-6).toUpperCase()}</Text> 
        },
        { 
            title: 'Ngày đặt', 
            dataIndex: 'createdAt', 
            key: 'createdAt', 
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm') 
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'items',
            key: 'items',
            render: (items) => (
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {items.map((item, idx) => (
                        <li key={idx} style={{ fontSize: '12px' }}>
                            {item.productId?.name || item.name} <span style={{color:'#888'}}>x{item.purchaseQuantity}</span>
                        </li>
                    ))}
                </ul>
            )
        },
        { 
            title: 'Tổng tiền', 
            dataIndex: 'finalTotal', 
            key: 'finalTotal', 
            align: 'right', 
            render: (price) => formatCurrency(price) 
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status', 
            align: 'center', 
            render: (status) => getStatusTag(status) 
        }
    ];

    return (
        <div style={{ padding: '0 12px' }}>
            <h2 style={{ marginBottom: 24 }}>Tổng quan hệ thống</h2>


            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading} bordered={false} bodyStyle={{ padding: 20 }}>
                        <Statistic title="Tổng số sản phẩm" value={stats.totalProducts} prefix={<ShoppingOutlined style={{ color: '#3f8600' }}/>} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading} bordered={false} bodyStyle={{ padding: 20 }}>
                        <Statistic title="Tổng người dùng" value={stats.totalUsers} prefix={<UserOutlined style={{ color: '#1890ff' }}/>} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading} bordered={false} bodyStyle={{ padding: 20 }}>
                        <Statistic title="Tổng doanh thu" value={stats.totalRevenue} prefix={<DollarOutlined style={{ color: '#cf1322' }}/>} formatter={(value) => formatCurrency(value)} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading} bordered={false} bodyStyle={{ padding: 20 }}>
                        <Statistic title="Đã bán hôm nay" value={stats.todayOrders} prefix={<ShoppingOutlined style={{ color: '#722ed1' }}/>} />
                    </Card>
                </Col>
            </Row>


            <Row style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card loading={loading} title={<Space><CalendarOutlined /><span>Thống kê doanh thu theo thời gian</span></Space>}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                            <Space direction="vertical">
                                <Text type="secondary">Chọn khoảng thời gian:</Text>
                                <RangePicker value={dateRange} onChange={setDateRange} format="DD/MM/YYYY" allowClear={false} />
                            </Space>
                            <div style={{ textAlign: 'right', background: '#f6ffed', padding: '10px 20px', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                                <Text type="secondary">Doanh thu trong khoảng này:</Text>
                                <div style={{ fontSize: '24px', color: '#3f8600', fontWeight: 'bold' }}>{formatCurrency(filteredRevenue)}</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>


            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Top 5 Sản phẩm bán chạy nhất" loading={loading} style={{ height: '100%' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value} />
                                <Tooltip formatter={(value) => [value, 'Đã bán']} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="sales" fill="#1890ff" barSize={20} radius={[0, 4, 4, 0]} label={{ position: 'right' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title={<Space><CrownOutlined style={{ color: '#faad14' }} /><span>Top Khách hàng VIP</span></Space>} loading={loading} style={{ height: '100%' }}>
                        <Table dataSource={topUsers} columns={topUserColumns} rowKey="_id" pagination={false} size="small" />
                    </Card>
                </Col>
            </Row>

            {/* Modal Chi tiết đơn hàng của User */}
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>Lịch sử mua hàng: <b>{selectedUser?.name}</b></span>
                    </Space>
                }
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                width={800}
            >
                <Table 
                    dataSource={userOrders} 
                    columns={orderDetailColumns} 
                    rowKey="_id"
                    pagination={{ pageSize: 5 }}
                    size="small"
                    scroll={{ x: 600 }}
                />
            </Modal>
        </div>
    );
};

export default Dashboard;
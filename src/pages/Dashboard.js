import React, { useState, useEffect, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { productAPI } from "../config/api";

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [topProducts, setTopProducts] = useState([]);

    const fetchTopProducts = useCallback(async () => {
        try {
            setLoading(true);

            // Gọi API lấy sản phẩm
            const products = await productAPI.getAllProducts();

            // Lọc TOP 5 theo sản phẩm có nhiều sold nhất
            const sortedTopProducts = products
                .map((p) => ({
                    name: p.name,
                    sales: p.sold || 0,
                }))
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5);

            setTopProducts(sortedTopProducts);
        } catch (error) {
            console.error("Lỗi khi lấy top sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTopProducts();
    }, [fetchTopProducts]);

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ marginBottom: 24 }}>Top sản phẩm bán chạy</h1>
            <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={topProducts}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                            formatter={(value) => [value, "Số lượng bán"]}
                            labelFormatter={(label) => `Sản phẩm: ${label}`}
                        />
                        <Bar
                            dataKey="sales"
                            fill="#15827a"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;

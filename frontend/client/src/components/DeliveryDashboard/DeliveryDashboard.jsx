import React, { useState, useEffect } from 'react';
import './DeliveryDashboard.css';

const DeliveryDashboard = ({ user, logout }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(null);

    // Fetch orders from backend
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://127.0.0.1:5555/orders");
                if (!res.ok) throw new Error("Failed to fetch orders");
                const data = await res.json();
                setOrders(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Update order status
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const res = await fetch(`http://127.0.0.1:5555/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update order");

            const updatedOrder = await res.json();
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? updatedOrder : o))
            );
            setShowStatusDropdown(null);
        } catch (err) {
            alert(err.message);
        }
    };

    // Delete order
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;

        try {
            const res = await fetch(`http://127.0.0.1:5555/orders/${orderId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete order");

            setOrders((prev) => prev.filter((o) => o.id !== orderId));
        } catch (err) {
            alert(err.message);
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'start delivery': return 'In Transit';
            case 'delivered': return 'Delivered';
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'start delivery': return 'status-transit';
            case 'delivered': return 'status-delivered';
            default: return '';
        }
    };

    const getStatusOptions = (currentStatus) => {
        const allStatuses = [
            { value: 'pending', label: 'Pending' },
            { value: 'start delivery', label: 'Start Delivery' },
            { value: 'delivered', label: 'Mark Delivered' }
        ];
        return allStatuses.filter(status => status.value !== currentStatus);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Delivery Admin Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user.name}</span>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </div>

            <div className="orders-section">
                <h2>All Orders ({orders.length})</h2>

                {loading && <p>Loading orders...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && !error && (
                    orders.length === 0 ? (
                        <p className="no-orders">No orders available.</p>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.id} className="order-card">
                                    <div className="order-info">
                                        <h3>{order.productName}</h3>
                                        <p><strong>Customer:</strong> {order.customerName}</p>
                                        <p><strong>Address:</strong> {order.address}</p>
                                        <p><strong>Price:</strong> ${order.price}</p>
                                        <p>
                                            <strong>Status:</strong>{' '}
                                            <span className={getStatusClass(order.status)}>
                                                {getStatusDisplay(order.status)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="order-actions">
                                        <div className="status-dropdown-container">
                                            <button
                                                onClick={() =>
                                                    setShowStatusDropdown(
                                                        showStatusDropdown === order.id ? null : order.id
                                                    )
                                                }
                                                className="status-btn"
                                            >
                                                Update Status
                                            </button>
                                            {showStatusDropdown === order.id && (
                                                <div className="status-dropdown">
                                                    {getStatusOptions(order.status).map((statusOption) => (
                                                        <button
                                                            key={statusOption.value}
                                                            onClick={() =>
                                                                handleStatusUpdate(order.id, statusOption.value)
                                                            }
                                                            className="status-option"
                                                        >
                                                            {statusOption.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default DeliveryDashboard;
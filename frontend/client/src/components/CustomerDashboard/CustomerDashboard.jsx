import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './CustomerDashboard.css';

const CustomerDashboard = ({ user, logout }) => {
    const [orders, setOrders] = useState([]);
    const [editingOrder, setEditingOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper to display friendly status
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'start delivery': return 'In Transit';
            case 'delivered': return 'Completed';
            default: return status;
        }
    };

    // Fetch customer orders
    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:5555/orders/customer/${user.id}`);
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

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const resetForm = () => setEditingOrder(null);

    const initialValues = {
        productName: editingOrder?.productName || '',
        address: editingOrder?.address || '',
        price: editingOrder?.price || ''
    };

    const validationSchema = Yup.object({
        productName: Yup.string().required('Product name is required'),
        address: Yup.string().required('Address is required'),
        price: Yup.number()
            .min(10, 'Minimum price is $10')
            .max(100, 'Maximum price is $100')
            .required('Price is required')
    });

    // Handle create/update
    const handleSubmit = async (values, { resetForm }) => {
        try {
            if (editingOrder) {
                const res = await fetch(`http://127.0.0.1:5555/orders/${editingOrder.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw new Error("Failed to update order");

                const updatedOrder = await res.json();

                // Update local state directly
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === updatedOrder.id ? updatedOrder : order
                    )
                );

                setEditingOrder(null);
                resetForm();
            } else {
                const newOrder = {
                    ...values,
                    customer_id: user.id,
                    status: 'pending'
                };
                const res = await fetch("http://127.0.0.1:5555/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newOrder),
                });
                if (!res.ok) throw new Error("Failed to create order");
                const createdOrder = await res.json();

                setOrders(prev => [...prev, createdOrder]);
                resetForm();
            }
        } catch (err) {
            alert(err.message);
        }
    };

    // Delete order
    const handleDelete = async (orderId) => {
        if (!window.confirm("Delete this order?")) return;
        try {
            const res = await fetch(`http://127.0.0.1:5555/orders/${orderId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete order");
            await fetchOrders();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Customer Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user.name}</span>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </div>

            <div className="order-form-section">
                <h2>{editingOrder ? 'Edit Order' : 'Place Order'}</h2>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ values, setFieldValue }) => {
                        useEffect(() => {
                            if (values.address && !values.price) {
                                setFieldValue('price', (Math.random() * 90 + 10).toFixed(2));
                            } else if (!values.address) {
                                setFieldValue('price', '');
                            }
                        }, [values.address, setFieldValue, values.price]);

                        return (
                            <Form className="order-form">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <Field name="productName" placeholder="Enter product name" />
                                    <ErrorMessage name="productName" component="div" className="error-message" />
                                </div>

                                <div className="form-group">
                                    <label>Delivery Address</label>
                                    <Field name="address" placeholder="Enter delivery address" />
                                    <ErrorMessage name="address" component="div" className="error-message" />
                                </div>

                                {values.price && (
                                    <div className="price-display">
                                        <strong>Price: ${values.price}</strong>
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button type="submit" className="place-order-btn">
                                        {editingOrder ? 'Update Order' : 'Place Order'}
                                    </button>
                                    {editingOrder && (
                                        <button type="button" onClick={resetForm} className="cancel-btn">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </div>

            <div className="orders-section">
                <h2>My Orders</h2>
                {loading && <p>Loading orders...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && !error && (
                    orders.length === 0 ? (
                        <p className="no-orders">No orders yet.</p>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.id} className="order-card">
                                    <div className="order-info">
                                        <h3>{order.productName}</h3>
                                        <p><strong>Address:</strong> {order.address}</p>
                                        <p><strong>Price:</strong> ${order.price}</p>
                                        <p>
                                            <strong>Status:</strong>{' '}
                                            <span className={`status ${order.status === 'pending' ? 'status-pending' :
                                                order.status === 'start delivery' ? 'status-transit' :
                                                    order.status === 'delivered' ? 'status-delivered' : ''
                                                }`}>
                                                {order.status === 'pending' ? 'Pending' :
                                                    order.status === 'start delivery' ? 'In Transit' :
                                                        order.status === 'delivered' ? 'Completed' :
                                                            order.status
                                                }
                                            </span>
                                        </p>
                                    </div>
                                    <div className="order-actions">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => setEditingOrder(order)}
                                                className="edit-btn"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(order.id)}
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

export default CustomerDashboard;
import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './LoginScreen.css';

const LoginScreen = ({ setUser }) => {
    const location = useLocation();
    const isSignUp = location.pathname === '/signup';
    const navigate = useNavigate();

    const initialValues = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        type: 'customer'
    };

    const validationSchema = Yup.object({
        name: isSignUp
            ? Yup.string().min(2, 'Name too short').max(50, 'Name too long').required('Name is required')
            : Yup.string(),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        confirmPassword: isSignUp
            ? Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm password is required')
            : Yup.string(),
        type: Yup.string().oneOf(['customer', 'delivery']).required('User type required')
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            if (isSignUp) {
                // ---- SIGNUP ----
                const res = await fetch("http://127.0.0.1:5555/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: values.name,
                        email: values.email,
                        password: values.password,
                        type: values.type
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.error || "Signup failed");
                    return;
                }

                alert("Signup successful! Please log in.");
                navigate("/login");
            } else {
                // ---- LOGIN ----
                const res = await fetch("http://127.0.0.1:5555/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: values.email,
                        password: values.password,
                        type: values.type
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.error);
                    return;
                }

                setUser(data); // backend should return user object
                navigate(data.type === 'customer' ? '/customer-dashboard' : '/delivery-dashboard');
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Server error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">DEL DELIVERY</h1>

                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ values, setFieldValue, isSubmitting }) => (
                        <Form className="auth-form">
                            <div className="user-type-selector">
                                <button
                                    type="button"
                                    className={`user-type-btn ${values.type === 'customer' ? 'active' : ''}`}
                                    onClick={() => setFieldValue('type', 'customer')}
                                >
                                    Customers
                                </button>
                                <button
                                    type="button"
                                    className={`user-type-btn ${values.type === 'delivery' ? 'active' : ''}`}
                                    onClick={() => setFieldValue('type', 'delivery')}
                                >
                                    Delivery Admin
                                </button>
                            </div>

                            <h2>{isSignUp ? 'Sign Up' : 'Login'} as {values.type === 'customer' ? 'Customer' : 'Delivery Admin'}</h2>

                            {isSignUp && (
                                <div className="form-group">
                                    <label>Name</label>
                                    <Field name="name" placeholder="Enter your Name" />
                                    <ErrorMessage name="name" component="div" className="error-message" />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Email</label>
                                <Field name="email" type="email" placeholder="Enter your Email" />
                                <ErrorMessage name="email" component="div" className="error-message" />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <Field name="password" type="password" placeholder="Enter your Password" />
                                <ErrorMessage name="password" component="div" className="error-message" />
                            </div>

                            {isSignUp && (
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <Field name="confirmPassword" type="password" placeholder="Confirm your Password" />
                                    <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                                </div>
                            )}

                            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
                            </button>

                            <p className="auth-link">
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                                <Link to={isSignUp ? '/login' : '/signup'}>
                                    {isSignUp ? ' Login' : ' Sign Up'}
                                </Link>
                            </p>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default LoginScreen;
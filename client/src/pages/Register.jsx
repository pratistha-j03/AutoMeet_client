import React, { useState } from 'react';
import { register } from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await register(formData);
      localStorage.setItem('token', res.data.token);
      navigate('/');
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <div className="card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name" 
            placeholder="Full Name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password (6+ chars)" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            minLength="6"
            style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '20px' }}
          />
          
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ marginTop: '15px' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthSuccess = () => {
  const [params] = useSearchParams();
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const role  = params.get('role');
    const name  = params.get('name');
    const id = params.get('id');
    const email = params.get('email');
    const businessName = params.get('businessName');

    if (token) {
      const userData = {
        _id: id || '',
        token,
        role,
        email: decodeURIComponent(email || ''),
        name: decodeURIComponent(name || ''),
        businessName: decodeURIComponent(businessName || ''),
      };
      updateUser(userData);
      navigate(role === 'student' ? '/dashboard' : '/my-tasks');
    } else {
      navigate('/login');
    }
  }, [params, updateUser, navigate]);

  return (
    <div className="spinner-wrap">
      <div>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>Signing you in...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;

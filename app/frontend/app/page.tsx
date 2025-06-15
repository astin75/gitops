'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [count, setCount] = useState<number>(0);
  const [lastVisit, setLastVisit] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // 초기 방문자 수 로드
  useEffect(() => {
    fetchVisitorCount();
  }, []);

  const fetchVisitorCount = async () => {
    try {
      const response = await fetch(`${API_URL}/visit`);
      if (response.ok) {
        const data = await response.json();
        setCount(data.count);
        setLastVisit(data.last_visit);
      }
    } catch (err) {
      setError('Failed to load visitor count');
    }
  };

  const handleClick = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCount(data.count);
        setLastVisit(data.last_visit);
      } else {
        setError('Failed to update visitor count');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '400px',
        width: '100%',
      }}>
        <h1 style={{
          fontSize: '2.5em',
          marginBottom: '20px',
          fontWeight: '300',
        }}>방문자 카운터</h1>
        
        <div style={{
          fontSize: '4em',
          fontWeight: 'bold',
          margin: '20px 0',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
        }}>{count}</div>
        
        <button
          onClick={handleClick}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            fontSize: '1.2em',
            borderRadius: '50px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transform: loading ? 'scale(0.95)' : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }
          }}
        >
          {loading ? '처리중...' : '클릭하세요!'}
        </button>
        
        {error && (
          <p style={{
            color: '#ff6b6b',
            marginTop: '20px',
            fontSize: '0.9em',
          }}>{error}</p>
        )}
        
        {lastVisit && lastVisit !== 'No visits yet' && (
          <p style={{
            marginTop: '20px',
            fontSize: '0.8em',
            opacity: 0.8,
          }}>
            마지막 방문: {new Date(lastVisit).toLocaleString('ko-KR')}
          </p>
        )}
      </div>
    </main>
  );
}
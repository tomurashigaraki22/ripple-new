"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react"; // 👈 Spinner icon

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // 👈 local loading state
  const route = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start loading
    try {
      const response = await fetch('http://172.20.10.2:1234/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || '❌ Login failed');
      } else {
        await login(data.user, data.token, 1);
        setMessage("✅ Login successful!");
        setTimeout(() => {
          route.push("/marketplace");
        }, 2000);
      }
    } catch (e) {
      console.error("Login failed:", e);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-30 px-4">
      <div className="max-w-md mx-auto glass-effect rounded-2xl p-8 mt-8">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#39FF14] to-[#00ff99] bg-clip-text text-transparent">
          Welcome Back
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {message !== "" && (
            <div className="text-center mb-4">
              <p className="text-gray-400">{message}</p>
            </div>
          )}

          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#39FF14]/20 focus:border-[#39FF14] focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#39FF14]/20 focus:border-[#39FF14] focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full btn-neon py-3 rounded-lg flex items-center justify-center gap-2"
            disabled={loading} // disable while loading
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> 
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-[#39FF14] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}

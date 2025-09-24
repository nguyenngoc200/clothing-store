'use client';

import React from 'react';
export default function LoginPage() {
  const [email, setEmail] = React.useState('');

  async function handleLogin(e: React.FormEvent) {}

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            type="email"
            className="border rounded px-3 py-2"
          />
          <button className="bg-sky-600 text-white rounded px-4 py-2">Send magic link</button>
        </form>
      </div>
    </div>
  );
}

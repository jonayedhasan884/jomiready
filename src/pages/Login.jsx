
import { useState } from 'react'
import { ShieldCheck, ArrowRight, LockKeyhole } from 'lucide-react'

export default function Login({ onLogin, onBack }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    if (username === 'staff' && password === '123456') {
      setError('')
      onLogin()
    } else {
      setError('ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।')
    }
  }

  return (
    <main className="login-page">
      <button className="login-back" onClick={onBack}>
        ← হোমপেজে ফিরে যান
      </button>

      <section className="login-card">
        <div className="login-icon">
          <ShieldCheck size={34} />
        </div>

        <h1>স্টাফ লগইন</h1>
        <p>JomiReady যাচাই ড্যাশবোর্ডে প্রবেশ করুন</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">ইউজারনেম</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ইউজারনেম লিখুন"
            required
          />

          <label htmlFor="password">পাসওয়ার্ড</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="পাসওয়ার্ড লিখুন"
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button className="login-submit" type="submit">
            <LockKeyhole size={18} />
            লগইন করুন
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="demo-credentials">
          <strong>ডেমো অ্যাকাউন্ট</strong>
          <p>ইউজারনেম: <b>staff</b></p>
          <p>পাসওয়ার্ড: <b>123456</b></p>
        </div>

        <small>এটি শুধুমাত্র হ্যাকাথনের ডেমো লগইন।</small>
      </section>
    </main>
  )
}

import { useEffect, useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, Moon, Sparkles, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import SpendWiseMark from './SpendWiseMark.jsx'
import FloatingAstronaut from './FloatingAstronaut.jsx'
import api from '../api.js'

const cards = [
  { className: 'tunnel-card card-a', label: 'DAILY FLOW', value: '₹2,840', color: 'violet' },
  { className: 'tunnel-card card-b', label: 'SAVINGS GOAL', value: '68%', color: 'lime' },
  { className: 'tunnel-card card-c', label: 'NET BALANCE', value: '₹12.8k', color: 'blue' },
  { className: 'tunnel-card card-d', label: 'THIS MONTH', value: '+14.2%', color: 'peach' },
  { className: 'tunnel-card card-e', label: 'TRANSACTIONS', value: '24', color: 'pink' },
]

const getAuthError = (requestError) => {
  if (!requestError.response) return 'The server is unavailable. Start the backend and check the MongoDB Atlas network access settings.'
  return requestError.response.data?.message || 'Unable to authenticate. Please check your login details.'
}

export default function LoginPage({ onLogin }) {
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [signup, setSignup] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setError('')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Enter your login ID and password to continue.')
      return
    }
    setBusy(true)
    try {
      const { data } = await api.post(`/auth/${signup ? 'signup' : 'login'}`, { email: email.trim(), password })
      onLogin(data.data.accessToken)
    } catch (requestError) {
      setError(getAuthError(requestError))
    } finally { setBusy(false) }
  }

  return (
    <main className="login-shell">
      <div className="login-grid" />
      <div className="login-orbit orbit-one" />
      <div className="login-orbit orbit-two" />
      <div className="login-glow" />
      <header className="login-nav">
        <a className="login-brand" href="/"><span className="login-brand-mark"><SpendWiseMark size={29} /></span>spend<span>wise</span></a>
        <div className="login-nav-actions"><span className="login-nav-note"><span className="nav-pulse" /> PRIVATE FINANCE OS</span><button className="login-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}</button></div>
      </header>
      <section className="login-stage">
        <div className="login-copy">
          <p className="login-kicker"><Sparkles size={14} /> YOUR MONEY, IN MOTION</p>
          <h1>Step into<br /><em>clarity.</em></h1>
          <p className="login-description">A beautifully simple place to understand your spending, build better habits, and make every dollar count.</p>
          <div className="login-stat"><strong>01</strong><span>One calm space for all your everyday decisions.</span></div>
        </div>
        <div className="tunnel"><FloatingAstronaut /><div className="tunnel-rings"><div className="tunnel-ring ring-a" /><div className="tunnel-ring ring-b" /><div className="tunnel-ring ring-c" /></div>{cards.map((card) => <div className={card.className} key={card.label}><span>{card.label}</span><strong>{card.value}</strong><i className={`card-line ${card.color}`} /></div>)}</div>
        <form className="login-card" onSubmit={submit}>
          <div className="login-card-top"><span className="login-card-label">WELCOME BACK</span><span className="login-step">01 / 02</span></div>
          <h2>{signup ? 'Create your space.' : 'Sign in to your space.'}</h2>
          <p className="login-card-sub">Pick up right where you left off.</p>
          <label>Login ID or email<div className="login-input"><Mail size={16} /><input type="text" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="username" /></div></label>
          <label>Password<div className="login-input"><LockKeyhole size={16} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="current-password" /></div></label>
          {error && <p className="login-error">{error}</p>}
          <button className="login-submit" type="submit" disabled={busy}>{busy ? 'Please wait...' : signup ? 'Create account' : 'Enter dashboard'} {!busy && <ArrowRight size={17} />}</button>
          {!signup && import.meta.env.DEV && <button className="login-demo" type="button" onClick={async () => {
            const demoEmail = import.meta.env.VITE_DEMO_ADMIN_LOGIN_ID || 'admin@spendwise.local'
            const demoPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'Admin@12345'
            setEmail(demoEmail); setPassword(demoPassword); setError(''); setBusy(true)
            try {
              const { data } = await api.post('/auth/login', { email: demoEmail, password: demoPassword })
              onLogin(data.data.accessToken)
            } catch (requestError) {
              setError(getAuthError(requestError))
            } finally { setBusy(false) }
          }}>Use demo admin login</button>}
          <button className="login-switch" type="button" onClick={() => { setSignup((current) => !current); setError('') }}>{signup ? 'Already have an account? Sign in' : 'New to SpendWise? Create an account'}</button>
          <small className="login-privacy">Your data stays yours. Always.</small>
        </form>
      </section>
      <footer className="login-footer"><span>SCROLL TO EXPLORE</span><i /></footer>
    </main>
  )
}

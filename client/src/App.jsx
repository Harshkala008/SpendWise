import { useEffect, useRef, useState } from 'react'
import {
  CalendarDays, Check, CircleDollarSign, Filter, LoaderCircle, LogOut,
  Bell, CheckCircle2, Edit3, History, Home, Moon, Plus, Receipt, RefreshCw, Search, Settings, ShieldCheck, Sun, Trash2, TrendingUp, UserRound, WalletCards, X,
} from 'lucide-react'
import './App.css'
import { useTheme } from './context/ThemeContext.jsx'
import CosmicBackground from './components/CosmicBackground.jsx'
import LoginPage from './components/LoginPage.jsx'
import SpendWiseMark from './components/SpendWiseMark.jsx'
import api, { setAccessToken } from './api.js'

const categories = ['Food', 'Groceries', 'Rent', 'Utilities', 'Bills', 'Dining', 'Travel', 'Entertainment', 'Health', 'Shopping', 'Education', 'Subscriptions', 'Other']
const paymentMethods = ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Net Banking', 'Online Payment', 'Wallet', 'Cheque', 'Bank Transfer', 'Other']
const makeEmptyForm = () => ({ title: '', amount: '', category: 'Food', categoryName: '', paymentMethod: 'UPI', date: new Date().toISOString().slice(0, 10), notes: '' })
const currencyLocale = { INR: 'en-IN', USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB' }
const money = (value, currency = 'INR') => new Intl.NumberFormat(currencyLocale[currency] || 'en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value || 0)
const compactMoney = (value, currency = 'INR') => new Intl.NumberFormat(currencyLocale[currency] || 'en-IN', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(value || 0)
const prettyDate = (value) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
const currentMonth = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date()).toUpperCase()
const monthValue = new Date().toISOString().slice(0, 7)

function SpendingChart({ total, currency }) {
  const [hovered, setHovered] = useState(false)
  const points = [18, 38, 30, 58, 42, 70, 61, 88, 76, 94]
  const max = Math.max(total, 1)
  return (
    <svg className="spending-chart" viewBox="0 0 620 180" preserveAspectRatio="none" aria-label="Spending trend" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b7ff46" stopOpacity=".3" /><stop offset="1" stopColor="#b7ff46" stopOpacity="0" /></linearGradient></defs>
      <path d={`M0 150 C70 ${150 - points[0]} 100 ${150 - points[1]} 140 ${150 - points[2]} S210 ${150 - points[3]} 280 ${150 - points[4]} S370 ${150 - points[5]} 420 ${150 - points[6]} S520 ${150 - points[7]} 620 ${150 - points[8]}`} fill="none" stroke="#b7ff46" strokeWidth="3" />
      <path d={`M0 150 C70 ${150 - points[0]} 100 ${150 - points[1]} 140 ${150 - points[2]} S210 ${150 - points[3]} 280 ${150 - points[4]} S370 ${150 - points[5]} 420 ${150 - points[6]} S520 ${150 - points[7]} 620 ${150 - points[8]} V180 H0 Z`} fill="url(#chart-fill)" />
      <line x1="0" y1="150" x2="620" y2="150" stroke="rgba(255,255,255,.12)" />
      <text x="8" y="174" fill="rgba(255,255,255,.4)" fontSize="10">APR 01</text><text x="278" y="174" fill="rgba(255,255,255,.4)" fontSize="10">APR 15</text><text x="574" y="174" fill="rgba(255,255,255,.4)" fontSize="10">APR 30</text>
      <text x="566" y="28" fill="#b7ff46" fontSize="11">{compactMoney(max, currency)}</text>
      {hovered && <g className="chart-tooltip"><rect x="440" y="8" width="154" height="30" rx="7" fill="#101720" stroke="rgba(183,255,70,.5)" /><text x="452" y="21" fill="#b7ff46" fontSize="10">LIVE MONTHLY TOTAL</text><text x="452" y="33" fill="#f7f7f3" fontSize="11">{money(total, currency)}</text></g>}
    </svg>
  )
}

function ExpensePieChart({ breakdown, expenseCount, currency }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const colors = ['#b7ff46', '#a9b2ff', '#ffb37a', '#ef83ad', '#72d6d1']
  const items = breakdown.slice(0, 5)
  const total = items.reduce((sum, item) => sum + item.total, 0)
  const center = 75
  const radius = 52
  const depth = 7
  const polar = (angle, distance) => {
    const radians = (angle - 90) * Math.PI / 180
    return { x: center + distance * Math.cos(radians), y: center + distance * Math.sin(radians) }
  }
  const slicePath = (startAngle, endAngle, distance = radius) => {
    const start = polar(endAngle, distance)
    const end = polar(startAngle, distance)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${center} ${center} L ${start.x} ${start.y} A ${distance} ${distance} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
  }
  const slices = items.reduce((result, item, index) => {
    const start = result.at(-1)?.end || 0
    const end = start + (total ? item.total / total * 360 : 0)
    return [...result, { item, index, start, end }]
  }, [])

  return (
    <div className="expense-pie-wrap">
      <div className="expense-pie">
        <svg className="expense-pie-svg" viewBox="0 0 150 150" role="img" aria-label="Expense breakdown by category">
          <ellipse cx="75" cy="82" rx="55" ry="15" fill="rgba(0,0,0,.24)" />
          {(slices.length ? slices : [{ item: { total: 0 }, index: 0, start: 0, end: 360 }]).map(({ item, index, start, end }) => (
            <g key={item.category || 'empty'} className={`pie-slice ${hoveredIndex === index ? 'is-hovered' : ''}`} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
              <path d={slicePath(start, end, radius)} transform={`translate(0 ${depth})`} fill="rgba(0,0,0,.25)" />
              <path d={slicePath(start, end)} fill={slices.length ? colors[index] : '#364052'} />
            </g>
          ))}
          <circle cx="75" cy="75" r="28" fill="#17202a" />
          <text x="75" y="73" textAnchor="middle" fill="#f7f7f3" fontSize="23" fontWeight="700">{hoveredIndex !== null && slices[hoveredIndex] ? Math.round(slices[hoveredIndex].item.total / total * 100) : expenseCount}</text>
          <text x="75" y="87" textAnchor="middle" fill="rgba(247,247,243,.58)" fontSize="9">{hoveredIndex !== null && slices[hoveredIndex] ? '%' : 'entries'}</text>
        </svg>
        {hoveredIndex !== null && slices[hoveredIndex] && <div className="pie-tooltip"><strong>{slices[hoveredIndex].item.category}</strong><span>{money(slices[hoveredIndex].item.total, currency)} · {Math.round(slices[hoveredIndex].item.total / total * 100)}%</span></div>}
      </div>
      <div className="mix-list">
        {(items.length ? items : [{ category: 'No data', total: 0 }]).map((item, index) => (
          <div className="mix-item" key={item.category}>
            <i className={`mix-dot mix-${index}`} style={{ background: colors[index] }} />
            <span>{item.category}</span>
            <strong>{total ? Math.round(item.total / total * 100) : 0}%</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const [authenticated, setAuthenticated] = useState(false)
  const [form, setForm] = useState(makeEmptyForm)
  const [expenses, setExpenses] = useState([])
  const [pagination, setPagination] = useState({ totalItems: 0 })
  const [filters, setFilters] = useState({ category: '', paymentMethod: '', startDate: '', endDate: '' })
  const [historyMonth, setHistoryMonth] = useState(monthValue)
  const [historyDate, setHistoryDate] = useState('')
  const [summary, setSummary] = useState({ totalSpent: 0, expenseCount: 0, breakdown: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const [activeSection, setActiveSection] = useState('home')
  const [navMotion, setNavMotion] = useState(0)
  const navRef = useRef(null)
  const navItemRefs = useRef({})
  const [settings, setSettings] = useState(() => {
    try {
      return { currency: localStorage.getItem('spendwise-currency') || 'INR', weekStartsOn: localStorage.getItem('spendwise-week-start') || 'Monday', reminders: localStorage.getItem('spendwise-reminders') !== 'false', customCategories: JSON.parse(localStorage.getItem('spendwise-custom-categories') || '[]'), customPaymentMethods: JSON.parse(localStorage.getItem('spendwise-custom-payment-methods') || '[]') }
    } catch { return { currency: 'INR', weekStartsOn: 'Monday', reminders: true } }
  })
  const [editingExpense, setEditingExpense] = useState(null)
  const [customCategoryDraft, setCustomCategoryDraft] = useState('')
  const [customPaymentDraft, setCustomPaymentDraft] = useState('')
  const [editingCustomOption, setEditingCustomOption] = useState(null)
  useEffect(() => {
    api.post('/auth/refresh').then(({ data }) => {
      setAccessToken(data.data.accessToken)
      setAuthenticated(true)
    }).catch(() => setAuthenticated(false))
  }, [])

  const loadExpenses = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/expenses', { params: { ...filters, sort: '-date', limit: 50 } })
      setExpenses(data.data.expenses); setPagination(data.data.pagination); setNotice(null)
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.message || 'Cannot reach the API. Start the backend and MongoDB first.' })
    } finally { setLoading(false) }
  }
  const loadSummary = async () => {
    const [year, month] = (activeSection === 'history' ? historyMonth : monthValue).split('-').map(Number)
    try {
      const { data } = await api.get('/expenses/summary', { params: { month, year } })
      setSummary(data.data)
    } catch { setSummary({ totalSpent: 0, expenseCount: 0, breakdown: [] }) }
  }
  useEffect(() => {
    if (!authenticated) return
    loadExpenses(); loadSummary()
  }, [authenticated, activeSection, filters.category, filters.paymentMethod, filters.startDate, filters.endDate, historyMonth])
  useEffect(() => {
    const updateIndicator = () => {
      const nav = navRef.current
      const item = navItemRefs.current[activeSection]
      if (!nav || !item) return
      const navRect = nav.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()
      nav.style.setProperty('--nav-drop-x', `${itemRect.left - navRect.left}px`)
      nav.style.setProperty('--nav-drop-width', `${itemRect.width}px`)
    }
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeSection])
  const changeForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const changeFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  const selectHistoryMonth = (event) => {
    const value = event.target.value
    setHistoryMonth(value)
    setHistoryDate('')
    const [year, month] = value.split('-').map(Number)
    const lastDay = new Date(year, month, 0).getDate()
    setFilters((current) => ({ ...current, startDate: `${value}-01`, endDate: `${value}-${String(lastDay).padStart(2, '0')}` }))
  }
  const selectHistoryDate = (event) => {
    const value = event.target.value
    setHistoryDate(value)
    setHistoryMonth(value.slice(0, 7))
    setFilters((current) => ({ ...current, startDate: value, endDate: value }))
  }
  const clearHistoryPeriod = () => {
    setHistoryDate('')
    setHistoryMonth(monthValue)
    setFilters((current) => ({ ...current, startDate: '', endDate: '' }))
  }
  const navigateToSection = (section) => {
    setActiveSection(section)
    setNavMotion((current) => current + 1)
    if (section === 'history' && !historyDate && !filters.startDate && !filters.endDate) {
      selectHistoryMonth({ target: { value: historyMonth } })
    }
  }
  const clearAllFilters = () => {
    if (activeSection === 'history') {
      clearHistoryPeriod()
      return
    }
    setFilters({ category: '', paymentMethod: '', startDate: '', endDate: '' })
  }
  const submitExpense = async (event) => {
    event.preventDefault(); setSaving(true)
    try {
      const categoryName = form.category === 'Other' ? form.categoryName.trim() : ''
      const notes = categoryName ? `Other: ${categoryName}${form.notes.trim() ? ` | ${form.notes.trim()}` : ''}` : form.notes
      await api.post('/expenses', { ...form, category: categoryName || form.category, notes, amount: Number(form.amount) })
      setForm(makeEmptyForm()); setNotice({ type: 'success', text: 'Expense added successfully.' }); await Promise.all([loadExpenses(), loadSummary()])
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Could not save this expense.' })
    } finally { setSaving(false) }
  }
  const saveEditedExpense = async (event) => {
    event.preventDefault(); setSaving(true)
    try {
      const categoryName = editingExpense.category === 'Other' ? editingExpense.categoryName.trim() : ''
      const notes = categoryName ? `Other: ${categoryName}${editingExpense.notes.trim() ? ` | ${editingExpense.notes.trim()}` : ''}` : editingExpense.notes
      await api.patch(`/expenses/${editingExpense._id}`, { amount: Number(editingExpense.amount), category: categoryName || editingExpense.category, paymentMethod: editingExpense.paymentMethod, date: editingExpense.date, notes })
      setEditingExpense(null); setNotice({ type: 'success', text: 'Expense updated successfully.' }); await Promise.all([loadExpenses(), loadSummary()])
    } catch (error) { setNotice({ type: 'error', text: error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Could not update this expense.' }) }
    finally { setSaving(false) }
  }
  const deleteExpense = async (id) => {
    try { await api.delete(`/expenses/${id}`); setNotice({ type: 'success', text: 'Expense deleted.' }); await Promise.all([loadExpenses(), loadSummary()]) }
    catch (error) { setNotice({ type: 'error', text: error.response?.data?.message || 'Could not delete this expense.' }) }
  }
  const average = summary.expenseCount ? summary.totalSpent / summary.expenseCount : 0
  const topCategory = summary.breakdown[0]?.category || '—'
  const displayMoney = (value) => money(value, settings.currency)
  const updateSetting = (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    if (key === 'currency') localStorage.setItem('spendwise-currency', value)
    if (key === 'weekStartsOn') localStorage.setItem('spendwise-week-start', value)
    if (key === 'reminders') localStorage.setItem('spendwise-reminders', String(value))
    if (key === 'customCategories') localStorage.setItem('spendwise-custom-categories', JSON.stringify(value))
    if (key === 'customPaymentMethods') localStorage.setItem('spendwise-custom-payment-methods', JSON.stringify(value))
    setNotice({ type: 'success', text: 'Settings saved.' })
  }
  const categoryOptions = [...categories.filter((category) => category !== 'Other'), ...settings.customCategories, 'Other']
  const paymentOptions = [...paymentMethods.filter((method) => method !== 'Other'), ...settings.customPaymentMethods, 'Other']
  const addCustomOption = (key, draft, setDraft) => {
    const value = draft.trim()
    if (!value) return
    if (settings[key].length >= 3 || settings[key].includes(value) || categories.includes(value) || paymentMethods.includes(value)) {
      setNotice({ type: 'error', text: 'Use a new name, with up to 3 custom options.' }); return
    }
    updateSetting(key, [...settings[key], value]); setDraft('')
  }
  const deleteCustomOption = (key, index) => {
    updateSetting(key, settings[key].filter((_, itemIndex) => itemIndex !== index))
    if (editingCustomOption?.key === key && editingCustomOption.index === index) setEditingCustomOption(null)
  }
  const renameCustomOption = (key, index, value) => {
    const nextValue = value.trim()
    if (!nextValue || settings[key].some((item, itemIndex) => itemIndex !== index && item.toLowerCase() === nextValue.toLowerCase()) || categories.includes(nextValue) || paymentMethods.includes(nextValue)) {
      setNotice({ type: 'error', text: 'Use a unique custom name.' }); return
    }
    const next = [...settings[key]]
    next[index] = nextValue
    updateSetting(key, next)
    setEditingCustomOption(null)
  }
  const renderCustomOptions = (key) => settings[key].map((item, index) => (
    <span className="custom-tag" key={`${item}-${index}`}>
      {editingCustomOption?.key === key && editingCustomOption.index === index
        ? <input className="custom-tag-edit" value={editingCustomOption.value} onChange={(event) => setEditingCustomOption({ ...editingCustomOption, value: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') renameCustomOption(key, index, editingCustomOption.value); if (event.key === 'Escape') setEditingCustomOption(null) }} autoFocus />
        : <>{item}<span className="custom-tag-actions"><button type="button" onClick={() => setEditingCustomOption({ key, index, value: item })} aria-label={`Rename ${item}`} title="Rename"><Edit3 size={11} /></button><button type="button" onClick={() => deleteCustomOption(key, index)} aria-label={`Delete ${item}`} title="Delete"><Trash2 size={11} /></button></span></>}
    </span>
  ))

  if (!authenticated) return <LoginPage onLogin={(token) => { setAccessToken(token); setAuthenticated(true) }} />

  return (
    <main className="app-shell">
      <CosmicBackground />
      <header className="topbar">
        <a className="brand" href="/"><span className="brand-mark"><SpendWiseMark size={30} /></span>Spend<span>wise</span></a>
        <div className="topbar-meta"><span className="workspace-dot" /> Personal workspace <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button><button className="theme-toggle logout-button" type="button" onClick={async () => { await api.post('/auth/logout').catch(() => {}); setAccessToken(null); setAuthenticated(false) }} aria-label="Sign out"><LogOut size={15} /></button><span className="avatar">HM</span></div>
      </header>

      <nav ref={navRef} className="section-nav" aria-label="Main navigation">
        <span className="section-nav-drop" aria-hidden="true" />
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'history', label: 'History', icon: History },
          { id: 'profile', label: 'Profile', icon: UserRound },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
          <button ref={(element) => { navItemRefs.current[id] = element }} key={id} className="section-nav-item" data-motion={activeSection === id ? navMotion : undefined} type="button" aria-current={activeSection === id ? 'page' : undefined} onClick={() => navigateToSection(id)}>
            <span className="section-nav-icon"><Icon size={16} /></span>{label}
          </button>
        ))}
      </nav>

      <section className="welcome-row"><div><p className="eyebrow">PERSONAL FINANCE / OVERVIEW</p><h1>Your money,<br /><em>in focus.</em></h1><p className="subheading">A calm, clear view of your everyday spending.</p></div><div className="date-pill"><CalendarDays size={16} /><span>{currentMonth}<br /><strong>Monthly review</strong></span></div></section>
      {notice && <div className={`notice ${notice.type}`}><span>{notice.type === 'success' ? <Check size={17} /> : <X size={17} />}</span>{notice.text}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss"><X size={15} /></button></div>}

      {activeSection === 'home' && <section className="bento-grid">
        <article className="bento-card hero-card"><div className="card-label">TOTAL SPENT THIS MONTH <span className="live-badge">LIVE</span></div><div className="hero-number">{displayMoney(summary.totalSpent)}</div><div className="hero-meta"><span className="positive"><TrendingUp size={14} /> Tracking your activity</span><span>{summary.expenseCount} transactions</span></div><SpendingChart total={summary.totalSpent} currency={settings.currency} /></article>
        <article className="bento-card allocation-card"><div className="card-label">EXPENSE BREAKDOWN</div><ExpensePieChart breakdown={summary.breakdown} expenseCount={summary.expenseCount} currency={settings.currency} /></article>
        <article className="mini-card accent-mini"><span>TOP CATEGORY</span><strong>{topCategory}</strong><small>{summary.breakdown[0] ? displayMoney(summary.breakdown[0].total) : 'Nothing logged yet'}</small></article>
        <article className="mini-card"><span>AVERAGE EXPENSE</span><strong>{displayMoney(average)}</strong><small>Across this month</small></article>
      </section>}

      {activeSection === 'home' && <div className="content-grid"><section className="panel form-panel"><div className="panel-heading"><div><p className="eyebrow">QUICK ENTRY</p><h2>Add an expense</h2></div><span className="panel-number">01</span></div><form onSubmit={submitExpense}><label>What was it for?<input name="title" value={form.title} onChange={changeForm} placeholder="e.g. Swiggy order or metro recharge" minLength="2" maxLength="100" required /></label><div className="form-row"><label>Amount<div className="input-prefix"><span>₹</span><input name="amount" value={form.amount} onChange={changeForm} type="number" min="0.01" step="0.01" placeholder="0.00" required /></div></label><label>Expense category<select name="category" value={form.category} onChange={changeForm}>{categoryOptions.map((category) => <option key={category}>{category}</option>)}</select>{form.category === 'Other' && <input className="inline-detail-input" name="categoryName" value={form.categoryName} onChange={changeForm} maxLength="40" placeholder="Optional category name" />}</label></div><div className="form-row"><label>Paid using<select name="paymentMethod" value={form.paymentMethod} onChange={changeForm}>{paymentOptions.map((method) => <option key={method}>{method}</option>)}</select></label><label>Date<input name="date" value={form.date} onChange={changeForm} type="date" required /></label></div><label>Note <span className="muted">(optional)</span><input name="notes" value={form.notes} onChange={changeForm} maxLength="500" placeholder="Add a note" /></label><button className="primary-button" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />}{saving ? 'Saving...' : 'Save expense'}</button></form></section>
        <section className="panel breakdown-panel"><div className="panel-heading"><div><p className="eyebrow">MONTHLY OVERVIEW</p><h2>By category</h2></div><span className="panel-number">02</span></div>{summary.breakdown.length ? <div className="breakdown-list">{summary.breakdown.map((item, index) => <div className="breakdown-item" key={item.category}><div className="breakdown-label"><span className={`category-dot dot-${index % 5}`} /><span>{item.category}</span><strong>{displayMoney(item.total)}</strong></div><div className="bar-track"><span style={{ width: `${Math.max((item.total / summary.totalSpent) * 100, 3)}%` }} /></div><small>{item.count} {item.count === 1 ? 'expense' : 'expenses'}</small></div>)}</div> : <div className="empty-state small"><CircleDollarSign size={26} /><p>Your category breakdown will appear here.</p></div>}</section></div>}

      {activeSection !== 'profile' && activeSection !== 'settings' && <>{activeSection === 'history' && <section className="history-calendar panel"><div className="history-calendar-copy"><p className="eyebrow">DATE EXPLORER</p><h2>Find your spending</h2><p>Choose a month for a complete view, or narrow it down to one day.</p></div><div className="calendar-controls"><label><span>Month</span><input type="month" value={historyMonth} onChange={selectHistoryMonth} /></label><label><span>Exact date</span><input type="date" value={historyDate} onChange={selectHistoryDate} /></label><button className="clear-button" type="button" onClick={clearHistoryPeriod}>Reset</button></div><div className="period-summary"><CalendarDays size={16} /><strong>{historyDate ? prettyDate(historyDate) : new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(`${historyMonth}-02`))}</strong><span>{pagination.totalItems || 0} matching {pagination.totalItems === 1 ? 'expense' : 'expenses'}</span></div></section>}<section className="panel transactions-panel"><div className="transactions-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h2>{activeSection === 'history' ? 'Expense history' : 'Recent expenses'} <span>{pagination.totalItems || 0}</span></h2></div><button className="icon-button" type="button" onClick={() => { loadExpenses(); loadSummary() }} title="Refresh expenses"><RefreshCw size={18} /></button></div><div className="filter-bar"><div className="search-label"><Search size={17} /><span>Filter expenses</span></div><select name="category" value={filters.category} onChange={changeFilter} aria-label="Filter by category"><option value="">All categories</option>{categoryOptions.map((category) => <option key={category}>{category}</option>)}</select><select name="paymentMethod" value={filters.paymentMethod} onChange={changeFilter} aria-label="Filter by payment method"><option value="">All payment modes</option>{paymentOptions.map((method) => <option key={method}>{method}</option>)}</select><input name="startDate" type="date" value={filters.startDate} onChange={changeFilter} aria-label="Start date" /><span className="date-dash">to</span><input name="endDate" type="date" value={filters.endDate} onChange={changeFilter} aria-label="End date" /><button className="clear-button" type="button" onClick={clearAllFilters}><Filter size={15} /> Clear</button></div>{loading ? <div className="empty-state"><LoaderCircle className="spin" size={28} /><p>Loading your expenses...</p></div> : expenses.length ? <div className="table-wrap"><table><thead><tr><th>Expense</th><th>Category</th><th>Paid using</th><th>Date</th><th className="amount-column">Amount</th><th /></tr></thead><tbody>{expenses.map((expense) => <tr key={expense._id}><td><div className="expense-title"><span className={`category-icon category-${expense.category.toLowerCase()}`}>{expense.category.slice(0, 1)}</span><span><strong>{expense.title}</strong>{expense.notes && <small>{expense.notes}</small>}</span></div></td><td><span className="category-pill">{expense.category}</span></td><td><span className="payment-pill">{expense.paymentMethod || 'UPI'}</span></td><td className="date-cell">{prettyDate(expense.date)}</td><td className="amount-column amount-value">{displayMoney(expense.amount)}</td><td className="action-cell"><button className="edit-button" type="button" onClick={() => setEditingExpense({ ...expense, amount: expense.amount, date: new Date(expense.date).toISOString().slice(0, 10), categoryName: '' })} title={`Edit ${expense.title}`}><Edit3 size={15} /></button><button className="delete-button" type="button" onClick={() => deleteExpense(expense._id)} title={`Delete ${expense.title}`}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div> : <div className="empty-state"><Receipt size={30} /><p>No expenses found. Add your first one above.</p></div>}</section></>}
      {activeSection === 'profile' && <section className="panel profile-panel"><div className="profile-hero"><span className="profile-avatar">HM</span><div><p className="eyebrow">PERSONAL PROFILE</p><h2>Harsh's workspace</h2><p className="subheading">Your private space for staying intentional with every rupee.</p></div></div><div className="profile-grid"><div><span>ACCOUNT TYPE</span><strong>Personal</strong></div><div><span>TRACKED TRANSACTIONS</span><strong>{pagination.totalItems || 0}</strong></div><div><span>MEMBER SINCE</span><strong>October 2026</strong></div></div><div className="custom-options"><p className="eyebrow">CUSTOM OPTIONS</p><p className="settings-intro">Create up to 3 custom categories and payment methods. Hover an option to rename or delete it.</p><div className="custom-option-row"><input value={customCategoryDraft} onChange={(event) => setCustomCategoryDraft(event.target.value)} maxLength="40" placeholder="Custom category" /><button className="clear-button" type="button" onClick={() => addCustomOption('customCategories', customCategoryDraft, setCustomCategoryDraft)} disabled={settings.customCategories.length >= 3}>Add ({settings.customCategories.length}/3)</button></div><div className="custom-tags">{renderCustomOptions('customCategories')}</div><div className="custom-option-row"><input value={customPaymentDraft} onChange={(event) => setCustomPaymentDraft(event.target.value)} maxLength="40" placeholder="Custom payment method" /><button className="clear-button" type="button" onClick={() => addCustomOption('customPaymentMethods', customPaymentDraft, setCustomPaymentDraft)} disabled={settings.customPaymentMethods.length >= 3}>Add ({settings.customPaymentMethods.length}/3)</button></div><div className="custom-tags">{renderCustomOptions('customPaymentMethods')}</div></div><button className="primary-button profile-action" type="button" onClick={() => setNotice({ type: 'success', text: 'Your profile is up to date.' })}>Profile is active</button></section>}
      {activeSection === 'settings' && <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">WORKSPACE PREFERENCES</p><h2>Settings</h2></div><span className="panel-number"><Settings size={17} /></span></div><p className="settings-intro">Make Spendwise fit the way you manage money. Changes are saved on this device.</p><div className="settings-list"><div className="setting-row"><span className="setting-icon"><WalletCards size={17} /></span><div><strong>Currency</strong><small>Used when displaying expense totals</small></div><select value={settings.currency} onChange={(event) => updateSetting('currency', event.target.value)} aria-label="Currency"><option value="INR">Indian Rupee (₹)</option><option value="USD">US Dollar ($)</option><option value="EUR">Euro (€)</option><option value="GBP">British Pound (£)</option></select></div><div className="setting-row"><span className="setting-icon"><CalendarDays size={17} /></span><div><strong>Week starts on</strong><small>Controls calendar and reporting preferences</small></div><select value={settings.weekStartsOn} onChange={(event) => updateSetting('weekStartsOn', event.target.value)} aria-label="Week starts on"><option>Monday</option><option>Sunday</option><option>Saturday</option></select></div><div className="setting-row"><span className="setting-icon"><Bell size={17} /></span><div><strong>Monthly review reminders</strong><small>Keep a gentle reminder to review your spending</small></div><button className={`setting-switch ${settings.reminders ? 'is-on' : ''}`} type="button" role="switch" aria-checked={settings.reminders} onClick={() => updateSetting('reminders', !settings.reminders)}><span /></button></div><div className="setting-row"><span className="setting-icon"><ShieldCheck size={17} /></span><div><strong>Private workspace</strong><small>Your local preferences stay in this browser</small></div><span className="setting-status"><CheckCircle2 size={15} /> Protected</span></div></div></section>}
      {editingExpense && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingExpense(null) }}><form className="edit-dialog panel" onSubmit={saveEditedExpense}><div className="transactions-heading"><div><p className="eyebrow">EDIT EXPENSE</p><h2>Update details</h2></div><button className="icon-button" type="button" onClick={() => setEditingExpense(null)} aria-label="Close edit dialog"><X size={18} /></button></div><label>Amount<div className="input-prefix"><span>₹</span><input type="number" min="0.01" step="0.01" value={editingExpense.amount} onChange={(event) => setEditingExpense({ ...editingExpense, amount: event.target.value })} required /></div></label><div className="form-row"><label>Category<select value={editingExpense.category} onChange={(event) => setEditingExpense({ ...editingExpense, category: event.target.value, categoryName: '' })}>{categoryOptions.map((category) => <option key={category}>{category}</option>)}</select>{editingExpense.category === 'Other' && <input className="inline-detail-input" value={editingExpense.categoryName} onChange={(event) => setEditingExpense({ ...editingExpense, categoryName: event.target.value })} maxLength="40" placeholder="Optional category name" />}</label><label>Date<input type="date" value={editingExpense.date} onChange={(event) => setEditingExpense({ ...editingExpense, date: event.target.value })} required /></label></div><label>Paid using<select value={editingExpense.paymentMethod || 'UPI'} onChange={(event) => setEditingExpense({ ...editingExpense, paymentMethod: event.target.value })}>{paymentOptions.map((method) => <option key={method}>{method}</option>)}</select></label><label>Description<input value={editingExpense.notes || ''} onChange={(event) => setEditingExpense({ ...editingExpense, notes: event.target.value })} maxLength="500" placeholder="Optional description" /></label><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button></form></div>}
      <footer>spendwise<span> / personal expense management</span></footer>
    </main>
  )
}

export default App

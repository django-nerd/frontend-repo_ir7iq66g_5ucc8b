import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, NavLink } from 'react-router-dom'
import './index.css'
import {
  Droplets,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Plus,
  Bell,
  RefreshCcw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function useHydrationState() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('hydrate.state')
    return saved ? JSON.parse(saved) : {
      goal: 2500,
      intake: 0,
      interval: 60,
      sound: true,
      dark: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
      dev: false,
      lastReminder: null,
      history: []
    }
  })

  useEffect(() => {
    localStorage.setItem('hydrate.state', JSON.stringify(state))
    document.documentElement.classList.toggle('dark', state.dark)
  }, [state])

  return [state, setState]
}

function ThemeToggle({ dark, onToggle }) {
  return (
    <motion.button
      aria-label="Toggle theme"
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-900/60 backdrop-blur hover:bg-white dark:hover:bg-zinc-900 transition-colors"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </motion.button>
  )
}

function Layout({ children }) {
  const location = useLocation()
  const [state, setState] = useHydrationState()

  useEffect(() => {
    document.title = 'Hydrate.dev — Hydration Reminder for Developers'
  }, [location.pathname])

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Droplets },
    { to: '/history', label: 'History', icon: HistoryIcon },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_60rem_at_80%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(50rem_50rem_at_-10%_110%,rgba(16,185,129,0.12),transparent)] dark:bg-[radial-gradient(60rem_60rem_at_80%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(50rem_50rem_at_-10%_110%,rgba(99,102,241,0.12),transparent)] text-zinc-800 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <header className="sticky top-4 z-20 mb-6">
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            className="flex items-center justify-between rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/60 backdrop-blur px-4 py-3 shadow-sm"
          >
            <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-sm"><Droplets size={18} /></span>
              Hydrate.dev
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm relative">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `relative px-3 py-2 rounded-lg transition-colors ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                  {({ isActive }) => (
                    <>
                      <span>{label}</span>
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute inset-0 -z-10 rounded-lg bg-zinc-100 dark:bg-zinc-900"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle dark={state.dark} onToggle={() => setState(s => ({ ...s, dark: !s.dark }))} />
            </div>
          </motion.div>
        </header>

        <main className="pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="md:hidden fixed bottom-4 left-0 right-0 z-20">
          <div className="mx-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/70 backdrop-blur shadow-lg">
            <ul className="grid grid-cols-3">
              {navItems.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) => `flex flex-col items-center gap-1 py-3 text-xs ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                    {({ isActive }) => (
                      <motion.div
                        className="flex flex-col items-center"
                        initial={false}
                        animate={{ scale: isActive ? 1.05 : 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Icon size={18} />
                        {label}
                      </motion.div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <footer className="mt-8 pb-8 text-xs text-zinc-500">
          Built for developers • Stay hydrated
        </footer>
      </div>
    </div>
  )
}

function Card({ title, children, actions, subtitle, index = 0 }) {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 180, damping: 20 }}
      className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/70 backdrop-blur shadow-sm"
    >
      <div className="p-4 md:p-6 flex items-start justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="px-4 md:px-6 pb-4 md:pb-6">{children}</div>
    </motion.div>
  )
}

function Button({ children, onClick, variant = 'default', icon: Icon, className = '' }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    default: 'bg-gradient-to-b from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-800 text-white dark:from-white dark:to-zinc-100 dark:text-black',
    outline: 'border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60',
    subtle: 'bg-zinc-100/70 hover:bg-zinc-200/60 dark:bg-zinc-800/70 dark:hover:bg-zinc-700/70',
    primary: 'bg-gradient-to-br from-blue-600 to-sky-600 text-white hover:from-blue-500 hover:to-sky-500',
  }
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </motion.button>
  )
}

function Progress({ value }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 shadow-[0_0_0_1px_rgba(0,0,0,0.02)_inset]"
        initial={false}
        animate={{ width: `${clamped}%` }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

function Dashboard() {
  const [state, setState] = useHydrationState()
  const pct = useMemo(() => (state.intake / state.goal) * 100, [state.intake, state.goal])
  const add = (ml) => setState(s => ({ ...s, intake: Math.min(s.goal, s.intake + ml), history: [...s.history, { ts: Date.now(), ml }] }))
  const reset = () => setState(s => ({ ...s, intake: 0 }))

  const nextReminderTs = state.lastReminder ? state.lastReminder + state.interval * 60_000 : null
  const nextIn = nextReminderTs ? Math.max(0, nextReminderTs - Date.now()) : null

  // Today's history
  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  const now = new Date()
  const todaysHistory = state.history.filter(h => isSameDay(new Date(h.ts), now))
  const todaysTotal = todaysHistory.reduce((sum, h) => sum + h.ml, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <Card
          title="Hydration status"
          subtitle="Track your daily intake and hit your target"
          actions={<Button variant="outline" icon={RefreshCcw} onClick={reset}>Reset</Button>}
        >
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div>
                <motion.div layout className="text-4xl md:text-5xl font-semibold tracking-tight">{state.intake}ml</motion.div>
                <div className="mt-1 text-sm text-zinc-500">of {state.goal}ml</div>
              </div>
              <motion.div
                className="hidden sm:flex items-center gap-3 rounded-2xl border border-blue-200/50 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-2 text-blue-700 dark:text-blue-300"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              >
                <Droplets size={16} />
                <span className="text-sm font-medium">{pct.toFixed(0)}%</span>
              </motion.div>
            </div>
            <Progress value={pct} />
            <div className="text-sm text-zinc-500">{pct.toFixed(0)}% complete</div>
          </div>
        </Card>

        <Card title="Quick add" subtitle="Log common amounts with one tap">
          <div className="flex flex-wrap gap-3">
            {[100,200,300,500].map((v) => (
              <Button key={v} onClick={() => add(v)} variant="subtle" icon={Plus} className="min-w-[86px]">+{v}ml</Button>
            ))}
          </div>
        </Card>

        <Card title="Motivation" subtitle="Small sips, big impact">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Consistency beats intensity. Keep a bottle within reach and take a sip between tasks.</p>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card title="Reminder" subtitle="Never miss your next sip">
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 p-3">
                <div className="text-xs text-zinc-500">Interval</div>
                <div className="mt-1 font-medium">every {state.interval} min</div>
              </div>
              <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 p-3">
                <div className="text-xs text-zinc-500">Next reminder</div>
                <div className="mt-1 font-medium">{nextIn ? `${Math.round(nextIn/60000)} min` : '—'}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" icon={Bell} onClick={() => alert('Reminder engine coming next — we will enable notifications and optional sound!')}>Test reminder</Button>
            </div>
          </div>
        </Card>

        <Card title="Today" subtitle={`Your sips today • ${todaysTotal}ml total`}>
          <div className="text-sm text-zinc-500">Entries: {todaysHistory.length}</div>
          <div className="mt-4 grid gap-2 max-h-64 overflow-auto pr-1">
            {todaysHistory.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-zinc-500">No sips yet today.</motion.div>
            )}
            {todaysHistory.slice().reverse().map((h,i) => (
              <motion.div
                key={`${h.ts}-${i}`}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between text-sm border border-zinc-200/70 dark:border-zinc-800/70 rounded-xl px-3 py-2 bg-white/70 dark:bg-zinc-950/60"
              >
                <span className="tabular-nums text-zinc-600 dark:text-zinc-400">{new Date(h.ts).toLocaleTimeString()}</span>
                <span className="font-medium">{h.ml}ml</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Settings() {
  const [state, setState] = useHydrationState()
  const update = (k, v) => setState(s => ({ ...s, [k]: v }))

  return (
    <div className="grid gap-6">
      <Card title="Goals" subtitle="Configure your daily target and reminder interval">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-2 text-sm">
            <span>Daily goal (ml)</span>
            <input
              type="number"
              value={state.goal}
              onChange={e => update('goal', Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span>Reminder interval (min)</span>
            <input
              type="number" min={10} max={120}
              value={state.interval}
              onChange={e => update('interval', Math.min(120, Math.max(10, Number(e.target.value) || 10)))}
              className="px-3 py-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </label>
        </div>
      </Card>

      <Card title="Preferences" subtitle="Personalize the experience">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/70 px-3 py-2">
            <div className="flex items-center gap-3"><Bell size={16} /><span>Enable sound alerts</span></div>
            <input type="checkbox" checked={state.sound} onChange={e => update('sound', e.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/70 px-3 py-2">
            <div className="flex items-center gap-3"><Moon size={16} /><span>Dark theme</span></div>
            <input type="checkbox" checked={state.dark} onChange={e => update('dark', e.target.checked)} />
          </label>
        </div>
      </Card>
    </div>
  )
}

function History() {
  const [state] = useHydrationState()
  const csv = () => {
    const rows = [['timestamp','ml'], ...state.history.map(h => [new Date(h.ts).toISOString(), h.ml])]
    const data = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hydration-history.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card title="Daily logs" subtitle="Your recent entries" actions={<Button variant="outline" onClick={csv}>Export CSV</Button>}>
        <div className="text-sm text-zinc-500">Entries: {state.history.length}</div>
        <div className="mt-4 grid gap-2">
          {state.history.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-zinc-500">No entries yet. Log your first sip from the dashboard.</motion.div>
          )}
          {state.history.slice().reverse().map((h,i) => (
            <motion.div
              key={i}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between text-sm border border-zinc-200/70 dark:border-zinc-800/70 rounded-xl px-3 py-2 bg-white/70 dark:bg-zinc-950/60"
            >
              <span className="tabular-nums text-zinc-600 dark:text-zinc-400">{new Date(h.ts).toLocaleTimeString()}</span>
              <span className="font-medium">{h.ml}ml</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function RoutedContent() {
  // Separate component so we can access useLocation inside BrowserRouter for animations
  const location = useLocation()
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<div className='text-sm text-zinc-500'>Page not found</div>} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}

function Router() {
  return (
    <BrowserRouter>
      <RoutedContent />
    </BrowserRouter>
  )
}

export default Router

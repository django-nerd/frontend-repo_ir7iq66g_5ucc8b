import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import './index.css'

function Layout({ children }) {
  const location = useLocation()
  useEffect(() => {
    document.title = 'Hydrate.dev — Hydration Reminder for Developers'
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black text-zinc-800 dark:text-zinc-100">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40 border-b border-zinc-200/60 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight">Hydrate.dev</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="hover:opacity-80">Dashboard</Link>
            <Link to="/history" className="hover:opacity-80">History</Link>
            <Link to="/settings" className="hover:opacity-80">Settings</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
        {children}
      </main>
      <footer className="mx-auto max-w-5xl px-4 py-6 text-xs text-zinc-500">Built for developers • Stay hydrated</footer>
    </div>
  )
}

function Card({ title, children, actions }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="p-4 md:p-6 flex items-center justify-between">
        <h3 className="font-medium tracking-tight">{title}</h3>
        {actions}
      </div>
      <div className="px-4 md:px-6 pb-4 md:pb-6">{children}</div>
    </div>
  )
}

function Button({ children, onClick, variant = 'default' }) {
  const base = 'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    default: 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black',
    outline: 'border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
    subtle: 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
  }
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>{children}</button>
  )
}

function Progress({ value }) {
  return (
    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
      <div className="h-full bg-blue-600 dark:bg-blue-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

function useHydrationState() {
  const [state, setState] = React.useState(() => {
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

function Dashboard() {
  const [state, setState] = useHydrationState()
  const pct = (state.intake / state.goal) * 100
  const add = (ml) => setState(s => ({ ...s, intake: Math.min(s.goal, s.intake + ml), history: [...s.history, { ts: Date.now(), ml }] }))
  const reset = () => setState(s => ({ ...s, intake: 0 }))

  const nextReminderTs = state.lastReminder ? state.lastReminder + state.interval * 60_000 : null
  const nextIn = nextReminderTs ? Math.max(0, nextReminderTs - Date.now()) : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div className="md:col-span-3 space-y-6">
        <Card title="Hydration status" actions={<Button variant="outline" onClick={reset}>Reset</Button>}>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div>
                <div className="text-4xl font-semibold tracking-tight">{state.intake}ml</div>
                <div className="text-sm text-zinc-500">of {state.goal}ml</div>
              </div>
            </div>
            <Progress value={pct} />
            <div className="text-sm text-zinc-500">{pct.toFixed(0)}% complete</div>
          </div>
        </Card>

        <Card title="Quick add">
          <div className="flex gap-3">
            {[100,200,300,500].map(v => (
              <Button key={v} onClick={() => add(v)} variant="subtle">+{v}ml</Button>
            ))}
          </div>
        </Card>

        <Card title="Motivation">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Small sips, big impact. Consistency beats intensity.</p>
        </Card>
      </div>

      <div className="md:col-span-2 space-y-6">
        <Card title="Reminder">
          <div className="space-y-2 text-sm">
            <div>Interval: every {state.interval} min</div>
            <div>Next reminder: {nextIn ? `${Math.round(nextIn/60000)} min` : '—'}</div>
          </div>
        </Card>

        <Card title="Debug" actions={<span className="text-xs text-zinc-500">dev mode</span>}>
          <pre className="text-xs overflow-auto p-3 bg-zinc-50 dark:bg-zinc-800 rounded-md">{JSON.stringify(state, null, 2)}</pre>
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
      <Card title="Goals">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-2 text-sm">
            <span>Daily goal (ml)</span>
            <input type="number" value={state.goal} onChange={e => update('goal', Number(e.target.value))} className="px-3 py-2 rounded-lg border bg-transparent" />
          </label>
          <label className="grid gap-2 text-sm">
            <span>Reminder interval (min)</span>
            <input type="number" min={10} max={120} value={state.interval} onChange={e => update('interval', Math.min(120, Math.max(10, Number(e.target.value) || 10)))} className="px-3 py-2 rounded-lg border bg-transparent" />
          </label>
        </div>
      </Card>

      <Card title="Preferences">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={state.sound} onChange={e => update('sound', e.target.checked)} />
            <span>Enable sound alerts</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={state.dark} onChange={e => update('dark', e.target.checked)} />
            <span>Dark theme</span>
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
      <Card title="Daily logs" actions={<Button variant="outline" onClick={csv}>Export CSV</Button>}>
        <div className="text-sm text-zinc-500">Entries: {state.history.length}</div>
        <div className="mt-4 grid gap-2">
          {state.history.slice().reverse().map((h,i) => (
            <div key={i} className="flex items-center justify-between text-sm border-b border-zinc-100 dark:border-zinc-800 py-2">
              <span>{new Date(h.ts).toLocaleTimeString()}</span>
              <span className="font-medium">{h.ml}ml</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Router() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<div className='text-sm text-zinc-500'>Page not found</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default Router

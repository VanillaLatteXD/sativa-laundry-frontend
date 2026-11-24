import { useMemo, useState } from 'react'
import './App.css'

const initialOrders = [
  { id: 'STV-1024', name: 'Nadia Putri', phone: '081234567890', service: 'Cuci + Setrika', weight: 4, total: 28000, status: 'Diproses', date: '24 Nov 2026' },
  { id: 'STV-1023', name: 'Budi Santoso', phone: '081298765432', service: 'Cuci Kering', weight: 3, total: 21000, status: 'Siap diambil', date: '24 Nov 2026' },
  { id: 'STV-1022', name: 'Rina Amelia', phone: '081233344455', service: 'Cuci + Setrika', weight: 5, total: 35000, status: 'Selesai', date: '23 Nov 2026' },
]
const steps = ['Diterima', 'Diproses', 'Siap diambil', 'Selesai']
const money = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

function App() {
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sativa-orders')) || initialOrders } catch { return initialOrders }
  })
  const [tab, setTab] = useState('dashboard')
  const [query, setQuery] = useState('')
  const [tracking, setTracking] = useState(null)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', service: 'Cuci + Setrika', weight: 1 })
  const price = form.service === 'Cuci Kering' ? 7000 : form.service === 'Setrika' ? 5000 : 7000

  const save = next => { setOrders(next); localStorage.setItem('sativa-orders', JSON.stringify(next)) }
  const filtered = useMemo(() => orders.filter(o => [o.id, o.name, o.phone].some(v => v.toLowerCase().includes(query.toLowerCase()))), [orders, query])
  const stats = { total: orders.length, progress: orders.filter(o => o.status === 'Diproses').length, ready: orders.filter(o => o.status === 'Siap diambil').length, revenue: orders.filter(o => o.status === 'Selesai').reduce((a, o) => a + o.total, 0) }

  function createOrder(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    const order = { ...form, weight: Number(form.weight), id: 'STV-' + (1025 + orders.length), total: Number(form.weight) * price, status: 'Diterima', date: new Date().toLocaleDateString('id-ID') }
    save([order, ...orders]); setForm({ name: '', phone: '', service: 'Cuci + Setrika', weight: 1 }); setNotice('Pesanan berhasil ditambahkan: ' + order.id)
  }
  function updateStatus(id, status) { save(orders.map(o => o.id === id ? { ...o, status } : o)) }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">S</div><div><strong>Sativa Laundry</strong><small>Clean care, easy life</small></div></div>
      <div className="nav-label">MENU UTAMA</div>
      {[['dashboard','▦','Dashboard'],['orders','☷','Pesanan'],['new','＋','Tambah Pesanan'],['tracking','⌕','Tracking pelanggan']].map(([key,icon,label])=><button key={key} className={'nav-item '+(tab===key?'active':'')} onClick={()=>setTab(key)}><span>{icon}</span>{label}</button>)}
      <div className="sidebar-bottom"><div className="avatar">SL</div><div><strong>Sativa Laundry</strong><small>Admin / Kasir</small></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><span className="eyebrow">SIGURA-GURA · MALANG</span><h1>{tab==='dashboard'?'Dashboard':tab==='orders'?'Daftar Pesanan':tab==='new'?'Tambah Pesanan':'Tracking Laundry'}</h1></div><span className="date-pill">◷ {new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</span></header>
      {notice && <div className="notice">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
      {tab==='dashboard' && <><section className="welcome"><div><span className="eyebrow light">PANEL OPERASIONAL</span><h2>Halo, selamat bekerja! 👋</h2><p>Ringkasan operasional laundry hari ini.</p></div><button className="primary" onClick={()=>setTab('new')}>＋ Pesanan baru</button></section>
        <section className="stats"><article className="stat"><span>Total pesanan</span><strong>{stats.total}</strong><small>Seluruh data pesanan</small></article><article className="stat"><span>Sedang diproses</span><strong>{stats.progress}</strong><small>Pesanan di pengerjaan</small></article><article className="stat"><span>Siap diambil</span><strong>{stats.ready}</strong><small>Menunggu pelanggan</small></article><article className="stat"><span>Pendapatan selesai</span><strong className="money">{money(stats.revenue)}</strong><small>Dari order berstatus selesai</small></article></section>
        <section className="panel"><div className="panel-heading"><div><h2>Pesanan terbaru</h2><p>Ringkasan pesanan yang masuk</p></div><button className="text-btn" onClick={()=>setTab('orders')}>Lihat semua →</button></div><OrdersTable orders={orders.slice(0,5)} onStatus={updateStatus}/></section>
      </>}
      {tab==='orders' && <section className="panel"><div className="panel-heading"><div><h2>Semua pesanan</h2><p>Kelola dan ubah status laundry</p></div></div><input className="search" placeholder="Cari nama, nomor, atau kode..." value={query} onChange={e=>setQuery(e.target.value)}/><OrdersTable orders={filtered} onStatus={updateStatus}/></section>}
      {tab==='new' && <section className="panel form-panel"><div className="panel-heading"><div><h2>Input pesanan pelanggan</h2><p>Masukkan detail laundry untuk membuat kode tracking.</p></div></div><form onSubmit={createOrder} className="order-form"><label>Nama pelanggan<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nama lengkap"/></label><label>Nomor WhatsApp<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="08xxxxxxxxxx"/></label><label>Jenis layanan<select value={form.service} onChange={e=>setForm({...form,service:e.target.value})}><option>Cuci + Setrika</option><option>Cuci Kering</option><option>Setrika</option></select></label><label>Berat laundry (kg)<input type="number" min="1" step="0.5" value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})}/></label><div className="price-preview"><span>Estimasi biaya</span><strong>{money(Number(form.weight)*price)}</strong><small>Rp {price.toLocaleString('id-ID')} / kg</small></div><button className="primary submit" type="submit">Simpan pesanan</button></form></section>}
      {tab==='tracking' && <section className="tracking-page"><section className="track-hero"><span className="eyebrow light">SATIVA LAUNDRY</span><h2>Laundry tanpa khawatir.</h2><p>Periksa status laundry kamu kapan saja.</p><div className="track-search"><input placeholder="Masukkan kode pesanan (STV-xxxx)" value={query} onChange={e=>setQuery(e.target.value)}/><button className="primary" onClick={()=>setTracking(orders.find(o=>o.id.toLowerCase()===query.trim().toLowerCase())||false)}>Lacak</button></div></section>{tracking && <div className="panel track-result">{tracking===false?<p>Kode pesanan tidak ditemukan. Periksa kembali kode kamu.</p>:<><div className="panel-heading"><div><h2>{tracking.id}</h2><p>{tracking.name} · {tracking.service}</p></div><span className="status">{tracking.status}</span></div><div className="timeline">{steps.map((s,i)=><div className={'timeline-step '+(steps.indexOf(tracking.status)>=i?'done':'')} key={s}><div className="dot"/><span>{s}</span></div>)}</div><p className="muted">Total: <strong>{money(tracking.total)}</strong> · {tracking.weight} kg</p></>}</div>}</section>}
    </main>
  </div>
}

function OrdersTable({orders,onStatus}) {
  return <div className="table-wrap"><table><thead><tr><th>KODE</th><th>PELANGGAN</th><th>LAYANAN</th><th>TOTAL</th><th>STATUS</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><strong className="order-code">{o.id}</strong><small>{o.date}</small></td><td><strong>{o.name}</strong><small>{o.phone}</small></td><td>{o.service}<small>{o.weight} kg</small></td><td>{money(o.total)}</td><td><select className={'status-select '+o.status.replaceAll(' ','-')} value={o.status} onChange={e=>onStatus(o.id,e.target.value)}>{steps.map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>{orders.length===0&&<div className="empty">Tidak ada pesanan yang cocok.</div>}</div>
}
export default App

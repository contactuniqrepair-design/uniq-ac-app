import React, { useEffect, useMemo, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, MapPin, Phone, Plus, Wrench, Users, ClipboardList, IndianRupee, Search, SendHorizonal, Truck } from "lucide-react";

// --- Helpers ---
const LS_KEYS = {
  bookings: "uniq_bookings_v1",
  technicians: "uniq_technicians_v1",
  customers: "uniq_customers_v1",
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function saveLS(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadLS(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(fallback) && !Array.isArray(v) ? fallback : v ?? fallback;
  } catch {
    return fallback;
  }
}

// --- Seed (first load) ---
function useSeed() {
  useEffect(() => {
    const seeded = localStorage.getItem("uniq_seed_done_v1");
    if (seeded) return;
    const techs = [
      { id: uid("tech"), name: "Rahul Kumar", phone: "9871000001", skills: ["Split AC", "Installation"], active: true },
      { id: uid("tech"), name: "Akash Singh", phone: "9871000002", skills: ["Window AC", "Gas Charging"], active: true },
    ];
    const bookings = [];
    saveLS(LS_KEYS.technicians, techs);
    saveLS(LS_KEYS.bookings, bookings);
    saveLS(LS_KEYS.customers, []);
    localStorage.setItem("uniq_seed_done_v1", "yes");
  }, []);
}

// --- Status UI ---
const STATUS_STYLES = {
  Requested: "bg-slate-100 text-slate-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Assigned: "bg-amber-100 text-amber-700",
  "On The Way": "bg-purple-100 text-purple-700",
  Started: "bg-cyan-100 text-cyan-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

const SERVICE_TYPES = [
  "AC Repair",
  "AC Installation",
  "AC Uninstallation",
  "Gas Filling",
  "Water Leakage",
  "No Cooling / Low Cooling",
  "AMC (Annual Maintenance)",
];

// --- Root Component ---
export default function App() {
  useSeed();

  const [bookings, setBookings] = useState(() => loadLS(LS_KEYS.bookings, []));
  const [techs, setTechs] = useState(() => loadLS(LS_KEYS.technicians, []));
  const [customers, setCustomers] = useState(() => loadLS(LS_KEYS.customers, []));
  const [activeTab, setActiveTab] = useState("customer");

  useEffect(() => saveLS(LS_KEYS.bookings, bookings), [bookings]);
  useEffect(() => saveLS(LS_KEYS.technicians, techs), [techs]);
  useEffect(() => saveLS(LS_KEYS.customers, customers), [customers]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  return (
    <MotionConfig>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
        <header className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-sky-600 shadow-lg grid place-items-center text-white font-bold">U</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Uniq Air Conditioner System</h1>
              <p className="text-sm text-slate-600">Field Service App (MVP) – Customer • Technician • Admin</p>
            </div>
          </div>
          <Badge className="rounded-xl">Noida • v0.1</Badge>
        </header>

        <main className="mx-auto mt-6 max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="technician">Technician</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="mt-6">
              <CustomerPanel onCreate={(b)=>setBookings(prev=>[b,...prev])} bookings={bookings} todayStr={todayStr} />
            </TabsContent>

            <TabsContent value="technician" className="mt-6">
              <TechnicianPanel bookings={bookings} setBookings={setBookings} techs={techs} />
            </TabsContent>

            <TabsContent value="admin" className="mt-6">
              <AdminPanel bookings={bookings} setBookings={setBookings} techs={techs} setTechs={setTechs} />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="mx-auto max-w-6xl mt-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} UNIQ. Demo purpose only. Data stored in your browser.
        </footer>
      </div>
    </MotionConfig>
  );
}

// --- Customer Panel ---
function CustomerPanel({ onCreate, bookings, todayStr }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    serviceType: SERVICE_TYPES[0],
    date: todayStr,
    time: "10:00",
    notes: "",
    payMode: "Cash",
  });

  function submit() {
    if (!form.name || !form.phone || !form.address) return alert("Please fill Name, Phone, Address");
    const id = uid("bk");
    const booking = {
      id,
      createdAt: new Date().toISOString(),
      status: "Requested",
      ...form,
      technicianId: null,
      updates: [{ at: new Date().toISOString(), text: "Booking requested by customer" }],
      amount: null,
    };
    onCreate(booking);
    setForm((f) => ({ ...f, notes: "" }));
    alert("Booking submitted! Our team will confirm shortly.");
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" /> Book a Service</CardTitle>
          <Badge>Step: Request</Badge>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" />
            </div>
            <div className="grid gap-2">
              <Label>Preferred Time</Label>
              <Input type="time" value={form.time} onChange={(e)=>setForm({...form,time:e.target.value})} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Address</Label>
            <Textarea value={form.address} onChange={(e)=>setForm({ ...form, address: e.target.value })} placeholder="House no, Street, Area, City" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Service Type</Label>
              <Select value={form.serviceType} onValueChange={(v)=>setForm({...form, serviceType:v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SERVICE_TYPES.map(s=> (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Payment Mode</Label>
              <Select value={form.payMode} onValueChange={(v)=>setForm({...form, payMode:v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} placeholder="e.g., No cooling since 2 days" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={submit} className="rounded-2xl"><SendHorizonal className="h-4 w-4 mr-2"/> Submit Request</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5"/> My Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {bookings.length === 0 && <p className="text-sm text-slate-500">No bookings yet.</p>}
          {bookings.slice(0,6).map(b => (
            <motion.div key={b.id} layout className="border rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{b.serviceType}</div>
                <Badge className={`rounded-xl ${STATUS_STYLES[b.status]}`}>{b.status}</Badge>
              </div>
              <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/>{b.date} • {b.time}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/>{b.address}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3"/>{b.phone}</span>
              </div>
              {b.technicianId && <div className="text-xs">Technician: <b>{b.technicianName}</b> ({b.technicianPhone})</div>}
              {b.amount && <div className="text-xs flex items-center gap-1"><IndianRupee className="h-3 w-3"/>Bill: {b.amount}</div>}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Technician Panel ---
function TechnicianPanel({ bookings, setBookings, techs }) {
  const [techId, setTechId] = useState(techs[0]?.id || "");
  const tech = techs.find(t => t.id === techId);

  const assigned = bookings.filter(b => b.technicianId === techId);

  function updateStatus(bid, status) {
    setBookings(prev => prev.map(b => b.id === bid ? { ...b, status, updates: [...b.updates, { at: new Date().toISOString(), text: `Status → ${status}` }] } : b));
  }

  function startJob(bid) { updateStatus(bid, "Started"); }
  function onTheWay(bid) { updateStatus(bid, "On The Way"); }
  function completeJob(bid) {
    const amount = prompt("Enter final bill amount (INR)");
    setBookings(prev => prev.map(b => b.id === bid ? { ...b, status: "Completed", amount: amount ? Number(amount) : b.amount, updates: [...b.updates, { at: new Date().toISOString(), text: `Completed • ₹${amount}` }] } : b));
  }

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Technician Console</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Select Technician</Label>
            <Select value={techId} onValueChange={setTechId}>
              <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
              <SelectContent>
                {techs.map(t => <SelectItem key={t.id} value={t.id}>{t.name} • {t.phone}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {tech && (
            <div className="p-3 border rounded-2xl text-sm grid gap-1">
              <div><b>{tech.name}</b></div>
              <div className="text-slate-600">{tech.phone}</div>
              <div className="text-slate-600">Skills: {tech.skills.join(", ")}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5"/> Assigned Jobs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {assigned.length === 0 && <p className="text-sm text-slate-500">No jobs assigned yet.</p>}
            {assigned.map(b => (
              <div key={b.id} className="border rounded-2xl p-3 grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{b.serviceType}</div>
                  <Badge className={`rounded-xl ${STATUS_STYLES[b.status]}`}>{b.status}</Badge>
                </div>
                <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/>{b.date} • {b.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/>{b.address}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3"/>{b.phone}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={()=>onTheWay(b.id)}>On the way</Button>
                  <Button size="sm" variant="outline" onClick={()=>startJob(b.id)}>Start</Button>
                  <Button size="sm" onClick={()=>completeJob(b.id)} className="gap-1"><CheckCircle2 className="h-4 w-4"/>Complete</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Earnings (Demo)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm grid gap-2">
            <p className="text-slate-600">Completed jobs count: {assigned.filter(b=>b.status === "Completed").length}</p>
            <p className="text-slate-600">Sample payout rule: ₹300 per completed visit + 20% of labor.</p>
            <p className="text-slate-500">(For real payouts, integrate with admin rates & invoices.)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Admin Panel ---
function AdminPanel({ bookings, setBookings, techs, setTechs }) {
  const [query, setQuery] = useState("");
  const [newTech, setNewTech] = useState({ name: "", phone: "", skills: "Split AC, Window AC" });

  const unassigned = bookings.filter(b => !b.technicianId && !["Cancelled"].includes(b.status));
  const filtered = bookings.filter(b => [b.name, b.phone, b.address, b.serviceType].join(" ").toLowerCase().includes(query.toLowerCase()))

  function assign(bid, tech) {
    setBookings(prev => prev.map(b => b.id === bid ? { ...b, status: "Assigned", technicianId: tech.id, technicianName: tech.name, technicianPhone: tech.phone, updates: [...b.updates, { at: new Date().toISOString(), text: `Assigned to ${tech.name}` }] } : b));
  }

  function confirm(bid) {
    setBookings(prev => prev.map(b => b.id === bid ? { ...b, status: "Confirmed", updates: [...b.updates, { at: new Date().toISOString(), text: `Booking confirmed` }] } : b));
  }

  function addTech() {
    if (!newTech.name || !newTech.phone) return alert("Enter technician name & phone");
    const t = { id: uid("tech"), name: newTech.name, phone: newTech.phone, skills: newTech.skills.split(",").map(s=>s.trim()), active: true };
    setTechs(prev => [t, ...prev]);
    setNewTech({ name: "", phone: "", skills: "Split AC, Window AC" });
  }

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5"/> Search Bookings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search by name, phone, address, service" />
            <div className="text-xs text-slate-500">Total: {filtered.length}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Add Technician</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2"><Label>Name</Label><Input value={newTech.name} onChange={(e)=>setNewTech({...newTech, name:e.target.value})} /></div>
            <div className="grid gap-2"><Label>Phone</Label><Input value={newTech.phone} onChange={(e)=>setNewTech({...newTech, phone:e.target.value})} /></div>
            <div className="grid gap-2"><Label>Skills (comma separated)</Label><Input value={newTech.skills} onChange={(e)=>setNewTech({...newTech, skills:e.target.value})} /></div>
            <div className="flex justify-end"><Button onClick={addTech} className="rounded-2xl"><Plus className="h-4 w-4 mr-1"/>Add</Button></div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5"/> Unassigned Queue</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {unassigned.length === 0 && <p className="text-sm text-slate-500">All clear. No unassigned bookings.</p>}
            {unassigned.map(b => (
              <div key={b.id} className="border rounded-2xl p-3 grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{b.serviceType} • {b.name}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>confirm(b.id)}>Confirm</Button>
                    <AssignMenu techs={techs} onPick={(t)=>assign(b.id, t)} />
                  </div>
                </div>
                <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/>{b.date} • {b.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/>{b.address}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3"/>{b.phone}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(b => (
            <div key={b.id} className="border rounded-2xl p-3 grid gap-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{b.serviceType} • {b.name}</div>
                <Badge className={`rounded-xl ${STATUS_STYLES[b.status]}`}>{b.status}</Badge>
              </div>
              <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/>{b.date} • {b.time}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/>{b.address}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3"/>{b.phone}</span>
              </div>
              {b.technicianName && <div className="text-xs">Tech: <b>{b.technicianName}</b> ({b.technicianPhone})</div>}
              {b.amount && <div className="text-xs flex items-center gap-1"><IndianRupee className="h-3 w-3"/>Bill: {b.amount}</div>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Export / Backup</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 border rounded-2xl">
            <p className="text-slate-600">This demo stores data in your browser (localStorage).</p>
            <p className="text-slate-600">For production: connect to Firebase or Supabase for real-time sync & auth.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssignMenu({ techs, onPick }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button size="sm" onClick={()=>setOpen(v=>!v)}>Assign</Button>
      {open && (
        <div className="absolute z-10 mt-2 w-56 rounded-2xl border bg-white shadow-lg p-2 grid gap-1">
          {techs.map(t => (
            <button key={t.id} className="text-left p-2 rounded-xl hover:bg-slate-50" onClick={()=>{ onPick(t); setOpen(false); }}>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-slate-600">{t.phone} • {t.skills.join(", ")}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

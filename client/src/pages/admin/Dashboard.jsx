import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ employees: 0, drivers: 0, cabs: 0, offices: 0, pendingAddresses: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, cabsRes, officesRes, addressRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/cabs'),
          api.get('/admin/offices'),
          api.get('/admin/address-requests'),
        ]);
        setStats({
          employees: usersRes.data.filter(u => u.role === 'employee').length,
          drivers: usersRes.data.filter(u => u.role === 'driver').length,
          cabs: cabsRes.data.length,
          offices: officesRes.data.length,
          pendingAddresses: addressRes.data.filter(r => r.status === 'pending').length,
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Employees', value: stats.employees, icon: '👩', color: '#8b5cf6' },
    { label: 'Drivers', value: stats.drivers, icon: '🚗', color: '#06b6d4' },
    { label: 'Cabs', value: stats.cabs, icon: '🚕', color: '#f59e0b' },
    { label: 'Offices', value: stats.offices, icon: '🏢', color: '#10b981' },
    { label: 'Pending Addresses', value: stats.pendingAddresses, icon: '📍', color: '#ef4444' },
  ];

  return (
    <div className="px-8 py-6 w-full max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="h-10 w-10 rounded-full bg-slate-200">
            <img alt="Profile" className="rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEzEfPzPAkDC14-A80aJmXuM0x0WNro8J2r7YzCV3Wix2sw5nvHo_V_68_5xrTVFmiyDRYtvXKUMobA29Nd8NkVmcthpHIKWMDw7ABBSzZlzlVf_qLwhznwPsWeCs4UjVK_ez6y8eT0F73QBSnqjiA2GqMCGWfgiv7FOXBKR3UxAopy7--bdNUB1CTKBVoOl0xylZFjRDKMhq1HweGM6GvxzGbTd0xPxlDPMVKjDyxVk4FpySOtiepyg2dySQd-gSzs0Nn-YsLF8rn"/>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-purple-500">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-2 rounded-lg">badge</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Employees</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.employees}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-teal-500">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-teal-500 bg-teal-50 p-2 rounded-lg">person_pin_circle</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Drivers</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.drivers}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-amber-500">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-2 rounded-lg">local_taxi</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Cabs</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.cabs}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-green-500">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-green-500 bg-green-50 p-2 rounded-lg">location_city</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Offices</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.offices}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-red-500">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-red-500 bg-red-50 p-2 rounded-lg">pending_actions</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Pending Requests</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.pendingAddresses}</h3>
        </div>
      </div>
    </div>
  );
}

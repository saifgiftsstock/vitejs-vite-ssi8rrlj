import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Plus, Package } from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  inward: number;
  outward: number;
  damaged: number;
}

interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [fetchUrl, setFetchUrl] = useState<string>('');
  const [syncUrl, setSyncUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [newItem, setNewItem] = useState<StockItem>({ id: '', name: '', inward: 0, outward: 0, damaged: 0 });

  useEffect(() => {
    const savedFetch = localStorage.getItem('sheetFetchUrl');
    const savedSync = localStorage.getItem('sheetSyncUrl');
    if (savedFetch) setFetchUrl(savedFetch);
    if (savedSync) setSyncUrl(savedSync);

    // Auto-fetch data on load if the Fetch URL is configured
    if (savedFetch) {
      fetchData(savedFetch);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to fetch data.', 'error');
    }
    setLoading(false);
  };

  const fetchFromSheet = () => {
    if (!fetchUrl) {
      showToast('Please set Fetch URL in Settings first', 'error');
      setActiveTab('settings');
      return;
    }
    fetchData(fetchUrl);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncUrl || !fetchUrl) {
      showToast('Please set both URLs in Settings first', 'error');
      setActiveTab('settings');
      return;
    }
    if (!newItem.id || !newItem.name) {
      showToast('ID and Name are required', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // Instantly append the single new row to Google Sheets
      const response = await fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'append', item: newItem }),
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        showToast('Row added directly to Google Sheet!', 'success');
        setNewItem({ id: '', name: '', inward: 0, outward: 0, damaged: 0 });
        // Auto-refresh the dashboard to show the new entry from the sheet
        fetchData(fetchUrl); 
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to save to sheet. Check Sync URL.', 'error');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Package /> Shop Stock Ledger
      </h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          style={{ padding: '8px 16px', cursor: 'pointer', fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal', border: 'none', background: activeTab === 'dashboard' ? '#e0e0e0' : 'transparent', borderRadius: '4px' }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          style={{ padding: '8px 16px', cursor: 'pointer', fontWeight: activeTab === 'settings' ? 'bold' : 'normal', border: 'none', background: activeTab === 'settings' ? '#e0e0e0' : 'transparent', borderRadius: '4px' }}
        >
          Settings
        </button>
      </div>

      {toast && (
        <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '6px', backgroundColor: toast.type === 'success' ? '#d4edda' : '#f8d7da', color: toast.type === 'success' ? '#155724' : '#721c24' }}>
          {toast.message}
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={fetchFromSheet} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', cursor: 'pointer', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <RefreshCw size={16} /> {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>

          <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <input type="text" placeholder="Item ID" value={newItem.id} onChange={e => setNewItem({...newItem, id: e.target.value})} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <input type="text" placeholder="Product Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flexGrow: 1 }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" placeholder="Inward" value={newItem.inward || ''} onChange={e => setNewItem({...newItem, inward: parseInt(e.target.value) || 0})} style={{ padding: '8px', width: '80px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input type="number" placeholder="Outward" value={newItem.outward || ''} onChange={e => setNewItem({...newItem, outward: parseInt(e.target.value) || 0})} style={{ padding: '8px', width: '80px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input type="number" placeholder="Damaged" value={newItem.damaged || ''} onChange={e => setNewItem({...newItem, damaged: parseInt(e.target.value) || 0})} style={{ padding: '8px', width: '80px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', cursor: 'pointer', backgroundColor: loading ? '#94a3b8' : '#0f172a', color: 'white', border: 'none', borderRadius: '4px' }}>
              <Plus size={16} /> {loading ? 'Saving...' : 'Save Row'}
            </button>
          </form>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>ID</th>
                  <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Product Name</th>
                  <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Inward</th>
                  <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Outward</th>
                  <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Damaged</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{item.id}</td>
                    <td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{item.name}</td>
                    <td style={{ padding: '12px', border: '1px solid #cbd5e1', color: '#16a34a' }}>+{item.inward}</td>
                    <td style={{ padding: '12px', border: '1px solid #cbd5e1', color: '#2563eb' }}>-{item.outward}</td>
                    <td style={{ padding: '12px', border: '1px solid #cbd5e1', color: '#dc2626' }}>-{item.damaged}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', textAlign: 'center', border: '1px solid #cbd5e1', color: '#64748b' }}>
                      No inventory items found. Add some above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} /> Connection Settings
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Fetch Data URL:</label>
              <input 
                type="text" 
                value={fetchUrl} 
                onChange={e => {
                  setFetchUrl(e.target.value);
                  localStorage.setItem('sheetFetchUrl', e.target.value);
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Sync Updates URL:</label>
              <input 
                type="text" 
                value={syncUrl} 
                onChange={e => {
                  setSyncUrl(e.target.value);
                  localStorage.setItem('sheetSyncUrl', e.target.value);
                }}
                placeholder="https://script.google.com/macros/s/AKfycby9We64QxauXG7oEDprIAihbu9NPHK82iWetTFaZns4SWJvSqxKfzBM6S0UMY_AcSZ_/exec"
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
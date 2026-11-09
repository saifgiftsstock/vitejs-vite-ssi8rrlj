import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Package } from 'lucide-react';

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

// 🔴 PASTE YOUR GOOGLE APPS SCRIPT URL HERE:
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9We64QxauXG7oEDprIAihbu9NPHK82iWetTFaZns4SWJvSqxKfzBM6S0UMY_AcSZ_/exec";

export default function App() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [newItem, setNewItem] = useState<StockItem>({ id: '', name: '', inward: 0, outward: 0, damaged: 0 });

  useEffect(() => {
    // Auto-fetch data on load
    if (GOOGLE_SCRIPT_URL !== "PASTE_YOUR_WEB_APP_URL_HERE") {
      fetchData();
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    if (GOOGLE_SCRIPT_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
      showToast('Please configure the GOOGLE_SCRIPT_URL in the code first.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (GOOGLE_SCRIPT_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
      showToast('Please configure the GOOGLE_SCRIPT_URL in the code first.', 'error');
      return;
    }
    if (!newItem.id || !newItem.name) {
      showToast('ID and Name are required', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'append', item: newItem }),
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        showToast('Row added directly to Google Sheet!', 'success');
        setNewItem({ id: '', name: '', inward: 0, outward: 0, damaged: 0 });
        fetchData(); 
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to save to sheet.', 'error');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
        <Package /> Shop Stock Ledger
      </h1>

      {toast && (
        <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '6px', backgroundColor: toast.type === 'success' ? '#d4edda' : '#f8d7da', color: toast.type === 'success' ? '#155724' : '#721c24' }}>
          {toast.message}
        </div>
      )}

      <div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={fetchData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', cursor: 'pointer', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
            <RefreshCw size={16} /> {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>

        <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
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
    </div>
  );
}
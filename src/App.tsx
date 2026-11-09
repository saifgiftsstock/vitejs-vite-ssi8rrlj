import React, { useState } from 'react';
import { Plus, Package, UploadCloud } from 'lucide-react';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Form state
  const [newItem, setNewItem] = useState<StockItem>({ 
    id: '', name: '', inward: 0, outward: 0, damaged: 0 
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSyncRow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (GOOGLE_SCRIPT_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
      showToast('Please configure the GOOGLE_SCRIPT_URL at the top of the code first.', 'error');
      return;
    }
    if (!newItem.id || !newItem.name) {
      showToast('Item ID and Product Name are required.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // Pushing data to Google Sheets
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'text/plain;charset=utf-8' // Crucial to prevent CORS errors
        },
        body: JSON.stringify({ action: 'append', item: newItem }),
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        showToast(`Success! ${newItem.name} has been synced to your Google Sheet.`, 'success');
        // Clear the form for the next entry
        setNewItem({ id: '', name: '', inward: 0, outward: 0, damaged: 0 });
      } else {
        throw new Error('Script returned an error');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to sync. Please check your Apps Script deployment and URL.', 'error');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', color: '#0f172a' }}>
        <Package size={28} /> Stock Data Entry (Sync)
      </h1>

      {toast && (
        <div style={{ 
          padding: '15px', 
          marginBottom: '20px', 
          borderRadius: '6px', 
          backgroundColor: toast.type === 'success' ? '#dcfce7' : '#fee2e2', 
          color: toast.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          fontWeight: '500'
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', color: '#334155' }}>
          Add New Stock Record
        </h2>
        
        <form onSubmit={handleSyncRow} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Item ID *</label>
              <input 
                type="text" 
                placeholder="e.g. PRD-001" 
                value={newItem.id} 
                onChange={e => setNewItem({...newItem, id: e.target.value})} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
              />
            </div>
            
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Product Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Coffee Beans (1kg)" 
                value={newItem.name} 
                onChange={e => setNewItem({...newItem, name: e.target.value})} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#16a34a' }}>Inward (+)</label>
              <input 
                type="number" 
                value={newItem.inward || ''} 
                onChange={e => setNewItem({...newItem, inward: parseInt(e.target.value) || 0})} 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#2563eb' }}>Outward (-)</label>
              <input 
                type="number" 
                value={newItem.outward || ''} 
                onChange={e => setNewItem({...newItem, outward: parseInt(e.target.value) || 0})} 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#dc2626' }}>Damaged (-)</label>
              <input 
                type="number" 
                value={newItem.damaged || ''} 
                onChange={e => setNewItem({...newItem, damaged: parseInt(e.target.value) || 0})} 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              marginTop: '10px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px', 
              padding: '12px 20px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              backgroundColor: loading ? '#94a3b8' : '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? <UploadCloud size={20} className="animate-pulse" /> : <Plus size={20} />}
            {loading ? 'Syncing to Google Sheet...' : 'Sync Record to Sheet'}
          </button>
        </form>
      </div>
    </div>
  );
}
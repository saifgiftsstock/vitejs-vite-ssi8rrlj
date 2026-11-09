import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, UploadCloud, Plus, Package } from 'lucide-react';

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
  const [webAppUrl, setWebAppUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>(
    'dashboard'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [newItem, setNewItem] = useState<StockItem>({
    id: '',
    name: '',
    inward: 0,
    outward: 0,
    damaged: 0,
  });

  useEffect(() => {
    const savedUrl = localStorage.getItem('sheetWebAppUrl');
    if (savedUrl) setWebAppUrl(savedUrl);
    const savedItems = localStorage.getItem('shopStockItems');
    if (savedItems) setItems(JSON.parse(savedItems));
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.id || !newItem.name) {
      showToast('ID and Name are required', 'error');
      return;
    }

    // Check if item exists to update it, otherwise add new
    const existingIndex = items.findIndex((item) => item.id === newItem.id);
    let updatedItems;
    if (existingIndex >= 0) {
      updatedItems = [...items];
      updatedItems[existingIndex] = { ...newItem };
    } else {
      updatedItems = [...items, { ...newItem }];
    }

    setItems(updatedItems);
    localStorage.setItem('shopStockItems', JSON.stringify(updatedItems));
    setNewItem({ id: '', name: '', inward: 0, outward: 0, damaged: 0 });
    showToast('Item saved locally!', 'success');
  };

  const syncToSheet = async () => {
    if (!webAppUrl) {
      showToast('Please set Web App URL in Settings first', 'error');
      setActiveTab('settings');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'sync', items }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        showToast('Successfully synced to Google Sheets!', 'success');
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to sync. Check your URL.', 'error');
    }
    setLoading(false);
  };

  const fetchFromSheet = async () => {
    if (!webAppUrl) {
      showToast('Please set Web App URL in Settings first', 'error');
      setActiveTab('settings');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(webAppUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setItems(data);
        localStorage.setItem('shopStockItems', JSON.stringify(data));
        showToast('Data fetched from Google Sheets!', 'success');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to fetch. Check your URL.', 'error');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Package /> Shop Stock Maintenance
      </h1>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #ccc',
          paddingBottom: '10px',
        }}
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal',
            border: 'none',
            background: activeTab === 'dashboard' ? '#e0e0e0' : 'transparent',
            borderRadius: '4px',
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: activeTab === 'settings' ? 'bold' : 'normal',
            border: 'none',
            background: activeTab === 'settings' ? '#e0e0e0' : 'transparent',
            borderRadius: '4px',
          }}
        >
          Settings
        </button>
      </div>

      {toast && (
        <div
          style={{
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '6px',
            backgroundColor: toast.type === 'success' ? '#d4edda' : '#f8d7da',
            color: toast.type === 'success' ? '#155724' : '#721c24',
          }}
        >
          {toast.message}
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={fetchFromSheet}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} />{' '}
              {loading ? 'Loading...' : 'Fetch from Sheet'}
            </button>
            <button
              onClick={syncToSheet}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              <UploadCloud size={16} />{' '}
              {loading ? 'Syncing...' : 'Sync to Sheet'}
            </button>
          </div>

          <form
            onSubmit={handleAddItem}
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              backgroundColor: '#f9f9f9',
              padding: '15px',
              borderRadius: '6px',
              border: '1px solid #eee',
            }}
          >
            <input
              type="text"
              placeholder="Item ID"
              value={newItem.id}
              onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
              required
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
            <input
              type="text"
              placeholder="Product Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                flexGrow: 1,
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                placeholder="Inward"
                value={newItem.inward || ''}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    inward: parseInt(e.target.value) || 0,
                  })
                }
                style={{
                  padding: '8px',
                  width: '80px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
              <input
                type="number"
                placeholder="Outward"
                value={newItem.outward || ''}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    outward: parseInt(e.target.value) || 0,
                  })
                }
                style={{
                  padding: '8px',
                  width: '80px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
              <input
                type="number"
                placeholder="Damaged"
                value={newItem.damaged || ''}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    damaged: parseInt(e.target.value) || 0,
                  })
                }
                style={{
                  padding: '8px',
                  width: '80px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              <Plus size={16} /> Save Item
            </button>
          </form>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>
                    ID
                  </th>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>
                    Product Name
                  </th>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>
                    Inward
                  </th>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>
                    Outward
                  </th>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>
                    Damaged
                  </th>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>
                    Current Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: '12px', border: '1px solid #ccc' }}>
                      {item.id}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ccc' }}>
                      {item.name}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        border: '1px solid #ccc',
                        color: 'green',
                      }}
                    >
                      +{item.inward}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        border: '1px solid #ccc',
                        color: 'blue',
                      }}
                    >
                      -{item.outward}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        border: '1px solid #ccc',
                        color: 'red',
                      }}
                    >
                      -{item.damaged}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        border: '1px solid #ccc',
                        fontWeight: 'bold',
                      }}
                    >
                      {item.inward - item.outward - item.damaged}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: '30px',
                        textAlign: 'center',
                        border: '1px solid #ccc',
                        color: '#666',
                      }}
                    >
                      No inventory items found. Add some above or click "Fetch
                      from Sheet".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div
          style={{
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '6px',
            border: '1px solid #eee',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Settings size={20} /> Connection Settings
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxWidth: '600px',
            }}
          >
            <label style={{ fontWeight: 'bold' }}>
              Google Apps Script Web App URL:
            </label>
            <input
              type="text"
              value={webAppUrl}
              onChange={(e) => {
                setWebAppUrl(e.target.value);
                localStorage.setItem('sheetWebAppUrl', e.target.value);
              }}
              placeholder="https://script.google.com/macros/s/.../exec"
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '100%',
              }}
            />
            <small style={{ color: '#666', lineHeight: '1.5' }}>
              Paste the URL generated when you deployed your Apps Script. This
              allows the app to communicate directly with your Google Sheet to
              read and write stock data.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

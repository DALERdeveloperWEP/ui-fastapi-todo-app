
import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { CategoryResponse } from '../types';
import { useAuth } from '../App';

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('color', color);
    if (icon) formData.append('icon', icon);
    
    try {
      await api.createCategory(formData);
      setShowForm(false);
      setName('');
      setIcon(null);
      load();
    } catch (err) { alert('Failed to create category'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        {user?.role === 'admin' && (
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition">
            <i className="fa-solid fa-plus"></i> New Category
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12"><i className="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div key={cat.category_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  <i className="fa-solid fa-tag text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{cat.name}</h3>
                  <p className="text-xs font-mono text-gray-400 uppercase">{cat.color}</p>
                </div>
              </div>
              <button 
                onClick={async () => { if(confirm('Delete category?')) { await api.deleteCategory(cat.category_id); load(); } }}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">New Category</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-900"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required className="w-full p-2 border rounded-lg" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input type="color" className="w-full h-10 p-1 border rounded-lg cursor-pointer" value={color} onChange={e => setColor(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Icon (File)</label>
                <input type="file" className="w-full p-2 border rounded-lg" onChange={e => setIcon(e.target.files?.[0] || null)} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">Create</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

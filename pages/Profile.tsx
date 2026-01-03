
import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { ProfileResponse } from '../types';

export default function Profile() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getProfile();
        setProfile(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-12"><i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500"></i></div>;
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center p-1">
              <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-blue-600">
                <i className="fa-solid fa-user text-4xl"></i>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest ${
              profile.user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {profile.user.role}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.user.username}</h1>
            <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">User ID: #{profile.user.user_id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-2">Completion Rate</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900">
              {profile.result.task_count ? Math.round((profile.result.task_done / profile.result.task_count) * 100) : 0}%
            </p>
            <p className="text-sm text-green-500 font-bold mb-1">Efficiency</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-right">
          <p className="text-sm font-bold text-gray-400 uppercase mb-2">Total Tasks</p>
          <p className="text-4xl font-black text-blue-600">{profile.result.task_count}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-bold mb-6">Activity Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: 'Todo', val: profile.result.task_todo, color: 'bg-yellow-400' },
            { label: 'Doing', val: profile.result.task_doing, color: 'bg-purple-400' },
            { label: 'Done', val: profile.result.task_done, color: 'bg-green-400' },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600">{item.label}</span>
                <span className="text-gray-900">{item.val} tasks</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color}`} 
                  style={{ width: `${(item.val / profile.result.task_count) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

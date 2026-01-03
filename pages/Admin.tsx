
import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { User } from '../types';

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.adminGetUsers();
      setUsers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRoleUpdate = async (userId: number, newRole: "user" | "admin") => {
    try {
      await api.adminUpdateUser(userId, { role: newRole });
      load();
    } catch (err) { alert('Failed to update user'); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <i className="fa-solid fa-user-shield text-blue-600"></i> Admin Management
        </h1>
        <p className="text-gray-500 mt-1">Full control over users and system resources.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">User Registry</h3>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{users.length} Users Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12"><i className="fa-solid fa-spinner fa-spin text-blue-500"></i></td></tr>
              ) : users.map(user => (
                <tr key={user.user_id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono text-sm text-gray-400">#{user.user_id}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="text-sm p-2 border rounded-lg"
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(user.user_id, e.target.value as any)}
                    >
                      <option value="user">Set as User</option>
                      <option value="admin">Set as Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <i className="fa-solid fa-gears absolute top-4 right-4 text-6xl opacity-10"></i>
          <h4 className="text-xl font-bold mb-4">System Utilities</h4>
          <div className="space-y-3">
            <button 
              onClick={async () => {
                const results = await api.adminGetUsersDetails();
                console.log(results);
                alert('Detailed user logs printed to console');
              }}
              className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-xl flex items-center gap-3 transition"
            >
              <i className="fa-solid fa-file-invoice"></i>
              <span>Generate Detailed User Report</span>
            </button>
            <button 
              onClick={async () => {
                const results = await api.adminFilterTasks();
                console.log(results);
                alert('Task analysis printed to console');
              }}
              className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-xl flex items-center gap-3 transition"
            >
              <i className="fa-solid fa-filter-circle-dollar"></i>
              <span>Filter System-wide Task Analytics</span>
            </button>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-xl font-bold text-gray-900 mb-4">Security Notice</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            As an administrator, you have the authority to manage user roles and access reports. 
            All administrative actions are logged and should only be performed according to organizational policies.
          </p>
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl flex items-start gap-3">
            <i className="fa-solid fa-shield-halved text-yellow-600 mt-1"></i>
            <div>
              <p className="text-sm font-bold text-yellow-800">Protected Mode Active</p>
              <p className="text-xs text-yellow-700">Access to these features is restricted via strict backend middleware validation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { TaskResponse, TaskStatus, CategoryResponse, PriorityValue } from '../types';
import { Link } from 'react-router-dom';

export default function TaskList() {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // New Task Form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityValue>(3);
  const [newDueDate, setNewDueDate] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    try {
      let query = '';
      if (statusFilter) query += `status=${statusFilter}&`;
      if (priorityFilter) query += `priority=${priorityFilter}&`;
      if (dateFilter) query += `due_date=${dateFilter}&`;
      
      const [data, cats] = await Promise.all([
        api.getTasks(query),
        api.getCategories()
      ]);
      setTasks(data);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter, dateFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTask({
        name: newName,
        description: newDesc,
        category_id: parseInt(newCat),
        priority: newPriority,
        due_date: new Date(newDueDate).toISOString(),
        status: TaskStatus.TODO
      });
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      loadTasks();
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const getStatusLabel = (status: number) => {
    switch(status) {
      case 1: return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">TODO</span>;
      case 2: return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">DOING</span>;
      case 3: return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">DONE</span>;
      default: return null;
    }
  };

  const getPriorityColor = (p: number) => {
    if (p >= 4) return 'text-red-500';
    if (p >= 3) return 'text-orange-500';
    return 'text-blue-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm">Manage and track your project progress.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label>
          <select 
            className="w-full p-2 border rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="1">Todo</option>
            <option value="2">Doing</option>
            <option value="3">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Priority</label>
          <select 
            className="w-full p-2 border rounded-lg"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Due Date</label>
          <input 
            type="date"
            className="w-full p-2 border rounded-lg"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Task Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading tasks...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No tasks match your criteria.</td></tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.task_id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <Link to={`/tasks/${task.task_id}`} className="font-medium text-gray-900 hover:text-blue-600 transition">
                        {task.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{getStatusLabel(task.status)}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 font-bold ${getPriorityColor(task.priority)}`}>
                        <i className="fa-solid fa-fire text-xs"></i>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(task.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                        {categories.find(c => c.category_id === task.category_id)?.name || 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/tasks/${task.task_id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <i className="fa-solid fa-eye"></i>
                        </Link>
                        <button 
                          onClick={async () => {
                            if(confirm('Are you sure you want to delete this task?')) {
                              await api.deleteTask(task.task_id);
                              loadTasks();
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Create New Task</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required className="w-full p-2 border rounded-lg" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full p-2 border rounded-lg" rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select required className="w-full p-2 border rounded-lg" value={newCat} onChange={e => setNewCat(e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority (1-5)</label>
                  <input type="number" min="1" max="5" required className="w-full p-2 border rounded-lg" value={newPriority} onChange={e => setNewPriority(parseInt(e.target.value) as PriorityValue)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input type="date" required className="w-full p-2 border rounded-lg" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">Create Task</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { ProfileResponse, TaskResponse, TaskStatus } from '../types';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [recentTasks, setRecentTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prof, tasks] = await Promise.all([
          api.getProfile(),
          api.getTasks()
        ]);
        setProfile(prof);
        setRecentTasks(tasks.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500"></i></div>;

  const stats = [
    { label: 'Total Tasks', value: profile?.result.task_count, color: 'bg-blue-500', icon: 'fa-list' },
    { label: 'To Do', value: profile?.result.task_todo, color: 'bg-yellow-500', icon: 'fa-clock' },
    { label: 'Doing', value: profile?.result.task_doing, color: 'bg-purple-500', icon: 'fa-person-running' },
    { label: 'Done', value: profile?.result.task_done, color: 'bg-green-500', icon: 'fa-check-double' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.user.username}!</h1>
        <p className="text-gray-500 mt-2">Here's an overview of your productivity today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold mt-1 text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-4 rounded-xl text-white`}>
                <i className={`fa-solid ${stat.icon} text-xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Tasks</h3>
          <Link to="/tasks" className="text-sm text-blue-600 font-semibold hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No tasks found. Create one to get started!</div>
          ) : (
            recentTasks.map((task) => (
              <div key={task.task_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      task.status === TaskStatus.TODO ? 'bg-yellow-400' : 
                      task.status === TaskStatus.DOING ? 'bg-purple-400' : 'bg-green-400'
                    }`}></div>
                    <Link to={`/tasks/${task.task_id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {task.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-flag text-xs"></i>
                      Priority {task.priority}
                    </span>
                    <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

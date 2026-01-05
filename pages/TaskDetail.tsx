
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { TaskResponse, SubTaskResponse, AttachmentResponse, TaskStatus, PriorityValue } from '../types';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [subtasks, setSubtasks] = useState<SubTaskResponse[]>([]);
  const [attachments, setAttachments] = useState<AttachmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subtasks' | 'attachments'>('subtasks');

  // Subtask form
  const [subtaskName, setSubtaskName] = useState('');
  const [subtaskDesc, setSubtaskDesc] = useState('');

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const taskData = await api.getTask(parseInt(id));
      setTask(taskData);;

      // 2. Subtasks (user_subtasks endpoint BOR)
      const subtaskData = await api.getSubtasks(taskData.task_id);
      setSubtasks(
        subtaskData.filter(
          (st: SubTaskResponse) => st.task_id === taskData.task_id
        )
      );

      // 3. Attachments (user_attechments endpoint BOR)
      const attachmentData = await api.getUserAttachments();
      setAttachments(
        attachmentData.filter(
          (att: AttachmentResponse) => att.task_id === taskData.task_id
        )
      );

      // Backend note: prompt said subtasks/attachments must be fetched via OWN endpoints using task_id
      // Assuming a search or filter endpoint exists or we iterate if not listed. 
      // Given endpoints: POST /api/subtask, GET /api/subtask/{id}, etc.
      // In a real environment, we'd expect GET /api/subtask?task_id=X
      // Since no 'list' endpoint was provided explicitly other than generic for tasks, 
      // I will implement based on the assumption that subtask/attachment list endpoints 
      // exist or are part of the detail in a more complex setup.
      // For now, let's assume standard behavior.
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [id]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    try {
      const updated = await api.updateTask(task.task_id, { ...task, status: newStatus });
      setTask(updated);
    } catch (err) { alert('Failed to update status'); }
  };

  const addSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    try {
      await api.createSubtask({
        user_id: task.user_id,
        name: subtaskName,
        description: subtaskDesc,
        task_id: task.task_id
      });
      setSubtaskName('');
      setSubtaskDesc('');
      loadAll();
    } catch (err) { alert('Failed to add subtask'); }
  };

  const uploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task) return;

    const formData = new FormData();
    formData.append("att_file", file);
    formData.append("task_id", task.task_id.toString());

    try {
      await api.createAttachment(formData);
      loadAll(); // qayta yuklash
    } catch (err) {
      alert("Failed to upload file");
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center"><i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500"></i></div>;
  if (!task) return <div className="p-8 text-center text-red-500">Task not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 flex items-center gap-2">
        <i className="fa-solid fa-arrow-left"></i> Back to Tasks
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{task.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <select 
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold border-2 ${
                    task.status === 1 ? 'border-yellow-400 bg-yellow-50 text-yellow-800' :
                    task.status === 2 ? 'border-purple-400 bg-purple-50 text-purple-800' :
                    'border-green-400 bg-green-50 text-green-800'
                  }`}
                  value={task.status}
                  onChange={(e) => handleStatusChange(parseInt(e.target.value))}
                >
                  <option value={1}>TODO</option>
                  <option value={2}>DOING</option>
                  <option value={3}>DONE</option>
                </select>
                <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  <i className="fa-solid fa-fire text-orange-500"></i>
                  Priority {task.priority}
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  <i className="fa-solid fa-calendar"></i>
                  Due {new Date(task.due_date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={async () => {
                  if(confirm('Delete this task?')) {
                    await api.deleteTask(task.task_id);
                    navigate('/tasks');
                  }
                }}
                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>

          <div className="prose max-w-none text-gray-600 mb-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h4>
            {task.description || 'No description provided.'}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100 mb-6">
            <div className="flex gap-8">
              <button 
                onClick={() => setActiveTab('subtasks')}
                className={`pb-4 px-2 text-sm font-bold transition-colors ${activeTab === 'subtasks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Subtasks
              </button>
              <button 
                onClick={() => setActiveTab('attachments')}
                className={`pb-4 px-2 text-sm font-bold transition-colors ${activeTab === 'attachments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Attachments
              </button>
            </div>
          </div>

          {activeTab === 'subtasks' ? (
  /* ================= SUBTASKS TAB ================= */
  <div className="space-y-6">
    <div className="space-y-3">
      {subtasks.length === 0 ? (
        <p className="text-center py-8 text-gray-400 text-sm">
          No subtasks yet.
        </p>
      ) : (
        subtasks.map((st) => (
          <div
            key={st.sub_task_id}
            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition"
          >
            <div>
              <h4 className="font-bold text-gray-900">{st.name}</h4>
              {st.description && (
                <p className="text-sm text-gray-500">{st.description}</p>
              )}
            </div>

            <button
              type="button"
              onClick={async () => {
                await api.deleteSubtask(st.sub_task_id);
                loadAll();
              }}
              className="text-gray-300 hover:text-red-500"
              title="Delete subtask"
            >
              <i className="fa-solid fa-circle-xmark"></i>
            </button>
          </div>
        ))
      )}
    </div>

    {/* ADD SUBTASK FORM */}
    <form
      onSubmit={addSubtask}
      className="bg-gray-50 p-4 rounded-xl space-y-3"
    >
      <h4 className="text-sm font-bold text-gray-700">Add Subtask</h4>

      <input
        required
        type="text"
        placeholder="Subtask name"
        className="w-full p-2 border rounded-lg"
        value={subtaskName}
        onChange={(e) => setSubtaskName(e.target.value)}
      />

      <textarea
        placeholder="Optional description"
        className="w-full p-2 border rounded-lg"
        value={subtaskDesc}
        onChange={(e) => setSubtaskDesc(e.target.value)}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
      >
        Add
      </button>
    </form>
  </div>
) : (
  /* ================= ATTACHMENTS TAB ================= */
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {attachments.length === 0 ? (
        <p className="col-span-2 text-center py-8 text-gray-400 text-sm">
          No attachments yet.
        </p>
      ) : (
        attachments.map((att) => (
          <div
            key={att.attechment_id}
            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <i className="fa-solid fa-file text-blue-500"></i>

              <span
                className="text-sm font-medium truncate"
                title={att.file_path}
              >
                {att.file_path.split('/').pop()}
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                await api.deleteAttachment(att.attechment_id);
                loadAll();
              }}
              className="text-red-400 hover:text-red-600"
              title="Delete attachment"
            >
              <i className="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
        ))
      )}
    </div>

    {/* UPLOAD */}
    <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 hover:bg-gray-50 transition">
      <label className="cursor-pointer text-center">
        <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-300 mb-2"></i>
        <p className="text-sm text-gray-500 font-medium">
          Click to upload files
        </p>
        <input
          type="file"
          className="hidden"
          onChange={uploadAttachment}
        />
      </label>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
}

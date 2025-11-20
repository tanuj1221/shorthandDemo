import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Bell } from 'lucide-react';
import axios from 'axios';

const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    is_active: 1
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await axios.get('https://www.shorthandexam.in/api/admin/notices');
      if (response.data.success) {
        setNotices(response.data.notices);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      alert('Failed to fetch notices');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingNotice) {
        await axios.put(`https://www.shorthandexam.in/api/admin/notices/${editingNotice.id}`, formData);
        alert('Notice updated successfully');
      } else {
        await axios.post('https://www.shorthandexam.in/api/admin/notices', formData);
        alert('Notice created successfully');
      }
      
      setShowModal(false);
      setEditingNotice(null);
      setFormData({ title: '', content: '', priority: 'normal', is_active: 1 });
      fetchNotices();
    } catch (error) {
      console.error('Error saving notice:', error);
      alert('Failed to save notice');
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      is_active: notice.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      await axios.delete(`https://www.shorthandexam.in/api/admin/notices/${id}`);
      alert('Notice deleted successfully');
      fetchNotices();
    } catch (error) {
      console.error('Error deleting notice:', error);
      alert('Failed to delete notice');
    }
  };

  const toggleActive = async (notice) => {
    try {
      await axios.put(`https://www.shorthandexam.in/api/admin/notices/${notice.id}`, {
        ...notice,
        is_active: notice.is_active ? 0 : 1
      });
      fetchNotices();
    } catch (error) {
      console.error('Error toggling notice status:', error);
      alert('Failed to update notice status');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      normal: 'bg-blue-100 text-blue-700',
      low: 'bg-gray-100 text-gray-700'
    };
    return colors[priority] || colors.normal;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notice Management</h1>
            </div>
            <button
              onClick={() => {
                setEditingNotice(null);
                setFormData({ title: '', content: '', priority: 'normal', is_active: 1 });
                setShowModal(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>Create Notice</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{notice.title}</div>
                      <div className="text-sm text-gray-600 line-clamp-1">{notice.content}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        notice.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {notice.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(notice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => toggleActive(notice)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={notice.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {notice.is_active ? (
                            <Eye className="w-5 h-5 text-green-600" />
                          ) : (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(notice)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold">
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingNotice(null);
                    setFormData({ title: '', content: '', priority: 'normal', is_active: 1 });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeManagement;

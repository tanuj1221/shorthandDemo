import React, { useState, useEffect } from 'react';
import { Mail, Eye, Trash2, MessageSquare, Filter } from 'lucide-react';
import axios from 'axios';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, new_count: 0, read_count: 0, replied_count: 0 });
  const [selectedContact, setSelectedContact] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [filterStatus]);

  const fetchContacts = async () => {
    try {
      const url = filterStatus 
        ? `http://localhost:3001/api/admin/contacts?status=${filterStatus}`
        : 'http://localhost:3001/api/admin/contacts';
      
      const response = await axios.get(url);
      if (response.data.success) {
        setContacts(response.data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/contacts/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:3001/api/admin/contacts/${id}/status`, { status });
      fetchContacts();
      fetchStats();
      if (selectedContact?.id === id) {
        setSelectedContact({ ...selectedContact, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact submission?')) return;
    
    try {
      await axios.delete(`http://localhost:3001/api/admin/contacts/${id}`);
      fetchContacts();
      fetchStats();
      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  const viewContact = (contact) => {
    setSelectedContact(contact);
    if (contact.status === 'new') {
      updateStatus(contact.id, 'read');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700',
      read: 'bg-yellow-100 text-yellow-700',
      replied: 'bg-green-100 text-green-700'
    };
    return colors[status] || colors.new;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Mail className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contact Submissions</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-sm text-blue-600">Total</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl">
              <div className="text-2xl font-bold text-indigo-700">{stats.new_count}</div>
              <div className="text-sm text-indigo-600">New</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
              <div className="text-2xl font-bold text-yellow-700">{stats.read_count}</div>
              <div className="text-sm text-yellow-600">Read</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-700">{stats.replied_count}</div>
              <div className="text-sm text-green-600">Replied</div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No contact submissions found
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{contact.name}</div>
                        {contact.phone && (
                          <div className="text-sm text-gray-600">{contact.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.email}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-1">{contact.subject}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={contact.status}
                          onChange={(e) => updateStatus(contact.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(contact.status)} border-0 cursor-pointer`}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(contact.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => viewContact(contact)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => deleteContact(contact.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
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
      </div>

      {/* View Contact Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Contact Details</h2>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Name</label>
                  <p className="text-lg text-gray-900 mt-1">{selectedContact.name}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-gray-900 mt-1">{selectedContact.email}</p>
                  </div>
                  {selectedContact.phone && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Phone</label>
                      <p className="text-gray-900 mt-1">{selectedContact.phone}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Subject</label>
                  <p className="text-gray-900 mt-1">{selectedContact.subject}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Message</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                    {selectedContact.message}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Status</label>
                    <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold uppercase mt-1 ${getStatusColor(selectedContact.status)}`}>
                      {selectedContact.status}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Received</label>
                    <p className="text-gray-900 mt-1">{formatDate(selectedContact.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;

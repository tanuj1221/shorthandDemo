import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import axios from 'axios';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await axios.get('https://www.shorthandexam.in/api/notices');
      if (response.data.success) {
        setNotices(response.data.notices);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: {
        icon: AlertCircle,
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        iconColor: 'text-red-600',
        badgeColor: 'bg-red-100 text-red-700'
      },
      high: {
        icon: AlertTriangle,
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700',
        iconColor: 'text-orange-600',
        badgeColor: 'bg-orange-100 text-orange-700'
      },
      normal: {
        icon: Info,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-600',
        badgeColor: 'bg-blue-100 text-blue-700'
      },
      low: {
        icon: Info,
        color: 'gray',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
        iconColor: 'text-gray-600',
        badgeColor: 'bg-gray-100 text-gray-700'
      }
    };
    return configs[priority] || configs.normal;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">Loading notices...</div>
          </div>
        </div>
      </section>
    );
  }

  if (notices.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-indigo-600 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Notice <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Board</span>
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest announcements and important information
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => {
            const config = getPriorityConfig(notice.priority);
            const Icon = config.icon;

            return (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${config.badgeColor}`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${config.badgeColor} uppercase`}>
                    {notice.priority}
                  </span>
                </div>

                <h3 className={`text-lg font-bold ${config.textColor} mb-2 line-clamp-2`}>
                  {notice.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {notice.content}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(notice.created_at)}</span>
                  <span className="text-indigo-600 font-semibold hover:underline">
                    Read more →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedNotice(null)}
          ></div>

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scaleIn">
            {(() => {
              const config = getPriorityConfig(selectedNotice.priority);
              const Icon = config.icon;

              return (
                <>
                  <div className={`${config.bgColor} ${config.borderColor} border-b-2 p-6 relative`}>
                    <button
                      onClick={() => setSelectedNotice(null)}
                      className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>

                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${config.badgeColor}`}>
                        <Icon className={`w-8 h-8 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${config.badgeColor} uppercase`}>
                            {selectedNotice.priority}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatDate(selectedNotice.created_at)}
                          </span>
                        </div>
                        <h2 className={`text-2xl font-bold ${config.textColor}`}>
                          {selectedNotice.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedNotice.content}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
};

export default NoticeBoard;


import React from 'react';

const tools = [
  {
    key: 'ism',
    title: 'ISM 6.2',
    desc: 'ISM release (Google Drive link).',
    href: 'https://drive.google.com/file/d/17KkbCZQZE_mvR51VBBXVVfYOoQmOtoii/view?usp=drive_link',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600'
  }
];

export default function DownloadsSection() {
  return (
    <div className="min-h-[60vh] py-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900">Downloads</h2>
          <p className="mt-1 text-sm text-gray-600">Choose a file or tool to download. Links open in a new tab.</p>

          <div className="mt-6 space-y-4">
            {tools.map(tool => (
              <div key={tool.key} className="flex items-center justify-between gap-4 p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`${tool.iconBg} flex items-center justify-center h-12 w-12 rounded-md`}> 
                    {/* icon */}
                    {tool.key === 'anydesk' && (
                      <svg className={`${tool.iconColor} h-6 w-6`} viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 13h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    )}
                    {tool.key === 'rustdesk' && (
                      <svg className={`${tool.iconColor} h-6 w-6`} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {tool.key === 'shorthand' && (
                      <svg className={`${tool.iconColor} h-6 w-6`} viewBox="0 0 24 24" fill="none">
                        <path d="M12 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {tool.key === 'ism' && (
                      <svg className={`${tool.iconColor} h-6 w-6`} viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900">{tool.title}</div>
                    <div className="text-xs text-gray-500">{tool.desc}</div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <a
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, ExternalLink, Users, FileText } from 'lucide-react';

const SchemeCard = ({ scheme }) => {
  const [expanded, setExpanded] = useState(false);

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'health insurance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'financial aid': return 'bg-green-100 text-green-800 border-green-200';
      case 'senior citizens': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'maternal': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getCategoryColor(scheme.category)}`}>
            {scheme.category || 'Government Scheme'}
          </span>
          <div className="bg-primary-50 p-1.5 rounded text-primary-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{scheme.name}</h3>
        
        <p className={`text-sm text-gray-600 mb-4 ${expanded ? '' : 'line-clamp-2'}`}>
          {scheme.description}
        </p>

        {expanded && (
          <div className="space-y-4 mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
            <div>
              <h4 className="flex items-center text-sm font-semibold text-gray-900 mb-2">
                <Users className="h-4 w-4 mr-2 text-primary-500" />
                Eligibility
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {scheme.eligibility?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                )) || <li>Information not available</li>}
              </ul>
            </div>
            
            <div>
              <h4 className="flex items-center text-sm font-semibold text-gray-900 mb-2">
                <FileText className="h-4 w-4 mr-2 text-primary-500" />
                Required Documents
              </h4>
              <div className="flex flex-wrap gap-2">
                {scheme.documentsRequired?.map((doc, idx) => (
                  <span key={idx} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    {doc}
                  </span>
                )) || <span className="text-sm text-gray-600">Contact authority for details</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 bg-gray-50 p-3 flex items-center justify-between">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          {expanded ? (
            <>Read Less <ChevronUp className="h-4 w-4 ml-1" /></>
          ) : (
            <>Read More <ChevronDown className="h-4 w-4 ml-1" /></>
          )}
        </button>
        
        {scheme.officialLink && (
          <a 
            href={scheme.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Apply <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
};

export default SchemeCard;

import React from 'react';

const FeatureItem = ({ icon, title, description }) => {
  return (
    <div className="group flex gap-4 p-2 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-1">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureItem;
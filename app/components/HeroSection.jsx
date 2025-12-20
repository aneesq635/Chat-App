import React from 'react';
import FeatureItem from './FeatureItem';
import AuthCard from './AuthCard';
import { MessageCircle, Phone, Search, ShieldCheck } from 'lucide-react';

const HeroSection = () => {
  const features = [
    {
      icon: <MessageCircle className="w-6 h-6 text-black" />,
      title: "Instant 1-to-1 Chat",
      description: "Real-time messaging with delivery and read status."
    },
    {
      icon: <Phone className="w-6 h-6 text-black" />,
      title: "Voice & Video Calling",
      description: "High-quality calls powered by low-latency WebRTC."
    },
    {
      icon: <Search className="w-6 h-6 text-black" />,
      title: "User ID Discovery",
      description: "Connect using unique IDs — simple as a phone number."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-black" />,
      title: "Secure & Private",
      description: "Protected sessions and end-to-end safe communication."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Content */}
        <div className="space-y-8 pt-8 lg:pt-18">
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
            NexTalk
            Real-Time Chat. Voice. Video.{' '}
            <span className="text-indigo-600">
              All in One Place.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed">
            Connect instantly with people using secure real-time chat, voice, and video calls — 
            powered by modern web technologies and built for performance.
          </p>

          <div className="space-y-6">
            {features.map((feature, idx) => (
              <FeatureItem
                key={idx}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

          {/* <div className="flex items-center gap-2 text-sm text-slate-500 pt-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            
          </div> */}
        </div>

        {/* Right Content - Auth */}
        <div className="lg:pt-18 ">
          {/* <AuthCard /> */}
          <AuthCard />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
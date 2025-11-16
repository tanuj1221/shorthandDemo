import React from 'react';
import { Target, Zap, Shield, Heart } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Target,
      title: 'Focused Learning',
      description: 'Specialized curriculum designed specifically for shorthand mastery with proven methodologies.',
      color: 'indigo'
    },
    {
      icon: Zap,
      title: 'Smart Technology',
      description: 'AI-powered feedback and personalized learning paths that adapt to your progress.',
      color: 'purple'
    },
    {
      icon: Shield,
      title: 'Expert Guidance',
      description: 'Learn from certified instructors with years of real-world shorthand experience.',
      color: 'pink'
    },
    {
      icon: Heart,
      title: 'Student Success',
      description: 'Dedicated support system ensuring every student achieves their learning goals.',
      color: 'blue'
    }
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Shorthand LMS</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing shorthand education with cutting-edge technology and personalized learning experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              indigo: 'from-indigo-500 to-indigo-600',
              purple: 'from-purple-500 to-purple-600',
              pink: 'from-pink-500 to-pink-600',
              blue: 'from-blue-500 to-blue-600'
            };

            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[feature.color]} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Career?</h3>
          <p className="text-lg md:text-xl mb-10 opacity-90 max-w-3xl mx-auto">
            Join hundreds of students mastering stenography across English, Marathi, and Hindi.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all">
              <div className="text-3xl md:text-4xl font-bold mb-2">16</div>
              <div className="text-sm md:text-base text-indigo-100">Speed Levels</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all">
              <div className="text-3xl md:text-4xl font-bold mb-2">60-160</div>
              <div className="text-sm md:text-base text-indigo-100">WPM Range</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all">
              <div className="text-3xl md:text-4xl font-bold mb-2">3</div>
              <div className="text-sm md:text-base text-indigo-100">Languages</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all">
              <div className="text-3xl md:text-4xl font-bold mb-2">580+</div>
              <div className="text-sm md:text-base text-indigo-100">Active Students</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

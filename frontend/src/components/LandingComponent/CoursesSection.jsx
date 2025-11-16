import React, { useState } from 'react';
import { BookOpen, Clock, Users, Star, X, Award, Headphones } from 'lucide-react';

const CoursesSection = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const courses = [
    {
      title: 'English Shorthand',
      description: 'Master English shorthand with multiple passages recorded by expert stenographers.',
      levels: [
        { wpm: 60, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 80, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 100, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 120, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 130, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 140, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 150, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 160, passages: 'Multiple passages', experts: 'Multiple experts' }
      ],
      students: '250+',
      rating: 4.9,
      color: 'indigo',
      icon: '🇬🇧'
    },
    {
      title: 'Marathi Shorthand',
      description: 'Learn Marathi shorthand with professionally recorded passages from expert stenographers.',
      levels: [
        { wpm: 60, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 80, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 100, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 120, passages: 'Multiple passages', experts: 'Multiple experts' }
      ],
      students: '180+',
      rating: 4.8,
      color: 'purple',
      icon: '🇮🇳'
    },
    {
      title: 'Hindi Shorthand',
      description: 'Comprehensive Hindi shorthand training with diverse passages from experienced professionals.',
      levels: [
        { wpm: 60, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 80, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 100, passages: 'Multiple passages', experts: 'Multiple experts' },
        { wpm: 120, passages: 'Multiple passages', experts: 'Multiple experts' }
      ],
      students: '150+',
      rating: 4.9,
      color: 'pink',
      icon: '🇮🇳'
    }
  ];

  const openCourseModal = (course) => {
    setSelectedCourse(course);
  };

  const closeCourseModal = () => {
    setSelectedCourse(null);
  };

  return (
    <section id="courses" className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Courses</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our carefully designed courses that cater to all skill levels.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => {
            const colorClasses = {
              indigo: 'from-indigo-500 to-indigo-600',
              purple: 'from-purple-500 to-purple-600',
              pink: 'from-pink-500 to-pink-600'
            };

            return (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className={`h-2 bg-gradient-to-r ${colorClasses[course.color]}`}></div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{course.icon}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold text-gray-900">{course.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed min-h-[3rem]">
                    {course.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <BookOpen className="w-5 h-5 mr-3 text-indigo-600" />
                      <span>{course.levels.length} Speed Levels</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-5 h-5 mr-3 text-indigo-600" />
                      <span>{course.students} Students</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-3 text-indigo-600" />
                      <span>60-{course.levels[course.levels.length - 1].wpm} WPM</span>
                    </div>
                  </div>

                  {/* Spacer to push button to bottom */}
                  <div className="flex-grow"></div>

                  {/* View Speed Levels Button */}
                  <button
                    onClick={() => openCourseModal(course)}
                    className={`w-full bg-gradient-to-r ${colorClasses[course.color]} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105`}
                  >
                    View Speed Levels
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-6">
            Can't find the right course? We offer customized learning paths.
          </p>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
            Contact Us for Custom Courses
          </button>
        </div>
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeCourseModal}
          ></div>

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className={`bg-gradient-to-r ${
              selectedCourse.color === 'indigo' ? 'from-indigo-500 to-indigo-600' :
              selectedCourse.color === 'purple' ? 'from-purple-500 to-purple-600' :
              'from-pink-500 to-pink-600'
            } p-8 text-white relative`}>
              <button
                onClick={closeCourseModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-4 mb-4">
                <span className="text-5xl">{selectedCourse.icon}</span>
                <div>
                  <h2 className="text-3xl font-bold">{selectedCourse.title}</h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-semibold">{selectedCourse.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{selectedCourse.students} Students</span>
                  </div>
                </div>
              </div>

              <p className="text-white/90 text-lg">
                {selectedCourse.description}
              </p>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-250px)]">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="w-6 h-6 mr-2 text-indigo-600" />
                  Available Speed Levels
                </h3>
                <p className="text-gray-600 mb-6">
                  Each level includes multiple passages recorded by expert stenographers to help you master different speeds and styles.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {selectedCourse.levels.map((level, index) => (
                  <div
                    key={index}
                    className="group relative bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-400 transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Speed Badge */}
                    <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <div className="text-center">
                        <div className="text-white font-bold text-lg leading-none">{level.wpm}</div>
                        <div className="text-white text-xs">WPM</div>
                      </div>
                    </div>

                    <div className="pr-12">
                      <h4 className="text-xl font-bold text-gray-900 mb-3">
                        Level {index + 1}
                      </h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <BookOpen className="w-5 h-5 mr-2 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">Content</div>
                            <div className="text-sm text-gray-600">{level.passages}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Headphones className="w-5 h-5 mr-2 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">Recorded By</div>
                            <div className="text-sm text-gray-600">{level.experts}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Difficulty</span>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < Math.ceil((index + 1) / 2) ? 'bg-indigo-600' : 'bg-gray-300'
                                }`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  What You'll Get
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Multiple professionally recorded passages at each speed level</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Expert stenographers with years of experience</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Progressive difficulty to build your skills systematically</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Access to diverse passage content and recording styles</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CoursesSection;

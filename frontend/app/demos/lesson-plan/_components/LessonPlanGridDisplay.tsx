'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, List, Grid, Download, X } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';

interface LessonActivity {
  text: string;
}

interface LessonMaterial {
  name: string;
}

interface Lesson {
  id: string;
  title: string;
  timeBlock: string;
  objectives: string[];
  activities: string[];
  materials: string[];
  assessment: string;
  homework: string;
  category: string;
  color: string;
}

interface Day {
  dayOfMonth: number;
  dayOfWeek: string;
  holiday?: boolean;
  holidayName?: string;
  todaysLearning?: string;
  lessons: Lesson[];
}

interface Week {
  weekNumber: number;
  weeklyObjective: string;
  days: Day[];
}

interface LessonPlanData {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  teacher: string;
  academicYear: string;
  month: string;
  year: number;
  standards: string[];
  unitTheme: string;
  weeks: Week[];
}

interface LessonPlanGridDisplayProps {
  lessonPlan: LessonPlanData;
  onReset: () => void;
}

const LessonPlanGridDisplay: React.FC<LessonPlanGridDisplayProps> = ({
  lessonPlan,
  onReset
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(lessonPlan.year, getMonthIndex(lessonPlan.month), 1));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlyTodaysLearning, setShowOnlyTodaysLearning] = useState<boolean>(false);
  const [todaysLearningContent, setTodaysLearningContent] = useState<string>("");
  const [todaysLearningDay, setTodaysLearningDay] = useState<string>("");

  function getMonthIndex(month: string): number {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.indexOf(month);
  }

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const handleLessonClick = (lesson: Lesson, day: Day, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent triggering the day click event
    }
    setSelectedLesson(lesson);
    setSelectedDay(day);
    setShowOnlyTodaysLearning(false);
  };

  const handleDayClick = (day: Day) => {
    // When clicking on a day, just show the day with its Today's Learning
    setSelectedDay(day);
    // No lesson selected yet
    setSelectedLesson(null);
    setShowOnlyTodaysLearning(false);
  };

  const closeDetail = () => {
    setSelectedLesson(null);
    setSelectedDay(null);
  };

  const showTodaysLearningOnly = (day: Day) => {
    setTodaysLearningContent(day.todaysLearning || "No specific learning focus for today.");
    setTodaysLearningDay(`${day.dayOfWeek}, ${day.dayOfMonth}`);
    // Close all popups
    setSelectedDay(null);
    setSelectedLesson(null);
    setShowOnlyTodaysLearning(true);
  };

  const closeTodaysLearningView = () => {
    setShowOnlyTodaysLearning(false);
    // Clear the content when closing
    setTodaysLearningContent("");
    setTodaysLearningDay("");
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Introduction': 'bg-green-100 text-green-800',
      'Lab': 'bg-blue-100 text-blue-800',
      'Lecture': 'bg-orange-100 text-orange-800',
      'Project': 'bg-purple-100 text-purple-800',
      'Assessment': 'bg-red-100 text-red-800'
    };

    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderDetailModal = () => {
    if (!selectedDay) return null;

    const todaysLearningContent = selectedDay.todaysLearning || "No specific learning focus for today.";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4 overflow-y-auto" onClick={closeDetail}>
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedDay.dayOfWeek}, {selectedDay.dayOfMonth}</h3>
                {selectedDay.holiday && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 mt-1 inline-block">
                    {selectedDay.holidayName}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={closeDetail}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Today's Learning section - Always show this */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">Today's Learning</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => showTodaysLearningOnly(selectedDay)}
                >
                  View Only Today's Learning
                </Button>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700">{todaysLearningContent}</p>
              </div>
            </div>

            {/* If we have a selected lesson, show its details */}
            {selectedLesson ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-t pt-4">
                  <h4 className="text-lg font-semibold">{selectedLesson.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(selectedLesson.category)}`}>
                    {selectedLesson.category}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500">
                  {selectedLesson.timeBlock}
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Learning Objectives</h4>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {selectedLesson.objectives.map((objective, index) => (
                      <li key={index} className="text-gray-700">{objective}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Activities</h4>
                  <ol className="list-decimal pl-5 space-y-0.5">
                    {selectedLesson.activities.map((activity, index) => (
                      <li key={index} className="text-gray-700">{activity}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Materials</h4>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {selectedLesson.materials.map((material, index) => (
                      <li key={index} className="text-gray-700">{material}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Assessment</h4>
                  <p className="text-gray-700">{selectedLesson.assessment}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Homework</h4>
                  <p className="text-gray-700">{selectedLesson.homework}</p>
                </div>
              </div>
            ) : (
              /* If no lesson is selected, show the list of lessons for the day */
              selectedDay.lessons.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 mb-2">Lessons</h4>
                  {selectedDay.lessons.map((lesson) => (
                    <div 
                      key={lesson.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleLessonClick(lesson, selectedDay)}
                    >
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium">{lesson.title}</h5>
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(lesson.category)}`}>
                          {lesson.category}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {lesson.timeBlock}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={closeDetail}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGridView = () => {
    // Group days by week
    const weekMap = lessonPlan.weeks.reduce((map, week) => {
      week.days.forEach(day => {
        map[day.dayOfMonth] = { day, weekNumber: week.weekNumber, weeklyObjective: week.weeklyObjective };
      });
      return map;
    }, {} as Record<number, { day: Day, weekNumber: number, weeklyObjective: string }>);

    const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1); // Assuming max 31 days

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Calendar header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Weekly sections */}
        {lessonPlan.weeks.map(week => (
          <div key={week.weekNumber} className="mb-6">
            {/* Weekly objective */}
            <div className="p-3 bg-blue-50 rounded-t-lg">
              <span className="font-semibold text-blue-800">Week {week.weekNumber} Objective:</span>
              <span className="text-blue-700"> {week.weeklyObjective}</span>
            </div>

            {/* Days for this week */}
            <div className="grid grid-cols-7 gap-2 border rounded-b-lg border-blue-100 p-3 bg-white">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {(() => {
                // Find the first day of this week
                const weekDays = week.days.sort((a, b) => a.dayOfMonth - b.dayOfMonth);
                const firstDayOfWeek = weekDays[0];

                // Calculate the offset for the first day (which day of the week it falls on)
                const firstDayOffset = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                  .indexOf(firstDayOfWeek.dayOfWeek);

                // Generate empty cells for days before the first day of the week
                const emptyCells = Array.from({ length: firstDayOffset }, (_, i) => (
                  <div key={`empty-${i}`} className="min-h-[80px] bg-gray-50 rounded-lg"></div>
                ));

                // Generate cells for actual days
                const dayCells = weekDays.map(day => (
                  <div
                    key={`day-${day.dayOfMonth}`}
                    className={`min-h-[80px] rounded-lg border p-2 relative cursor-pointer ${day.holiday ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full">
                      <span className="text-xs">
                        {day.dayOfMonth}
                      </span>
                    </div>

                    {day.holiday ? (
                      <div className="text-xs text-red-600 font-medium">{day.holidayName}</div>
                    ) : day.lessons.length > 0 ? (
                      <div className="mt-5 space-y-1">
                        {day.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`text-xs p-1 rounded truncate ${getCategoryColor(lesson.category)}`}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent day click
                              handleLessonClick(lesson, day, e);
                            }}
                          >
                            {lesson.title}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ));

                // Fill any remaining cells to complete the week
                const remainingCells = Array.from({ length: Math.max(0, 7 - emptyCells.length - dayCells.length) }, (_, i) => (
                  <div key={`remaining-${i}`} className="min-h-[80px] bg-gray-50 rounded-lg"></div>
                ));

                return [...emptyCells, ...dayCells, ...remainingCells];
              })()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="divide-y">
          {lessonPlan.weeks.map((week) => (
            <div key={week.weekNumber} className="divide-y">
              <div className="p-3 bg-blue-50 text-sm">
                <span className="font-medium">Week {week.weekNumber} Objective:</span> {week.weeklyObjective}
              </div>

              {week.days.map((day) => (
                <div
                  key={`day-${day.dayOfMonth}`}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${day.holiday ? 'bg-red-50' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${day.holiday ? 'text-red-600' : 'text-gray-800'}`}>
                        {day.dayOfWeek}, {day.dayOfMonth}
                      </span>
                      {day.holiday && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                          {day.holidayName}
                        </span>
                      )}
                    </div>
                    {day.todaysLearning && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          showTodaysLearningOnly(day);
                        }}
                      >
                        Today's Learning
                      </Button>
                    )}
                  </div>

                  {day.lessons.length > 0 && (
                    <div className="space-y-2">
                      {day.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="pl-4 border-l-4"
                          style={{ borderColor: lesson.color }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent day click
                            handleLessonClick(lesson, day, e);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm text-gray-500">{lesson.timeBlock}</div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(lesson.category)}`}>
                              {lesson.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Show only Today's Learning view when enabled */}
      {showOnlyTodaysLearning ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Today's Learning</h2>
              <p className="text-gray-500">{todaysLearningDay}</p>
            </div>
            <Button variant="outline" size="sm" onClick={closeTodaysLearningView}>
              Back to Calendar
            </Button>
          </div>
          
          <div className="p-6 bg-blue-50 rounded-lg mb-6">
            <p className="text-gray-700">{todaysLearningContent}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Regular view - Lesson Plan Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{lessonPlan.title}</h2>
                <p className="text-gray-600 mb-1">
                  {lessonPlan.subject} • Grade {lessonPlan.gradeLevel} • {lessonPlan.academicYear}
                </p>
                <p className="text-gray-600">
                  Teacher: {lessonPlan.teacher}
                </p>
              </div>
              <div>
                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                  Unit: {lessonPlan.unitTheme}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Standards Addressed</h3>
              <ul className="list-disc pl-5 space-y-1">
                {lessonPlan.standards.map((standard, index) => (
                  <li key={index} className="text-gray-700">{standard}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-4 flex justify-between">
            <Button variant="outline" onClick={toggleViewMode}>
              {viewMode === 'grid' ? (
                <>
                  <List className="h-4 w-4 mr-2" />
                  List View
                </>
              ) : (
                <>
                  <Grid className="h-4 w-4 mr-2" />
                  Calendar View
                </>
              )}
            </Button>
            
            <div className="space-x-2">
              <Button variant="outline" onClick={onReset}>
                Change Plan
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Plan
              </Button>
            </div>
          </div>

          {/* Main content based on view mode */}
          {viewMode === 'grid' ? renderGridView() : renderListView()}
        </>
      )}

      {/* Combined detail modal - shows day info, Today's Learning, and lesson details if a lesson is selected */}
      {(selectedDay) && renderDetailModal()}
    </div>
  );
};

export default LessonPlanGridDisplay;
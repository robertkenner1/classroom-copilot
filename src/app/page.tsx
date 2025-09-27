'use client';

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HandThumbUpIcon, HandThumbDownIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  PaperClipIcon, 
  SparklesIcon, 
  ClockIcon, 
  LightBulbIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  ClipboardDocumentListIcon,
  MapIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  BookOpenIcon,
  PencilSquareIcon,
  PhotoIcon,
  HomeIcon,
  UserGroupIcon as UsersIcon,
  ClipboardDocumentListIcon as StandardsIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { PhotoIcon as PhotoIconSolid, AcademicCapIcon as AcademicCapIconSolid } from '@heroicons/react/24/solid';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

// Helper function to generate section-specific placeholder text
function getSectionPlaceholder(sectionId: string): string {
  const placeholders: Record<string, string> = {
    'introduction': 'Make the introduction more engaging...',
    'visual-representation': 'Improve the visual elements...',
    'formula-components': 'Clarify the formula breakdown...',
    'real-world-application': 'Add better real-world examples...',
    'practice-problems': 'Adjust the practice problems...',
    'assessment': 'Modify the assessment questions...',
    'summary': 'Enhance the lesson summary...'
  };
  
  return placeholders[sectionId] || `Improve the ${sectionId} section...`;
}

/**
 * Grade 8 Math – Minimal Prototype
 * Screens:
 * 1) Dashboard (Lesson Cards)
 * 2) Lesson Builder (choose subject, standard, class list -> Generate multimodal content)
 *
 * Tech: React + Tailwind. No external UI libs.
 */

// -------------------- Mock Data --------------------

// Persona & course context
const TEACHER = { name: "Ed Morales", role: "8th-grade Math" };
const COURSE = { id: "alg-x", name: "Algebra X", grade: "8" };

// Default behavior
const CONTEXT_DEFAULTS = {
  readingLevel: "8",                 // implied
  standardsMode: "auto",             // "auto" | "manual"
  standardsImplied: ["8.EE", "8.F", "8.SP"], // displayed as chips; not editable in auto
};

const SUBJECTS = [
  { id: "math", name: "Mathematics (Grade 8)" },
  { id: "sci", name: "Science (Grade 8)" },
];

const G8_MATH_STANDARDS = [
  { id: "8.EE.A.1", label: "Integer exponents – properties" },
  { id: "8.EE.B.5", label: "Graph proportional relationships" },
  { id: "8.EE.B.6", label: "Slope & similar triangles" },
  { id: "8.F.A.1", label: "Functions – input/output mapping" },
  { id: "8.F.B.4", label: "Model linear relationships" },
  { id: "8.SP.A.1", label: "Scatter plots – associations" },
];

// 8th Grade Math Standards (CCSSM)
const GRADE_8_STANDARDS = [
  { code: "8.NS.A.1", description: "Know that numbers that are not rational are called irrational" },
  { code: "8.NS.A.2", description: "Use rational approximations of irrational numbers" },
  { code: "8.EE.A.1", description: "Know and apply the properties of integer exponents" },
  { code: "8.EE.A.2", description: "Use square root and cube root symbols" },
  { code: "8.EE.A.3", description: "Use numbers expressed in scientific notation" },
  { code: "8.EE.A.4", description: "Perform operations with numbers expressed in scientific notation" },
  { code: "8.EE.B.5", description: "Graph proportional relationships" },
  { code: "8.EE.B.6", description: "Use similar triangles to explain slope" },
  { code: "8.EE.C.7", description: "Solve linear equations in one variable" },
  { code: "8.EE.C.8", description: "Analyze and solve systems of linear equations" },
  { code: "8.F.A.1", description: "Understand that a function is a rule" },
  { code: "8.F.A.2", description: "Compare properties of two functions" },
  { code: "8.F.A.3", description: "Interpret the equation y = mx + b" },
  { code: "8.F.B.4", description: "Construct a function to model a linear relationship" },
  { code: "8.F.B.5", description: "Describe the functional relationship between quantities" },
  { code: "8.G.A.1", description: "Verify experimentally the properties of rotations, reflections, and translations" },
  { code: "8.G.A.2", description: "Understand that a 2D figure is congruent to another" },
  { code: "8.G.A.3", description: "Describe the effect of dilations, translations, rotations, and reflections" },
  { code: "8.G.A.4", description: "Understand that a 2D figure is similar to another" },
  { code: "8.G.A.5", description: "Use informal arguments to establish facts about angles" },
  { code: "8.G.B.6", description: "Explain a proof of the Pythagorean Theorem" },
  { code: "8.G.B.7", description: "Apply the Pythagorean Theorem" },
  { code: "8.G.B.8", description: "Apply the Pythagorean Theorem to find distances" },
  { code: "8.G.C.9", description: "Know the formulas for volumes of cones, cylinders, and spheres" },
  { code: "8.SP.A.1", description: "Construct and interpret scatter plots" },
  { code: "8.SP.A.2", description: "Know that straight lines are widely used to model relationships" },
  { code: "8.SP.A.3", description: "Use the equation of a linear model to solve problems" },
  { code: "8.SP.A.4", description: "Understand that patterns of association can be seen in bivariate data" }
];

const CLASS_8A = {
  id: "class-8A",
  name: "Grade 8 • Algebra",
  // keep it simple — we "select all" by default
  students: [
    { id: "stu-01", name: "Ava Martinez", avgScore: 92, masteryBand: 4, masteryLabel: "Advanced", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face" },
    { id: "stu-02", name: "Ben Kim", avgScore: 88, masteryBand: 3, masteryLabel: "Proficient", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
    { id: "stu-03", name: "Chris Thompson", avgScore: 76, masteryBand: 3, masteryLabel: "Proficient", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
    { id: "stu-04", name: "Diana Patel", avgScore: 84, masteryBand: 3, masteryLabel: "Proficient", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
    { id: "stu-05", name: "Ethan Rodriguez", avgScore: 91, masteryBand: 4, masteryLabel: "Advanced", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
    { id: "stu-06", name: "Fiona Lee", avgScore: 79, masteryBand: 3, masteryLabel: "Proficient", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
    { id: "stu-07", name: "Gabriel Santos", avgScore: 87, masteryBand: 3, masteryLabel: "Proficient", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face" },
    { id: "stu-08", name: "Hannah Wilson", avgScore: 82, masteryBand: 3, masteryLabel: "Proficient", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face" },
    { id: "stu-09", name: "Isaac Johnson", avgScore: 95, masteryBand: 4, masteryLabel: "Advanced", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face" },
    { id: "stu-10", name: "Jade Chen", avgScore: 73, masteryBand: 2, masteryLabel: "Developing", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" }
  ],
};

// AI-prebaked lesson stubs (standards-aligned)
const PREBAKED: Lesson[] = [
  {
    id: "lsn-001",
    title: "Understanding Slope in y = mx + b",
    standards: ["8.EE.B.6", "8.F.B.4"],
    updatedAt: "2025-09-22",
    efficacy: 0.82,
    subject: "math",
    status: "published",
    completedCount: 18,
  },
  {
    id: "lsn-002",
    title: "Reading & Building Functions",
    standards: ["8.F.A.1"],
    updatedAt: "2025-09-19",
    efficacy: 0.76,
    subject: "math",
    status: "published",
    completedCount: 22,
  },
  {
    id: "lsn-003",
    title: "Integer Exponents – Laws & Patterns",
    standards: ["8.EE.A.1"],
    updatedAt: "2025-09-12",
    efficacy: 0.71,
    subject: "math",
    status: "published",
    completedCount: 15,
  },
];

const MODALITIES: { key: ModalityKey; name: string }[] = [
  { key: "text", name: "Immersive Text" },
  { key: "slides", name: "Slides & Narration" },
  { key: "video", name: "Video Lesson" },
  { key: "audio", name: "Audio Lesson" },
];

type ModalityKey = "text" | "slides" | "video" | "audio";

interface Standard {
  id: string;
  label: string;
}

interface Student {
  id: string;
  name: string;
}

interface ClassRoom {
  id: string;
  name: string;
  students: Student[];
}

interface Lesson {
  id: string;
  title: string;
  subject: string;
  standards: string[];
  updatedAt: string;
  efficacy: number;
  status?: 'draft' | 'published';
  completedCount?: number;
}

interface GeneratedPayload {
  text: string | null;
  slides: string | null;
  video: string | null;
  audio: string | null;
  quiz: string | null;
  mindmap: string | null;
}

interface GenerationState {
  isGenerating: boolean;
  currentStep: number;
  totalSteps: number;
  currentModality: ModalityKey | null;
}

// -------------------- App --------------------
export default function App() {
  const [lessons, setLessons] = useState(PREBAKED);
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder' | 'review' | 'students' | 'standards'>('dashboard');
  const [pendingLesson, setPendingLesson] = useState<Lesson | null>(null);

  function handleOpenLesson(id: string) {
    setOpenLessonId(id);
    setCurrentView('builder');
  }

  function handleCloseBuilder() {
    setOpenLessonId(null);
    setPendingLesson(null);
    setCurrentView('dashboard');
  }

  function handleLessonGenerated(lesson: Lesson) {
    setPendingLesson(lesson);
    setOpenLessonId(lesson.id);
    setCurrentView('builder'); // Go directly to builder instead of review
  }

  function handleNavigation(view: 'dashboard' | 'students' | 'standards') {
    setCurrentView(view);
    setOpenLessonId(null);
    setPendingLesson(null);
  }

  const extractTitleFromPrompt = (prompt: string): string => {
    // Simple title extraction - in real app would use AI
    const words = prompt.split(' ').slice(0, 6);
    return words.join(' ').replace(/[.!?]$/, '');
  };

  function handleConfirmLesson() {
    if (pendingLesson) {
      setLessons((prev) => [pendingLesson, ...prev]);
      setPendingLesson(null);
      setOpenLessonId(null);
      setCurrentView('dashboard');
    }
  }

  function handleEditLesson() {
    if (pendingLesson) {
      setCurrentView('builder');
    }
  }

  if (currentView === 'builder' && openLessonId) {
    const lesson = pendingLesson || lessons.find((l) => l.id === openLessonId)!;
  return (
      <TooltipProvider>
        <div className="min-h-screen bg-slate-50 text-foreground">
          <LeftSidebar currentView={currentView} onNavigate={handleNavigation} />
          <div className="ml-16">
            <LessonBuilder
              lesson={lesson}
              onClose={handleCloseBuilder}
              onSave={(patched) => {
                if (pendingLesson) {
                  setPendingLesson(patched);
                } else {
                  setLessons((prev) => prev.map((l) => (l.id === patched.id ? patched : l)));
                }
              }}
              isPending={!!pendingLesson}
              onConfirm={pendingLesson ? handleConfirmLesson : undefined}
              onNavigate={handleNavigation}
            />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  if (currentView === 'review' && pendingLesson) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-slate-50 text-foreground">
          <LeftSidebar currentView={currentView} onNavigate={handleNavigation} />
          <div className="ml-16">
            <LessonReview
              lesson={pendingLesson}
              onConfirm={handleConfirmLesson}
              onEdit={handleEditLesson}
              onCancel={handleCloseBuilder}
            />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  if (currentView === 'students') {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-slate-50 text-foreground">
          <LeftSidebar currentView={currentView} onNavigate={handleNavigation} />
          <div className="ml-16">
            <StudentsPage />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  if (currentView === 'standards') {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-slate-50 text-foreground">
          <LeftSidebar currentView={currentView} onNavigate={handleNavigation} />
          <div className="ml-16">
            <StandardsPage />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 text-foreground">
        <LeftSidebar currentView={currentView} onNavigate={handleNavigation} />

      <main className="ml-16 px-6 pt-20 pb-6">
        {/* AI-First Lesson Creation */}
        <UnifiedPromptComponent 
          mode="creation"
          onGenerate={async (data) => {
            // Simulate AI processing
            await new Promise(r => setTimeout(r, 2000));
            
            const newLesson: Lesson & { 
              prompt?: string; 
              uploadedFile?: File | null;
              selectedStudents?: string;
              specificStudents?: string[];
            } = {
              id: `lsn-${Math.floor(Math.random() * 9999)}`,
              title: extractTitleFromPrompt(data.prompt),
              subject: "math",
              standards: data.selectedStandard === "all" ? GRADE_8_STANDARDS.map(s => s.code) : 
                         data.selectedStandard && data.selectedStandard !== "none" ? [data.selectedStandard] : [],
              updatedAt: new Date().toISOString().slice(0, 10),
              efficacy: 0.85,
              status: 'draft',
              // Pass context to lesson builder
              prompt: data.prompt,
              uploadedFile: data.uploadedFile,
              selectedStudents: data.selectedStudents,
              specificStudents: data.specificStudents
            };
            
            handleLessonGenerated(newLesson);
          }}
        />

        {/* Generated Lessons */}
        {lessons.length > 0 && (
          <div className="mt-12 space-y-12">
            <div className="max-w-7xl mx-auto">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Guided Lessons</h2>
                      </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} onOpen={() => handleOpenLesson(lesson.id)} />
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="max-w-7xl mx-auto">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">More Guided Lessons</h2>
                      </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SuggestionCard 
                  title="Graphing Linear Inequalities"
                  reason="Next logical step after slope-intercept form"
                  standard="8.EE.B.6"
                  urgency="high"
                  timeEstimate="2 days"
                />
                <SuggestionCard 
                  title="Systems of Linear Equations"
                  reason="Builds on linear function understanding"
                  standard="8.EE.C.8"
                  urgency="medium"
                  timeEstimate="3 days"
                />
                <SuggestionCard 
                  title="Proportional Relationships Review"
                  reason="3 students struggled on last assessment"
                  standard="8.EE.B.5"
                  urgency="high"
                  timeEstimate="1 day"
                />
                      </div>
                    </div>

                    {/* Extra Credit / Self-Learning Lessons */}
                    <div className="max-w-7xl mx-auto">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Self-Taught Lessons</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ExtraCreditCard 
                          title="Advanced Quadratic Functions"
                          description="Explore complex quadratic relationships and their real-world applications in physics and engineering."
                          difficulty="Advanced"
                          estimatedTime="45 min"
                          standard="8.F.A.3"
                          availableFor="all"
                        />
                        <ExtraCreditCard 
                          title="Introduction to Trigonometry"
                          description="Get a head start on high school math with basic trigonometric ratios and the unit circle."
                          difficulty="Challenging"
                          estimatedTime="60 min"
                          standard="G.SRT.C.6"
                          availableFor="all"
                        />
                        <ExtraCreditCard 
                          title="Mathematical Modeling with Data"
                          description="Learn to create mathematical models using real-world data sets and statistical analysis."
                          difficulty="Intermediate"
                          estimatedTime="30 min"
                          standard="8.SP.A.2"
                          availableFor="all"
                        />
                        <ExtraCreditCard 
                          title="Geometric Transformations"
                          description="Dive deeper into rotations, reflections, and translations in the coordinate plane."
                          difficulty="Intermediate"
                          estimatedTime="35 min"
                          standard="8.G.A.3"
                          availableFor="all"
                        />
                        <ExtraCreditCard 
                          title="Introduction to Calculus Concepts"
                          description="Get a preview of derivatives and limits with visual explanations and real-world applications."
                          difficulty="Advanced"
                          estimatedTime="50 min"
                          standard="HS.F-IF.B.4"
                          availableFor="all"
                        />
                        <ExtraCreditCard 
                          title="Cryptography and Number Theory"
                          description="Explore how mathematics protects digital information through encryption and prime numbers."
                          difficulty="Challenging"
                          estimatedTime="40 min"
                          standard="8.EE.A.2"
                          availableFor="all"
                        />
                        <ExtraCreditCard 
                          title="Fractals and Infinite Patterns"
                          description="Discover the beauty of mathematical patterns that repeat at every scale in nature and art."
                          difficulty="Intermediate"
                          estimatedTime="25 min"
                          standard="8.G.B.7"
                          availableFor="all"
                        />
                        <ExtraCreditCard 
                          title="Game Theory and Strategy"
                          description="Learn how mathematics helps make optimal decisions in competitive situations and games."
                          difficulty="Advanced"
                          estimatedTime="45 min"
                          standard="8.SP.A.4"
                          availableFor="all"
                        />
                        <ExtraCreditCard 
                          title="The Mathematics of Music"
                          description="Explore how frequency, ratios, and patterns create harmony and rhythm in musical compositions."
                          difficulty="Intermediate"
                          estimatedTime="30 min"
                          standard="8.EE.B.5"
                          availableFor="all"
                        />
                        <ExtraCreditCard 
                          title="Probability in Sports and Games"
                          description="Apply probability concepts to analyze sports statistics, card games, and betting strategies."
                          difficulty="Intermediate"
                          estimatedTime="35 min"
                          standard="8.SP.A.1"
                          availableFor="all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </TooltipProvider>
        );
      }

// -------------------- Lesson Creator Component --------------------
function LessonCreator({ onLessonGenerated }: { onLessonGenerated: (lesson: Lesson) => void }) {
  const [prompt, setPrompt] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string>('all');
  const [specificStudents, setSpecificStudents] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<string>("all");
  
  // Mention functionality state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Typing animation state
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  
  // Example prompts for cycling animation
  const examplePrompts = [
    "I want to teach slope-intercept form using real-world examples. Target Band 4 students with advanced applications while providing scaffolded support for Band 1-2 students. Use 8.F.A.3 standards...",
    "Create a lesson on solving systems of linear equations for Band 3 students. Include interactive examples and practice problems aligned to 8.EE.C.8 standards.",
    "Design activities for the Pythagorean theorem connecting to architecture. Focus on Band 2 students with visual aids and hands-on practice using 8.G.B.7 standards.",
    "Teach scientific notation through astronomy examples. Challenge Band 4 students with complex calculations while Band 1 students focus on basic notation using 8.EE.A.3.",
    "Build a lesson on proportional relationships using cooking recipes. Differentiate for all bands with Band 1 getting concrete examples, Band 4 getting abstract applications."
  ];
  
  // Typing animation effect
  useEffect(() => {
    if (prompt) return; // Don't animate if user has typed something
    
    const currentExample = examplePrompts[currentExampleIndex];
    let timeoutId: NodeJS.Timeout;
    
    if (isTyping) {
      // Typing phase
      if (currentPlaceholder.length < currentExample.length) {
        timeoutId = setTimeout(() => {
          setCurrentPlaceholder(currentExample.slice(0, currentPlaceholder.length + 1));
        }, 50); // Typing speed
      } else {
        // Pause at end before deleting
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // Deleting phase
      if (currentPlaceholder.length > 0) {
        timeoutId = setTimeout(() => {
          setCurrentPlaceholder(currentPlaceholder.slice(0, -1));
        }, 30); // Deleting speed (faster)
      } else {
        // Move to next example
        setCurrentExampleIndex((prev) => (prev + 1) % examplePrompts.length);
        setIsTyping(true);
      }
    }
    
    return () => clearTimeout(timeoutId);
  }, [currentPlaceholder, currentExampleIndex, isTyping, prompt, examplePrompts]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(r => setTimeout(r, 2000));
    
    const newLesson: Lesson & { 
      prompt?: string; 
      uploadedFile?: File | null;
      selectedStudents?: string;
      specificStudents?: string[];
    } = {
      id: `lsn-${Math.floor(Math.random() * 9999)}`,
      title: extractTitleFromPrompt(prompt),
      subject: "math",
      standards: selectedStandard === "all" ? GRADE_8_STANDARDS.map(s => s.code) : 
                 selectedStandard && selectedStandard !== "none" ? [selectedStandard] : [], // Standards based on selection
      updatedAt: new Date().toISOString().slice(0, 10),
      efficacy: 0.85,
      status: 'draft',
      // Pass context to lesson builder
      prompt,
      uploadedFile,
      selectedStudents,
      specificStudents
    };
    
    setIsGenerating(false);
    onLessonGenerated(newLesson);
  };

  const extractTitleFromPrompt = (prompt: string): string => {
    // Simple title extraction - in real app would use AI
    const words = prompt.split(' ').slice(0, 6);
    return words.join(' ').replace(/[.!?]$/, '');
  };

  // Mention functionality
  const mentionableItems = [
    ...CLASS_8A.students.map(student => ({
      id: student.id,
      name: student.name,
      type: 'student' as const,
      masteryLevel: student.masteryLabel,
      masteryBand: student.masteryBand,
      initials: student.name.split(' ').map(n => n[0]).join(''),
      avatar: student.avatar
    })),
    { id: 'advanced', name: 'Advanced students', type: 'cohort' as const, masteryLevel: 'Advanced', masteryBand: 4, initials: 'AD', avatar: null },
    { id: 'proficient', name: 'Proficient students', type: 'cohort' as const, masteryLevel: 'Proficient', masteryBand: 3, initials: 'PR', avatar: null },
    { id: 'developing', name: 'Developing students', type: 'cohort' as const, masteryLevel: 'Developing', masteryBand: 2, initials: 'DE', avatar: null }
  ];

  const filteredMentions = mentionableItems.filter(item =>
    item.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setPrompt(value);
    
    // Check for @ mentions
    const textBeforeCursor = value.slice(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1);
      
      // Check if we're still in a mention (no spaces after @)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        console.log('@ detected, query:', textAfterAt);
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        setSelectedMentionIndex(0);
        
        // Calculate position for dropdown at cursor location
        if (textareaRef.current) {
          try {
            const textarea = textareaRef.current;
            
            // Simplified positioning - just position near the textarea
            const textareaRect = textarea.getBoundingClientRect();
            const parentRect = textarea.offsetParent?.getBoundingClientRect() || { top: 0, left: 0 };
            
            // Position at the start of the textarea for now (simpler and more reliable)
            setMentionPosition({
              top: textareaRect.top - parentRect.top - 8,
              left: textareaRect.left - parentRect.left + 24
            });
          } catch (error) {
            console.error('Error calculating mention position:', error);
            // Fallback positioning
            setMentionPosition({
              top: 0,
              left: 24
            });
          }
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (mention: typeof mentionableItems[0]) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = prompt.slice(0, cursorPosition);
    const textAfterCursor = prompt.slice(cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const newText = textBeforeCursor.slice(0, atIndex) + `@${mention.name} ` + textAfterCursor;
      setPrompt(newText);
      setShowMentions(false);
      
      // Set cursor position after the mention
      setTimeout(() => {
        const newCursorPos = atIndex + mention.name.length + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedMentionIndex(prev => 
        prev < filteredMentions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedMentionIndex(prev => 
        prev > 0 ? prev - 1 : filteredMentions.length - 1
      );
    } else if (e.key === 'Enter' && filteredMentions[selectedMentionIndex]) {
      e.preventDefault();
      handleMentionSelect(filteredMentions[selectedMentionIndex]);
    } else if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  return (
    <div className="mb-12">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold mb-4 text-slate-800">Good evening, Mr. Morales.</h1>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Fused Textarea and Toolbar */}
        <div className="border-2 border-slate-300 rounded-2xl bg-white shadow-none">
          {/* Main Prompt */}
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            className="h-64 resize-none border-0 rounded-t-2xl focus-visible:ring-0 focus-visible:ring-offset-0 p-6 shadow-none bg-transparent !text-lg placeholder:text-lg text-slate-800 placeholder:text-slate-400"
            placeholder={currentPlaceholder}
          />
          
          {/* Mention Dropdown */}
          {showMentions && filteredMentions.length > 0 && (
            <div 
              className="absolute z-50 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto min-w-64"
              style={{
                top: mentionPosition.top,
                left: mentionPosition.left,
                transform: 'translateY(-100%) translateY(-8px)' // Position above with extra spacing
              }}
            >
              {filteredMentions.map((mention, index) => (
                <div key={mention.id}>
                  <div
                  className={`grid grid-cols-[32px_1fr_auto] items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-100 ${
                    index === selectedMentionIndex ? 'bg-slate-200 border-l-2 border-slate-400' : ''
                  }`}
                    onClick={() => handleMentionSelect(mention)}
                  >
                    {/* Avatar Column */}
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      {mention.avatar ? (
                        <img 
                          src={mention.avatar} 
                          alt={mention.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-xs font-semibold text-white ${
                          mention.masteryBand === 4 ? 'bg-green-500' :
                          mention.masteryBand === 3 ? 'bg-blue-500' :
                          mention.masteryBand === 2 ? 'bg-orange-500' : 'bg-gray-500'
                        }`}>
                          {mention.initials}
                        </div>
                      )}
                    </div>
                    
                    {/* Name Column */}
                    <div className="font-medium text-slate-800 text-sm truncate">
                      {mention.name}
                    </div>
                    
                    {/* Mastery Band Column */}
                    <div className="flex-shrink-0">
                      {mention.type === 'cohort' ? (
                        <span className="text-xs text-slate-500">
                          Group
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {mention.masteryLevel}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Divider line between items (except last) */}
                  {index < filteredMentions.length - 1 && (
                    <div className="border-b border-slate-200 mx-3"></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Toolbar - directly attached */}
          <div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Students Selection */}
                <Select 
                  value={selectedStudents} 
                  onValueChange={(value) => setSelectedStudents(value)}
                >
                  <SelectTrigger className="w-48 h-8 text-xs bg-slate-200 border-0 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All students ({CLASS_8A.students.length})</SelectItem>
                    <SelectItem value="band1">Band 1 students ({CLASS_8A.students.filter(s => s.masteryBand === 1).length})</SelectItem>
                    <SelectItem value="band2">Band 2 students ({CLASS_8A.students.filter(s => s.masteryBand === 2).length})</SelectItem>
                    <SelectItem value="band3">Band 3 students ({CLASS_8A.students.filter(s => s.masteryBand === 3).length})</SelectItem>
                    <SelectItem value="band4">Band 4 students ({CLASS_8A.students.filter(s => s.masteryBand === 4).length})</SelectItem>
                    <SelectItem value="selected">
                      {specificStudents.length > 0 ? `${specificStudents.length} selected` : 'Select individual students'}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Standards Selection */}
                <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                  <SelectTrigger className="w-48 h-8 text-xs bg-slate-200 border-0 shadow-none">
                    <SelectValue placeholder="Select standard (optional)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="all">All CCSSM standards</SelectItem>
                    {GRADE_8_STANDARDS.map((standard) => (
                      <SelectItem key={standard.code} value={standard.code}>
                        {standard.code}
                      </SelectItem>
                    ))}
                    <SelectItem value="none">No CCSSM standards</SelectItem>
                  </SelectContent>
                </Select>

                {/* Source Material Upload */}
                <div className="flex items-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                      <span className="cursor-pointer flex items-center justify-center">
                        <PhotoIconSolid className="h-4 w-4 text-gray-400" />
                      </span>
                    </Button>
                  </label>
                  {uploadedFile && (
                    <span className="text-xs text-slate-500 ml-2 truncate max-w-24">
                      {uploadedFile.name}
                    </span>
                  )}
                </div>
              </div>

                    {/* Right side - Generate Button */}
                    <div className="flex items-center gap-3">
                      
                      <Button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        size="sm"
                        className="bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            Creating...
                          </div>
                        ) : (
                          <>Generate Lesson</>
                        )}
                      </Button>
                    </div>
            </div>

            {/* Student Selection Panel (when specific students selected) */}
            {selectedStudents === 'selected' && (
              <div className="p-3 bg-muted/30">
                <div className="text-xs font-medium mb-2">Select individual students:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {CLASS_8A.students.map((student) => (
                    <label key={student.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={specificStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSpecificStudents(prev => [...prev, student.id]);
                          } else {
                            setSpecificStudents(prev => prev.filter(id => id !== student.id));
                          }
                        }}
                        className="h-3 w-3"
                      />
                      <span className="text-xs flex-1">{student.name}</span>
                      <span className="text-xs text-slate-500">Band {student.masteryBand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- Breadcrumb --------------------
interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-slate-500 mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRightIcon className="h-4 w-4 mx-2" />}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-slate-700 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className={index === items.length - 1 ? "text-slate-800 font-medium" : ""}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// -------------------- Left Sidebar Navigation --------------------
function LeftSidebar({ currentView, onNavigate }: { 
  currentView: string; 
  onNavigate: (view: 'dashboard' | 'students' | 'standards') => void; 
}) {
  return (
    <div className="fixed left-0 top-0 h-screen w-16 bg-slate-100 border-r border-slate-300 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center justify-center p-4 border-b border-slate-300">
        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
          <AcademicCapIconSolid className="h-4 w-4 text-white" />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
              currentView === 'dashboard'
                ? 'bg-slate-200 text-slate-800' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            <HomeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onNavigate('students')}
            className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
              currentView === 'students' 
                ? 'bg-slate-200 text-slate-800' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            <UsersIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onNavigate('standards')}
            className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
              currentView === 'standards' 
                ? 'bg-slate-200 text-slate-800' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            <StandardsIcon className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Profile Menu */}
      <div className="p-2 border-t border-slate-300">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-center hover:bg-slate-200 rounded-lg p-3 transition-colors">
              <Avatar className="h-6 w-6">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt={TEACHER.name} />
                <AvatarFallback>
                  <UserIcon className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Cog6ToothIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// -------------------- Builder Header --------------------
function BuilderHeader({ title, onTitle, onClose, onSave, isPending }: {
  title: string;
  onTitle: (title: string) => void;
  onClose: () => void;
  onSave: () => void;
  isPending?: boolean;
}) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onClose} className="text-sm text-neutral-600 hover:underline">← Back to {COURSE.name}</button>
          <div className="mt-1 flex items-center gap-2">
            <input
              className="text-lg font-semibold outline-none rounded px-1 -mx-1 hover:bg-neutral-50 focus:bg-neutral-50"
              value={title}
              onChange={(e) => onTitle(e.target.value)}
            />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-600">
            <span className="px-2 py-0.5 rounded-full bg-neutral-100">{COURSE.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-neutral-100">Grade {COURSE.grade} (implied)</span>
            <span className="px-2 py-0.5 rounded-full bg-neutral-100">Standards: Auto ({COURSE.name})</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700">Draft</span>
          <button onClick={onClose} className="rounded-xl border px-3 py-2 bg-white">Close</button>
          <button onClick={onSave} className="rounded-xl bg-black text-white px-4 py-2 hover:opacity-90">
            {isPending ? "Publish Lesson" : "Save Draft"}
          </button>
          <button 
            disabled
            className="rounded-xl bg-blue-600 text-white px-4 py-2 opacity-50 cursor-not-allowed"
            title="Complete lesson to assign"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}


// -------------------- Suggestion Card --------------------
function SuggestionCard({ 
  title, 
  reason, 
  standard, 
  urgency, 
  timeEstimate 
}: { 
  title: string; 
  reason: string; 
  standard: string; 
  urgency: 'high' | 'medium' | 'low';
  timeEstimate: string;
}) {
  const urgencyVariant = urgency === 'high' ? 'destructive' : urgency === 'medium' ? 'default' : 'secondary';

  // Generate a summary with standards incorporated
  const getSummary = (title: string, standard: string) => {
    if (title.includes('Linear Inequalities')) {
      return `Learn to graph linear inequalities and understand solution regions on coordinate planes. Aligned to ${standard}.`;
    } else if (title.includes('Systems of Linear Equations')) {
      return `Solve systems using substitution and elimination methods with real-world applications. Covers ${standard}.`;
    } else if (title.includes('Proportional Relationships')) {
      return `Review and reinforce understanding of proportional relationships and their graphical representations. Addresses ${standard}.`;
    }
    return `AI-generated lesson content tailored to your class needs and curriculum standards. Targets ${standard}.`;
  };

  // Get illustration-style image based on lesson type
  const getPlaceholderImage = (title: string) => {
    if (title.includes('Linear Inequalities')) {
      // Colorful illustrated graph with shaded regions
      return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Systems of Linear Equations')) {
      // Illustrated coordinate plane with intersecting lines
      return 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Proportional Relationships')) {
      // Illustrated data visualization with clean graphics
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format';
    }
    // Default: illustrated mathematical concepts
    return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop&auto=format';
  };

  return (
    <Card className="cursor-pointer overflow-hidden border-2 border-slate-300 !bg-slate-50 shadow-none rounded-2xl">
      <CardContent className="p-0 relative">
        <div className="p-6 pb-4 bg-slate-50">
          <div className="mb-3">
            <CardTitle className="text-lg leading-snug text-slate-800">{title}</CardTitle>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-slate-600 leading-relaxed">{getSummary(title, standard)}</p>
          </div>
          
          <div className="text-sm text-slate-500 mb-4">
            <div className="flex items-start gap-2">
              <LightBulbIcon className="h-4 w-4" />
              <span>{reason}</span>
            </div>
          </div>
        </div>
        
        {/* Placeholder Image - Edge to Edge at Bottom */}
        <div className="h-60 bg-gradient-to-r from-blue-100 to-purple-100">
          <img 
            src={getPlaceholderImage(title)}
            alt="Lesson illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------- Extra Credit Card --------------------
function ExtraCreditCard({ 
  title, 
  description, 
  difficulty, 
  estimatedTime, 
  standard, 
  availableFor 
}: { 
  title: string; 
  description: string; 
  difficulty: string; 
  estimatedTime: string; 
  standard: string; 
  availableFor: string; 
}) {
  // Get illustration-style image based on lesson type
  const getPlaceholderImage = (title: string) => {
    if (title.includes('Quadratic')) {
      return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Trigonometry')) {
      return 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Data')) {
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Geometric')) {
      return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Calculus')) {
      return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Cryptography')) {
      return 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Fractals')) {
      return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Game Theory')) {
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Music')) {
      return 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Probability')) {
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format';
    }
    return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop&auto=format';
  };

  const getDifficultyVariant = (difficulty: string) => {
    if (difficulty === 'Advanced' || difficulty === 'Challenging') return 'destructive';
    if (difficulty === 'Intermediate') return 'default';
    return 'secondary';
  };

  return (
    <Card className="cursor-pointer overflow-hidden border-2 border-slate-300 !bg-slate-50 shadow-none rounded-2xl">
      <CardContent className="p-0 relative">
        <div className="p-6 pb-4 bg-slate-50">
          <div className="mb-3">
            <CardTitle className="text-lg leading-snug text-slate-800">{title}</CardTitle>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          </div>
          
          
          <div className="text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="h-4 w-4" />
              <span>Available for all students</span>
            </div>
          </div>
        </div>
        
        {/* Placeholder Image - Edge to Edge at Bottom */}
        <div className="h-60 bg-gradient-to-r from-purple-100 to-pink-100">
          <img 
            src={getPlaceholderImage(title)}
            alt="Lesson illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------- Lesson Card --------------------
function LessonCard({ lesson, onOpen }: { lesson: Lesson; onOpen: () => void }) {
  const { title, standards = [], updatedAt, status, completedCount = 0 } = lesson;
  
  // Mock data for students currently accessing lessons
  const getCurrentlyAccessingStudents = (lessonTitle: string) => {
    if (lessonTitle.includes('Understanding Slope')) {
      return CLASS_8A.students.filter(s => ['stu-01', 'stu-05', 'stu-09'].includes(s.id)); // Ava, Ethan, Isaac
    } else if (lessonTitle.includes('Reading & Building Functions')) {
      return CLASS_8A.students.filter(s => ['stu-02', 'stu-04', 'stu-07'].includes(s.id)); // Ben, Diana, Gabriel
    } else if (lessonTitle.includes('Integer Exponents')) {
      return CLASS_8A.students.filter(s => ['stu-03', 'stu-06', 'stu-08', 'stu-10'].includes(s.id)); // Chris, Fiona, Hannah, Jade
    }
    return [];
  };
  
  const currentlyAccessing = getCurrentlyAccessingStudents(title);
  
  // Generate a summary with standards incorporated
  const getSummary = (title: string, standards: string[]) => {
    const standardsText = standards.length > 0 ? standards.join(', ') : 'No standards assigned';
    
    if (title.includes('Slope-Intercept Form')) {
      return `Interactive lesson covering y = mx + b with real-world examples using skateboard ramps and stairs. Aligned to ${standardsText}.`;
    } else if (title.includes('Linear Functions')) {
      return `Comprehensive exploration of linear relationships through graphing and algebraic representation. Covers ${standardsText}.`;
    } else if (title.includes('Proportional Relationships')) {
      return `Deep dive into proportional thinking with hands-on activities and visual representations. Addresses ${standardsText}.`;
    } else if (title.includes('Exponents')) {
      return `Master integer exponents and their properties through engaging practice and applications. Targets ${standardsText}.`;
    }
    return `Multi-modal lesson with immersive content, slides, video, audio, and interactive assessments. Standards: ${standardsText}.`;
  };
  
  // Get illustration-style image based on lesson type
  const getPlaceholderImage = (title: string) => {
    if (title.includes('Slope-Intercept Form')) {
      // Illustrated linear graph with clean, colorful design
      return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Linear Functions')) {
      // Illustrated mathematical concepts with geometric shapes
      return 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Proportional Relationships')) {
      // Clean illustrated data visualization
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format';
    } else if (title.includes('Exponents')) {
      // Illustrated mathematical formulas and abstract concepts
      return 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop&auto=format';
    }
    // Default: illustrated mathematical and geometric concepts
    return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop&auto=format';
  };

  return (
    <Card className="cursor-pointer overflow-hidden border-2 border-slate-300 !bg-slate-100 shadow-none" onClick={onOpen}>
      <CardContent className="p-0 relative">
        <div className="p-6 pb-4 bg-slate-50">
          <div className="mb-3">
            <CardTitle className="text-lg leading-snug text-slate-800">{title}</CardTitle>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-slate-600 leading-relaxed">{getSummary(title, standards)}</p>
          </div>
          
          {/* Avatar Stack for Currently Accessing Students */}
          {currentlyAccessing.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-3">
                {currentlyAccessing.map((student, index) => (
                  <div
                    key={student.id}
                    className="w-8 h-8 rounded-full border-2 border-slate-50 overflow-hidden"
                    style={{ zIndex: currentlyAccessing.length - index }}
                  >
                    {student.avatar ? (
                      <img 
                        src={student.avatar} 
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-600">
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-xs text-slate-400 ml-1">viewing</span>
            </div>
          )}
        </div>
        
        {/* Placeholder Image - Edge to Edge at Bottom */}
        <div className="h-60 bg-gradient-to-r from-green-100 to-blue-100">
          <img 
            src={getPlaceholderImage(title)}
            alt="Lesson illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------- Lesson Review Component --------------------
function LessonReview({ 
  lesson, 
  onConfirm, 
  onEdit, 
  onCancel 
}: { 
  lesson: Lesson; 
  onConfirm: () => void; 
  onEdit: () => void; 
  onCancel: () => void; 
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <div className="h-6 border-l border-neutral-300"></div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-content-center font-bold">
                  G8
                </div>
                <div>
                  <div className="text-sm uppercase tracking-widest text-neutral-500">
                    Classroom Co-Pilot
                  </div>
                  <div className="font-semibold">Review Generated Lesson</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onEdit}
                className="rounded-xl border px-4 py-2 bg-white hover:bg-neutral-50"
              >
                Edit Materials
              </button>
              <button
                onClick={onConfirm}
                className="rounded-xl bg-green-600 text-white px-6 py-2 hover:bg-green-700"
              >
                Publish Lesson
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="bg-white rounded-2xl border shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="mb-4"><SparklesIcon className="h-16 w-16 mx-auto text-blue-500" /></div>
            <h1 className="text-3xl font-bold mb-2">Your lesson is ready!</h1>
            <p className="text-xl text-neutral-600">Review the generated materials and publish when you're satisfied</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-3">{lesson.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="font-medium text-neutral-700 mb-2">Standards Aligned</div>
                <div className="space-y-1">
                  {lesson.standards.map(std => (
                    <span key={std} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200 mr-2">
                      {std}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium text-neutral-700 mb-2">Materials Generated</div>
                <div className="space-y-1 text-neutral-600">
                  <div className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-green-600" />Immersive Text Lesson</div>
                  <div className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-green-600" />Slides & Narration</div>
                  <div className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-green-600" />Video Storyboard</div>
                  <div className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-green-600" />Audio Script</div>
                  <div className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-green-600" />Mind Map</div>
                </div>
              </div>
              <div>
                <div className="font-medium text-neutral-700 mb-2">Class Details</div>
                <div className="space-y-1 text-neutral-600">
                  <div>Grade 8 • Algebra</div>
                  <div>5 students</div>
                  <div>Reading level: Grade 8</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What happens when you publish?</h3>
              <ul className="space-y-2 text-neutral-600">
                <li className="flex items-start gap-2">
                  <DocumentTextIcon className="h-4 w-4 text-green-600 mt-1" />
                  <span>Materials added to your lesson library</span>
          </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">👥</span>
                  <span>Ready to assign to students</span>
          </li>
                <li className="flex items-start gap-2">
                  <PresentationChartBarIcon className="h-4 w-4 text-green-600 mt-1" />
                  <span>Analytics tracking begins</span>
                </li>
                <li className="flex items-start gap-2">
                  <DocumentTextIcon className="h-4 w-4 text-green-600 mt-1" />
                  <span>You can still edit materials anytime</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Need to make changes?</h3>
              <p className="text-neutral-600 mb-4">Click "Edit Materials" to:</p>
              <ul className="space-y-2 text-neutral-600">
                <li className="flex items-start gap-2">
                  <DocumentTextIcon className="h-4 w-4 text-blue-600 mt-1" />
                  <span>Modify any generated content</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowPathIcon className="h-4 w-4 text-blue-600 mt-1" />
                  <span>Regenerate specific modalities</span>
                </li>
                <li className="flex items-start gap-2">
                  <ClipboardDocumentListIcon className="h-4 w-4 text-blue-600 mt-1" />
                  <span>Adjust lesson title and standards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">👥</span>
                  <span>Change student targeting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- Toast Component --------------------
function Toast({ message, type, onClose }: { message: string, type: 'success' | 'info', onClose: () => void }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm ${
      type === 'success' ? 'bg-green-600' : 'bg-blue-600'
    }`}>
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200">×</button>
      </div>
    </div>
  );
}

// -------------------- Unified Prompt Component --------------------
function UnifiedPromptComponent({
  mode = 'creation',
  initialPrompt = '',
  initialContext = {},
  onGenerate,
  onSendMessage,
  onUpdateMessage,
  chatHistory = [],
  activeSection = null,
  onClearSection,
  onUndo,
  undoStack = [],
  className = ''
}: {
  mode?: 'creation' | 'refinement';
  initialPrompt?: string;
  initialContext?: any;
  onGenerate?: (data: any) => void;
  onSendMessage?: (message: string) => void;
  onUpdateMessage?: (messageId: string, updates: Partial<{reasoningCollapsed: boolean, feedback: 'positive' | 'negative' | null}>) => void;
  chatHistory?: Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date, reasoning?: string, summary?: string, reasoningCollapsed?: boolean, feedback?: 'positive' | 'negative' | null, isStreaming?: boolean}>;
  activeSection?: string | null;
  onClearSection?: () => void;
  onUndo?: () => void;
  undoStack?: Array<{sectionId: string, previousContent: string}>;
  className?: string;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedStudents, setSelectedStudents] = useState<string>(initialContext.selectedStudents || 'all');
  const [specificStudents, setSpecificStudents] = useState<string[]>(initialContext.specificStudents || []);
  const [uploadedFile, setUploadedFile] = useState<File | null>(initialContext.uploadedFile || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<string>(initialContext.selectedStandard || "all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [reasoningState, setReasoningState] = useState<'none' | 'streaming' | 'complete'>('none');
  const [reasoningStep, setReasoningStep] = useState(0);
  const [isReasoningCollapsed, setIsReasoningCollapsed] = useState(false);
  const [reasoningText, setReasoningText] = useState('');
  const [currentReasoningSection, setCurrentReasoningSection] = useState(0);
  const [summaryText, setSummaryText] = useState('');
  const [isSummaryTyping, setIsSummaryTyping] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  
  // Chat scroll ref
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when chat history changes
  useEffect(() => {
    if (chatScrollRef.current && mode === 'refinement') {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTo({
            top: chatScrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [chatHistory, reasoningText, summaryText, mode]);

  // Additional scroll trigger for when reasoning completes and summary starts
  useEffect(() => {
    if (chatScrollRef.current && mode === 'refinement' && isSummaryTyping) {
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTo({
            top: chatScrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 200);
    }
  }, [isSummaryTyping, mode]);
  
  // Mention functionality state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Typing animation state (for creation mode)
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  
  // Example prompts for cycling animation
  const examplePrompts = [
    "Create a lesson on linear equations for struggling students...",
    "Design activities for slope-intercept form with real-world examples...",
    "Build practice problems for systems of equations at different levels...",
    "Generate visual aids for graphing linear functions..."
  ];

  // Quick suggestions for refinement mode
  const quickSuggestions = [
    "Level down to Grade 6",
    "Add real-world example", 
    "Tighten for clarity",
    "Add visual elements",
    "Simplify vocabulary"
  ];

  // Typing animation effect (for creation mode)
  useEffect(() => {
    if (mode !== 'creation' || prompt) return;

    const currentExample = examplePrompts[currentExampleIndex];
    
    if (isTyping) {
      if (currentPlaceholder.length < currentExample.length) {
        const timer = setTimeout(() => {
          setCurrentPlaceholder(currentExample.slice(0, currentPlaceholder.length + 1));
        }, 50);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      if (currentPlaceholder.length > 0) {
        const timer = setTimeout(() => {
          setCurrentPlaceholder(currentPlaceholder.slice(0, -1));
        }, 30);
        return () => clearTimeout(timer);
      } else {
        setCurrentExampleIndex((prev) => (prev + 1) % examplePrompts.length);
        setIsTyping(true);
      }
    }
  }, [currentPlaceholder, currentExampleIndex, isTyping, prompt, examplePrompts, mode]);

  // Reasoning streaming effect (for refinement mode)
  useEffect(() => {
    if (mode === 'refinement' && initialPrompt && reasoningState === 'none') {
      setReasoningState('streaming');
      
      const reasoningSections = [
        "I'll create comprehensive lesson materials on slope-intercept form for your selected students. Let me first understand your specific requirements and then process them through our Classroom Co-Pilot system.",
        `Understanding your intent:\n\nI'm analyzing your request for ${initialContext.selectedStudents === 'band2' ? 'Band 2 (developing) students' : initialContext.selectedStudents === 'band1' ? 'Band 1 (emerging) students' : initialContext.selectedStudents === 'band3' ? 'Band 3 (proficient) students' : initialContext.selectedStudents === 'band4' ? 'Band 4 (advanced) students' : 'all students'}, focusing on ${initialContext.selectedStandard !== 'all' ? initialContext.selectedStandard : 'auto-selected CCSS standards'}, and creating lesson materials with multiple modalities${initialContext.uploadedFile ? ` based on your uploaded file: ${initialContext.uploadedFile.name}` : ''}.`,
        "Processing with Classroom Co-Pilot:\n\nI've analyzed curriculum standards (CCSS 8.F.A.3, 8.F.B.4), applied Grade 8 readability guidelines, and incorporated differentiation strategies. The system has generated visual representations, created real-world applications, and structured everything for a 30-minute lesson format."
      ];
      
      // Stream reasoning with typing simulation
      const streamSteps = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Type out each section
        for (let sectionIndex = 0; sectionIndex < reasoningSections.length; sectionIndex++) {
          setCurrentReasoningSection(sectionIndex);
          const sectionText = reasoningSections[sectionIndex];
          
          // Type out character by character
          for (let i = 0; i <= sectionText.length; i++) {
            setReasoningText(reasoningSections.slice(0, sectionIndex).join('\n\n') + 
              (sectionIndex > 0 ? '\n\n' : '') + sectionText.slice(0, i));
            await new Promise(resolve => setTimeout(resolve, 15)); // Fast typing speed
          }
          
          // Pause between sections
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        setReasoningState('complete');
        
        // Wait briefly before starting collapse animation
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsReasoningCollapsed(true);
        
        // Wait for collapse animation to complete, then start typing the summary
        await new Promise(resolve => setTimeout(resolve, 600));
        setIsSummaryTyping(true);
        
        const summaryContent = "I've created comprehensive lesson materials on slope-intercept form (y = mx + b) tailored for your students. The content includes an introduction with conceptual foundation and clear explanations, visual representation with interactive coordinate plane and examples, formula components with breakdown of variables and constants, and real-world application using cell phone plan modeling example.\n\nReady to refine? Select \"✨ Improve with AI\" on any section to start iterating, or ask me specific questions about the lesson content.";
        
        // Type out summary character by character
        for (let i = 0; i <= summaryContent.length; i++) {
          setSummaryText(summaryContent.slice(0, i));
          await new Promise(resolve => setTimeout(resolve, 12)); // Slightly faster for summary
        }
        
        setIsSummaryTyping(false);
      };
      
      streamSteps();
    }
  }, [mode, initialPrompt, reasoningState, initialContext]);

  // Mentionable items
  const mentionableItems = [
    ...CLASS_8A.students.map(student => ({
      id: student.id,
      name: student.name,
      type: 'student' as const,
      masteryLevel: student.masteryLevel,
      masteryBand: student.masteryBand,
      initials: student.name.split(' ').map(n => n[0]).join(''),
      avatar: student.avatar
    })),
    { id: 'advanced', name: 'Advanced students', type: 'cohort' as const, masteryLevel: 'Advanced', masteryBand: 4, initials: 'AD', avatar: null },
    { id: 'proficient', name: 'Proficient students', type: 'cohort' as const, masteryLevel: 'Proficient', masteryBand: 3, initials: 'PR', avatar: null },
    { id: 'developing', name: 'Developing students', type: 'cohort' as const, masteryLevel: 'Developing', masteryBand: 2, initials: 'DE', avatar: null }
  ];

  const filteredMentions = mentionableItems.filter(item =>
    item.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setPrompt(value);
    
    // Check for @ mentions
    const textBeforeCursor = value.slice(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1);
      
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        setSelectedMentionIndex(0);
        
        if (textareaRef.current) {
          try {
            const textarea = textareaRef.current;
            const textareaRect = textarea.getBoundingClientRect();
            const parentRect = textarea.offsetParent?.getBoundingClientRect() || { top: 0, left: 0 };
            
            setMentionPosition({
              top: textareaRect.top - parentRect.top - 8,
              left: textareaRect.left - parentRect.left + 24
            });
          } catch (error) {
            setMentionPosition({ top: 0, left: 24 });
          }
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (mention: typeof mentionableItems[0]) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = prompt.slice(0, cursorPosition);
    const textAfterCursor = prompt.slice(cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const newText = textBeforeCursor.slice(0, atIndex) + `@${mention.name} ` + textAfterCursor;
      setPrompt(newText);
      setShowMentions(false);
      
      setTimeout(() => {
        const newCursorPos = atIndex + mention.name.length + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions) {
      if (mode === 'refinement' && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedMentionIndex(prev => 
        prev < filteredMentions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedMentionIndex(prev => 
        prev > 0 ? prev - 1 : filteredMentions.length - 1
      );
    } else if (e.key === 'Enter' && filteredMentions[selectedMentionIndex]) {
      e.preventDefault();
      handleMentionSelect(filteredMentions[selectedMentionIndex]);
    } else if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    const data = {
      prompt,
      selectedStudents,
      specificStudents,
      uploadedFile,
      selectedStandard
    };
    
    if (onGenerate) {
      await onGenerate(data);
    }
    
    setIsGenerating(false);
  };

  const handleSendMessage = async () => {
    if (!prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    
    if (onSendMessage) {
      await onSendMessage(prompt);
    }
    
    setPrompt("");
    setIsProcessing(false);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  if (mode === 'creation') {
    // Original homepage layout
    return (
      <div className={`mb-12 ${className}`}>
        <div className="max-w-7xl mx-auto text-left mb-8">
          <h1 className="text-4xl font-bold mb-4 text-slate-800">Good evening, Mr. Morales.</h1>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="border-2 border-slate-300 rounded-2xl bg-white shadow-none">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              className="h-64 resize-none border-0 rounded-t-2xl focus-visible:ring-0 focus-visible:ring-offset-0 p-6 shadow-none bg-transparent !text-lg placeholder:text-lg text-slate-800 placeholder:text-slate-400"
              placeholder={currentPlaceholder}
            />
            
            {/* Mention Dropdown */}
            {showMentions && filteredMentions.length > 0 && (
              <div 
                className="absolute z-50 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto min-w-64"
                style={{
                  top: mentionPosition.top,
                  left: mentionPosition.left,
                  transform: 'translateY(-100%) translateY(-8px)'
                }}
              >
                {filteredMentions.map((mention, index) => (
                  <div key={mention.id}>
                    <div
                    className={`grid grid-cols-[32px_1fr_auto] items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-100 ${
                      index === selectedMentionIndex ? 'bg-slate-200 border-l-2 border-slate-400' : ''
                    }`}
                      onClick={() => handleMentionSelect(mention)}
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                        {mention.avatar ? (
                          <img 
                            src={mention.avatar} 
                            alt={mention.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-xs font-semibold text-white ${
                            mention.masteryBand === 4 ? 'bg-green-500' :
                            mention.masteryBand === 3 ? 'bg-blue-500' :
                            mention.masteryBand === 2 ? 'bg-orange-500' : 'bg-gray-500'
                          }`}>
                            {mention.initials}
                          </div>
                        )}
                      </div>
                      
                      <div className="font-medium text-slate-800 text-sm truncate">
                        {mention.name}
                      </div>
                      
                      <div className="flex-shrink-0">
                        {mention.type === 'cohort' ? (
                          <span className="text-xs text-slate-500">Group</span>
                        ) : (
                          <span className="text-xs text-slate-500">{mention.masteryLevel}</span>
                        )}
                      </div>
                    </div>
                    
                    {index < filteredMentions.length - 1 && (
                      <div className="border-b border-slate-200 mx-3"></div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div>
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Students Selection */}
                  <Select value={selectedStudents} onValueChange={setSelectedStudents}>
                    <SelectTrigger className="w-48 h-8 text-xs bg-slate-200 border-0 shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All students ({CLASS_8A.students.length})</SelectItem>
                      <SelectItem value="band1">Band 1 students ({CLASS_8A.students.filter(s => s.masteryBand === 1).length})</SelectItem>
                      <SelectItem value="band2">Band 2 students ({CLASS_8A.students.filter(s => s.masteryBand === 2).length})</SelectItem>
                      <SelectItem value="band3">Band 3 students ({CLASS_8A.students.filter(s => s.masteryBand === 3).length})</SelectItem>
                      <SelectItem value="band4">Band 4 students ({CLASS_8A.students.filter(s => s.masteryBand === 4).length})</SelectItem>
                      <SelectItem value="selected">
                        {specificStudents.length > 0 ? `${specificStudents.length} selected` : 'Select individual students'}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Standards Selection */}
                  <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                    <SelectTrigger className="w-48 h-8 text-xs bg-slate-200 border-0 shadow-none">
                      <SelectValue placeholder="Select standard (optional)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      <SelectItem value="all">All CCSSM standards</SelectItem>
                      {GRADE_8_STANDARDS.map((standard) => (
                        <SelectItem key={standard.code} value={standard.code}>
                          {standard.code}
                        </SelectItem>
                      ))}
                      <SelectItem value="none">No CCSSM standards</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Source Material Upload */}
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                        <span className="cursor-pointer flex items-center justify-center">
                          <PhotoIconSolid className="h-4 w-4 text-gray-400" />
                        </span>
                      </Button>
                    </label>
                    {uploadedFile && (
                      <span className="text-xs text-slate-500 ml-2 truncate max-w-24">
                        {uploadedFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    size="sm"
                    className="bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Creating...
                      </div>
                    ) : (
                      <>Generate Lesson</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Student Selection Panel */}
              {selectedStudents === 'selected' && (
                <div className="p-3 bg-muted/30">
                  <div className="text-xs font-medium mb-2">Select individual students:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {CLASS_8A.students.map((student) => (
                      <label key={student.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={specificStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSpecificStudents(prev => [...prev, student.id]);
                            } else {
                              setSpecificStudents(prev => prev.filter(id => id !== student.id));
                            }
                          }}
                          className="h-3 w-3"
                        />
                        <span className="text-xs flex-1">{student.name}</span>
                        <span className="text-xs text-slate-500">Band {student.masteryBand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Refinement mode (for lesson builder)
  return (
    <div className={`h-full bg-slate-100 border-l border-slate-300 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-300">
        <h3 className="font-semibold text-slate-800">AI Assistant</h3>
      </div>

      {/* Chat Transcript */}
      <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
              {/* Original Prompt as First Message */}
              {initialPrompt && (
                <div className="flex justify-end items-end gap-2">
                  <div className="max-w-[80%] p-3 rounded-lg text-sm bg-slate-200 text-slate-800">
                    {initialPrompt}
                  </div>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="Teacher" />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
          
          {/* AI Reasoning Process */}
          {initialPrompt && reasoningState !== 'none' && (
            <>
              <div className="flex justify-start">
                <div className="w-full text-sm text-gray-900">
                  <button 
                    onClick={() => setIsReasoningCollapsed(!isReasoningCollapsed)}
                    className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors ${isReasoningCollapsed ? '' : 'mb-3'}`}
                  >
                    <span className="text-xs font-medium">Reasoning</span>
                    <svg className={`w-3 h-3 transition-transform ${isReasoningCollapsed ? '' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-500 ${isReasoningCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
                    <div className="bg-gray-50 border-l-4 border-gray-300 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                      {reasoningText}
                      {reasoningState === 'streaming' && (
                        <span className="animate-pulse">|</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* AI Executive Summary Response */}
          {initialPrompt && reasoningState === 'complete' && (summaryText || isSummaryTyping) && (
            <div className="flex justify-start">
              <div className="w-full text-sm text-gray-900">
                <div className="whitespace-pre-wrap">
                  {summaryText}
                  {isSummaryTyping && (
                    <span className="animate-pulse">|</span>
                  )}
                </div>
                
                {/* Feedback Buttons */}
                {summaryText && !isSummaryTyping && (
                  <div className="flex items-center gap-1 mt-3">
                    <button
                      onClick={() => setFeedback(feedback === 'positive' ? null : 'positive')}
                      className={`p-1 transition-colors ${
                        feedback === 'positive' 
                          ? 'text-green-600' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title="Thumbs up"
                    >
                      <HandThumbUpIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setFeedback(feedback === 'negative' ? null : 'negative')}
                      className={`p-1 transition-colors ${
                        feedback === 'negative' 
                          ? 'text-red-600' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title="Thumbs down"
                    >
                      <HandThumbDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Regular Chat History */}
          {chatHistory.length === 0 && !initialPrompt ? (
            <div className="text-center text-gray-500 text-sm">
              <p>Select "Improve with AI" on any section to start collaborating!</p>
            </div>
          ) : (
            <>
              {chatHistory.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end items-end gap-2' : 'justify-start'}`}>
                  {message.type === 'user' ? (
                    <>
                      <div className="max-w-[80%] p-3 rounded-lg text-sm bg-slate-200 text-slate-800">
                        {message.content}
                      </div>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="Teacher" />
                        <AvatarFallback>
                          <UserIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </>
                  ) : (
                    <div className="w-full space-y-3">
                      {/* AI Reasoning for this turn */}
                      {message.reasoning && (
                        <div className="space-y-2">
                          <button
                            onClick={() => onUpdateMessage?.(message.id, { reasoningCollapsed: !message.reasoningCollapsed })}
                            className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors ${message.reasoningCollapsed ? '' : 'mb-3'}`}
                          >
                            <span className="text-xs font-medium">Reasoning</span>
                            <svg className={`w-3 h-3 transition-transform ${message.reasoningCollapsed ? '' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          
                          <div className={`overflow-hidden transition-all duration-500 ${message.reasoningCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
                            <div className="bg-gray-50 border-l-4 border-gray-300 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                              {message.reasoning}
                              {message.isStreaming && message.reasoning && (
                                <span className="animate-pulse">|</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* AI Summary/Response */}
                      <div className="w-full text-sm text-gray-900">
                        {message.content}
                        {message.isStreaming && message.content && (
                          <span className="animate-pulse">|</span>
                        )}
                      </div>
                      
                      {/* Feedback buttons for each AI response */}
                      {!message.isStreaming && (
                        <div className="flex items-center gap-1 mt-3">
                        <button
                          onClick={() => onUpdateMessage?.(message.id, { feedback: message.feedback === 'positive' ? null : 'positive' })}
                          className={`p-1 transition-colors ${
                            message.feedback === 'positive' 
                              ? 'text-green-600' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                          title="Thumbs up"
                        >
                          <HandThumbUpIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onUpdateMessage?.(message.id, { feedback: message.feedback === 'negative' ? null : 'negative' })}
                          className={`p-1 transition-colors ${
                            message.feedback === 'negative' 
                              ? 'text-red-600' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                          title="Thumbs down"
                        >
                          <HandThumbDownIcon className="w-5 h-5" />
                        </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-300">
        {/* Active Section Chip */}
        {activeSection && (
          <div className="mb-3">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full flex items-center gap-2 w-fit">
              Section: {activeSection}
              {onClearSection && (
                <button 
                  onClick={onClearSection}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ×
                </button>
              )}
            </span>
          </div>
        )}

        {/* Homepage-style Layout */}
        <div className="border-2 border-slate-300 rounded-2xl bg-white shadow-none">
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder={activeSection ? getSectionPlaceholder(activeSection) : "Ask AI to help with lesson..."}
            className="h-24 resize-none border-0 rounded-t-2xl focus-visible:ring-0 focus-visible:ring-offset-0 p-3 shadow-none bg-transparent text-sm placeholder:text-sm text-slate-800 placeholder:text-slate-400"
            disabled={isProcessing}
          />
          
          {/* Mention Dropdown for refinement mode */}
          {showMentions && filteredMentions.length > 0 && (
            <div 
              className="absolute z-50 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto min-w-64 bottom-full mb-2"
              style={{
                left: mentionPosition.left,
              }}
            >
              {filteredMentions.map((mention, index) => (
                <div key={mention.id}>
                  <div
                  className={`grid grid-cols-[32px_1fr_auto] items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-100 ${
                    index === selectedMentionIndex ? 'bg-slate-200 border-l-2 border-slate-400' : ''
                  }`}
                    onClick={() => handleMentionSelect(mention)}
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      {mention.avatar ? (
                        <img 
                          src={mention.avatar} 
                          alt={mention.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-xs font-semibold text-white ${
                          mention.masteryBand === 4 ? 'bg-green-500' :
                          mention.masteryBand === 3 ? 'bg-blue-500' :
                          mention.masteryBand === 2 ? 'bg-orange-500' : 'bg-gray-500'
                        }`}>
                          {mention.initials}
                        </div>
                      )}
                    </div>
                    
                    <div className="font-medium text-slate-800 text-sm truncate">
                      {mention.name}
                    </div>
                    
                    <div className="flex-shrink-0">
                      {mention.type === 'cohort' ? (
                        <span className="text-xs text-slate-500">Group</span>
                      ) : (
                        <span className="text-xs text-slate-500">{mention.masteryLevel}</span>
                      )}
                    </div>
                  </div>
                  
                  {index < filteredMentions.length - 1 && (
                    <div className="border-b border-slate-200 mx-3"></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Controls Row */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Students Selection */}
              <Select value={selectedStudents} onValueChange={setSelectedStudents}>
                <SelectTrigger className="h-8 text-xs bg-slate-200 border-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All students (10)</SelectItem>
                  <SelectItem value="band1">Band 1 students (2)</SelectItem>
                  <SelectItem value="band2">Band 2 students (3)</SelectItem>
                  <SelectItem value="band3">Band 3 students (3)</SelectItem>
                  <SelectItem value="band4">Band 4 students (2)</SelectItem>
                  <SelectItem value="specific">Select individual students</SelectItem>
                </SelectContent>
              </Select>

              {/* Standards Selection */}
              <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                <SelectTrigger className="h-8 text-xs bg-slate-200 border-0 shadow-none">
                  <SelectValue placeholder="Select standard (optional)" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="all">All CCSSM standards</SelectItem>
                  <SelectItem value="8.NS.A.1">8.NS.A.1</SelectItem>
                  <SelectItem value="8.NS.A.2">8.NS.A.2</SelectItem>
                  <SelectItem value="8.EE.A.1">8.EE.A.1</SelectItem>
                  <SelectItem value="8.EE.A.2">8.EE.A.2</SelectItem>
                  <SelectItem value="8.F.A.1">8.F.A.1</SelectItem>
                  <SelectItem value="8.F.A.2">8.F.A.2</SelectItem>
                  <SelectItem value="8.F.A.3">8.F.A.3</SelectItem>
                  <SelectItem value="8.F.B.4">8.F.B.4</SelectItem>
                  <SelectItem value="8.F.B.5">8.F.B.5</SelectItem>
                  <SelectItem value="8.G.A.1">8.G.A.1</SelectItem>
                  <SelectItem value="8.G.A.2">8.G.A.2</SelectItem>
                  <SelectItem value="8.G.A.3">8.G.A.3</SelectItem>
                  <SelectItem value="8.G.A.4">8.G.A.4</SelectItem>
                  <SelectItem value="8.G.A.5">8.G.A.5</SelectItem>
                  <SelectItem value="8.G.B.6">8.G.B.6</SelectItem>
                  <SelectItem value="8.G.B.7">8.G.B.7</SelectItem>
                  <SelectItem value="8.G.B.8">8.G.B.8</SelectItem>
                  <SelectItem value="8.SP.A.1">8.SP.A.1</SelectItem>
                  <SelectItem value="8.SP.A.2">8.SP.A.2</SelectItem>
                  <SelectItem value="8.SP.A.3">8.SP.A.3</SelectItem>
                  <SelectItem value="8.SP.A.4">8.SP.A.4</SelectItem>
                </SelectContent>
              </Select>

              {/* Source Material Upload */}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="ai-chat-file-upload"
              />
              <label htmlFor="ai-chat-file-upload">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                  <span className="cursor-pointer flex items-center justify-center">
                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0119.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-4.75 4.75a.75.75 0 01-1.06 0L8.5 15.75a1.5 1.5 0 00-2.12 0L3 18.44zm18-11.5v-.5a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v.5l4.5 3a.75.75 0 001.06 0l4.25-3.5a1.5 1.5 0 012.12 0L21 5.5zm-10.5 3a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Button>
              </label>
              
              {uploadedFile && (
                <span className="text-xs text-slate-500 ml-2 truncate max-w-24">
                  {uploadedFile.name}
                </span>
              )}
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!prompt.trim() || isProcessing}
              className="bg-slate-800 hover:bg-slate-900 text-white h-8 w-8 p-0 rounded-lg"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Undo Button */}
        {undoStack.length > 0 && onUndo && (
          <div className="mt-2">
            <button
              onClick={onUndo}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              Undo last change
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------- Floating AI Assistant Component --------------------
function FloatingAIAssistant({
  activeSection,
  onClearSection,
  onApplyEdit,
  onUndo,
  chatHistory,
  setChatHistory,
  subject,
  standard,
  undoStack
}: {
  activeSection: string | null;
  onClearSection: () => void;
  onApplyEdit: (sectionId: string, newContent: string) => void;
  onUndo: () => void;
  chatHistory: Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date, reasoning?: string, summary?: string, reasoningCollapsed?: boolean, feedback?: 'positive' | 'negative' | null, isStreaming?: boolean}>;
  setChatHistory: (history: Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date, reasoning?: string, summary?: string, reasoningCollapsed?: boolean, feedback?: 'positive' | 'negative' | null, isStreaming?: boolean}>) => void;
  subject: string;
  standard: string;
  undoStack: Array<{sectionId: string, previousContent: string}>;
}) {
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const quickSuggestions = [
    "Level down to Grade 6",
    "Add real-world example", 
    "Tighten for clarity",
    "Add visual elements",
    "Simplify vocabulary"
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = {
      id: `user-floating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user' as const,
      content: inputValue,
      timestamp: new Date()
    };

    setChatHistory([...chatHistory, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse = {
      id: `ai-floating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'ai' as const,
      content: `I'll help you ${inputValue.toLowerCase()}. Here's my suggestion for the ${activeSection || 'content'}: ${inputValue} (AI revision)`,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, aiResponse]);
    setIsProcessing(false);

    // If there's an active section, apply the edit
    if (activeSection) {
      onApplyEdit(activeSection, aiResponse.content);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="h-full bg-white/95 backdrop-blur-sm border-l border-gray-200 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white/90 backdrop-blur-sm">
        <h3 className="font-semibold text-gray-900">AI Assistant</h3>
      </div>

      {/* Chat Transcript - Scrollable Middle Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">
            <p>Select "Improve with AI" on any section to start collaborating!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chatHistory.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.type === 'user' 
                    ? 'bg-slate-200 text-slate-800' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="p-4 border-t border-slate-300">
        {/* Quick Suggestions - Now at top */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleQuickSuggestion(suggestion)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Context Chips - Moved from header */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {subject === "math" ? "Algebra X" : subject}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            Grade 8
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            CCSSM {standard || "8.EE/8.F"}
          </span>
          {/* Active Section Chip */}
          {activeSection && (
            <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full flex items-center gap-1">
              Section: {activeSection}
              <button 
                onClick={onClearSection}
                className="ml-1 text-slate-500 hover:text-slate-700"
              >
                ×
              </button>
            </span>
          )}
        </div>

        {/* Input Box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={activeSection ? getSectionPlaceholder(activeSection) : "Ask AI to help with lesson..."}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        {/* Undo Button */}
        {undoStack.length > 0 && (
          <div className="mt-2">
            <button
              onClick={onUndo}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              Undo last change
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------- Right Rail Chat Component --------------------
function RightRailChat({
  activeSection,
  onClearSection,
  onApplyEdit,
  onUndo,
  chatHistory,
  setChatHistory,
  subject,
  standard,
  undoStack
}: {
  activeSection: string | null;
  onClearSection: () => void;
  onApplyEdit: (sectionId: string, newContent: string) => void;
  onUndo: () => void;
  chatHistory: Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date, reasoning?: string, summary?: string, reasoningCollapsed?: boolean, feedback?: 'positive' | 'negative' | null, isStreaming?: boolean}>;
  setChatHistory: (history: Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date, reasoning?: string, summary?: string, reasoningCollapsed?: boolean, feedback?: 'positive' | 'negative' | null, isStreaming?: boolean}>) => void;
  subject: string;
  standard: string;
  undoStack: Array<{sectionId: string, previousContent: string}>;
}) {
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const quickSuggestions = [
    "Level down to Grade 6",
    "Add real-world example", 
    "Tighten for clarity",
    "Add visual elements",
    "Simplify vocabulary"
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = {
      id: `user-rail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user' as const,
      content: inputValue,
      timestamp: new Date()
    };

    setChatHistory([...chatHistory, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse = {
      id: `ai-rail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'ai' as const,
      content: `I'll help you ${inputValue.toLowerCase()}. Here's my suggestion for the ${activeSection || 'content'}: ${inputValue} (AI revision)`,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, aiResponse]);
    setIsProcessing(false);

    // If there's an active section, apply the edit
    if (activeSection) {
      onApplyEdit(activeSection, aiResponse.content);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 mb-3">AI Assistant</h3>
        
        {/* Context Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {subject === "math" ? "Algebra X" : subject}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            Grade 8
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            CCSSM {standard || "8.EE/8.F"}
          </span>
        </div>

        {/* Active Section Chip */}
        {activeSection && (
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full flex items-center gap-1">
              Section: {activeSection}
              <button 
                onClick={onClearSection}
                className="ml-1 text-slate-500 hover:text-slate-700"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Chat Transcript */}
      <div className="flex-1 p-4 overflow-y-auto">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">
            <p>Select "Improve with AI" on any section to start collaborating!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chatHistory.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.type === 'user' 
                    ? 'bg-slate-200 text-slate-800' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        {/* Quick Suggestions */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleQuickSuggestion(suggestion)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={activeSection ? getSectionPlaceholder(activeSection) : "Ask AI to help with lesson..."}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        {/* Undo Button */}
        {undoStack.length > 0 && (
          <div className="mt-2">
            <button
              onClick={onUndo}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              Undo last change
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------- Lesson Builder --------------------
function LessonBuilder({
  lesson,
  onClose,
  onSave,
  isPending = false,
  onConfirm,
  onNavigate,
}: {
  lesson: Lesson;
  onClose: () => void;
  onSave: (l: Lesson) => void;
  isPending?: boolean;
  onConfirm?: () => void;
  onNavigate: (view: 'dashboard' | 'students' | 'standards') => void;
}) {
  const [subject, setSubject] = useState(lesson.subject ?? "math");
  const [standard, setStandard] = useState<string>(lesson.standards?.[0] ?? "8.F.B.4");
  const [standardsMode, setStandardsMode] = useState<"auto" | "manual">(CONTEXT_DEFAULTS.standardsMode as "auto" | "manual");
  const [selectedClass] = useState<ClassRoom>(CLASS_8A); // fixed one class for now
  const [generated, setGenerated] = useState<GeneratedPayload>({
    text: null,
    slides: null,
    video: null,
    audio: null,
    quiz: null,
    mindmap: null
  });
  const [title, setTitle] = useState(lesson.title ?? "Understanding Slope in y = mx + b");
  const [activeTab, setActiveTab] = useState<ModalityKey>("text");
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    currentStep: 0,
    totalSteps: 6,
    currentModality: null
  });
  const [standardsFilter, setStandardsFilter] = useState("");
  
  // AI Chat Rail state
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date, reasoning?: string, summary?: string, reasoningCollapsed?: boolean, feedback?: 'positive' | 'negative' | null, isStreaming?: boolean}>>([]);
  const [undoStack, setUndoStack] = useState<Array<{sectionId: string, previousContent: string}>>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [introContent, setIntroContent] = useState({
    paragraph1: `Linear functions are mathematical relationships that create straight lines when graphed. The slope-intercept form, 
written as y = mx + b, is one of the most useful ways to express these relationships because it immediately shows 
us two key pieces of information: how steep the line is (slope) and where it crosses the y-axis (y-intercept).`,
    paragraph2: `This form appears everywhere in real life, from calculating costs to predicting growth patterns. Understanding 
slope-intercept form gives you a powerful tool for modeling and solving practical problems.`
  });

  // Auto-generate content on load
  useEffect(() => {
    // Always generate content on load (for lesson preview)
    if (!generated.text) {
      handleGenerate();
    }
    
    // Demo starts with clean slate - no pre-loaded chat history
  }, [chatHistory.length]);

  async function handleGenerate() {
    if (standardsMode === "manual" && !standard) return; // Gate: require standard selection in manual mode
    
    setGenerationState({
      isGenerating: true,
      currentStep: 0,
      totalSteps: 6,
      currentModality: null
    });

    const rosterNames = selectedClass.students.map((s) => s.name).join(", ");
    const stdText = standardsMode === "auto" 
      ? CONTEXT_DEFAULTS.standardsImplied.join(", ") 
      : standard;
    const subjectName = SUBJECTS.find((s) => s.id === subject)?.name ?? "Subject";
    const selectedStandard = standardsMode === "manual" 
      ? G8_MATH_STANDARDS.find(s => s.id === standard)
      : null;

    // Generate each modality with progress updates
    const modalities: ModalityKey[] = ["text", "slides", "video", "audio", "quiz", "mindmap"];
    const newGenerated: GeneratedPayload = {
      text: null,
      slides: null,
      video: null,
      audio: null,
      quiz: null,
      mindmap: null
    };

    for (let i = 0; i < modalities.length; i++) {
      const modality = modalities[i];
      
      setGenerationState(prev => ({
        ...prev,
        currentStep: i + 1,
        currentModality: modality
      }));

      // Simulate generation delay
      await new Promise(r => setTimeout(r, 600));

      const baseContent = {
        text: `# Immersive Text Lesson: ${selectedStandard?.label || stdText}

**Subject:** ${subjectName}
**Standard:** ${stdText} — ${selectedStandard?.label || 'Standard description'}
**Audience:** ${selectedClass.name} (${selectedClass.students.length} students)
**Reading Level:** Grade 8 (default)

## Learning Objectives
Students will be able to understand and apply concepts related to ${selectedStandard?.label?.toLowerCase() || 'the selected standard'}.

## Lesson Structure
1. **Hook & Introduction** (5 min)
   - Real-world connection
   - Prior knowledge activation

2. **Concept Development** (15 min)
   - Step-by-step explanation
   - Worked examples
   - Visual representations

3. **Guided Practice** (8 min)
   - Interactive exercises
   - Peer collaboration

4. **Independent Work** (2 min)
   - Quick assessment
   - Exit ticket

## Differentiation Notes
- Vocabulary supports included
- Multiple representations provided
- Scaffolded examples for various levels`,

        slides: `# Slide Deck: ${selectedStandard?.label || stdText}

**Standard:** ${stdText} — ${selectedStandard?.label || 'Standard description'}

## Slide Outline (12-15 slides)

1. **Title Slide**
   - Lesson title
   - Learning objective

2. **Hook Slide**
   - Engaging question or scenario
   - Connection to student interests

3. **Vocabulary Slides (2-3)**
   - Key terms with visuals
   - Student-friendly definitions

4. **Concept Introduction (3-4 slides)**
   - Main idea breakdown
   - Step-by-step process

5. **Worked Examples (3-4 slides)**
   - Detailed solutions
   - Think-aloud process

6. **Practice Slides (2-3)**
   - Guided practice problems
   - Interactive elements

7. **Wrap-up Slide**
   - Key takeaways
   - Next steps

## Narration Script
Each slide includes teacher talking points and suggested timing for optimal pacing.`,

        video: `# Video Lesson Storyboard: ${selectedStandard?.label || stdText}

**Standard:** ${stdText} — ${selectedStandard?.label || 'Standard description'}
**Duration:** 5-7 minutes
**Format:** Animated explainer with voiceover

## Scene Breakdown

**Scene 1: Hook (0:00-0:30)**
- Visual: Real-world scenario
- Narration: "Have you ever wondered..."
- Graphics: Engaging animation

**Scene 2: Problem Setup (0:30-1:30)**
- Visual: Clear problem presentation
- Narration: Concept introduction
- Graphics: Step-by-step visuals

**Scene 3: Solution Process (1:30-4:00)**
- Visual: Detailed walkthrough
- Narration: Explanatory dialogue
- Graphics: Dynamic illustrations

**Scene 4: Practice Example (4:00-5:30)**
- Visual: Guided practice
- Narration: Coaching language
- Graphics: Interactive elements

**Scene 5: Wrap-up (5:30-7:00)**
- Visual: Summary graphics
- Narration: Key takeaways
- Graphics: Transition to next lesson

## Production Notes
- Use Grade 8 appropriate language
- Include visual cues for key concepts
- Maintain engagement through variety`,

        audio: `# Audio Lesson Script: ${selectedStandard?.label || stdText}

**Standard:** ${stdText} — ${selectedStandard?.label || 'Standard description'}
**Format:** Teacher-Student Dialogue
**Duration:** 8-10 minutes

## Dialogue Script

**TEACHER:** Good morning! Today we're exploring ${selectedStandard?.label?.toLowerCase() || 'an important mathematical concept'}. Can anyone tell me what they already know about this topic?

**STUDENT A:** I think it has something to do with...

**TEACHER:** Great starting point! Let's build on that idea. [Concept introduction]

**STUDENT B:** But what if we encounter this situation...?

**TEACHER:** Excellent question! That's exactly the kind of thinking we need. [Address misconception]

## Key Sections
1. **Opening Dialogue** - Activate prior knowledge
2. **Concept Exploration** - Interactive discussion
3. **Problem Solving** - Collaborative thinking
4. **Misconception Address** - Common errors
5. **Synthesis** - Student summary

## Teaching Notes
- Pause for student responses
- Use encouraging language
- Address common misconceptions
- Include think-time prompts`,

        quiz: `# Assessment Quiz: ${selectedStandard?.label || stdText}

**Standard:** ${stdText} — ${selectedStandard?.label || 'Standard description'}
**Format:** 10-question assessment with multiple choice and short answer
**Duration:** 15-20 minutes
**Grade Level:** 8

## Question Types & Distribution

### Multiple Choice (6 questions)
- **Basic Comprehension (2 questions)**: Direct application of concepts
- **Problem Solving (3 questions)**: Multi-step problems  
- **Analysis (1 question)**: Interpret graphs/data

### Short Answer (3 questions)
- **Show Your Work (2 questions)**: Step-by-step solutions required
- **Explain Your Thinking (1 question)**: Justify reasoning

### Open Response (1 question)
- **Real-World Application**: Connect concept to everyday scenario

## Sample Questions

**Question 1 (Multiple Choice)**
What is the slope of the line passing through points (2, 5) and (4, 11)?
A) 2     B) 3     C) 6     D) 8

**Question 2 (Short Answer)**
Graph the equation y = 2x + 3. Show all steps and label key features.

**Question 3 (Open Response)**
A skateboard ramp has a slope of 0.25. If the ramp rises 2 feet, how far does it extend horizontally? Explain how this relates to slope-intercept form.

## Answer Key & Rubric
- Multiple Choice: 1 point each (6 points total)
- Short Answer: 2 points each (6 points total)  
- Open Response: 3 points (with partial credit rubric)
- **Total: 15 points**

## Differentiation Notes
- Provide graph paper for visual learners
- Allow calculator use for computation-heavy problems
- Extended time available for students with accommodations
- Alternative format available for students with reading difficulties`,

        mindmap: `# Mind Map: ${selectedStandard?.label || stdText}

**Standard:** ${stdText} — ${selectedStandard?.label || 'Standard description'}

## Central Concept
${selectedStandard?.label || 'Core Mathematical Concept'}

## Main Branches

### 1. Key Vocabulary
- Definition nodes
- Visual representations
- Example connections

### 2. Core Processes
- Step-by-step procedures
- Decision points
- Common pathways

### 3. Real-World Applications
- Career connections
- Daily life examples
- Cross-curricular links

### 4. Common Mistakes
- Error patterns
- Misconception nodes
- Correction strategies

### 5. Extension Ideas
- Advanced concepts
- Related standards
- Next learning steps

## Interactive Elements
- Clickable definitions
- Expandable examples
- Color-coded categories
- Progress tracking

## Visual Design Notes
- Use Grade 8 appropriate colors
- Include mathematical symbols
- Maintain clear hierarchy
- Support multiple learning styles`
      };

      newGenerated[modality] = baseContent[modality];
      setGenerated({...newGenerated});
    }

    // Add personalization note to text content
    if (newGenerated.text) {
      newGenerated.text += `\n\n## Personalization Plan
- **Reading Level:** Grade 8 (default setting)
- **Class Profile:** ${selectedClass.name} — ${selectedClass.students.length} students
- **Student Roster:** ${rosterNames}
- **Adaptations:** Content automatically adjusted for grade-level appropriateness`;
    }

    setGenerated(newGenerated);
    setGenerationState({
      isGenerating: false,
      currentStep: 5,
      totalSteps: 5,
      currentModality: null
    });
  }

  function handleSave() {
    onSave({
      ...lesson,
      title,
      subject,
      standards: standard ? [standard] : [],
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    onClose();
  }

  async function handleRegenerateModality(modality: ModalityKey, tweak?: string) {
    if (!standard) return;
    
    const selectedStandard = G8_MATH_STANDARDS.find(s => s.id === standard);
    const baseContent = `Regenerated ${MODALITIES.find(m => m.key === modality)?.name}: ${selectedStandard?.label || standard}`;
    
    // Simulate regeneration
    await new Promise(r => setTimeout(r, 1000));
    
    setGenerated(prev => ({
      ...prev,
      [modality]: baseContent + (tweak ? `\n\nTweak applied: ${tweak}` : '')
    }));
  }

  // AI Chat Rail handlers
  function handleEditWithAI(sectionId: string, sectionTitle: string) {
    // Toggle section selection - if same section is clicked again, deselect it
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionId);
    }
    // Just set the section as context for targeting, don't add chat message
  }

  async function handleApplyEdit(sectionId: string, newContent: string) {
    // Store current content for undo
    const currentContent = getSectionContent(sectionId);
    setUndoStack(prev => [...prev, { sectionId, previousContent: currentContent }]);
    
    // Apply the edit (simulate)
    const aiRevision = newContent + " (AI revision)";
    
    // Add AI response to chat with reasoning and summary
    const reasoningContent = `Understanding the improvement: I've analyzed the "${sectionId}" section and identified areas for enhancement based on Grade 8 readability standards.

Processing with Classroom Co-Pilot: I've applied pedagogical best practices, adjusted vocabulary complexity, and improved sentence structure to better align with Grade 8 comprehension levels.`;

    const summaryContent = `I've improved the "${sectionId}" section for better Grade 8 readability. The content has been refined to match appropriate reading levels while maintaining educational effectiveness.

The changes are now live in your lesson. You can continue refining other sections or ask for additional improvements.`;

    setChatHistory(prev => [...prev, {
      id: `apply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'ai',
      content: summaryContent,
      reasoning: reasoningContent,
      summary: summaryContent,
      reasoningCollapsed: true,
      feedback: null,
      timestamp: new Date()
    }]);
    
    // Show toast notification
    setToast({message: "Edit applied! Undo available.", type: 'success'});
    setTimeout(() => setToast(null), 3000);
  }

  function handleUndo() {
    const lastEdit = undoStack[undoStack.length - 1];
    if (lastEdit) {
      // Restore previous content (simulate)
      console.log(`Undoing edit to ${lastEdit.sectionId}`);
      setUndoStack(prev => prev.slice(0, -1));
      setToast({message: `Undid changes to ${lastEdit.sectionId}`, type: 'info'});
      setTimeout(() => setToast(null), 3000);
    }
  }

  function getSectionContent(sectionId: string): string {
    // This would get the actual section content in a real implementation
    return "Current section content...";
  }

  const STD_OPTIONS = subject === "math" ? G8_MATH_STANDARDS : [];
  const filteredStandards = STD_OPTIONS.filter(std => 
    std.id.toLowerCase().includes(standardsFilter.toLowerCase()) ||
    std.label.toLowerCase().includes(standardsFilter.toLowerCase())
  );
  
  const selectedStandardObj = STD_OPTIONS.find(s => s.id === standard);
  const canGenerate = standardsMode === "auto" || !!standard;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 text-foreground flex">
        <LeftSidebar currentView="builder" onNavigate={(view) => {
          if (view === 'dashboard') {
            onClose();
          } else {
            onNavigate(view);
          }
        }} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Breadcrumb */}
          <div className="px-6 pt-4">
            <Breadcrumb items={[
              { label: "Home", onClick: () => onClose() },
              { label: "Lesson Builder" }
            ]} />
          </div>
          
          {/* Content Area */}
          <div className="flex-1 px-6 py-6 pr-[520px]">
          {/* Tabbed Interface */}
          <div className="mb-8">
          {/* Tab Navigation - Static and Left Aligned */}
          <div className="mb-6">
            <nav className="flex gap-1">
              {MODALITIES.map((modality) => {
                const isActive = activeTab === modality.key;
                
                // Choose icons for each modality
                const getIcon = (key: string) => {
                  switch (key) {
                    case 'text':
                      return DocumentTextIcon;
                    case 'slides':
                      return PresentationChartBarIcon;
                    case 'video':
                      return VideoCameraIcon;
                    case 'audio':
                      return SpeakerWaveIcon;
                    default:
                      return DocumentTextIcon;
                  }
                };
                
                const IconComponent = getIcon(modality.key);
                
                return (
                  <button
                    key={modality.key}
                    onClick={() => setActiveTab(modality.key)}
                    className={`flex flex-col items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-200 text-slate-800'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="text-sm font-medium">{modality.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            <TabContent
              modality={activeTab}
              title={MODALITIES.find(m => m.key === activeTab)?.name || ""}
              content={generated[activeTab]}
              loading={generationState.isGenerating && generationState.currentModality === activeTab}
              standard={selectedStandardObj?.id}
              onRegenerate={handleRegenerateModality}
              onEditWithAI={handleEditWithAI}
              activeSection={activeSection}
              introContent={introContent}
            />
            </div>
          </div>
          </div>
        </div>
        
        {/* Unified AI Assistant - Fixed Right Panel */}
        <div className="fixed top-0 right-0 h-screen w-[500px] z-40">
        <UnifiedPromptComponent
          mode="refinement"
          initialPrompt={lesson.prompt || ''}
          initialContext={{
            selectedStudents: lesson.selectedStudents || 'all',
            specificStudents: lesson.specificStudents || [],
            uploadedFile: lesson.uploadedFile || null,
            selectedStandard: lesson.standards?.[0] || 'all'
          }}
          chatHistory={chatHistory}
          activeSection={activeSection}
          onClearSection={() => setActiveSection(null)}
          onUndo={handleUndo}
          undoStack={undoStack}
          onUpdateMessage={(messageId, updates) => {
            setChatHistory(prev => prev.map(msg => 
              msg.id === messageId ? { ...msg, ...updates } : msg
            ));
          }}
          onSendMessage={async (message) => {
            const userMessage = {
              id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'user' as const,
              content: message,
              timestamp: new Date()
            };

            setChatHistory(prev => [...prev, userMessage]);

            // Create AI response placeholder for streaming
            const aiResponseId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const aiResponse = {
              id: aiResponseId,
              type: 'ai' as const,
              content: '',
              reasoning: '',
              summary: '',
              reasoningCollapsed: false, // Start expanded for streaming
              feedback: null,
              timestamp: new Date(),
              isStreaming: true
            };

            setChatHistory(prev => [...prev, aiResponse]);

            // Stream reasoning content
            const reasoningSections = [
              `Understanding your request: I'm analyzing your request to "${message.toLowerCase()}" for the ${activeSection || 'lesson content'}.`,
              `Processing with Classroom Co-Pilot: I've reviewed the current ${activeSection || 'content'}, applied pedagogical best practices, and developed strategies to make it more engaging and relatable to Grade 8 students through real-world connections and interactive language.`
            ];

            let fullReasoningText = '';
            
            // Delay before starting
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Stream reasoning sections
            for (let sectionIndex = 0; sectionIndex < reasoningSections.length; sectionIndex++) {
              const section = reasoningSections[sectionIndex];
              
              for (let i = 0; i <= section.length; i++) {
                const currentText = fullReasoningText + section.substring(0, i);
                
                setChatHistory(prev => prev.map(msg => 
                  msg.id === aiResponseId 
                    ? { ...msg, reasoning: currentText }
                    : msg
                ));
                
                await new Promise(resolve => setTimeout(resolve, 15));
              }
              
              fullReasoningText += section;
              if (sectionIndex < reasoningSections.length - 1) {
                fullReasoningText += '\n\n';
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }

            // Mark reasoning as complete and collapse it
            await new Promise(resolve => setTimeout(resolve, 800));
            setChatHistory(prev => prev.map(msg => 
              msg.id === aiResponseId 
                ? { ...msg, reasoningCollapsed: true }
                : msg
            ));

            // If this is about making intro more engaging, update the content
            if (activeSection === 'introduction' && message.toLowerCase().includes('engaging')) {
              // Update introduction content in real-time
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Update the actual introduction content
              setIntroContent({
                paragraph1: `Have you ever wondered how Uber calculates your ride cost? It starts with a base fee, then adds more money for each mile you travel. 
That's actually a perfect example of something called slope-intercept form: y = mx + b. This mathematical relationship appears 
everywhere in your daily life – from ride-sharing apps to phone plans to streaming subscriptions.`,
                paragraph2: `The slope-intercept form gives us a powerful way to understand and predict costs, growth, and changes in the world around us. 
When you see y = mx + b, you're looking at a formula that immediately tells you two crucial things: how fast something changes 
(the slope 'm') and where it starts (the y-intercept 'b'). By the end of this lesson, you'll be able to spot these patterns 
everywhere and use them to solve real problems that matter to you.`
              });
            }

            // Start streaming summary
            await new Promise(resolve => setTimeout(resolve, 600));
            
            let summaryContent = '';
            if (activeSection === 'introduction' && message.toLowerCase().includes('engaging')) {
              summaryContent = `Perfect! I've transformed the introduction to grab students' attention right from the start. Instead of jumping straight into mathematical definitions, it now opens with something they know well - figuring out how much an Uber ride costs.

Here's what changed: I replaced the abstract explanation with a relatable scenario that connects to their daily experiences. The new version shows them that they're already using slope-intercept thinking when they see ride-sharing prices, phone bills, or streaming costs. 

The language is much more conversational now - talking directly to students with "you" and "your" instead of distant academic language. Most importantly, it gives them a reason to care by showing how this math actually helps them understand the world around them.

The updated introduction is now live in your lesson and should feel much more accessible to your Grade 8 students.`;
            } else {
              summaryContent = `I've processed your request to ${message.toLowerCase()}. ${activeSection ? `The "${activeSection}" section has been analyzed and I'm ready to provide specific improvements.` : 'I\'ve reviewed the lesson content and prepared targeted suggestions.'} 

Ready to implement? Select "✨ Improve with AI" on the relevant section to apply changes, or ask me for more specific guidance.`;
            }

            // Stream summary character by character
            for (let i = 0; i <= summaryContent.length; i++) {
              const currentSummary = summaryContent.substring(0, i);
              
              setChatHistory(prev => prev.map(msg => 
                msg.id === aiResponseId 
                  ? { ...msg, content: currentSummary, summary: currentSummary }
                  : msg
              ));
              
              await new Promise(resolve => setTimeout(resolve, 12));
            }

            // Mark streaming as complete
            setChatHistory(prev => prev.map(msg => 
              msg.id === aiResponseId 
                ? { ...msg, isStreaming: false }
                : msg
            ));
          }}
        />
        </div>
        
        {/* Toast Notification */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    </TooltipProvider>
  );
}

// -------------------- Students Page --------------------
function StudentsPage() {
  const students = CLASS_8A.students;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 pb-6">
      <div className="mb-12">
        <div className="text-left mb-8">
          <h1 className="text-4xl font-bold mb-4 text-slate-800">Students</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student.id} className="cursor-pointer overflow-hidden border-2 border-slate-300 !bg-slate-50 shadow-none rounded-2xl">
              <div className="p-6 pb-4 bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {student.avatar ? (
                      <img 
                        src={student.avatar} 
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <span className="text-slate-600 font-semibold text-sm">
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-800">{student.name}</div>
                    <div className="text-sm text-slate-500">Band {student.masteryBand} of 4</div>
                  </div>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------- Standards Page --------------------
function StandardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<any>(null);

  // Complete standards data with full official descriptions
  const COMPLETE_STANDARDS = G8_MATH_STANDARDS.map(std => ({
    ...std,
    domain: std.id.includes('EE') ? 'Expressions & Equations' : 
            std.id.includes('F') ? 'Functions' : 
            std.id.includes('G') ? 'Geometry' : 'Statistics & Probability',
    cluster: std.id === "8.EE.A.1" ? "Work with radicals and integer exponents" :
             std.id.includes("8.EE.B") ? "Understand the connections between proportional relationships, lines, and linear equations" :
             std.id.includes("8.F.A") ? "Define, evaluate, and compare functions" :
             std.id.includes("8.F.B") ? "Use functions to model relationships between quantities" :
             "Mathematical standard cluster",
    grade: "8",
    fullDescription: std.id === "8.EE.A.1" ? 
      "Know and apply the properties of integer exponents to generate equivalent numerical expressions. For example, 3² × 3⁻⁵ = 3⁻³ = 1/3³ = 1/27." :
      std.id === "8.EE.B.5" ? 
      "Graph proportional relationships, interpreting the unit rate as the slope of the graph. Compare two different proportional relationships represented in different ways. For example, compare a distance-time graph to a distance-time equation to determine which of two moving objects has greater speed." :
      std.id === "8.EE.B.6" ? 
      "Use similar triangles to explain why the slope m is the same between any two distinct points on a non-vertical line in the coordinate plane; derive the equation y = mx for a line through the origin and the equation y = mx + b for a line intercepting the vertical axis at b." :
      std.id === "8.F.A.1" ? 
      "Understand that a function is a rule that assigns to each input exactly one output. The graph of a function is the set of ordered pairs consisting of an input and the corresponding output." :
      std.id === "8.F.B.4" ? 
      "Construct a function to model a linear relationship between two quantities. Determine the rate of change and initial value of the function from a description of a relationship or from two (x, y) values, including reading these from a table or from a graph. Interpret the rate of change and initial value of a linear function in terms of the situation it models, and in terms of its graph or a table of values." :
      std.label,
    mathematicalPractices: [
      "MP1: Make sense of problems and persevere in solving them",
      "MP2: Reason abstractly and quantitatively", 
      "MP3: Construct viable arguments and critique the reasoning of others",
      "MP4: Model with mathematics",
      "MP5: Use appropriate tools strategically",
      "MP6: Attend to precision",
      "MP7: Look for and make use of structure",
      "MP8: Look for and express regularity in repeated reasoning"
    ].slice(0, Math.floor(Math.random() * 3) + 2), // Random subset for demo
    connections: std.id === "8.EE.B.6" ? ["7.RP.A.2", "8.EE.B.5", "8.F.B.4"] : 
                 std.id === "8.F.B.4" ? ["8.EE.B.5", "8.EE.B.6"] : 
                 std.id === "8.EE.B.5" ? ["7.RP.A.2", "8.EE.B.6"] : [],
    examples: std.id === "8.EE.B.6" ? [
      "Use similar triangles to show that the slope between any two points on a line is constant",
      "Derive y = mx + b from geometric principles",
      "Explain why all linear functions have constant rate of change"
    ] : std.id === "8.F.B.4" ? [
      "Model the cost of a cell phone plan: C = 30 + 0.05m where m is minutes",
      "Determine rate of change from a table of values",
      "Interpret y-intercept in context of real-world situations"
    ] : [],
    assessmentBoundary: std.id === "8.F.A.1" ? 
      "Functions are limited to linear functions. Students are not expected to use function notation." :
      std.id === "8.EE.A.1" ? 
      "Integer exponents with numerical bases only." : null
  }));

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate search processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const query = searchQuery.toLowerCase();
    const results = COMPLETE_STANDARDS.filter(std => 
      std.id.toLowerCase().includes(query) ||
      std.label.toLowerCase().includes(query) ||
      std.fullDescription.toLowerCase().includes(query) ||
      std.cluster.toLowerCase().includes(query) ||
      std.domain.toLowerCase().includes(query) ||
      std.examples.some(example => example.toLowerCase().includes(query)) ||
      std.connections.some(conn => conn.toLowerCase().includes(query))
    );
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleStandardSelect = (standard: any) => {
    setSelectedStandard(standard);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 pb-6">
      <div className="mb-12">
        <div className="text-left mb-8">
          <h1 className="text-4xl font-bold mb-4 text-slate-800">Standards</h1>
        </div>

        {/* Standards Search */}
        <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🔍 Search Standards</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Search by standard ID, description, or concept. Examples: "slope", "8.F.B.4", "linear relationships", "exponents"
          </p>
          
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search standards... (e.g., 'slope', '8.F.B.4', 'linear relationships')"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Search Results ({searchResults.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map(standard => (
                  <button
                    key={standard.id}
                    onClick={() => handleStandardSelect(standard)}
                    className="text-left p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    <div className="font-medium text-blue-600">{standard.id}</div>
                    <div className="text-sm text-neutral-900 mt-1">{standard.label}</div>
                    <div className="text-xs text-neutral-500 mt-2">{standard.domain}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Standards Browser */}
          <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold">Browse by Domain</h2>
            </div>
            
            <div className="p-6">
              {/* Group standards by domain */}
              {['Expressions & Equations', 'Functions', 'Geometry', 'Statistics & Probability'].map(domain => {
                const domainStandards = COMPLETE_STANDARDS.filter(std => std.domain === domain);
                if (domainStandards.length === 0) return null;
                
                return (
                  <div key={domain} className="mb-6">
                    <h3 className="font-semibold text-neutral-900 mb-3">{domain}</h3>
                    <div className="space-y-2">
                      {domainStandards.map(standard => (
                        <button
                          key={standard.id}
                          onClick={() => handleStandardSelect(standard)}
                          className={`w-full text-left p-3 rounded-lg border transition ${
                            selectedStandard?.id === standard.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-sm">{standard.id}</div>
                              <div className="text-sm text-neutral-600 mt-1">{standard.label}</div>
                            </div>
                            <div className="text-xs text-neutral-400">Grade {standard.grade}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standard Details Panel */}
          <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold">Standard Details</h2>
            </div>
            
            <div className="p-6">
              {!selectedStandard && (
                <div className="text-center py-12">
                  <div className="mb-4 opacity-30"><DocumentTextIcon className="h-16 w-16 mx-auto" /></div>
                  <h3 className="font-medium text-neutral-900 mb-2">Select a standard</h3>
                  <p className="text-neutral-600">Choose any standard to view complete details and official description</p>
                </div>
              )}

              {selectedStandard && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="border-b border-neutral-100 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-blue-600">{selectedStandard.id}</h3>
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Grade {selectedStandard.grade} • {selectedStandard.domain}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">{selectedStandard.label}</h4>
                    <p className="text-sm text-neutral-600 italic">Cluster: {selectedStandard.cluster}</p>
                  </div>

                  {/* Full Description */}
                  <div>
                    <h5 className="font-semibold text-neutral-900 mb-3">📖 Standard Description</h5>
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <p className="text-sm text-neutral-800 leading-relaxed">{selectedStandard.fullDescription}</p>
                    </div>
                  </div>

                  {/* Mathematical Practices */}
                  <div>
                    <h5 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2"><UserGroupIcon className="h-4 w-4" />Mathematical Practices</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedStandard.mathematicalPractices.map((practice: string, idx: number) => (
                        <div key={idx} className="text-xs p-2 bg-green-50 rounded border border-green-200 text-green-800">
                          {practice}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Examples */}
                  {selectedStandard.examples.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2"><LightBulbIcon className="h-4 w-4" />Examples</h5>
                      <div className="space-y-2">
                        {selectedStandard.examples.map((example: string, idx: number) => (
                          <div key={idx} className="text-sm p-3 bg-blue-50 rounded border border-blue-200 text-blue-800">
                            • {example}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connections */}
                  {selectedStandard.connections.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-neutral-900 mb-3">🔗 Connected Standards</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedStandard.connections.map((conn: string) => (
                          <button
                            key={conn}
                            onClick={() => {
                              const connectedStd = COMPLETE_STANDARDS.find(s => s.id === conn);
                              if (connectedStd) handleStandardSelect(connectedStd);
                            }}
                            className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                          >
                            {conn}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assessment Boundary */}
                  {selectedStandard.assessmentBoundary && (
                    <div>
                      <h5 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2"><ClipboardDocumentListIcon className="h-4 w-4" />Assessment Boundary</h5>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-800">{selectedStandard.assessmentBoundary}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-neutral-100">
                    <div className="flex flex-wrap gap-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />Copy standard text
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />View related lessons
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <PresentationChartBarIcon className="h-4 w-4 mr-2" />Assessment resources
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Teacher Resources */}
        <div className="mt-8 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Teacher Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-left">
              <div className="font-medium mb-1 flex items-center gap-2"><PresentationChartBarIcon className="h-4 w-4" />Standards Alignment Report</div>
              <div className="text-sm text-neutral-600">See how your lessons align to each standard</div>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-left">
              <div className="font-medium mb-1">📈 Scope & Sequence</div>
              <div className="text-sm text-neutral-600">View recommended pacing and progression</div>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-left">
              <div className="font-medium mb-1 flex items-center gap-2"><DocumentTextIcon className="h-4 w-4" />Standard Progressions</div>
              <div className="text-sm text-neutral-600">See how standards build across grades</div>
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <h3 className="font-semibold mb-3">Common Searches</h3>
            <div className="flex flex-wrap gap-2">
              {['slope', 'linear functions', 'proportional relationships', 'exponents', 'similar triangles'].map(term => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch();
                  }}
                  className="text-xs px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- Standard Tooltip Component --------------------
function StandardTooltip({ standardId, children }: { 
  standardId: string; 
  children: React.ReactNode; 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const standard = G8_MATH_STANDARDS.find(s => s.id === standardId);
  
  if (!standard) return <>{children}</>;

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setIsVisible(true);
  };

  const description = standard.id === "8.EE.A.1" ? 
    "Know and apply the properties of integer exponents to generate equivalent numerical expressions." :
    standard.id === "8.EE.B.5" ? 
    "Graph proportional relationships, interpreting the unit rate as the slope of the graph. Compare two different proportional relationships represented in different ways." :
    standard.id === "8.EE.B.6" ? 
    "Use similar triangles to explain why the slope m is the same between any two distinct points on a non-vertical line in the coordinate plane; derive the equation y = mx for a line through the origin and the equation y = mx + b for a line intercepting the vertical axis at b." :
    standard.id === "8.F.A.1" ? 
    "Understand that a function is a rule that assigns to each input exactly one output. The graph of a function is the set of ordered pairs consisting of an input and the corresponding output." :
    standard.id === "8.F.B.4" ? 
    "Construct a function to model a linear relationship between two quantities. Determine the rate of change and initial value of the function from a description of a relationship or from two (x, y) values." :
    standard.label;

  return (
    <>
      <span
        className="relative inline-block cursor-help border-b border-dotted border-blue-500 text-blue-600 hover:text-blue-800 transition-colors"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>

      {isVisible && (
        <div
          className="fixed z-50 w-80 p-4 bg-slate-100 rounded-xl border border-slate-200 shadow-xl"
          style={{
            left: position.x - 160, // Center the tooltip
            top: position.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-blue-600">{standard.id}</h4>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">Grade 8</span>
            </div>
            
            <div>
              <h5 className="font-medium text-sm text-neutral-900 mb-1">{standard.label}</h5>
              <p className="text-xs text-neutral-600 leading-relaxed">{description}</p>
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <div className="flex gap-3 text-xs">
                <button 
                  onClick={() => {
                    // This would navigate to standards page with this standard selected
                    console.log(`Navigate to standard ${standardId}`);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />View details
                </button>
                <button 
                  onClick={() => {
                    // This would show related lessons
                    console.log(`Show lessons for ${standardId}`);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />Related lessons
                </button>
              </div>
            </div>
          </div>
          
          {/* Tooltip arrow */}
          <div 
            className="absolute top-full left-1/2 transform -translate-x-1/2"
            style={{ 
              width: 0, 
              height: 0, 
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white'
            }}
          />
    </div>
      )}
    </>
  );
}

// -------------------- Lesson Module Component --------------------
function LessonModule({ title, children, className = "" }: { 
  title: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-6 mb-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

// -------------------- Standards Control --------------------
function StandardsControl({
  mode, setMode, standard, setStandard,
}: { 
  mode: "auto" | "manual"; 
  setMode: (m: "auto" | "manual") => void; 
  standard: string; 
  setStandard: (s: string) => void;
}) {
  const [standardsFilter, setStandardsFilter] = useState("");
  const STD_OPTIONS = G8_MATH_STANDARDS.filter(std =>
    std.id.toLowerCase().includes(standardsFilter.toLowerCase()) ||
    std.label.toLowerCase().includes(standardsFilter.toLowerCase())
  );

  return (
    <Field label="Standards (auto)">
      {mode === "auto" ? (
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {CONTEXT_DEFAULTS.standardsImplied.map(code => (
              <span key={code} className="text-xs px-2 py-1 rounded-full bg-neutral-100">{code}</span>
            ))}
          </div>
          <button onClick={() => setMode("manual")} className="text-xs text-neutral-600 underline">Change</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="space-y-2">
              <input
                type="text"
                className="w-full rounded-xl border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Type to search standards..."
                value={standardsFilter}
                onChange={(e) => setStandardsFilter(e.target.value)}
              />
              {standardsFilter && (
                <div className="max-h-48 overflow-y-auto border rounded-xl bg-white">
                  {STD_OPTIONS.slice(0, 8).map((std) => (
                    <button
                      key={std.id}
                      onClick={() => {
                        setStandard(std.id);
                        setStandardsFilter("");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="text-sm font-medium">{std.id}</div>
                      <div className="text-xs text-neutral-600">{std.label}</div>
                    </button>
                  ))}
                </div>
              )}
              {standard && (
                <div className="p-2 bg-neutral-50 rounded-lg text-xs">
                  <span className="font-medium">{standard}</span> — {G8_MATH_STANDARDS.find(s => s.id === standard)?.label}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setMode("auto")} className="text-xs text-neutral-600 underline">Use auto</button>
        </div>
      )}
    </Field>
  );
}

// -------------------- Small UI Primitives --------------------
function Field({ 
  label, 
  description, 
  children 
}: { 
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-sm mb-1">{label}</div>
      {description && (
        <div className="text-xs text-neutral-500 mb-2">{description}</div>
      )}
      {children}
    </label>
  );
}

function ImmersiveTextContent({ onEditWithAI, activeSection, introContent }: { 
  onEditWithAI?: (sectionId: string, sectionTitle: string) => void;
  activeSection?: string | null;
  introContent?: {paragraph1: string, paragraph2: string};
}) {
  return (
    <div className="h-full p-8">
      <div className="space-y-8">
        
        {/* Document Header */}
        <div className="border-b border-slate-300 pb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Understanding Slope-Intercept Form</h1>
          <p className="text-slate-600">Linear Functions in Algebra</p>
          <div className="text-sm text-slate-500 mt-2">
            Generated for Grade 8 Mathematics • Band 3 Students
          </div>
        </div>

        {/* Introduction */}
        <section className={`space-y-4 relative group border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
          activeSection === 'introduction' 
            ? 'border-green-400 bg-green-50/50' 
            : 'border-slate-300 hover:border-blue-300'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-800">Introduction</h2>
            <div className="flex items-start gap-2">
              {onEditWithAI && (
                <button
                  onClick={() => onEditWithAI('introduction', 'Introduction')}
                  className={`transition-all duration-200 px-3 py-1.5 text-xs rounded-md font-medium flex-shrink-0 flex items-center gap-1 ${
                    activeSection === 'introduction'
                      ? 'bg-green-200 text-green-800 border border-green-300'
                      : 'opacity-60 group-hover:opacity-100 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 hover:border-blue-300'
                  }`}
                >
                  {activeSection === 'introduction' ? 'Targeted' : 'Refine with AI'}
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {introContent?.paragraph1 || `Linear functions are mathematical relationships that create straight lines when graphed. The slope-intercept form, 
            written as y = mx + b, is one of the most useful ways to express these relationships because it immediately shows 
            us two key pieces of information: how steep the line is (slope) and where it crosses the y-axis (y-intercept).`}
          </p>
          <p className="text-slate-600 leading-relaxed">
            {introContent?.paragraph2 || `This form appears everywhere in real life, from calculating costs to predicting growth patterns. Understanding 
            slope-intercept form gives you a powerful tool for modeling and solving practical problems.`}
          </p>
        </section>

        {/* AI Generated Graph */}
        <section className={`space-y-4 relative group border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
          activeSection === 'visual-representation' 
            ? 'border-green-400 bg-green-50/50' 
            : 'border-slate-300 hover:border-blue-300'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-800">Visual Representation</h2>
            <div className="flex items-start gap-2">
              {onEditWithAI && (
                <button
                  onClick={() => onEditWithAI('visual-representation', 'Visual Representation')}
                  className={`transition-all duration-200 px-3 py-1.5 text-xs rounded-md font-medium flex-shrink-0 flex items-center gap-1 ${
                    activeSection === 'visual-representation'
                      ? 'bg-green-200 text-green-800 border border-green-300'
                      : 'opacity-60 group-hover:opacity-100 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 hover:border-blue-300'
                  }`}
                >
                  {activeSection === 'visual-representation' ? 'Targeted' : 'Refine with AI'}
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-8 text-center">
            <div className="bg-white rounded-xl p-6 mb-4">
              <svg className="w-full h-64 mx-auto" viewBox="0 0 400 300">
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="400" height="300" fill="url(#grid)" />
                
                {/* Axes */}
                <line x1="50" y1="250" x2="350" y2="250" stroke="#475569" strokeWidth="2"/>
                <line x1="50" y1="50" x2="50" y2="250" stroke="#475569" strokeWidth="2"/>
                
                {/* Line y = 2x + 1 */}
                <line x1="50" y1="230" x2="300" y2="80" stroke="#0f172a" strokeWidth="3"/>
                
                {/* Points */}
                <circle cx="50" cy="230" r="4" fill="#dc2626"/>
                <circle cx="150" cy="130" r="4" fill="#dc2626"/>
                
                {/* Labels */}
                <text x="55" y="235" fontSize="12" fill="#475569">y-intercept (0,1)</text>
                <text x="155" y="125" fontSize="12" fill="#475569">slope = 2</text>
                <text x="200" y="280" fontSize="14" fill="#0f172a" fontWeight="bold">y = 2x + 1</text>
              </svg>
            </div>
            <p className="text-sm text-slate-600">AI-generated coordinate plane showing y = 2x + 1</p>
          </div>
        </section>

        {/* Formula Breakdown */}
        <section className={`space-y-4 relative group border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
          activeSection === 'formula-components' 
            ? 'border-green-400 bg-green-50/50' 
            : 'border-slate-300 hover:border-blue-300'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-800">Formula Components</h2>
            <div className="flex items-start gap-2">
              {onEditWithAI && (
                <button
                  onClick={() => onEditWithAI('formula-components', 'Formula Components')}
                  className={`transition-all duration-200 px-3 py-1.5 text-xs rounded-md font-medium flex-shrink-0 flex items-center gap-1 ${
                    activeSection === 'formula-components'
                      ? 'bg-green-200 text-green-800 border border-green-300'
                      : 'opacity-60 group-hover:opacity-100 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 hover:border-blue-300'
                  }`}
                >
                  {activeSection === 'formula-components' ? 'Targeted' : 'Refine with AI'}
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-6">
            <div className="text-center mb-6">
              <span className="font-mono text-3xl text-slate-800">y = mx + b</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Variables</h4>
                <ul className="space-y-1 text-slate-600">
                  <li><span className="font-mono font-bold">x</span> = input value (independent variable)</li>
                  <li><span className="font-mono font-bold">y</span> = output value (dependent variable)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Constants</h4>
                <ul className="space-y-1 text-slate-600">
                  <li><span className="font-mono font-bold">m</span> = slope (rate of change)</li>
                  <li><span className="font-mono font-bold">b</span> = y-intercept (starting value)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Real-World Application */}
        <section className={`space-y-4 relative group border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
          activeSection === 'real-world-application' 
            ? 'border-green-400 bg-green-50/50' 
            : 'border-slate-300 hover:border-blue-300'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-800">Real-World Application</h2>
            <div className="flex items-start gap-2">
              {onEditWithAI && (
                <button
                  onClick={() => onEditWithAI('real-world-application', 'Real-World Application')}
                  className={`transition-all duration-200 px-3 py-1.5 text-xs rounded-md font-medium flex-shrink-0 flex items-center gap-1 ${
                    activeSection === 'real-world-application'
                      ? 'bg-green-200 text-green-800 border border-green-300'
                      : 'opacity-60 group-hover:opacity-100 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 hover:border-blue-300'
                  }`}
                >
                  {activeSection === 'real-world-application' ? 'Targeted' : 'Refine with AI'}
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-800 mb-3">
              Example: Cell Phone Plan
            </h3>
            <p className="text-slate-600 mb-4">
              A cell phone plan costs $25 per month plus $0.10 for each text message sent. 
              We can model the total monthly cost using slope-intercept form.
            </p>
            <div className="space-y-2 text-slate-600">
              <p><strong>Monthly fee:</strong> $25 (this is our y-intercept, b = 25)</p>
              <p><strong>Cost per text:</strong> $0.10 (this is our slope, m = 0.10)</p>
              <p><strong>Equation:</strong> <span className="font-mono font-bold">y = 0.10x + 25</span></p>
            </div>
          </div>
        </section>

        {/* Personalized Quiz */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Personalized Assessment</h2>
          <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-6">
            <p className="text-sm text-slate-600 mb-6">
              Generated based on your learning profile: Band 3 proficiency level
            </p>
            
            <div className="space-y-6">
              {/* Question 1 */}
              <div className="bg-white border border-slate-300 rounded-xl p-4">
                <p className="font-medium text-slate-800 mb-3">1. What is the slope in the equation y = -3x + 7?</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="q1" className="text-slate-600" />
                    <span className="text-slate-600">A) 7</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="q1" className="text-slate-600" />
                    <span className="text-slate-600">B) -3</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="q1" className="text-slate-600" />
                    <span className="text-slate-600">C) x</span>
                  </label>
                </div>
              </div>

              {/* Question 2 */}
              <div className="bg-white border border-slate-300 rounded-xl p-4">
                <p className="font-medium text-slate-800 mb-3">2. A gym membership costs $40 to join plus $15 per month. Write the equation for total cost (y) after x months:</p>
                <input 
                  type="text" 
                  placeholder="y = "
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              {/* Question 3 */}
              <div className="bg-white border border-slate-300 rounded-xl p-4">
                <p className="font-medium text-slate-800 mb-3">3. In the equation y = 4x + 12, what does the number 12 represent in a real-world context?</p>
                <textarea 
                  placeholder="Explain your reasoning..."
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-300">
              <button className="text-slate-600 hover:text-slate-800 text-sm">
                Need help? View hints
              </button>
              <button className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600">
                Submit Assessment
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// -------------------- Slides Content --------------------
function SlidesContent() {
  return (
    <div className="h-full p-8">
      <div className="space-y-6">
        
    {/* Slides Header */}
    <div className="border-b border-slate-300 pb-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Understanding Slope-Intercept Form</h1>
      <p className="text-slate-600">Interactive Slide Presentation • 12 slides</p>
      <div className="flex gap-2 mt-2">
        <span className="inline-flex items-center px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-md">8.F.A.3</span>
        <span className="inline-flex items-center px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-md">8.F.B.4</span>
        <span className="inline-flex items-center px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-md">8.EE.B.6</span>
      </div>
    </div>

        {/* Slide Navigator */}
        <div className="flex items-center justify-between bg-slate-100 border-2 border-slate-300 rounded-2xl p-4">
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
            Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Slide</span>
            <select className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800">
              <option>1 - Title Slide</option>
              <option>2 - Learning Objectives</option>
              <option>3 - What is Slope?</option>
              <option>4 - Y-Intercept Explained</option>
              <option>5 - Formula Breakdown</option>
              <option>6 - Real-World Example</option>
              <option>7 - Practice Problem 1</option>
              <option>8 - Practice Problem 2</option>
              <option>9 - Interactive Graph</option>
              <option>10 - Check Understanding</option>
              <option>11 - Summary</option>
              <option>12 - Next Steps</option>
            </select>
            <span className="text-slate-600">of 12</span>
          </div>
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
            Next
          </button>
        </div>

        {/* Current Slide Display */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-8 aspect-video">
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-slate-800 mb-6 text-center">
              Understanding Slope-Intercept Form
            </h2>
            <div className="text-center text-slate-600 space-y-4">
              <p className="text-xl">Linear Functions in Algebra</p>
              <div className="text-lg">
                <p>Grade 8 Mathematics</p>
                <p>Mr. Morales • Algebra X</p>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Notes */}
        <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Speaker Notes</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Welcome students to today's lesson on slope-intercept form. This is a foundational concept that will help them 
            understand linear relationships in both mathematical and real-world contexts. Begin by asking students what they 
            already know about lines and graphs to activate prior knowledge.
          </p>
        </div>

      </div>
    </div>
  );
}

// -------------------- Video Content --------------------
function VideoContent() {
  return (
    <div className="h-full p-8">
      <div className="space-y-6">
        
        {/* Video Header */}
        <div className="border-b border-slate-300 pb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Understanding Slope-Intercept Form</h1>
          <p className="text-slate-600">Educational Video • HD Quality</p>
        </div>

        {/* Video Player */}
        <div className="bg-slate-900 border-2 border-slate-300 rounded-2xl overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Generated Video Lesson</h3>
              <p className="text-slate-300">Click to play interactive video content</p>
            </div>
          </div>
          
          {/* Video Controls */}
          <div className="bg-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-white hover:text-slate-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                            <span className="text-white text-sm">0:00</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">Speed:</span>
                <select className="bg-slate-700 text-white text-sm rounded px-2 py-1">
                  <option>0.5x</option>
                  <option>0.75x</option>
                  <option selected>1x</option>
                  <option>1.25x</option>
                  <option>1.5x</option>
                  <option>2x</option>
                </select>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-slate-600 rounded-full h-1">
                <div className="bg-white h-1 rounded-full" style={{width: '0%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Chapters */}
        <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Video Chapters</h3>
          <div className="space-y-2">
                        <div className="p-2 bg-white rounded-lg border border-slate-300">
                          <span className="text-slate-800 font-medium">1. Introduction to Linear Functions</span>
                        </div>
                        <div className="p-2 hover:bg-white rounded-lg cursor-pointer">
                          <span className="text-slate-600">2. Understanding Slope</span>
                        </div>
                        <div className="p-2 hover:bg-white rounded-lg cursor-pointer">
                          <span className="text-slate-600">3. Y-Intercept Explained</span>
                        </div>
                        <div className="p-2 hover:bg-white rounded-lg cursor-pointer">
                          <span className="text-slate-600">4. Real-World Applications</span>
                        </div>
                        <div className="p-2 hover:bg-white rounded-lg cursor-pointer">
                          <span className="text-slate-600">5. Practice Problems</span>
                        </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// -------------------- Audio Content --------------------
function AudioContent() {
  return (
    <div className="h-full p-8">
      <div className="space-y-6">
        
        {/* Audio Header */}
        <div className="border-b border-slate-300 pb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Understanding Slope-Intercept Form</h1>
          <p className="text-slate-600">Audio Lesson • Podcast Style</p>
        </div>

        {/* Audio Player */}
        <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">AI-Generated Audio Lesson</h3>
            <p className="text-slate-600">Interactive dialogue between teacher and students</p>
          </div>

          {/* Audio Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <button className="p-3 bg-slate-700 text-white rounded-full hover:bg-slate-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm10 0h2v12h-2z"/>
                </svg>
              </button>
              <button className="p-4 bg-slate-700 text-white rounded-full hover:bg-slate-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <button className="p-3 bg-slate-700 text-white rounded-full hover:bg-slate-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>
            </div>
            
            <div className="text-center text-slate-600">
                        <div className="text-lg font-mono">03:45</div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-300 rounded-full h-2">
              <div className="bg-slate-700 h-2 rounded-full" style={{width: '17%'}}></div>
            </div>
          </div>
        </div>

        {/* Audio Transcript */}
        <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Live Transcript</h3>
          <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="font-semibold text-slate-700 min-w-fit">Teacher:</span>
                <span className="text-slate-600">Welcome everyone! Today we're going to explore one of the most important concepts in algebra: the slope-intercept form. Can anyone tell me what they think 'slope' means?</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-blue-600 min-w-fit">Student A:</span>
                <span className="text-slate-600">Is it how steep something is?</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-slate-700 min-w-fit">Teacher:</span>
                <span className="text-slate-600">Excellent! That's exactly right. Slope tells us how steep a line is. Now, let's think about this in terms of a mathematical equation...</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-green-600 min-w-fit">Student B:</span>
                <span className="text-slate-600">So if a line goes up really fast, it has a big slope?</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-slate-700 min-w-fit">Teacher:</span>
                <span className="text-slate-600 bg-yellow-100 px-1 rounded">Perfect understanding! A steep upward line does have a large positive slope. Let me show you how we write this mathematically...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 text-center">
            <h4 className="font-semibold text-slate-800 mb-2">Playback Speed</h4>
            <select className="bg-white border border-slate-300 rounded px-3 py-1">
              <option>0.75x</option>
              <option selected>1x</option>
              <option>1.25x</option>
              <option>1.5x</option>
            </select>
          </div>
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 text-center">
            <h4 className="font-semibold text-slate-800 mb-2">Captions</h4>
            <button className="bg-slate-700 text-white px-4 py-1 rounded">
              On
            </button>
          </div>
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 text-center">
            <h4 className="font-semibold text-slate-800 mb-2">Download</h4>
            <button className="bg-slate-700 text-white px-4 py-1 rounded">
              MP3
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function TabContent({
  modality,
  title,
  content,
  loading,
  standard,
  onRegenerate,
  onEditWithAI,
  activeSection,
  introContent,
}: {
  modality: ModalityKey;
  title: string;
  content: string | null;
  loading?: boolean;
  standard?: string;
  onRegenerate?: (modality: ModalityKey, tweak?: string) => void;
  onEditWithAI?: (sectionId: string, sectionTitle: string) => void;
  activeSection?: string | null;
  introContent?: {paragraph1: string, paragraph2: string};
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content || "");
  const [showRegenerateInput, setShowRegenerateInput] = useState(false);
  const [regenerateTweak, setRegenerateTweak] = useState("");
  
  const hasContent = content && content !== "— Not generated yet —";

  // Show immersive content for text modality
  if (modality === "text" && hasContent) {
    return <ImmersiveTextContent onEditWithAI={onEditWithAI} activeSection={activeSection} introContent={introContent} />;
  }

  // Show mock artifacts for other modalities
  if (modality === "slides" && hasContent) {
    return <SlidesContent />;
  }
  
  if (modality === "video" && hasContent) {
    return <VideoContent />;
  }
  
  if (modality === "audio" && hasContent) {
    return <AudioContent />;
  }
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(content || "");
  };
  
  const handleSaveEdit = () => {
    setIsEditing(false);
    // In real app, would save the edited content
  };
  
  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(modality, regenerateTweak || undefined);
      setShowRegenerateInput(false);
      setRegenerateTweak("");
    }
  };
  
  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">{title}</h3>
          {hasContent ? (
            <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
              Generated
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-slate-200">
              Pending
            </span>
          )}
        </div>
        
        {hasContent && (
          <div className="flex gap-2">
            <button 
              onClick={() => setShowRegenerateInput(!showRegenerateInput)}
              className="rounded-lg border px-3 py-1.5 text-sm bg-white hover:bg-neutral-50 transition-colors"
            >
              Regenerate
            </button>
            <button className="rounded-lg border px-3 py-1.5 text-sm bg-white hover:bg-neutral-50 transition-colors">
              Preview
            </button>
            <button 
              onClick={handleEdit}
              className="rounded-lg border px-3 py-1.5 text-sm bg-white hover:bg-neutral-50 transition-colors"
            >
              Edit
            </button>
            <button 
              onClick={() => navigator.clipboard.writeText(content || "")}
              className="rounded-lg border px-3 py-1.5 text-sm bg-white hover:bg-neutral-50 transition-colors"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Regenerate input */}
      {showRegenerateInput && (
        <div className="mb-4 p-3 border rounded-xl bg-neutral-50">
          <input
            type="text"
            className="w-full text-sm border rounded px-2 py-1 mb-2"
            placeholder="Tweak (e.g., add sports examples)"
            value={regenerateTweak}
            onChange={(e) => setRegenerateTweak(e.target.value)}
          />
          <div className="flex gap-2">
            <button 
              onClick={handleRegenerate}
              className="text-sm px-3 py-1 bg-black text-white rounded hover:opacity-90"
            >
              Regenerate
            </button>
            <button 
              onClick={() => setShowRegenerateInput(false)}
              className="text-sm px-3 py-1 border rounded hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-neutral-50 rounded-xl p-4 min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              {/* Skeleton loading */}
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-neutral-300 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-neutral-300 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-neutral-300 rounded w-5/6 mx-auto"></div>
                <div className="h-4 bg-neutral-300 rounded w-2/3 mx-auto"></div>
              </div>
              <p className="text-neutral-600 mt-4">Generating {title.toLowerCase()}...</p>
            </div>
          </div>
        ) : hasContent ? (
          isEditing ? (
            <div className="space-y-2">
              <textarea
                className="w-full h-64 text-sm border rounded px-3 py-2 resize-none"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveEdit}
                  className="text-sm px-3 py-1 bg-black text-white rounded hover:opacity-90"
                >
                  Save
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-sm px-3 py-1 border rounded hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm text-neutral-800 leading-relaxed">
              {content}
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-6xl mb-4 opacity-30">📝</div>
              <h4 className="font-medium text-neutral-900 mb-2">No content yet</h4>
              <p className="text-sm text-neutral-600 max-w-sm">
                Click Generate to create {title.toLowerCase()} aligned to {standard || "8.EE.B.6"}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modality-specific actions */}
      {hasContent && !isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              {modality === "text" && "Ready for classroom use • Grade 8 reading level"}
              {modality === "slides" && "Slide deck ready • Add voiceover narration"}
              {modality === "video" && "Storyboard complete • Ready for video production"}
              {modality === "audio" && "Script ready • Record teacher-student dialogue"}
              {modality === "mindmap" && "Visual map complete • Interactive elements available"}
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
              View Details →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
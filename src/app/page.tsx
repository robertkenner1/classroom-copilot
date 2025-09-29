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
import { HandThumbUpIcon, HandThumbDownIcon, CpuChipIcon, XMarkIcon, ArrowRightIcon, CubeIcon, ExclamationTriangleIcon, FaceFrownIcon } from '@heroicons/react/24/outline';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
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
  HomeIcon,
  UserGroupIcon as UsersIcon,
  ClipboardDocumentListIcon as StandardsIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { AcademicCapIcon as AcademicCapIconSolid } from '@heroicons/react/24/solid';
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
    { 
      id: "stu-01", 
      name: "Ava Martinez", 
      avgScore: 92, 
      masteryBand: 4, 
      masteryLabel: "Advanced", 
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      learningStyle: "visual",
      preferredModality: "slides",
      learningStyleDescription: "Learns best through charts, diagrams, and visual presentations"
    },
    { 
      id: "stu-02", 
      name: "Ben Kim", 
      avgScore: 88, 
      masteryBand: 3, 
      masteryLabel: "Proficient", 
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      learningStyle: "auditory",
      preferredModality: "audio",
      learningStyleDescription: "Learns best through listening and verbal instruction"
    },
    { 
      id: "stu-03", 
      name: "Chris Thompson", 
      avgScore: 76, 
      masteryBand: 3, 
      masteryLabel: "Proficient", 
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      learningStyle: "kinesthetic",
      preferredModality: "video",
      learningStyleDescription: "Learns best through hands-on activities and movement"
    },
    { 
      id: "stu-04", 
      name: "Diana Patel", 
      avgScore: 84, 
      masteryBand: 3, 
      masteryLabel: "Proficient", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      learningStyle: "reading",
      preferredModality: "text",
      learningStyleDescription: "Learns best through reading and written materials"
    },
    { 
      id: "stu-05", 
      name: "Ethan Rodriguez", 
      avgScore: 91, 
      masteryBand: 4, 
      masteryLabel: "Advanced", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      learningStyle: "visual",
      preferredModality: "slides",
      learningStyleDescription: "Learns best through charts, diagrams, and visual presentations"
    },
    { 
      id: "stu-06", 
      name: "Fiona Lee", 
      avgScore: 79, 
      masteryBand: 3, 
      masteryLabel: "Proficient", 
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      learningStyle: "auditory",
      preferredModality: "audio",
      learningStyleDescription: "Learns best through listening and verbal instruction"
    },
    { 
      id: "stu-07", 
      name: "Gabriel Santos", 
      avgScore: 87, 
      masteryBand: 3, 
      masteryLabel: "Proficient", 
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      learningStyle: "reading",
      preferredModality: "text",
      learningStyleDescription: "Learns best through reading and written materials"
    },
    { 
      id: "stu-08", 
      name: "Hannah Wilson", 
      avgScore: 82, 
      masteryBand: 3, 
      masteryLabel: "Proficient", 
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      learningStyle: "kinesthetic",
      preferredModality: "video",
      learningStyleDescription: "Learns best through hands-on activities and movement"
    },
    { 
      id: "stu-09", 
      name: "Isaac Johnson", 
      avgScore: 95, 
      masteryBand: 4, 
      masteryLabel: "Advanced", 
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      learningStyle: "reading",
      preferredModality: "text",
      learningStyleDescription: "Learns best through reading and written materials"
    },
    { 
      id: "stu-10", 
      name: "Jade Chen", 
      avgScore: 73, 
      masteryBand: 2, 
      masteryLabel: "Developing", 
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      learningStyle: "visual",
      preferredModality: "slides",
      learningStyleDescription: "Learns best through charts, diagrams, and visual presentations"
    }
  ],
};

// AI-prebaked lesson stubs (standards-aligned)
// Enrichment Library Lessons (Pre-existing)
const ENRICHMENT_LESSONS: Lesson[] = [
  {
    id: "enrichment-001",
    title: "Introduction to Quadratic Functions",
    subject: "Mathematics",
    standards: ["A.REI.B.4"],
    updatedAt: "2025-09-25",
    efficacy: 0,
    isLive: true,
    assignedStudents: [],
    chatHistory: [
      {
        id: "teacher-enrichment-001-1",
        type: "user",
        content: "Create an enrichment lesson on introduction to quadratic functions for advanced students who want to explore beyond 8th grade standards",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ai-enrichment-001-1",
        type: "ai",
        content: "I've created a comprehensive introduction to quadratic functions lesson that introduces advanced concepts in an accessible way for 8th graders.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60000),
        reasoning: "You want an enrichment lesson that challenges advanced students with quadratic functions beyond standard 8th grade curriculum while remaining accessible.\n\nI planned an introduction with parabolic motion in sports and architecture, visual representations using graphing tools and real-world examples, hands-on activities with quadratic modeling, connections to future Algebra 2 concepts, and optional extension activities for different interest levels.\n\nI created a lesson structure with engaging introduction, conceptual development, interactive activities, and extension opportunities, then generated a comprehensive enrichment lesson with multiple entry points and differentiated challenge levels.",
        summary: "Created Introduction to Quadratic Functions enrichment lesson featuring:\n\n• **Engaging Introduction**: Parabolic motion in sports and architectural applications\n• **Conceptual Development**: Visual and hands-on approach to quadratic relationships\n• **Interactive Activities**: Graphing explorations and real-world modeling\n• **Future Connections**: Links to Algebra 2 and calculus concepts\n• **Differentiated Extensions**: Multiple challenge levels for different interests\n\nThe lesson is designed to inspire and challenge while remaining accessible to 8th grade students.",
        reasoningCollapsed: true,
        feedback: "positive"
      },
      {
        id: "teacher-enrichment-001-2",
        type: "user",
        content: "Make the introduction more hands-on and add some interactive elements that students can explore independently",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ai-enrichment-001-2",
        type: "ai",
        content: "I've enhanced the introduction with interactive elements and hands-on activities that students can explore at their own pace.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000),
        reasoning: "You want more interactive, hands-on elements in the introduction that allow for independent exploration and discovery of quadratic relationships.\n\nI added physical manipulatives for parabolic motion experiments, created self-guided graphing exploration activities, included digital tools and interactive simulations, designed activities that accommodate different pacing, and provided clear instructions for independent work.\n\nI updated the introduction with interactive elements, hands-on activities, and self-paced exploration opportunities. The enhanced introduction now includes interactive demonstrations, manipulatives, and independent exploration activities.",
        summary: "Enhanced the introduction section with:\n\n• **Interactive Demonstrations**: Hands-on parabolic motion experiments\n• **Self-Guided Explorations**: Graphing activities students can complete independently\n• **Digital Tools**: Interactive quadratic function simulators\n• **Flexible Pacing**: Materials that accommodate different learning speeds\n• **Clear Instructions**: Step-by-step guidance for independent discovery\n\nThe updated introduction now provides multiple ways for students to engage with and discover quadratic concepts on their own.",
        reasoningCollapsed: true,
        feedback: null
      }
    ]
  },
  {
    id: "enrichment-002",
    title: "Basic Trigonometry Ratios",
    subject: "Mathematics",
    standards: ["G.SRT.C.6"],
    updatedAt: "2025-09-24",
    efficacy: 0,
    isLive: true,
    assignedStudents: [],
    chatHistory: [
      {
        id: "teacher-enrichment-002-1",
        type: "user",
        content: "Create an enrichment lesson on basic trigonometry ratios for students ready for high school geometry concepts",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ai-enrichment-002-1",
        type: "ai",
        content: "I've created a comprehensive basic trigonometry ratios lesson that introduces sine, cosine, and tangent in an accessible way.",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 60000),
        reasoning: "You want an enrichment lesson introducing trigonometry ratios that prepares students for high school geometry while being accessible to 8th graders.\n\nI planned an introduction using right triangles in architecture and navigation, visual representations with unit circle concepts, hands-on activities with measuring and calculating ratios, real-world applications in engineering and design, and progressive complexity from basic ratios to applications.\n\nI created a lesson structure with concrete triangle examples, ratio calculations, and practical applications, then generated a comprehensive trigonometry lesson with visual aids and hands-on exploration.",
        summary: "Created Basic Trigonometry Ratios enrichment lesson featuring:\n\n• **Engaging Introduction**: Right triangles in architecture and navigation\n• **Conceptual Development**: Visual approach to sine, cosine, and tangent ratios\n• **Interactive Activities**: Measuring and calculating ratios with physical triangles\n• **Real-World Applications**: Engineering and design problem-solving\n• **Progressive Complexity**: From basic ratios to practical applications\n\nThe lesson builds foundational understanding for high school geometry success.",
        reasoningCollapsed: true,
        feedback: "positive"
      }
    ]
  },
  {
    id: "enrichment-003",
    title: "Introduction to Calculus Ideas",
    subject: "Mathematics",
    standards: ["HS.F-IF.B.4"],
    updatedAt: "2025-09-23",
    efficacy: 0,
    isLive: true,
    assignedStudents: [],
    chatHistory: [
      {
        id: "teacher-enrichment-003-1",
        type: "user",
        content: "Create an enrichment lesson introducing calculus concepts like rate of change and limits through visual examples",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ai-enrichment-003-1",
        type: "ai",
        content: "I've created an introduction to calculus ideas lesson that makes abstract concepts concrete through visual examples and real-world scenarios.",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60000),
        reasoning: "You want to introduce calculus concepts like rate of change and limits in a way that's accessible to 8th graders through visual and concrete examples.\n\nI planned an introduction with motion and speed concepts students already understand, visual representations of changing rates using graphs and animations, hands-on activities exploring instantaneous vs. average rates, real-world connections to physics and engineering, and a conceptual foundation without complex notation.\n\nI created a lesson that builds from familiar concepts to calculus ideas through visual exploration, then generated a calculus introduction with visual examples and intuitive explanations.",
        summary: "Created Introduction to Calculus Ideas enrichment lesson featuring:\n\n• **Engaging Introduction**: Motion and speed concepts as foundation\n• **Visual Representations**: Graphs and animations showing rate of change\n• **Interactive Activities**: Exploring instantaneous vs. average rates\n• **Real-World Connections**: Physics and engineering applications\n• **Conceptual Foundation**: Intuitive understanding without complex notation\n\nThe lesson provides a gentle introduction to calculus thinking for advanced students.",
        reasoningCollapsed: true,
        feedback: null
      }
    ]
  },
  {
    id: "enrichment-004",
    title: "Cryptography and Prime Numbers",
    subject: "Mathematics",
    standards: ["N.RN.A.2"],
    updatedAt: "2025-09-22",
    efficacy: 0,
    isLive: true,
    assignedStudents: [],
    chatHistory: [
      {
        id: "teacher-enrichment-004-1",
        type: "user",
        content: "Create an enrichment lesson on cryptography and prime numbers showing how mathematics protects digital information",
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ai-enrichment-004-1",
        type: "ai",
        content: "I've created a cryptography and prime numbers lesson that shows how mathematical concepts protect our digital world.",
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 60000),
        reasoning: "You want to show students how number theory, specifically prime numbers, is used in real-world cryptography and digital security.\n\nI planned an introduction with everyday digital security examples, exploration of prime number properties and patterns, simple encryption activities using modular arithmetic, connections to computer science and cybersecurity, and hands-on coding and decoding exercises.\n\nI created a lesson that connects abstract number theory to practical digital security applications, then generated a cryptography lesson with hands-on activities and real-world relevance.",
        summary: "Created Cryptography and Prime Numbers enrichment lesson featuring:\n\n• **Engaging Introduction**: Digital security in everyday life\n• **Prime Number Exploration**: Properties and patterns investigation\n• **Hands-On Encryption**: Simple coding and decoding activities\n• **Real-World Applications**: Computer science and cybersecurity connections\n• **Interactive Exercises**: Mathematical problem-solving with practical purpose\n\nThe lesson demonstrates how abstract mathematics protects our digital information.",
        reasoningCollapsed: true,
        feedback: "positive"
      }
    ]
  },
  {
    id: "enrichment-005",
    title: "The Mathematics of Music",
    subject: "Mathematics",
    standards: ["A.CED.A.2"],
    updatedAt: "2025-09-21",
    efficacy: 0,
    isLive: true,
    assignedStudents: [],
    chatHistory: [
      {
        id: "teacher-enrichment-005-1",
        type: "user",
        content: "Create an enrichment lesson exploring the mathematics of music, including frequency ratios and sound waves",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ai-enrichment-005-1",
        type: "ai",
        content: "I've created a mathematics of music lesson that explores how mathematical patterns create harmony and musical relationships.",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000),
        reasoning: "You want to show students the mathematical foundations of music, including frequency ratios, sound waves, and harmonic relationships.\n\nI planned an introduction with familiar musical concepts and instruments, exploration of frequency ratios and mathematical intervals, visual representations of sound waves and harmonic patterns, hands-on activities with musical instruments and digital tools, and connections to physics and acoustic engineering.\n\nI created a lesson that bridges mathematics and music through interactive exploration, then generated a music mathematics lesson with audio-visual demonstrations and hands-on activities.",
        summary: "Created The Mathematics of Music enrichment lesson featuring:\n\n• **Engaging Introduction**: Musical concepts students recognize\n• **Frequency Exploration**: Mathematical ratios in musical intervals\n• **Visual Sound Waves**: Patterns and harmonic relationships\n• **Interactive Activities**: Instruments and digital music tools\n• **Cross-Disciplinary Connections**: Physics and acoustic engineering\n\nThe lesson reveals the mathematical beauty underlying musical harmony.",
        reasoningCollapsed: true,
        feedback: null
      }
    ]
  },
  {
    id: "enrichment-006",
    title: "Fractals and Infinite Patterns",
    subject: "Mathematics",
    standards: ["G.MG.A.3"],
    updatedAt: "2025-09-20",
    efficacy: 0,
    isLive: true,
    assignedStudents: [],
    chatHistory: [
      {
        id: "teacher-enrichment-006-1",
        type: "user",
        content: "Create an enrichment lesson on fractals and infinite patterns, showing self-similar patterns in nature and art",
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ai-enrichment-006-1",
        type: "ai",
        content: "I've created a fractals and infinite patterns lesson that explores self-similarity in nature, art, and mathematics.",
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 60000),
        reasoning: "You want to introduce students to fractal geometry and self-similar patterns, connecting mathematical concepts to natural phenomena and artistic expression.\n\nI planned an introduction with fractal patterns in nature like trees, coastlines, and clouds, exploration of self-similarity and recursive patterns, hands-on activities creating fractals with simple rules, digital tools for fractal generation and exploration, and connections to computer graphics and natural sciences.\n\nI created a lesson that reveals the mathematical patterns underlying natural and artistic beauty, then generated a fractals lesson with visual examples and creative activities.",
        summary: "Created Fractals and Infinite Patterns enrichment lesson featuring:\n\n• **Nature Connections**: Fractal patterns in trees, coastlines, and natural forms\n• **Self-Similarity Exploration**: Mathematical recursion and pattern generation\n• **Creative Activities**: Drawing and constructing fractal patterns\n• **Digital Tools**: Computer-generated fractals and interactive exploration\n• **Interdisciplinary Links**: Computer graphics, art, and natural sciences\n\nThe lesson reveals the infinite complexity hidden in simple mathematical rules.",
        reasoningCollapsed: true,
        feedback: "positive"
      }
    ]
  }
];

const PREBAKED: Lesson[] = [
  {
    id: "lsn-001",
    title: "Integer Exponents and Their Properties",
    standards: ["8.EE.A.1"],
    updatedAt: "2025-09-22",
    efficacy: 0.82,
    subject: "math",
    isLive: true,
    liveAt: "2025-09-20",
    completedCount: 18,
    assignedStudents: ["stu-01", "stu-02", "stu-03", "stu-04", "stu-05", "stu-06", "stu-07", "stu-08", "stu-09", "stu-10"],
    studentProgress: {
      "stu-01": { studentId: "stu-01", status: "completed", startedAt: "2025-09-20", completedAt: "2025-09-21", score: 95, timeSpent: 45 },
      "stu-02": { studentId: "stu-02", status: "completed", startedAt: "2025-09-20", completedAt: "2025-09-22", score: 88, timeSpent: 52 },
      "stu-03": { studentId: "stu-03", status: "in_progress", startedAt: "2025-09-21", timeSpent: 23 },
      "stu-04": { studentId: "stu-04", status: "completed", startedAt: "2025-09-20", completedAt: "2025-09-21", score: 92, timeSpent: 38 },
      "stu-05": { studentId: "stu-05", status: "completed", startedAt: "2025-09-20", completedAt: "2025-09-21", score: 97, timeSpent: 41 },
      "stu-06": { studentId: "stu-06", status: "in_progress", startedAt: "2025-09-22", timeSpent: 15 },
      "stu-07": { studentId: "stu-07", status: "completed", startedAt: "2025-09-21", completedAt: "2025-09-22", score: 85, timeSpent: 48 },
      "stu-08": { studentId: "stu-08", status: "not_started" },
      "stu-09": { studentId: "stu-09", status: "completed", startedAt: "2025-09-20", completedAt: "2025-09-21", score: 94, timeSpent: 35 },
      "stu-10": { studentId: "stu-10", status: "in_progress", startedAt: "2025-09-22", timeSpent: 8 }
    },
    chatHistory: [
      {
        id: "user-1695123456789",
        type: "user",
        content: "Create lesson materials for all students focusing on 8.EE.B.6 and 8.F.B.4 with multiple modalities",
        timestamp: new Date("2025-09-19T14:30:00Z")
      },
      {
        id: "ai-1695123456790",
        type: "ai",
        content: "I've created a comprehensive lesson on slope-intercept form that addresses both standards with engaging, multi-modal content.",
        timestamp: new Date("2025-09-19T14:31:00Z"),
        reasoning: "The user requested materials covering 8.EE.B.6 (linear equations) and 8.F.B.4 (functions). I've designed content that:\n\n• **Addresses Both Standards**: Slope-intercept form connects algebraic manipulation (8.EE.B.6) with function concepts (8.F.B.4)\n• **Multi-Modal Approach**: Created text, slides, video, and audio versions to accommodate different learning preferences\n• **Real-World Connections**: Used skateboard ramps and ride-sharing examples to make abstract concepts concrete\n• **Scaffolded Learning**: Progressed from basic slope concept to full y = mx + b mastery\n• **Assessment Integration**: Included formative and summative assessment opportunities",
        summary: "Created a complete slope-intercept form lesson with:\n\n• **Engaging Introduction**: Real-world skateboard ramp scenario\n• **Visual Representations**: Interactive graphs and coordinate plane activities\n• **Formula Breakdown**: Step-by-step y = mx + b component analysis\n• **Practice Problems**: Graduated difficulty with real-world applications\n• **Multi-Modal Content**: Text, slides, video, and audio versions\n• **Aligned Assessments**: Questions targeting both 8.EE.B.6 and 8.F.B.4\n\nThe lesson is ready for all students and includes differentiated content for various learning preferences.",
        reasoningCollapsed: true,
        feedback: "positive"
      },
      {
        id: "user-1695123456791",
        type: "user",
        content: "Make the introduction more engaging with a stronger hook and connect it better to students' everyday experiences",
        timestamp: new Date("2025-09-19T15:45:00Z")
      },
      {
        id: "ai-1695123456792",
        type: "ai",
        content: "I've successfully updated the introduction to be more engaging and relatable! The changes include stronger hooks and better real-world connections.",
        timestamp: new Date("2025-09-19T15:46:00Z"),
        reasoning: "The user wanted a more engaging introduction with stronger hooks and better connections to student experiences. I focused on:\n\n• **Stronger Hook**: Opened with a familiar ride-sharing scenario that immediately connects to students' experiences\n• **Real-World Relevance**: Linked slope-intercept form to everyday situations like Uber pricing and phone plans\n• **Interactive Language**: Used more engaging, conversational tone to draw students in\n• **Practical Context**: Showed why this math matters in their daily lives\n• **Immediate Connection**: Made the abstract concept concrete from the first sentence",
        summary: "I've successfully updated the introduction section to be more engaging and relatable! The changes include:\n\n• **Stronger Hook**: Opens with a familiar ride-sharing scenario that immediately connects to students' experiences\n• **Real-World Connection**: Links slope-intercept form to everyday situations like Uber pricing and phone plans\n• **Interactive Language**: Uses more engaging, conversational tone to draw students in\n• **Practical Context**: Shows why this math matters in their daily lives\n\nThe introduction section has been updated and is now live in your lesson. The content captures attention from the first sentence and helps students see the relevance of linear functions in their world.",
        reasoningCollapsed: true,
        feedback: null
      }
    ]
  },
  {
    id: "lsn-002",
    title: "Graphing Proportional Relationships",
    standards: ["8.EE.B.5"],
    updatedAt: "2025-09-19",
    efficacy: 0.76,
    subject: "math",
    isLive: false,
    completedCount: 0,
    assignedStudents: ["stu-01", "stu-02", "stu-03", "stu-04", "stu-05", "stu-06", "stu-07", "stu-08", "stu-09", "stu-10"],
    chatHistory: [
      {
        id: "user-1695023456789",
        type: "user",
        content: "Create a lesson on functions that helps students understand the relationship between input and output values, focusing on 8.F.A.1",
        timestamp: new Date("2025-09-18T10:15:00Z")
      },
      {
        id: "ai-1695023456790",
        type: "ai",
        content: "I've created a comprehensive functions lesson that builds understanding through real-world examples and interactive activities.",
        timestamp: new Date("2025-09-18T10:16:00Z"),
        reasoning: "For 8.F.A.1 (understanding functions as input-output relationships), I designed content that:\n\n• **Concrete Examples**: Used vending machines, temperature conversion, and recipe scaling to illustrate function concepts\n• **Visual Representations**: Created function machines, tables, and graphs to show input-output relationships\n• **Progressive Complexity**: Started with simple one-step functions, built to multi-step operations\n• **Real-World Applications**: Connected abstract function notation to familiar situations\n• **Multiple Representations**: Showed functions as tables, graphs, equations, and verbal descriptions",
        summary: "Created a complete functions lesson featuring:\n\n• **Function Machine Concept**: Visual representation of input-output relationships\n• **Real-World Examples**: Vending machines, temperature conversion, recipe scaling\n• **Multiple Representations**: Tables, graphs, equations, and verbal descriptions\n• **Interactive Activities**: Students practice identifying and creating functions\n• **Assessment Components**: Formative checks and summative evaluation\n\nThe lesson builds from concrete examples to abstract understanding, perfectly aligned with 8.F.A.1 standards.",
        reasoningCollapsed: true,
        feedback: null
      },
      {
        id: "user-1695023456791",
        type: "user",
        content: "Add more practice problems that focus on identifying whether a relationship is a function or not",
        timestamp: new Date("2025-09-18T11:30:00Z")
      },
      {
        id: "ai-1695023456792",
        type: "ai",
        content: "I've enhanced the practice section with additional problems specifically focused on function identification and the vertical line test.",
        timestamp: new Date("2025-09-18T11:31:00Z"),
        reasoning: "The user requested more practice problems for function identification. I added:\n\n• **Vertical Line Test Examples**: Visual problems using graphs to determine if relationships are functions\n• **Table Analysis**: Problems where students examine input-output tables\n• **Real-World Scenarios**: Situations where students must determine if relationships are functional\n• **Mixed Problem Types**: Combination of graphs, tables, and word problems\n• **Common Misconceptions**: Problems that address typical student errors",
        summary: "Enhanced the practice problems section with:\n\n• **Function Identification Problems**: 8 new problems focusing on determining if relationships are functions\n• **Vertical Line Test Practice**: Visual exercises using coordinate plane graphs\n• **Table Analysis**: Problems examining input-output relationships in tabular form\n• **Real-World Applications**: Scenarios like student ID numbers, temperature readings, and sports statistics\n• **Progressive Difficulty**: From simple one-to-one relationships to more complex examples\n\nThe updated practice section now provides comprehensive coverage of function identification skills.",
        reasoningCollapsed: true,
        feedback: null
      }
    ]
  },
  {
    id: "lsn-003",
    title: "Understanding Slope in Linear Equations",
    standards: ["8.EE.B.6", "8.F.B.4"],
    updatedAt: "2025-09-12",
    efficacy: 0.71,
    subject: "math",
    isLive: false,
    completedCount: 0,
    assignedStudents: ["stu-01", "stu-02", "stu-03", "stu-04", "stu-05", "stu-06", "stu-07", "stu-08", "stu-09", "stu-10"],
    chatHistory: [
      {
        id: "user-1694923456789",
        type: "user",
        content: "I need a lesson on integer exponents that covers the laws and patterns, aligned to 8.EE.A.1. My students struggle with negative exponents.",
        timestamp: new Date("2025-09-11T13:20:00Z")
      },
      {
        id: "ai-1694923456790",
        type: "ai",
        content: "I've created a comprehensive exponents lesson that specifically addresses negative exponents through pattern recognition and visual models.",
        timestamp: new Date("2025-09-11T13:21:00Z"),
        reasoning: "The user mentioned students struggle with negative exponents, so I designed content that:\n\n• **Pattern-Based Learning**: Shows the pattern from positive to negative exponents\n• **Visual Models**: Uses fraction bars and decimal representations to make negative exponents concrete\n• **Step-by-Step Progression**: Builds from familiar positive exponents to challenging negative ones\n• **Multiple Representations**: Shows exponents as repeated multiplication, fractions, and decimals\n• **Common Error Prevention**: Addresses typical misconceptions about negative exponents",
        summary: "Created an integer exponents lesson with special focus on negative exponents:\n\n• **Pattern Recognition**: Visual progression from positive to negative exponents\n• **Conceptual Understanding**: Fraction and decimal representations of negative exponents\n• **Exponent Laws**: Product, quotient, and power rules with clear examples\n• **Real-World Applications**: Scientific notation and measurement contexts\n• **Scaffolded Practice**: Graduated problems building confidence with negative exponents\n\nThe lesson specifically addresses student difficulties with negative exponents through multiple approaches.",
        reasoningCollapsed: true,
        feedback: null
      },
      {
        id: "user-1694923456791",
        type: "user",
        content: "Can you add some real-world examples that show why we need negative exponents? Maybe something with scientific notation?",
        timestamp: new Date("2025-09-11T14:45:00Z")
      },
      {
        id: "ai-1694923456792",
        type: "ai",
        content: "I've added compelling real-world examples featuring scientific notation, microscopic measurements, and technology applications.",
        timestamp: new Date("2025-09-11T14:46:00Z"),
        reasoning: "The user wanted real-world examples showing the necessity of negative exponents. I added:\n\n• **Scientific Notation Applications**: Virus sizes, atomic measurements, computer memory\n• **Technology Examples**: Processor speeds, data storage, digital measurements\n• **Microscopic World**: Cell sizes, bacteria, molecular dimensions\n• **Practical Contexts**: Why scientists and engineers need negative exponents\n• **Career Connections**: How negative exponents appear in STEM fields",
        summary: "Enhanced the lesson with compelling real-world applications:\n\n• **Scientific Notation Examples**: Virus sizes (10⁻⁷ meters), atomic radii (10⁻¹⁰ meters)\n• **Technology Applications**: Computer processing speeds, memory storage capacities\n• **Microscopic Measurements**: Cell biology, chemistry, and physics contexts\n• **Career Connections**: How engineers, scientists, and researchers use negative exponents\n• **Practical Problem Solving**: Converting between standard and scientific notation\n\nThese examples help students understand why negative exponents are essential tools in science and technology.",
        reasoningCollapsed: true,
        feedback: "positive"
      }
    ]
  },
];

const MODALITIES: { key: ModalityKey; name: string }[] = [
  { key: "text", name: "Immersive Text" },
  { key: "slides", name: "Slides & Narration" },
  { key: "video", name: "Video Lesson" },
  { key: "audio", name: "Audio Lesson" },
];

type ModalityKey = "text" | "slides" | "video" | "audio";

// Learning Preferences Utilities
const LEARNING_STYLES = {
  visual: { 
    name: "Visual", 
    icon: "👁️", 
    color: "bg-blue-100 text-blue-800",
    description: "Charts, diagrams, visual presentations"
  },
  auditory: { 
    name: "Auditory", 
    icon: "🎧", 
    color: "bg-green-100 text-green-800",
    description: "Listening, verbal instruction, discussions"
  },
  reading: { 
    name: "Reading/Writing", 
    icon: "📚", 
    color: "bg-purple-100 text-purple-800",
    description: "Text, written materials, note-taking"
  },
  kinesthetic: { 
    name: "Kinesthetic", 
    icon: "🤲", 
    color: "bg-orange-100 text-orange-800",
    description: "Hands-on, movement, interactive activities"
  }
};

const getModalityForLearningStyle = (learningStyle: string): ModalityKey => {
  const mapping: Record<string, ModalityKey> = {
    visual: "slides",
    auditory: "audio", 
    reading: "text",
    kinesthetic: "video"
  };
  return mapping[learningStyle] || "text";
};

interface Standard {
  id: string;
  label: string;
}

interface Student {
  id: string;
  name: string;
  avgScore: number;
  masteryBand: number;
  masteryLabel: string;
  avatar: string;
  learningStyle: "visual" | "auditory" | "reading" | "kinesthetic";
  preferredModality: ModalityKey;
  learningStyleDescription: string;
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
  isLive?: boolean;
  liveAt?: string;
  completedCount?: number;
  assignedStudents?: string[];
  studentProgress?: Record<string, StudentProgress>;
  chatHistory?: Array<{id: string, type: 'user' | 'ai' | 'agent', content: string, timestamp: Date, reasoning?: string, summary?: string, reasoningCollapsed?: boolean, feedback?: 'positive' | 'negative' | null, isStreaming?: boolean}>;
  agentContext?: {
    reasoning: string;
    planning: string;
    changes: string;
    agentPrompt: string;
  };
}

interface StudentProgress {
  studentId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  score?: number;
  timeSpent?: number; // in minutes
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

// -------------------- Lesson Modal --------------------
function LessonModal({ 
  lesson, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  lesson: Lesson; 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (lesson: Lesson) => void; 
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);
  
  // Handle closing animation
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200); // Match animation duration
  };
  
  if (!isOpen) return null;

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <style>{`
        .modal-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .modal-scroll::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .modal-scroll:hover {
          scrollbar-width: thin;
        }
        .modal-scroll:hover::-webkit-scrollbar {
          width: 8px;
        }
        .modal-scroll:hover::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .modal-scroll:hover::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .modal-scroll:hover::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Lesson content scrollbar styling */
        .lesson-content-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .lesson-content-scroll::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .lesson-content-scroll:hover {
          scrollbar-width: thin;
        }
        .lesson-content-scroll:hover::-webkit-scrollbar {
          width: 8px;
        }
        .lesson-content-scroll:hover::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }
        .lesson-content-scroll:hover::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .lesson-content-scroll:hover::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop with blur */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
          onClick={handleClose}
        />
        
        {/* Modal Content */}
      <div className={`relative w-[90%] h-[90%] bg-slate-50 rounded-2xl border-2 border-slate-200 flex overflow-hidden transition-all duration-200 ease-out ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Minimize Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors"
          title="Minimize lesson"
        >
          <div className="h-5 w-5 flex items-center justify-center text-slate-600 font-semibold text-lg">
            −
          </div>
        </button>

        {/* Lesson Content Area - Scrollable with hidden scrollbar */}
        <div className="flex-1 overflow-y-auto modal-scroll">
          <LessonBuilder
            lesson={lesson}
            onClose={onClose}
            onSave={onSave}
            isPending={false}
            onConfirm={undefined}
            onNavigate={() => {}}
            isModal={true}
          />
        </div>
      </div>
      </div>
    </>
  );
}

// -------------------- App --------------------
export default function App() {
  const [lessons, setLessons] = useState(PREBAKED);
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder' | 'review' | 'students' | 'standards'>('dashboard');
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [pendingLesson, setPendingLesson] = useState<Lesson | null>(null);

  function handleOpenLesson(id: string) {
    setOpenLessonId(id);
    setIsLessonModalOpen(true);
  }

  function handleCreateLessonFromSuggestion(lesson: Lesson) {
    setLessons((prev) => [lesson, ...prev]);
    setOpenLessonId(lesson.id);
    setIsLessonModalOpen(true);
  }

  function handleOpenEnrichmentLesson(lesson: Lesson) {
    // Just open the lesson without adding it to the lessons array
    setOpenLessonId(lesson.id);
    setIsLessonModalOpen(true);
  }

  function handleCloseLessonModal() {
    // If there's a pending lesson, save it to the lessons list
    if (pendingLesson) {
      setLessons((prev) => [pendingLesson, ...prev]);
      setPendingLesson(null);
    }
    setOpenLessonId(null);
    setIsLessonModalOpen(false);
  }

  function handleToggleLessonLive(lessonId: string) {
    setLessons(prevLessons => 
      prevLessons.map(lesson => {
        if (lesson.id === lessonId) {
          const allStudents = CLASS_8A.students.map(s => s.id);
          return {
            ...lesson,
            isLive: !lesson.isLive,
            liveAt: !lesson.isLive ? new Date().toISOString().split('T')[0] : undefined,
            assignedStudents: !lesson.isLive ? allStudents : [],
            studentProgress: !lesson.isLive ? allStudents.reduce((acc, studentId) => {
              acc[studentId] = {
                studentId,
                status: 'not_started'
              };
              return acc;
            }, {} as Record<string, StudentProgress>) : {}
          };
        }
        return lesson;
      })
    );
  }

  function handleCloseBuilder() {
    setOpenLessonId(null);
    setPendingLesson(null);
    setCurrentView('dashboard');
  }

  function handleLessonGenerated(lesson: Lesson) {
    setPendingLesson(lesson);
    setOpenLessonId(lesson.id);
    setIsLessonModalOpen(true); // Open in modal instead of navigating to builder page
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

  if (currentView === 'builder' && openLessonId && !isLessonModalOpen) {
    const lesson = pendingLesson || lessons.find((l) => l.id === openLessonId) || ENRICHMENT_LESSONS.find((l) => l.id === openLessonId)!;
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
                        <h2 className="text-2xl font-semibold text-slate-700">My Lessons</h2>
                      </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} onOpen={() => handleOpenLesson(lesson.id)} onToggleLive={handleToggleLessonLive} />
                ))}
              </div>
            </div>


            {/* AI Suggestions */}
            <div className="max-w-7xl mx-auto">
                      <div className="mb-6">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-semibold text-slate-700">AI Suggestions</h2>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">
                                AI generates lesson suggestions based on your curriculum progress and student needs. 
                                You must review and set lessons live before students can access them.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SuggestionCard 
                  title="Negative Exponents Practice"
                  reason="Band 2 students struggling"
                  standard="8.EE.A.1"
                  urgency="high"
                  timeEstimate="1 day"
                  agentContext={{
                    reasoning: "Based on student performance data from 'Integer Exponents and Their Properties' lesson: 4 out of 6 Band 2 students scored below 70% on negative exponent problems. Common errors include treating negative exponents as negative numbers.",
                    planning: "Created focused practice lesson that reinforces the pattern from positive to negative exponents, uses visual fraction models extensively, and includes error analysis of common mistakes.",
                    changes: "Generated targeted practice lesson with pattern recognition warm-up, visual fraction model exercises, common error identification activities, and graduated difficulty progression.",
                    agentPrompt: "Band 2 students are struggling with negative exponents in your recent lesson. Performance data shows 4 out of 6 students scored below 70%. I'm creating a targeted practice lesson with visual scaffolding to address these gaps immediately."
                  }}
                  onCreateLesson={handleCreateLessonFromSuggestion}
                />
                <SuggestionCard 
                  title="Introduction to Functions"
                  reason="Next logical step"
                  standard="8.F.A.1"
                  urgency="medium"
                  timeEstimate="2 days"
                  agentContext={{
                    reasoning: "Students have mastered linear equations and are ready for the next conceptual step. Functions build naturally on their understanding of input-output relationships from slope-intercept form.",
                    planning: "Created introductory functions lesson that connects to previous learning, uses familiar contexts, and introduces function notation gradually with visual support.",
                    changes: "Generated lesson with function machine concept, real-world examples (vending machines, temperature conversion), multiple representations (tables, graphs, equations), and practice identifying functions.",
                    agentPrompt: "Your students have mastered linear equations and are ready for functions as the next logical step. Curriculum pacing indicates this is the optimal time to introduce function concepts. I'm generating an introductory functions lesson that builds on their current understanding."
                  }}
                  onCreateLesson={handleCreateLessonFromSuggestion}
                />
                <SuggestionCard 
                  title="Unit Rate as Slope Review"
                  reason="Reteaching needed"
                  standard="8.EE.B.5"
                  urgency="high"
                  timeEstimate="1 day"
                  agentContext={{
                    reasoning: "Assessment data shows students are confusing unit rate and slope concepts. They need targeted review to solidify the connection between these related but distinct concepts.",
                    planning: "Created review lesson that explicitly connects unit rate to slope, uses visual comparisons, and provides practice distinguishing between the concepts in different contexts.",
                    changes: "Generated lesson with side-by-side comparisons, real-world scenarios (speed, cost per item), visual representations, and targeted practice problems addressing common misconceptions.",
                    agentPrompt: "Assessment data reveals confusion between unit rate and slope concepts among your students. This misconception requires immediate intervention. I'm creating a focused review lesson with visual comparisons to clarify these related but distinct concepts."
                  }}
                  onCreateLesson={handleCreateLessonFromSuggestion}
                />
                      </div>
                    </div>

                    {/* Extra Credit / Self-Learning Lessons */}
                    <div className="max-w-7xl mx-auto">
                      <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-slate-700">Enrichment Library</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ExtraCreditCard 
                          title="Introduction to Quadratic Functions"
                          description="Explore parabolas and their properties - a preview of Algebra 2 concepts with visual graphing."
                          difficulty="Advanced"
                          estimatedTime="45 min"
                          standard="A.REI.B.4"
                          availableFor="all"
                          isLive={true}
                          onOpenLesson={handleOpenEnrichmentLesson}
                        />
                        <ExtraCreditCard 
                          title="Basic Trigonometry Ratios"
                          description="Get a head start on high school geometry with sine, cosine, and tangent ratios."
                          difficulty="Challenging"
                          estimatedTime="60 min"
                          standard="G.SRT.C.6"
                          availableFor="all"
                          isLive={true}
                          onOpenLesson={handleOpenEnrichmentLesson}
                        />
                        <ExtraCreditCard 
                          title="Introduction to Calculus Ideas"
                          description="Explore the concept of rate of change and limits through visual examples and real-world scenarios."
                          difficulty="Advanced"
                          estimatedTime="50 min"
                          standard="HS.F-IF.B.4"
                          availableFor="all"
                          isLive={true}
                          onOpenLesson={handleOpenEnrichmentLesson}
                        />
                        <ExtraCreditCard 
                          title="Cryptography and Prime Numbers"
                          description="Discover how mathematics protects digital information through encryption and number theory."
                          difficulty="Challenging"
                          estimatedTime="40 min"
                          standard="N.RN.A.2"
                          availableFor="all"
                          isLive={true}
                          onOpenLesson={handleOpenEnrichmentLesson}
                        />
                        <ExtraCreditCard 
                          title="The Mathematics of Music"
                          description="Explore frequency ratios, sound waves, and how mathematical patterns create harmony."
                          difficulty="Intermediate"
                          estimatedTime="35 min"
                          standard="A.CED.A.2"
                          availableFor="all"
                          isLive={true}
                          onOpenLesson={handleOpenEnrichmentLesson}
                        />
                        <ExtraCreditCard 
                          title="Fractals and Infinite Patterns"
                          description="Discover self-similar patterns in nature and art through mathematical iteration and recursion."
                          difficulty="Intermediate"
                          estimatedTime="30 min"
                          standard="G.MG.A.3"
                          availableFor="all"
                          isLive={true}
                          onOpenLesson={handleOpenEnrichmentLesson}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
            
            {/* Lesson Modal */}
            {isLessonModalOpen && openLessonId && (
              <LessonModal
                lesson={pendingLesson || lessons.find((l) => l.id === openLessonId) || ENRICHMENT_LESSONS.find((l) => l.id === openLessonId)!}
                isOpen={isLessonModalOpen}
                onClose={handleCloseLessonModal}
                onSave={(patched) => {
                  if (pendingLesson) {
                    setPendingLesson(patched);
                  } else {
                    setLessons((prev) => prev.map((l) => (l.id === patched.id ? patched : l)));
                  }
                }}
              />
            )}
          </TooltipProvider>
        );
}

// -------------------- Lesson Creator Component --------------------
function LessonCreator({ onLessonGenerated }: { onLessonGenerated: (lesson: Lesson) => void }) {
  const [prompt, setPrompt] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string>('all');
  const [specificStudents, setSpecificStudents] = useState<string[]>([]);
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
    "Create a lesson using 8.F.B.4 for Emma, Marcus, and Zoe focusing on slope-intercept form with skateboard ramp examples...",
    "Design activities using 8.EE.C.8 for Band 3 students on solving systems of equations with real-world applications...",
    "Build practice problems using 8.G.B.7 for Alex and Sarah covering Pythagorean theorem through architecture connections...",
    "Generate materials using 8.EE.A.3 for Band 2 students teaching scientific notation with astronomy examples...",
    "Create differentiated content using 8.EE.B.5 for all students on proportional relationships through cooking scenarios..."
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
        <h1 className="text-4xl font-semibold mb-4 text-slate-700">Good evening, Mr. Morales.</h1>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Fused Textarea and Toolbar */}
        <div className="border-2 border-slate-200 rounded-2xl bg-white shadow-none">
          {/* Main Prompt */}
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            className="h-64 resize-none border-0 rounded-t-2xl focus-visible:ring-0 focus-visible:ring-offset-0 p-6 shadow-none bg-transparent !text-lg placeholder:text-lg text-slate-700 placeholder:text-slate-400"
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
                    index === selectedMentionIndex ? 'bg-slate-200 border-l-2 border-slate-300' : ''
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
                    <div className="font-medium text-slate-700 text-sm truncate">
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
          <div className="border-t border-slate-200 rounded-b-2xl">
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Students Selection */}
                <Select 
                  value={selectedStudents} 
                  onValueChange={(value) => setSelectedStudents(value)}
                >
                  <SelectTrigger className="h-8 text-xs border border-slate-300 bg-transparent shadow-none rounded-full pl-2 pr-3 w-auto justify-start gap-1">
                    <div className="flex items-center gap-1.5">
                      <UserGroupIcon className="h-4 w-4 text-slate-600" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All students</SelectItem>
                    <SelectItem value="band1">Band 1 students</SelectItem>
                    <SelectItem value="band2">Band 2 students</SelectItem>
                    <SelectItem value="band3">Band 3 students</SelectItem>
                    <SelectItem value="band4">Band 4 students</SelectItem>
                    <SelectItem value="selected">
                      {specificStudents.length > 0 ? `${specificStudents.length} selected` : 'Select individual students'}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Standards Selection */}
                <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                  <SelectTrigger className="h-8 text-xs border border-slate-300 bg-transparent shadow-none rounded-full pl-2 pr-3 w-auto justify-start gap-1">
                    <div className="flex items-center gap-1.5">
                      <AcademicCapIcon className="h-4 w-4 text-slate-600" />
                      <SelectValue placeholder="All standards" />
                    </div>
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
            <span className={index === items.length - 1 ? "text-slate-700 font-medium" : ""}>
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
    <div className="fixed left-0 top-0 h-screen w-16 bg-slate-100 border-r border-slate-200 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center justify-center p-4 border-b border-slate-200">
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
                ? 'bg-slate-200 text-slate-700' 
                : 'text-slate-600 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            <HomeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onNavigate('students')}
            className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
              currentView === 'students' 
                ? 'bg-slate-200 text-slate-700' 
                : 'text-slate-600 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UsersIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onNavigate('standards')}
            className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
              currentView === 'standards' 
                ? 'bg-slate-200 text-slate-700' 
                : 'text-slate-600 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            <StandardsIcon className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Profile Menu */}
      <div className="p-2 border-t border-slate-200">
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
  timeEstimate,
  agentContext,
  onCreateLesson
}: { 
  title: string; 
  reason: string; 
  standard: string; 
  urgency: 'high' | 'medium' | 'low';
  timeEstimate: string;
  agentContext?: {
    reasoning: string;
    planning: string;
    changes: string;
    agentPrompt: string;
  };
  onCreateLesson: (lesson: Lesson) => void;
}) {
  const urgencyVariant = urgency === 'high' ? 'destructive' : urgency === 'medium' ? 'default' : 'secondary';

  // Get appropriate icon for the reason
  const getReasonIcon = (reason: string) => {
    if (reason.includes('Next logical step') || reason.includes('Next')) {
      return <ArrowRightIcon className="h-4 w-4 text-gray-400" />;
    } else if (reason.includes('Builds on') || reason.includes('understanding')) {
      return <CubeIcon className="h-4 w-4 text-gray-400" />;
    } else if (reason.includes('struggling') || reason.includes('struggled')) {
      return <FaceFrownIcon className="h-4 w-4 text-gray-400" />;
    } else if (reason.includes('Reteaching') || reason.includes('reteaching')) {
      return <ArrowPathIcon className="h-4 w-4 text-gray-400" />;
    }
    return <CpuChipIcon className="h-4 w-4 text-gray-400" />; // Default AI icon
  };

  // Generate a summary with standards incorporated
  const getSummary = (title: string, standard: string) => {
    if (title.includes('Negative Exponents')) {
      return `Targeted practice for students struggling with negative exponents and scientific notation. Addresses ${standard}.`;
    } else if (title.includes('Introduction to Functions')) {
      return `Build understanding of functions as input-output relationships with visual representations. Covers ${standard}.`;
    } else if (title.includes('Unit Rate as Slope')) {
      return `Review and reinforce the connection between unit rate and slope in proportional relationships. Addresses ${standard}.`;
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

  const handleToggleLive = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log(`Toggle live status for suggestion: ${title}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log(`Delete suggestion: ${title}`);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log(`Duplicate suggestion: ${title}`);
  };

  const handleCardClick = () => {
    const agentChatHistory = agentContext ? [
      {
        id: `agent-${Date.now()}`,
        type: 'agent' as const,
        content: agentContext.agentPrompt,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        reasoning: undefined,
        summary: undefined,
        reasoningCollapsed: false,
        feedback: null
      },
      {
        id: `ai-response-${Date.now()}`,
        type: 'ai' as const,
        content: `I've successfully created the "${title}" lesson as directed by the Teaching Agent. The lesson is now ready for your review and can be deployed to students immediately.`,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 120000), // 2 minutes after agent
        reasoning: `${agentContext.reasoning}\n\n${agentContext.planning}\n\n${agentContext.changes}\n\nGenerated comprehensive lesson content based on Teaching Agent's directive. Content is structured, pedagogically sound, and ready for immediate deployment.`,
        summary: `Successfully executed Teaching Agent's directive to create "${title}" lesson. The lesson addresses identified student needs with appropriate scaffolding and is ready for teacher review and student deployment.`,
        reasoningCollapsed: true,
        feedback: null
      }
    ] : [];

    const newLesson: Lesson = {
      id: `ai-${Date.now()}`,
      title,
      subject: 'Mathematics',
      standards: [standard],
      updatedAt: new Date().toISOString(),
      efficacy: 0,
      isLive: false,
      assignedStudents: [],
      agentContext,
      chatHistory: agentChatHistory
    };
    
    // Create and open lesson
    onCreateLesson(newLesson);
  };

  return (
    <Card 
      className="cursor-pointer overflow-hidden border-2 border-slate-200 !bg-slate-100 shadow-none hover:border-slate-300 hover:bg-slate-200 transition-colors flex flex-col"
      onClick={handleCardClick}
    >
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Eyebrow - AI Suggestion */}
        <div className="flex items-center gap-1.5 mb-2">
          {getReasonIcon(reason)}
          <span className="text-xs text-slate-500">{reason}</span>
        </div>
        
        {/* Row 1 - Lesson Name */}
        <div className="mb-3">
          <CardTitle className="text-lg leading-snug text-slate-700">{title}</CardTitle>
        </div>
        
        {/* Row 2 - Lesson Description */}
        <div className="flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">{getSummary(title, standard)}</p>
        </div>

        {/* Row 3 - Actions */}
        <div className="flex items-center justify-between mt-4">
          {/* Live Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLive}
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-300"
            >
              <span className="inline-block h-3 w-3 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
            <span className="text-xs font-medium text-slate-500">Draft • Generated by AI</span>
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                title="More actions"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zM13 12a1 1 0 11-2 0 1 1 0 012 0zM20 12a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDuplicate}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate lesson
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete lesson
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
  availableFor,
  isLive = false,
  onOpenLesson
}: { 
  title: string; 
  description: string; 
  difficulty: string; 
  estimatedTime: string; 
  standard: string; 
  availableFor: string; 
  isLive?: boolean;
  onOpenLesson: (lesson: Lesson) => void;
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

  const handleToggleLive = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log(`Toggle live status for extra credit: ${title}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log(`Delete extra credit: ${title}`);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log(`Duplicate extra credit: ${title}`);
  };

  const handleCardClick = () => {
    // Find the existing enrichment lesson by title
    const existingLesson = ENRICHMENT_LESSONS.find(lesson => lesson.title === title);
    
    if (existingLesson) {
      // Open the existing enrichment lesson
      onOpenLesson(existingLesson);
    } else {
      console.warn(`No enrichment lesson found for: ${title}`);
    }
  };

  return (
    <Card 
      className="cursor-pointer overflow-hidden border-2 border-slate-200 !bg-slate-100 shadow-none hover:border-slate-300 hover:bg-slate-200 transition-colors flex flex-col"
      onClick={handleCardClick}
    >
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Eyebrow - Combined Standards and Students */}
        <div className="flex items-center gap-1 mb-3 text-xs text-slate-500">
          <AcademicCapIcon className="h-4 w-4 text-slate-600" />
          <span>Outside standards • All students</span>
        </div>

        {/* Row 1 - Lesson Name */}
        <div className="mb-3">
          <CardTitle className="text-lg leading-snug text-slate-700">{title}</CardTitle>
        </div>
        
        {/* Row 2 - Lesson Description */}
        <div className="flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>

        {/* Row 3 - Actions */}
        <div className="flex items-center justify-between mt-4">
          {/* Live Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLive}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                isLive ? 'bg-slate-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isLive ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-medium ${isLive ? 'text-slate-600' : 'text-slate-500'}`}>
              {isLive 
                ? `Live • ${title.includes('Advanced') ? '1' : 
                           title.includes('Trigonometry') ? '0' : 
                           title.includes('Modeling') ? '2' :
                           title.includes('Geometric') ? '0' :
                           title.includes('Calculus') ? '1' : '0'} of 10 viewing`
                : 'Draft • Last edited Dec 15'
              }
            </span>
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                title="More actions"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zM13 12a1 1 0 11-2 0 1 1 0 012 0zM20 12a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDuplicate}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate lesson
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete lesson
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------- Lesson Card --------------------
function LessonCard({ lesson, onOpen, onToggleLive }: { lesson: Lesson; onOpen: () => void; onToggleLive: (lessonId: string) => void }) {
  const { title, standards = [], updatedAt, isLive = false, completedCount = 0, assignedStudents = [], studentProgress = {} } = lesson;
  
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
  
  // Generate a clean summary without standards
  const getSummary = (title: string) => {
    if (title.includes('Integer Exponents')) {
      return `Master positive and negative exponents with pattern recognition, scientific notation, and real-world applications.`;
    } else if (title.includes('Proportional Relationships')) {
      return `Graph proportional relationships and interpret unit rate as slope through visual and algebraic methods.`;
    } else if (title.includes('Understanding Slope')) {
      return `Explore slope concepts using similar triangles and derive linear equations y = mx + b from geometric principles.`;
    }
    return `Multi-modal lesson with immersive content, slides, video, audio, and interactive assessments.`;
  };

  // Get student targeting for eyebrow
  const getStudentTargeting = () => {
    if (assignedStudents.length === CLASS_8A.students.length) {
      return 'All students';
    }
    
    // Check if it's a specific band by looking at the assigned students
    const assignedStudentObjects = CLASS_8A.students.filter(s => assignedStudents.includes(s.id));
    const bands = [...new Set(assignedStudentObjects.map(s => s.masteryBand))];
    
    if (bands.length === 1) {
      const band = bands[0];
      const bandNames = {
        1: 'Band 1 students',
        2: 'Band 2 students', 
        3: 'Band 3 students',
        4: 'Band 4 students'
      };
      return bandNames[band as keyof typeof bandNames] || `${assignedStudents.length} students`;
    }
    
    return `${assignedStudents.length} students`;
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

  const handleToggleLive = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onToggleLive(lesson.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log(`Delete lesson: ${lesson.id}`);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log(`Duplicate lesson: ${lesson.id}`);
  };

  return (
    <Card className="cursor-pointer overflow-hidden border-2 border-slate-200 !bg-slate-100 shadow-none hover:border-slate-300 hover:bg-slate-200 transition-colors flex flex-col" onClick={onOpen}>
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Eyebrow - Combined Standards and Students */}
        <div className="flex items-center gap-1.5 mb-2">
          <AcademicCapIcon className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500">
            {standards.length > 0 ? standards.join(', ') : 'No standards'} • {getStudentTargeting()}
          </span>
        </div>

        {/* Row 1 - Lesson Name */}
        <div className="mb-3">
          <CardTitle className="text-lg leading-snug text-slate-700">{title}</CardTitle>
        </div>
        
        {/* Row 2 - Lesson Description */}
        <div className="flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">{getSummary(title)}</p>
        </div>

        {/* Row 3 - Actions */}
        <div className="flex items-center justify-between mt-4">
          {/* Live Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLive}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                isLive ? 'bg-slate-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isLive ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-medium ${isLive ? 'text-slate-600' : 'text-slate-500'}`}>
              {isLive 
                ? (currentlyAccessing.length > 0 
                    ? `Live • ${currentlyAccessing.length} of ${assignedStudents.length} viewing`
                    : `Live • ${Object.keys(studentProgress).filter(id => studentProgress[id]?.status === 'completed').length} of ${assignedStudents.length} completed`
                  )
                : `Draft • Last edited ${updatedAt}`
              }
            </span>
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                title="More actions"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zM13 12a1 1 0 11-2 0 1 1 0 012 0zM20 12a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDuplicate}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate lesson
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete lesson
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-content-center font-semibold">
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
            <h1 className="text-3xl font-semibold mb-2">Your lesson is ready!</h1>
            <p className="text-xl text-neutral-600">Review the generated materials and publish when you're satisfied</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-3">{lesson.title}</h2>
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
    "Create materials using 8.EE.B.6 for Band 2 students on linear equations with cell phone plan examples...",
    "Design activities using 8.F.A.3 for Emma and Marcus covering slope-intercept form with skateboard ramps...",
    "Build practice problems using 8.EE.C.8 for all students on systems of equations with real-world scenarios...",
    "Generate visual content using 8.F.B.5 for Band 3 students on graphing linear functions with interactive examples..."
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
        `Understanding your intent:\n\nI'm analyzing your request for ${initialContext.selectedStudents === 'band2' ? 'Band 2 (developing) students' : initialContext.selectedStudents === 'band1' ? 'Band 1 (emerging) students' : initialContext.selectedStudents === 'band3' ? 'Band 3 (proficient) students' : initialContext.selectedStudents === 'band4' ? 'Band 4 (advanced) students' : 'all students'}, focusing on ${initialContext.selectedStandard !== 'all' ? initialContext.selectedStandard : 'auto-selected CCSS standards'}, and creating lesson materials with multiple modalities.`,
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
          <h1 className="text-4xl font-semibold mb-4 text-slate-700">Good evening, Mr. Morales.</h1>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="border-2 border-slate-200 rounded-2xl bg-white shadow-none">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              className="h-64 resize-none border-0 rounded-t-2xl focus-visible:ring-0 focus-visible:ring-offset-0 p-6 shadow-none bg-transparent !text-lg placeholder:text-lg text-slate-700 placeholder:text-slate-400"
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
                      index === selectedMentionIndex ? 'bg-slate-200 border-l-2 border-slate-300' : ''
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
                      
                      <div className="font-medium text-slate-700 text-sm truncate">
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
            <div className="border-t border-slate-200 rounded-b-2xl">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Students Selection */}
                  <Select value={selectedStudents} onValueChange={setSelectedStudents}>
                    <SelectTrigger className="h-8 text-xs border border-slate-300 bg-transparent shadow-none rounded-full pl-2 pr-3 w-auto justify-start gap-1">
                      <div className="flex items-center gap-1.5">
                        <UserGroupIcon className="h-4 w-4 text-slate-600" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All students</SelectItem>
                      <SelectItem value="band1">Band 1 students</SelectItem>
                      <SelectItem value="band2">Band 2 students</SelectItem>
                      <SelectItem value="band3">Band 3 students</SelectItem>
                      <SelectItem value="band4">Band 4 students</SelectItem>
                      <SelectItem value="selected">
                        {specificStudents.length > 0 ? `${specificStudents.length} selected` : 'Select individual students'}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Standards Selection */}
                  <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                    <SelectTrigger className="h-8 text-xs border border-slate-300 bg-transparent shadow-none rounded-full pl-2 pr-3 w-auto justify-start gap-1">
                      <div className="flex items-center gap-1.5">
                        <AcademicCapIcon className="h-4 w-4 text-slate-600" />
                        <SelectValue placeholder="All standards" />
                      </div>
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
    <div className={`h-full bg-slate-100 border-l border-slate-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-700">AI Assistant</h3>
      </div>

      {/* Chat Transcript */}
      <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
              {/* Original Prompt as First Message */}
              {initialPrompt && (
                <div className="flex justify-end items-end gap-2">
                  <div className="max-w-[80%] p-3 rounded-lg text-sm bg-slate-200 text-slate-700">
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
                <div className="w-full text-sm text-gray-700">
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
              <div className="w-full text-sm text-gray-700">
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
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end items-end gap-2' : message.type === 'agent' ? 'justify-end items-end gap-2' : 'justify-start'}`}>
                  {message.type === 'user' ? (
                    <>
                      <div className="max-w-[80%] p-3 rounded-lg text-sm bg-slate-200 text-slate-700">
                        {message.content}
                      </div>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="Teacher" />
                        <AvatarFallback>
                          <UserIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </>
                  ) : message.type === 'agent' ? (
                    <>
                      <div className="max-w-[80%] p-3 rounded-lg text-sm bg-blue-50 text-blue-800 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-blue-600">Teaching Agent</span>
                        </div>
                        {message.content}
                      </div>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-slate-600 text-white">
                          <AcademicCapIcon className="h-4 w-4" />
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
                      <div className="w-full text-sm text-gray-700">
                        {message.content}
                        {message.isStreaming && message.content && (
                          <span className="animate-pulse">|</span>
                        )}
                      </div>
                      
                      {/* Action buttons for each AI response */}
                      {!message.isStreaming && (
                        <div className="flex items-center gap-1 mt-3">
                        {/* Undo button - only show if this message applied changes */}
                        {message.id.startsWith('apply-') && undoStack.length > 0 && (
                          <button
                            onClick={() => onUndo()}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Undo changes"
                          >
                            <ArrowUturnLeftIcon className="w-5 h-5" />
                          </button>
                        )}
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
      <div className="p-4 border-t border-slate-200">
        {/* Active Section Chip */}
        {activeSection && (
          <div className="mb-3">
            <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 flex items-center gap-2 w-fit">
              Section: {activeSection}
              {onClearSection && (
                <button 
                  onClick={onClearSection}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              )}
            </span>
          </div>
        )}

        {/* Homepage-style Layout */}
        <div className="border-2 border-slate-200 rounded-2xl bg-white shadow-none">
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder={activeSection ? getSectionPlaceholder(activeSection) : "Ask AI to help with lesson..."}
            className="h-24 resize-none border-0 rounded-t-2xl focus-visible:ring-0 focus-visible:ring-offset-0 p-3 shadow-none bg-transparent text-sm placeholder:text-sm text-slate-700 placeholder:text-slate-400"
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
                    index === selectedMentionIndex ? 'bg-slate-200 border-l-2 border-slate-300' : ''
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
                    
                    <div className="font-medium text-slate-700 text-sm truncate">
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
          <div className="p-3 flex items-center justify-between border-t border-slate-200 rounded-b-2xl">
            <div className="flex items-center gap-2">
              {/* Students Selection */}
              <Select value={selectedStudents} onValueChange={setSelectedStudents}>
                <SelectTrigger className="h-8 text-xs border border-slate-300 bg-transparent shadow-none rounded-full pl-2 pr-3 w-auto justify-start gap-1">
                  <div className="flex items-center gap-1.5">
                    <UserGroupIcon className="h-4 w-4 text-slate-600" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All students</SelectItem>
                  <SelectItem value="band1">Band 1 students</SelectItem>
                  <SelectItem value="band2">Band 2 students</SelectItem>
                  <SelectItem value="band3">Band 3 students</SelectItem>
                  <SelectItem value="band4">Band 4 students</SelectItem>
                  <SelectItem value="specific">Select individual students</SelectItem>
                </SelectContent>
              </Select>

              {/* Standards Selection */}
              <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                <SelectTrigger className="h-8 text-xs border border-slate-300 bg-transparent shadow-none rounded-full pl-2 pr-3 w-auto justify-start gap-1">
                  <div className="flex items-center gap-1.5">
                    <AcademicCapIcon className="h-4 w-4 text-slate-600" />
                    <SelectValue placeholder="All standards" />
                  </div>
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
        <h3 className="font-semibold text-gray-700">AI Assistant</h3>
      </div>

      {/* Chat Transcript - Scrollable Middle Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        {chatHistory.length === 0 && !lesson.agentContext ? (
          <div className="text-center text-gray-500 text-sm">
            <p>Select "Improve with AI" on any section to start collaborating!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show agent context if available and no chat history */}
            {lesson.agentContext && chatHistory.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg text-sm bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">AI</span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">Your Teaching Agent</span>
                  </div>
                  <p className="text-blue-800">{lesson.agentContext.agentPrompt}</p>
                  <div className="mt-3 p-2 bg-white rounded border border-blue-100">
                    <div className="text-xs text-blue-600 mb-1">Generated Analysis:</div>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div><strong>Reasoning:</strong> {lesson.agentContext.reasoning}</div>
                      <div><strong>Planning:</strong> {lesson.agentContext.planning}</div>
                      <div><strong>Changes:</strong> {lesson.agentContext.changes}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {chatHistory.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end items-end gap-2' : message.type === 'agent' ? 'justify-end items-end gap-2' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.type === 'user' 
                    ? 'bg-slate-200 text-slate-700' 
                    : message.type === 'agent'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {message.type === 'agent' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-blue-600">Teaching Agent</span>
                    </div>
                  )}
                  {message.content}
                </div>
                {message.type === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="Teacher" />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                {message.type === 'agent' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-slate-600 text-white">
                      <AcademicCapIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="p-4 border-t border-slate-200">
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
            <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 flex items-center gap-1">
              Section: {activeSection}
              <button 
                onClick={onClearSection}
                className="ml-1 text-slate-500 hover:text-slate-700"
              >
                <XMarkIcon className="h-3 w-3" />
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
        <h3 className="font-semibold text-gray-700 mb-3">AI Assistant</h3>
        
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
            <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 flex items-center gap-1">
              Section: {activeSection}
              <button 
                onClick={onClearSection}
                className="ml-1 text-slate-500 hover:text-slate-700"
              >
                <XMarkIcon className="h-3 w-3" />
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
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end items-end gap-2' : message.type === 'agent' ? 'justify-end items-end gap-2' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.type === 'user' 
                    ? 'bg-slate-200 text-slate-700' 
                    : message.type === 'agent'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {message.type === 'agent' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-blue-600">Teaching Agent</span>
                    </div>
                  )}
                  {message.content}
                </div>
                {message.type === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="Teacher" />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                {message.type === 'agent' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-slate-600 text-white">
                      <AcademicCapIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
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
  isModal = false,
}: {
  lesson: Lesson;
  onClose: () => void;
  onSave: (l: Lesson) => void;
  isPending?: boolean;
  onConfirm?: () => void;
  onNavigate: (view: 'dashboard' | 'students' | 'standards') => void;
  isModal?: boolean;
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
  const [currentLesson, setCurrentLesson] = useState<Lesson>({
    ...lesson,
    isLive: lesson.isLive ?? false
  });
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    currentStep: 0,
    totalSteps: 6,
    currentModality: null
  });
  const [standardsFilter, setStandardsFilter] = useState("");
  
  // AI Chat Rail state
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date, reasoning?: string, summary?: string, reasoningCollapsed?: boolean, feedback?: 'positive' | 'negative' | null, isStreaming?: boolean}>>(lesson.chatHistory || []);
  const [undoStack, setUndoStack] = useState<Array<{sectionId: string, previousContent: string}>>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [contentVisible, setContentVisible] = useState(!isPending); // Hide content for new lessons until AI summary is shown
  const [introContent, setIntroContent] = useState({
    paragraph1: `Linear functions are mathematical relationships that create straight lines when graphed. The slope-intercept form, 
written as y = mx + b, is one of the most useful ways to express these relationships because it immediately shows 
us two key pieces of information: how steep the line is (slope) and where it crosses the y-axis (y-intercept).`,
    paragraph2: `This form appears everywhere in real life, from calculating costs to predicting growth patterns. Understanding 
slope-intercept form gives you a powerful tool for modeling and solving practical problems.`
  });

  // Auto-generate content on load and simulate initial generation for new lessons
  useEffect(() => {
    // Always generate content on load (for lesson preview)
    if (!generated.text) {
      handleGenerate();
    }
    
    // For new lessons (isPending), simulate the initial generation chat turn
    if (isPending && chatHistory.length === 0) {
      simulateInitialGeneration();
    }
  }, [chatHistory.length, isPending]);

  const simulateInitialGeneration = async () => {
    // Add the initial user prompt
    const userPrompt = lesson.prompt || "Create lesson materials for all students focusing on 8.NS.A.1 with multiple modalities";
    
    const initialUserMessage = {
      id: `msg-${Date.now()}`,
      type: 'user' as const,
      content: userPrompt,
      timestamp: new Date()
    };
    
    setChatHistory([initialUserMessage]);
    
    // Simulate AI processing with reasoning
    setTimeout(() => {
      const aiMessage = {
        id: `msg-${Date.now() + 1}`,
        type: 'ai' as const,
        content: "I've created comprehensive lesson materials on slope-intercept form (y = mx + b) tailored for your students. The content includes an introduction with conceptual foundation and clear explanations, visual representation with interactive coordinate plane and examples, formula components with breakdown of variables and constants, and real-world application using cell phone plan modeling example.\n\nReady to refine? Select \"Refine with AI\" on any section to start iterating, or ask me specific questions about the lesson content.",
        timestamp: new Date(),
        reasoning: "You want comprehensive lesson materials for slope-intercept form that cater to different learning preferences and provide multiple modalities for engagement.\n\nI planned an introduction to build conceptual foundation with clear explanations, visual elements with interactive coordinate plane and multiple examples, formula breakdown with detailed explanation of variables and constants, real-world applications like cell phone plans, and multiple modalities including text, visual, interactive, and practical components.\n\nI created lesson structure with differentiated content for visual, kinesthetic, and analytical learners, building from concrete examples to abstract understanding, then generated comprehensive lesson with introduction, visual representations, formula breakdown, and real-world applications. Content is now streaming to the lesson interface.",
        reasoningCollapsed: false, // Start with reasoning expanded
        feedback: null,
        isStreaming: true // Start as streaming
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      
      // Simulate reasoning streaming and then collapse
      setTimeout(() => {
        setChatHistory(prev => prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, isStreaming: false }
            : msg
        ));
        
        // Collapse reasoning after streaming is done
        setTimeout(() => {
          setChatHistory(prev => prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, reasoningCollapsed: true }
              : msg
          ));
          
          // Show content after reasoning collapses
          setTimeout(() => {
            setContentVisible(true);
          }, 300);
        }, 1000); // Wait 1 second before collapsing
      }, 2000); // Stream for 2 seconds
    }, 3000); // 3 second delay for AI processing
  };

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
- Support multiple learning preferences`
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

  /*
  TURN SYSTEM EXAMPLES:
  
  === SCENARIO 1: Creating New Lesson ===
  Teacher Input: "Create a lesson on negative exponents for my Band 2 students who are struggling"
  
  AI Response Structure:
  {
    reasoning: "Teacher wants remedial lesson for Band 2 students struggling with negative exponents. Need scaffolding, visual aids, and connection to positive exponents.",
    planning: "I planned pattern recognition from positive to negative, visual fraction models, scientific notation applications, graduated practice problems, and multi-modal content",
    changes: "I built lesson structure with introduction using pattern discovery, visual fraction bars, scientific notation examples, guided practice, independent practice with real-world contexts",
    streaming: "Creating introduction section... Adding visual examples... Generating practice problems... Building assessment components..."
  }
  
  === SCENARIO 2: Revising Existing Section ===
  Teacher Input: [Selects "Introduction" section] "Make this more engaging with a stronger hook"
  
  AI Response Structure:
  {
    reasoning: "Teacher wants improved introduction with stronger hook and real-world connections for 8th graders. Current intro lacks engagement and relevance.",
    planning: "I planned to open with familiar scenario like phone storage and social media, create immediate relevance, use conversational language, and build curiosity about negative exponents",
    changes: "I updated introduction with phone storage/data examples, conversational tone, real-world tech connections, and smooth transition to math concepts",
    streaming: "Revising introduction... Adding engaging hook... Connecting to student experiences... Updating examples..."
  }
  
  === SCENARIO 3: AI Suggestions (Implied History) ===
  Agent Context: "I noticed Band 2 students struggling with negative exponents. Based on performance data, they need targeted practice with visual scaffolding."
  
  Pre-generated Analysis:
  {
    reasoning: "Based on student performance data: 4/6 Band 2 students scored <70% on negative exponents. Common errors: treating negative exponents as negative numbers.",
    planning: "Created focused practice lesson with pattern reinforcement, visual fraction models, error analysis, immediate feedback, scientific notation connections.",
    changes: "Generated lesson with pattern recognition warm-up, visual exercises, error identification activities, graduated difficulty, real-world examples",
    status: "[ALREADY GENERATED] This lesson was created based on student performance patterns and is ready for customization."
  }
  */

  async function handleApplyEdit(sectionId: string, newContent: string) {
    // Store current content for undo
    const currentContent = getSectionContent(sectionId);
    setUndoStack(prev => [...prev, { sectionId, previousContent: currentContent }]);
    
    // Apply the actual content changes based on section
    if (sectionId === 'introduction') {
      // Generate improved introduction content based on the AI suggestion
      const improvedIntro = generateImprovedContent(sectionId, newContent, currentContent);
      setIntroContent(improvedIntro);
    }
    // Add more sections as needed (visual-representation, formula-components, etc.)
    
    // Add AI response to chat with reasoning and summary
    const reasoningContent = `You requested improvements to the "${sectionId}" section. I've analyzed the current content and your specific feedback to enhance readability and engagement.\n\nI planned improved vocabulary for Grade 8 comprehension level, enhanced sentence structure and flow, more engaging examples and connections, and maintained educational objectives and standards alignment.\n\nI updated the "${sectionId}" section with improved content that better serves your students' learning needs. The "${sectionId}" section has been updated and is now live in your lesson. Changes are immediately visible to students.`;

    const summaryContent = `I've successfully updated the "${sectionId}" section based on your feedback. The content has been enhanced for better student engagement and comprehension while maintaining alignment with learning objectives.

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
    setToast({message: `"${sectionId}" section updated! Undo available.`, type: 'success'});
    setTimeout(() => setToast(null), 3000);
  }

  function generateImprovedContent(sectionId: string, aiSuggestion: string, currentContent: string) {
    // Generate improved content based on AI suggestion
    if (sectionId === 'introduction') {
      // Create more engaging introduction based on the AI suggestion
      if (aiSuggestion.toLowerCase().includes('engaging') || aiSuggestion.toLowerCase().includes('hook')) {
        return {
          paragraph1: `Have you ever wondered how Uber calculates your ride cost? It starts with a base fee, then adds more money for each mile you travel. That's actually a perfect example of something called slope-intercept form: y = mx + b. This mathematical relationship appears everywhere in your daily life, from ride-sharing apps to phone plans to streaming subscriptions.`,
          paragraph2: `Today, we're going to unlock this powerful mathematical tool that will help you understand and predict patterns in the world around you. By the end of this lesson, you'll be able to spot slope-intercept relationships everywhere and use them to solve real problems that matter to you.`
        };
      } else if (aiSuggestion.toLowerCase().includes('simpler') || aiSuggestion.toLowerCase().includes('easier')) {
        return {
          paragraph1: `Linear functions are like recipes that always follow the same pattern. When you graph them, they make straight lines. The slope-intercept form (y = mx + b) is a special way to write these functions that immediately tells you two important things: how steep the line is and where it crosses the y-axis.`,
          paragraph2: `This form shows up in many real-life situations, like calculating costs or tracking growth. Learning slope-intercept form gives you a useful tool for understanding and solving everyday math problems.`
        };
      }
    }
    
    // Return current content if no specific improvement pattern is detected
    return typeof currentContent === 'object' ? currentContent : { paragraph1: currentContent, paragraph2: '' };
  }

  function handleUndo() {
    const lastEdit = undoStack[undoStack.length - 1];
    if (lastEdit) {
      // Restore previous content based on section
      if (lastEdit.sectionId === 'introduction') {
        const previousContent = typeof lastEdit.previousContent === 'object' 
          ? lastEdit.previousContent 
          : {
              paragraph1: `Linear functions are mathematical relationships that create straight lines when graphed. The slope-intercept form, 
              written as y = mx + b, is one of the most useful ways to express these relationships because it immediately shows 
              us two key pieces of information: how steep the line is (slope) and where it crosses the y-axis (y-intercept).`,
              paragraph2: `This form appears everywhere in real life, from calculating costs to predicting growth patterns. Understanding 
              slope-intercept form gives you a powerful tool for modeling and solving practical problems.`
            };
        setIntroContent(previousContent);
      }
      // Add more sections as needed
      
      setUndoStack(prev => prev.slice(0, -1));
      setToast({message: `Undid changes to "${lastEdit.sectionId}" section`, type: 'info'});
      setTimeout(() => setToast(null), 3000);
    }
  }

  function getSectionContent(sectionId: string): any {
    // Get the actual current content for the section
    if (sectionId === 'introduction') {
      return introContent;
    }
    // Add more sections as needed
    return `Current ${sectionId} content...`;
  }

  const handleToggleLive = () => {
    const allStudents = CLASS_8A.students.map(s => s.id);
    const updatedLesson: Lesson = {
      ...currentLesson,
      isLive: !currentLesson.isLive,
      liveAt: !currentLesson.isLive ? new Date().toISOString().split('T')[0] : undefined,
      assignedStudents: !currentLesson.isLive ? allStudents : [],
      studentProgress: !currentLesson.isLive ? allStudents.reduce((acc, studentId) => {
        acc[studentId] = {
          studentId,
          status: 'not_started'
        };
        return acc;
      }, {} as Record<string, StudentProgress>) : {}
    };
    
    setCurrentLesson(updatedLesson);
    onSave(updatedLesson);
    
    // Show success message
    setToast({
      message: updatedLesson.isLive 
        ? `Lesson is now live for all students!` 
        : `Lesson is no longer visible to students.`,
      type: 'success'
    });
    setTimeout(() => setToast(null), 3000);
  };

  const STD_OPTIONS = subject === "math" ? G8_MATH_STANDARDS : [];
  const filteredStandards = STD_OPTIONS.filter(std => 
    std.id.toLowerCase().includes(standardsFilter.toLowerCase()) ||
    std.label.toLowerCase().includes(standardsFilter.toLowerCase())
  );
  
  const selectedStandardObj = STD_OPTIONS.find(s => s.id === standard);
  const canGenerate = standardsMode === "auto" || !!standard;

  return (
    <TooltipProvider>
      <div className={`${isModal ? 'h-full bg-slate-50 text-foreground flex' : 'min-h-screen bg-slate-50 text-foreground flex'}`}>
        {!isModal && (
          <LeftSidebar currentView="builder" onNavigate={(view) => {
            if (view === 'dashboard') {
              onClose();
            } else {
              onNavigate(view);
            }
          }} />
        )}
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Breadcrumb - only show when not in modal */}
          {!isModal && (
            <div className="px-20 pt-4 pr-[580px]">
              <div className="max-w-4xl mx-auto">
                <Breadcrumb items={[
                  { label: "Home", onClick: () => onClose() },
                  { label: "Lesson Builder" }
                ]} />
              </div>
            </div>
          )}

          {/* Lesson Header */}
          <div className={`${isModal ? 'px-6 py-4' : 'px-20 py-4 pr-[580px]'}`}>
            <div className={`${isModal ? '' : 'max-w-4xl mx-auto'}`}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-slate-700">{title}</h1>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {/* Student Facepile - 3 viewers */}
                  {currentLesson.isLive && currentLesson.assignedStudents && currentLesson.assignedStudents.length > 0 && (
                    <div className="flex -space-x-2">
                      {currentLesson.assignedStudents.slice(0, 3).map((studentId, index) => {
                        const student = CLASS_8A.students.find(s => s.id === studentId);
                        if (!student) return null;
                        return (
                          <div
                            key={studentId}
                            className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden flex-shrink-0"
                            title={student.name}
                          >
                            {student.avatar ? (
                              <img 
                                src={student.avatar} 
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                                {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleLive}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                        currentLesson.isLive ? 'bg-slate-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          currentLesson.isLive ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-medium ${currentLesson.isLive ? 'text-slate-600' : 'text-slate-500'}`}>
                      {currentLesson.isLive ? '3 viewing' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Area */}
          <div className={`flex-1 ${isModal ? 'px-6 py-6 overflow-y-auto lesson-content-scroll' : 'px-20 py-6 pr-[580px]'}`}>
            <div className={`${isModal ? '' : 'max-w-4xl mx-auto'}`}>
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
                        ? 'bg-slate-200 text-slate-700'
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
              contentVisible={contentVisible}
            />
            </div>
          </div>
            </div>
          </div>
        </div>
        
        {/* Unified AI Assistant - Right Panel */}
        <div className={`${isModal ? 'w-[520px] border-l border-slate-200 bg-slate-100 flex-shrink-0' : 'fixed top-0 right-0 h-screen w-[500px] z-40'}`}>
        <UnifiedPromptComponent
          mode="refinement"
          initialPrompt={lesson.prompt || ''}
          initialContext={{
            selectedStudents: lesson.selectedStudents || 'all',
            specificStudents: lesson.specificStudents || [],
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
          <h1 className="text-4xl font-semibold mb-4 text-slate-700">Students</h1>
        </div>

        {/* Student Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => {
            const learningStyleInfo = LEARNING_STYLES[student.learningStyle as keyof typeof LEARNING_STYLES];
            
            return (
              <div key={student.id} className="overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-none rounded-xl">
                <div className="p-6 pb-4 bg-slate-100">
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
                      <div className="text-lg font-semibold text-slate-700">{student.name}</div>
                      <div className="text-sm text-slate-500">Band {student.masteryBand} • {learningStyleInfo.name} Learner</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -------------------- Standards Page --------------------
function StandardsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
      <h1 className="text-4xl font-semibold mb-8 text-slate-700">Grade 8 Mathematics Standards</h1>
      
      <div className="space-y-12">
        {/* Expressions & Equations Domain */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Expressions & Equations</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-medium mb-3 text-slate-600">Work with radicals and integer exponents</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium mb-2 text-slate-700">8.EE.A.1</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Know and apply the properties of integer exponents to generate equivalent numerical expressions. 
                    For example, 3² × 3⁻⁵ = 3⁻³ = 1/3³ = 1/27.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3 text-slate-600">Understand the connections between proportional relationships, lines, and linear equations</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium mb-2 text-slate-700">8.EE.B.5</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Graph proportional relationships, interpreting the unit rate as the slope of the graph. 
                    Compare two different proportional relationships represented in different ways. For example, 
                    compare a distance-time graph to a distance-time equation to determine which of two moving 
                    objects has greater speed.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2 text-slate-700">8.EE.B.6</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Use similar triangles to explain why the slope m is the same between any two distinct points 
                    on a non-vertical line in the coordinate plane; derive the equation y = mx for a line through 
                    the origin and the equation y = mx + b for a line intercepting the vertical axis at b.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Functions Domain */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Functions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-medium mb-3 text-slate-600">Define, evaluate, and compare functions</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium mb-2 text-slate-700">8.F.A.1</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Understand that a function is a rule that assigns to each input exactly one output. 
                    The graph of a function is the set of ordered pairs consisting of an input and the 
                    corresponding output.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3 text-slate-600">Use functions to model relationships between quantities</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium mb-2 text-slate-700">8.F.B.4</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Construct a function to model a linear relationship between two quantities. Determine the 
                    rate of change and initial value of the function from a description of a relationship or 
                    from two (x, y) values, including reading these from a table or from a graph. Interpret 
                    the rate of change and initial value of a linear function in terms of the situation it 
                    models, and in terms of its graph or a table of values.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mathematical Practices */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Standards for Mathematical Practice</h2>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-lg font-medium text-slate-700">MP1: Make sense of problems and persevere in solving them</h4>
              <p className="text-slate-600">Mathematically proficient students start by explaining to themselves the meaning of a problem and looking for entry points to its solution.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-slate-700">MP2: Reason abstractly and quantitatively</h4>
              <p className="text-slate-600">Mathematically proficient students make sense of quantities and their relationships in problem situations.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-slate-700">MP3: Construct viable arguments and critique the reasoning of others</h4>
              <p className="text-slate-600">Mathematically proficient students understand and use stated assumptions, definitions, and previously established results.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-slate-700">MP4: Model with mathematics</h4>
              <p className="text-slate-600">Mathematically proficient students can apply the mathematics they know to solve problems arising in everyday life.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-slate-700">MP5: Use appropriate tools strategically</h4>
              <p className="text-slate-600">Mathematically proficient students consider the available tools when solving a mathematical problem.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-slate-700">MP6: Attend to precision</h4>
              <p className="text-slate-600">Mathematically proficient students try to communicate precisely to others.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-slate-700">MP7: Look for and make use of structure</h4>
              <p className="text-slate-600">Mathematically proficient students look closely to discern a pattern or structure.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-slate-700">MP8: Look for and express regularity in repeated reasoning</h4>
              <p className="text-slate-600">Mathematically proficient students notice if calculations are repeated, and look both for general methods and for shortcuts.</p>
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
      <h3 className="text-xl font-semibold mb-4 text-gray-700">{title}</h3>
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

function ImmersiveTextContent({ onEditWithAI, activeSection, introContent, contentVisible = true }: { 
  onEditWithAI?: (sectionId: string, sectionTitle: string) => void;
  activeSection?: string | null;
  introContent?: {paragraph1: string, paragraph2: string};
  contentVisible?: boolean;
}) {
  
  // Show loading screen when content is not visible
  if (!contentVisible) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium mb-2">AI is generating lesson content...</p>
          <div className="bg-slate-100 rounded-lg p-4 text-left">
            <div className="text-xs text-slate-500 mb-2">Current Phase:</div>
            <div className="text-sm text-slate-700 font-medium mb-3">Making Changes</div>
            <div className="text-xs text-slate-500 leading-relaxed mb-3">
              Building lesson structure with introduction using pattern discovery • Adding visual fraction bar models • 
              Creating graduated practice problems with appropriate scaffolding
            </div>
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
              <span className="text-xs text-slate-500">Streaming content to lesson interface...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full">
      <div className="space-y-8">
        
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-semibold text-slate-700 mb-2">Understanding Slope-Intercept Form</h1>
          <p className="text-slate-600">Linear Functions in Algebra</p>
          <div className="text-sm text-slate-500 mt-2">
            Generated for Grade 8 Mathematics
          </div>
        </div>

        {/* Introduction */}
        <section className={`space-y-4 relative group rounded-lg transition-all duration-200 ${
          activeSection === 'introduction' 
            ? 'border-2 border-dashed border-slate-300 bg-slate-50/50 p-4' 
            : ''
        }`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-700">Introduction</h2>
            <div className="flex items-start gap-2">
              {onEditWithAI && (
                <button
                  onClick={() => onEditWithAI('introduction', 'Introduction')}
                  className={`transition-all duration-200 px-3 py-1.5 text-xs rounded-md font-medium flex-shrink-0 flex items-center gap-1 ${
                    activeSection === 'introduction'
                      ? 'bg-slate-300 text-slate-700 border border-slate-300'
                      : 'opacity-60 group-hover:opacity-100 bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-200 hover:border-slate-300'
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
        <section className={`space-y-4 relative group rounded-lg transition-all duration-200 ${
          activeSection === 'visual-representation' 
            ? 'border-2 border-dashed border-slate-300 bg-slate-50/50 p-4' 
            : ''
        }`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-700">Visual Representation</h2>
            <div className="flex items-start gap-2">
              {onEditWithAI && (
                <button
                  onClick={() => onEditWithAI('visual-representation', 'Visual Representation')}
                  className={`transition-all duration-200 px-3 py-1.5 text-xs rounded-md font-medium flex-shrink-0 flex items-center gap-1 ${
                    activeSection === 'visual-representation'
                      ? 'bg-slate-300 text-slate-700 border border-slate-300'
                      : 'opacity-60 group-hover:opacity-100 bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {activeSection === 'visual-representation' ? 'Targeted' : 'Refine with AI'}
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-8 text-center">
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
        <section className={`space-y-4 relative group rounded-lg transition-all duration-200 ${
          activeSection === 'formula-components' 
            ? 'border-2 border-dashed border-slate-300 bg-slate-50/50 p-4' 
            : ''
        }`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-700">Formula Components</h2>
            <div className="flex items-start gap-2">
              {onEditWithAI && (
                <button
                  onClick={() => onEditWithAI('formula-components', 'Formula Components')}
                  className={`transition-all duration-200 px-3 py-1.5 text-xs rounded-md font-medium flex-shrink-0 flex items-center gap-1 ${
                    activeSection === 'formula-components'
                      ? 'bg-slate-300 text-slate-700 border border-slate-300'
                      : 'opacity-60 group-hover:opacity-100 bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {activeSection === 'formula-components' ? 'Targeted' : 'Refine with AI'}
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-6">
            <div className="text-center mb-6">
              <span className="font-mono text-3xl text-slate-700">y = mx + b</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Variables</h4>
                <ul className="space-y-1 text-slate-600">
                  <li><span className="font-mono font-semibold">x</span> = input value (independent variable)</li>
                  <li><span className="font-mono font-semibold">y</span> = output value (dependent variable)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Constants</h4>
                <ul className="space-y-1 text-slate-600">
                  <li><span className="font-mono font-semibold">m</span> = slope (rate of change)</li>
                  <li><span className="font-mono font-semibold">b</span> = y-intercept (starting value)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Real-World Application */}
        <section className={`space-y-4 relative group rounded-lg transition-all duration-200 ${
          activeSection === 'real-world-application' 
            ? 'border-2 border-dashed border-slate-300 bg-slate-50/50 p-4' 
            : ''
        }`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-700">Real-World Application</h2>
            <div className="flex items-start gap-2">
              {onEditWithAI && (
                <button
                  onClick={() => onEditWithAI('real-world-application', 'Real-World Application')}
                  className={`transition-all duration-200 px-3 py-1.5 text-xs rounded-md font-medium flex-shrink-0 flex items-center gap-1 ${
                    activeSection === 'real-world-application'
                      ? 'bg-slate-300 text-slate-700 border border-slate-300'
                      : 'opacity-60 group-hover:opacity-100 bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {activeSection === 'real-world-application' ? 'Targeted' : 'Refine with AI'}
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-700 mb-3">
              Example: Cell Phone Plan
            </h3>
            <p className="text-slate-600 mb-4">
              A cell phone plan costs $25 per month plus $0.10 for each text message sent. 
              We can model the total monthly cost using slope-intercept form.
            </p>
            <div className="space-y-2 text-slate-600">
              <p><strong>Monthly fee:</strong> $25 (this is our y-intercept, b = 25)</p>
              <p><strong>Cost per text:</strong> $0.10 (this is our slope, m = 0.10)</p>
              <p><strong>Equation:</strong> <span className="font-mono font-semibold">y = 0.10x + 25</span></p>
            </div>
          </div>
        </section>

        {/* Personalized Quiz */}
        <section className={`space-y-4 relative group rounded-lg transition-all duration-200 ${
          activeSection === 'assessment' 
            ? 'border-2 border-dashed border-slate-300 bg-slate-50/50 p-4' 
            : ''
        }`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-700">Personalized Assessment</h2>
            <div className="flex items-start gap-2">
              {onEditWithAI && (
                <button
                  onClick={() => onEditWithAI('assessment', 'Personalized Assessment')}
                  className={`transition-all duration-200 px-3 py-1.5 text-xs rounded-md font-medium flex-shrink-0 flex items-center gap-1 ${
                    activeSection === 'assessment'
                      ? 'bg-slate-300 text-slate-700 border border-slate-300'
                      : 'opacity-60 group-hover:opacity-100 bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {activeSection === 'assessment' ? 'Targeted' : 'Refine with AI'}
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-6">
            <p className="text-sm text-slate-600 mb-6">
              Generated based on your learning profile
            </p>
            
            <div className="space-y-6">
              {/* Question 1 */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="font-medium text-slate-700 mb-3">1. What is the slope in the equation y = -3x + 7?</p>
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
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="font-medium text-slate-700 mb-3">2. A gym membership costs $40 to join plus $15 per month. Write the equation for total cost (y) after x months:</p>
                <input 
                  type="text" 
                  placeholder="y = "
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              {/* Question 3 */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="font-medium text-slate-700 mb-3">3. In the equation y = 4x + 12, what does the number 12 represent in a real-world context?</p>
                <textarea 
                  placeholder="Explain your reasoning..."
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
              <button className="text-slate-600 hover:text-slate-700 text-sm">
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
    <div className="h-full">
      <div className="space-y-6">
        
    {/* Slides Header */}
    <div className="border-b border-slate-200 pb-4">
      <h1 className="text-2xl font-semibold text-slate-700 mb-2">Understanding Slope-Intercept Form</h1>
      <p className="text-slate-600">Interactive Slide Presentation • 12 slides</p>
      <div className="flex gap-2 mt-2">
        <span className="inline-flex items-center px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-md">8.F.A.3</span>
        <span className="inline-flex items-center px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-md">8.F.B.4</span>
        <span className="inline-flex items-center px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-md">8.EE.B.6</span>
      </div>
    </div>

        {/* Slide Navigator */}
        <div className="flex items-center justify-between bg-slate-100 border-2 border-slate-200 rounded-2xl p-4">
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
            Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Slide</span>
            <select className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700">
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
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 aspect-video">
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-4xl font-semibold text-slate-700 mb-6 text-center">
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
        <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-700 mb-3">Speaker Notes</h3>
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
    <div className="h-full">
      <div className="space-y-6">
        
        {/* Video Header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-semibold text-slate-700 mb-2">Understanding Slope-Intercept Form</h1>
          <p className="text-slate-600">Educational Video • HD Quality</p>
        </div>

        {/* Video Player */}
        <div className="bg-slate-900 border-2 border-slate-200 rounded-2xl overflow-hidden">
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
        <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Video Chapters</h3>
          <div className="space-y-2">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-700 font-medium">1. Introduction to Linear Functions</span>
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
    <div className="h-full">
      <div className="space-y-6">
        
        {/* Audio Header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-semibold text-slate-700 mb-2">Understanding Slope-Intercept Form</h1>
          <p className="text-slate-600">Audio Lesson • Podcast Style</p>
        </div>

        {/* Audio Player */}
        <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">AI-Generated Audio Lesson</h3>
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
        <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Live Transcript</h3>
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
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center">
            <h4 className="font-semibold text-slate-700 mb-2">Playback Speed</h4>
            <select className="bg-white border border-slate-200 rounded px-3 py-1">
              <option>0.75x</option>
              <option selected>1x</option>
              <option>1.25x</option>
              <option>1.5x</option>
            </select>
          </div>
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center">
            <h4 className="font-semibold text-slate-700 mb-2">Captions</h4>
            <button className="bg-slate-700 text-white px-4 py-1 rounded">
              On
            </button>
          </div>
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center">
            <h4 className="font-semibold text-slate-700 mb-2">Download</h4>
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
  contentVisible = true,
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
  contentVisible?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content || "");
  const [showRegenerateInput, setShowRegenerateInput] = useState(false);
  const [regenerateTweak, setRegenerateTweak] = useState("");
  
  const hasContent = content && content !== "— Not generated yet —" && contentVisible;

  // Show immersive content for text modality
  if (modality === "text" && content && content !== "— Not generated yet —") {
    return <ImmersiveTextContent onEditWithAI={onEditWithAI} activeSection={activeSection} introContent={introContent} contentVisible={contentVisible} />;
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
  
  // Show loading screen when content is being generated
  if (!contentVisible && content && content !== "— Not generated yet —") {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Generating lesson materials...</p>
          <p className="text-slate-500 text-sm mt-2">Creating comprehensive content for your students</p>
        </div>
      </div>
    );
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

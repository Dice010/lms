"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Exam } from "@prisma/client";
import {
  getExams,
  getExamResults,
  submitExamResult,
} from "@/app/actions/exam-actions";

import {
  getClasses,
  enrollClass,
  unenrollClass,
  getEnrolledClasses,
} from "@/app/actions/course-actions";
import { getLessons } from "@/app/actions/lesson-actions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  BarChart2,
  CheckCircle,
  Clock,
  PlusCircle,
  Play,
  ChevronLeft,
  Users,
  Bell,
  FileText,
  ArrowRight,
  Bookmark,
  Loader2,
} from "lucide-react";

// --- DATA CÂU HỎI TRẮC NGHIỆM TẠM KHI DB RỖNG ---
interface QuestionOption {
  id: string;
  text: string;
}
interface ExamQuestion {
  id: number;
  content: string;
  correctOptionId: string;
  options: QuestionOption[];
}

const GENERIC_QUESTIONS: ExamQuestion[] = [
  {
    id: 1,
    content: "Câu 1: Bản chất cốt lõi của môn học này là gì?",
    correctOptionId: "A",
    options: [
      {
        id: "A",
        text: "A. Cung cấp kiến thức nền tảng và kỹ năng thực hành",
      },
      { id: "B", text: "B. Giải trí" },
      { id: "C", text: "C. Không có đáp án đúng" },
      { id: "D", text: "D. Tất cả đều sai" },
    ],
  },
  {
    id: 2,
    content: "Câu 2: Bạn cần làm gì để qua môn?",
    correctOptionId: "B",
    options: [
      { id: "A", text: "A. Bỏ học" },
      { id: "B", text: "B. Hoàn thành bài kiểm tra và bài tập đầy đủ" },
      { id: "C", text: "C. Chờ qua môn tự động" },
      { id: "D", text: "D. Ngủ" },
    ],
  },
];

// 🔥 KHỚP 100% VỚI SCHEMA.PRISMA (BẢNG CLASS)
interface DBClass {
  id: number;
  name: string;
  major: string;
  studentCount: number;
  maxCapacity: number;
  status: string;
  subjectCode: string;
  rejectReason: string | null;
  assignedTbm: string | null;
  assignedLecturer: string | null;
  createdAt: Date;
}

export interface DBLesson {
  id: number | string;
  title: string;
  courseId?: number;
  courseName?: string;
  content: string | null;
  status: string; // 🔥 THÊM STATUS VÀO ĐỂ FIX LỖI 2339
}

interface AvailableClass {
  id: number;
  code: string;
  name: string;
  teacher: string;
  schedule: string;
  slots: number;
  registered: number;
  enrolled: boolean;
  room: string;
  credits: number;
}

interface DynamicNotification {
  id: string;
  title: string;
  content: string;
  date: string;
}

type MainTab = "classes" | "my-classes" | "notifications" | "exams" | "grades";

// 🔥 NÂNG CẤP ĐỂ MAP VỚI CẤU TRÚC JSON CỦA GIẢNG VIÊN
interface TeacherQuestionItem {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
}

type StudentExamUI = Omit<Exam, "questionData"> & {
  studentStatus: "Chưa làm" | "Đã nộp";
  studentScore: number | null;
  // Lưu trữ nguyên mảng JSON từ DB lên
  questionData?: TeacherQuestionItem[] | string | null;
};

interface ExtendedSessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
  fullName?: string;
  role?: string;
}

// ============================================================================
// COMPONENT CHÍNH
// ============================================================================
export default function SinhVienDashboard() {
  const { data: session } = useSession();

  const sessionUser = session?.user as ExtendedSessionUser | undefined;
  const studentIdStr = sessionUser?.username || sessionUser?.name || "sinhvien";
  const studentName =
    sessionUser?.fullName || sessionUser?.name || "Sinh viên ẩn danh";

  // STATE LƯU DỮ LIỆU DB
  const [classes, setClasses] = useState<AvailableClass[]>([]);
  const [dynamicNotifications, setDynamicNotifications] = useState<
    DynamicNotification[]
  >([]);
  const [exams, setExams] = useState<StudentExamUI[]>([]);
  const [realLessons, setRealLessons] = useState<DBLesson[]>([]);

  // STATE UI
  const [activeTab, setActiveTab] = useState<MainTab>("classes");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingEnroll, setIsProcessingEnroll] = useState(false);

  const [showExamDialog, setShowExamDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<StudentExamUI | null>(null);
  const [showClassDetail, setShowClassDetail] = useState(false);
  const [selectedClass, setSelectedClass] = useState<AvailableClass | null>(
    null,
  );

  const [isTakingExam, setIsTakingExam] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentExamQuestions, setCurrentExamQuestions] = useState<
    ExamQuestion[]
  >([]);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showEnrollToast, setShowEnrollToast] = useState(false);

  const [insideClassLessons, setInsideClassLessons] =
    useState<AvailableClass | null>(null);
  const [readingLesson, setReadingLesson] = useState<DBLesson | null>(null);

  const loadDatabaseForStudent = useCallback(async () => {
    if (!studentIdStr) return;
    setIsLoading(true);

    try {
      const [dbClasses, enrolledIds] = await Promise.all([
        getClasses(),
        getEnrolledClasses(studentIdStr),
      ]);

      const validEnrolledIds: number[] = Array.isArray(enrolledIds)
        ? enrolledIds
        : [];

      const recruitingClasses = dbClasses
        .filter((c: unknown) => {
          const dbC = c as DBClass;
          return (
            dbC.status === "Đang tuyển" || validEnrolledIds.includes(dbC.id)
          );
        })
        .map((c: unknown) => {
          const dbC = c as DBClass;
          return {
            id: dbC.id,
            code: dbC.subjectCode,
            name: dbC.name,
            teacher: dbC.assignedLecturer || "Chưa phân công",
            schedule: "T2-T4 (Dự kiến)",
            slots: dbC.maxCapacity,
            registered: dbC.studentCount,
            enrolled: validEnrolledIds.includes(dbC.id),
            room: "Đang xếp phòng",
            credits: 3,
          };
        });

      setClasses(recruitingClasses);

      const notifications: DynamicNotification[] = [];
      const openClasses = recruitingClasses.filter(
        (c: AvailableClass) => !c.enrolled,
      );
      if (openClasses.length > 0) {
        notifications.push({
          id: "notif-1",
          title: "📢 Có lớp học mới đang mở đăng ký!",
          content: `Hệ thống vừa mở đăng ký cho ${openClasses.length} lớp học phần mới. Bạn vui lòng kiểm tra và ghi danh.`,
          date: new Date().toLocaleDateString("vi-VN"),
        });
      }
      setDynamicNotifications(notifications);

      const [dbExams, dbResults] = await Promise.all([
        getExams(),
        getExamResults(),
      ]);

      const publishedExams: StudentExamUI[] = dbExams
        .filter((e) => e.status === "Đã công bố")
        .map((exam) => {
          const myResult = dbResults.find(
            (r) => r.examTitle === exam.title && r.student === studentName,
          );
          return {
            ...exam,
            studentStatus: myResult ? "Đã nộp" : "Chưa làm",
            studentScore: myResult ? myResult.score : null,
          };
        });
      setExams(publishedExams);
    } catch (error) {
      console.error("Lỗi tải dữ liệu hệ thống DB:", error);
    } finally {
      setIsLoading(false);
    }
  }, [studentIdStr, studentName]);

  useEffect(() => {
    const initFetch = async () => {
      await loadDatabaseForStudent();
    };
    initFetch();
  }, [loadDatabaseForStudent]);

  // --- Handlers ---
  const handleEnroll = async (id: number) => {
    setIsProcessingEnroll(true);
    try {
      await enrollClass(id, studentIdStr);
      await loadDatabaseForStudent();
      setShowClassDetail(false);
      setShowEnrollToast(true);
      setTimeout(() => {
        setShowEnrollToast(false);
      }, 1500);
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsProcessingEnroll(false);
    }
  };

  const handleUnenroll = async (id: number) => {
    setIsProcessingEnroll(true);
    try {
      await unenrollClass(id, studentIdStr);
      await loadDatabaseForStudent();

      const remainingEnrolled = classes.filter(
        (c) => c.enrolled && c.id !== id,
      ).length;
      if (
        remainingEnrolled === 0 &&
        (activeTab === "exams" ||
          activeTab === "grades" ||
          activeTab === "my-classes")
      ) {
        setActiveTab("classes");
      }
      setShowClassDetail(false);
    } catch (error) {
      console.error("Lỗi hủy đăng ký:", error);
      alert("Hủy thất bại. Vui lòng thử lại.");
    } finally {
      setIsProcessingEnroll(false);
    }
  };

  const handleEnterClass = async (classData: AvailableClass) => {
    setInsideClassLessons(classData);
    try {
      const allLessons = await getLessons();
      const lessonsForThisClass = allLessons.filter(
        (l: DBLesson) =>
          (l.courseId === classData.id || l.courseName === classData.name) &&
          l.status === "Đã công bố" // 🔥 ĐÃ LỌC CÁC BÀI ĐƯỢC CÔNG BỐ THÀNH CÔNG
      );
      setRealLessons(lessonsForThisClass);
    } catch (error) {
      console.error("Lỗi lấy bài học thật:", error);
      setRealLessons([]);
    }
  };

  // 🔥 CHUẨN HÓA LOGIC BỐC ĐỀ THI TỪ DB
  const handleStartExam = () => {
    if (!selectedExam) return;

    let finalQuestions: ExamQuestion[] = GENERIC_QUESTIONS; // Mặc định nếu không có

    if (selectedExam.questionData) {
      try {
        // Ép kiểu để parse JSON nếu nó đang là chuỗi
        const parsedData: TeacherQuestionItem[] = 
            typeof selectedExam.questionData === 'string' 
            ? JSON.parse(selectedExam.questionData) 
            : selectedExam.questionData;
        
        // Map lại cấu trúc của Giảng viên thành cấu trúc của Sinh viên
        finalQuestions = parsedData.map((q, index) => ({
          id: index + 1,
          content: q.question,
          correctOptionId: q.answer,
          options: [
            { id: "A", text: `A. ${q.optionA}` },
            { id: "B", text: `B. ${q.optionB}` },
            { id: "C", text: `C. ${q.optionC}` },
            { id: "D", text: `D. ${q.optionD}` },
          ]
        }));
      } catch (error) {
         console.error("Lỗi parse cấu trúc đề thi từ DB:", error);
      }
    }

    setCurrentExamQuestions(finalQuestions);
    setShowExamDialog(false);
    setIsTakingExam(true);
    setAnswers({});
  };

  const handleSubmitExam = async () => {
    if (selectedExam) {
      let calculatedScore = 0;
      // Chia đều 10 điểm cho số câu hỏi
      const pointPerQuestion = 10 / currentExamQuestions.length; 

      currentExamQuestions.forEach((question) => {
        if (answers[question.id] === question.correctOptionId) {
          calculatedScore += pointPerQuestion;
        }
      });

      // Làm tròn điểm đến 1 chữ số thập phân
      calculatedScore = Math.round(calculatedScore * 10) / 10;

      try {
        await submitExamResult({
          examTitle: selectedExam.title,
          student: studentName, 
          score: calculatedScore,
        });

        setShowSuccessToast(true);
        setTimeout(() => {
          setIsTakingExam(false);
          setSelectedExam(null);
          setShowSuccessToast(false);
          loadDatabaseForStudent();
        }, 1500);
      } catch (error) {
        alert("Có lỗi khi nộp bài lên hệ thống!");
        console.error(error);
      }
    }
  };

  const enrolledCount = classes.filter((c) => c.enrolled).length;
  const pendingExams = exams.filter(
    (e) => e.studentStatus === "Chưa làm",
  ).length;
  const doneExams = exams.filter((e) => e.studentStatus === "Đã nộp").length;

  const calculateGPA = () => {
    if (doneExams === 0) return "—";
    const totalScore = exams.reduce(
      (acc, curr) => acc + (curr.studentScore || 0),
      0,
    );
    return (totalScore / doneExams).toFixed(1);
  };

  const stats = [
    {
      label: "Lớp đã đăng ký",
      value: enrolledCount,
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
    },
    {
      label: "Bài KT chưa làm",
      value: pendingExams,
      icon: <Clock className="h-5 w-5 text-amber-500" />,
    },
    {
      label: "Bài KT đã nộp",
      value: doneExams,
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    },
    {
      label: "Điểm TB tích lũy",
      value: calculateGPA(),
      icon: <BarChart2 className="h-5 w-5 text-purple-500" />,
    },
  ];

  if (isTakingExam && selectedExam) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 relative">
        {showSuccessToast && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white border-2 border-emerald-500 rounded-xl p-6 shadow-2xl max-w-sm w-full flex flex-col items-center text-center space-y-3">
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 animate-bounce">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-emerald-700">
                Đã nộp bài thành công
              </h3>
              <p className="text-sm text-slate-500">
                Hệ thống đã lưu kết quả của bạn...
              </p>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-lg border shadow-sm">
            <div>
              <button
                onClick={() => setIsTakingExam(false)}
                className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-3 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại
              </button>
              <h1 className="text-2xl font-bold text-slate-800">
                {selectedExam.title}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                Môn: {selectedExam.subject}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-md font-medium border border-blue-100">
              <Clock className="w-5 h-5" />{" "}
              <span> Thời gian: {selectedExam.duration} phút</span>
            </div>
          </div>
          <div className="space-y-6">
            {currentExamQuestions.map((question) => (
              <Card key={question.id} className="w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold leading-relaxed">
                    {question.content}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2">
                  {question.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() =>
                        setAnswers({ ...answers, [question.id]: opt.id })
                      }
                      className={`text-left p-3 rounded-lg border text-sm transition-all ${answers[question.id] === opt.id ? "border-blue-600 bg-blue-50 text-blue-700 font-medium" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2"
              onClick={handleSubmitExam}
            >
              {" "}
              Nộp Bài Thi{" "}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (readingLesson && insideClassLessons) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <button
                onClick={() => setReadingLesson(null)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium mb-2 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại lớp học
              </button>
              <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                Khóa học: {insideClassLessons.name}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">
                {readingLesson.title}
              </h1>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge className="bg-blue-600 text-white flex items-center gap-1 py-1.5 px-3">
                <Bookmark className="h-3 w-3" /> Bài học LMS
              </Badge>
            </div>
          </div>
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-800 text-white py-4">
              <CardTitle className="text-base md:text-lg font-bold">
                Nội dung bài giảng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5 bg-white">
              <div
                className="prose max-w-none text-slate-700"
                dangerouslySetInnerHTML={{
                  __html:
                    readingLesson.content ||
                    "<p>Chưa có nội dung chi tiết cho bài giảng này.</p>",
                }}
              />
            </CardContent>
          </Card>
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
            <span className="text-xs text-slate-400">Hoàn thành bài giảng</span>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setReadingLesson(null)}
            >
              Đã học xong <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (insideClassLessons) {
    const classExams = exams.filter(
      (e) =>
        e.subject === insideClassLessons.name ||
        e.subject === insideClassLessons.code,
    );

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-lg border shadow-sm">
            <div>
              <button
                onClick={() => setInsideClassLessons(null)}
                className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-3 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại lớp học của
                tôi
              </button>
              <h1 className="text-2xl font-bold text-slate-800">
                Lớp học: {insideClassLessons.name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Mã môn: {insideClassLessons.code} • Giảng viên:{" "}
                {insideClassLessons.teacher}
              </p>
            </div>
            <div className="mt-4 md:mt-0 bg-blue-50 text-blue-700 px-4 py-2 rounded-md font-medium border border-blue-100 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Hệ thống học tập DB
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border shadow-sm">
                <div className="bg-slate-100 px-4 py-3 border-b">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base">
                    Bài giảng được công bố (DB)
                  </h3>
                </div>
                <CardContent className="p-0 divide-y">
                  {realLessons.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      Giảng viên chưa công bố bài giảng nào cho lớp này.
                    </div>
                  ) : (
                    realLessons.map((lesson: DBLesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => setReadingLesson(lesson)}
                        className="p-4 flex items-start justify-between gap-4 hover:bg-blue-50/40 cursor-pointer transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-2 bg-blue-50 text-blue-600 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-blue-700">
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span className="text-blue-500 font-medium flex items-center gap-0.5">
                                Bấm để vào học{" "}
                                <ArrowRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {classExams.length > 0 && (
                <Card className="overflow-hidden border border-blue-200 shadow-sm">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                    <h3 className="font-bold text-blue-800 text-sm md:text-base flex items-center">
                      <ClipboardList className="w-4 h-4 mr-2" /> Bài Kiểm Tra
                      Của Lớp
                    </h3>
                  </div>
                  <CardContent className="p-0 divide-y">
                    {classExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50"
                      >
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">
                            {exam.title}
                          </h4>
                          <span className="text-xs text-slate-500 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" /> {exam.duration}{" "}
                            phút
                          </span>
                        </div>
                        {exam.studentStatus === "Chưa làm" ? (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowExamDialog(true);
                            }}
                          >
                            Làm bài
                          </Button>
                        ) : (
                          <Badge className="bg-emerald-500 text-white">
                            Đã nộp: {exam.studentScore}đ
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">
                    Chi tiết lớp
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3 text-slate-600">
                  <p>
                    <strong>Lịch học:</strong> {insideClassLessons.schedule}
                  </p>
                  <p>
                    <strong>Phòng học:</strong> {insideClassLessons.room}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* 🔥 FIX BUG: Phải render Dialog MỚI ở đây thì Sinh viên bấm Làm Bài trong Lớp học mới popup lên được */}
        <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Xác nhận làm bài</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-sm text-slate-600">
              Bạn chuẩn bị bắt đầu bài thi <strong>{selectedExam?.title}</strong>.
              <br />
              Thời gian làm bài: <strong>{selectedExam?.duration} phút</strong>.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExamDialog(false)}>
                Hủy
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleStartExam}
              >
                Bắt đầu làm bài
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 relative">
      {showEnrollToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-bounce">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">
            {" "}
            Đăng ký lớp học DB thành công!{" "}
          </span>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center space-x-3 bg-white p-6 rounded-lg border shadow-sm">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Trang Sinh Viên: {studentName}
            </h1>
            <p className="text-sm text-slate-500">
              Đăng ký Database thật, Bài thi thật & Bảng điểm cá nhân hóa
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-blue-600">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 font-medium">
              Đang tải dữ liệu lớp học...
            </span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((s) => (
                <Card key={s.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                    <CardTitle className="text-xs font-medium text-slate-500">
                      {s.label}
                    </CardTitle>
                    {s.icon}
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-3xl font-bold text-slate-800">
                      {s.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  {
                    key: "classes",
                    label: "Đăng Ký Lớp Học",
                    icon: <PlusCircle className="h-4 w-4" />,
                    visible: true,
                  },
                  {
                    key: "my-classes",
                    label: "Lớp học của tôi",
                    icon: <Users className="h-4 w-4" />,
                    visible: true,
                  },
                  {
                    key: "notifications",
                    label: "Thông báo",
                    icon: <Bell className="h-4 w-4" />,
                    visible: true,
                  },
                  {
                    key: "exams",
                    label: "Bài Kiểm Tra (DB)",
                    icon: <ClipboardList className="h-4 w-4" />,
                    visible: enrolledCount > 0,
                  },
                  {
                    key: "grades",
                    label: "Bảng Điểm",
                    icon: <BarChart2 className="h-4 w-4" />,
                    visible: enrolledCount > 0,
                  },
                ] as {
                  key: MainTab;
                  label: string;
                  icon: React.ReactNode;
                  visible: boolean;
                }[]
              )
                .filter((t) => t.visible)
                .map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === t.key ? "bg-blue-600 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}
                  >
                    {t.icon}
                    {t.label}
                    {t.key === "notifications" &&
                      dynamicNotifications.length > 0 && (
                        <Badge className="ml-1 bg-red-500 text-white px-1.5 py-0 min-w-4 h-4 flex items-center justify-center text-[10px] rounded-full">
                          {dynamicNotifications.length}
                        </Badge>
                      )}
                  </button>
                ))}
            </div>

            {activeTab === "classes" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Danh Sách Lớp Học Mở Đăng Ký
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {classes.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <p>Hiện tại không có lớp học nào đang mở đăng ký.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã Lớp</TableHead>
                          <TableHead>Học Phần</TableHead>
                          <TableHead>Giảng Viên</TableHead>
                          <TableHead>Lịch Học</TableHead>
                          <TableHead className="text-center">Sĩ Số</TableHead>
                          <TableHead className="text-center">
                            Trạng Thái
                          </TableHead>
                          <TableHead className="text-right">Thao Tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classes.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-mono text-xs">
                              {c.code}
                            </TableCell>
                            <TableCell className="font-semibold text-slate-800">
                              {c.name}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {c.teacher}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {c.schedule}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {c.registered}/{c.slots}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={c.enrolled ? "default" : "outline"}
                                className={
                                  c.enrolled ? "bg-emerald-500 text-white" : ""
                                }
                              >
                                {c.enrolled ? "Đã ghi danh DB" : "Đang tuyển"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedClass(c);
                                  setShowClassDetail(true);
                                }}
                              >
                                {" "}
                                Xem Chi Tiết{" "}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "my-classes" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Lớp Học Đã Đăng Ký
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enrolledCount === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Bạn chưa đăng ký tham gia lớp học nào.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {classes
                        .filter((c) => c.enrolled)
                        .map((c) => (
                          <div
                            key={c.id}
                            className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center"
                          >
                            <div>
                              <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-semibold">
                                {c.code}
                              </span>
                              <h4 className="font-bold text-slate-800 mt-1">
                                {c.name}
                              </h4>
                              <p className="text-sm text-slate-500 mt-1">
                                {c.teacher}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedClass(c);
                                  setShowClassDetail(true);
                                }}
                              >
                                {" "}
                                Chi tiết{" "}
                              </Button>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleEnterClass(c)}
                              >
                                {" "}
                                Vào học{" "}
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Thông Báo Hệ Thống
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dynamicNotifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Không có thông báo mới.
                    </div>
                  ) : (
                    dynamicNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-4 border rounded-lg flex gap-3"
                      >
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full h-fit">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-slate-800 text-sm">
                              {n.title}
                            </h4>
                            <span className="text-xs text-slate-400">
                              {n.date}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {n.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "exams" && enrolledCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Bài Kiểm Tra Học Phần (DB Thật)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên Bài Thi</TableHead>
                        <TableHead>Mã Môn</TableHead>
                        <TableHead>Thời Gian</TableHead>
                        <TableHead>Trạng Thái</TableHead>
                        <TableHead className="text-center">Điểm Số</TableHead>
                        <TableHead className="text-right">Hành Động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-6 text-slate-400"
                          >
                            Không có bài thi nào được công bố.
                          </TableCell>
                        </TableRow>
                      ) : (
                        exams.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="font-medium text-slate-800">
                              {e.title}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {e.subject}
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">
                              {e.duration} phút
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  e.studentStatus === "Đã nộp"
                                    ? "default"
                                    : "outline"
                                }
                                className={
                                  e.studentStatus === "Đã nộp"
                                    ? "bg-emerald-500 text-white"
                                    : "border-amber-500 text-amber-600"
                                }
                              >
                                {e.studentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-bold text-lg">
                              {e.studentScore !== null ? e.studentScore : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {e.studentStatus === "Chưa làm" ? (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => {
                                    setSelectedExam(e);
                                    setShowExamDialog(true);
                                  }}
                                >
                                  Làm bài <Play className="h-3 w-3 ml-1" />
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  Đã lưu điểm DB
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {activeTab === "grades" && enrolledCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Bảng Điểm Cá Nhân (Bảo Mật)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên Học Phần</TableHead>
                        <TableHead>Bài Kiểm Tra</TableHead>
                        <TableHead className="text-center">Điểm Số</TableHead>
                        <TableHead>Trạng Thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.filter((e) => e.studentStatus === "Đã nộp")
                        .length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-6 text-slate-400"
                          >
                            Bạn chưa có điểm số nào được ghi nhận.
                          </TableCell>
                        </TableRow>
                      ) : (
                        exams
                          .filter((e) => e.studentStatus === "Đã nộp")
                          .map((e) => (
                            <TableRow key={e.id}>
                              <TableCell className="font-medium text-slate-800">
                                {e.subject}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {e.title}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-lg font-bold text-emerald-600">
                                  {e.studentScore}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-emerald-500 text-white">
                                  Hoàn thành
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <Dialog open={showClassDetail} onOpenChange={setShowClassDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thông tin chi tiết lớp học</DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-4 text-sm py-2">
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {selectedClass.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mã học phần: {selectedClass.code}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border">
                <div>
                  <strong>Giảng viên:</strong> {selectedClass.teacher}
                </div>
                <div>
                  <strong>Phòng học:</strong> {selectedClass.room}
                </div>
                <div>
                  <strong>Lịch học:</strong> {selectedClass.schedule}
                </div>
                <div>
                  <strong>Trạng thái:</strong>{" "}
                  {selectedClass.enrolled ? "Đã ghi danh" : "Đang mở"}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClassDetail(false)}
              disabled={isProcessingEnroll}
            >
              {" "}
              Đóng{" "}
            </Button>
            {selectedClass && !selectedClass.enrolled && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleEnroll(selectedClass.id)}
                disabled={isProcessingEnroll}
              >
                {isProcessingEnroll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Đăng ký ngay"
                )}
              </Button>
            )}
            {selectedClass && selectedClass.enrolled && (
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => handleUnenroll(selectedClass.id)}
                disabled={isProcessingEnroll}
              >
                {isProcessingEnroll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Hủy đăng ký"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận làm bài</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600">
            Bạn chuẩn bị bắt đầu bài thi <strong>{selectedExam?.title}</strong>.
            <br />
            Thời gian làm bài: <strong>{selectedExam?.duration} phút</strong>.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExamDialog(false)}>
              {" "}
              Hủy{" "}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleStartExam}
            >
              Bắt đầu làm bài
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
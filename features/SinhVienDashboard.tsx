"use client";

import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge }  from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap, BookOpen, ClipboardList, BarChart2,
  CheckCircle, Clock, PlusCircle, Play, ChevronLeft,
  Users, Bell, Video, FileText, ArrowRight, Bookmark
} from "lucide-react";

// ------------------------------------
// Mock Data — Danh sách lớp học
// ------------------------------------
const fakeAvailableClasses = [
  { id: 1, code: "CS301-01", name: "Trí Tuệ Nhân Tạo", teacher: "GV Nguyễn Hữu Đức", schedule: "T2-T4 07:30", slots: 35, registered: 28, enrolled: false,
    room: "B301", credits: 3, startDate: "2025-09-01", endDate: "2025-12-20",
    timetable: [
      { day: "Thứ 2", time: "07:30 - 09:00", room: "B301" },
      { day: "Thứ 4", time: "07:30 - 09:00", room: "B301" },
    ]},
  { id: 3, code: "DS201-01", name: "Khoa Học Dữ Liệu", teacher: "GV Lê Thị Hoa", schedule: "T2-T6 13:30", slots: 30, registered: 15, enrolled: false,
    room: "C102", credits: 3, startDate: "2025-09-01", endDate: "2025-12-20",
    timetable: [
      { day: "Thứ 2", time: "13:30 - 15:00", room: "C102" },
      { day: "Thứ 6", time: "13:30 - 15:00", room: "C102" },
    ]},
  { id: 4, code: "NW102-01", name: "Mạng Máy Tính", teacher: "GV Phạm Quốc Bảo", schedule: "T4-T6 07:30", slots: 35, registered: 20, enrolled: false,
    room: "B205", credits: 3, startDate: "2025-09-01", endDate: "2025-12-20",
    timetable: [
      { day: "Thứ 4", time: "07:30 - 09:00", room: "B205" },
      { day: "Thứ 6", time: "07:30 - 09:00", room: "B205" },
    ]},
];

const fakeMyExams = [
  { id: 1, title: "Kiểm tra giữa kỳ - Khoa Học Dữ Liệu", subject: "DS201", duration: 60, openAt: "2025-06-15 08:00", status: "Đã nộp", score: 8.5 },
  { id: 2, title: "Quiz chương 2 - Mạng Máy Tính", subject: "NW102", duration: 20, openAt: "2025-06-20 10:00", status: "Đã nộp", score: 7.0 },
  { id: 3, title: "Kiểm tra cuối kỳ - Khoa Học Dữ Liệu", subject: "DS201", duration: 90, openAt: "2025-07-01 07:30", status: "Chưa làm", score: null },
  { id: 4, title: "Quiz Stack & Queue - Mạng", subject: "NW102", duration: 15, openAt: "2025-07-05 14:00", status: "Chưa làm", score: null },
];

const fakeGrades = [
  { id: 1, subject: "Khoa Học Dữ Liệu", code: "DS201", midterm: 8.5, final: null, avg: null, status: "Đang học" },
  { id: 2, subject: "Mạng Máy Tính", code: "NW102", midterm: 7.0, final: null, avg: null, status: "Đang học" },
  { id: 3, subject: "Lập Trình Java", code: "CS201", midterm: 9.0, final: 8.5, avg: 8.7, status: "Hoàn thành" },
  { id: 4, subject: "CTDL & Giải Thuật", code: "CS202", midterm: 6.5, final: 7.0, avg: 6.8, status: "Hoàn thành" },
];

const fakeNotifications = [
  { id: 1, title: "Thông báo đăng ký học phần", content: "Hệ thống đăng ký học phần học kỳ mới đã chính thức mở. Vui lòng hoàn thành trước thời hạn.", date: "03/07/2026" },
  { id: 2, title: "Cập nhật lịch thi", content: "Lịch kiểm tra điều kiện môn Trí Tuệ Nhân Tạo đã được dời sang tuần sau phòng B301.", date: "02/07/2026" },
];

const AI_LESSONS_DATA = [
  {
    chapter: "Chương 1: Tổng quan về Trí tuệ nhân tạo (AI)",
    lessons: [
      { id: "ai-1-1", title: "Bài 1: Khái niệm cơ bản và lịch sử phát triển của AI", type: "theory", duration: "45 phút", status: "Đã học" },
      { id: "ai-1-2", title: "Bài 2: Phân loại AI (Narrow AI, General AI và Super AI)", type: "video", duration: "30 phút", status: "Đã học" },
      { id: "ai-1-3", title: "Bài 3: Các lĩnh vực ứng dụng cốt lõi của AI trong đời sống", type: "document", duration: "20 phút", status: "Đang học" }
    ]
  },
  {
    chapter: "Chương 2: Học máy (Machine Learning) - Trái tim của AI",
    lessons: [
      { id: "ai-2-1", title: "Bài 1: Giới thiệu Học có giám sát (Supervised Learning)", type: "theory", duration: "60 phút", status: "Chưa học" }
    ]
  }
];

const DS_LESSONS_DATA = [
  {
    chapter: "Chương 1: Quy trình Khoa học Dữ liệu & Tiền xử lý dữ liệu",
    lessons: [
      { id: "ds-1-1", title: "Bài 1: Tổng quan về Data Science Lifecycle", type: "theory", duration: "45 phút", status: "Đã học" },
      { id: "ds-1-2", title: "Bài 2: Thao tác với thư viện Pandas trong Python", type: "video", duration: "40 phút", status: "Đã học" }
    ]
  }
];

const NW_LESSONS_DATA = [
  {
    chapter: "Chương 1: Kiến trúc Mạng Máy Tính & Mô hình Phân tầng",
    lessons: [
      { id: "nw-1-1", title: "Bài 1: Các kiến trúc mạng cơ bản và phân loại LAN/WAN", type: "theory", duration: "40 phút", status: "Đã học" },
      { id: "nw-1-2", title: "Bài 2: So sánh chi tiết mô hình OSI và mô hình TCP/IP", type: "video", duration: "50 phút", status: "Đã học" }
    ]
  }
];

const getLessonContentDetails = (lessonId: string, lessonTitle: string) => {
  switch (lessonId) {
    case "ai-1-1":
      return [
        {
          roman: "I. Định nghĩa cốt lõi về Trí Tuệ Nhân Tạo",
          points: [
            { label: "a. Khái niệm khoa học", text: "Trí tuệ nhân tạo (AI) là ngành khoa học máy tính liên quan đến việc tự động hóa các hành vi thông minh, giúp máy tính có khả năng tư duy, học hỏi và thích nghi như con người." },
            { label: "b. Phân biệt với thuật toán thông thường", text: "Thuật toán thông thường giải quyết bài toán theo quy tắc cố định được định nghĩa trước. AI sử dụng dữ liệu để tự tìm ra quy luật và đưa ra quyết định tối ưu." }
          ]
        },
        {
          roman: "II. Lịch sử hình thành và các giai đoạn phát triển",
          points: [
            { label: "a. Giai đoạn khởi đầu (1950 - 1970)", text: "Phép thử Turing (Turing Test) ra đời năm 1950 đặt nền móng định nghĩa thế nào là một cỗ máy có tư duy thông minh thực sự." },
            { label: "b. Kỷ nguyên bùng nổ của Học Sâu (2010 - Hiện nay)", text: "Sự phát triển vượt bậc của phần cứng tính toán (GPU) và lượng dữ liệu khổng lồ (Big Data) tạo điều kiện cho các mạng Neural nhân tạo nhiều lớp (Deep Learning) phát triển." }
          ]
        }
      ];
    case "ai-1-2":
      return [
        {
          roman: "I. Phân loại AI theo cấp độ năng lực trí tuệ",
          points: [
            { label: "a. Trí tuệ nhân tạo hẹp (Narrow AI)", text: "Hệ thống AI được huấn luyện và chỉ thực hiện tốt một nhiệm vụ cụ thể duy nhất (Ví dụ: Nhận diện khuôn mặt, trợ lý ảo Siri, xe tự lái)." },
            { label: "b. Trí tuệ nhân tạo tổng hợp (General AI)", text: "Hệ thống máy tính sở hữu năng lực trí tuệ toàn diện tương đương con người, có khả năng tự tư duy và giải quyết bất kỳ loại công việc nào." }
          ]
        },
        {
          roman: "II. Tương lai xa và khái niệm Siêu trí tuệ (Super AI)",
          points: [
            { label: "a. Điểm kỳ dị công nghệ (Singularity)", text: "Thời điểm trí tuệ nhân tạo vượt qua tổng trí tuệ của toàn bộ nhân loại, tự cải tiến với tốc độ không thể kiểm soát." },
            { label: "b. Thách thức kiểm soát đạo đức", text: "Yêu cầu xây dựng các bộ quy tắc cốt lõi đảm bảo hành vi của các siêu trí tuệ luôn đồng thuận với lợi ích sống còn của con người." }
          ]
        }
      ];
    case "ds-1-1":
      return [
        {
          roman: "I. Các bước trong vòng đời Khoa học Dữ liệu",
          points: [
            { label: "a. Thu thập dữ liệu thô", text: "Trích xuất thông tin từ nhiều nguồn đa dạng như hệ quản trị cơ sở dữ liệu SQL, API bên thứ ba hoặc cào dữ liệu tự động từ các trang web công cộng." },
            { label: "b. Khám phá dữ liệu (EDA)", text: "Sử dụng các phương pháp thống kê mô tả và biểu đồ trực quan để tìm hiểu phân phối, xu hướng và phát hiện các mối quan hệ ẩn giữa các biến dữ liệu." }
          ]
        },
        {
          roman: "II. Tiền xử lý dữ liệu trước khi huấn luyện mô hình",
          points: [
            { label: "a. Làm sạch dữ liệu khuyết thiếu", text: "Giải quyết các ô dữ liệu trống bằng phương pháp loại bỏ bản ghi lỗi hoặc điền giá trị thay thế bằng số trung bình, trung vị." },
            { label: "b. Chuẩn hóa thang đo (Scaling)", text: "Đưa các thuộc tính có đơn vị đo khác nhau về cùng một khoảng giá trị chuẩn để tăng tốc độ hội tụ và độ chính xác của các thuật toán học máy." }
          ]
        }
      ];
    default:
      return [
        {
          roman: "I. Cơ sở lý thuyết nền tảng",
          points: [
            { label: "a. Khái quát nội dung trọng tâm", text: `Nghiên cứu sâu các định lý, mô hình toán học và nguyên lý hoạt động cơ bản làm nền móng cho chuyên đề giảng dạy: "${lessonTitle}".` },
            { label: "b. Phân tích cấu trúc logic", text: "Thiết lập sơ đồ luồng dữ liệu, xác định các tham số đầu vào và kết quả đầu ra dự kiến của hệ thống." }
          ]
        },
        {
          roman: "II. Ứng dụng thực tiễn và Bài tập tình huống",
          points: [
            { label: "a. Triển khai trong dự án thực tế", text: `Cách thức áp dụng kiến thức của bài học "${lessonTitle}" vào việc tối ưu hóa quy trình phần mềm và xử lý dữ liệu doanh nghiệp.` },
            { label: "b. Các lỗi thường gặp và cách xử lý", text: "Tổng hợp các lỗi cú pháp, lỗi logic phổ biến khi triển khai thực tế cùng các giải pháp khắc phục nhanh chóng nhằm tăng hiệu năng." }
          ]
        }
      ];
  }
};

// 🚀 Đã sửa: Thêm interface rõ ràng cho Question để loại bỏ chữ 'any'
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

const DS_QUESTIONS: ExamQuestion[] = [
  { id: 1, content: "Câu 1: Bài toán Phân loại (Classification) thuộc nhóm học máy nào?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. Học có giám sát (Supervised Learning)" }, { id: "opt2", text: "B. Học không giám sát (Unsupervised Learning)" }, { id: "opt3", text: "C. Học bán giám sát (Semi-supervised Learning)" }, { id: "opt4", text: "D. Học tăng cường (Reinforcement Learning)" }
  ]},
  { id: 2, content: "Câu 2: K-means clustering là thuật toán dùng để giải quyết bài toán gì?", correctOptionId: "opt2", options: [
    { id: "opt1", text: "A. Phân loại (Classification)" }, { id: "opt2", text: "B. Phân cụm (Clustering)" }, { id: "opt3", text: "C. Hồi quy (Regression)" }, { id: "opt4", text: "D. Giảm chiều dữ liệu (Dimensionality Reduction)" }
  ]}
];

const SQ_QUESTIONS: ExamQuestion[] = [
  { id: 1, content: "Câu 1: Cấu trúc dữ liệu Stack (Ngăn xếp) hoạt động theo nguyên tắc nào?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. LIFO (Last In First Out)" }, { id: "opt2", text: "B. FIFO (First In First Out)" }, { id: "opt3", text: "C. FILO (First In Last Out)" }, { id: "opt4", text: "D. Cả A và C đều đúng" }
  ]},
  { id: 2, content: "Câu 2: Cấu trúc dữ liệu Queue (Hàng đợi) hoạt động theo nguyên tắc nào?", correctOptionId: "opt2", options: [
    { id: "opt1", text: "A. LIFO (Last In First Out)" }, { id: "opt2", text: "B. FIFO (First In First Out)" }, { id: "opt3", text: "C. LILO (Last In Last Out)" }, { id: "opt4", text: "D. Không có nguyên tắc cụ thể" }
  ]}
];

const GENERIC_QUESTIONS: ExamQuestion[] = [{ id: 1, content: "Câu hỏi hệ thống đang cập nhật...", correctOptionId: "opt1", options: [{ id: "opt1", text: "Đang cập nhật" }]}];

type AvailableClass = (typeof fakeAvailableClasses)[0];
type MyExam         = (typeof fakeMyExams)[0];
type MainTab        = "classes" | "my-classes" | "notifications" | "exams" | "grades";

export default function SinhVienDashboard() {
  const [classes, setClasses]     = useState<AvailableClass[]>(fakeAvailableClasses);
  const [exams, setExams]         = useState<MyExam[]>(fakeMyExams);
  const [activeTab, setActiveTab] = useState<MainTab>("classes");

  const [showExamDialog, setShowExamDialog]   = useState(false);
  const [selectedExam, setSelectedExam]       = useState<MyExam | null>(null);
  const [showClassDetail, setShowClassDetail] = useState(false);
  const [selectedClass, setSelectedClass]     = useState<AvailableClass | null>(null);

  const [isTakingExam, setIsTakingExam]       = useState(false);
  const [answers, setAnswers]                 = useState<Record<number, string>>({});
  
  // 🚀 Đã sửa: Truyền Type ExamQuestion vào đây thay vì any
  const [currentExamQuestions, setCurrentExamQuestions] = useState<ExamQuestion[]>([]);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showEnrollToast, setShowEnrollToast] = useState(false);

  const [insideClassLessons, setInsideClassLessons] = useState<AvailableClass | null>(null);
  const [readingLesson, setReadingLesson] = useState<{ id: string; title: string; type: string } | null>(null);

  const handleEnroll = (id: number) => {
    setClasses(classes.map(c => c.id === id ? { ...c, enrolled: true, registered: c.registered + 1 } : c));
    setShowClassDetail(false);
    setShowEnrollToast(true);
    setTimeout(() => { setShowEnrollToast(false); }, 1500);
  };

  const handleUnenroll = (id: number) => {
    const updatedClasses = classes.map(c => c.id === id ? { ...c, enrolled: false, registered: c.registered - 1 } : c);
    setClasses(updatedClasses);
    const checkEnrolled = updatedClasses.filter(c => c.enrolled).length;
    if (checkEnrolled === 0 && (activeTab === "exams" || activeTab === "grades")) {
      setActiveTab("classes");
    }
    setShowClassDetail(false);
  };

  const handleStartExam = () => {
    if (selectedExam?.id === 3) {
      setCurrentExamQuestions(DS_QUESTIONS);
    } else if (selectedExam?.id === 4) {
      setCurrentExamQuestions(SQ_QUESTIONS);
    } else {
      setCurrentExamQuestions(GENERIC_QUESTIONS);
    }
    setShowExamDialog(false);
    setIsTakingExam(true);
    setAnswers({});
  };

  const handleSubmitExam = () => {
    if (selectedExam) {
      let calculatedScore = 0;
      currentExamQuestions.forEach(question => {
        if (answers[question.id] === question.correctOptionId) {
          calculatedScore += 5;
        }
      });
      setExams(exams.map(e => e.id === selectedExam.id ? { ...e, status: "Đã nộp", score: calculatedScore } : e));
    }
    setShowSuccessToast(true);
    setTimeout(() => {
      setIsTakingExam(false);
      setSelectedExam(null);
      setShowSuccessToast(false);
    }, 1500);
  };

  const enrolledCount = classes.filter(c => c.enrolled).length;
  const pendingExams  = exams.filter(e => e.status === "Chưa làm").length;
  const doneExams     = exams.filter(e => e.status === "Đã nộp").length;
  const completedAvg  = fakeGrades.filter(g => g.avg !== null);
  const avgScore      = completedAvg.length
    ? completedAvg.reduce((sum, g) => sum + (g.avg ?? 0), 0) / completedAvg.length
    : 0;

  const stats = [
    { label: "Lớp đã đăng ký",   value: enrolledCount,       icon: <BookOpen      className="h-5 w-5 text-blue-500"    /> },
    { label: "Bài KT chưa làm",  value: pendingExams,        icon: <Clock         className="h-5 w-5 text-amber-500"   /> },
    { label: "Bài KT đã nộp",    value: doneExams,           icon: <CheckCircle   className="h-5 w-5 text-emerald-500" /> },
    { label: "Điểm TB tích lũy", value: avgScore.toFixed(1), icon: <BarChart2     className="h-5 w-5 text-purple-500"  /> },
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
              <h3 className="text-xl font-bold text-emerald-700">Đã nộp bài thành công</h3>
              <p className="text-sm text-slate-500">Hệ thống đang lưu kết quả và tính toán điểm số...</p>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-lg border shadow-sm">
            <div>
              <button onClick={() => setIsTakingExam(false)} className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-3 transition-colors">
                <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại
              </button>
              <h1 className="text-2xl font-bold text-slate-800">{selectedExam.title}</h1>
              <p className="text-slate-500 mt-1 text-sm">Môn: {selectedExam.subject}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-md font-medium border border-blue-100">
              <Clock className="w-5 h-5" /> <span> Thời gian: {selectedExam.duration} phút</span>
            </div>
          </div>

          <div className="space-y-6">
            {currentExamQuestions.map((question) => (
              <Card key={question.id} className="w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold leading-relaxed">{question.content}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2">
                  {/* 🚀 Đã sửa: Xóa dòng (opt: any) nguy hiểm, TypeScript sẽ tự nhận diện */}
                  {question.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers({ ...answers, [question.id]: opt.id })}
                      className={`text-left p-3 rounded-lg border text-sm transition-all ${
                        answers[question.id] === opt.id
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2" onClick={handleSubmitExam}>
              Nộp Bài Thi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (readingLesson && insideClassLessons) {
    const lessonContent = getLessonContentDetails(readingLesson.id, readingLesson.title);

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <button 
                onClick={() => setReadingLesson(null)} 
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium mb-2 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại danh sách bài học
              </button>
              <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                Khóa học: {insideClassLessons.name}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">{readingLesson.title}</h1>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge className="bg-blue-600 text-white flex items-center gap-1 py-1.5 px-3">
                <Bookmark className="h-3 w-3" /> Tài liệu học tập LMS
              </Badge>
            </div>
          </div>

          <div className="space-y-6">
            {lessonContent.map((section, idx) => (
              <Card key={idx} className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-800 text-white py-4">
                  <CardTitle className="text-base md:text-lg font-bold">
                    {section.roman}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5 bg-white">
                  {section.points.map((pt, pIdx) => (
                    <div key={pIdx} className="space-y-1.5 border-l-4 border-blue-500 pl-4 py-0.5 hover:bg-slate-50 transition-colors">
                      <h4 className="text-sm md:text-base font-bold text-blue-700">
                        {pt.label}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed text-justify">
                        {pt.text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
            <span className="text-xs text-slate-400">Đọc kỹ kiến thức trước khi đóng trang tài liệu</span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setReadingLesson(null)}>
              Đã học xong <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (insideClassLessons) {
    const lessonsData = insideClassLessons.code === "CS301-01" ? AI_LESSONS_DATA :
                        insideClassLessons.code === "DS201-01" ? DS_LESSONS_DATA :
                        insideClassLessons.code === "NW102-01" ? NW_LESSONS_DATA : [];

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-lg border shadow-sm">
            <div>
              <button 
                onClick={() => setInsideClassLessons(null)} 
                className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-3 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại lớp học của tôi
              </button>
              <h1 className="text-2xl font-bold text-slate-800">Lớp học: {insideClassLessons.name}</h1>
              <p className="text-sm text-slate-500 mt-1">Mã môn: {insideClassLessons.code} • Giảng viên: {insideClassLessons.teacher}</p>
            </div>
            <div className="mt-4 md:mt-0 bg-blue-50 text-blue-700 px-4 py-2 rounded-md font-medium border border-blue-100 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Giáo trình & Bài học điện tử
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {lessonsData.length === 0 ? (
                <div className="text-center p-8 border bg-white rounded-lg text-slate-400 text-sm">Chưa có bài giảng nào được cập nhật cho lớp học này.</div>
              ) : (
                lessonsData.map((chapterData, cIdx) => (
                  <Card key={cIdx} className="overflow-hidden border shadow-sm">
                    <div className="bg-slate-100 px-4 py-3 border-b">
                      <h3 className="font-bold text-slate-800 text-sm md:text-base">{chapterData.chapter}</h3>
                    </div>
                    <CardContent className="p-0 divide-y">
                      {chapterData.lessons.map((lesson) => (
                        <div 
                          key={lesson.id} 
                          onClick={() => setReadingLesson(lesson)}
                          className="p-4 flex items-start justify-between gap-4 hover:bg-blue-50/40 cursor-pointer transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-2 bg-blue-50 text-blue-600 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {lesson.type === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-blue-700 transition-colors">
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration}</span>
                                <span>•</span>
                                <span className="text-blue-500 font-medium flex items-center gap-0.5">Bấm để vào học <ArrowRight className="h-3 w-3" /></span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Badge variant={lesson.status === "Đã học" ? "default" : lesson.status === "Đang học" ? "secondary" : "outline"} className={lesson.status === "Đã học" ? "bg-emerald-500 text-white" : ""} >
                              {lesson.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm font-bold">Chi tiết lớp</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-3 text-slate-600">
                  <p><strong>Lịch học:</strong> {insideClassLessons.schedule}</p>
                  <p><strong>Phòng học:</strong> {insideClassLessons.room}</p>
                  <p><strong>Tín chỉ:</strong> {insideClassLessons.credits} tín chỉ</p>
                  <p><strong>Thời gian khóa học:</strong> {insideClassLessons.startDate} đến {insideClassLessons.endDate}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 relative">
      {showEnrollToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-bounce">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium"> Đăng ký lớp học thành công! </span>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center space-x-3 bg-white p-6 rounded-lg border shadow-sm">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Trang Sinh Viên</h1>
            <p className="text-sm text-slate-500">Đăng ký lớp học, làm bài kiểm tra & xem bảng điểm</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(s => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-slate-500">{s.label}</CardTitle>
                {s.icon}
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-3xl font-bold text-slate-800">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {([
            { key: "classes", label: "Đăng Ký Lớp Học", icon: <PlusCircle className="h-4 w-4" />, visible: true },
            { key: "my-classes", label: "Lớp học của tôi", icon: <Users className="h-4 w-4" />, visible: true },
            { key: "notifications", label: "Thông báo", icon: <Bell className="h-4 w-4" />, visible: true },
            { key: "exams", label: "Bài Kiểm Tra", icon: <ClipboardList className="h-4 w-4" />, visible: enrolledCount > 0 },
            { key: "grades", label: "Bảng Điểm", icon: <BarChart2 className="h-4 w-4" />, visible: enrolledCount > 0 },
          ] as { key: MainTab; label: string; icon: React.ReactNode; visible: boolean }[])
            .filter(t => t.visible)
            .map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${ activeTab === t.key ? "bg-blue-600 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200" }`}>
                {t.icon}{t.label}
              </button>
          ))}
        </div>

        {activeTab === "classes" && (
          <Card>
            <CardHeader><CardTitle className="text-base">Danh Sách Lớp Học Mở Đăng Ký</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã Lớp</TableHead>
                    <TableHead>Học Phần</TableHead>
                    <TableHead>Giảng Viên</TableHead>
                    <TableHead>Lịch Học</TableHead>
                    <TableHead className="text-center">Sĩ Số</TableHead>
                    <TableHead className="text-center">Trạng Thái</TableHead>
                    <TableHead className="text-right">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.code}</TableCell>
                      <TableCell className="font-semibold text-slate-800">{c.name}</TableCell>
                      <TableCell className="text-sm text-slate-600">{c.teacher}</TableCell>
                      <TableCell className="text-xs text-slate-500">{c.schedule}</TableCell>
                      <TableCell className="text-center text-sm">{c.registered}/{c.slots}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={c.enrolled ? "default" : "outline"} className={c.enrolled ? "bg-emerald-500 text-white" : ""}>
                          {c.enrolled ? "Đã chọn" : "Trống"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedClass(c); setShowClassDetail(true); }}> Xem Chi Tiết </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "my-classes" && (
          <Card>
            <CardHeader><CardTitle className="text-base">Lớp Học Đã Đăng Ký</CardTitle></CardHeader>
            <CardContent>
              {enrolledCount === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">Bạn chưa đăng ký tham gia lớp học nào.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.filter(c => c.enrolled).map(c => (
                    <div key={c.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
                      <div>
                        <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-semibold">{c.code}</span>
                        <h4 className="font-bold text-slate-800 mt-1">{c.name}</h4>
                        <p className="text-sm text-slate-500 mt-1">{c.teacher}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedClass(c); setShowClassDetail(true); }}> Chi tiết </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setInsideClassLessons(c)}> Vào học </Button>
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
            <CardHeader><CardTitle className="text-base">Thông Báo Hệ Thống</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {fakeNotifications.map(n => (
                <div key={n.id} className="p-4 border rounded-lg flex gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-full h-fit"><Bell className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-slate-800 text-sm">{n.title}</h4>
                      <span className="text-xs text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{n.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "exams" && enrolledCount > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Bài Kiểm Tra Học Phần</CardTitle></CardHeader>
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
                  {exams.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium text-slate-800">{e.title}</TableCell>
                      <TableCell className="font-mono text-xs">{e.subject}</TableCell>
                      <TableCell className="text-sm text-slate-500">{e.duration} phút</TableCell>
                      <TableCell>
                        <Badge variant={e.status === "Đã nộp" ? "default" : "outline"} className={e.status === "Đã nộp" ? "bg-emerald-500 text-white" : "border-amber-500 text-amber-600"}>
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold">{e.score !== null ? e.score : "—"}</TableCell>
                      <TableCell className="text-right">
                        {e.status === "Chưa làm" ? (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setSelectedExam(e); setShowExamDialog(true); }}>
                            Làm bài <Play className="h-3 w-3 ml-1" />
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">Đã hoàn thành</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "grades" && enrolledCount > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Bảng Điểm Học Tập</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên Học Phần</TableHead>
                    <TableHead>Mã Môn</TableHead>
                    <TableHead className="text-center">Giữa Kỳ</TableHead>
                    <TableHead className="text-center">Cuối Kỳ</TableHead>
                    <TableHead className="text-center">Trung Bình</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fakeGrades.map(g => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium text-slate-800">{g.subject}</TableCell>
                      <TableCell className="font-mono text-xs">{g.code}</TableCell>
                      <TableCell className="text-center">{g.midterm}</TableCell>
                      <TableCell className="text-center">{g.final !== null ? g.final : <span className="text-slate-400">—</span>}</TableCell>
                      <TableCell className="text-center">{g.avg !== null ? <span className="text-lg font-bold text-emerald-600">{g.avg}</span> : <span className="text-slate-400">—</span>}</TableCell>
                      <TableCell><Badge variant={g.status === "Hoàn thành" ? "default" : "secondary"}>{g.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showClassDetail} onOpenChange={setShowClassDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Thông tin chi tiết lớp học</DialogTitle></DialogHeader>
          {selectedClass && (
            <div className="space-y-4 text-sm py-2">
              <div>
                <h4 className="text-base font-bold text-slate-800">{selectedClass.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Mã học phần: {selectedClass.code} • Tín chỉ: {selectedClass.credits}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border">
                <div><strong>Giảng viên:</strong> {selectedClass.teacher}</div>
                <div><strong>Phòng học:</strong> {selectedClass.room}</div>
                <div><strong>Lịch học:</strong> {selectedClass.schedule}</div>
                <div><strong>Sĩ số:</strong> {selectedClass.registered}/{selectedClass.slots}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClassDetail(false)}> Đóng </Button>
            {selectedClass && !selectedClass.enrolled && (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleEnroll(selectedClass.id)}> Đăng ký ngay </Button>
            )}
            {selectedClass && selectedClass.enrolled && (
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleUnenroll(selectedClass.id)}> Hủy đăng ký </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận làm bài</DialogTitle></DialogHeader>
          <div className="py-4 text-sm text-slate-600">
            Bạn chuẩn bị bắt đầu bài thi <strong>{selectedExam?.title}</strong>.<br />
            Thời gian làm bài: <strong>{selectedExam?.duration} phút</strong>.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExamDialog(false)}> Hủy </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleStartExam}>Bắt đầu làm bài</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
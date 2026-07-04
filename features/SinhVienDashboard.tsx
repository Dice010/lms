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
  Users, Bell
} from "lucide-react";

// ------------------------------------
// Mock Data — Giữ nguyên gốc 100%
// ------------------------------------
const fakeAvailableClasses = [
  { id: 1, code: "CS301-01", name: "Trí Tuệ Nhân Tạo",   teacher: "GV Nguyễn Hữu Đức", schedule: "T2-T4 07:30", slots: 35, registered: 28, enrolled: false,
    room: "B301", credits: 3, startDate: "2025-09-01", endDate: "2025-12-20",
    timetable: [
      { day: "Thứ 2", time: "07:30 - 09:00", room: "B301" },
      { day: "Thứ 4", time: "07:30 - 09:00", room: "B301" },
    ]},
  { id: 2, code: "SE401-02", name: "Kiến Trúc Phần Mềm", teacher: "GV Trần Văn Minh",  schedule: "T3-T5 09:30", slots: 40, registered: 40, enrolled: false,
    room: "A201", credits: 4, startDate: "2025-09-01", endDate: "2025-12-20",
    timetable: [
      { day: "Thứ 3", time: "09:30 - 11:00", room: "A201" },
      { day: "Thứ 5", time: "09:30 - 11:00", room: "A201" },
    ]},
  { id: 3, code: "DS201-01", name: "Khoa Học Dữ Liệu",   teacher: "GV Lê Thị Hoa",      schedule: "T2-T6 13:30", slots: 30, registered: 15, enrolled: false,
    room: "C102", credits: 3, startDate: "2025-09-01", endDate: "2025-12-20",
    timetable: [
      { day: "Thứ 2", time: "13:30 - 15:00", room: "C102" },
      { day: "Thứ 6", time: "13:30 - 15:00", room: "C102" },
    ]},
  { id: 4, code: "NW102-01", name: "Mạng Máy Tính",      teacher: "GV Phạm Quốc Bảo",  schedule: "T4-T6 07:30", slots: 35, registered: 20, enrolled: false,
    room: "B205", credits: 3, startDate: "2025-09-01", endDate: "2025-12-20",
    timetable: [
      { day: "Thứ 4", time: "07:30 - 09:00", room: "B205" },
      { day: "Thứ 6", time: "07:30 - 09:00", room: "B205" },
    ]},
];

const fakeMyExams = [
  { id: 1, title: "Kiểm tra giữa kỳ - Khoa Học Dữ Liệu", subject: "DS201", duration: 60, openAt: "2025-06-15 08:00", status: "Đã nộp",   score: 8.5  },
  { id: 2, title: "Quiz chương 2 - Mạng Máy Tính",        subject: "NW102", duration: 20, openAt: "2025-06-20 10:00", status: "Đã nộp",   score: 7.0  },
  { id: 3, title: "Kiểm tra cuối kỳ - Khoa Học Dữ Liệu", subject: "DS201", duration: 90, openAt: "2025-07-01 07:30", status: "Chưa làm", score: null },
{ id: 4, title: "Quiz Stack & Queue - Mạng",             subject: "NW102", duration: 15, openAt: "2025-07-05 14:00", status: "Chưa làm", score: null },
];

const fakeGrades = [
  { id: 1, subject: "Khoa Học Dữ Liệu", code: "DS201", midterm: 8.5, final: null, avg: null, status: "Đang học"   },
  { id: 2, subject: "Mạng Máy Tính",    code: "NW102", midterm: 7.0, final: null, avg: null, status: "Đang học"   },
  { id: 3, subject: "Lập Trình Java",   code: "CS201", midterm: 9.0, final: 8.5,  avg: 8.7,  status: "Hoàn thành" },
  { id: 4, subject: "CTDL & Giải Thuật",code: "CS202", midterm: 6.5, final: 7.0,  avg: 6.8,  status: "Hoàn thành" },
];

const fakeNotifications = [
  { id: 1, title: "Thông báo đăng ký học phần", content: "Hệ thống đăng ký học phần học kỳ mới đã chính thức mở. Vui lòng hoàn thành trước thời hạn.", date: "03/07/2026" },
  { id: 2, title: "Cập nhật lịch thi", content: "Lịch kiểm tra điều kiện môn Trí Tuệ Nhân Tạo đã được dời sang tuần sau phòng B301.", date: "02/07/2026" },
];

// ------------------------------------
// Dữ liệu 10 câu hỏi Khoa Học Dữ Liệu (ID: 3)
// ------------------------------------
const DS_QUESTIONS = [
  { id: 1, content: "Câu 1: Bài toán Phân loại (Classification) thuộc nhóm học máy nào?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. Học có giám sát (Supervised Learning)" }, { id: "opt2", text: "B. Học không giám sát (Unsupervised Learning)" }, { id: "opt3", text: "C. Học bán giám sát (Semi-supervised Learning)" }, { id: "opt4", text: "D. Học tăng cường (Reinforcement Learning)" }
  ]},
  { id: 2, content: "Câu 2: K-means clustering là thuật toán dùng để giải quyết bài toán gì?", correctOptionId: "opt2", options: [
    { id: "opt1", text: "A. Phân loại (Classification)" }, { id: "opt2", text: "B. Phân cụm (Clustering)" }, { id: "opt3", text: "C. Hồi quy (Regression)" }, { id: "opt4", text: "D. Giảm chiều dữ liệu (Dimensionality Reduction)" }
  ]},
  { id: 3, content: "Câu 3: Trong Python, thư viện nào phổ biến nhất để thao tác và phân tích dữ liệu dạng bảng (Dataframe)?", correctOptionId: "opt2", options: [
    { id: "opt1", text: "A. Numpy" }, { id: "opt2", text: "B. Pandas" }, { id: "opt3", text: "C. Matplotlib" }, { id: "opt4", text: "D. Scikit-learn" }
  ]},
  { id: 4, content: "Câu 4: Hiện tượng 'Overfitting' (Quá khớp) trong học máy là gì?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. Mô hình hoạt động rất tốt trên tập huấn luyện nhưng kém trên tập kiểm tra" }, { id: "opt2", text: "B. Mô hình hoạt động kém trên cả tập huấn luyện và tập kiểm tra" }, { id: "opt3", text: "C. Mô hình chưa học đủ đặc trưng của dữ liệu" }, { id: "opt4", text: "D. Không có đáp án nào đúng" }
  ]},
  { id: 5, content: "Câu 5: Độ đo F1-score là sự kết hợp trung bình điều hòa của hai chỉ số nào?", correctOptionId: "opt3", options: [
{ id: "opt1", text: "A. Accuracy và Error Rate" }, { id: "opt2", text: "B. Sensitivity và Specificity" }, { id: "opt3", text: "C. Precision và Recall" }, { id: "opt4", text: "D. True Positive và False Positive" }
  ]},
  { id: 6, content: "Câu 6: Mục đích chính của thuật toán PCA (Principal Component Analysis) là gì?", correctOptionId: "opt4", options: [
    { id: "opt1", text: "A. Điền dữ liệu bị thiếu" }, { id: "opt2", text: "B. Tạo thêm dữ liệu giả" }, { id: "opt3", text: "C. Huấn luyện mạng nơ-ron" }, { id: "opt4", text: "D. Giảm chiều dữ liệu (Dimensionality reduction)" }
  ]},
  { id: 7, content: "Câu 7: Thuật toán Naive Bayes dựa trên nền tảng lý thuyết nào?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. Định lý Bayes về xác suất có điều kiện" }, { id: "opt2", text: "B. Khoảng cách Euclidean" }, { id: "opt3", text: "C. Cây quyết định (Decision Tree)" }, { id: "opt4", text: "D. Hàm kích hoạt Sigmoid" }
  ]},
  { id: 8, content: "Câu 8: Missing value (Dữ liệu bị thiếu) thường được xử lý bằng cách nào trong tiền xử lý dữ liệu?", correctOptionId: "opt4", options: [
    { id: "opt1", text: "A. Xóa các dòng chứa giá trị thiếu" }, { id: "opt2", text: "B. Điền bằng giá trị trung bình/trung vị" }, { id: "opt3", text: "C. Điền bằng giá trị xuất hiện nhiều nhất (Mode)" }, { id: "opt4", text: "D. Tất cả các cách trên đều đúng" }
  ]},
  { id: 9, content: "Câu 9: Tập dữ liệu thường được chia làm mấy phần chính khi xây dựng và đánh giá mô hình?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. 2 hoặc 3 phần (Train, Validation, Test)" }, { id: "opt2", text: "B. 4 phần" }, { id: "opt3", text: "C. 5 phần" }, { id: "opt4", text: "D. Không cần chia, dùng toàn bộ để huấn luyện" }
  ]},
  { id: 10, content: "Câu 10: Bài toán Hồi quy (Regression) dự đoán biến mục tiêu có tính chất gì?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. Là giá trị số liên tục (Continuous)" }, { id: "opt2", text: "B. Là các nhãn phân biệt (Discrete/Categorical)" }, { id: "opt3", text: "C. Là kiểu dữ liệu văn bản (Text)" }, { id: "opt4", text: "D. Là kiểu dữ liệu hình ảnh (Image)" }
  ]}
];

// ------------------------------------
// Dữ liệu 10 câu hỏi Stack & Queue - Mạng (ID: 4)
// ------------------------------------
const SQ_QUESTIONS = [
  { id: 1, content: "Câu 1: Cấu trúc dữ liệu Stack (Ngăn xếp) hoạt động theo nguyên tắc nào?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. LIFO (Last In First Out)" }, { id: "opt2", text: "B. FIFO (First In First Out)" }, { id: "opt3", text: "C. FILO (First In Last Out)" }, { id: "opt4", text: "D. Cả A và C đều đúng" }
  ]},
  { id: 2, content: "Câu 2: Cấu trúc dữ liệu Queue (Hàng đợi) hoạt động theo nguyên tắc nào?", correctOptionId: "opt2", options: [
{ id: "opt1", text: "A. LIFO (Last In First Out)" }, { id: "opt2", text: "B. FIFO (First In First Out)" }, { id: "opt3", text: "C. LILO (Last In Last Out)" }, { id: "opt4", text: "D. Không có nguyên tắc cụ thể" }
  ]},
  { id: 3, content: "Câu 3: Thao tác thêm một phần tử vào Stack thường được gọi là gì?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. Push" }, { id: "opt2", text: "B. Pop" }, { id: "opt3", text: "C. Enqueue" }, { id: "opt4", text: "D. Dequeue" }
  ]},
  { id: 4, content: "Câu 4: Thao tác lấy một phần tử ra khỏi Queue thường được gọi là gì?", correctOptionId: "opt4", options: [
    { id: "opt1", text: "A. Push" }, { id: "opt2", text: "B. Pop" }, { id: "opt3", text: "C. Enqueue" }, { id: "opt4", text: "D. Dequeue" }
  ]},
  { id: 5, content: "Câu 5: Ứng dụng phổ biến nhất của Queue trong Mạng Máy Tính là gì?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. Hàng đợi bộ đệm gói tin (Packet Buffering) ở Router/Switch" }, { id: "opt2", text: "B. Tính toán địa chỉ IP" }, { id: "opt3", text: "C. Mã hóa dữ liệu truyền tải" }, { id: "opt4", text: "D. Quản lý lịch sử trình duyệt web" }
  ]},
  { id: 6, content: "Câu 6: Để kiểm tra tính hợp lệ của các cặp dấu ngoặc trong một biểu thức toán học, ta nên dùng cấu trúc nào?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. Stack" }, { id: "opt2", text: "B. Queue" }, { id: "opt3", text: "C. Priority Queue" }, { id: "opt4", text: "D. Circular Queue" }
  ]},
  { id: 7, content: "Câu 7: Thuật toán Duyệt đồ thị theo chiều rộng (BFS - Breadth-First Search) thường sử dụng cấu trúc dữ liệu nào để lưu trữ các đỉnh đang chờ duyệt?", correctOptionId: "opt2", options: [
    { id: "opt1", text: "A. Stack" }, { id: "opt2", text: "B. Queue" }, { id: "opt3", text: "C. Tree" }, { id: "opt4", text: "D. Graph" }
  ]},
  { id: 8, content: "Câu 8: Thuật toán Duyệt đồ thị theo chiều sâu (DFS - Depth-First Search) thường sử dụng cấu trúc dữ liệu nào (hoặc dùng đệ quy)?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. Stack" }, { id: "opt2", text: "B. Queue" }, { id: "opt3", text: "C. Linked List" }, { id: "opt4", text: "D. Array" }
  ]},
  { id: 9, content: "Câu 9: Hiện tượng 'Stack Overflow' (Tràn ngăn xếp) xảy ra khi nào?", correctOptionId: "opt1", options: [
    { id: "opt1", text: "A. Khi liên tục thực hiện thao tác Push vượt quá dung lượng bộ nhớ được cấp phát cho Stack" }, { id: "opt2", text: "B. Khi thực hiện Pop trên một Stack rỗng" }, { id: "opt3", text: "C. Khi dữ liệu trong Stack bị hỏng" }, { id: "opt4", text: "D. Khi gọi quá nhiều phần tử ra khỏi ngăn xếp" }
  ]},
  { id: 10, content: "Câu 10: Circular Queue (Hàng đợi vòng) ra đời nhằm khắc phục nhược điểm nào của Linear Queue (Hàng đợi tuyến tính) cài đặt bằng mảng?", correctOptionId: "opt3", options: [
{ id: "opt1", text: "A. Khắc phục sự chậm trễ khi lấy dữ liệu ra" }, { id: "opt2", text: "B. Giúp tìm kiếm phần tử nhanh hơn" }, { id: "opt3", text: "C. Tránh lãng phí các ô nhớ bị trống ở đầu mảng sau khi Dequeue" }, { id: "opt4", text: "D. Tất cả đều sai" }
  ]}
];

// Fallback questions nếu không khớp
const GENERIC_QUESTIONS = DS_QUESTIONS.map(q => ({...q, content: "Câu hỏi hệ thống đang cập nhật..."}));

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
  const [currentExamQuestions, setCurrentExamQuestions] = useState<any[]>([]); 
  
  const [showSuccessToast, setShowSuccessToast] = useState(false); 
  const [showEnrollToast, setShowEnrollToast] = useState(false);

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
          calculatedScore += 1; 
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
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
              <p className="text-slate-500 mt-1 text-sm">Môn: {selectedExam.subject} • Vui lòng đọc kỹ câu hỏi và chọn đáp án.</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-md font-medium border border-blue-100">
<Clock className="w-5 h-5" />
              <span>Thời gian: {selectedExam.duration} phút</span>
            </div>
          </div>

          <div className="space-y-6">
            {currentExamQuestions.map((question) => (
              <Card key={question.id} className="w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold leading-relaxed">{question.content}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {question.options.map((option: any) => (
                      <label key={option.id} className={`flex items-center space-x-3 rounded-md border p-3 transition-colors cursor-pointer ${answers[question.id] === option.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" name={`question-${question.id}`} value={option.id} checked={answers[question.id] === option.id} onChange={() => setAnswers(prev => ({ ...prev, [question.id]: option.id }))} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" />
                        <span className="flex-1 font-normal text-slate-700 cursor-pointer">{option.text}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="sticky bottom-4 flex justify-end items-center bg-white/90 backdrop-blur-sm p-4 border rounded-lg shadow-sm">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8" onClick={handleSubmitExam}>Nộp Bài</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 relative">
      {showEnrollToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-emerald-500 rounded-xl p-6 shadow-2xl max-w-sm w-full flex flex-col items-center text-center space-y-3">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 animate-bounce">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-emerald-700">Đã đăng ký thành công</h3>
            <p className="text-sm text-slate-500">Lớp học đã được ghi nhận vào tài khoản sinh viên.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang Sinh Viên</h1>
          <p className="text-sm text-slate-500">Đăng ký lớp học, làm bài kiểm tra & xem bảng điểm</p>
        </div>
      </div>
{/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
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

      <div className="mb-4 flex flex-wrap gap-2">
        {([
          { key: "classes",       label: "Đăng Ký Lớp Học", icon: <PlusCircle className="h-4 w-4" />, visible: true },
          { key: "my-classes",    label: "Lớp học",        icon: <Users className="h-4 w-4" />,      visible: true },
          { key: "notifications", label: "Thông báo",      icon: <Bell className="h-4 w-4" />,       visible: true },
          { key: "exams",         label: "Bài Kiểm Tra",     icon: <ClipboardList className="h-4 w-4" />, visible: enrolledCount > 0 },
          { key: "grades",        label: "Bảng Điểm",        icon: <BarChart2     className="h-4 w-4" />, visible: enrolledCount > 0 },
        ] as { key: MainTab; label: string; icon: React.ReactNode; visible: boolean }[])
        .filter(t => t.visible)
        .map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {activeTab === "classes" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Danh Sách Lớp Học</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã lớp</TableHead>
                  <TableHead>Tên môn học</TableHead>
                  <TableHead>Giảng viên</TableHead>
                  <TableHead>Lịch học</TableHead>
                  <TableHead>Sĩ số</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.code}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-slate-500">{c.teacher}</TableCell>
<TableCell className="text-slate-500 text-sm">{c.schedule}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${c.registered >= c.slots ? "text-red-500" : "text-slate-600"}`}>
                        {c.registered}/{c.slots}
                      </span>
                    </TableCell>
                    <TableCell>
                      {c.enrolled
                        ? <Badge variant="default">Đã đăng ký</Badge>
                        : c.registered >= c.slots
                          ? <Badge variant="destructive">Hết chỗ</Badge>
                          : <Badge variant="secondary">Còn chỗ</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedClass(c); setShowClassDetail(true); }}>
                          <BookOpen className="mr-1 h-3 w-3" /> Chi tiết
                        </Button>
                        {c.enrolled
                          ? <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleUnenroll(c.id)}>Hủy đăng ký</Button>
                          : <Button size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={c.registered >= c.slots} onClick={() => handleEnroll(c.id)}>Đăng ký</Button>
                        }
                      </div>
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
          <CardHeader><CardTitle className="text-base">Lớp Học Đã Tham Gia</CardTitle></CardHeader>
          <CardContent>
            {enrolledCount === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">Bạn chưa tham gia đăng ký lớp học nào.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.filter(c => c.enrolled).map(c => (
                  <div key={c.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
                    <div>
                      <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-semibold">{c.code}</span>
                      <h4 className="font-bold text-slate-800 mt-1">{c.name}</h4>
                      <p className="text-sm text-slate-500 mt-1">{c.teacher} • Phòng {c.room}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedClass(c); setShowClassDetail(true); }}>Chi tiết</Button>
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
              <div key={n.id} className="p-4 border rounded-lg hover:bg-slate-50/50 transition-colors flex gap-3">
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
          <CardHeader><CardTitle className="text-base">Danh Sách Bài Kiểm Tra</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Môn</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Mở lúc</TableHead>
                  <TableHead className="text-center">Điểm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-slate-400">{e.id}</TableCell>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{e.subject}</TableCell>
                    <TableCell><span className="flex items-center gap-1 text-sm text-slate-600"><Clock className="h-3 w-3" /> {e.duration} phút</span></TableCell>
                    <TableCell className="text-slate-400 text-sm">{e.openAt}</TableCell>
                    <TableCell className="text-center">{e.score !== null ? <span className={`text-lg font-bold ${e.score >= 8 ? "text-emerald-600" : e.score >= 5 ? "text-amber-600" : "text-red-600"}`}>{e.score}</span> : <span className="text-slate-400">—</span>}</TableCell>
                    <TableCell><Badge variant={e.status === "Đã nộp" ? "default" : "secondary"}>{e.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      {e.status === "Chưa làm" && (
<Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => { setSelectedExam(e); setShowExamDialog(true); }}><Play className="mr-1 h-3 w-3" /> Làm bài</Button>
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
          <CardHeader><CardTitle className="text-base">Bảng Điểm Tổng Hợp</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã MH</TableHead>
                  <TableHead>Tên môn học</TableHead>
                  <TableHead className="text-center">Điểm GK</TableHead>
                  <TableHead className="text-center">Điểm CK</TableHead>
                  <TableHead className="text-center">Điểm TB</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fakeGrades.map(g => (
                  <TableRow key={g.id}>
                    <TableCell className="font-mono text-sm">{g.code}</TableCell>
                    <TableCell className="font-medium">{g.subject}</TableCell>
                    <TableCell className="text-center font-medium text-slate-700">{g.midterm ?? <span className="text-slate-400">—</span>}</TableCell>
                    <TableCell className="text-center font-medium text-slate-700">{g.final !== null ? g.final : <span className="text-slate-400">—</span>}</TableCell>
                    <TableCell className="text-center">{g.avg !== null ? <span className={`text-lg font-bold ${g.avg >= 8 ? "text-emerald-600" : g.avg >= 5 ? "text-amber-600" : "text-red-600"}`}>{g.avg}</span> : <span className="text-slate-400">—</span>}</TableCell>
                    <TableCell><Badge variant={g.status === "Hoàn thành" ? "default" : "secondary"}>{g.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog: Chi tiết lớp học (ĐÃ FIX PHẦN BỊ CẮT) */}
      <Dialog open={showClassDetail} onOpenChange={setShowClassDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Chi Tiết Lớp Học</DialogTitle></DialogHeader>
          {selectedClass && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4">
                {[
                  ["Mã lớp",     selectedClass.code],
                  ["Số tín chỉ", `${selectedClass.credits} TC`],
                  ["Giảng viên", selectedClass.teacher],
                  ["Phòng học",  selectedClass.room],
["Ngày BĐ",    selectedClass.startDate],
                  ["Ngày KT",    selectedClass.endDate],
                ].map(([label, value], i) => (
                  <div key={i}>
                    <span className="block text-slate-500">{label}</span>
                    <span className="font-medium text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="mb-2 font-semibold text-slate-800">Lịch học cụ thể:</h4>
                <ul className="space-y-2">
                  {selectedClass.timetable.map((t, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-700">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="font-medium w-16">{t.day}</span>
                      <span>{t.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowClassDetail(false)}>Đóng</Button>
            {selectedClass && !selectedClass.enrolled && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                disabled={selectedClass.registered >= selectedClass.slots} 
                onClick={() => handleEnroll(selectedClass.id)}
              >
                Đăng ký ngay
              </Button>
            )}
            {selectedClass && selectedClass.enrolled && (
              <Button 
                variant="outline" 
                className="text-red-600 border-red-300 hover:bg-red-50" 
                onClick={() => handleUnenroll(selectedClass.id)}
              >
                Hủy đăng ký
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Xác nhận bắt đầu làm bài kiểm tra */}
      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận làm bài</DialogTitle></DialogHeader>
          <div className="py-4 text-sm text-slate-600">
            Bạn chuẩn bị bắt đầu bài thi <strong>{selectedExam?.title}</strong>. <br /><br />
            Thời gian làm bài: <strong>{selectedExam?.duration} phút</strong>. <br />
            Đồng hồ đếm ngược sẽ bắt đầu chạy ngay khi bạn ấn Bắt đầu.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExamDialog(false)}>Hủy</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleStartExam}>Bắt đầu làm bài</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
} 
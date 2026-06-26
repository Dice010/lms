# 🚀 DỰ ÁN LMS (Hệ Thống Quản Lý Học Tập) - 15 Ngày Chinh Phục

## 📌 1. Mục tiêu và Nguyên tắc chung
- **Tech Stack:** Next.js (App Router), React, TailwindCSS, TypeScript, shadcn/ui.
- **Quy tắc cốt lõi:** Chia để trị. Frontend (Giao diện) và Backend (Logic/Database) làm việc độc lập. Mọi người tập trung 100% vào việc dựng Layout UI tĩnh (không gọi API, không đụng logic Auth).
- **Tuyệt đối không:** Không tự ý cài đặt thêm thư viện npm mới nếu chưa có sự đồng ý của Leader. Không code chung đụng vào các file core như `layout.tsx` hay thư mục `api`.

## 📌 2. Quy trình làm việc với Git (BẤT DI BẤT DỊCH)
Tuyệt đối KHÔNG ai được push code thẳng lên nhánh `main`. Hãy làm theo 4 bước sau:

1. Lấy code mới nhất về trước khi làm: `git checkout main` -> `git pull origin main`
2. Tạo nhánh riêng cho tính năng của bạn: `git checkout -b feature/ten-tinh-nang` (VD: `feature/phuc-hr-ui`, `feature/toan-daotao`, `feature/tri-truongbomon`)
3. Code và Commit trên nhánh của mình: `git add .` -> `git commit -m "UI: Dựng bảng danh sách môn học"`
4. Push nhánh lên Github: `git push origin feature/ten-tinh-nang`. Báo Leader để review và Merge.

## 📌 3. Quy định Code Giao Diện (CRUD Tĩnh)
- Chỉ thiết kế giao diện: Bảng (Table), Form thêm/sửa, Nút bấm. 
- Dữ liệu hiển thị phải là Fake Data (tự tạo mảng tĩnh). 
  *Ví dụ:* `const fakeUsers = [{ id: 1, name: "Nguyễn Văn A" }, { id: 2, name: "Trần Văn B" }];`
- Tận dụng tối đa các component đã có sẵn trong thư mục `components/ui` (do shadcn tạo ra).

## 📌 4. 🤖 KHUÔN MẪU AI (BẮT BUỘC SỬ DỤNG)
Khi dùng ChatGPT hoặc Claude để nhờ viết code, **BẮT BUỘC** phải copy đoạn Prompt dưới đây dán vào phần đầu của cuộc trò chuyện để đảm bảo code sinh ra đồng nhất và không làm sập hệ thống:

> "Bạn là một chuyên gia Frontend Developer. Hãy giúp tôi viết một Component React cho dự án Next.js (App Router). 
> **Yêu cầu kỹ thuật nghiêm ngặt:**
> 1. Viết bằng TypeScript (`.tsx`) theo chuẩn Functional Component.
> 2. Chỉ sử dụng TailwindCSS để style. KHÔNG dùng CSS thuần hay thư viện bên ngoài.
> 3. Ưu tiên sử dụng cú pháp và cấu trúc của thư viện `shadcn/ui` (như Table, Button, Input, Dialog, Card) nếu có thể.
> 4. Đây là Component Giao diện Tĩnh (Presentational Component). TUYỆT ĐỐI KHÔNG gọi API, không fetch dữ liệu, không dùng Prisma hay thao tác với Database. 
> 5. Hãy tự sinh ra một mảng Fake Data (Mock Data) ngắn gọn ngay bên trong component để map và render ra giao diện.
> 6. Tên biến phải dùng tiếng Anh rõ ràng. Comment chú thích các khối UI chính (ví dụ: `<!-- Header -->`, `<!-- Table Body -->`).
> 
> Yêu cầu hiện tại của tôi là: [GHI CHỨC NĂNG BẠN MUỐN LÀM VÀO ĐÂY - VD: Tạo một bảng danh sách sinh viên gồm cột Tên, MSSV, Nút Xóa/Sửa]"

## 📌 5. Giờ Hỗ Trợ Kỹ Thuật (Support Hours)
- **20:00 - 21:00 mỗi ngày:** Leader sẽ trực tiếp review code, giải quyết bug, hướng dẫn fix lỗi và tiến hành ghép code (Merge) vào nhánh `main`.
- Ngoài khung giờ này: Vui lòng nhắn lỗi kèm ảnh chụp màn hình lên Group Chat, hoặc sử dụng AI để tự tìm hướng khắc phục trước. Leader cần thời gian cách ly để xây dựng hệ thống Database và Phân quyền (Auth).
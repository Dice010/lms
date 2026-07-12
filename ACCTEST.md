# 🚀 DỰ ÁN HỆ THỐNG QUẢN LÝ ĐÀO TẠO (LMS) — 7 ROLES

Hệ thống quản lý học tập và điều hành đào tạo trực tuyến dành cho cơ sở giáo dục đại học, tích hợp phân quyền chặt chẽ 7 vai trò, kết nối cơ sở dữ liệu thực tế SQLite thông qua Prisma ORM và quản lý phiên đăng nhập bằng NextAuth.

---

## 👥 DANH SÁCH TÀI KHOẢN TEST HỆ THỐNG

> **Lưu ý quan trọng cho Team (Phúc, Toàn, Trí):** > Tất cả các tài khoản dưới đây đã được cấu hình sẵn trong kịch bản dữ liệu mẫu (`prisma/seed.ts`). Sau khi kéo code mới nhất về, hãy chạy lệnh `npx prisma db seed` để nạp các tài khoản này vào Database cục bộ trên máy của mình.

| Vai trò hệ thống (UI) | Enum Database (`role`) | Username / Email đăng nhập | Mật khẩu mặc định |
| :--- | :--- | :--- | :--- |
| **Admin (Toàn quyền)** | `ADMIN` | **`admin@lms.edu.vn`** | `123` |
| **Hiệu trưởng** | `HIEU_TRUONG` | **`hieutruong@lms.edu.vn`** | `123` |
| **HR (Nhân sự)** | `HR` | **`hr@lms.edu.vn`** | `123` |
| **Phòng Đào Tạo** | `PHONG_DAO_TAO` | **`daotao@lms.edu.vn`** | `123` |
| **Trưởng bộ môn** | `TRUONG_BO_MON` | **`tbm@lms.edu.vn`** | `123` |
| **Giảng viên** | `GIANG_VIEN` | **`giangvien@lms.edu.vn`** | `123` |
| **Sinh viên** | `SINH_VIEN` | **`sinhvien@lms.edu.vn`** | `123` |

---

---
### ⚠️ LƯU Ý QUAN TRỌNG VỀ MẬT KHẨU
- Mật khẩu các tài khoản test là **`123`**.
- **Tuyệt đối không sửa mật khẩu trực tiếp trong Database:** Vì mật khẩu đã được hệ thống tự động băm (hash) bằng `bcryptjs` để bảo mật. Nếu bạn gõ trực tiếp chữ "123" vào database, hệ thống sẽ không thể giải mã và bạn sẽ không thể đăng nhập được.
- Nếu muốn reset mật khẩu: Hãy chạy lại lệnh `npx prisma db seed` để hệ thống tự động băm lại mật khẩu chuẩn cho bạn.
---

## 🛠️ QUY TRÌNH KHỞI CHẠY DỰ ÁN (DÀNH CHO TEAM)

Mỗi khi có thành viên cập nhật cấu trúc database hoặc logic lõi từ nhánh chính (`main`), các thành viên còn lại cần thực hiện theo các bước sau trong Terminal (Git Bash / VS Code Terminal) để đồng bộ đồ nghề:

### Bước 1: Cập nhật mã nguồn mới nhất
```bash
git checkout master
git pull origin master
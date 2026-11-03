# Bé Học Tiếng Anh — Hướng dẫn tạo file APK

Ứng dụng học tiếng Anh giao tiếp cho bé 3–5 tuổi, chạy trên tablet Android (xoay ngang).

## 1. Tính năng

| Mục | Nội dung |
|---|---|
| 🦄 Đổi bạn chơi | 3 nhân vật: Kỳ lân Luna, Cún Bông, Bé Mai — mỗi bạn một giọng, chớp mắt, nhún nhảy, miệng mấp máy khi nói |
| 💬 Nói chuyện | 6 chủ đề theo kịch bản: Chào hỏi, Màu sắc, Con vật, Trái cây, Cảm xúc, Cơ thể. Bé bấm 🎤 để nói, hoặc bấm nút trả lời |
| ✨ Trò chuyện tự do | Nói chuyện tự do với nhân vật bằng AI (Claude). Cần API key + Internet, có giới hạn lượt/ngày |
| 🔢 Học đếm | Bé chạm từng đồ vật để đếm, rồi chọn/nói đúng số |
| ✏️ Tập tô | Tô chữ A–Z (hoa/thường) và số 0–9 bằng ngón tay, app tự chấm |
| 🔍 Tìm chữ & số | Nhân vật đọc, bé tìm đúng thẻ chữ/số |
| ⚙️ Bố mẹ | Có khóa bằng phép tính. Tên bé, tốc độ đọc, gợi ý tiếng Việt, mức đếm, API key |

Mọi phần (trừ Trò chuyện tự do) đều chạy **không cần mạng**.

## 2. Tải lên GitHub — tạo APK và link web cho tablet

**Bước 1 – Tạo tài khoản:** vào github.com → Sign up (miễn phí).

**Bước 2 – Tạo repo:** góc phải trên bấm **+** → **New repository**
- Repository name: `be-hoc-tieng-anh`
- Chọn **Public** (tài khoản miễn phí chỉ bật được link web với repo Public; code không chứa API key nên công khai không sao)
- **Không** tích *Add a README* → bấm **Create repository**

**Bước 3 – Chuẩn bị file trên máy tính:**
- Giải nén `BeHocTiengAnh_source.zip` → mở thư mục `KidsEnglish`
- Bật hiện file ẩn: Windows 11 *View › Show › Hidden items* (Windows 10: tab *View* › tích *Hidden items*)
- Phải thấy thư mục `.github` nằm cùng chỗ với `android`, `www`, `package.json`

**Bước 4 – Tải lên:** ở trang repo vừa tạo bấm **uploading an existing file**
- Trong thư mục `KidsEnglish`, bấm **Ctrl + A** chọn **tất cả bên trong** (không kéo cả thư mục `KidsEnglish`)
- Kéo thả vào trang GitHub → chờ hết thanh tải → bấm **Commit changes**
- Kiểm tra: trang repo phải hiện `.github`, `android`, `www`... ngay ở cấp ngoài cùng

**Bước 5 – Bật link web:** tab **Settings** → mục **Pages** (cột trái) → *Build and deployment › Source* chọn **GitHub Actions**

**Bước 6 – Chạy:** tab **Actions** → nếu thấy nút xanh *I understand my workflows…* thì bấm để bật
- **Build APK** → **Run workflow** → **Run workflow**
- **Web cho tablet (GitHub Pages)** → **Run workflow** → **Run workflow**
- Chờ 3–8 phút đến khi cả hai có dấu ✅

**Bước 7 – Lấy kết quả:**
- **APK:** bấm vào lần chạy *Build APK* → kéo xuống **Artifacts** → tải **BeHocTiengAnh-APK** (file .zip, giải nén ra `BeHocTiengAnh.apk`)
- **Link web:** bấm vào lần chạy *Web cho tablet* → link `https://<tên-tài-khoản>.github.io/be-hoc-tieng-anh/` hiện trong ô *deploy*. Mở bằng Chrome trên tablet → menu ⋮ → **Thêm vào màn hình chính**

**Cập nhật về sau:** tải file mới lên đè (bước 4) → cả APK và link web tự build lại.

**Nếu không thấy `.github` sau khi tải:** bấm **Add file › Create new file**, gõ tên `.github/workflows/build-apk.yml`, dán nội dung file đó từ máy, **Commit**. Làm tương tự với `deploy-web.yml`.

## 3. Cài lên tablet

1. Chép file `BeHocTiengAnh.apk` sang tablet (Zalo, Google Drive, cáp USB...).
2. Mở file → Android hỏi *cho phép cài ứng dụng không rõ nguồn* → **Cho phép** → **Cài đặt**.
3. Lần đầu bấm 🎤, chọn **Cho phép** dùng micro.

**Để giọng nói hoạt động tốt nhất trên tablet:**
- Cần có ứng dụng **Google** (dùng cho nhận dạng giọng nói).
- Vào *Cài đặt › Hệ thống › Ngôn ngữ › Chuyển văn bản thành giọng nói* → chọn **Google**, tải thêm gói **Tiếng Việt** để nhân vật đọc được gợi ý tiếng Việt.

## 4. Bật Trò chuyện tự do (AI)

1. Đăng ký tại **console.anthropic.com**, nạp tiền và tạo **API key** (dạng `sk-ant-...`).
2. Trong app: ⚙️ → giải phép tính → dán key → chỉnh *Giới hạn lượt / ngày* → **Lưu**.
3. Nhân vật được dặn chỉ nói câu ngắn, đơn giản, an toàn cho trẻ. Bố mẹ nên ngồi cùng bé khi dùng chế độ này.

## 5. Sửa nội dung

- Thêm/sửa chủ đề hội thoại, từ vựng: file `www/js/data.js`.
- Sau khi sửa, upload lại file lên GitHub → APK mới sẽ tự build lại.

## 6. Cấu trúc thư mục

```
www/                  giao diện và logic app (HTML/CSS/JS)
  js/characters.js    hình vẽ 3 nhân vật
  js/data.js          nội dung bài học
  js/speech.js        đọc, nghe giọng nói, âm thanh
  js/app.js           các màn hình
android/              project Android (Capacitor) — icon, quyền micro, xoay ngang
.github/workflows/    cấu hình tự động build APK
```

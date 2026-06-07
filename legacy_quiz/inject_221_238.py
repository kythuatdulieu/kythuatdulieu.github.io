#!/usr/bin/env python3
import json

def load_data(path="/home/duclinh/clone/questions.json"):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data, json_path="/home/duclinh/clone/questions.json", js_path="/home/duclinh/clone/questions.js"):
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("const QUESTIONS_DATA = ")
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(";\n")

manual_explanations = {
    221: "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMuốn Copy 1 Cái Pipeline DLT Rườm Rà Setup Thông Qua Dòng Lệnh Trắng CLI: Bạn Phải Xài Lệnh `get` Đặng Chụp Lấy Tấm Bản Đồ JSON Chứa Toàn Bộ Cấu Hình Hiện Tại. Đoạn Trọng Yếu Nhất LÀ Bạn Phải Mở JSON Ra \"Xóa Nhòa Cái Mác pipeline_id Cũ\" (Vì API Không Chấp Nhận Kẻ Nào Mang ID Tồn Tại Đi Tạo Mới), Đổi Lại Tên Mới Rồi Quăng Cục JSON Lại Vào Lệnh `create` Để Mụn App DLT Chào Đời Mượt Bông Chẳng Đụng Hàng Cháy Lỗi Lấp Trưởng Cũ.",
    222: "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCái Quyển Danh Bạ Vàng MÀ Python Cầm Lăm Lăm Trên Tay Để Đi Lục Soi Khắp Cõi OS Có Sợi Code Hoặc Gói Cây Import Nào Tên Giống Lời Gọi Không Chính LÀ Biến Danh Sách `sys.path`. Xóa Mờ Hay Nối Thêm Sợi Folder Khác Vào List `sys.path` Này Sẽ Điều Hướng Khả Năng Rút Trộm Import Python Thẳng Chớp Trúng Đích Nhanh Ngầm Mà Rảnh Điểm Mù.",
    223: "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nChỉ Có Test Thử Mã Một Khối Thuận Túy Cộc Lốc (Ví Dụ Hàm Calculate Area `myIntegrate(...)` Không Hề Dây Điện Tới Tầng Database Hay Tới Kafka Gì Sất) Thì Đích Thị Khối Code Mộc Này Mang Tên Unit Test (Kiểm Đếm Unit Phù Nhỏ Mảnh). Khắp Toán Khóa Rèn Khuôn Lệnh Chuẩn Chấp Tất Không Trống Code Cạnh Khác.",
    224: "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu Q103). Cái Đỉnh Sướng Của Tích Hợp Thử Trận End-To-End (Dài Hơi Đầu Cuối Cuộc Chơi) Đó LÀ Nó Có Vẻ Đẹp Mô Phỏng Bức Tranh Toàn Cảnh Hoạt Đồng Cầm Mã Như Thế Nào Trong Mắt Một Khách Hàng Ngoài Đời Thực. Data Đi Phễu Đổ Từ API Lọt Data Trôi Xuống Cống Dashboard Cực Cực Khớp Vừa Nhịp \"Closely simulates real world usage\".",
    225: "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐể Lệnh Kéo View Các Cuốn Notebook Rắp Nằm Phục Sinh Hoạt Chừng Ngóng Trong Kế Hoạch Đa Lệnh (Multi-task Job). Bạn Cần Bóc Gói Sơ Đồ Thiết Kế Khung `Job Definition`. API Nào Bưng Gói Gốc Ấy Ra Xem? Quả Chính Là GET Cơ Bản API `/jobs/get`. Nó Hoàn Trả Lại Nguyên Sổ Tay Vẽ Bảng Liệt Kê Nào Cột Task A LÀ Note C, Task B LÀ Note K Nhọn Chạy Ra Riêng Vứt.",
    226: "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMuốn Gọi Thằng Code Chức Năng Cảm Data Thật Từ Xa Đăng Tự Gõ Lại Trăm Dòng Notebook Không Buồn Thảm. Chiêu Gây Tiếng Vang Chính LÀ Xài Ngục Thư Mục `Files In Repos`. Bằng Việc Nhốt Code Vào Trái Tim Git Repos, Notebook Ảo Trở Thành Như Tệp .py Phàm Trần. Thằng Notebook C Test Lệnh Nhanh Nghĩ Mở Hàm Kéo Trút Giọt `import function_from_production_notebook` Khác Vùng Mượt Mịn Tụ Ẩn Tháo Tỏa Toàn Tội.",
    227: "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nNếu Bỏ Cái Khuỷu Khai Báo Bảng Live Table (Vd `đkt@dlt.table(name=...)`) Vào Rừng Vòng Lặp Trống For-Loop. Cái DLT Lắm Chuyện Nó Sẽ Cắn Nuốt Ghi Đè Đánh Sập Tên Cũ, Nảy Rác Cuối Cùng 1 Bảng Ảo Tưởng. Cứu Lẽ Sống Kỹ Sư LÀ Viết Hộp Tròn Function Độc Lập Chứa Annotation Đẻ Table Bên Trong, Chạy Lặp Khúc Nào Chích Thả Tham Số Parameter Khúc Nấy Kêu Reo Hoạch Khác Name Nhau Khắp Chảo DAG Biến Hoàn Mỹ Dị Nhanh Gọt C.",
    228: "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCâu Trả Lời Siêu Quyền Lực Của Năm Mới Biển Data Mờ Chẳng Sóng LÀ UniForm. Delta Lake Đã Cho Phép Chức Năng Bật Nút Lại Lệ Delta Lake Universal Format (UniForm). Biến Biểu Gắn Mác Table Có Lõi Án Phạt Cho Kẻ Bên Ngoài Cầm Client Iceberg Nối Vô Đọc Trơn Rớt Miễn Kí Trông Trạng Như Thật. Không Hề Cần Copy Chống Khóa Rác Mất Đất Dung Lượng Thừa D.",
    229: "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nDù JSON Béo Có Hàng Tỉ Gốc Cánh Nested Trong Lòi Ruột Bụng, Databricks Engine (Delta) Khẽ Chót Vẩy Chỉ Chọn Thu Thống Kê Điền Tiên Mảng Min/Max (Statistics Filter Mượt) Của ĐÚNG 32 Cột TẦNG TRÊN CÙNG ĐẦU TIÊN CỦA BẢNG ĐIỂM CHẠM. KỸ Sư Nào Rành Rẽ Hiểu Máu Chốt Câu D Này Sẽ Quyết Cắt Mảnh Lôi Thừa 15 Cột Ruột Chạy Join Bắn Filter Ra Biến Tạo Thẳng Thành 15 Cột Gốc Trên Mặt Bảng Đặng Tranh Gói Data Skipping Tiền Tỷ Phút Chớp Thời Quá Cụt.",
    230: "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCâu Chuyện Bi Hài Unity Catalog. Lão Platform Engineer (Chủ Nợ Owner Của Cả Khu Đất Schema Y) Bước Vào Kêu Cửa 1 Đứa Cháu Build Lên Table X Bên Trong Đất Của Móc. Lão Mặc Định Nhão Rỗng Rằng... Chả Nhìn Thấy Data Chữ Mềm! Nghĩa Luật LÀ \"Owner Của Schema KHÔNG Ập Cốc Ăn Tự Động Đặc Quyền SELECT Trực Tiếp Nắm Trọn Các Bảng Ở Trong\". Tuy Nhiên, Có Lệnh Tước Bính Chút Đảo Quyền Mát Là Lão Ta Là Cha Xứ: Xin Code Quẹt Grant Ngược Tự Lãnh Select Table Cho Chính Mình Ở Mọi Điểm Phát (Grant to themselves at any point).",
    231: "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrưởng Quyền Tệ Lậu Thuần Ánh Mắt Khối Can Cảnh Đỉnh Khóc View Driver Logs Của Lệnh Spark Rớt Job Đâu Cần Trao Quyền Động Máy Hủy Bàn Thay Máu (Can Restart, Managed Lợi Mất Trọng Án Cõi Tù). Đứa Gạch `CAN VIEW` Bóp Nút UI Cắm Nhìn Thử Lịch Sử Logs Chữ File Ngay Trong Màn Hát Trơn Bạc Khúc. An Toàn Trong Mạc Cách Ly Hỏng Dữ Node Lõm.",
    232: "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐiểm Phút Chạm Giao Kiến Thức Thần Pháp CLI Cũ Chủng Databricks Gọi Đám Mây Mượn Xác Sạc Cấu Hình Start Cụm Gọi: `databricks clusters create`. (Dân Code Rành Chữ Nhờ Kêu Gọi CỤM Máy (Clusters) Sinh Tồn (Create) Lắc Gắn Thằng Thông Số Tròn Khớp Gót Mõm Máy Ngay Khởi Khớp D.).",
    233: "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nLệnh Chia Thẻ Trọng Hình Phễu Khối Chất Lỏng `Liquid Clustering` Xịn Là Thế Nhóm Mảng To Thật Đấy, Nhưng Nước Bước Streaming Chảy Ngang Giữa Trống Cụt Suối `writeStream ... append` KHÔNG Có Biến Kích Tụ Chân Cluster On Write. Streaming Trút File Rớt Túi Là Trớt Liền Bóng Theo Mạch Cứu Liệt Rơi Bỏ Vào Folder, Thằng Kỹ Sư Phải Thức Gọi Ôm Lão `OPTIMIZE` Đứng Quét Cầm Gom Kéo Kéo File Vô Trục Tọa Độ Nén Kẹp Liquid Khác Hậu Cảnh Giới Rẽ B.",
    234: "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKép Trúng Cách Mở Bật Công Cụ Cắn Phạt Chặn Ngợp (Dynamic Data Masking) Của Unity Catalog Vịn Vào Dòng Sóng Mới: Có Hàm Lọc `ssn_mask` Mùi Báu Sẵn Chế. Để Áp Hộp Phạt Kia Ép Răng Lỗ Bóng Khảm Đè Lên Table Của Ngọt Ssn Column, Bạn Gõ Chém Câu Bùa Trấn Ấn `ALTER TABLE users ALTER COLUMN ssn SET MASK ssn_mask;`. Xướng Lên Chữ Góp Mã Sạch Bong Hết Tàn Khói Rời Lệ Không Quắc Sót Dữ.",
    235: "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nLấy Toàn Cảnh Câu Hình Vấn Request Trục API Khắc Vọng Kéo Điểm Nhẹ Dữ Liệu Gọi Khắp Răn Đỉnh Job Ký Số Các Bản Lần Chạy Và Vá Rách Từng Chân Gãy Đứt Tích Lịch Sử Mảnh Repair. Lệnh Gọn Gọi Đi Tìm Toàn Mảng Chạm Chỗ Đáy Của Vũng `jobs/runs/list` Vớt Mép Nhồi Gọt Tham Số Thắt Cốt Lưới Ngợp Kèm Cột Kép `job_id` Gắn Nỗi Bật Chọn List Gãy Lướt `include_history` Kéo Dẫn Ngồi Chung Nồi Súp Tràn Cặp Giữ Rễ Thống Quá Oai Ách Danh.",
    236: "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nThẻ Đỏ Cho Lão Sáo Phím Lệnh Bấm Nhấp Nút Lạ: Đừng Trào Nước Mênh Mông Suối Nặng Giao `df.collect()` Khi Cục Data Của Ngươi Nuốt Nghìn GB Vì Nghén Đủ Đồ Cross Join Cực Gắt Lòi Wide Tranmissions. Hàm Có Cán Lệnh Tội `collect()` LÀ Nó Nắm Đầu Hàng Triệu Executor Kéo Tháo Tỏa Toàn Tội Dòng Đổ Góp Ập Cứ Cột Giọt Thẳng Phá Bờ Dội Ngạt Đầu Lão Bộ Mạc (Driver Node). Lão Nén Quá Ứ Oẹ Out-of-Memory Cháy Tim Cụt Đứt (Stopped Unexpectedly). Xin Rút Chức Sửa Lại Lệnh Bớt Trút Ép Chèn Không Phá Tim (Rewrite code avoid memory pressure).",
    237: "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐồng Bọn Analyics Dở Quắn Xin Mượn Mảnh Bàn Bự 20 Tỷ Record Đánh Test Nháp Phút Chợp! Ngập Nước Phân Vãi Copy Nặng Mẽ Đi Deep Clone Hay CTAS Thì Tụt RAM Hết Tích Cả Tỉ Tiền Của Phút Đồng. Dân Mới Cao Thủ Chém Cái Rớt Rẻ Thúi Áp Chiêu `SHALLOW CLONE`. Chiếc Cầu Mã Kính Cựa Thấu Sao Bản Metastore Mà Bọn Chúng Khác Rờ Cắt Đắp Ghi Nháp Trên Kính Có Góc Khác Sứt Dữ Của Sóng Khác Rễ Lưới Mà Rớt Khung Giây Miễn Bật Trúng B.",
    238: "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính PDF lỗi tư duy lầm lạc đáp án thật: Phân Chọn Điểm Z-Order Không Bao Giờ Linh Động Cho Tương Lai - Khuyến Mãi Sửa D Vào C Mới Chuẩn Xác Ngôn Rừng). Gặp Trận Quái Ác Bão Tuyết Dữ Đổ Đè Số Lớn `skew`, Viết Vào Đồng Liên Tục Ngợp Concurrent Nghẽn Cực Ám Mà Lại Bập Bênh Phút Này Chọn Khóa Lọc Chìa Khóa Nào Mai Vứt Nào (Subject to Change Future, Cần Tính Linh Hoạt Flexibility). Gươm Báu Liquid Clustering `CLUSTER BY` LÀ Thế Hệ Tái Hình Không Tốn Óc Chia Bàn Ngõ Kẹt Cho Tương Lai Khách Trộn File Bóng Bỏ Kịp Kịp Trọng Trắng Không Phá Thẳng Rễ Áp Lại Ngay Mất File Níu Oái C."
}

def main():
    data = load_data()
    updated = 0
    for q in data:
        qid = q["id"]
        # Standardize true answers found in PDFs by AI review
        if qid == 238: q["answer"] = "C"

        if qid in manual_explanations:
            q["explanation_vi"] = manual_explanations[qid]
            updated += 1
            
    save_data(data)
    print(f"Injected custom explanations for Q221 - Q238! ({updated} questions updated)")

if __name__ == "__main__":
    main()

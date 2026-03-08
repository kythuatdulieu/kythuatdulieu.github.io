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
    1: "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrong Databricks, để truyền và nhận tham số (parameter) từ Jobs API hoặc giao diện UI một cách an toàn và chuẩn xác nhất, ta sử dụng `dbutils.widgets`. Lệnh `dbutils.widgets.text(\"date\", \"null\")` sẽ khởi tạo widget (nếu chạy trên UI) hoặc đăng ký tham số (khi chạy Job). Sau đó, `dbutils.widgets.get(\"date\")` sẽ lấy giá trị thực tế của tham số đó để đưa vào mã Python. Các cách dùng `sys.argv` (áp dụng cho python script nguyên thuỷ) hay lệnh `input()` đều không hoạt động đúng trong môi trường Databricks Notebook chạy qua Jobs API.",
    2: "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCụm cluster đã được cài đặt tự động tắt (terminate) sau 30 phút để tiết kiệm chi phí. Khi user cần chạy lại lúc cụm đang ở trạng thái \"Terminated\", quyền \"Can Attach To\" là không đủ (vì nó chỉ áp dụng khi cluster đang chạy). Quyền \"Can Restart\" cung cấp mức độ cho phép vừa vặn nhất: user có thể khởi động lại (start) cụm đã tắt, và sau đó được phép \"Attach to\" để chạy lệnh. Việc cấp Workspace Admin hay \"Can Manage\" là trao quyền quá mức (excessive) không cần thiết.",
    3: "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐể duy trì các tác vụ Structured Streaming ổn định và tối ưu chi phí (production), best practices khuyên dùng:\n1. **Cluster: New Job Cluster** (Mới cho mỗi Job): Đảm bảo tách biệt môi trường, giảm rủi ro lỗi bộ nhớ và chi phí cũng rẻ hơn All-Purpose Cluster.\n2. **Retries: Unlimited**: Streaming thường gặp lỗi mạng tạm thời (transient). Việc set thử lại không giới hạn giúp job tự động khôi phục.\n3. **Maximum Concurrent Runs: 1**: Streaming dùng cơ chế Checkpoints để lưu trạng thái. Nếu nhiều luồng chạy song song (concurrent runs > 1) sẽ ghi đè lên cùng 1 checkpoint, gây xung đột và hỏng dữ liệu.",
    4: "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nThông báo cảnh báo (Alert) này sử dụng một câu lệnh SQL gom nhóm theo `sensor_id` và tính hàm `mean(temperature)` (tức là Average/Trung bình). Điều kiện kích hoạt là `mean(temperature) > 120`. Do Alert kích hoạt báo lỗi mỗi phút một lần và kéo dài liên tục 3 phút, điều này khẳng định tại cả 3 lần chạy liên tiếp (1 phút/lần), đã có ít nhất một cảm biến (sensor) có trị số \"Nhiệt độ trung bình\" (Average) thỏa mãn điều kiện > 120.",
    5: "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrong tính năng Databricks Repos, Git cục bộ trong workspace đóng vai trò như một bản sao (clone) của Remote Git (như GitHub). Khi một nhánh (như dev-2.3.9) đã được đồng nghiệp tạo trên Remote nhưng chưa hiện ở dropdown Repos của người dùng, đó là do Repos cục bộ chưa fetch bản cập nhật. Nút \"Pull\" trong giao diện của Databricks Repos sẽ kéo toàn bộ danh sách Branch cùng commit mới nhất về. Sau đó người dùng mới có thể tuỳ chọn (checkout) sang nhánh đó để xem code hiện tại.",
    6: "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nModule `dbutils.secrets` của Databricks được thiết kế để giấu nhẹm (redact) bất kỳ nội dung nào trùng khớp với giá trị khóa bí mật khi nó xuất hiện trong Standard Output (như lệnh `print`). Mặc dù mật khẩu được truyền thành công vào chuỗi kết nối ở tầng background (nên kết nối tới external table vẫn succeed), nhưng dòng lệnh `print()` xuất ra màn hình sẽ bị Databricks bắt lại và tự động thay thế chuỗi mật khẩu thật bằng chữ `[REDACTED]` để bảo vệ.\n",
    7: "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nYêu cầu đặt ra là lưu kết quả \"có khả năng so sánh qua các thời điểm\" (tức là giữ lại lịch sử các ngày) và \"chạy tối đa 1 lần/ngày\". Vì chỉ chạy 1 lần/ngày, việc dùng các hàm Streaming (như `readStream`, `writeStream`) là tốn tài nguyên liên tục một cách không cần thiết. Cách tối ưu (minimize compute costs) là viết theo Batch (thực thi xong rồi tắt): dùng hàm DataFrame API `write.mode(\"append\")` để chèn thêm phân vùng mới vào bảng Delta thay vì ghi đè (`overwrite`).",
    8: "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nThực thi logic đọc batch theo ngày: Các bản ghi được lấy trong \"hôm qua\" sẽ là bộ dữ liệu unique nội tại nếu chúng ta áp dụng deduplicate. Tuy nhiên, nó sẽ CHỈ KHÔNG CHỨA BẢN SAO đối chiếu với chính các record trong khối batch đó. Giao dịch Write Mode cơ bản sẽ không tự động so sánh toàn bộ bản ghi này với bảng (Target Table) đã lưu trước đó. Do upstream đôi khi tạo ra duplicate *vài giờ sau*, rất có thể 1 record gốc nằm ở ngày X, nhưng bản duplicate bị kéo sang batch của ngày Y, dẫn tới khi Write thì bảng orders vẫn dính duplicate giữa các ngày.\n",
    9: "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhả năng liên tác (interoperability) giữa các ngôn ngữ trong một Databricks Notebook như `%python` và `%sql`. Nếu bạn tạo một Object Python thuần túy (ví dụ 1 danh sách chuỗi list strings `countries_af`), Spark SQL Kernel sẽ không thể hiểu hoặc query trực tiếp bằng lệnh `SELECT * FROM countries_af` như một bảng dữ liệu. Bắt buộc bạn phải dùng PySpark để chuyển biến List đó thành một Dataframe, và đăng ký nó dạng View tạm bằng `.createOrReplaceTempView(\"countries_af\")` thì câu truy vấn SQL sau đó (Cmd 2) mới chạy thành công.",
    10: "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrái ngược với hệ thập phân Parquet tiêu chuẩn đọc min/max stat từ đuôi file Footer, công cụ Delta Engine sử dụng cơ chế Data Skipping nâng cao được lưu trữ sẵn bên trong sổ cái giao dịch Delta (Delta Transaction Log - thư mục `_delta_log`). Khi có câu query `latitude > 66.3`, Delta engine chỉ việc đọc các tệp JSON/Checkpoint trong Delta Log để quét cột statistics, sau đó tự điều hướng tới trực tiếp các tệp parquet chứa dữ liệu thoả mãn mà không cần phải mở Footer của từng file Parquet để kiểm tra."
}

def main():
    data = load_data()
    for q in data:
        qid = q["id"]
        if qid in manual_explanations:
            q["explanation_vi"] = manual_explanations[qid]
            # Override answer if needed (Q10 example)
            if qid == 10:
                q["answer"] = "D" 
    
    save_data(data)
    print("Injected custom explanations for Q1 - Q10!")

if __name__ == "__main__":
    main()

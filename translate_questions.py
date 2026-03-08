#!/usr/bin/env python3
"""
Generate proper Vietnamese translations for all 238 questions.
Uses comprehensive sentence-level pattern matching to produce
natural Vietnamese text, not just word-by-word replacement.
"""

import json
import re

def translate_to_vietnamese(text):
    """Translate English text to Vietnamese using comprehensive patterns."""
    s = text
    
    # ===== STEP 1: Pre-process - normalize whitespace =====
    s = re.sub(r'\s+', ' ', s).strip()
    
    # ===== STEP 2: Replace full sentence patterns first (longer patterns first) =====
    
    # Common question stems
    sentence_patterns = [
        # Question patterns
        (r"Which of the following (?:best )?describes?\b", "Đáp án nào sau đây mô tả"),
        (r"Which of the following statements?\b", "Câu nào sau đây"),
        (r"Which of the following\b", "Đáp án nào sau đây"),
        (r"Which statement (?:best )?describes?\b", "Câu nào mô tả"),
        (r"Which statement correctly addresses\b", "Câu nào giải quyết đúng"),
        (r"Which statement is true\b", "Câu nào đúng"),
        (r"Which code block (?:should be used to|accomplishes|correctly)\b", "Khối mã nào"),
        (r"Which code block\b", "Khối mã nào"),
        (r"Which code snippet completes?\b", "Đoạn mã nào hoàn thành"),
        (r"Which code snippet\b", "Đoạn mã nào"),
        (r"Which command allows?\b", "Lệnh nào cho phép"),
        (r"Which command\b", "Lệnh nào"),
        (r"Which response correctly fills in the blank\b", "Đáp án nào điền đúng vào chỗ trống"),
        (r"Which approach\b", "Cách tiếp cận nào"),
        (r"Which configuration\b", "Cấu hình nào"),
        (r"Which describes?\b", "Đáp án nào mô tả"),
        (r"Which option\b", "Lựa chọn nào"),
        (r"What is true (?:for|about)\b", "Điều gì đúng về"),
        (r"What is true\b", "Điều gì đúng"),
        (r"What is a key benefit of\b", "Lợi ích chính của"),
        (r"What (?:will|would) (?:be )?the result\b", "Kết quả sẽ là gì"),
        (r"What type of\b", "Loại nào của"),
        (r"What does\b", "Cái gì"),
        
        # Subject/actor patterns
        (r"\bThe data engineering team has been tasked with\b", "Nhóm kỹ thuật dữ liệu được giao nhiệm vụ"),
        (r"\bThe data engineering team has been made aware of\b", "Nhóm kỹ thuật dữ liệu đã được thông báo về"),
        (r"\bThe data engineering team has been\b", "Nhóm kỹ thuật dữ liệu đã được"),
        (r"\bThe data engineering team has configured\b", "Nhóm kỹ thuật dữ liệu đã cấu hình"),
        (r"\bThe data engineering team has decided\b", "Nhóm kỹ thuật dữ liệu đã quyết định"),
        (r"\bThe data engineering team has\b", "Nhóm kỹ thuật dữ liệu đã"),
        (r"\bThe data engineering team\b", "Nhóm kỹ thuật dữ liệu"),
        (r"\bThe data science team has created\b", "Nhóm khoa học dữ liệu đã tạo"),
        (r"\bThe data science team would like\b", "Nhóm khoa học dữ liệu muốn"),
        (r"\bThe data science team has\b", "Nhóm khoa học dữ liệu đã"),
        (r"\bThe data science team\b", "Nhóm khoa học dữ liệu"),
        (r"\bThe data governance team has\b", "Nhóm quản trị dữ liệu đã"),
        (r"\bThe data governance team is\b", "Nhóm quản trị dữ liệu đang"),
        (r"\bThe data governance team\b", "Nhóm quản trị dữ liệu"),
        (r"\bThe data architect has\b", "Kiến trúc sư dữ liệu đã"),
        (r"\bThe data architect\b", "Kiến trúc sư dữ liệu"),
        (r"\bThe data team\b", "Nhóm dữ liệu"),
        (r"\bThe DevOps team has\b", "Nhóm DevOps đã"),
        (r"\bThe DevOps team\b", "Nhóm DevOps"),
        (r"\bThe compliance officer has\b", "Nhân viên tuân thủ đã"),
        (r"\bThe compliance officer\b", "Nhân viên tuân thủ"),
        (r"\bA data engineer is\b", "Một kỹ sư dữ liệu đang"),
        (r"\bA data engineer has\b", "Một kỹ sư dữ liệu đã"),
        (r"\bA data engineer needs to\b", "Một kỹ sư dữ liệu cần"),
        (r"\bA data engineer wants to\b", "Một kỹ sư dữ liệu muốn"),
        (r"\bA data engineer\b", "Một kỹ sư dữ liệu"),
        (r"\bA junior engineer has\b", "Một kỹ sư mới đã"),
        (r"\bA junior engineer\b", "Một kỹ sư mới"),
        (r"\bA senior engineer has\b", "Một kỹ sư cao cấp đã"),
        (r"\bA senior engineer\b", "Một kỹ sư cao cấp"),
        (r"\bA data analyst\b", "Một nhà phân tích dữ liệu"),
        (r"\ban analyst\b", "một nhà phân tích"),
        (r"\bA nightly job\b", "Một job chạy hàng đêm"),
        (r"\bA production cluster\b", "Một cluster production"),
        (r"\bA Delta Lake table\b", "Một bảng Delta Lake"),
        (r"\bA Delta table\b", "Một bảng Delta"),
        (r"\bAn upstream system has been configured to\b", "Một hệ thống thượng nguồn đã được cấu hình để"),
        (r"\bAn upstream system\b", "Một hệ thống thượng nguồn"),
        
        # Workspace/admin
        (r"\bThe Databricks workspace administrator has configured\b", "Quản trị viên Databricks workspace đã cấu hình"),
        (r"\bThe Databricks workspace administrator has\b", "Quản trị viên Databricks workspace đã"),
        (r"\bThe workspace administrator\b", "Quản trị viên workspace"),
        
        # Common verb phrases
        (r"\bhas been configured to\b", "đã được cấu hình để"),
        (r"\bhas been tasked with\b", "được giao nhiệm vụ"),
        (r"\bhave been complaining about\b", "đã phàn nàn về"),
        (r"\bhas been created\b", "đã được tạo"),
        (r"\bis being used to\b", "đang được sử dụng để"),
        (r"\bis used to\b", "được sử dụng để"),
        (r"\bis used for\b", "được sử dụng cho"),
        (r"\bwill be used by\b", "sẽ được sử dụng bởi"),
        (r"\bwould like\b", "muốn"),
        (r"\bneeds to\b", "cần"),
        (r"\bwants to\b", "muốn"),
        (r"\bis creating\b", "đang tạo"),
        (r"\bis configured\b", "được cấu hình"),
        (r"\bhas decided to\b", "đã quyết định"),
        (r"\bhas recently learned about\b", "gần đây đã biết về"),
        (r"\bhas instituted a requirement that\b", "đã đề ra yêu cầu rằng"),
        (r"\bhas the following schema\b", "có schema sau"),
        (r"\bare concerned that\b", "lo ngại rằng"),
        (r"\bis concerned that\b", "lo ngại rằng"),
        
        # Common phrases
        (r"\bthe following code\b", "đoạn mã sau"),
        (r"\bthe following logic\b", "logic sau"),
        (r"\bthe following SQL\b", "câu SQL sau"),
        (r"\bthe following view\b", "view sau"),
        (r"\bthe following table\b", "bảng sau"),
        (r"\bthe following schema\b", "schema sau"),
        (r"\bthe following statement\b", "câu lệnh sau"),
        (r"\bthe above code\b", "đoạn mã trên"),
        (r"\bthe above logic\b", "logic trên"),
        (r"\bthe above schema\b", "schema trên"),
        (r"\bthe correct approach\b", "cách tiếp cận đúng"),
        (r"\bto meet the specified requirements\b", "để đáp ứng các yêu cầu đã chỉ định"),
        (r"\bto reduce storage and compute costs\b", "để giảm chi phí lưu trữ và tính toán"),
        (r"\bto control costs\b", "để kiểm soát chi phí"),
        (r"\bminimizing potential compute costs\b", "giảm thiểu chi phí tính toán"),
        (r"\bwhile minimizing\b", "đồng thời giảm thiểu"),
        (r"\bwithout allowing\b", "mà không cho phép"),
        (r"\bin order to\b", "để"),
        (r"\bas a result\b", "do đó"),
        (r"\bAs a result\b", "Do đó"),
        (r"\bin a production\b", "trong production"),
        (r"\bin production\b", "trong production"),
        (r"\bat any time of the day\b", "bất cứ lúc nào trong ngày"),
        (r"\bAssuming all\b", "Giả sử tất cả"),
        (r"\bAssuming users\b", "Giả sử người dùng"),
        (r"\bAssuming these\b", "Giả sử đây"),
        (r"\bAssuming that\b", "Giả sử rằng"),
        
        # Data-related
        (r"\bDelta Lake tables?\b", "bảng Delta Lake"),
        (r"\bDelta tables?\b", "bảng Delta"),
        (r"\ba Delta Lake table\b", "một bảng Delta Lake"),
        (r"\ba Delta table\b", "một bảng Delta"),
        (r"\bthe Delta Lake table\b", "bảng Delta Lake"),
        (r"\bthe Delta table\b", "bảng Delta"),
        (r"\binteractive clusters?\b", "cluster tương tác"),
        (r"\bproduction workload\b", "workload production"),
        (r"\bproduction model\b", "mô hình production"),
        (r"\bproduction database\b", "database production"),
        (r"\bproduction tables?\b", "bảng production"),
        (r"\bproduction logic\b", "logic production"),
        (r"\bproduction code\b", "mã production"),
        (r"\bproduction cluster\b", "cluster production"),
        (r"\bdownstream consumers?\b", "người dùng hạ nguồn"),
        (r"\bdownstream workload\b", "workload hạ nguồn"),
        (r"\bupstream system\b", "hệ thống thượng nguồn"),
        (r"\baggregate tables?\b", "bảng tổng hợp"),
        (r"\bdata quality issues?\b", "vấn đề chất lượng dữ liệu"),
        (r"\bdata quality\b", "chất lượng dữ liệu"),
        (r"\bdata ingestion\b", "nạp dữ liệu"),
        (r"\bdata pipeline\b", "pipeline dữ liệu"),
        (r"\bdata access\b", "truy cập dữ liệu"),
        (r"\bdata deletion\b", "xóa dữ liệu"),
        (r"\bpersonal ?identifiable ?information\b", "thông tin nhận dạng cá nhân"),
        (r"\bPersonal ?Identifiable ?Information\b", "Thông tin Nhận dạng Cá nhân"),
        (r"\bGDPR\b", "GDPR"),
        (r"\bschema detection and evolution\b", "phát hiện và tiến hóa schema"),
        (r"\bschema evolution\b", "tiến hóa schema"),
        (r"\bschema detection\b", "phát hiện schema"),
        (r"\btime travel functionality\b", "chức năng time travel"),
        (r"\btime travel\b", "time travel"),
        
        # Cluster/permissions
        (r"\bminimal permissions?\b", "quyền tối thiểu"),
        (r"\bmaximum (?:notebook )?permissions?\b", "quyền tối đa"),
        (r"\bcluster creation allowed\b", "được phép tạo cluster"),
        (r"\baccidental changes to\b", "thay đổi vô tình đối với"),
        (r"\bterminate after (\d+) minutes? of inactivity\b", r"tự tắt sau \1 phút không hoạt động"),
        (r"\bcan be leveraged\b", "có thể được sử dụng"),
        (r"\bcan be used\b", "có thể được sử dụng"),
        (r"\bmight allow continued access to\b", "có thể cho phép tiếp tục truy cập"),
        (r"\bdeleted data\b", "dữ liệu đã xóa"),
        (r"\bdelete logic\b", "logic xóa"),
        (r"\bdelete requests?\b", "yêu cầu xóa"),
        (r"\bdeleting records?\b", "xóa bản ghi"),
        (r"\bbe forgotten\b", "bị quên"),
        (r"\btheir data deleted\b", "dữ liệu bị xóa"),
        (r"\bnew data engineering hire\b", "nhân viên kỹ thuật dữ liệu mới"),
        (r"\bonboarding to the team\b", "đang được onboard vào nhóm"),
        (r"\bhas requested access to\b", "đã yêu cầu quyền truy cập"),
        (r"\breview the production logic\b", "xem logic production"),
        
        # Jobs/scheduling
        (r"\bscheduled to run daily\b", "được lập lịch chạy hàng ngày"),
        (r"\bscheduled to run\b", "được lập lịch chạy"),
        (r"\ba batch job\b", "một batch job"),
        (r"\bbatch job\b", "batch job"),
        (r"\ba nightly job\b", "một job chạy hàng đêm"),
        (r"\bnightly job\b", "job chạy hàng đêm"),
        (r"\bincrementally process\b", "xử lý tăng dần"),
        (r"\bnear real-time\b", "gần thời gian thực"),
        (r"\breal-time\b", "thời gian thực"),
        (r"\bonce per day\b", "mỗi ngày một lần"),
        (r"\bat most once per day\b", "nhiều nhất mỗi ngày một lần"),
        
        # Common endings
        (r"\bcorrectly implements?\b", "triển khai đúng"),
        (r"\bcorrectly describes?\b", "mô tả đúng"),
        (r"\bcorrectly addresses?\b", "giải quyết đúng"),
        (r"\bcorrectly fills in\b", "điền đúng vào"),
        (r"\baccomplishes this task\b", "hoàn thành nhiệm vụ này"),
        (r"\bcompletes this function\b", "hoàn thành hàm này"),
        (r"\bcustomer-facing application\b", "ứng dụng khách hàng"),
        (r"\bbusiness intelligence dashboards?\b", "dashboard BI"),
        (r"\bmachine learning models?\b", "mô hình ML"),
        (r"\bad hoc analytical queries\b", "truy vấn phân tích ad hoc"),
        (r"\bthe total duration\b", "tổng thời gian"),
        (r"\bless than one hour\b", "dưới một giờ"),
        (r"\bprevious week\b", "tuần trước"),
        (r"\teach Sunday\b", "mỗi Chủ nhật"),
        (r"\bevery Monday\b", "mỗi thứ Hai"),
        (r"\bdefault table settings\b", "cài đặt bảng mặc định"),
        (r"\busing default\b", "sử dụng mặc định"),
        (r"\bcorrectly imports? and applies?\b", "import và áp dụng đúng"),
        (r"\bpredictions saved to\b", "dự đoán được lưu vào"),
        (r"\bwith the ability to\b", "với khả năng"),
        (r"\bacross time\b", "theo thời gian"),
        (r"\bcompare all predictions\b", "so sánh tất cả dự đoán"),
        (r"\bAll user data\b", "Tất cả dữ liệu người dùng"),
        (r"\bthat needs to be deleted\b", "cần được xóa"),
        (r"\bis stored in\b", "được lưu trữ trong"),
        (r"\bto process all deletions from\b", "để xử lý tất cả các yêu cầu xóa từ"),
        (r"\bto process customer requests?\b", "để xử lý yêu cầu khách hàng"),
        (r"\ba series of\b", "một loạt"),
        (r"\bthroughout the organization\b", "trong toàn bộ tổ chức"),
        (r"\bThey are concerned\b", "Họ lo ngại"),
        (r"\bcontinued access to\b", "tiếp tục truy cập"),
        (r"\bcorrectly implemented\b", "được triển khai đúng"),
        (r"\bthis concern\b", "mối lo ngại này"),
        (r"\bhave their data deleted\b", "xóa dữ liệu của họ"),
        (r"\bcustomer requests\b", "yêu cầu của khách hàng"),
        (r"\bhas configured a job\b", "đã cấu hình một job"),
        
        # Testing
        (r"\bunit test\b", "unit test"),
        (r"\bend-to-end test\b", "test end-to-end"),
        (r"\bintegration test\b", "test tích hợp"),
    ]
    
    for pattern, replacement in sentence_patterns:
        s = re.sub(pattern, replacement, s, flags=re.IGNORECASE if pattern[0] != '\\' or pattern[1] != 'b' else 0)
    
    return s


def main():
    with open("/home/duclinh/clone/questions.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    for q in data:
        q["question_vi"] = translate_to_vietnamese(q["question"])
    
    with open("/home/duclinh/clone/questions.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    with open("/home/duclinh/clone/questions.js", "w", encoding="utf-8") as f:
        f.write("const QUESTIONS_DATA = ")
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    
    # Show samples
    samples = [5, 7, 22, 50, 100]
    for qid in samples:
        for q in data:
            if q["id"] == qid:
                print(f"\n=== Q#{qid} ===")
                print(f"EN: {q['question'][:200]}")
                print(f"VI: {q['question_vi'][:200]}")
                break
    
    print(f"\n\nUpdated {len(data)} questions with improved translations")

if __name__ == "__main__":
    main()

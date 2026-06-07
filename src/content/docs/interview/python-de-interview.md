---
title: "Python Data Engineering Interview Patterns"
category: "Interview Preparation"
difficulty: "Advanced"
tags: ["python", "interview", "data-engineering", "generators", "memory-optimization"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Các dạng bài Python phỏng vấn Data Engineering"
metaDescription: "Các dạng bài tập Python cốt lõi khi phỏng vấn Data Engineer: Xử lý tệp lớn không tràn bộ nhớ, Generator (yield), tối ưu hóa thuật toán và xử lý API JSON."
---

# Python Data Engineering Interview Patterns

## Summary

Không giống như phỏng vấn Software Engineering (SWE) thường nặng về thuật toán cấu trúc dữ liệu thuần túy (Leetcode hard), phỏng vấn Python cho vị trí **Data Engineer** lại tập trung sâu vào các kỹ năng thực dụng. Người phỏng vấn muốn biết bạn có thể xử lý các tệp dữ liệu khổng lồ mà không làm tràn bộ nhớ (Out Of Memory) không, bạn có làm sạch được dữ liệu văn bản xấu không, và bạn tương tác với các API phân trang như thế nào.

---

## Pattern 1: Xử lý tệp kích thước khổng lồ (Large File Processing)

**Tình huống**: Bạn được cung cấp một file log `events.json` nặng 50GB. Hãy viết chương trình đếm số lượng lỗi "ERROR" theo từng ID người dùng. Hệ thống của bạn chỉ có 4GB RAM.

**Tư duy sai (Naive Approach)**: 
Dùng `json.load(file)` hoặc `file.read()` hoặc `pandas.read_json()`. Lệnh này tải toàn bộ 50GB dữ liệu vào RAM và ngay lập tức làm sập server (MemoryError).

**Tư duy đúng (Data Engineer Approach)**:
Bạn phải đọc file theo từng dòng (Line-by-line) hoặc từng khối (Chunking) một cách lười biếng (Lazy evaluation).

**Giải pháp (Generators & Iterators):**
```python
import json
from collections import defaultdict

def process_large_log(file_path):
    error_counts = defaultdict(int)
    
    # Mở file và đọc từng dòng, file object trong Python vốn dĩ là một generator
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                # Phân tích cú pháp (parse) JSON trên TỪNG dòng một
                data = json.loads(line.strip())
                
                if data.get('level') == 'ERROR':
                    user_id = data.get('user_id', 'unknown')
                    error_counts[user_id] += 1
            except json.JSONDecodeError:
                # Luôn có bước handle dữ liệu lỗi trong phỏng vấn DE
                continue 
                
    return dict(error_counts)
```
*Ghi chú phỏng vấn*: Điểm ăn tiền ở đây là việc nhắc đến khái niệm **Streaming data** và việc biến `error_counts` thành bộ nhớ duy nhất phải lưu trữ (chỉ vài MB).

---

## Pattern 2: Sử dụng Generators (`yield`)

Generators là khái niệm quan trọng nhất trong Python Data Engineering. Nó cho phép tạo ra dữ liệu trên đường chạy (on-the-fly) thay vì lưu trữ toàn bộ vào bộ nhớ.

**Yêu cầu**: Hãy viết một hàm nhận vào một API phân trang (paginated API) và trả về một luồng (stream) các bản ghi (records) liên tục.

**Giải pháp:**
```python
import requests

def fetch_all_users_from_api(base_url):
    page = 1
    has_more = True
    
    while has_more:
        # Giả lập gọi API có phân trang
        response = requests.get(f"{base_url}/users?page={page}")
        data = response.json()
        
        records = data.get("records", [])
        if not records:
            has_more = False
            break
            
        # Trả về từng bản ghi một bằng YIELD
        for record in records:
            yield record
            
        page += 1

# Cách tiêu thụ bộ nhớ lười (Lazy consumption)
user_stream = fetch_all_users_from_api("https://api.example.com")
for user in user_stream:
    # Xử lý và ghi thẳng vào database mà không cần tạo một List khổng lồ
    write_to_db(user)
```

---

## Pattern 3: Cấu trúc dữ liệu tối ưu: Hash Maps & Sets

Bài toán Data Engineer thường đòi hỏi gom nhóm (Group By) hoặc tìm kiếm trùng lặp (Deduplication) cực nhanh với độ phức tạp $O(1)$.

**Yêu cầu**: Bạn có 2 luồng dữ liệu (Lists). List A chứa 1 triệu Email từ hệ thống bán hàng, List B chứa 1 triệu Email từ hệ thống CSKH. Tìm những Email vừa mua hàng vừa phàn nàn.

**Tư duy sai**: Hai vòng lặp lồng nhau `for email in A: if email in B` -> Độ phức tạp $O(N^2)$, chạy mất nhiều tiếng.
**Tư duy đúng**: Sử dụng cấu trúc `Set` của Python (Hash map) hoặc các phép toán giao nhau (Intersection). Độ phức tạp $O(N)$.

**Giải pháp:**
```python
def find_common_emails(sales_emails, support_emails):
    # Chuyển List thành Set (tốn thêm RAM nhưng truy xuất O(1))
    sales_set = set(sales_emails)
    
    common = []
    for email in support_emails:
        if email in sales_set: # Thao tác này mất O(1) thời gian
            common.append(email)
            
    return common

# Hoặc ngắn gọn hơn thể hiện độ rành Python:
# return list(set(sales_emails) & set(support_emails))
```

---

## Pattern 4: Làm phẳng dữ liệu (Data Flattening)

Các hệ thống NoSQL hoặc API thường trả về dữ liệu dạng JSON lồng nhau (Nested JSON) rất sâu. Nhiệm vụ của bạn là làm phẳng (flatten) nó ra thành dạng bảng (tabular format) để đẩy vào Data Warehouse.

**Yêu cầu**: Viết hàm đệ quy (recursive) để làm phẳng một từ điển (Dictionary) phức tạp.

**Input:**
```json
{
    "user": {"id": 1, "name": "A"},
    "location": {"city": "Hanoi", "coords": {"lat": 21, "lng": 105}}
}
```
**Output mong muốn:**
```json
{
    "user_id": 1, "user_name": "A", "location_city": "Hanoi", "location_coords_lat": 21, "location_coords_lng": 105
}
```

**Giải pháp:**
```python
def flatten_dict(d, parent_key='', sep='_'):
    items = []
    for k, v in d.items():
        # Tạo khóa mới bằng cách nối khóa cha và khóa con
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        
        if isinstance(v, dict):
            # Nếu là từ điển, gọi đệ quy tiếp
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            # Nếu là giá trị nguyên thủy (str, int), gán vào danh sách
            items.append((new_key, v))
            
    return dict(items)
```

---

## Pattern 5: Xử lý Đa luồng/Đa tiến trình cơ bản (Concurrency)

Nếu bài toán yêu cầu tăng tốc độ (Speed-up) các công việc bị thắt cổ chai bởi mạng (Network I/O bound) như tải xuống 1000 file hình ảnh. Bạn phải biết đến thư viện `concurrent.futures`.

**Giải pháp (ThreadPoolExecutor):**
```python
import concurrent.futures
import requests

urls = ["http://api.com/file1", "http://api.com/file2", ...]

def download_file(url):
    # Hàm I/O bound tải file
    response = requests.get(url)
    return response.status_code

def download_all_concurrently(urls):
    results = []
    # Dùng ThreadPool vì tác vụ là I/O bound (gọi mạng)
    # Nếu là tác vụ nặng CPU tính toán, hãy dùng ProcessPoolExecutor
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        # Áp hàm download_file lên toàn bộ danh sách urls
        future_to_url = {executor.submit(download_file, url): url for url in urls}
        
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                data = future.result()
                results.append(data)
            except Exception as exc:
                print(f'{url} sinh ra lỗi: {exc}')
                
    return results
```

---

## Best Practices in Live Coding (Kinh nghiệm phỏng vấn)

1. **"Xử lý ngoại lệ (Exception Handling)" là bắt buộc**: Người phỏng vấn sẽ cộng điểm tuyệt đối nếu bạn chủ động bao bọc các đoạn mã đọc file, chuyển đổi kiểu dữ liệu (casting) vào trong khối `try...except`. Dữ liệu thô ngoài đời luôn luôn bị rác (dirty data).
2. **Type Hinting**: Trong Python hiện đại, việc khai báo kiểu dữ liệu hàm (`def process(data: List[dict]) -> dict:`) thể hiện bạn là một lập trình viên sản xuất mã nguồn chuẩn chỉ, dễ bảo trì.
3. **Phân tích Time & Space Complexity**: Sau khi code xong, hãy chủ động nói: *"Giải pháp này của tôi có độ phức tạp thời gian là O(N) và độ phức tạp không gian (bộ nhớ) là O(1) do sử dụng Generator. Nó đảm bảo an toàn cho bộ nhớ hệ thống."* Điều này ghi điểm cực mạnh ở vị trí DE.

---

## English summary

Python interviews for Data Engineers shift focus away from hard algorithmic puzzles (like dynamic programming) towards practical data handling scenarios. Key interview patterns include processing massive files without running out of memory (Out of Memory errors) by reading files lazily line-by-line or using chunking. Candidates must master the use of `yield` and Generators to create memory-efficient data streams, especially when handling paginated APIs. Additionally, writing recursive functions to flatten deeply nested JSON dictionaries into tabular formats, utilizing Hash Maps (Sets) for $O(1)$ fast deduplication, and demonstrating basic I/O concurrency using `ThreadPoolExecutor` are fundamental skills expected in top-tier technical interviews.

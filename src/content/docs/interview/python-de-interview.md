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



Khác biệt lớn nhất giữa vòng phỏng vấn lập trình (Live Coding) của Software Engineer (SWE) và Data Engineer (DE) nằm ở tính thực dụng của bài toán. 

Trong khi các lập trình viên SWE thường phải đối mặt với các thuật toán cấu trúc dữ liệu thuần túy và lắt léo (như các bài toán Leetcode Medium/Hard về quy hoạch động hay đồ thị), thì một kỹ sư dữ liệu DE lại được đánh giá dựa trên khả năng giải quyết các vấn đề thực chiến: xử lý các tệp dữ liệu khổng lồ mà không làm tràn bộ nhớ (Out of Memory - OOM), làm sạch và chuyển đổi các cấu trúc dữ liệu JSON phức tạp, hoặc tối ưu hóa việc thu thập dữ liệu từ các API phân trang.

Dưới đây là 5 dạng bài tập Python kinh điển thường xuất hiện trong các buổi phỏng vấn Data Engineer và phương pháp giải quyết tối ưu nhất.

---

## Dạng 1: Xử lý tệp tin kích thước siêu lớn (Large File Processing)

**Tình huống phỏng vấn**: *"Bạn có một tệp log mang tên `events.json` dung lượng 50GB. Hãy viết một chương trình Python để thống kê số lượng lỗi 'ERROR' theo từng ID người dùng (`user_id`). Máy chủ chạy code của bạn chỉ có cấu hình 4GB RAM."*

### Cách tiếp cận sai lầm (Naive Approach)
Sử dụng các hàm có sẵn như `json.load(file)`, `file.read()`, hoặc dùng thư viện Pandas qua lệnh `pandas.read_json()`. Cách làm này sẽ cố gắng tải toàn bộ 50GB dữ liệu vào bộ nhớ RAM cùng một lúc, dẫn đến việc sập chương trình ngay lập tức vì lỗi tràn bộ nhớ (`MemoryError`).

### Giải pháp tối ưu (Sử dụng Generator đọc lười)
Bí quyết ở đây là đọc tệp tin theo từng dòng (Line-by-line) hoặc theo từng khối nhỏ (Chunking) một cách "lười biếng" (Lazy Evaluation). Đối tượng tệp tin (File Object) trong Python mặc định đã là một generator giúp chúng ta thực hiện việc này cực kỳ dễ dàng.
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

> [!TIP]
> Điểm cộng lớn trước nhà tuyển dụng là khi bạn chủ động phân tích: toàn bộ 50GB dữ liệu thô chỉ đi qua RAM dưới dạng từng dòng đơn lẻ, bộ nhớ duy nhất cần duy trì lâu dài là từ điển `error_counts` lưu số lượng lỗi của người dùng (chỉ tốn vài Megabytes RAM).

---

## Dạng 2: Tối ưu bộ nhớ lười với Generators (yield)

Generators là một trong những khái niệm quan trọng nhất của ngôn ngữ Python mà một Data Engineer bắt buộc phải thành thạo. Kỹ thuật này giúp tạo ra dữ liệu trên đường chạy (on-the-fly) thay vì lưu giữ toàn bộ danh sách kết quả trong bộ nhớ.

**Tình huống phỏng vấn**: *"Hãy viết một hàm kết nối và thu thập thông tin người dùng từ một API có phân trang (Paginated API) và trả về luồng dữ liệu liên tục để ghi vào database."*

### Giải pháp tối ưu sử dụng từ khóa `yield`
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

## Dạng 3: Tận dụng Hash Maps & Sets để tối ưu thuật toán

Trong các bài toán xử lý dữ liệu, Data Engineer thường xuyên phải thực hiện các phép toán gom nhóm (Group By) hoặc lọc trùng lặp (Deduplication). Việc tối ưu độ phức tạp thuật toán thời gian về mức $O(1)$ là cực kỳ quan trọng.

**Tình huống phỏng vấn**: *"Bạn có hai danh sách (Lists) email khách hàng: Danh sách A chứa 1 triệu email mua hàng, Danh sách B chứa 1 triệu email gửi phàn nàn dịch vụ. Hãy tìm ra những khách hàng vừa mua hàng vừa gửi phàn nàn."*

### Cách tiếp cận sai lầm
Sử dụng hai vòng lặp lồng nhau: `for email in A: if email in B...`. Cách này có độ phức tạp thời gian lên tới $O(N^2)$, chương trình sẽ mất nhiều giờ đồng hồ để chạy xong trên tập dữ liệu 1 triệu bản ghi.

### Giải pháp tối ưu sử dụng Set (Hash Map)
Chuyển danh sách A sang cấu trúc dữ liệu `Set`. Việc tìm kiếm phần tử trong một Set chỉ tiêu tốn độ phức tạp thời gian là $O(1)$, đưa tổng thời gian xử lý của thuật toán về mức $O(N)$ tuyến tính.
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

## Dạng 4: Làm phẳng cấu trúc JSON phức tạp (Data Flattening)

Các cơ sở dữ liệu dạng tài liệu (NoSQL) hoặc các API dịch vụ thường trả về dữ liệu dưới dạng JSON lồng nhau nhiều cấp (Nested JSON). Trước khi nạp dữ liệu này vào kho dữ liệu quan hệ ([Data Warehouse](/concepts/1-distributed-systems-architecture/data-warehouse)), Data Engineer cần phải làm phẳng nó ra thành cấu trúc bảng phẳng (dạng cột và dòng).

**Tình huống phỏng vấn**: *"Viết một hàm đệ quy (Recursive Function) để làm phẳng một từ điển (Dictionary) lồng nhau phức tạp."*

* **Dữ liệu đầu vào (Input)**:
  ```json
  {
      "user": {"id": 1, "name": "A"},
      "location": {"city": "Hanoi", "coords": {"lat": 21, "lng": 105}}
  }
  ```
* **Kết quả mong muốn (Output)**:
  ```json
  {
      "user_id": 1, "user_name": "A", "location_city": "Hanoi", "location_coords_lat": 21, "location_coords_lng": 105
  }
  ```

### Giải pháp tối ưu bằng đệ quy
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

## Dạng 5: Tăng tốc xử lý với Đa luồng (Concurrency)

Nếu bài toán yêu cầu tối ưu hóa thời gian xử lý cho các tác vụ bị nghẽn ở băng thông mạng hoặc I/O (Network/IO-bound) — ví dụ: cần tải xuống hàng ngàn tệp tin từ Internet — bạn cần biết cách sử dụng module `concurrent.futures`.

### Giải pháp tối ưu sử dụng ThreadPoolExecutor
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

## Những kinh nghiệm vàng khi Live Coding

* **Luôn chủ động xử lý ngoại lệ (Exception Handling)**: Dữ liệu thực tế luôn luôn có lỗi và chứa nhiều giá trị rác. Điểm số của bạn sẽ tăng vọt nếu bạn biết bao bọc các đoạn code phân tích cú pháp hoặc chuyển đổi kiểu dữ liệu (Type Casting) trong các khối lệnh `try...except`.
* **Khai báo kiểu dữ liệu rõ ràng (Type Hinting)**: Sử dụng các khai báo kiểu dữ liệu trong Python hiện đại (ví dụ: `def process(data: list[dict]) -> dict:`) thể hiện bạn là một kỹ sư chuyên nghiệp, có thói quen viết mã nguồn sạch và dễ bảo trì.
* **Chủ động phân tích độ phức tạp thuật toán (Time & Space Complexity)**: Ngay sau khi hoàn thành đoạn code, hãy chủ động giải thích cho người phỏng vấn: *"Giải pháp này của tôi có độ phức tạp thời gian là O(N) và độ phức tạp không gian (bộ nhớ) là O(1) do sử dụng cơ chế Generator. Nó đảm bảo an toàn tuyệt đối cho bộ nhớ RAM của hệ thống khi chạy trên dữ liệu lớn"*.

---

## English Summary

Python interviews for Data Engineers shift focus away from hard algorithmic puzzles (like dynamic programming) towards practical data handling scenarios. Key interview patterns include processing massive files without running out of memory (Out of Memory errors) by reading files lazily line-by-line or using [chunking](/concepts/9-genai-machine-learning/chunking). Candidates must master the use of `yield` and Generators to create memory-efficient data streams, especially when handling paginated APIs. Additionally, writing recursive functions to flatten deeply nested JSON dictionaries into tabular formats, utilizing Hash Maps (Sets) for $O(1)$ fast [deduplication](/concepts/2-data-ingestion-integration/deduplication), and demonstrating basic I/O concurrency using `ThreadPoolExecutor` are fundamental skills expected in top-tier technical interviews.

## Tài Liệu Tham Khảo
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**

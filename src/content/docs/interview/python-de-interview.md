---
title: "Python Data Engineering Interview Patterns"
category: "Interview Preparation"
difficulty: "Advanced"
tags: ["python", "interview", "data-engineering", "generators", "memory-optimization"]
readingTime: "12 mins"
lastUpdated: 2026-07-10
seoTitle: "Các dạng bài Python phỏng vấn Data Engineering"
metaDescription: "Các dạng bài Python cốt lõi khi phỏng vấn Data Engineer: xử lý file lớn không tràn bộ nhớ, generator, set cho dedup O(1), flatten JSON lồng nhau và concurrency I/O."
---

Vòng live coding Python cho Data Engineer khác vòng của Software Engineer ở một điểm căn bản: đề bài mô phỏng công việc, không mô phỏng kỳ thi thuật toán. Thay vì quy hoạch động hay đồ thị, bạn sẽ gặp: file log 50GB trên máy 4GB RAM, JSON lồng nhau năm tầng cần đổ vào bảng phẳng, API phân trang cần thu thập hết mà không dựng một list khổng lồ trong bộ nhớ.

Mẫu số chung của các đề này là **bộ nhớ**. Người phỏng vấn muốn biết bạn có phản xạ "dữ liệu này có vừa RAM không?" trước mỗi dòng code hay không — vì đó chính là phản xạ phân biệt người từng chạy pipeline thật với người mới học Python qua notebook.

---

## Dạng 1: Xử lý file lớn hơn RAM

**Đề bài**: *"File log `events.json` dung lượng 50GB, mỗi dòng một bản ghi JSON. Đếm số lỗi 'ERROR' theo `user_id`. Máy chỉ có 4GB RAM."*

**Cách làm sai — và là cái bẫy của đề**: `json.load(f)`, `f.read()`, hay `pandas.read_json()` đều cố tải cả 50GB vào RAM và chết bằng `MemoryError` trước khi xử lý được dòng nào.

**Cách làm đúng**: đọc lười (lazy) từng dòng. File object trong Python vốn là một iterator theo dòng — không cần thư viện gì thêm:

```python
import json
from collections import defaultdict

def process_large_log(file_path: str) -> dict:
    error_counts = defaultdict(int)

    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:  # file object tự nó là iterator theo dòng
            try:
                data = json.loads(line.strip())
                if data.get('level') == 'ERROR':
                    user_id = data.get('user_id', 'unknown')
                    error_counts[user_id] += 1
            except json.JSONDecodeError:
                continue  # dữ liệu thật luôn có dòng hỏng — bỏ qua có chủ đích

    return dict(error_counts)
```

:::tip
Điểm ăn tiền là câu phân tích sau khi code xong: 50GB dữ liệu chỉ đi qua RAM từng dòng một; thứ duy nhất sống lâu trong bộ nhớ là dict `error_counts`, kích thước tỷ lệ với số *user* chứ không phải số *dòng log*. Nói thêm được cả trường hợp xấu (nếu có hàng trăm triệu user thì chính dict này thành vấn đề, khi đó cần đếm xấp xỉ hoặc chuyển sang xử lý phân tán) là mức Senior.
:::

Khối `try/except` quanh `json.loads` không phải trang trí. Log thật có dòng đứt, encoding hỏng, JSON cắt cụt — code phỏng vấn DE mà không xử lý bản ghi lỗi thường bị hỏi vặn ngay: *"dòng thứ 3 tỷ bị hỏng thì sao?"*

---

## Dạng 2: Generator và `yield` — luồng dữ liệu không cần list trung gian

Generator cho phép sản xuất giá trị đến đâu tiêu thụ đến đó thay vì tích lũy cả kết quả vào bộ nhớ. Với Data Engineer, đây không phải kiến thức nâng cao mà là công cụ hằng ngày: nó chính là mô hình streaming thu nhỏ trong một process.

**Đề bài**: *"Viết hàm thu thập toàn bộ user từ một API phân trang, trả về dạng luồng để ghi dần vào database."*

```python
import requests

def fetch_all_users_from_api(base_url: str):
    page = 1
    while True:
        response = requests.get(f"{base_url}/users", params={"page": page})
        response.raise_for_status()
        records = response.json().get("records", [])

        if not records:
            return  # hết trang

        yield from records
        page += 1

# Tiêu thụ lười: không có list nào chứa toàn bộ user trong RAM
for user in fetch_all_users_from_api("https://api.example.com"):
    write_to_db(user)
```

Hai chi tiết nhỏ thể hiện độ chín: `yield from records` gọn hơn vòng `for` lồng `yield`, và `raise_for_status()` cho thấy bạn không mặc định API luôn trả 200. Nếu người phỏng vấn hỏi tiếp "API chậm thì sao?" — đó là cầu nối sang Dạng 5 (concurrency), và generator tuần tự này sẽ cần được thay bằng mô hình song song.

---

## Dạng 3: Set và dict — đưa O(N²) về O(N)

Gom nhóm và khử trùng lặp ([deduplication](/concepts/2-data-ingestion-integration/deduplication)) là hai thao tác DE làm nhiều nhất, và cả hai đều quy về một câu hỏi cấu trúc dữ liệu: tra cứu membership mất bao lâu?

**Đề bài**: *"Danh sách A có 1 triệu email khách mua hàng, danh sách B có 1 triệu email khách phàn nàn. Tìm khách vừa mua vừa phàn nàn."*

Hai vòng lặp lồng nhau (`for email in B: if email in A`) với A là *list* mất O(N²) — cỡ 10¹² phép so sánh, chạy hàng giờ. Chuyển A sang `set` đưa mỗi phép tra về O(1) trung bình, tổng còn O(N):

```python
def find_common_emails(sales_emails: list[str], support_emails: list[str]) -> list[str]:
    sales_set = set(sales_emails)  # tốn thêm RAM để đổi lấy tra cứu O(1)
    return [email for email in support_emails if email in sales_set]

# Hoặc ngắn nhất, khi không cần giữ thứ tự:
# return list(set(sales_emails) & set(support_emails))
```

Trade-off cần nói thành lời: set ngốn thêm bộ nhớ (bảng băm cộng overhead của str object) — với 1 triệu email thì không đáng kể, nhưng với 1 tỷ thì chính nó lại là bài toán Dạng 1. Người phỏng vấn DE rất thích ứng viên tự nối các dạng bài lại như vậy.

---

## Dạng 4: Làm phẳng JSON lồng nhau

API và NoSQL trả về JSON lồng nhiều cấp; [Data Warehouse](/concepts/1-distributed-systems-architecture/data-warehouse) cần bảng phẳng. Việc chuyển đổi này là bài đệ quy kinh điển của phỏng vấn DE.

**Đầu vào**:

```json
{
    "user": {"id": 1, "name": "A"},
    "location": {"city": "Hanoi", "coords": {"lat": 21, "lng": 105}}
}
```

**Đầu ra mong muốn**: `{"user_id": 1, "user_name": "A", "location_city": "Hanoi", "location_coords_lat": 21, "location_coords_lng": 105}`

```python
def flatten_dict(d: dict, parent_key: str = '', sep: str = '_') -> dict:
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)
```

Sau khi viết xong, chủ động nêu hai edge case mà đề cố tình bỏ lửng: **value là list thì sao** (giữ nguyên, nối index vào key, hay explode thành nhiều dòng — mỗi lựa chọn hợp một ngữ cảnh nạp dữ liệu khác nhau), và **JSON lồng quá sâu** thì đệ quy Python chạm giới hạn ngăn xếp (mặc định 1000 mức) — bản lặp dùng stack tường minh sẽ an toàn hơn cho dữ liệu không kiểm soát được. Nêu được cả hai thường giá trị hơn chính lời giải.

---

## Dạng 5: Concurrency cho tác vụ I/O-bound

**Đề bài**: *"Cần tải hàng nghìn file từ API. Code tuần tự mất 2 giờ. Tăng tốc thế nào?"*

Điểm lý thuyết cần nói trước khi code: tải file là tác vụ **I/O-bound** — thời gian chủ yếu là chờ mạng, không phải tính toán. Với I/O-bound, thread là đủ và GIL của CPython không phải trở ngại, vì GIL được nhả ra trong lúc chờ I/O. Ngược lại, tác vụ **CPU-bound** cần `ProcessPoolExecutor` để thoát GIL. Trả lời đúng phân biệt này là qua được câu hỏi vặn phổ biến nhất về concurrency trong Python.

```python
import concurrent.futures
import requests

def download_file(url: str) -> int:
    response = requests.get(url, timeout=30)
    return response.status_code

def download_all_concurrently(urls: list[str]) -> list[int]:
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_url = {executor.submit(download_file, url): url for url in urls}

        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                results.append(future.result())
            except Exception as exc:
                print(f'{url} lỗi: {exc}')  # một URL hỏng không được giết cả batch

    return results
```

Đáng nói kèm: `max_workers` không phải càng cao càng tốt — quá nhiều request đồng thời có thể khiến API phía kia rate-limit hoặc chặn hẳn. Và nếu người phỏng vấn hỏi về `asyncio`: cùng giải quyết I/O-bound, hiệu quả hơn khi số kết nối lên hàng chục nghìn, nhưng đòi cả hệ sinh thái async (`aiohttp` thay cho `requests`) — với vài nghìn file, `ThreadPoolExecutor` đơn giản hơn và đủ nhanh.

---

## Ba thói quen ghi điểm khi live coding

**Xử lý ngoại lệ có chủ đích.** Dữ liệu thật luôn có bản ghi hỏng. Bọc `try/except` quanh chỗ parse và ép kiểu — nhưng bắt *đúng* exception (`json.JSONDecodeError`, `ValueError`), không `except Exception` nuốt sạch mọi lỗi kể cả bug của chính mình.

**Type hint.** `def process(data: list[dict]) -> dict:` mất hai giây để viết và lập tức truyền tín hiệu bạn quen với codebase có kỷ luật, chạy qua mypy/CI.

**Tự phân tích độ phức tạp khi vừa code xong.** Đừng đợi bị hỏi: *"Giải pháp này O(N) thời gian; bộ nhớ O(số user) nhờ generator, không phụ thuộc kích thước file."* Một câu, và bạn vừa chứng minh mình hiểu code của chính mình ở mức hệ thống.

Về pandas: các đề trên cố tình giải bằng Python thuần vì đó là thứ được kiểm tra. Nhưng nếu được phép dùng thư viện, nói được `pandas.read_csv(..., chunksize=...)` cho file lớn, hoặc nhắc đến Polars với lazy evaluation và streaming cho dữ liệu vượt RAM, cho thấy bạn theo kịp công cụ của ngành.

---

## Tài liệu tham khảo

* [Python Documentation — Generators & yield expressions](https://docs.python.org/3/reference/expressions.html#yield-expressions) — ngữ nghĩa chính thức của generator.
* [Python Documentation — concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html) — ThreadPoolExecutor vs. ProcessPoolExecutor, kèm ví dụ chuẩn.
* [Python Wiki — Time Complexity](https://wiki.python.org/moin/TimeComplexity) — độ phức tạp của các thao tác trên list, set, dict trong CPython.
* [pandas Documentation — Scaling to large datasets](https://pandas.pydata.org/docs/user_guide/scale.html) — chunking và các chiến lược khi dữ liệu vượt RAM.
* **Fluent Python, 2nd Edition — Luciano Ramalho (O'Reilly)** — chương về iterator/generator và concurrency, sâu nhất trong các sách Python thực hành.

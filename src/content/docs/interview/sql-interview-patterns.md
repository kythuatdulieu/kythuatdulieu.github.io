---
title: "SQL Interview Patterns"
category: "Interview Preparation"
difficulty: "Advanced"
tags: ["sql", "interview", "patterns", "window-functions", "cte"]
readingTime: "15 mins"
lastUpdated: 2026-06-07
seoTitle: "Các dạng bài SQL kinh điển trong phỏng vấn Data Engineer"
metaDescription: "Tổng hợp các dạng bài tập SQL (SQL Patterns) thường gặp nhất trong phỏng vấn kỹ sư dữ liệu: Window functions, CTEs đệ quy, Self-joins và Gaps & Islands."
---

# Các dạng bài SQL kinh điển trong phỏng vấn Data Engineering

Trong các buổi phỏng vấn cho vị trí Data Engineer, Data Analyst hay Analytics Engineer, bài kiểm tra Live Coding SQL là một cửa ải bắt buộc và vô cùng quan trọng. 

Khi phỏng vấn các vị trí đòi hỏi chuyên môn cao, nhà tuyển dụng sẽ không đưa ra các câu hỏi truy vấn `SELECT` hay `JOIN` cơ bản. Họ sẽ tập trung vào các dạng bài toán (SQL Patterns) có độ phức tạp cao nhằm kiểm tra khả năng tư duy logic, kỹ năng phân tích chuỗi thời gian và tư duy tối ưu hóa hiệu năng câu lệnh của bạn.

Dưới đây là các dạng bài SQL "kinh điển" nhất được chọn lọc từ thực tế phỏng vấn mà bạn chắc chắn sẽ gặp phải.

---

## Dạng 1: Hàm cửa sổ (Window Functions) - Vũ khí tối thượng

Hàm cửa sổ chính là công cụ mạnh mẽ nhất giúp bạn xử lý các bài toán phân tích phức tạp. Điểm đặc biệt của hàm cửa sổ là cho phép thực hiện các phép toán tổng hợp trên một nhóm các dòng liên quan đến dòng hiện tại, nhưng **không làm gộp dòng** lại như mệnh đề `GROUP BY`.

### 1.1 Bài toán Tìm Top N phần tử đứng đầu mỗi nhóm (Top N per Group)
* **Yêu cầu**: Tìm 3 nhân viên có mức lương cao nhất trong *mỗi* phòng ban.
* **Tư duy giải quyết**: Chúng ta không thể sử dụng `LIMIT 3` thông thường vì nó sẽ giới hạn kết quả của toàn bộ công ty. Thay vào đó, hãy sử dụng hàm xếp hạng `DENSE_RANK()` (hoặc `ROW_NUMBER()`) kết hợp chia nhóm (`PARTITION BY`) theo phòng ban.

```sql
WITH RankedSalaries AS (
    SELECT 
        department_id,
        employee_name,
        salary,
        DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank_salary
    FROM employees
)
SELECT department_id, employee_name, salary
FROM RankedSalaries
WHERE rank_salary <= 3;
```

> [!NOTE]
> Hãy chủ động phân biệt sự khác nhau giữa các hàm xếp hạng trong phòng phỏng vấn:
> * `ROW_NUMBER()`: Trả về số thứ tự liên tục (1, 2, 3...) tăng dần không trùng lặp.
> * `RANK()`: Xếp hạng trùng nhau sẽ nhận cùng thứ hạng và nhảy cóc (ví dụ: 1, 1, 3...).
> * `DENSE_RANK()`: Xếp hạng trùng nhau nhận cùng thứ hạng nhưng không nhảy cóc (ví dụ: 1, 1, 2...).

### 1.2 Bài toán So sánh với ngày hôm trước (Lag / Lead)
* **Yêu cầu**: Tìm những ngày có nhiệt độ (hoặc doanh thu) cao hơn ngày hôm trước.
* **Tư duy giải quyết**: Bạn cần mang dữ liệu của "dòng trước đó" (ngày hôm qua) ghép ngang vào dòng dữ liệu của "ngày hôm nay" để thực hiện so sánh trên cùng một dòng.

```sql
WITH PrevDayData AS (
    SELECT 
        record_date,
        temperature,
        LAG(temperature, 1) OVER (ORDER BY record_date) as prev_temperature
    FROM weather
)
SELECT record_date
FROM PrevDayData
WHERE temperature > prev_temperature;
```

---

## Dạng 2: Biểu thức bảng tạm (CTEs) và Truy vấn đệ quy

Việc sử dụng biểu thức bảng tạm (Common Table Expressions - CTE) với từ khóa `WITH` giúp bạn phân tách một bài toán SQL phức tạp thành các khối logic nhỏ gọn, rõ ràng và cực kỳ dễ đọc.

### 2.1 Truy vấn đệ quy (Recursive CTE) - Phân tích cấu trúc dạng cây
* **Yêu cầu**: Cho một bảng nhân sự gồm hai cột `id` và `manager_id` (ID của người quản lý trực tiếp). Hãy in ra sơ đồ tổ chức của toàn công ty thể hiện rõ ai là sếp của ai và cấp độ (level) của từng người.
* **Tư duy giải quyết**: Sử dụng từ khóa `RECURSIVE`. Điểm xuất phát (Base case) là những người cấp cao nhất không có sếp (`manager_id IS NULL`). Sau đó, tiến hành kết hợp đệ quy (`JOIN`) bảng nhân viên với chính CTE để duyệt dần xuống các cấp dưới.

```sql
WITH RECURSIVE OrgChart AS (
    -- Base case: Tìm CEO
    SELECT id, name, manager_id, 1 as level
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive step: Tìm cấp dưới nối vào sếp
    SELECT e.id, e.name, e.manager_id, o.level + 1
    FROM employees e
    JOIN OrgChart o ON e.manager_id = o.id
)
SELECT * FROM OrgChart ORDER BY level;
```

---

## Dạng 3: Tự liên kết bảng (Self-Joins) cho bài toán tương tác

Nhiều lập trình viên thường quên mất rằng một bảng hoàn toàn có thể thực hiện phép `JOIN` với chính nó để giải quyết các bài toán tìm cặp đôi hoặc phân tích hành vi tương tác liên tiếp.

### 3.1 Bài toán Phân tích tỷ lệ giữ chân khách hàng (Retention / Churn Rate)
* **Yêu cầu**: Cho bảng lưu lịch sử đăng nhập của người dùng `user_logins(user_id, login_date)`. Hãy tính tỷ lệ người dùng quay trở lại hệ thống vào ngày hôm sau (Day 1 Retention).
* **Tư duy giải quyết**: Thực hiện phép `LEFT JOIN` bảng `user_logins` với chính nó. Điều kiện kết hợp là trùng mã `user_id` và ngày đăng nhập của bảng thứ hai phải lớn hơn ngày đăng nhập của bảng thứ nhất đúng 1 ngày.

```sql
SELECT 
    L1.login_date,
    COUNT(DISTINCT L1.user_id) as total_users,
    COUNT(DISTINCT L2.user_id) as retained_users,
    ROUND(COUNT(DISTINCT L2.user_id) * 100.0 / COUNT(DISTINCT L1.user_id), 2) as retention_rate
FROM user_logins L1
LEFT JOIN user_logins L2 
    ON L1.user_id = L2.user_id 
    AND L2.login_date = L1.login_date + INTERVAL '1 day'
GROUP BY L1.login_date;
```

---

## Dạng 4: Khoảng trống và Hòn đảo (Gaps and Islands) - Thử thách Senior

Đây là dạng câu hỏi hóc búa nhất trong các buổi phỏng vấn SQL, thường dùng để kiểm tra tư duy của các ứng viên cấp độ Senior/Lead.
* **Mục tiêu của bài toán**: Tìm các chuỗi dữ liệu liên tục nhau (Islands - Hòn đảo) và xác định các điểm đứt gãy (Gaps - Khoảng trống) của một chuỗi thời gian hoặc chuỗi số nguyên.

### 4.1 Tìm chuỗi ngày đăng nhập liên tiếp dài nhất (Longest Streak)
* **Yêu cầu**: Tìm chuỗi ngày đăng nhập liên tiếp dài nhất của từng người dùng.
* **Tư duy giải quyết**:
  1. Sử dụng `ROW_NUMBER()` để đánh số thứ tự các ngày đăng nhập tăng dần của từng người dùng.
  2. Lấy ngày đăng nhập trừ đi số thứ tự vừa tạo. 
  3. Nếu các ngày đăng nhập liên tiếp nhau, kết quả của phép trừ sẽ luôn trả về **cùng một giá trị ngày cố định** (đóng vai trò là ID của hòn đảo). Từ đó, ta có thể gom nhóm (`GROUP BY`) theo ID hòn đảo này để đếm số ngày liên tiếp.

```sql
WITH RankedLogins AS (
    -- Dùng DISTINCT để bỏ qua trường hợp đăng nhập 2 lần 1 ngày
    SELECT DISTINCT user_id, login_date,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) as rn
    FROM user_logins
),
GroupedIslands AS (
    -- Trừ ngày cho row_number để tạo ID nhóm (Islands)
    SELECT user_id, login_date,
           DATE_SUB(login_date, INTERVAL rn DAY) as island_id
    FROM RankedLogins
),
StreakLengths AS (
    -- Đếm số ngày liên tiếp theo từng island_id
    SELECT user_id, island_id, COUNT(*) as streak_days
    FROM GroupedIslands
    GROUP BY user_id, island_id
)
SELECT user_id, MAX(streak_days) as max_streak
FROM StreakLengths
GROUP BY user_id;
```

---

## Dạng 5: Tổng lũy kế và Trung bình động (Rolling Aggregations)

Phân tích chuỗi thời gian đòi hỏi bạn phải làm mượt (smoothing) các điểm dữ liệu biến động để nhìn ra xu hướng tổng quan.

### 5.1 Tính toán Trung bình động 7 ngày (7-day Moving Average)
* **Yêu cầu**: Tính trung bình doanh thu của 7 ngày liên tiếp tính đến ngày hiện tại.
* **Tư duy giải quyết**: Sử dụng hàm cửa sổ, nhưng cấu hình cụ thể thuộc tính Frame Clause (`ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`) để giới hạn cửa sổ tính toán chỉ gồm 6 dòng trước và dòng hiện tại.

```sql
SELECT 
    date,
    daily_revenue,
    AVG(daily_revenue) OVER (
        ORDER BY date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as moving_avg_7d
FROM daily_sales;
```

---

## Dạng 6: Kỹ thuật xoay bảng (Pivot / Unpivot)

### 6.1 Xoay bảng (Pivot) thủ công không dùng hàm xây dựng sẵn
Nhiều công cụ cơ sở dữ liệu không hỗ trợ sẵn hàm `PIVOT`. Nhà tuyển dụng muốn xem bạn có biết cách xoay dữ liệu từ dòng thành cột một cách thủ công hay không.
* **Yêu cầu**: Bảng dữ liệu bán hàng `sales` có cột `month` và `product_category`. Hãy tính tổng doanh thu và tách mỗi phân khúc sản phẩm thành một cột riêng biệt.
* **Tư duy giải quyết**: Kết hợp hàm tổng hợp `SUM` và câu lệnh điều kiện `CASE WHEN`.

```sql
SELECT 
    month,
    SUM(CASE WHEN product_category = 'Electronics' THEN revenue ELSE 0 END) as electronics_rev,
    SUM(CASE WHEN product_category = 'Clothing' THEN revenue ELSE 0 END) as clothing_rev,
    SUM(CASE WHEN product_category = 'Books' THEN revenue ELSE 0 END) as books_rev
FROM sales
GROUP BY month;
```

---

## Những kinh nghiệm vàng giúp bạn ghi điểm tuyệt đối

1. **Trao đổi rõ các trường hợp đặc biệt (Edge Cases) trước khi code**: Khi nhận đề bài, đừng vội gõ code ngay. Hãy hỏi người phỏng vấn làm rõ: *"Nếu có hai người có cùng mức lương cao thứ 3 thì lấy cả hai hay chỉ lấy một?"* hoặc *"Dữ liệu đầu vào có bị trùng lặp không?"*. Việc này chứng tỏ tư duy kỹ thuật cẩn trọng của bạn.
2. **Ưu tiên sử dụng CTE thay vì truy vấn con (Subqueries) lồng nhau**: Người phỏng vấn cực kỳ đánh giá cao mã nguồn sạch sẽ, dễ đọc. Hãy tránh viết 3-4 tầng `SELECT` lồng nhau phức tạp. Hãy tách chúng ra thành các khối `WITH` tường minh.
3. **Định dạng code rõ ràng, chuyên nghiệp**: Viết hoa toàn bộ các từ khóa SQL (`SELECT`, `FROM`, `WHERE`, `JOIN`). Thụt lề dòng cho các điều kiện kết hợp `ON` hoặc bộ lọc `WHERE`. Một đoạn code trình bày khoa học phản ánh một kỹ sư có tính kỷ luật cao.
4. **Không bao giờ quên `GROUP BY`**: Đây là lỗi sai ngớ ngẩn và phổ biến nhất của các ứng viên. Khi bạn sử dụng các hàm tổng hợp như `SUM`, `COUNT`, `AVG` đi kèm với các cột thuộc tính thông thường, hãy luôn nhớ đưa tất cả các cột thuộc tính đó vào mệnh đề `GROUP BY`.

---

## English Summary

SQL interviews for Data roles heavily test a candidate's ability to manipulate data structures efficiently. Mastering specific patterns is crucial. The most important patterns include **Window Functions** (using `DENSE_RANK`, `LAG/LEAD` for Top-N and comparative analysis), **CTEs** (breaking down logic and using `RECURSIVE` for hierarchical data), **Self-Joins** (useful for retention and pairwise analytics), **Gaps and Islands** (solving consecutive sequence problems by subtracting row numbers from dates), and **Conditional Aggregation** (using `SUM(CASE WHEN...)` for pivoting). A strong candidate not only solves the logic but ensures the code is highly readable using CTEs and actively communicates edge-cases prior to coding.

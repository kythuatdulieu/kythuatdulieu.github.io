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

# SQL Interview Patterns (Các mẫu bài SQL Phỏng vấn)

## Summary

Trong các cuộc phỏng vấn vị trí Data Engineer, Data Analyst hoặc Analytics Engineer tại các công ty công nghệ, bài kiểm tra SQL là rào cản bắt buộc. Thay vì các câu truy vấn `SELECT` hay `JOIN` cơ bản, người phỏng vấn sẽ tập trung vào các mẫu bài toán (Patterns) nhằm kiểm tra tư duy xử lý logic phức tạp, khả năng phân tích chuỗi thời gian, và kỹ thuật tối ưu hóa mã lệnh.

Bài viết này tổng hợp các nhóm mẫu thiết kế SQL "kinh điển" nhất mà bạn chắc chắn sẽ gặp trong vòng Live Coding.

---

## Pattern 1: Window Functions (Hàm Cửa Sổ)

Hàm cửa sổ là "vũ khí tối thượng" trong phỏng vấn SQL. Nó cho phép bạn thực hiện các phép tính tổng hợp trên một tập hợp các dòng (cửa sổ) liên quan đến dòng hiện tại, mà KHÔNG làm gộp (collapse) các dòng đó lại như `GROUP BY`.

### 1.1 Bài toán Top N per Group (Top N mỗi nhóm)
**Yêu cầu**: Tìm 3 nhân viên có mức lương cao nhất trong *mỗi* phòng ban.
**Tư duy**: Bạn không thể dùng `LIMIT 3` vì nó chỉ lấy 3 dòng của toàn công ty. Bạn phải dùng hàm xếp hạng `DENSE_RANK()` (hoặc `ROW_NUMBER()`) và chia nhóm (partition) theo phòng ban.

**Giải pháp SQL:**
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
*Ghi chú*: Phân biệt `ROW_NUMBER()` (1, 2, 3 - luôn tăng), `RANK()` (1, 1, 3 - nhảy cóc khi trùng), và `DENSE_RANK()` (1, 1, 2 - không nhảy cóc).

### 1.2 Bài toán So sánh với ngày hôm trước (Lag/Lead)
**Yêu cầu**: Tìm những ngày có nhiệt độ (hoặc doanh thu) cao hơn ngày hôm trước.
**Tư duy**: Bạn cần mang dữ liệu của "dòng trước đó" (yesterday) ghép ngang vào "dòng hiện tại" (today) để so sánh (toán tử >) trên cùng một dòng.

**Giải pháp SQL:**
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

## Pattern 2: CTEs (Common Table Expressions) và Subqueries

Sử dụng `WITH` (CTEs) để chia nhỏ một bài toán phức tạp thành các bước logic dễ đọc.

### 2.1 CTE đệ quy (Recursive CTE) - Phân cấp Cây (Hierarchical)
**Yêu cầu**: Cho bảng nhân viên gồm `id` và `manager_id`. In ra cấu trúc sơ đồ tổ chức (ai là sếp của ai từ trên xuống dưới, tính luôn cấp độ bậc).
**Tư duy**: Dùng từ khóa `RECURSIVE`. Base case (trường hợp cơ sở) là các Giám đốc (CEO) không có sếp (`manager_id IS NULL`). Sau đó đệ quy JOIN lại chính bảng CTE để tìm nhân viên cấp dưới.

**Giải pháp SQL (PostgreSQL/Snowflake):**
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

## Pattern 3: Self-Joins (Tự kết nối)

Nhiều ứng viên quên rằng một bảng có thể `JOIN` với chính nó để giải quyết các bài toán cặp đôi hoặc quan hệ nội tại.

### 3.1 Bài toán Phân tích tỷ lệ giữ chân (Retention / Churn)
**Yêu cầu**: Cho bảng `user_logins(user_id, login_date)`. Tính tỷ lệ người dùng quay lại vào ngày hôm sau (Day 1 Retention).
**Tư duy**: JOIN bảng `user_logins` vào chính nó (L1 và L2). Điều kiện JOIN là cùng user và ngày L2 = ngày L1 + 1 ngày.

**Giải pháp SQL:**
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

## Pattern 4: Gaps and Islands (Khoảng trống và Hòn đảo)

Đây là dạng câu hỏi "khó nhằn" nhất, thường dành cho các vị trí Senior.
**Bài toán tổng quát**: Tìm các chuỗi dữ liệu liên tiếp nhau (Islands) và tìm các khoảng đứt gãy (Gaps) của chuỗi thời gian hoặc chuỗi số nguyên.

### 4.1 Tìm chuỗi ngày đăng nhập liên tiếp dài nhất (Longest streak)
**Yêu cầu**: Cho bảng người dùng và ngày đăng nhập. Tìm chuỗi ngày đăng nhập liên tiếp dài nhất của từng user.
**Tư duy "Hòn đảo"**:
1. Đánh số thứ tự (`ROW_NUMBER`) các ngày đăng nhập của user theo ngày tăng dần.
2. Trừ ngày đăng nhập (`login_date`) cho cái số thứ tự vừa tạo. 
3. Nếu các ngày liên tiếp nhau, khoảng cách trừ sẽ tạo ra MỘT HẰNG SỐ (Group ID chung). Đây chính là "hòn đảo".

**Giải pháp SQL:**
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

## Pattern 5: Rolling Aggregations (Tính tổng lũy kế / Trung bình trượt)

Phân tích chuỗi thời gian yêu cầu tính toán mượt (smoothing) các dữ liệu.

### 5.1 Trung bình động 7 ngày (7-day Moving Average)
**Yêu cầu**: Tính trung bình doanh thu của 7 ngày liên tiếp tính đến ngày hiện tại.
**Tư duy**: Sử dụng Window Function, nhưng cấu hình cụ thể phần "Frame Clause" (Cửa sổ chi tiết: Khung dữ liệu). Khung là từ 6 dòng trước đến dòng hiện tại (`ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`).

**Giải pháp SQL:**
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

## Pattern 6: Pivot / Unpivot (Chuyển đổi Dòng - Cột)

### 6.1 Xoay bảng (Pivot) không dùng hàm xây sẵn
Trong phỏng vấn, đôi khi DB không hỗ trợ lệnh `PIVOT`. Bạn phải biết cách xây dựng nó thủ công.
**Yêu cầu**: Bảng `sales` có cột `month` và `product_category`. Tính tổng doanh thu và tách mỗi Category thành 1 cột riêng biệt.
**Tư duy**: Sử dụng sự kết hợp giữa hàm Aggregation (`SUM`) và câu lệnh điều kiện (`CASE WHEN`).

**Giải pháp SQL:**
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

## Tips and Best Practices during Interview

1. **Giao tiếp trước khi viết code**: Khi nhận đề, hãy làm rõ các edge cases (trường hợp góc). "Điều gì xảy ra nếu có người hòa nhau ở vị trí Top 3 lương?", "Bảng này có thể có trùng lặp dữ liệu không?". Điều này cho thấy tư duy kỹ thuật sâu sắc.
2. **Sử dụng CTE thay vì Subqueries lồng nhau**: Phỏng vấn viên đánh giá rất cao code sạch. Đừng viết 3 vòng `SELECT` lồng nhau (Nested queries). Hãy tách chúng ra bằng 3 khối `WITH` liên tiếp.
3. **Format Code rõ ràng**: Luôn viết hoa từ khóa SQL (`SELECT`, `FROM`), lùi đầu dòng cho các điều kiện `ON` trong `JOIN` hoặc `WHERE`. Code gọn gàng chứng tỏ bạn là người làm việc có kỷ luật.
4. **Luôn nhớ GROUP BY**: Lỗi phổ biến nhất của ứng viên là sử dụng hàm SUM, COUNT nhưng quên cho các cột còn lại vào phần `GROUP BY`.

---

## English summary

SQL interviews for Data roles heavily test a candidate's ability to manipulate data structures efficiently. Mastering specific patterns is crucial. The most important patterns include **Window Functions** (using `DENSE_RANK`, `LAG/LEAD` for Top-N and comparative analysis), **CTEs** (breaking down logic and using `RECURSIVE` for hierarchical data), **Self-Joins** (useful for retention and pairwise analytics), **Gaps and Islands** (solving consecutive sequence problems by subtracting row numbers from dates), and **Conditional Aggregation** (using `SUM(CASE WHEN...)` for pivoting). A strong candidate not only solves the logic but ensures the code is highly readable using CTEs and actively communicates edge-cases prior to coding.

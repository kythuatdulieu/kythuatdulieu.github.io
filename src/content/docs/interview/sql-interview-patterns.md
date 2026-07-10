---
title: "SQL Interview Patterns"
category: "Interview Preparation"
difficulty: "Advanced"
tags: ["sql", "interview", "patterns", "window-functions", "cte"]
readingTime: "15 mins"
lastUpdated: 2026-07-10
seoTitle: "Các dạng bài SQL kinh điển trong phỏng vấn Data Engineer"
metaDescription: "Tổng hợp các dạng bài SQL thường gặp nhất trong phỏng vấn kỹ sư dữ liệu: Window functions, CTE đệ quy, Self-join, Gaps & Islands — kèm cách tư duy và lời giải mẫu."
---

Hầu như mọi quy trình tuyển dụng Data Engineer, Data Analyst hay Analytics Engineer đều có một vòng live coding SQL. Điều thú vị là sau nhiều năm, đề thi ở vòng này gần như không đổi: vẫn xoay quanh chừng năm sáu dạng bài quen thuộc. Người ra đề không cần sáng tạo đề mới, vì các dạng này đã đủ để phân loại ứng viên — ai chỉ biết `SELECT`/`JOIN` cơ bản, ai thực sự làm việc với dữ liệu hằng ngày.

Tin tốt cho bạn: vì đề lặp lại, nên hoàn toàn có thể luyện trước. Bài viết này đi qua từng dạng, kèm cách tư duy để bạn tự giải được cả những biến thể chưa gặp, thay vì học thuộc lời giải.

---

## Dạng 1: Window Functions — dạng bài xuất hiện nhiều nhất

Nếu chỉ được ôn một thứ trước buổi phỏng vấn SQL, hãy ôn hàm cửa sổ. Khác với `GROUP BY` vốn gộp nhiều dòng thành một, window function tính toán trên một "cửa sổ" các dòng liên quan nhưng **giữ nguyên từng dòng** trong kết quả. Tài liệu PostgreSQL mô tả đây là khả năng "thực hiện phép tính trên tập các dòng có liên hệ với dòng hiện tại" — và chính đặc điểm giữ nguyên dòng này khiến nó phù hợp với đa số bài toán phân tích.

Một chi tiết hay bị hỏi xoáy: window function chỉ được phép xuất hiện trong `SELECT` và `ORDER BY`, không được dùng trong `WHERE` hay `HAVING`, vì nó chạy *sau* các mệnh đề lọc đó. Muốn lọc theo kết quả window function, bạn phải bọc nó trong CTE hoặc subquery — đây cũng là lý do lời giải Top-N bên dưới cần hai bước.

### 1.1 Top N mỗi nhóm (Top N per Group)

**Đề bài quen thuộc**: tìm 3 nhân viên lương cao nhất trong *mỗi* phòng ban.

`LIMIT 3` không dùng được vì nó cắt trên toàn bộ kết quả, không cắt theo từng nhóm. Cách chuẩn là xếp hạng trong từng phòng ban bằng `PARTITION BY`, rồi lọc theo hạng:

```sql
WITH RankedSalaries AS (
    SELECT
        department_id,
        employee_name,
        salary,
        DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rank_salary
    FROM employees
)
SELECT department_id, employee_name, salary
FROM RankedSalaries
WHERE rank_salary <= 3;
```

:::note
Ba hàm xếp hạng khác nhau ở cách xử lý điểm bằng nhau — và người phỏng vấn gần như chắc chắn sẽ hỏi:

* `ROW_NUMBER()`: đánh số liên tục 1, 2, 3... kể cả khi giá trị bằng nhau (hai người cùng lương vẫn nhận hạng khác nhau, thứ tự tùy hệ quản trị).
* `RANK()`: giá trị bằng nhau nhận cùng hạng, nhưng hạng kế tiếp bị "nhảy cóc" (1, 1, 3...).
* `DENSE_RANK()`: giá trị bằng nhau nhận cùng hạng, không nhảy cóc (1, 1, 2...).

Chọn hàm nào phụ thuộc vào yêu cầu nghiệp vụ. Vì vậy trước khi code, hãy hỏi lại: *"Nếu hai người cùng mức lương thứ 3 thì lấy cả hai hay chỉ một?"* — câu hỏi này vừa giúp bạn chọn đúng hàm, vừa ghi điểm về sự cẩn trọng.
:::

### 1.2 So sánh với dòng liền trước (LAG / LEAD)

**Đề bài quen thuộc**: tìm những ngày có nhiệt độ (hoặc doanh thu) cao hơn ngày hôm trước — chính là bài "Rising Temperature" trên LeetCode.

Bản chất của bài toán: cần đặt dữ liệu của ngày hôm qua nằm *ngang hàng* với ngày hôm nay để so sánh trên cùng một dòng. `LAG()` làm đúng việc đó:

```sql
WITH PrevDayData AS (
    SELECT
        record_date,
        temperature,
        LAG(temperature, 1) OVER (ORDER BY record_date) AS prev_temperature
    FROM weather
)
SELECT record_date
FROM PrevDayData
WHERE temperature > prev_temperature;
```

Lưu ý một điểm mà nhiều ứng viên trượt: nếu dữ liệu có ngày bị thiếu (hôm qua không có bản ghi), `LAG` sẽ lấy dòng liền trước *trong dữ liệu* chứ không phải "ngày hôm trước" theo lịch. Khi đó phải self-join theo điều kiện ngày, hoặc xác nhận với người phỏng vấn rằng dữ liệu liên tục. Nói ra được điều này là dấu hiệu của người từng làm dữ liệu thật.

---

## Dạng 2: CTE và truy vấn đệ quy

Biểu thức bảng chung (Common Table Expression — mệnh đề `WITH`) giúp tách một truy vấn phức tạp thành các khối logic có tên, đọc từ trên xuống như một đoạn văn. Trong phỏng vấn, code dùng CTE gần như luôn được đánh giá cao hơn subquery lồng 3-4 tầng, đơn giản vì người chấm đọc hiểu được ngay bạn đang nghĩ gì.

### 2.1 Recursive CTE — duyệt cấu trúc cây

**Đề bài quen thuộc**: bảng nhân sự có `id` và `manager_id`. In ra sơ đồ tổ chức kèm cấp bậc (level) của từng người.

Dữ liệu phân cấp (cây tổ chức, danh mục sản phẩm lồng nhau, chuỗi giao dịch cha-con) không giải được bằng JOIN thông thường vì không biết trước độ sâu. Recursive CTE gồm hai phần: mỏ neo (anchor — điểm xuất phát) và phần đệ quy tự nối vào chính nó:

```sql
WITH RECURSIVE OrgChart AS (
    -- Anchor: người không có sếp, tức cấp cao nhất
    SELECT id, name, manager_id, 1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Đệ quy: tìm cấp dưới trực tiếp của những người đã có trong OrgChart
    SELECT e.id, e.name, e.manager_id, o.level + 1
    FROM employees e
    JOIN OrgChart o ON e.manager_id = o.id
)
SELECT * FROM OrgChart ORDER BY level;
```

Nếu người phỏng vấn hỏi thêm "dữ liệu có vòng lặp (A quản lý B, B quản lý A) thì sao?" — đó là bẫy kinh điển: truy vấn sẽ chạy vô hạn. Câu trả lời tốt là giới hạn độ sâu (`WHERE level < 20`) hoặc dùng cơ chế phát hiện chu trình mà một số hệ quản trị hỗ trợ (PostgreSQL có `CYCLE` từ bản 14).

---

## Dạng 3: Self-Join — bài toán retention kinh điển

Một bảng hoàn toàn có thể JOIN với chính nó. Nghe hiển nhiên, nhưng đây lại là chìa khóa của nhóm bài "phân tích hành vi theo cặp" mà các công ty consumer app (Grab, Shopee, các công ty mạng xã hội) rất chuộng.

### 3.1 Day-1 Retention

**Đề bài quen thuộc**: từ bảng `user_logins(user_id, login_date)`, tính tỷ lệ người dùng quay lại vào đúng ngày hôm sau.

Tư duy: với mỗi lượt đăng nhập, tìm xem *cùng người đó* có bản ghi vào ngày kế tiếp hay không. `LEFT JOIN` (chứ không phải `INNER JOIN`) để giữ cả những người không quay lại — vì mẫu số của tỷ lệ cần tất cả mọi người:

```sql
SELECT
    L1.login_date,
    COUNT(DISTINCT L1.user_id) AS total_users,
    COUNT(DISTINCT L2.user_id) AS retained_users,
    ROUND(COUNT(DISTINCT L2.user_id) * 100.0 / COUNT(DISTINCT L1.user_id), 2) AS retention_rate
FROM user_logins L1
LEFT JOIN user_logins L2
    ON L1.user_id = L2.user_id
    AND L2.login_date = L1.login_date + INTERVAL '1 day'
GROUP BY L1.login_date;
```

Chi tiết đáng nói khi trình bày: `COUNT(DISTINCT ...)` ở đây không phải trang trí — một người đăng nhập nhiều lần trong ngày sẽ thổi phồng cả tử số lẫn mẫu số nếu thiếu `DISTINCT`. Nhân `* 100.0` (số thực) thay vì `* 100` cũng là chủ ý, để tránh phép chia nguyên trả về 0 trên một số hệ quản trị.

---

## Dạng 4: Gaps and Islands — bài phân loại Senior

Đây là dạng khó nhất và cũng "đẹp" nhất, được Itzik Ben-Gan hệ thống hóa trong các sách T-SQL của ông. Bài toán: trong một chuỗi (ngày, số thứ tự), tìm các đoạn liên tục (islands) và các điểm đứt gãy (gaps).

### 4.1 Chuỗi ngày đăng nhập liên tiếp dài nhất (Longest Streak)

Lời giải dựa trên một quan sát tinh tế: nếu lấy **ngày trừ đi số thứ tự của ngày đó**, thì các ngày liên tiếp nhau sẽ cho ra *cùng một kết quả*. Ví dụ đăng nhập các ngày 1, 2, 3 với số thứ tự 1, 2, 3 → phép trừ đều ra 0. Đứt một ngày, hiệu số thay đổi → sang "đảo" mới. Hiệu số đó chính là ID của đảo:

```sql
WITH RankedLogins AS (
    -- DISTINCT để mỗi ngày chỉ tính một lần, kể cả khi đăng nhập nhiều lần
    SELECT DISTINCT user_id, login_date,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) AS rn
    FROM user_logins
),
GroupedIslands AS (
    SELECT user_id, login_date,
           login_date - rn * INTERVAL '1 day' AS island_id
    FROM RankedLogins
),
StreakLengths AS (
    SELECT user_id, island_id, COUNT(*) AS streak_days
    FROM GroupedIslands
    GROUP BY user_id, island_id
)
SELECT user_id, MAX(streak_days) AS max_streak
FROM StreakLengths
GROUP BY user_id;
```

Đừng cố học thuộc đoạn code này — hãy hiểu quan sát "ngày trừ số thứ tự" ở trên. Khi hiểu rồi, bạn tự viết lại được trong 5 phút, và quan trọng hơn là *giải thích* được cho người phỏng vấn. Với dạng bài này, lời giải thích đáng giá hơn lời giải.

---

## Dạng 5: Tổng lũy kế và trung bình động (Rolling Aggregations)

### 5.1 Trung bình động 7 ngày

**Đề bài quen thuộc**: tính trung bình doanh thu 7 ngày gần nhất tính đến từng ngày.

Chìa khóa là mệnh đề khung cửa sổ (frame clause) — phần ít người để ý trong cú pháp window function:

```sql
SELECT
    date,
    daily_revenue,
    AVG(daily_revenue) OVER (
        ORDER BY date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_avg_7d
FROM daily_sales;
```

Điểm cộng nếu bạn chủ động nêu: `ROWS` đếm theo *dòng vật lý*, còn `RANGE` đếm theo *giá trị*. Khi dữ liệu thiếu ngày, `ROWS BETWEEN 6 PRECEDING` sẽ vô tình gom cả những ngày cách xa hơn một tuần. Nếu đề yêu cầu chính xác "7 ngày theo lịch", cần `RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW` (hỗ trợ tùy hệ quản trị) hoặc điền đủ ngày trống trước.

---

## Dạng 6: Pivot bằng conditional aggregation

**Đề bài quen thuộc**: bảng `sales` có cột `month` và `product_category` — hãy tách mỗi category thành một cột doanh thu riêng.

Không phải hệ quản trị nào cũng có hàm `PIVOT` dựng sẵn (PostgreSQL và MySQL không có), nên người phỏng vấn muốn thấy bạn xoay bảng thủ công bằng `SUM` + `CASE WHEN`:

```sql
SELECT
    month,
    SUM(CASE WHEN product_category = 'Electronics' THEN revenue ELSE 0 END) AS electronics_rev,
    SUM(CASE WHEN product_category = 'Clothing'    THEN revenue ELSE 0 END) AS clothing_rev,
    SUM(CASE WHEN product_category = 'Books'       THEN revenue ELSE 0 END) AS books_rev
FROM sales
GROUP BY month;
```

Kỹ thuật `hàm tổng hợp + CASE WHEN` (conditional aggregation) còn dùng được cho vô số biến thể: đếm có điều kiện, tính tỷ lệ phần trăm trong một truy vấn, làm cohort table. Đáng để nắm chắc.

---

## Vài kinh nghiệm khi ngồi trong phòng phỏng vấn

**Hỏi về edge case trước khi gõ dòng code đầu tiên.** Dữ liệu có trùng lặp không? NULL xử lý thế nào? Hai giá trị bằng nhau thì sao? Người phỏng vấn cố tình để đề mơ hồ để xem bạn có hỏi hay không. Ứng viên lao vào code ngay thường là người sẽ lao vào viết pipeline mà không kiểm tra dữ liệu nguồn.

**Nói to quá trình suy nghĩ.** Vòng live coding chấm cách bạn tư duy nhiều hơn chấm đáp án cuối. Bí một lúc nhưng lập luận rõ ràng vẫn tốt hơn im lặng 10 phút rồi đưa ra code đúng.

**Ưu tiên CTE, đặt tên có nghĩa.** `RankedSalaries`, `GroupedIslands` — tên khối CTE tốt tự kể câu chuyện của lời giải. Code sạch trong 30 phút phỏng vấn là tín hiệu về code sạch trong công việc thật.

**Cẩn thận với `GROUP BY`.** Lỗi phổ biến nhất và cũng "ngớ ngẩn" nhất: dùng hàm tổng hợp kèm cột thường mà quên đưa cột thường vào `GROUP BY`. MySQL ở chế độ mặc định cũ có thể cho qua, nhưng PostgreSQL và chuẩn SQL thì không — và người phỏng vấn cũng không.

Về luyện tập: LeetCode (mục Database) và StrataScratch có gần như đủ các dạng trên, với dữ liệu mẫu để chạy thử. Giải chừng 30-40 bài mức Medium/Hard có chủ đích theo từng dạng sẽ hiệu quả hơn giải 200 bài ngẫu nhiên.

---

## Tài liệu tham khảo

* [PostgreSQL Documentation — Window Functions (tutorial)](https://www.postgresql.org/docs/current/tutorial-window.html) — giải thích chuẩn mực nhất về cơ chế window function.
* [PostgreSQL Documentation — Window Functions (reference)](https://www.postgresql.org/docs/current/functions-window.html) — danh sách đầy đủ các hàm và cú pháp frame clause.
* [PostgreSQL Documentation — WITH Queries (CTE)](https://www.postgresql.org/docs/current/queries-with.html) — bao gồm recursive CTE và xử lý chu trình.
* **T-SQL Querying — Itzik Ben-Gan (Microsoft Press)** — nguồn gốc và phân tích sâu nhất về kỹ thuật Gaps and Islands.
* [Snowflake — SQL Query Optimization: Techniques and Best Practices](https://www.snowflake.com/en/fundamentals/query-optimization/) — góc nhìn tối ưu truy vấn trên cloud data warehouse.
* [LeetCode Database Problems](https://leetcode.com/problemset/database/) — nguồn luyện tập sát đề phỏng vấn nhất.

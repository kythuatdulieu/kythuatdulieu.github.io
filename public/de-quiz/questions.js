const QUESTIONS_DATA = [
  {
    "id": 1,
    "topic": 1,
    "question": "An upstream system has been configured to pass the date for a given batch of data to the Databricks Jobs API as a parameter. The notebook to be scheduled will use this parameter to load data with the following code: df = spark.read.format(\"parquet\").load(f\"/mnt/source/(date)\") Which code block should be used to create the date Python variable used in the above code block?",
    "options": {
      "A": "date = spark.conf.get(\"date\")",
      "B": "input_dict = input() date= input_dict[\"date\"]",
      "C": "import sys date = sys.argv[1]",
      "D": "date = dbutils.notebooks.getParam(\"date\")",
      "E": "dbutils.widgets.text(\"date\", \"null\") date = dbutils.widgets.get(\"date\")"
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ dbutils.widgets.text(\"date\", \"null\") date = dbutils.widgets.get(\"date\")\n\n❌ Các đáp án sai:\n  A. date = spark.conf.get(\"date\")\n  B. input_dict = input() date= input_dict[\"date\"]\n  C. import sys date = sys.argv[1]\n  D. date = dbutils.notebooks.getParam(\"date\")",
    "question_vi": "Một hệ thống thượng nguồn đã được cấu hình để truyền ngày của một lô dữ liệu nhất định tới Databricks Jobs API dưới dạng tham số. Notebook được lập lịch sẽ sử dụng tham số này để tải dữ liệu với đoạn mã sau: df = spark.read.format(\"parquet\").load(f\"/mnt/source/{date}\"). Khối mã nào nên được sử dụng để tạo biến Python date dùng trong đoạn mã trên?"
  },
  {
    "id": 2,
    "topic": 1,
    "question": "The Databricks workspace administrator has configured interactive clusters for each of the data engineering groups. To control costs, clusters are set to terminate after 30 minutes of inactivity. Each user should be able to execute workloads against their assigned clusters at any time of the day. Assuming users have been added to a workspace but not granted any permissions, which of the following describes the minimal permissions a user would need to start and attach to an already configured cluster.",
    "options": {
      "A": "\"Can Manage\" privileges on the required cluster",
      "B": "Workspace Admin privileges, cluster creation allowed, \"Can Attach To\" privileges on the required cluster",
      "C": "Cluster creation allowed, \"Can Attach To\" privileges on the required cluster",
      "D": "\"Can Restart\" privileges on the required cluster",
      "E": "Cluster creation allowed, \"Can Restart\" privileges on the required cluster"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ \"Can Manage\" privileges on the required cluster\n\n❌ Các đáp án sai:\n  B. Workspace Admin privileges, cluster creation allowed, \"Can Attach To\" privileges on the required cluster\n  C. Cluster creation allowed, \"Can Attach To\" privileges on the required cluster\n  D. \"Can Restart\" privileges on the required cluster\n  E. Cluster creation allowed, \"Can Restart\" privileges on the required cluster",
    "question_vi": "Quản trị viên Databricks workspace đã cấu hình cluster tương tác cho từng nhóm kỹ thuật dữ liệu. Để kiểm soát chi phí, cluster được thiết lập tự tắt sau 30 phút không hoạt động. Mỗi người dùng cần có thể chạy workload trên cluster được chỉ định bất cứ lúc nào trong ngày. Giả sử người dùng đã được thêm vào workspace nhưng chưa được cấp bất kỳ quyền nào, đáp án nào mô tả quyền tối thiểu mà người dùng cần để khởi động và gắn vào cluster đã được cấu hình sẵn?"
  },
  {
    "id": 3,
    "topic": 1,
    "question": "When scheduling Structured Streaming jobs for production, which configuration automatically recovers from query failures and keeps costs low?",
    "options": {
      "A": "Cluster: New Job Cluster; Retries: Unlimited; Maximum Concurrent Runs: Unlimited",
      "B": "Cluster: New Job Cluster; Retries: None; Maximum Concurrent Runs: 1",
      "C": "Cluster: Existing All-Purpose Cluster; Retries: Unlimited; Maximum Concurrent Runs: 1",
      "D": "Cluster: New Job Cluster; Retries: Unlimited; Maximum Concurrent Runs: 1",
      "E": "Cluster: Existing All-Purpose Cluster; Retries: None; Maximum Concurrent Runs: 1"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Cluster: New Job Cluster; Retries: Unlimited; Maximum Concurrent Runs: 1\n\n❌ Các đáp án sai:\n  A. Cluster: New Job Cluster; Retries: Unlimited; Maximum Concurrent Runs: Unlimited\n  B. Cluster: New Job Cluster; Retries: None; Maximum Concurrent Runs: 1\n  C. Cluster: Existing All-Purpose Cluster; Retries: Unlimited; Maximum Concurrent Runs: 1\n  E. Cluster: Existing All-Purpose Cluster; Retries: None; Maximum Concurrent Runs: 1",
    "question_vi": "Khi lập lịch các job Structured Streaming cho production, cấu hình nào tự động phục hồi từ lỗi truy vấn và giữ chi phí thấp?"
  },
  {
    "id": 4,
    "topic": 1,
    "question": "The data engineering team has configured a Databricks SQL query and alert to monitor the values in a Delta Lake table. The recent_sensor_recordings table contains an identifying sensor_id alongside the timestamp and temperature for the most recent 5 minutes of recordings. The below query is used to create the alert: The query is set to refresh each minute and always completes in less than 10 seconds. The alert is set to trigger when mean (temperature) > 120. Notifications are triggered to be sent at most every 1 minute. If this alert raises notifications for 3 consecutive minutes and then stops, which statement must be true?",
    "options": {
      "A": "The total average temperature across all sensors exceeded 120 on three consecutive executions of the query",
      "B": "The recent_sensor_recordings table was unresponsive for three consecutive runs of the query",
      "C": "The source query failed to update properly for three consecutive minutes and then restarted",
      "D": "The maximum temperature recording for at least one sensor exceeded 120 on three consecutive executions of the query",
      "E": "The average temperature recordings for at least one sensor exceeded 120 on three consecutive executions of the query"
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ The average temperature recordings for at least one sensor exceeded 120 on three consecutive executions of the query\n\n❌ Các đáp án sai:\n  A. The total average temperature across all sensors exceeded 120 on three consecutive executions of the query\n  B. The recent_sensor_recordings table was unresponsive for three consecutive runs of the query\n  C. The source query failed to update properly for three consecutive minutes and then restarted\n  D. The maximum temperature recording for at least one sensor exceeded 120 on three consecutive executions of the query",
    "question_vi": "Đoạn mã SQL sau tạo và điền dữ liệu cho bảng Delta Lake. Một khách hàng mới được thêm vào. Sau đó, một câu lệnh UPDATE cũng được chạy. Sau khi câu lệnh UPDATE thực thi, phiên bản nào của bảng tồn tại?"
  },
  {
    "id": 5,
    "topic": 1,
    "question": "A junior developer complains that the code in their notebook isn't producing the correct results in the development environment. A shared screenshot reveals that while they're using a notebook versioned with Databricks Repos, they're using a personal branch that contains old logic. The desired branch named dev-2.3.9 is not available from the branch selection dropdown. Which approach will allow this developer to review the current logic for this notebook?",
    "options": {
      "A": "Use Repos to make a pull request use the Databricks REST API to update the current branch to dev-2.3.9",
      "B": "Use Repos to pull changes from the remote Git repository and select the dev-2.3.9 branch.",
      "C": "Use Repos to checkout the dev-2.3.9 branch and auto-resolve conflicts with the current branch",
      "D": "Merge all changes back to the main branch in the remote Git repository and clone the repo again",
      "E": "Use Repos to merge the current branch and the dev-2.3.9 branch, then make a pull request to sync with the remote repository"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Use Repos to pull changes from the remote Git repository and select the dev-2.3.9 branch.\n\n❌ Các đáp án sai:\n  A. Use Repos to make a pull request use the Databricks REST API to update the current branch to dev-2.3.9\n  C. Use Repos to checkout the dev-2.3.9 branch and auto-resolve conflicts with the current branch\n  D. Merge all changes back to the main branch in the remote Git repository and clone the repo again\n  E. Use Repos to merge the current branch and the dev-2.3.9 branch, then make a pull request to sync with the remote repository",
    "question_vi": "Một lập trình viên mới phàn nàn rằng mã trong notebook của họ không cho kết quả đúng trong môi trường phát triển. Ảnh chụp màn hình cho thấy họ đang sử dụng notebook được quản lý bởi Databricks Repos, nhưng đang dùng nhánh cá nhân chứa logic cũ. Nhánh mong muốn tên dev-2.3.9 không có trong danh sách dropdown chọn nhánh. Cách tiếp cận nào cho phép lập trình viên này xem lại logic hiện tại của notebook?"
  },
  {
    "id": 6,
    "topic": 1,
    "question": "The security team is exploring whether or not the Databricks secrets module can be leveraged for connecting to an external database. After testing the code with all Python variables being defined with strings, they upload the password to the secrets module and configure the correct permissions for the currently active user. They then modify their code to the following (leaving all other variables unchanged). Which statement describes what will happen when the above code is executed?",
    "options": {
      "A": "The connection to the external table will fail; the string \"REDACTED\" will be printed.",
      "B": "An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the encoded password will be saved to DBFS.",
      "C": "An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the password will be printed in plain text.",
      "D": "The connection to the external table will succeed; the string value of password will be printed in plain text.",
      "E": "The connection to the external table will succeed; the string \"REDACTED\" will be printed."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ The connection to the external table will succeed; the string \"REDACTED\" will be printed.\n\n❌ Các đáp án sai:\n  A. The connection to the external table will fail; the string \"REDACTED\" will be printed.\n  B. An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the encoded password will ...\n  C. An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the password will be print...\n  D. The connection to the external table will succeed; the string value of password will be printed in plain text.",
    "question_vi": "Nhóm bảo mật đang tìm hiểu liệu module Databricks secrets có thể được sử dụng để kết nối tới cơ sở dữ liệu bên ngoài hay không. Sau khi test mã với tất cả biến Python được định nghĩa bằng string, họ tải mật khẩu lên module secrets và cấu hình quyền đúng cho người dùng hiện tại. Sau đó họ sửa mã (giữ nguyên các biến khác). Câu nào mô tả kết quả khi đoạn mã trên được thực thi?"
  },
  {
    "id": 7,
    "topic": 1,
    "question": "The data science team has created and logged a production model using MLflow. The following code correctly imports and applies the production model to output the predictions as a new DataFrame named preds with the schema \"customer_id LONG, predictions DOUBLE, date DATE\". The data science team would like predictions saved to a Delta Lake table with the ability to compare all predictions across time. Churn predictions will be made at most once per day. Which code block accomplishes this task while minimizing potential compute costs?",
    "options": {
      "A": "preds.write.mode(\"append\").saveAsTable(\"churn_preds\")",
      "B": "preds.write.format(\"delta\").save(\"/preds/churn_preds\")",
      "C": "spark.readStream.load(\"/preds/churn_preds\").writeStream.option(\"checkpointLocation\", \"/preds/checkpoint\").toTable(\"churn_preds\")",
      "D": "preds.write.mode(\"overwrite\").saveAsTable(\"churn_preds\")",
      "E": "preds.writeStream.option(\"checkpointLocation\", \"/preds/checkpoint\").toTable(\"churn_preds\")"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ preds.write.mode(\"append\").saveAsTable(\"churn_preds\")\n\n❌ Các đáp án sai:\n  B. preds.write.format(\"delta\").save(\"/preds/churn_preds\")\n  C. spark.readStream.load(\"/preds/churn_preds\").writeStream.option(\"checkpointLocation\", \"/preds/checkpoint\").toTable(\"churn_preds\")\n  D. preds.write.mode(\"overwrite\").saveAsTable(\"churn_preds\")\n  E. preds.writeStream.option(\"checkpointLocation\", \"/preds/checkpoint\").toTable(\"churn_preds\")",
    "question_vi": "Nhóm khoa học dữ liệu đã tạo và ghi log một mô hình production sử dụng MLflow. Đoạn mã sau import và áp dụng đúng mô hình production để xuất dự đoán dưới dạng DataFrame mới tên preds với schema \"customer_id LONG, predictions DOUBLE, date DATE\". Nhóm muốn lưu dự đoán vào bảng Delta Lake với khả năng so sánh tất cả dự đoán theo thời gian. Dự đoán churn được thực hiện nhiều nhất mỗi ngày một lần. Khối mã nào hoàn thành nhiệm vụ này đồng thời giảm thiểu chi phí tính toán?"
  },
  {
    "id": 8,
    "topic": 1,
    "question": "An upstream source writes Parquet data as hourly batches to directories named with the current date. A nightly batch job runs the following code to ingest all data from the previous day as indicated by the date variable: Assume that the fields customer_id and order_id serve as a composite key to uniquely identify each order. If the upstream system is known to occasionally produce duplicate entries for a single order hours apart, which statement is correct?",
    "options": {
      "A": "Each write to the orders table will only contain unique records, and only those records without duplicates in the target table will be written.",
      "B": "Each write to the orders table will only contain unique records, but newly written records may have duplicates already present in the target table.",
      "C": "Each write to the orders table will only contain unique records; if existing records with the same key are present in the target table, these records will be overwritten.",
      "D": "Each write to the orders table will only contain unique records; if existing records with the same key are present in the target table, the operation will fail.",
      "E": "Each write to the orders table will run deduplication over the union of new and existing records, ensuring no duplicate records are present."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Each write to the orders table will only contain unique records, but newly written records may have duplicates already present in the target table.\n\n❌ Các đáp án sai:\n  A. Each write to the orders table will only contain unique records, and only those records without duplicates in the target table will be written.\n  C. Each write to the orders table will only contain unique records; if existing records with the same key are present in the target table, these recor...\n  D. Each write to the orders table will only contain unique records; if existing records with the same key are present in the target table, the operati...\n  E. Each write to the orders table will run deduplication over the union of new and existing records, ensuring no duplicate records are present.",
    "question_vi": "Một nguồn thượng nguồn ghi dữ liệu Parquet dưới dạng lô hàng giờ vào các thư mục đặt tên theo ngày hiện tại. Một batch job hàng đêm chạy đoạn mã sau để nạp tất cả dữ liệu từ ngày hôm trước theo biến date. Giả sử các trường customer_id và order_id tạo thành khóa composite để xác định duy nhất mỗi đơn hàng. Nếu hệ thống thượng nguồn đôi khi tạo bản ghi trùng lặp cho cùng một đơn hàng cách nhau vài giờ, câu nào đúng?"
  },
  {
    "id": 9,
    "topic": 1,
    "question": "A junior member of the data engineering team is exploring the language interoperability of Databricks notebooks. The intended outcome of the below code is to register a view of all sales that occurred in countries on the continent of Africa that appear in the geo_lookup table. Before executing the code, running SHOW TABLES on the current database indicates the database contains only two tables: geo_lookup and sales. Which statement correctly describes the outcome of executing these command cells in order in an interactive notebook?",
    "options": {
      "A": "Both commands will succeed. Executing show tables will show that countries_af and sales_af have been registered as views.",
      "B": "Cmd 1 will succeed. Cmd 2 will search all accessible databases for a table or view named countries_af: if this entity exists, Cmd 2 will succeed.",
      "C": "Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable representing a PySpark DataFrame.",
      "D": "Both commands will fail. No new variables, tables, or views will be created.",
      "E": "Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable containing a list of strings."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable containing a list of strings.\n\n❌ Các đáp án sai:\n  A. Both commands will succeed. Executing show tables will show that countries_af and sales_af have been registered as views.\n  B. Cmd 1 will succeed. Cmd 2 will search all accessible databases for a table or view named countries_af: if this entity exists, Cmd 2 will succeed.\n  C. Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable representing a PySpark DataFrame.\n  D. Both commands will fail. No new variables, tables, or views will be created.",
    "question_vi": "Một thành viên mới của nhóm kỹ thuật dữ liệu đang tìm hiểu khả năng tương thích ngôn ngữ của Databricks notebooks. Mục đích của đoạn mã dưới đây là đăng ký view chứa tất cả doanh số bán hàng tại các quốc gia thuộc châu Phi có trong bảng geo_lookup. Trước khi thực thi, chạy SHOW TABLES cho thấy database chỉ chứa hai bảng: geo_lookup và sales. Câu nào mô tả đúng kết quả khi thực thi các ô lệnh này theo thứ tự trong notebook tương tác?"
  },
  {
    "id": 10,
    "topic": 1,
    "question": "A Delta table of weather records is partitioned by date and has the below schema: date DATE, device_id INT, temp FLOAT, latitude FLOAT, longitude FLOAT To find all the records from within the Arctic Circle, you execute a query with the below filter: latitude > 66.3 Which statement describes how the Delta engine identifies which files to load?",
    "options": {
      "A": "All records are cached to an operational database and then the filter is applied",
      "B": "The Parquet file footers are scanned for min and max statistics for the latitude column",
      "C": "All records are cached to attached storage and then the filter is applied",
      "D": "The Delta log is scanned for min and max statistics for the latitude column",
      "E": "The Hive metastore is scanned for min and max statistics for the latitude column"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The Parquet file footers are scanned for min and max statistics for the latitude column\n\n❌ Các đáp án sai:\n  A. All records are cached to an operational database and then the filter is applied\n  C. All records are cached to attached storage and then the filter is applied\n  D. The Delta log is scanned for min and max statistics for the latitude column\n  E. The Hive metastore is scanned for min and max statistics for the latitude column",
    "question_vi": "Một bảng Delta chứa bản ghi thời tiết được phân vùng theo ngày và có schema: date DATE, device_id INT, temp FLOAT, latitude FLOAT, longitude FLOAT. Để tìm tất cả bản ghi từ Vòng Bắc Cực, bạn thực thi truy vấn với bộ lọc: latitude > 66.3. Câu nào mô tả cách Delta engine xác định file nào cần tải?"
  },
  {
    "id": 11,
    "topic": 1,
    "question": "The data engineering team has configured a job to process customer requests to be forgotten (have their data deleted). All user data that needs to be deleted is stored in Delta Lake tables using default table settings. The team has decided to process all deletions from the previous week as a batch job at 1am each Sunday. The total duration of this job is less than one hour. Every Monday at 3am, a batch job executes a series of VACUUM commands on all Delta Lake tables throughout the organization. The compliance officer has recently learned about Delta Lake's time travel functionality. They are concerned that this might allow continued access to deleted data. Assuming all delete logic is correctly implemented, which statement correctly addresses this concern?",
    "options": {
      "A": "Because the VACUUM command permanently deletes all files containing deleted records, deleted records may be accessible with time travel for around 24 hours.",
      "B": "Because the default data retention threshold is 24 hours, data files containing deleted records will be retained until the VACUUM job is run the following day.",
      "C": "Because Delta Lake time travel provides full access to the entire history of a table, deleted records can always be recreated by users with full admin privileges.",
      "D": "Because Delta Lake's delete statements have ACID guarantees, deleted records will be permanently purged from all storage systems as soon as a delete job completes.",
      "E": "Because the default data retention threshold is 7 days, data files containing deleted records will be retained until the VACUUM job is run 8 days later."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Because the VACUUM command permanently deletes all files containing deleted records, deleted records may be accessible with time travel for around 24 hours.\n\n❌ Các đáp án sai:\n  B. Because the default data retention threshold is 24 hours, data files containing deleted records will be retained until the VACUUM job is run the fo...\n  C. Because Delta Lake time travel provides full access to the entire history of a table, deleted records can always be recreated by users with full ad...\n  D. Because Delta Lake's delete statements have ACID guarantees, deleted records will be permanently purged from all storage systems as soon as a delet...\n  E. Because the default data retention threshold is 7 days, data files containing deleted records will be retained until the VACUUM job is run 8 days l...",
    "question_vi": "Nhóm kỹ thuật dữ liệu đã cấu hình một job để xử lý yêu cầu xóa dữ liệu của khách hàng (quyền được quên). Tất cả dữ liệu người dùng cần xóa được lưu trong các bảng Delta Lake với cài đặt mặc định. Nhóm quyết định xử lý tất cả yêu cầu xóa của tuần trước bằng batch job lúc 1h sáng mỗi Chủ nhật. Tổng thời gian chạy dưới một giờ. Mỗi thứ Hai lúc 3h sáng, một batch job thực thi một loạt lệnh VACUUM trên tất cả bảng Delta Lake trong tổ chức. Nhân viên tuân thủ gần đây biết về chức năng time travel của Delta Lake và lo ngại rằng điều này có thể cho phép tiếp tục truy cập dữ liệu đã xóa. Giả sử logic xóa được triển khai đúng, câu nào giải quyết đúng mối lo ngại này?"
  },
  {
    "id": 12,
    "topic": 1,
    "question": "A junior data engineer has configured a workload that posts the following JSON to the Databricks REST API endpoint 2.0/jobs/create. Assuming that all configurations and referenced resources are available, which statement describes the result of executing this workload three times?",
    "options": {
      "A": "Three new jobs named \"Ingest new data\" will be defined in the workspace, and they will each run once daily.",
      "B": "The logic defined in the referenced notebook will be executed three times on new clusters with the configurations of the provided cluster I",
      "C": "Three new jobs named \"Ingest new data\" will be defined in the workspace, but no jobs will be executed.",
      "D": "One new job named \"Ingest new data\" will be defined in the workspace, but it will not be executed.",
      "E": "The logic defined in the referenced notebook will be executed three times on the referenced existing all purpose cluster."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Three new jobs named \"Ingest new data\" will be defined in the workspace, but no jobs will be executed.\n\n❌ Các đáp án sai:\n  A. Three new jobs named \"Ingest new data\" will be defined in the workspace, and they will each run once daily.\n  B. The logic defined in the referenced notebook will be executed three times on new clusters with the configurations of the provided cluster I\n  D. One new job named \"Ingest new data\" will be defined in the workspace, but it will not be executed.\n  E. The logic defined in the referenced notebook will be executed three times on the referenced existing all purpose cluster.",
    "question_vi": "Một kỹ sư dữ liệu mới đã cấu hình workload gửi JSON sau tới Databricks REST API endpoint 2.0/jobs/create. Giả sử tất cả cấu hình và tài nguyên tham chiếu đều có sẵn, câu nào mô tả kết quả khi thực thi workload này ba lần?"
  },
  {
    "id": 13,
    "topic": 1,
    "question": "An upstream system is emitting change data capture (CDC) logs that are being written to a cloud object storage directory. Each record in the log indicates the change type (insert, update, or delete) and the values for each field after the change. The source table has a primary key identified by the field pk_id. For auditing purposes, the data governance team wishes to maintain a full record of all values that have ever been valid in the source system. For analytical purposes, only the most recent value for each record needs to be recorded. The Databricks job to ingest these records occurs once per hour, but each individual record may have changed multiple times over the course of an hour. Which solution meets these requirements?",
    "options": {
      "A": "Create a separate history table for each pk_id resolve the current state of the table by running a union all filtering the history tables for the most recent state.",
      "B": "Use MERGE INTO to insert, update, or delete the most recent entry for each pk_id into a bronze table, then propagate all changes throughout the system.",
      "C": "Iterate through an ordered set of changes to the table, applying each in turn; rely on Delta Lake's versioning ability to create an audit log.",
      "D": "Use Delta Lake's change data feed to automatically process CDC data from an external system, propagating all changes to all dependent tables in the Lakehouse.",
      "E": "Ingest all log information into a bronze table; use MERGE INTO to insert, update, or delete the most recent entry for each pk_id into a silver table to recreate the current table state."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ Ingest all log information into a bronze table; use MERGE INTO to insert, update, or delete the most recent entry for each pk_id into a silver table to recreate the current table state.\n\n❌ Các đáp án sai:\n  A. Create a separate history table for each pk_id resolve the current state of the table by running a union all filtering the history tables for the m...\n  B. Use MERGE INTO to insert, update, or delete the most recent entry for each pk_id into a bronze table, then propagate all changes throughout the sys...\n  C. Iterate through an ordered set of changes to the table, applying each in turn; rely on Delta Lake's versioning ability to create an audit log.\n  D. Use Delta Lake's change data feed to automatically process CDC data from an external system, propagating all changes to all dependent tables in the...",
    "question_vi": "Một hệ thống thượng nguồn đang phát ra nhật ký Change Data Capture (CDC) được ghi vào thư mục lưu trữ đối tượng đám mây. Mỗi bản ghi cho biết loại thay đổi (insert, update, hoặc delete) và giá trị cho mỗi trường sau thay đổi. Bảng nguồn có khóa chính xác định bởi trường pk_id. Nhóm quản trị dữ liệu muốn duy trì bản ghi đầy đủ mọi giá trị đã từng hợp lệ trong hệ thống nguồn vì mục đích kiểm toán. Cho mục đích phân tích, chỉ cần giá trị mới nhất cho mỗi bản ghi. Databricks job nạp dữ liệu chạy mỗi giờ, nhưng mỗi bản ghi có thể đã thay đổi nhiều lần trong một giờ. Giải pháp nào đáp ứng yêu cầu này?"
  },
  {
    "id": 14,
    "topic": 1,
    "question": "An hourly batch job is configured to ingest data files from a cloud object storage container where each batch represent all records produced by the source system in a given hour. The batch job to process these records into the Lakehouse is sufficiently delayed to ensure no late-arriving data is missed. The user_id field represents a unique key for the data, which has the following schema: user_id BIGINT, username STRING, user_utc STRING, user_region STRING, last_login BIGINT, auto_pay BOOLEAN, last_updated BIGINT New records are all ingested into a table named account_history which maintains a full record of all data in the same schema as the source. The next table in the system is named account_current and is implemented as a Type 1 table representing the most recent value for each unique user_id. Assuming there are millions of user accounts and tens of thousands of records processed hourly, which implementation can be used to efficiently update the described account_current table as part of each hourly batch job?",
    "options": {
      "A": "Use Auto Loader to subscribe to new files in the account_history directory; configure a Structured Streaming trigger once job to batch update newly detected files into the account_current table.",
      "B": "Overwrite the account_current table with each batch using the results of a query against the account_history table grouping by user_id and filtering for the max value of last_updated.",
      "C": "Filter records in account_history using the last_updated field and the most recent hour processed, as well as the max last_iogin by user_id write a merge statement to update or insert the most recent value for each user_id.",
      "D": "Use Delta Lake version history to get the difference between the latest version of account_history and one version prior, then write these records to account_current.",
      "E": "Filter records in account_history using the last_updated field and the most recent hour processed, making sure to deduplicate on username; write a merge statement to update or insert the most recent value for each username."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Filter records in account_history using the last_updated field and the most recent hour processed, as well as the max last_iogin by user_id write a merge statement to update or insert the most recent value for each user_id.\n\n❌ Các đáp án sai:\n  A. Use Auto Loader to subscribe to new files in the account_history directory; configure a Structured Streaming trigger once job to batch update newly...\n  B. Overwrite the account_current table with each batch using the results of a query against the account_history table grouping by user_id and filterin...\n  D. Use Delta Lake version history to get the difference between the latest version of account_history and one version prior, then write these records ...\n  E. Filter records in account_history using the last_updated field and the most recent hour processed, making sure to deduplicate on username; write a ...",
    "question_vi": "Một batch job hàng giờ được cấu hình để nạp file dữ liệu từ vùng lưu trữ đám mây, mỗi lô đại diện cho tất cả bản ghi từ hệ thống nguồn trong một giờ. Batch job đã được trì hoãn đủ để không bỏ sót dữ liệu đến muộn. Trường user_id là khóa duy nhất. Bản ghi mới được nạp vào bảng account_history giữ toàn bộ lịch sử. Bảng tiếp theo là account_current, kiểu Type 1 đại diện cho giá trị mới nhất của mỗi user_id. Giả sử có hàng triệu tài khoản và hàng chục nghìn bản ghi được xử lý mỗi giờ, cách triển khai nào cập nhật hiệu quả bảng account_current?"
  },
  {
    "id": 15,
    "topic": 1,
    "question": "A table in the Lakehouse named customer_churn_params is used in churn prediction by the machine learning team. The table contains information about customers derived from a number of upstream sources. Currently, the data engineering team populates this table nightly by overwriting the table with the current valid values derived from upstream data sources. The churn prediction model used by the ML team is fairly stable in production. The team is only interested in making predictions on records that have changed in the past 24 hours. Which approach would simplify the identification of these changed records?",
    "options": {
      "A": "Apply the churn model to all rows in the customer_churn_params table, but implement logic to perform an upsert into the predictions table that ignores rows where predictions have not changed.",
      "B": "Convert the batch job to a Structured Streaming job using the complete output mode; configure a Structured Streaming job to read from the customer_churn_params table and incrementally predict against the churn model.",
      "C": "Calculate the difference between the previous model predictions and the current customer_churn_params on a key identifying unique customers before making new predictions; only make predictions on those customers not in the previous predictions.",
      "D": "Modify the overwrite logic to include a field populated by calling spark.sql.functions.current_timestamp() as data are being written; use this field to identify records written on a particular date.",
      "E": "Replace the current overwrite logic with a merge statement to modify only those records that have changed; write logic to make predictions on the changed records identified by the change data feed."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ Replace the current overwrite logic with a merge statement to modify only those records that have changed; write logic to make predictions on the changed records identified by the change data feed.\n\n❌ Các đáp án sai:\n  A. Apply the churn model to all rows in the customer_churn_params table, but implement logic to perform an upsert into the predictions table that igno...\n  B. Convert the batch job to a Structured Streaming job using the complete output mode; configure a Structured Streaming job to read from the customer_...\n  C. Calculate the difference between the previous model predictions and the current customer_churn_params on a key identifying unique customers before ...\n  D. Modify the overwrite logic to include a field populated by calling spark.sql.functions.current_timestamp() as data are being written; use this fiel...",
    "question_vi": "Bảng customer_churn_params trong Lakehouse được nhóm ML sử dụng cho dự đoán churn. Bảng chứa thông tin khách hàng từ nhiều nguồn thượng nguồn. Hiện tại, nhóm kỹ thuật dữ liệu cập nhật bảng hàng đêm bằng cách ghi đè với giá trị hiện hành. Mô hình dự đoán churn khá ổn định trong production. Nhóm chỉ quan tâm dự đoán các bản ghi đã thay đổi trong 24 giờ qua. Cách tiếp cận nào đơn giản hóa việc xác định bản ghi đã thay đổi?"
  },
  {
    "id": 16,
    "topic": 1,
    "question": "A table is registered with the following code: Both users and orders are Delta Lake tables. Which statement describes the results of querying recent_orders?",
    "options": {
      "A": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query finishes.",
      "B": "All logic will execute when the table is defined and store the result of joining tables to the DBFS; this stored data will be returned when the table is queried.",
      "C": "Results will be computed and cached when the table is defined; these cached results will incrementally update as new records are inserted into source tables.",
      "D": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query began.",
      "E": "The versions of each source table will be stored in the table transaction log; query results will be saved to DBFS with each query."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query began.\n\n❌ Các đáp án sai:\n  A. All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query finishes.\n  B. All logic will execute when the table is defined and store the result of joining tables to the DBFS; this stored data will be returned when the tab...\n  C. Results will be computed and cached when the table is defined; these cached results will incrementally update as new records are inserted into sour...\n  E. The versions of each source table will be stored in the table transaction log; query results will be saved to DBFS with each query.",
    "question_vi": "Một bảng được đăng ký bằng đoạn mã sau. Cả users và orders đều là bảng Delta Lake. Câu nào mô tả kết quả khi truy vấn recent_orders?"
  },
  {
    "id": 17,
    "topic": 1,
    "question": "A production workload incrementally applies updates from an external Change Data Capture feed to a Delta Lake table as an always-on Structured Stream job. When data was initially migrated for this table, OPTIMIZE was executed and most data files were resized to 1 G",
    "options": {
      "B": "Z-order indices calculated on the table are preventing file compaction",
      "A": "Databricks has autotuned to a smaller target file size to reduce duration of MERGE operations",
      "C": "Bloom filter indices calculated on the table are preventing file compaction",
      "D": "Databricks has autotuned to a smaller target file size based on the overall size of data in the table",
      "E": "Databricks has autotuned to a smaller target file size based on the amount of data in each partition"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Databricks has autotuned to a smaller target file size to reduce duration of MERGE operations\n\n❌ Các đáp án sai:\n  B. Z-order indices calculated on the table are preventing file compaction\n  C. Bloom filter indices calculated on the table are preventing file compaction\n  D. Databricks has autotuned to a smaller target file size based on the overall size of data in the table\n  E. Databricks has autotuned to a smaller target file size based on the amount of data in each partition",
    "question_vi": "Một workload production xử lý tăng dần các cập nhật từ nguồn Change Data Capture bên ngoài vào bảng Delta Lake dưới dạng Structured Streaming job chạy liên tục. Khi dữ liệu được migrate ban đầu, OPTIMIZE đã được thực thi và hầu hết file dữ liệu có kích thước khoảng 1 GB. Câu nào mô tả cách kích thước file sẽ bị ảnh hưởng bởi workload này theo thời gian và tại sao?"
  },
  {
    "id": 18,
    "topic": 1,
    "question": "Which statement regarding stream-static joins and static Delta tables is correct?",
    "options": {
      "A": "Each microbatch of a stream-static join will use the most recent version of the static Delta table as of each microbatch.",
      "B": "Each microbatch of a stream-static join will use the most recent version of the static Delta table as of the job's initialization.",
      "C": "The checkpoint directory will be used to track state information for the unique keys present in the join.",
      "D": "Stream-static joins cannot use static Delta tables because of consistency issues.",
      "E": "The checkpoint directory will be used to track updates to the static Delta table."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Each microbatch of a stream-static join will use the most recent version of the static Delta table as of each microbatch.\n\n❌ Các đáp án sai:\n  B. Each microbatch of a stream-static join will use the most recent version of the static Delta table as of the job's initialization.\n  C. The checkpoint directory will be used to track state information for the unique keys present in the join.\n  D. Stream-static joins cannot use static Delta tables because of consistency issues.\n  E. The checkpoint directory will be used to track updates to the static Delta table.",
    "question_vi": "Câu nào về stream-static join và bảng Delta tĩnh là đúng?"
  },
  {
    "id": 19,
    "topic": 1,
    "question": "A junior data engineer has been asked to develop a streaming data pipeline with a grouped aggregation using DataFrame df. The pipeline needs to calculate the average humidity and average temperature for each non-overlapping five-minute interval. Events are recorded once per minute per device. Streaming DataFrame df has the following schema: \"device_id INT, event_time TIMESTAMP, temp FLOAT, humidity FLOAT\" Code block: Choose the response that correctly fills in the blank within the code block to complete this task.",
    "options": {
      "A": "to_interval(\"event_time\", \"5 minutes\").alias(\"time\")",
      "B": "window(\"event_time\", \"5 minutes\").alias(\"time\")",
      "C": "\"event_time\"",
      "D": "window(\"event_time\", \"10 minutes\").alias(\"time\")",
      "E": "lag(\"event_time\", \"10 minutes\").alias(\"time\")"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ window(\"event_time\", \"5 minutes\").alias(\"time\")\n\n❌ Các đáp án sai:\n  A. to_interval(\"event_time\", \"5 minutes\").alias(\"time\")\n  C. \"event_time\"\n  D. window(\"event_time\", \"10 minutes\").alias(\"time\")\n  E. lag(\"event_time\", \"10 minutes\").alias(\"time\")",
    "question_vi": "Một kỹ sư dữ liệu mới được yêu cầu phát triển pipeline streaming với nhóm tổng hợp sử dụng DataFrame df. Pipeline cần tính trung bình độ ẩm và nhiệt độ cho mỗi khoảng 5 phút không chồng lấp. Sự kiện được ghi mỗi phút mỗi thiết bị. Streaming DataFrame df có schema: \"device_id INT, event_time TIMESTAMP, temp FLOAT, humidity FLOAT\". Chọn đáp án điền đúng vào chỗ trống trong khối mã để hoàn thành nhiệm vụ."
  },
  {
    "id": 20,
    "topic": 1,
    "question": "A data architect has designed a system in which two Structured Streaming jobs will concurrently write to a single bronze Delta table. Each job is subscribing to a different topic from an Apache Kafka source, but they will write data with the same schema. To keep the directory structure simple, a data engineer has decided to nest a checkpoint directory to be shared by both streams. The proposed directory structure is displayed below: Which statement describes whether this checkpoint directory structure is valid for the given scenario and why?",
    "options": {
      "A": "No; Delta Lake manages streaming checkpoints in the transaction log.",
      "B": "Yes; both of the streams can share a single checkpoint directory.",
      "C": "No; only one stream can write to a Delta Lake table.",
      "D": "Yes; Delta Lake supports infinite concurrent writers.",
      "E": "No; each of the streams needs to have its own checkpoint directory."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ No; each of the streams needs to have its own checkpoint directory.\n\n❌ Các đáp án sai:\n  A. No; Delta Lake manages streaming checkpoints in the transaction log.\n  B. Yes; both of the streams can share a single checkpoint directory.\n  C. No; only one stream can write to a Delta Lake table.\n  D. Yes; Delta Lake supports infinite concurrent writers.",
    "question_vi": "Một kiến trúc sư dữ liệu đã thiết kế hệ thống mà hai Structured Streaming job sẽ ghi đồng thời vào một bảng bronze Delta. Mỗi job đăng ký một topic khác nhau từ nguồn Apache Kafka, nhưng ghi dữ liệu cùng schema. Để giữ cấu trúc thư mục đơn giản, kỹ sư quyết định dùng chung thư mục checkpoint cho cả hai stream. Câu nào mô tả liệu cấu trúc checkpoint này có hợp lệ cho kịch bản trên không và tại sao?"
  },
  {
    "id": 21,
    "topic": 1,
    "question": "A Structured Streaming job deployed to production has been experiencing delays during peak hours of the day. At present, during normal execution, each microbatch of data is processed in less than 3 seconds. During peak hours of the day, execution time for each microbatch becomes very inconsistent, sometimes exceeding 30 seconds. The streaming write is currently configured with a trigger interval of 10 seconds. Holding all other variables constant and assuming records need to be processed in less than 10 seconds, which adjustment will meet the requirement?",
    "options": {
      "A": "Decrease the trigger interval to 5 seconds; triggering batches more frequently allows idle executors to begin processing the next batch while longer running tasks from previous batches finish.",
      "B": "Increase the trigger interval to 30 seconds; setting the trigger interval near the maximum execution time observed for each batch is always best practice to ensure no records are dropped.",
      "C": "The trigger interval cannot be modified without modifying the checkpoint directory; to maintain the current stream state, increase the number of shuffle partitions to maximize parallelism.",
      "D": "Use the trigger once option and configure a Databricks job to execute the query every 10 seconds; this ensures all backlogged records are processed with each batch.",
      "E": "Decrease the trigger interval to 5 seconds; triggering batches more frequently may prevent records from backing up and large batches from causing spill."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Use the trigger once option and configure a Databricks job to execute the query every 10 seconds; this ensures all backlogged records are processed with each batch.\n\n❌ Các đáp án sai:\n  A. Decrease the trigger interval to 5 seconds; triggering batches more frequently allows idle executors to begin processing the next batch while longe...\n  B. Increase the trigger interval to 30 seconds; setting the trigger interval near the maximum execution time observed for each batch is always best pr...\n  C. The trigger interval cannot be modified without modifying the checkpoint directory; to maintain the current stream state, increase the number of sh...\n  E. Decrease the trigger interval to 5 seconds; triggering batches more frequently may prevent records from backing up and large batches from causing s...",
    "question_vi": "Một Structured Streaming job đã triển khai production đang gặp trễ trong giờ cao điểm. Hiện tại, trong điều kiện bình thường, mỗi micro batch được xử lý dưới 3 giây. Trong giờ cao điểm, thời gian thực thi mỗi micro batch trở nên rất không ổn định, đôi khi vượt quá 30 giây. Streaming write hiện được cấu hình với trigger interval. Câu nào mô tả thay đổi giúp giải quyết vấn đề này?"
  },
  {
    "id": 22,
    "topic": 1,
    "question": "Which statement describes Delta Lake Auto Compaction?",
    "options": {
      "A": "An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed toward a default of 1 G",
      "B": "Before a Jobs cluster terminates, OPTIMIZE is executed on all tables modified during the most recent job.",
      "C": "Optimized writes use logical partitions instead of directory partitions; because partition boundaries are only represented in metadata, fewer small files are written.",
      "D": "Data is queued in a messaging bus instead of committing data directly to memory; all data is committed from the messaging bus in one batch once the job is complete.",
      "E": "An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed toward a default of 128 MB."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed toward a default of 1 G\n\n❌ Các đáp án sai:\n  B. Before a Jobs cluster terminates, OPTIMIZE is executed on all tables modified during the most recent job.\n  C. Optimized writes use logical partitions instead of directory partitions; because partition boundaries are only represented in metadata, fewer small...\n  D. Data is queued in a messaging bus instead of committing data directly to memory; all data is committed from the messaging bus in one batch once the...\n  E. An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed toward a defa...",
    "question_vi": "Câu nào mô tả tính năng Auto Compaction của Delta Lake?"
  },
  {
    "id": 23,
    "topic": 1,
    "question": "Which statement characterizes the general programming model used by Spark Structured Streaming?",
    "options": {
      "A": "Structured Streaming leverages the parallel processing of GPUs to achieve highly parallel data throughput.",
      "B": "Structured Streaming is implemented as a messaging bus and is derived from Apache Kafka.",
      "C": "Structured Streaming uses specialized hardware and I/O streams to achieve sub-second latency for data transfer.",
      "D": "Structured Streaming models new data arriving in a data stream as new rows appended to an unbounded table.",
      "E": "Structured Streaming relies on a distributed network of nodes that hold incremental state values for cached stages."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Structured Streaming models new data arriving in a data stream as new rows appended to an unbounded table.\n\n❌ Các đáp án sai:\n  A. Structured Streaming leverages the parallel processing of GPUs to achieve highly parallel data throughput.\n  B. Structured Streaming is implemented as a messaging bus and is derived from Apache Kafka.\n  C. Structured Streaming uses specialized hardware and I/O streams to achieve sub-second latency for data transfer.\n  E. Structured Streaming relies on a distributed network of nodes that hold incremental state values for cached stages.",
    "question_vi": "Câu nào đặc trưng cho mô hình lập trình chung được sử dụng bởi Spark Structured Streaming?"
  },
  {
    "id": 24,
    "topic": 1,
    "question": "Which configuration parameter directly affects the size of a spark-partition upon ingestion of data into Spark?",
    "options": {
      "A": "spark.sql.files.maxPartitionBytes",
      "B": "spark.sql.autoBroadcastJoinThreshold",
      "C": "spark.sql.files.openCostInBytes",
      "D": "spark.sql.adaptive.coalescePartitions.minPartitionNum",
      "E": "spark.sql.adaptive.advisoryPartitionSizeInBytes"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ spark.sql.files.maxPartitionBytes\n\n❌ Các đáp án sai:\n  B. spark.sql.autoBroadcastJoinThreshold\n  C. spark.sql.files.openCostInBytes\n  D. spark.sql.adaptive.coalescePartitions.minPartitionNum\n  E. spark.sql.adaptive.advisoryPartitionSizeInBytes",
    "question_vi": "Tham số cấu hình nào ảnh hưởng trực tiếp đến kích thước spark-partition khi nạp dữ liệu vào Spark?"
  },
  {
    "id": 25,
    "topic": 1,
    "question": "A Spark job is taking longer than expected. Using the Spark UI, a data engineer notes that the Min, Median, and Max Durations for tasks in a particular stage show the minimum and median time to complete a task as roughly the same, but the max duration for a task to be roughly 100 times as long as the minimum. Which situation is causing increased duration of the overall job?",
    "options": {
      "A": "Task queueing resulting from improper thread pool assignment.",
      "B": "Spill resulting from attached volume storage being too small.",
      "C": "Network latency due to some cluster nodes being in different regions from the source data",
      "D": "Skew caused by more data being assigned to a subset of spark-partitions.",
      "E": "Credential validation errors while pulling data from an external system."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Skew caused by more data being assigned to a subset of spark-partitions.\n\n❌ Các đáp án sai:\n  A. Task queueing resulting from improper thread pool assignment.\n  B. Spill resulting from attached volume storage being too small.\n  C. Network latency due to some cluster nodes being in different regions from the source data\n  E. Credential validation errors while pulling data from an external system.",
    "question_vi": "Một Spark job mất nhiều thời gian hơn dự kiến. Sử dụng Spark UI, kỹ sư dữ liệu nhận thấy thời gian Min, Median và Max Duration cho các task trong một stage cụ thể cho thấy thời gian minimum và median gần bằng nhau, nhưng max duration dài gấp khoảng 100 lần minimum. Tình huống nào gây ra thời gian kéo dài của job tổng thể?"
  },
  {
    "id": 26,
    "topic": 1,
    "question": "Each configuration below is identical to the extent that each cluster has 400 GB total of RAM, 160 total cores and only one Executor per VM. Given a job with at least one wide transformation, which of the following cluster configurations will result in maximum performance?",
    "options": {
      "A": "• Total VMs; 1 • 400 GB per Executor • 160 Cores / Executor",
      "B": "• Total VMs: 8 • 50 GB per Executor • 20 Cores / Executor",
      "C": "• Total VMs: 16 • 25 GB per Executor • 10 Cores/Executor",
      "D": "• Total VMs: 4 • 100 GB per Executor • 40 Cores/Executor",
      "E": "• Total VMs:2 • 200 GB per Executor • 80 Cores / Executor"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ • Total VMs: 8 • 50 GB per Executor • 20 Cores / Executor\n\n❌ Các đáp án sai:\n  A. • Total VMs; 1 • 400 GB per Executor • 160 Cores / Executor\n  C. • Total VMs: 16 • 25 GB per Executor • 10 Cores/Executor\n  D. • Total VMs: 4 • 100 GB per Executor • 40 Cores/Executor\n  E. • Total VMs:2 • 200 GB per Executor • 80 Cores / Executor",
    "question_vi": "Mỗi cấu hình dưới đây giống nhau ở chỗ mỗi cluster có tổng 400 GB RAM, 160 core và chỉ một Executor mỗi VM. Với một job có ít nhất một wide transformation, cấu hình cluster nào sẽ cho hiệu suất tối đa?"
  },
  {
    "id": 27,
    "topic": 1,
    "question": "A junior data engineer on your team has implemented the following code block. The view new_events contains a batch of records with the same schema as the events Delta table. The event_id field serves as a unique key for this table. When this query is executed, what will happen with new records that have the same event_id as an existing record?",
    "options": {
      "A": "They are merged.",
      "B": "They are ignored.",
      "C": "They are updated.",
      "D": "They are inserted.",
      "E": "They are deleted."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ They are ignored.\n\n❌ Các đáp án sai:\n  A. They are merged.\n  C. They are updated.\n  D. They are inserted.\n  E. They are deleted.",
    "question_vi": "Một kỹ sư dữ liệu mới trong nhóm đã triển khai khối mã sau. View new_events chứa một lô bản ghi với cùng schema như bảng Delta events. Trường event_id là khóa duy nhất của bảng. Khi truy vấn này được thực thi, điều gì sẽ xảy ra với bản ghi mới có cùng event_id với bản ghi đã tồn tại?"
  },
  {
    "id": 28,
    "topic": 1,
    "question": "A junior data engineer seeks to leverage Delta Lake's Change Data Feed functionality to create a Type 1 table representing all of the values that have ever been valid for all rows in a bronze table created with the property delta.enableChangeDataFeed = true. They plan to execute the following code as a daily job: Which statement describes the execution and results of running the above query multiple times?",
    "options": {
      "A": "Each time the job is executed, newly updated records will be merged into the target table, overwriting previous values with the same primary keys.",
      "B": "Each time the job is executed, the entire available history of inserted or updated records will be appended to the target table, resulting in many duplicate entries.",
      "C": "Each time the job is executed, the target table will be overwritten using the entire history of inserted or updated records, giving the desired result.",
      "D": "Each time the job is executed, the differences between the original and current versions are calculated; this may result in duplicate entries for some records.",
      "E": "Each time the job is executed, only those records that have been inserted or updated since the last execution will be appended to the target table, giving the desired result."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Each time the job is executed, the entire available history of inserted or updated records will be appended to the target table, resulting in many duplicate entries.\n\n❌ Các đáp án sai:\n  A. Each time the job is executed, newly updated records will be merged into the target table, overwriting previous values with the same primary keys.\n  C. Each time the job is executed, the target table will be overwritten using the entire history of inserted or updated records, giving the desired res...\n  D. Each time the job is executed, the differences between the original and current versions are calculated; this may result in duplicate entries for s...\n  E. Each time the job is executed, only those records that have been inserted or updated since the last execution will be appended to the target table,...",
    "question_vi": "Một kỹ sư dữ liệu mới muốn tận dụng chức năng Change Data Feed của Delta Lake để tạo bảng Type 1 đại diện cho tất cả giá trị đã từng hợp lệ cho mọi hàng trong bảng bronze được tạo với thuộc tính delta.enableChangeDataFeed = true. Họ dự định chạy đoạn mã sau như job hàng ngày. Câu nào mô tả việc thực thi và kết quả khi chạy truy vấn trên nhiều lần?"
  },
  {
    "id": 29,
    "topic": 1,
    "question": "A new data engineer notices that a critical field was omitted from an application that writes its Kafka source to Delta Lake. This happened even though the critical field was in the Kafka source. That field was further missing from data written to dependent, long-term storage. The retention threshold on the Kafka service is seven days. The pipeline has been in production for three months. Which describes how Delta Lake can help to avoid data loss of this nature in the future?",
    "options": {
      "A": "The Delta log and Structured Streaming checkpoints record the full history of the Kafka producer.",
      "B": "Delta Lake schema evolution can retroactively calculate the correct value for newly added fields, as long as the data was in the original source.",
      "C": "Delta Lake automatically checks that all fields present in the source data are included in the ingestion layer.",
      "D": "Data can never be permanently dropped or deleted from Delta Lake, so data loss is not possible under any circumstance.",
      "E": "Ingesting all raw data and metadata from Kafka to a bronze Delta table creates a permanent, replayable history of the data state."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ Ingesting all raw data and metadata from Kafka to a bronze Delta table creates a permanent, replayable history of the data state.\n\n❌ Các đáp án sai:\n  A. The Delta log and Structured Streaming checkpoints record the full history of the Kafka producer.\n  B. Delta Lake schema evolution can retroactively calculate the correct value for newly added fields, as long as the data was in the original source.\n  C. Delta Lake automatically checks that all fields present in the source data are included in the ingestion layer.\n  D. Data can never be permanently dropped or deleted from Delta Lake, so data loss is not possible under any circumstance.",
    "question_vi": "Một kỹ sư dữ liệu mới nhận thấy một trường quan trọng đã bị bỏ sót từ ứng dụng ghi dữ liệu Kafka source vào Delta Lake. Điều này xảy ra dù trường đó có trong Kafka source. Trường đó cũng bị thiếu trong dữ liệu ghi vào bộ lưu trữ dài hạn phụ thuộc. Thời hạn lưu giữ trên Kafka là bảy ngày. Pipeline đã chạy production ba tháng. Câu nào mô tả cách tốt nhất để khôi phục?"
  },
  {
    "id": 30,
    "topic": 1,
    "question": "A nightly job ingests data into a Delta Lake table using the following code: The next step in the pipeline requires a function that returns an object that can be used to manipulate new records that have not yet been processed to the next table in the pipeline. Which code snippet completes this function definition? def new_records():",
    "options": {
      "A": "return spark.readStream.table(\"bronze\")",
      "B": "return spark.readStream.load(\"bronze\")",
      "C": "return spark.readStream.option(\"readChangeFeed\", \"true\").table(\"bronze\")",
      "D": "return spark.read.option(\"readChangeFeed\", \"true\").table(\"bronze\")",
      "E": "return spark.readStream.option(\"readChangeFeed\", \"true\").load(\"bronze\")"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ return spark.read.option(\"readChangeFeed\", \"true\").table(\"bronze\")\n\n❌ Các đáp án sai:\n  A. return spark.readStream.table(\"bronze\")\n  B. return spark.readStream.load(\"bronze\")\n  C. return spark.readStream.option(\"readChangeFeed\", \"true\").table(\"bronze\")\n  E. return spark.readStream.option(\"readChangeFeed\", \"true\").load(\"bronze\")",
    "question_vi": "Một job hàng đêm nạp dữ liệu vào bảng Delta Lake sử dụng đoạn mã sau. Bước tiếp theo trong pipeline yêu cầu một hàm trả về đối tượng có thể dùng để xử lý bản ghi mới chưa được xử lý cho bảng tiếp theo. Đoạn mã nào hoàn thành định nghĩa hàm này? def new_records():"
  },
  {
    "id": 31,
    "topic": 1,
    "question": "A junior data engineer is working to implement logic for a Lakehouse table named silver_device_recordings. The source data contains 100 unique fields in a highly nested JSON structure. The silver_device_recordings table will be used downstream to power several production monitoring dashboards and a production model. At present, 45 of the 100 fields are being used in at least one of these applications. The data engineer is trying to determine the best approach for dealing with schema declaration given the highly-nested structure of the data and the numerous fields. Which of the following accurately presents information about Delta Lake and Databricks that may impact their decision-making process?",
    "options": {
      "A": "The Tungsten encoding used by Databricks is optimized for storing string data; newly-added native support for querying JSON strings means that string types are always most efficient.",
      "B": "Because Delta Lake uses Parquet for data storage, data types can be easily evolved by just modifying file footer information in place.",
      "C": "Human labor in writing code is the largest cost associated with data engineering workloads; as such, automating table declaration logic should be a priority in all migration workloads.",
      "D": "Because Databricks will infer schema using types that allow all observed data to be processed, setting types manually provides greater assurance of data quality enforcement.",
      "E": "Schema inference and evolution on Databricks ensure that inferred types will always accurately match the data types used by downstream systems."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Because Databricks will infer schema using types that allow all observed data to be processed, setting types manually provides greater assurance of data quality enforcement.\n\n❌ Các đáp án sai:\n  A. The Tungsten encoding used by Databricks is optimized for storing string data; newly-added native support for querying JSON strings means that stri...\n  B. Because Delta Lake uses Parquet for data storage, data types can be easily evolved by just modifying file footer information in place.\n  C. Human labor in writing code is the largest cost associated with data engineering workloads; as such, automating table declaration logic should be a...\n  E. Schema inference and evolution on Databricks ensure that inferred types will always accurately match the data types used by downstream systems.",
    "question_vi": "Một kiến trúc sư dữ liệu đã cấu hình DLT pipeline với tham số mặc định. Pipeline sử dụng Auto Loader để nạp log từ vùng lưu trữ đám mây. Sau đó nó enriches các bản ghi log bằng static lookup từ database object. Bước cuối cùng sử dụng giá trị enriched để tạo aggregate. Câu nào mô tả cách DLT sẽ xử lý logic của pipeline này?"
  },
  {
    "id": 32,
    "topic": 1,
    "question": "The data engineering team maintains the following code: Assuming that this code produces logically correct results and the data in the source tables has been de-duplicated and validated, which statement describes what will occur when this code is executed?",
    "options": {
      "A": "A batch job will update the enriched_itemized_orders_by_account table, replacing only those rows that have different values than the current version of the table, using accountID as the primary key.",
      "B": "The enriched_itemized_orders_by_account table will be overwritten using the current valid version of data in each of the three tables referenced in the join logic.",
      "C": "An incremental job will leverage information in the state store to identify unjoined rows in the source tables and write these rows to the enriched_iteinized_orders_by_account table.",
      "D": "An incremental job will detect if new rows have been written to any of the source tables; if new rows are detected, all results will be recalculated and used to overwrite the enriched_itemized_orders_by_account table.",
      "E": "No computation will occur until enriched_itemized_orders_by_account is queried; upon query materialization, results will be calculated using the current valid version of data in each of the three tables referenced in the join logic."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The enriched_itemized_orders_by_account table will be overwritten using the current valid version of data in each of the three tables referenced in the join logic.\n\n❌ Các đáp án sai:\n  A. A batch job will update the enriched_itemized_orders_by_account table, replacing only those rows that have different values than the current versio...\n  C. An incremental job will leverage information in the state store to identify unjoined rows in the source tables and write these rows to the enriched...\n  D. An incremental job will detect if new rows have been written to any of the source tables; if new rows are detected, all results will be recalculate...\n  E. No computation will occur until enriched_itemized_orders_by_account is queried; upon query materialization, results will be calculated using the cu...",
    "question_vi": "Một nhân viên kỹ thuật dữ liệu mới đang onboard vào nhóm. Nhân viên mới cần xem logic production nhưng không được phép tạo cluster hoặc thay đổi bất kỳ mã production nào. Cấu hình quyền hạn nào cho phép nhân viên mới xem logic production bằng hệ thống CI/CD của nhóm?"
  },
  {
    "id": 33,
    "topic": 1,
    "question": "The data engineering team is migrating an enterprise system with thousands of tables and views into the Lakehouse. They plan to implement the target architecture using a series of bronze, silver, and gold tables. Bronze tables will almost exclusively be used by production data engineering workloads, while silver tables will be used to support both data engineering and machine learning workloads. Gold tables will largely serve business intelligence and reporting purposes. While personal identifying information (PII) exists in all tiers of data, pseudonymization and anonymization rules are in place for all data at the silver and gold levels. The organization is interested in reducing security concerns while maximizing the ability to collaborate across diverse teams. Which statement exemplifies best practices for implementing this system?",
    "options": {
      "A": "Isolating tables in separate databases based on data quality tiers allows for easy permissions management through database ACLs and allows physical separation of default storage locations for managed tables.",
      "B": "Because databases on Databricks are merely a logical construct, choices around database organization do not impact security or discoverability in the Lakehouse.",
      "C": "Storing all production tables in a single database provides a unified view of all data assets available throughout the Lakehouse, simplifying discoverability by granting all users view privileges on this database.",
      "D": "Working in the default Databricks database provides the greatest security when working with managed tables, as these will be created in the DBFS root.",
      "E": "Because all tables must live in the same storage containers used for the database they're created in, organizations should be prepared to create between dozens and thousands of databases depending on their data isolation requirements."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Isolating tables in separate databases based on data quality tiers allows for easy permissions management through database ACLs and allows physical separation of default storage locations for managed tables.\n\n❌ Các đáp án sai:\n  B. Because databases on Databricks are merely a logical construct, choices around database organization do not impact security or discoverability in t...\n  C. Storing all production tables in a single database provides a unified view of all data assets available throughout the Lakehouse, simplifying disco...\n  D. Working in the default Databricks database provides the greatest security when working with managed tables, as these will be created in the DBFS root.\n  E. Because all tables must live in the same storage containers used for the database they're created in, organizations should be prepared to create be...",
    "question_vi": "Nhóm kỹ thuật dữ liệu đang xây dựng ứng dụng sử dụng riêng các notebook Databricks. Nhóm muốn tuân theo các best practices cho kiểm soát phiên bản bao gồm theo dõi tất cả thay đổi, quản lý nhánh, và review mã. Câu nào mô tả cách nên sử dụng Databricks Repos?"
  },
  {
    "id": 34,
    "topic": 1,
    "question": "The data architect has mandated that all tables in the Lakehouse should be configured as external Delta Lake tables. Which approach will ensure that this requirement is met?",
    "options": {
      "A": "Whenever a database is being created, make sure that the LOCATION keyword is used",
      "B": "When configuring an external data warehouse for all table storage, leverage Databricks for all ELT.",
      "C": "Whenever a table is being created, make sure that the LOCATION keyword is used.",
      "D": "When tables are created, make sure that the EXTERNAL keyword is used in the CREATE TABLE statement.",
      "E": "When the workspace is being configured, make sure that external cloud object storage has been mounted."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Whenever a table is being created, make sure that the LOCATION keyword is used.\n\n❌ Các đáp án sai:\n  A. Whenever a database is being created, make sure that the LOCATION keyword is used\n  B. When configuring an external data warehouse for all table storage, leverage Databricks for all ELT.\n  D. When tables are created, make sure that the EXTERNAL keyword is used in the CREATE TABLE statement.\n  E. When the workspace is being configured, make sure that external cloud object storage has been mounted.",
    "question_vi": "Một kỹ sư dữ liệu đã thiết kế pipeline sử dụng DLT. Pipeline cần xử lý tăng dần dữ liệu từ nguồn CSV bên ngoài. Câu nào mô tả cách DLT sử dụng Auto Loader để nạp dữ liệu tăng dần?"
  },
  {
    "id": 35,
    "topic": 1,
    "question": "To reduce storage and compute costs, the data engineering team has been tasked with curating a series of aggregate tables leveraged by business intelligence dashboards, customer-facing applications, production machine learning models, and ad hoc analytical queries. The data engineering team has been made aware of new requirements from a customer-facing application, which is the only downstream workload they manage entirely. As a result, an aggregate table used by numerous teams across the organization will need to have a number of fields renamed, and additional fields will also be added. Which of the solutions addresses the situation while minimally interrupting other teams in the organization without increasing the number of tables that need to be managed?",
    "options": {
      "A": "Send all users notice that the schema for the table will be changing; include in the communication the logic necessary to revert the new table schema to match historic queries.",
      "B": "Configure a new table with all the requisite fields and new names and use this as the source for the customer-facing application; create a view that maintains the original data schema and table name by aliasing select fields from the new table.",
      "C": "Create a new table with the required schema and new fields and use Delta Lake's deep clone functionality to sync up changes committed to one table to the corresponding table.",
      "D": "Replace the current table definition with a logical view defined with the query logic currently writing the aggregate table; create a new table to power the customer-facing application.",
      "E": "Add a table comment warning all users that the table schema and field names will be changing on a given date; overwrite the table in place to the specifications of the customer-facing application."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Configure a new table with all the requisite fields and new names and use this as the source for the customer-facing application; create a view that maintains the original data schema and table name by aliasing select fields from the new table.\n\n❌ Các đáp án sai:\n  A. Send all users notice that the schema for the table will be changing; include in the communication the logic necessary to revert the new table sche...\n  C. Create a new table with the required schema and new fields and use Delta Lake's deep clone functionality to sync up changes committed to one table ...\n  D. Replace the current table definition with a logical view defined with the query logic currently writing the aggregate table; create a new table to ...\n  E. Add a table comment warning all users that the table schema and field names will be changing on a given date; overwrite the table in place to the s...",
    "question_vi": "Cú pháp CTAS nào sẽ tạo đúng bảng Delta Lake từ dữ liệu Parquet được mount tại /mnt/sales/data?"
  },
  {
    "id": 36,
    "topic": 1,
    "question": "A Delta Lake table representing metadata about content posts from users has the following schema: user_id LONG, post_text STRING, post_id STRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE This table is partitioned by the date column. A query is run with the following filter: longitude < 20 & longitude > -20 Which statement describes how data will be filtered?",
    "options": {
      "A": "Statistics in the Delta Log will be used to identify partitions that might Include files in the filtered range.",
      "B": "No file skipping will occur because the optimizer does not know the relationship between the partition column and the longitude.",
      "C": "The Delta Engine will use row-level statistics in the transaction log to identify the flies that meet the filter criteria.",
      "D": "Statistics in the Delta Log will be used to identify data files that might include records in the filtered range.",
      "E": "The Delta Engine will scan the parquet file footers to identify each row that meets the filter criteria."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Statistics in the Delta Log will be used to identify data files that might include records in the filtered range.\n\n❌ Các đáp án sai:\n  A. Statistics in the Delta Log will be used to identify partitions that might Include files in the filtered range.\n  B. No file skipping will occur because the optimizer does not know the relationship between the partition column and the longitude.\n  C. The Delta Engine will use row-level statistics in the transaction log to identify the flies that meet the filter criteria.\n  E. The Delta Engine will scan the parquet file footers to identify each row that meets the filter criteria.",
    "question_vi": "Kỹ sư dữ liệu đang review một DLT pipeline. Pipeline áp dụng expectations cho chất lượng dữ liệu. Câu nào mô tả đúng hành vi mặc định khi một bản ghi vi phạm expectation trong DLT?"
  },
  {
    "id": 37,
    "topic": 1,
    "question": "A small company based in the United States has recently contracted a consulting firm in India to implement several new data engineering pipelines to power artificial intelligence applications. All the company's data is stored in regional cloud storage in the United States. The workspace administrator at the company is uncertain about where the Databricks workspace used by the contractors should be deployed. Assuming that all data governance considerations are accounted for, which statement accurately informs this decision?",
    "options": {
      "A": "Databricks runs HDFS on cloud volume storage; as such, cloud virtual machines must be deployed in the region where the data is stored.",
      "B": "Databricks workspaces do not rely on any regional infrastructure; as such, the decision should be made based upon what is most convenient for the workspace administrator.",
      "C": "Cross-region reads and writes can incur significant costs and latency; whenever possible, compute should be deployed in the same region the data is stored.",
      "D": "Databricks leverages user workstations as the driver during interactive development; as such, users should always use a workspace deployed in a region they are physically near.",
      "E": "Databricks notebooks send all executable code from the user’s browser to virtual machines over the open internet; whenever possible, choosing a workspace region near the end users is the most secure."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Cross-region reads and writes can incur significant costs and latency; whenever possible, compute should be deployed in the same region the data is stored.\n\n❌ Các đáp án sai:\n  A. Databricks runs HDFS on cloud volume storage; as such, cloud virtual machines must be deployed in the region where the data is stored.\n  B. Databricks workspaces do not rely on any regional infrastructure; as such, the decision should be made based upon what is most convenient for the w...\n  D. Databricks leverages user workstations as the driver during interactive development; as such, users should always use a workspace deployed in a reg...\n  E. Databricks notebooks send all executable code from the user’s browser to virtual machines over the open internet; whenever possible, choosing a wor...",
    "question_vi": "Một kỹ sư dữ liệu đang thiết kế hệ thống cho pipeline dữ liệu sử dụng kiến trúc Medallion (bronze, silver, gold). Câu nào mô tả đúng mục đích của tầng silver?"
  },
  {
    "id": 38,
    "topic": 1,
    "question": "The downstream consumers of a Delta Lake table have been complaining about data quality issues impacting performance in their applications. Specifically, they have complained that invalid latitude and longitude values in the activity_details table have been breaking their ability to use other geolocation processes. A junior engineer has written the following code to add CHECK constraints to the Delta Lake table: A senior engineer has confirmed the above logic is correct and the valid ranges for latitude and longitude are provided, but the code fails when executed. Which statement explains the cause of this failure?",
    "options": {
      "A": "Because another team uses this table to support a frequently running application, two-phase locking is preventing the operation from committing.",
      "B": "The activity_details table already exists; CHECK constraints can only be added during initial table creation.",
      "C": "The activity_details table already contains records that violate the constraints; all existing data must pass CHECK constraints in order to add them to an existing table.",
      "D": "The activity_details table already contains records; CHECK constraints can only be added prior to inserting values into a table.",
      "E": "The current table schema does not contain the field valid_coordinates; schema evolution will need to be enabled before altering the table to add a constraint."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The activity_details table already exists; CHECK constraints can only be added during initial table creation.\n\n❌ Các đáp án sai:\n  A. Because another team uses this table to support a frequently running application, two-phase locking is preventing the operation from committing.\n  C. The activity_details table already contains records that violate the constraints; all existing data must pass CHECK constraints in order to add the...\n  D. The activity_details table already contains records; CHECK constraints can only be added prior to inserting values into a table.\n  E. The current table schema does not contain the field valid_coordinates; schema evolution will need to be enabled before altering the table to add a ...",
    "question_vi": "Một DLT pipeline đang xử lý dữ liệu từ nguồn Kafka streaming. Đoạn mã DLT tạo streaming table. Câu nào mô tả đúng cách DLT quản lý streaming tables?"
  },
  {
    "id": 39,
    "topic": 1,
    "question": "Which of the following is true of Delta Lake and the Lakehouse?",
    "options": {
      "A": "Because Parquet compresses data row by row. strings will only be compressed when a character is repeated multiple times.",
      "B": "Delta Lake automatically collects statistics on the first 32 columns of each table which are leveraged in data skipping based on query filters.",
      "C": "Views in the Lakehouse maintain a valid cache of the most recent versions of source tables at all times.",
      "D": "Primary and foreign key constraints can be leveraged to ensure duplicate values are never entered into a dimension table.",
      "E": "Z-order can only be applied to numeric values stored in Delta Lake tables."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Delta Lake automatically collects statistics on the first 32 columns of each table which are leveraged in data skipping based on query filters.\n\n❌ Các đáp án sai:\n  A. Because Parquet compresses data row by row. strings will only be compressed when a character is repeated multiple times.\n  C. Views in the Lakehouse maintain a valid cache of the most recent versions of source tables at all times.\n  D. Primary and foreign key constraints can be leveraged to ensure duplicate values are never entered into a dimension table.\n  E. Z-order can only be applied to numeric values stored in Delta Lake tables.",
    "question_vi": "Một kỹ sư dữ liệu đang cấu hình một job production mới. Nhóm kinh doanh báo cáo dữ liệu phải được cập nhật mỗi 4 giờ. Cấu hình nào tối ưu nhất cho chi phí và đáp ứng yêu cầu?"
  },
  {
    "id": 40,
    "topic": 1,
    "question": "The view updates represents an incremental batch of all newly ingested data to be inserted or updated in the customers table. The following logic is used to process these records. Which statement describes this implementation?",
    "options": {
      "A": "The customers table is implemented as a Type 3 table; old values are maintained as a new column alongside the current value.",
      "B": "The customers table is implemented as a Type 2 table; old values are maintained but marked as no longer current and new values are inserted.",
      "C": "The customers table is implemented as a Type 0 table; all writes are append only with no changes to existing values.",
      "D": "The customers table is implemented as a Type 1 table; old values are overwritten by new values and no history is maintained.",
      "E": "The customers table is implemented as a Type 2 table; old values are overwritten and new customers are appended."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The customers table is implemented as a Type 2 table; old values are maintained but marked as no longer current and new values are inserted.\n\n❌ Các đáp án sai:\n  A. The customers table is implemented as a Type 3 table; old values are maintained as a new column alongside the current value.\n  C. The customers table is implemented as a Type 0 table; all writes are append only with no changes to existing values.\n  D. The customers table is implemented as a Type 1 table; old values are overwritten by new values and no history is maintained.\n  E. The customers table is implemented as a Type 2 table; old values are overwritten and new customers are appended.",
    "question_vi": "View updates đại diện cho một incremental batch chứa tất cả dữ liệu mới được nạp vào cần insert hoặc update trong bảng customers. Logic sau được sử dụng để xử lý các bản ghi này. Câu nào mô tả cách triển khai này?"
  },
  {
    "id": 41,
    "topic": 1,
    "question": "The DevOps team has configured a production workload as a collection of notebooks scheduled to run daily using the Jobs UI. A new data engineering hire is onboarding to the team and has requested access to one of these notebooks to review the production logic. What are the maximum notebook permissions that can be granted to the user without allowing accidental changes to production code or data?",
    "options": {
      "A": "Can Manage",
      "B": "Can Edit",
      "C": "No permissions",
      "D": "Can Read",
      "E": "Can Run"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Can Read\n\n❌ Các đáp án sai:\n  A. Can Manage\n  B. Can Edit\n  C. No permissions\n  E. Can Run",
    "question_vi": "Nhóm DevOps đã cấu hình workload production dưới dạng tập hợp notebook được lập lịch chạy hàng ngày qua Jobs UI. Một nhân viên kỹ thuật dữ liệu mới đang onboard và yêu cầu truy cập một trong các notebook để xem logic production. Quyền notebook tối đa nào có thể được cấp cho người dùng mà không cho phép thay đổi mã production hoặc kết quả?"
  },
  {
    "id": 42,
    "topic": 1,
    "question": "A table named user_ltv is being used to create a view that will be used by data analysts on various teams. Users in the workspace are configured into groups, which are used for setting up data access using ACLs. The user_ltv table has the following schema: email STRING, age INT, ltv INT The following view definition is executed: An analyst who is not a member of the marketing group executes the following query: SELECT * FROM email_ltv - Which statement describes the results returned by this query?",
    "options": {
      "A": "Three columns will be returned, but one column will be named \"REDACTED\" and contain only null values.",
      "B": "Only the email and ltv columns will be returned; the email column will contain all null values.",
      "C": "The email and ltv columns will be returned with the values in user_ltv.",
      "D": "The email.age, and ltv columns will be returned with the values in user_ltv.",
      "E": "Only the email and ltv columns will be returned; the email column will contain the string \"REDACTED\" in each row."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ Only the email and ltv columns will be returned; the email column will contain the string \"REDACTED\" in each row.\n\n❌ Các đáp án sai:\n  A. Three columns will be returned, but one column will be named \"REDACTED\" and contain only null values.\n  B. Only the email and ltv columns will be returned; the email column will contain all null values.\n  C. The email and ltv columns will be returned with the values in user_ltv.\n  D. The email.age, and ltv columns will be returned with the values in user_ltv.",
    "question_vi": "Bảng user_ltv đang được sử dụng để tạo view cho nhà phân tích dữ liệu nhiều nhóm. Người dùng trong workspace được cấu hình theo nhóm, được dùng để thiết lập quyền truy cập dữ liệu bằng ACL. Bảng user_ltv có schema: email STRING, age INT, ltv INT. View được tạo như sau. Một nhà phân tích không thuộc nhóm managers truy vấn view này. Kết quả là gì?"
  },
  {
    "id": 43,
    "topic": 1,
    "question": "The data governance team has instituted a requirement that all tables containing Personal Identifiable Information (PH) must be clearly annotated. This includes adding column comments, table comments, and setting the custom table property \"contains_pii\" = true. The following SQL DDL statement is executed to create a new table: Which command allows manual confirmation that these three requirements have been met?",
    "options": {
      "A": "DESCRIBE EXTENDED dev.pii_test",
      "B": "DESCRIBE DETAIL dev.pii_test",
      "C": "SHOW TBLPROPERTIES dev.pii_test",
      "D": "DESCRIBE HISTORY dev.pii_test",
      "E": "SHOW TABLES dev"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ DESCRIBE EXTENDED dev.pii_test\n\n❌ Các đáp án sai:\n  B. DESCRIBE DETAIL dev.pii_test\n  C. SHOW TBLPROPERTIES dev.pii_test\n  D. DESCRIBE HISTORY dev.pii_test\n  E. SHOW TABLES dev",
    "question_vi": "Nhóm quản trị dữ liệu đã đề ra yêu cầu rằng tất cả bảng chứa Thông tin Nhận dạng Cá nhân (PII) phải được ghi chú rõ ràng. Điều này bao gồm thêm chú thích cột, chú thích bảng, và thiết lập thuộc tính bảng tùy chỉnh \"contains_pii\" = true. Câu lệnh SQL DDL sau được thực thi để tạo bảng mới. Lệnh nào cho phép xác nhận thủ công rằng ba yêu cầu trên đã được đáp ứng?"
  },
  {
    "id": 44,
    "topic": 1,
    "question": "The data governance team is reviewing code used for deleting records for compliance with GDPR. They note the following logic is used to delete records from the Delta Lake table named users. Assuming that user_id is a unique identifying key and that delete_requests contains all users that have requested deletion, which statement describes whether successfully executing the above logic guarantees that the records to be deleted are no longer accessible and why?",
    "options": {
      "A": "Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records.",
      "B": "No; the Delta cache may return records from previous versions of the table until the cluster is restarted.",
      "C": "Yes; the Delta cache immediately updates to reflect the latest data files recorded to disk.",
      "D": "No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command.",
      "E": "No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data files."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data files.\n\n❌ Các đáp án sai:\n  A. Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records.\n  B. No; the Delta cache may return records from previous versions of the table until the cluster is restarted.\n  C. Yes; the Delta cache immediately updates to reflect the latest data files recorded to disk.\n  D. No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command.",
    "question_vi": "Nhóm quản trị dữ liệu đang review mã dùng để xóa bản ghi nhằm tuân thủ GDPR. Họ nhận thấy logic sau được sử dụng để xóa bản ghi từ bảng Delta Lake tên users. Giả sử user_id là khóa duy nhất và delete_requests chứa tất cả người dùng đã yêu cầu xóa. Câu nào mô tả liệu thực thi thành công logic trên có đảm bảo bản ghi cần xóa không còn truy cập được và tại sao?"
  },
  {
    "id": 45,
    "topic": 1,
    "question": "An external object storage container has been mounted to the location /mnt/finance_eda_bucket. The following logic was executed to create a database for the finance team: After the database was successfully created and permissions configured, a member of the finance team runs the following code: If all users on the finance team are members of the finance group, which statement describes how the tx_sales table will be created?",
    "options": {
      "A": "A logical table will persist the query plan to the Hive Metastore in the Databricks control plane.",
      "B": "An external table will be created in the storage container mounted to /mnt/finance_eda_bucket.",
      "C": "A logical table will persist the physical plan to the Hive Metastore in the Databricks control plane.",
      "D": "An managed table will be created in the storage container mounted to /mnt/finance_eda_bucket.",
      "E": "A managed table will be created in the DBFS root storage container."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ An external table will be created in the storage container mounted to /mnt/finance_eda_bucket.\n\n❌ Các đáp án sai:\n  A. A logical table will persist the query plan to the Hive Metastore in the Databricks control plane.\n  C. A logical table will persist the physical plan to the Hive Metastore in the Databricks control plane.\n  D. An managed table will be created in the storage container mounted to /mnt/finance_eda_bucket.\n  E. A managed table will be created in the DBFS root storage container.",
    "question_vi": "Một vùng lưu trữ đối tượng bên ngoài đã được mount tại /mnt/finance_eda_bucket. Logic sau được thực thi để tạo database cho nhóm tài chính. Sau khi database được tạo và quyền được cấu hình, một thành viên nhóm tài chính chạy đoạn mã sau. Nếu tất cả người dùng nhóm tài chính đều thuộc nhóm kỹ sư, kết quả sẽ như thế nào?"
  },
  {
    "id": 46,
    "topic": 1,
    "question": "Although the Databricks Utilities Secrets module provides tools to store sensitive credentials and avoid accidentally displaying them in plain text users should still be careful with which credentials are stored here and which users have access to using these secrets. Which statement describes a limitation of Databricks Secrets?",
    "options": {
      "A": "Because the SHA256 hash is used to obfuscate stored secrets, reversing this hash will display the value in plain text.",
      "B": "Account administrators can see all secrets in plain text by logging on to the Databricks Accounts console.",
      "C": "Secrets are stored in an administrators-only table within the Hive Metastore; database administrators have permission to query this table by default.",
      "D": "Iterating through a stored secret and printing each character will display secret contents in plain text.",
      "E": "The Databricks REST API can be used to list secrets in plain text if the personal access token has proper credentials."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Iterating through a stored secret and printing each character will display secret contents in plain text.\n\n❌ Các đáp án sai:\n  A. Because the SHA256 hash is used to obfuscate stored secrets, reversing this hash will display the value in plain text.\n  B. Account administrators can see all secrets in plain text by logging on to the Databricks Accounts console.\n  C. Secrets are stored in an administrators-only table within the Hive Metastore; database administrators have permission to query this table by default.\n  E. The Databricks REST API can be used to list secrets in plain text if the personal access token has proper credentials.",
    "question_vi": "Mặc dù module Databricks Utilities Secrets cung cấp công cụ lưu trữ thông tin xác thực nhạy cảm và tránh hiển thị dạng văn bản thuần, người dùng vẫn cần cẩn thận với thông tin nào được lưu và ai có quyền sử dụng secrets này. Câu nào mô tả giới hạn của Databricks Secrets?"
  },
  {
    "id": 47,
    "topic": 1,
    "question": "What statement is true regarding the retention of job run history?",
    "options": {
      "A": "It is retained until you export or delete job run logs",
      "B": "It is retained for 30 days, during which time you can deliver job run logs to DBFS or S3",
      "C": "It is retained for 60 days, during which you can export notebook run results to HTML",
      "D": "It is retained for 60 days, after which logs are archived",
      "E": "It is retained for 90 days or until the run-id is re-used through custom run configuration"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ It is retained for 30 days, during which time you can deliver job run logs to DBFS or S3\n\n❌ Các đáp án sai:\n  A. It is retained until you export or delete job run logs\n  C. It is retained for 60 days, during which you can export notebook run results to HTML\n  D. It is retained for 60 days, after which logs are archived\n  E. It is retained for 90 days or until the run-id is re-used through custom run configuration",
    "question_vi": "Câu nào đúng về việc lưu giữ lịch sử chạy job?"
  },
  {
    "id": 48,
    "topic": 1,
    "question": "A data engineer, User A, has promoted a new pipeline to production by using the REST API to programmatically create several jobs. A DevOps engineer, User B, has configured an external orchestration tool to trigger job runs through the REST API. Both users authorized the REST API calls using their personal access tokens. Which statement describes the contents of the workspace audit logs concerning these events?",
    "options": {
      "A": "Because the REST API was used for job creation and triggering runs, a Service Principal will be automatically used to identify these events.",
      "B": "Because User B last configured the jobs, their identity will be associated with both the job creation events and the job run events.",
      "C": "Because these events are managed separately, User A will have their identity associated with the job creation events and User B will have their identity associated with the job run events.",
      "D": "Because the REST API was used for job creation and triggering runs, user identity will not be captured in the audit logs.",
      "E": "Because User A created the jobs, their identity will be associated with both the job creation events and the job run events."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Because these events are managed separately, User A will have their identity associated with the job creation events and User B will have their identity associated with the job run events.\n\n❌ Các đáp án sai:\n  A. Because the REST API was used for job creation and triggering runs, a Service Principal will be automatically used to identify these events.\n  B. Because User B last configured the jobs, their identity will be associated with both the job creation events and the job run events.\n  D. Because the REST API was used for job creation and triggering runs, user identity will not be captured in the audit logs.\n  E. Because User A created the jobs, their identity will be associated with both the job creation events and the job run events.",
    "question_vi": "Một kỹ sư dữ liệu, User A, đã đưa pipeline mới lên production bằng REST API để tạo một số jobs. Một kỹ sư DevOps, User B, đã cấu hình công cụ điều phối bên ngoài để kích hoạt job runs qua REST API. Cả hai người dùng xác thực REST API bằng personal access token của họ. Câu nào mô tả hạn chế của cách tiếp cận này?"
  },
  {
    "id": 49,
    "topic": 1,
    "question": "A user new to Databricks is trying to troubleshoot long execution times for some pipeline logic they are working on. Presently, the user is executing code cell-by-cell, using display() calls to confirm code is producing the logically correct results as new transformations are added to an operation. To get a measure of average time to execute, the user is running each cell multiple times interactively. Which of the following adjustments will get a more accurate measure of how code is likely to perform in production?",
    "options": {
      "A": "Scala is the only language that can be accurately tested using interactive notebooks; because the best performance is achieved by using Scala code compiled to JARs, all PySpark and Spark SQL logic should be refactored.",
      "B": "The only way to meaningfully troubleshoot code execution times in development notebooks Is to use production-sized data and production- sized clusters with Run All execution.",
      "C": "Production code development should only be done using an IDE; executing code against a local build of open source Spark and Delta Lake will provide the most accurate benchmarks for how code will perform in production.",
      "D": "Calling display() forces a job to trigger, while many transformations will only add to the logical query plan; because of caching, repeated execution of the same logic does not provide meaningful results.",
      "E": "The Jobs UI should be leveraged to occasionally run the notebook as a job and track execution time during incremental code development because Photon can only be enabled on clusters launched for scheduled jobs."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Calling display() forces a job to trigger, while many transformations will only add to the logical query plan; because of caching, repeated execution of the same logic does not provide meaningful results.\n\n❌ Các đáp án sai:\n  A. Scala is the only language that can be accurately tested using interactive notebooks; because the best performance is achieved by using Scala code ...\n  B. The only way to meaningfully troubleshoot code execution times in development notebooks Is to use production-sized data and production- sized clust...\n  C. Production code development should only be done using an IDE; executing code against a local build of open source Spark and Delta Lake will provide...\n  E. The Jobs UI should be leveraged to occasionally run the notebook as a job and track execution time during incremental code development because Phot...",
    "question_vi": "Một người dùng mới với Databricks đang cố gắng khắc phục thời gian thực thi lâu cho logic pipeline. Hiện tại, người dùng chạy mã từng ô, sử dụng display() để xác nhận kết quả logic đúng khi thêm các biến đổi mới. Để đo thời gian thực thi trung bình, người dùng chạy mỗi ô nhiều lần tương tác. Thay đổi nào cho phép đo chính xác hơn cách mã sẽ hoạt động trong production?"
  },
  {
    "id": 50,
    "topic": 1,
    "question": "A production cluster has 3 executor nodes and uses the same virtual machine type for the driver and executor. When evaluating the Ganglia Metrics for this cluster, which indicator would signal a bottleneck caused by code executing on the driver?",
    "options": {
      "A": "The five Minute Load Average remains consistent/flat",
      "B": "Bytes Received never exceeds 80 million bytes per second",
      "C": "Total Disk Space remains constant",
      "D": "Network I/O never spikes",
      "E": "Overall cluster CPU utilization is around 25%"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Network I/O never spikes\n\n❌ Các đáp án sai:\n  A. The five Minute Load Average remains consistent/flat\n  B. Bytes Received never exceeds 80 million bytes per second\n  C. Total Disk Space remains constant\n  E. Overall cluster CPU utilization is around 25%",
    "question_vi": "Một cluster production có 3 executor node và sử dụng cùng loại máy ảo cho driver và executor. Khi đánh giá Ganglia Metrics cho cluster này, chỉ số nào báo hiệu bottleneck do mã thực thi trên driver?"
  },
  {
    "id": 51,
    "topic": 1,
    "question": "Where in the Spark UI can one diagnose a performance problem induced by not leveraging predicate push-down?",
    "options": {
      "A": "In the Executor’s log file, by grepping for \"predicate push-down\"",
      "B": "In the Stage’s Detail screen, in the Completed Stages table, by noting the size of data read from the Input column",
      "C": "In the Storage Detail screen, by noting which RDDs are not stored on disk",
      "D": "In the Delta Lake transaction log. by noting the column statistics",
      "E": "In the Query Detail screen, by interpreting the Physical Plan"
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ In the Query Detail screen, by interpreting the Physical Plan\n\n❌ Các đáp án sai:\n  A. In the Executor’s log file, by grepping for \"predicate push-down\"\n  B. In the Stage’s Detail screen, in the Completed Stages table, by noting the size of data read from the Input column\n  C. In the Storage Detail screen, by noting which RDDs are not stored on disk\n  D. In the Delta Lake transaction log. by noting the column statistics",
    "question_vi": "Ở đâu trong Spark UI có thể chẩn đoán vấn đề hiệu suất do không tận dụng predicate push-down?"
  },
  {
    "id": 52,
    "topic": 1,
    "question": "Review the following error traceback: Which statement describes the error being raised?",
    "options": {
      "A": "The code executed was PySpark but was executed in a Scala notebook.",
      "B": "There is no column in the table named heartrateheartrateheartrate",
      "C": "There is a type error because a column object cannot be multiplied.",
      "D": "There is a type error because a DataFrame object cannot be multiplied.",
      "E": "There is a syntax error because the heartrate column is not correctly identified as a column."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ There is a syntax error because the heartrate column is not correctly identified as a column.\n\n❌ Các đáp án sai:\n  A. The code executed was PySpark but was executed in a Scala notebook.\n  B. There is no column in the table named heartrateheartrateheartrate\n  C. There is a type error because a column object cannot be multiplied.\n  D. There is a type error because a DataFrame object cannot be multiplied.",
    "question_vi": "Xem xét traceback lỗi sau. Câu nào mô tả lỗi đang được raise?"
  },
  {
    "id": 53,
    "topic": 1,
    "question": "Which distribution does Databricks support for installing custom Python code packages?",
    "options": {
      "A": "sbt",
      "B": "CRAN",
      "C": "npm",
      "D": "Wheels",
      "E": "jars"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Wheels\n\n❌ Các đáp án sai:\n  A. sbt\n  B. CRAN\n  C. npm\n  E. jars",
    "question_vi": "Databricks hỗ trợ bản phân phối nào để cài đặt các package Python code tùy chỉnh?"
  },
  {
    "id": 54,
    "topic": 1,
    "question": "Which Python variable contains a list of directories to be searched when trying to locate required modules?",
    "options": {
      "A": "importlib.resource_path",
      "B": "sys.path",
      "C": "os.path",
      "D": "pypi.path",
      "E": "pylib.source"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ sys.path\n\n❌ Các đáp án sai:\n  A. importlib.resource_path\n  C. os.path\n  D. pypi.path\n  E. pylib.source",
    "question_vi": "Biến Python nào chứa danh sách các thư mục được tìm kiếm khi cố gắng định vị các module cần thiết?"
  },
  {
    "id": 55,
    "topic": 1,
    "question": "Incorporating unit tests into a PySpark application requires upfront attention to the design of your jobs, or a potentially significant refactoring of existing code. Which statement describes a main benefit that offset this additional effort?",
    "options": {
      "A": "Improves the quality of your data",
      "B": "Validates a complete use case of your application",
      "C": "Troubleshooting is easier since all steps are isolated and tested individually",
      "D": "Yields faster deployment and execution times",
      "E": "Ensures that all steps interact correctly to achieve the desired end result"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Troubleshooting is easier since all steps are isolated and tested individually\n\n❌ Các đáp án sai:\n  A. Improves the quality of your data\n  B. Validates a complete use case of your application\n  D. Yields faster deployment and execution times\n  E. Ensures that all steps interact correctly to achieve the desired end result",
    "question_vi": "Tích hợp unit tests vào ứng dụng PySpark đòi hỏi sự chú ý ngay từ đầu đến thiết kế jobs, hoặc refactoring đáng kể mã hiện có. Câu nào mô tả lợi ích chính bù đắp cho nỗ lực bổ sung này?"
  },
  {
    "id": 56,
    "topic": 1,
    "question": "Which statement describes integration testing?",
    "options": {
      "A": "Validates interactions between subsystems of your application",
      "B": "Requires an automated testing framework",
      "C": "Requires manual intervention",
      "D": "Validates an application use case",
      "E": "Validates behavior of individual elements of your application"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Validates interactions between subsystems of your application\n\n❌ Các đáp án sai:\n  B. Requires an automated testing framework\n  C. Requires manual intervention\n  D. Validates an application use case\n  E. Validates behavior of individual elements of your application",
    "question_vi": "Câu nào mô tả integration testing?"
  },
  {
    "id": 57,
    "topic": 1,
    "question": "Which REST API call can be used to review the notebooks configured to run as tasks in a multi-task job?",
    "options": {
      "A": "/jobs/runs/list",
      "B": "/jobs/runs/get-output",
      "C": "/jobs/runs/get",
      "D": "/jobs/get",
      "E": "/jobs/list"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ /jobs/get\n\n❌ Các đáp án sai:\n  A. /jobs/runs/list\n  B. /jobs/runs/get-output\n  C. /jobs/runs/get\n  E. /jobs/list",
    "question_vi": "Lệnh REST API nào có thể dùng để xem các notebook được cấu hình chạy dưới dạng tasks trong multi-task job?"
  },
  {
    "id": 58,
    "topic": 1,
    "question": "A Databricks job has been configured with 3 tasks, each of which is a Databricks notebook. Task A does not depend on other tasks. Tasks B and C run in parallel, with each having a serial dependency on task",
    "options": {
      "A": "All logic expressed in the notebook associated with tasks A and B will have been successfully completed; some operations in task C may have completed successfully.",
      "B": "All logic expressed in the notebook associated with tasks A and B will have been successfully completed; any changes made in task C will be rolled back due to task failure.",
      "C": "All logic expressed in the notebook associated with task A will have been successfully completed; tasks B and C will not commit any changes because of stage failure.",
      "D": "Because all tasks are managed as a dependency graph, no changes will be committed to the Lakehouse until ail tasks have successfully been completed.",
      "E": "Unless all tasks complete successfully, no changes will be committed to the Lakehouse; because task C failed, all commits will be rolled back automatically."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ All logic expressed in the notebook associated with tasks A and B will have been successfully completed; some operations in task C may have completed successfully.\n\n❌ Các đáp án sai:\n  B. All logic expressed in the notebook associated with tasks A and B will have been successfully completed; any changes made in task C will be rolled ...\n  C. All logic expressed in the notebook associated with task A will have been successfully completed; tasks B and C will not commit any changes because...\n  D. Because all tasks are managed as a dependency graph, no changes will be committed to the Lakehouse until ail tasks have successfully been completed.\n  E. Unless all tasks complete successfully, no changes will be committed to the Lakehouse; because task C failed, all commits will be rolled back autom...",
    "question_vi": "Một Databricks job đã được cấu hình với 3 tasks, mỗi task là một Databricks notebook. Task A không phụ thuộc vào tasks khác. Tasks B và C chạy song song, mỗi task có phụ thuộc tuần tự vào Task A. Câu nào mô tả kết quả thực thi job này?"
  },
  {
    "id": 59,
    "topic": 1,
    "question": "A Delta Lake table was created with the below query: Realizing that the original query had a typographical error, the below code was executed: ALTER TABLE prod.sales_by_stor RENAME TO prod.sales_by_store Which result will occur after running the second command?",
    "options": {
      "A": "The table reference in the metastore is updated and no data is changed.",
      "B": "The table name change is recorded in the Delta transaction log.",
      "C": "All related files and metadata are dropped and recreated in a single ACID transaction.",
      "D": "The table reference in the metastore is updated and all data files are moved.",
      "E": "A new Delta transaction log Is created for the renamed table."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ The table reference in the metastore is updated and no data is changed.\n\n❌ Các đáp án sai:\n  B. The table name change is recorded in the Delta transaction log.\n  C. All related files and metadata are dropped and recreated in a single ACID transaction.\n  D. The table reference in the metastore is updated and all data files are moved.\n  E. A new Delta transaction log Is created for the renamed table.",
    "question_vi": "Một bảng Delta Lake được tạo bằng truy vấn sau. Nhận ra truy vấn gốc có lỗi đánh máy, đoạn mã sau được thực thi: ALTER TABLE prod.sales_by_stor RENAME TO prod.sales_by_store. Kết quả nào sẽ xảy ra sau khi chạy lệnh thứ hai?"
  },
  {
    "id": 60,
    "topic": 1,
    "question": "The data engineering team maintains a table of aggregate statistics through batch nightly updates. This includes total sales for the previous day alongside totals and averages for a variety of time periods including the 7 previous days, year-to-date, and quarter-to-date. This table is named store_saies_summary and the schema is as follows: The table daily_store_sales contains all the information needed to update store_sales_summary. The schema for this table is: store_id INT, sales_date DATE, total_sales FLOAT If daily_store_sales is implemented as a Type 1 table and the total_sales column might be adjusted after manual data auditing, which approach is the safest to generate accurate reports in the store_sales_summary table?",
    "options": {
      "A": "Implement the appropriate aggregate logic as a batch read against the daily_store_sales table and overwrite the store_sales_summary table with each Update.",
      "B": "Implement the appropriate aggregate logic as a batch read against the daily_store_sales table and append new rows nightly to the store_sales_summary table.",
      "C": "Implement the appropriate aggregate logic as a batch read against the daily_store_sales table and use upsert logic to update results in the store_sales_summary table.",
      "D": "Implement the appropriate aggregate logic as a Structured Streaming read against the daily_store_sales table and use upsert logic to update results in the store_sales_summary table.",
      "E": "Use Structured Streaming to subscribe to the change data feed for daily_store_sales and apply changes to the aggregates in the store_sales_summary table with each update."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Implement the appropriate aggregate logic as a batch read against the daily_store_sales table and use upsert logic to update results in the store_sales_summary table.\n\n❌ Các đáp án sai:\n  A. Implement the appropriate aggregate logic as a batch read against the daily_store_sales table and overwrite the store_sales_summary table with each...\n  B. Implement the appropriate aggregate logic as a batch read against the daily_store_sales table and append new rows nightly to the store_sales_summar...\n  D. Implement the appropriate aggregate logic as a Structured Streaming read against the daily_store_sales table and use upsert logic to update results...\n  E. Use Structured Streaming to subscribe to the change data feed for daily_store_sales and apply changes to the aggregates in the store_sales_summary ...",
    "question_vi": "Nhóm kỹ thuật dữ liệu duy trì bảng thống kê tổng hợp thông qua cập nhật batch hàng đêm. Bảng bao gồm tổng doanh thu ngày hôm trước cùng tổng và trung bình cho nhiều khoảng thời gian bao gồm 7 ngày trước, từ đầu năm, và từ đầu quý. Bảng tên store_sales_summary. Pipeline hiện tại quá phức tạp. Đáp án nào mô tả cách đơn giản hóa pipeline này?"
  },
  {
    "id": 61,
    "topic": 1,
    "question": "A member of the data engineering team has submitted a short notebook that they wish to schedule as part of a larger data pipeline. Assume that the commands provided below produce the logically correct results when run as presented. Which command should be removed from the notebook before scheduling it as a job?",
    "options": {
      "A": "Cmd 2",
      "B": "Cmd 3",
      "C": "Cmd 4",
      "D": "Cmd 5",
      "E": "Cmd 6"
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ Cmd 6\n\n❌ Các đáp án sai:\n  A. Cmd 2\n  B. Cmd 3\n  C. Cmd 4\n  D. Cmd 5",
    "question_vi": "Một thành viên nhóm kỹ thuật dữ liệu đã gửi một notebook ngắn mà họ muốn lập lịch như một phần của pipeline dữ liệu lớn. Giả sử các lệnh dưới đây cho kết quả logic đúng khi chạy. Lệnh nào nên được loại bỏ khỏi notebook trước khi lập lịch?"
  },
  {
    "id": 62,
    "topic": 1,
    "question": "The business reporting team requires that data for their dashboards be updated every hour. The total processing time for the pipeline that extracts transforms, and loads the data for their pipeline runs in 10 minutes. Assuming normal operating conditions, which configuration will meet their service-level agreement requirements with the lowest cost?",
    "options": {
      "A": "Manually trigger a job anytime the business reporting team refreshes their dashboards",
      "B": "Schedule a job to execute the pipeline once an hour on a new job cluster",
      "C": "Schedule a Structured Streaming job with a trigger interval of 60 minutes",
      "D": "Schedule a job to execute the pipeline once an hour on a dedicated interactive cluster",
      "E": "Configure a job that executes every time new data lands in a given directory"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Schedule a Structured Streaming job with a trigger interval of 60 minutes\n\n❌ Các đáp án sai:\n  A. Manually trigger a job anytime the business reporting team refreshes their dashboards\n  B. Schedule a job to execute the pipeline once an hour on a new job cluster\n  D. Schedule a job to execute the pipeline once an hour on a dedicated interactive cluster\n  E. Configure a job that executes every time new data lands in a given directory",
    "question_vi": "Nhóm báo cáo kinh doanh yêu cầu dữ liệu cho dashboard phải được cập nhật mỗi giờ. Tổng thời gian xử lý pipeline chạy trong 10 phút. Giả sử điều kiện hoạt động bình thường, cấu hình nào đáp ứng yêu cầu SLA với chi phí thấp nhất?"
  },
  {
    "id": 63,
    "topic": 1,
    "question": "A Databricks SQL dashboard has been configured to monitor the total number of records present in a collection of Delta Lake tables using the following query pattern: SELECT COUNT (*) FROM table - Which of the following describes how results are generated each time the dashboard is updated?",
    "options": {
      "A": "The total count of rows is calculated by scanning all data files",
      "B": "The total count of rows will be returned from cached results unless REFRESH is run",
      "C": "The total count of records is calculated from the Delta transaction logs",
      "D": "The total count of records is calculated from the parquet file metadata",
      "E": "The total count of records is calculated from the Hive metastore"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ The total count of rows is calculated by scanning all data files\n\n❌ Các đáp án sai:\n  B. The total count of rows will be returned from cached results unless REFRESH is run\n  C. The total count of records is calculated from the Delta transaction logs\n  D. The total count of records is calculated from the parquet file metadata\n  E. The total count of records is calculated from the Hive metastore",
    "question_vi": "Một dashboard Databricks SQL đã được cấu hình để theo dõi tổng số bản ghi trong một tập hợp các bảng Delta Lake sử dụng mẫu truy vấn: SELECT COUNT(*) FROM table. Đáp án nào mô tả cách kết quả được tạo mỗi khi dashboard được cập nhật?"
  },
  {
    "id": 64,
    "topic": 1,
    "question": "A Delta Lake table was created with the below query: Consider the following query: DROP TABLE prod.sales_by_store - If this statement is executed by a workspace admin, which result will occur?",
    "options": {
      "A": "Nothing will occur until a COMMIT command is executed.",
      "B": "The table will be removed from the catalog but the data will remain in storage.",
      "C": "The table will be removed from the catalog and the data will be deleted.",
      "D": "An error will occur because Delta Lake prevents the deletion of production data.",
      "E": "Data will be marked as deleted but still recoverable with Time Travel."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ An error will occur because Delta Lake prevents the deletion of production data.\n\n❌ Các đáp án sai:\n  A. Nothing will occur until a COMMIT command is executed.\n  B. The table will be removed from the catalog but the data will remain in storage.\n  C. The table will be removed from the catalog and the data will be deleted.\n  E. Data will be marked as deleted but still recoverable with Time Travel.",
    "question_vi": "Một bảng Delta Lake được tạo bằng truy vấn sau. Xét truy vấn: DROP TABLE prod.sales_by_store. Nếu câu lệnh này được thực thi bởi workspace admin, kết quả nào sẽ xảy ra?"
  },
  {
    "id": 65,
    "topic": 1,
    "question": "Two of the most common data locations on Databricks are the DBFS root storage and external object storage mounted with dbutils.fs.mount(). Which of the following statements is correct?",
    "options": {
      "A": "DBFS is a file system protocol that allows users to interact with files stored in object storage using syntax and guarantees similar to Unix file systems.",
      "B": "By default, both the DBFS root and mounted data sources are only accessible to workspace administrators.",
      "C": "The DBFS root is the most secure location to store data, because mounted storage volumes must have full public read and write permissions.",
      "D": "Neither the DBFS root nor mounted storage can be accessed when using %sh in a Databricks notebook.",
      "E": "The DBFS root stores files in ephemeral block volumes attached to the driver, while mounted directories will always persist saved data to external storage between sessions."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ The DBFS root stores files in ephemeral block volumes attached to the driver, while mounted directories will always persist saved data to external storage between sessions.\n\n❌ Các đáp án sai:\n  A. DBFS is a file system protocol that allows users to interact with files stored in object storage using syntax and guarantees similar to Unix file s...\n  B. By default, both the DBFS root and mounted data sources are only accessible to workspace administrators.\n  C. The DBFS root is the most secure location to store data, because mounted storage volumes must have full public read and write permissions.\n  D. Neither the DBFS root nor mounted storage can be accessed when using %sh in a Databricks notebook.",
    "question_vi": "Hai vị trí dữ liệu phổ biến nhất trên Databricks là DBFS root storage và external object storage mount bằng dbutils.fs.mount(). Câu nào sau đây đúng?"
  },
  {
    "id": 66,
    "topic": 1,
    "question": "The following code has been migrated to a Databricks notebook from a legacy workload: The code executes successfully and provides the logically correct results, however, it takes over 20 minutes to extract and load around 1 GB of data. Which statement is a possible explanation for this behavior?",
    "options": {
      "A": "%sh triggers a cluster restart to collect and install Git. Most of the latency is related to cluster startup time.",
      "B": "Instead of cloning, the code should use %sh pip install so that the Python code can get executed in parallel across all nodes in a cluster.",
      "C": "%sh does not distribute file moving operations; the final line of code should be updated to use %fs instead.",
      "D": "Python will always execute slower than Scala on Databricks. The run.py script should be refactored to Scala.",
      "E": "%sh executes shell code on the driver node. The code does not take advantage of the worker nodes or Databricks optimized Spark."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ %sh does not distribute file moving operations; the final line of code should be updated to use %fs instead.\n\n❌ Các đáp án sai:\n  A. %sh triggers a cluster restart to collect and install Git. Most of the latency is related to cluster startup time.\n  B. Instead of cloning, the code should use %sh pip install so that the Python code can get executed in parallel across all nodes in a cluster.\n  D. Python will always execute slower than Scala on Databricks. The run.py script should be refactored to Scala.\n  E. %sh executes shell code on the driver node. The code does not take advantage of the worker nodes or Databricks optimized Spark.",
    "question_vi": "Đoạn mã sau đã được migrate sang notebook Databricks từ workload cũ. Mã thực thi thành công và cho kết quả logic đúng, tuy nhiên mất hơn 20 phút để extract và load khoảng 1 GB dữ liệu. Câu nào giải thích khả năng cho hành vi này?"
  },
  {
    "id": 67,
    "topic": 1,
    "question": "The data science team has requested assistance in accelerating queries on free form text from user reviews. The data is currently stored in Parquet with the below schema: item_id INT, user_id INT, review_id INT, rating FLOAT, review STRING The review column contains the full text of the review left by the user. Specifically, the data science team is looking to identify if any of 30 key words exist in this field. A junior data engineer suggests converting this data to Delta Lake will improve query performance. Which response to the junior data engineer s suggestion is correct?",
    "options": {
      "A": "Delta Lake statistics are not optimized for free text fields with high cardinality.",
      "B": "Text data cannot be stored with Delta Lake.",
      "C": "ZORDER ON review will need to be run to see performance gains.",
      "D": "The Delta log creates a term matrix for free text fields to support selective filtering.",
      "E": "Delta Lake statistics are only collected on the first 4 columns in a table."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ The Delta log creates a term matrix for free text fields to support selective filtering.\n\n❌ Các đáp án sai:\n  A. Delta Lake statistics are not optimized for free text fields with high cardinality.\n  B. Text data cannot be stored with Delta Lake.\n  C. ZORDER ON review will need to be run to see performance gains.\n  E. Delta Lake statistics are only collected on the first 4 columns in a table.",
    "question_vi": "Nhóm khoa học dữ liệu đã yêu cầu hỗ trợ tăng tốc truy vấn trên văn bản tự do từ đánh giá người dùng. Dữ liệu hiện được lưu trong Parquet với schema: item_id INT, user_id INT, review_id INT, rating FLOAT, review STRING. Cột review chứa toàn bộ văn bản đánh giá. Câu nào mô tả cách tốt nhất để tăng tốc truy vấn trên cột review?"
  },
  {
    "id": 68,
    "topic": 1,
    "question": "Assuming that the Databricks CLI has been installed and configured correctly, which Databricks CLI command can be used to upload a custom Python Wheel to object storage mounted with the DBFS for use with a production job?",
    "options": {
      "A": "configure",
      "B": "fs",
      "C": "jobs",
      "D": "libraries",
      "E": "workspace"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ jobs\n\n❌ Các đáp án sai:\n  A. configure\n  B. fs\n  D. libraries\n  E. workspace",
    "question_vi": "Giả sử Databricks CLI đã được cài đặt và cấu hình đúng, lệnh Databricks CLI nào có thể dùng để upload Python Wheel tùy chỉnh lên object storage mount với DBFS để sử dụng cho job production?"
  },
  {
    "id": 69,
    "topic": 1,
    "question": "The business intelligence team has a dashboard configured to track various summary metrics for retail stores. This includes total sales for the previous day alongside totals and averages for a variety of time periods. The fields required to populate this dashboard have the following schema: For demand forecasting, the Lakehouse contains a validated table of all itemized sales updated incrementally in near real-time. This table, named products_per_order, includes the following fields: Because reporting on long-term sales trends is less volatile, analysts using the new dashboard only require data to be refreshed once daily. Because the dashboard will be queried interactively by many users throughout a normal business day, it should return results quickly and reduce total compute associated with each materialization. Which solution meets the expectations of the end users while controlling and limiting possible costs?",
    "options": {
      "A": "Populate the dashboard by configuring a nightly batch job to save the required values as a table overwritten with each update.",
      "B": "Use Structured Streaming to configure a live dashboard against the products_per_order table within a Databricks notebook.",
      "C": "Configure a webhook to execute an incremental read against products_per_order each time the dashboard is refreshed.",
      "D": "Use the Delta Cache to persist the products_per_order table in memory to quickly update the dashboard with each query.",
      "E": "Define a view against the products_per_order table and define the dashboard against this view."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Populate the dashboard by configuring a nightly batch job to save the required values as a table overwritten with each update.\n\n❌ Các đáp án sai:\n  B. Use Structured Streaming to configure a live dashboard against the products_per_order table within a Databricks notebook.\n  C. Configure a webhook to execute an incremental read against products_per_order each time the dashboard is refreshed.\n  D. Use the Delta Cache to persist the products_per_order table in memory to quickly update the dashboard with each query.\n  E. Define a view against the products_per_order table and define the dashboard against this view.",
    "question_vi": "Nhóm BI có dashboard theo dõi nhiều chỉ số tổng hợp cho cửa hàng bán lẻ, bao gồm tổng doanh thu ngày trước, tổng và trung bình cho nhiều khoảng thời gian. Các trường cần để hiển thị dashboard có schema nhất định. Cho dự báo nhu cầu, Lakehouse chứa bảng đã được xác thực với thông tin chi tiết bán hàng. Đáp án nào mô tả kiến trúc phù hợp nhất?"
  },
  {
    "id": 70,
    "topic": 1,
    "question": "A data ingestion task requires a one-TB JSON dataset to be written out to Parquet with a target part-file size of 512 M",
    "options": {
      "B": "Set spark.sql.shuffle.partitions to 2,048 partitions (1TB*1024*1024/512), ingest the data, execute the narrow transformations, optimize the data by sorting it (which automatically repartitions the data), and then write to parquet.",
      "A": "Set spark.sql.files.maxPartitionBytes to 512 MB, ingest the data, execute the narrow transformations, and then write to parquet.",
      "C": "Set spark.sql.adaptive.advisoryPartitionSizeInBytes to 512 MB bytes, ingest the data, execute the narrow transformations, coalesce to 2,048 partitions (1TB*1024*1024/512), and then write to parquet.",
      "D": "Ingest the data, execute the narrow transformations, repartition to 2,048 partitions (1TB* 1024*1024/512), and then write to parquet.",
      "E": "Set spark.sql.shuffle.partitions to 512, ingest the data, execute the narrow transformations, and then write to parquet."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Set spark.sql.shuffle.partitions to 2,048 partitions (1TB*1024*1024/512), ingest the data, execute the narrow transformations, optimize the data by sorting it (which automatically repartitions the data), and then write to parquet.\n\n❌ Các đáp án sai:\n  A. Set spark.sql.files.maxPartitionBytes to 512 MB, ingest the data, execute the narrow transformations, and then write to parquet.\n  C. Set spark.sql.adaptive.advisoryPartitionSizeInBytes to 512 MB bytes, ingest the data, execute the narrow transformations, coalesce to 2,048 partiti...\n  D. Ingest the data, execute the narrow transformations, repartition to 2,048 partitions (1TB* 1024*1024/512), and then write to parquet.\n  E. Set spark.sql.shuffle.partitions to 512, ingest the data, execute the narrow transformations, and then write to parquet.",
    "question_vi": "Một tác vụ nạp dữ liệu yêu cầu ghi dataset JSON 1 TB ra Parquet với kích thước part-file mục tiêu 512 MB. Đáp án nào mô tả cách cấu hình để đạt kích thước file mục tiêu?"
  },
  {
    "id": 71,
    "topic": 1,
    "question": "A junior data engineer has been asked to develop a streaming data pipeline with a grouped aggregation using DataFrame df. The pipeline needs to calculate the average humidity and average temperature for each non-overlapping five-minute interval. Incremental state information should be maintained for 10 minutes for late-arriving data. Streaming DataFrame df has the following schema: \"device_id INT, event_time TIMESTAMP, temp FLOAT, humidity FLOAT\" Code block: Choose the response that correctly fills in the blank within the code block to complete this task.",
    "options": {
      "A": "withWatermark(\"event_time\", \"10 minutes\")",
      "B": "awaitArrival(\"event_time\", \"10 minutes\")",
      "C": "await(\"event_time + ‘10 minutes'\")",
      "D": "slidingWindow(\"event_time\", \"10 minutes\")",
      "E": "delayWrite(\"event_time\", \"10 minutes\")"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ slidingWindow(\"event_time\", \"10 minutes\")\n\n❌ Các đáp án sai:\n  A. withWatermark(\"event_time\", \"10 minutes\")\n  B. awaitArrival(\"event_time\", \"10 minutes\")\n  C. await(\"event_time + ‘10 minutes'\")\n  E. delayWrite(\"event_time\", \"10 minutes\")",
    "question_vi": "Một kiến trúc sư dữ liệu đã cấu hình DLT pipeline với tham số mặc định. Pipeline sử dụng Auto Loader để nạp dữ liệu log từ cloud storage, enriches bằng static lookup, rồi tạo aggregate. Nội dung DLT nào sẽ được lưu trữ tự động cho pipeline này?"
  },
  {
    "id": 72,
    "topic": 1,
    "question": "A data team's Structured Streaming job is configured to calculate running aggregates for item sales to update a downstream marketing dashboard. The marketing team has introduced a new promotion, and they would like to add a new field to track the number of times this promotion code is used for each item. A junior data engineer suggests updating the existing query as follows. Note that proposed changes are in bold. Original query: Proposed query: Proposed query: .start(“/item_agg”) Which step must also be completed to put the proposed query into production?",
    "options": {
      "A": "Specify a new checkpointLocation",
      "B": "Increase the shuffle partitions to account for additional aggregates",
      "C": "Run REFRESH TABLE delta.'/item_agg'",
      "D": "Register the data in the \"/item_agg\" directory to the Hive metastore",
      "E": "Remove .option(‘mergeSchema’, ‘true’) from the streaming write"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Specify a new checkpointLocation\n\n❌ Các đáp án sai:\n  B. Increase the shuffle partitions to account for additional aggregates\n  C. Run REFRESH TABLE delta.'/item_agg'\n  D. Register the data in the \"/item_agg\" directory to the Hive metastore\n  E. Remove .option(‘mergeSchema’, ‘true’) from the streaming write",
    "question_vi": "Một kỹ sư dữ liệu đang thiết kế DLT pipeline với multiple expectations. Một bảng yêu cầu dữ liệu đầu vào phải luôn có giá trị không null cho một trường. Đáp án nào mô tả cách sử dụng expectations để thực thi ràng buộc này?"
  },
  {
    "id": 73,
    "topic": 1,
    "question": "A Structured Streaming job deployed to production has been resulting in higher than expected cloud storage costs. At present, during normal execution, each microbatch of data is processed in less than 3s; at least 12 times per minute, a microbatch is processed that contains 0 records. The streaming write was configured using the default trigger settings. The production job is currently scheduled alongside many other Databricks jobs in a workspace with instance pools provisioned to reduce start-up time for jobs with batch execution. Holding all other variables constant and assuming records need to be processed in less than 10 minutes, which adjustment will meet the requirement?",
    "options": {
      "A": "Set the trigger interval to 3 seconds; the default trigger interval is consuming too many records per batch, resulting in spill to disk that can increase volume costs.",
      "B": "Increase the number of shuffle partitions to maximize parallelism, since the trigger interval cannot be modified without modifying the checkpoint directory.",
      "C": "Set the trigger interval to 10 minutes; each batch calls APIs in the source storage account, so decreasing trigger frequency to maximum allowable threshold should minimize this cost.",
      "D": "Set the trigger interval to 500 milliseconds; setting a small but non-zero trigger interval ensures that the source is not queried too frequently.",
      "E": "Use the trigger once option and configure a Databricks job to execute the query every 10 minutes; this approach minimizes costs for both compute and storage."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Set the trigger interval to 10 minutes; each batch calls APIs in the source storage account, so decreasing trigger frequency to maximum allowable threshold should minimize this cost.\n\n❌ Các đáp án sai:\n  A. Set the trigger interval to 3 seconds; the default trigger interval is consuming too many records per batch, resulting in spill to disk that can in...\n  B. Increase the number of shuffle partitions to maximize parallelism, since the trigger interval cannot be modified without modifying the checkpoint d...\n  D. Set the trigger interval to 500 milliseconds; setting a small but non-zero trigger interval ensures that the source is not queried too frequently.\n  E. Use the trigger once option and configure a Databricks job to execute the query every 10 minutes; this approach minimizes costs for both compute an...",
    "question_vi": "Một kỹ sư dữ liệu đang thiết kế pipeline xử lý dữ liệu CDC sử dụng APPLY CHANGES INTO trong DLT cho bảng SCD Type 1. Câu nào mô tả cách APPLY CHANGES INTO xử lý dữ liệu CDC?"
  },
  {
    "id": 74,
    "topic": 1,
    "question": "Which statement describes the correct use of pyspark.sql.functions.broadcast?",
    "options": {
      "A": "It marks a column as having low enough cardinality to properly map distinct values to available partitions, allowing a broadcast join.",
      "B": "It marks a column as small enough to store in memory on all executors, allowing a broadcast join.",
      "C": "It caches a copy of the indicated table on attached storage volumes for all active clusters within a Databricks workspace.",
      "D": "It marks a DataFrame as small enough to store in memory on all executors, allowing a broadcast join.",
      "E": "It caches a copy of the indicated table on all nodes in the cluster for use in all future queries during the cluster lifetime."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ It caches a copy of the indicated table on attached storage volumes for all active clusters within a Databricks workspace.\n\n❌ Các đáp án sai:\n  A. It marks a column as having low enough cardinality to properly map distinct values to available partitions, allowing a broadcast join.\n  B. It marks a column as small enough to store in memory on all executors, allowing a broadcast join.\n  D. It marks a DataFrame as small enough to store in memory on all executors, allowing a broadcast join.\n  E. It caches a copy of the indicated table on all nodes in the cluster for use in all future queries during the cluster lifetime.",
    "question_vi": "Nhóm kỹ thuật dữ liệu duy trì bảng thống kê tổng hợp thông qua cập nhật batch. Một pipeline mới cần xử lý cùng dữ liệu nhưng với các phép tính khác. Câu nào mô tả cách tốt nhất để chia sẻ logic xử lý dữ liệu giữa các pipeline?"
  },
  {
    "id": 75,
    "topic": 1,
    "question": "A data engineer is configuring a pipeline that will potentially see late-arriving, duplicate records. In addition to de-duplicating records within the batch, which of the following approaches allows the data engineer to deduplicate data against previously processed records as it is inserted into a Delta table?",
    "options": {
      "A": "Set the configuration delta.deduplicate = true.",
      "B": "VACUUM the Delta table after each batch completes.",
      "C": "Perform an insert-only merge with a matching condition on a unique key.",
      "D": "Perform a full outer join on a unique key and overwrite existing data.",
      "E": "Rely on Delta Lake schema enforcement to prevent duplicate records."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Perform a full outer join on a unique key and overwrite existing data.\n\n❌ Các đáp án sai:\n  A. Set the configuration delta.deduplicate = true.\n  B. VACUUM the Delta table after each batch completes.\n  C. Perform an insert-only merge with a matching condition on a unique key.\n  E. Rely on Delta Lake schema enforcement to prevent duplicate records.",
    "question_vi": "Đoạn mã sau tạo view EMPLOYEES_VW sử dụng dynamic view với hàm IS_MEMBER để kiểm tra quyền nhóm. Câu nào mô tả đúng hành vi của dynamic view này?"
  },
  {
    "id": 76,
    "topic": 1,
    "question": "A data pipeline uses Structured Streaming to ingest data from Apache Kafka to Delta Lake. Data is being stored in a bronze table, and includes the Kafka-generated timestamp, key, and value. Three months after the pipeline is deployed, the data engineering team has noticed some latency issues during certain times of the day. A senior data engineer updates the Delta Table's schema and ingestion logic to include the current timestamp (as recorded by Apache Spark) as well as the Kafka topic and partition. The team plans to use these additional metadata fields to diagnose the transient processing delays. Which limitation will the team face while diagnosing this problem?",
    "options": {
      "A": "New fields will not be computed for historic records.",
      "B": "Spark cannot capture the topic and partition fields from a Kafka source.",
      "C": "New fields cannot be added to a production Delta table.",
      "D": "Updating the table schema will invalidate the Delta transaction log metadata.",
      "E": "Updating the table schema requires a default value provided for each field added."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ New fields will not be computed for historic records.\n\n❌ Các đáp án sai:\n  B. Spark cannot capture the topic and partition fields from a Kafka source.\n  C. New fields cannot be added to a production Delta table.\n  D. Updating the table schema will invalidate the Delta transaction log metadata.\n  E. Updating the table schema requires a default value provided for each field added.",
    "question_vi": "Nhóm kỹ thuật dữ liệu đã thiết lập cảnh báo email khi job thất bại. Câu nào mô tả cách cấu hình email notification cho Databricks Jobs?"
  },
  {
    "id": 77,
    "topic": 1,
    "question": "In order to facilitate near real-time workloads, a data engineer is creating a helper function to leverage the schema detection and evolution functionality of Databricks Auto Loader. The desired function will automatically detect the schema of the source directly, incrementally process JSON files as they arrive in a source directory, and automatically evolve the schema of the table when new fields are detected. The function is displayed below with a blank. Which response correctly fills in the blank to meet the specified requirements?",
    "options": {
      "A": "write with overwriteSchema and checkpointLocation",
      "B": "writeStream with trigger(once=True), checkpointLocation and mergeSchema",
      "C": "write with checkpointLocation and mergeSchema",
      "D": "writeStream with checkpointLocation only",
      "E": "writeStream with checkpointLocation and mergeSchema"
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ writeStream with checkpointLocation and mergeSchema\n\n❌ Các đáp án sai:\n  A. write with overwriteSchema and checkpointLocation\n  B. writeStream with trigger(once=True), checkpointLocation and mergeSchema\n  C. write with checkpointLocation and mergeSchema\n  D. writeStream with checkpointLocation only",
    "question_vi": "Một kỹ sư dữ liệu đang sử dụng change data feed từ bảng Delta. Bảng nguồn được tạo với thuộc tính delta.enableChangeDataFeed = true. Câu nào mô tả cách sử dụng Change Data Feed để đọc các thay đổi?"
  },
  {
    "id": 78,
    "topic": 1,
    "question": "The data engineering team maintains the following code: Assuming that this code produces logically correct results and the data in the source table has been de-duplicated and validated, which statement describes what will occur when this code is executed?",
    "options": {
      "A": "The silver_customer_sales table will be overwritten by aggregated values calculated from all records in the gold_customer_lifetime_sales_summary table as a batch job.",
      "B": "A batch job will update the gold_customer_lifetime_sales_summary table, replacing only those rows that have different values than the current version of the table, using customer_id as the primary key.",
      "C": "The gold_customer_lifetime_sales_summary table will be overwritten by aggregated values calculated from all records in the silver_customer_sales table as a batch job.",
      "D": "An incremental job will leverage running information in the state store to update aggregate values in the gold_customer_lifetime_sales_summary table.",
      "E": "An incremental job will detect if new rows have been written to the silver_customer_sales table; if new rows are detected, all aggregates will be recalculated and used to overwrite the gold_customer_lifetime_sales_summary table."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ An incremental job will detect if new rows have been written to the silver_customer_sales table; if new rows are detected, all aggregates will be recalculated and used to overwrite the gold_customer_lifetime_sales_summary table.\n\n❌ Các đáp án sai:\n  A. The silver_customer_sales table will be overwritten by aggregated values calculated from all records in the gold_customer_lifetime_sales_summary ta...\n  B. A batch job will update the gold_customer_lifetime_sales_summary table, replacing only those rows that have different values than the current versi...\n  C. The gold_customer_lifetime_sales_summary table will be overwritten by aggregated values calculated from all records in the silver_customer_sales ta...\n  D. An incremental job will leverage running information in the state store to update aggregate values in the gold_customer_lifetime_sales_summary table.",
    "question_vi": "Một DLT pipeline đã được cấu hình với chế độ development mode. Kỹ sư dữ liệu muốn chuyển sang production mode. Câu nào mô tả sự khác biệt giữa development và production mode trong DLT?"
  },
  {
    "id": 79,
    "topic": 1,
    "question": "The data architect has mandated that all tables in the Lakehouse should be configured as external (also known as \"unmanaged\") Delta Lake tables. Which approach will ensure that this requirement is met?",
    "options": {
      "A": "When a database is being created, make sure that the LOCATION keyword is used.",
      "B": "When configuring an external data warehouse for all table storage, leverage Databricks for all ELT.",
      "C": "When data is saved to a table, make sure that a full file path is specified alongside the Delta format.",
      "D": "When tables are created, make sure that the EXTERNAL keyword is used in the CREATE TABLE statement.",
      "E": "When the workspace is being configured, make sure that external cloud object storage has been mounted."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ When tables are created, make sure that the EXTERNAL keyword is used in the CREATE TABLE statement.\n\n❌ Các đáp án sai:\n  A. When a database is being created, make sure that the LOCATION keyword is used.\n  B. When configuring an external data warehouse for all table storage, leverage Databricks for all ELT.\n  C. When data is saved to a table, make sure that a full file path is specified alongside the Delta format.\n  E. When the workspace is being configured, make sure that external cloud object storage has been mounted.",
    "question_vi": "Đoạn mã sau tạo một bảng managed Delta Lake. Kỹ sư muốn thêm CHECK constraint để đảm bảo tính hợp lệ dữ liệu. Câu nào mô tả cách thêm constraint đúng?"
  },
  {
    "id": 80,
    "topic": 1,
    "question": "The marketing team is looking to share data in an aggregate table with the sales organization, but the field names used by the teams do not match, and a number of marketing-specific fields have not been approved for the sales org. Which of the following solutions addresses the situation while emphasizing simplicity?",
    "options": {
      "A": "Create a view on the marketing table selecting only those fields approved for the sales team; alias the names of any fields that should be standardized to the sales naming conventions.",
      "B": "Create a new table with the required schema and use Delta Lake's DEEP CLONE functionality to sync up changes committed to one table to the corresponding table.",
      "C": "Use a CTAS statement to create a derivative table from the marketing table; configure a production job to propagate changes.",
      "D": "Add a parallel table write to the current production pipeline, updating a new sales table that varies as required from the marketing table.",
      "E": "Instruct the marketing team to download results as a CSV and email them to the sales organization."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Create a view on the marketing table selecting only those fields approved for the sales team; alias the names of any fields that should be standardized to the sales naming conventions.\n\n❌ Các đáp án sai:\n  B. Create a new table with the required schema and use Delta Lake's DEEP CLONE functionality to sync up changes committed to one table to the correspo...\n  C. Use a CTAS statement to create a derivative table from the marketing table; configure a production job to propagate changes.\n  D. Add a parallel table write to the current production pipeline, updating a new sales table that varies as required from the marketing table.\n  E. Instruct the marketing team to download results as a CSV and email them to the sales organization.",
    "question_vi": "Một kỹ sư đang xem xét hệ thống quản lý phiên bản và đang đánh giá các tùy chọn chia sẻ mã cũng như quản lý nhánh. Câu nào mô tả chính xác hành vi của Databricks Repos?"
  },
  {
    "id": 81,
    "topic": 1,
    "question": "A CHECK constraint has been successfully added to the Delta table named activity_details using the following logic: A batch job is attempting to insert new records to the table, including a record where latitude = 45.50 and longitude = 212.67. Which statement describes the outcome of this batch insert?",
    "options": {
      "A": "The write will fail when the violating record is reached; any records previously processed will be recorded to the target table.",
      "B": "The write will fail completely because of the constraint violation and no records will be inserted into the target table.",
      "C": "The write will insert all records except those that violate the table constraints; the violating records will be recorded to a quarantine table.",
      "D": "The write will include all records in the target table; any violations will be indicated in the boolean column named valid_coordinates.",
      "E": "The write will insert all records except those that violate the table constraints; the violating records will be reported in a warning log."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ The write will include all records in the target table; any violations will be indicated in the boolean column named valid_coordinates.\n\n❌ Các đáp án sai:\n  A. The write will fail when the violating record is reached; any records previously processed will be recorded to the target table.\n  B. The write will fail completely because of the constraint violation and no records will be inserted into the target table.\n  C. The write will insert all records except those that violate the table constraints; the violating records will be recorded to a quarantine table.\n  E. The write will insert all records except those that violate the table constraints; the violating records will be reported in a warning log.",
    "question_vi": "Nhóm phân tích dữ liệu phàn nàn truy vấn trên bảng Delta lớn chạy chậm. Kỹ sư dữ liệu phát hiện bảng có nhiều file nhỏ do streaming liên tục. Câu nào mô tả chiến lược tốt nhất để cải thiện hiệu suất truy vấn?"
  },
  {
    "id": 82,
    "topic": 1,
    "question": "A junior data engineer has manually configured a series of jobs using the Databricks Jobs UI. Upon reviewing their work, the engineer realizes that they are listed as the \"Owner\" for each job. They attempt to transfer \"Owner\" privileges to the \"DevOps\" group, but cannot successfully accomplish this task. Which statement explains what is preventing this privilege transfer?",
    "options": {
      "A": "Databricks jobs must have exactly one owner; \"Owner\" privileges cannot be assigned to a group.",
      "B": "The creator of a Databricks job will always have \"Owner\" privileges; this configuration cannot be changed.",
      "C": "Other than the default \"admins\" group, only individual users can be granted privileges on jobs.",
      "D": "A user can only transfer job ownership to a group if they are also a member of that group.",
      "E": "Only workspace administrators can grant \"Owner\" privileges to a group."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Databricks jobs must have exactly one owner; \"Owner\" privileges cannot be assigned to a group.\n\n❌ Các đáp án sai:\n  B. The creator of a Databricks job will always have \"Owner\" privileges; this configuration cannot be changed.\n  C. Other than the default \"admins\" group, only individual users can be granted privileges on jobs.\n  D. A user can only transfer job ownership to a group if they are also a member of that group.\n  E. Only workspace administrators can grant \"Owner\" privileges to a group.",
    "question_vi": "Một kỹ sư dữ liệu đã sử dụng Spark Structured Streaming để đọc dữ liệu từ Kafka và ghi vào bảng Delta Lake. Câu nào mô tả vai trò của checkpoint location trong trường hợp này?"
  },
  {
    "id": 83,
    "topic": 1,
    "question": "All records from an Apache Kafka producer are being ingested into a single Delta Lake table with the following schema: key BINARY, value BINARY, topic STRING, partition LONG, offset LONG, timestamp LONG There are 5 unique topics being ingested. Only the \"registration\" topic contains Personal Identifiable Information (PII). The company wishes to restrict access to PII. The company also wishes to only retain records containing PII in this table for 14 days after initial ingestion. However, for non-PII information, it would like to retain these records indefinitely. Which of the following solutions meets the requirements?",
    "options": {
      "A": "All data should be deleted biweekly; Delta Lake's time travel functionality should be leveraged to maintain a history of non-PII information.",
      "B": "Data should be partitioned by the registration field, allowing ACLs and delete statements to be set for the PII directory.",
      "C": "Because the value field is stored as binary data, this information is not considered PII and no special precautions should be taken.",
      "D": "Separate object storage containers should be specified based on the partition field, allowing isolation at the storage level.",
      "E": "Data should be partitioned by the topic field, allowing ACLs and delete statements to leverage partition boundaries."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Separate object storage containers should be specified based on the partition field, allowing isolation at the storage level.\n\n❌ Các đáp án sai:\n  A. All data should be deleted biweekly; Delta Lake's time travel functionality should be leveraged to maintain a history of non-PII information.\n  B. Data should be partitioned by the registration field, allowing ACLs and delete statements to be set for the PII directory.\n  C. Because the value field is stored as binary data, this information is not considered PII and no special precautions should be taken.\n  E. Data should be partitioned by the topic field, allowing ACLs and delete statements to leverage partition boundaries.",
    "question_vi": "Đoạn mã sau sử dụng MERGE INTO để cập nhật bảng Delta Lake. Câu nào mô tả hành vi khi source chứa nhiều bản ghi khớp cùng một key trong target?"
  },
  {
    "id": 84,
    "topic": 1,
    "question": "The data architect has decided that once data has been ingested from external sources into the Databricks Lakehouse, table access controls will be leveraged to manage permissions for all production tables and views. The following logic was executed to grant privileges for interactive queries on a production database to the core engineering group. GRANT USAGE ON DATABASE prod TO eng; GRANT SELECT ON DATABASE prod TO eng; Assuming these are the only privileges that have been granted to the eng group and that these users are not workspace administrators, which statement describes their privileges?",
    "options": {
      "A": "Group members have full permissions on the prod database and can also assign permissions to other users or groups.",
      "B": "Group members are able to list all tables in the prod database but are not able to see the results of any queries on those tables.",
      "C": "Group members are able to query and modify all tables and views in the prod database, but cannot create new tables or views.",
      "D": "Group members are able to query all tables and views in the prod database, but cannot create or edit anything in the database.",
      "E": "Group members are able to create, query, and modify all tables and views in the prod database, but cannot define custom functions."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ Group members are able to create, query, and modify all tables and views in the prod database, but cannot define custom functions.\n\n❌ Các đáp án sai:\n  A. Group members have full permissions on the prod database and can also assign permissions to other users or groups.\n  B. Group members are able to list all tables in the prod database but are not able to see the results of any queries on those tables.\n  C. Group members are able to query and modify all tables and views in the prod database, but cannot create new tables or views.\n  D. Group members are able to query all tables and views in the prod database, but cannot create or edit anything in the database.",
    "question_vi": "Nhóm kỹ thuật dữ liệu đang cấu hình DLT pipeline. Pipeline bao gồm nhiều notebook xử lý dữ liệu khác nhau. Câu nào mô tả cách DLT xử lý nhiều notebook trong một pipeline?"
  },
  {
    "id": 85,
    "topic": 1,
    "question": "A distributed team of data analysts share computing resources on an interactive cluster with autoscaling configured. In order to better manage costs and query throughput, the workspace administrator is hoping to evaluate whether cluster upscaling is caused by many concurrent users or resource-intensive queries. In which location can one review the timeline for cluster resizing events?",
    "options": {
      "A": "Workspace audit logs",
      "B": "Driver's log file",
      "C": "Ganglia",
      "D": "Cluster Event Log",
      "E": "Executor's log file"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Ganglia\n\n❌ Các đáp án sai:\n  A. Workspace audit logs\n  B. Driver's log file\n  D. Cluster Event Log\n  E. Executor's log file",
    "question_vi": "Một kỹ sư dữ liệu đang sử dụng dbutils.widgets trong notebook. Câu nào mô tả cách sử dụng widgets để tham số hóa notebook khi chạy dưới dạng job?"
  },
  {
    "id": 86,
    "topic": 1,
    "question": "When evaluating the Ganglia Metrics for a given cluster with 3 executor nodes, which indicator would signal proper utilization of the VM's resources?",
    "options": {
      "A": "The five Minute Load Average remains consistent/flat",
      "B": "Bytes Received never exceeds 80 million bytes per second",
      "C": "Network I/O never spikes",
      "D": "Total Disk Space remains constant",
      "E": "CPU Utilization is around 75%"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Total Disk Space remains constant\n\n❌ Các đáp án sai:\n  A. The five Minute Load Average remains consistent/flat\n  B. Bytes Received never exceeds 80 million bytes per second\n  C. Network I/O never spikes\n  E. CPU Utilization is around 75%",
    "question_vi": "Auto Loader hỗ trợ hai chế độ phát hiện file: directory listing và file notification. Câu nào mô tả sự khác biệt giữa hai chế độ này?"
  },
  {
    "id": 87,
    "topic": 1,
    "question": "Which of the following technologies can be used to identify key areas of text when parsing Spark Driver log4j output?",
    "options": {
      "A": "Regex",
      "B": "Julia",
      "C": "pyspsark.ml.feature",
      "D": "Scala Datasets",
      "E": "C++"
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ C++\n\n❌ Các đáp án sai:\n  A. Regex\n  B. Julia\n  C. pyspsark.ml.feature\n  D. Scala Datasets",
    "question_vi": "Một nhóm 3 kỹ sư dữ liệu đang phát triển dự án gồm bảng silver dùng Databricks Repos. Câu nào mô tả cách quản lý phiên bản và hợp tác hiệu quả?"
  },
  {
    "id": 88,
    "topic": 1,
    "question": "You are testing a collection of mathematical functions, one of which calculates the area under a curve as described by another function. assert(myIntegrate(lambda x: x*x, 0, 3) [0] == 9) Which kind of test would the above line exemplify?",
    "options": {
      "A": "Unit",
      "B": "Manual",
      "C": "Functional",
      "D": "Integration",
      "E": "End-to-end"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Unit\n\n❌ Các đáp án sai:\n  B. Manual\n  C. Functional\n  D. Integration\n  E. End-to-end",
    "question_vi": "Đoạn mã sau trigger Structured Streaming job với processingTime. Câu nào mô tả hành vi của trigger processingTime?"
  },
  {
    "id": 89,
    "topic": 1,
    "question": "A Databricks job has been configured with 3 tasks, each of which is a Databricks notebook. Task A does not depend on other tasks. Tasks B and C run in parallel, with each having a serial dependency on Task",
    "options": {
      "A": "Because all tasks are managed as a dependency graph, no changes will be committed to the Lakehouse until all tasks have successfully been completed.",
      "B": "Tasks B and C will attempt to run as configured; any changes made in task A will be rolled back due to task failure.",
      "C": "Unless all tasks complete successfully, no changes will be committed to the Lakehouse; because task A failed, all commits will be rolled back automatically.",
      "D": "Tasks B and C will be skipped; some logic expressed in task A may have been committed before task failure.",
      "E": "Tasks B and C will be skipped; task A will not commit any changes because of stage failure."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Unless all tasks complete successfully, no changes will be committed to the Lakehouse; because task A failed, all commits will be rolled back automatically.\n\n❌ Các đáp án sai:\n  A. Because all tasks are managed as a dependency graph, no changes will be committed to the Lakehouse until all tasks have successfully been completed.\n  B. Tasks B and C will attempt to run as configured; any changes made in task A will be rolled back due to task failure.\n  D. Tasks B and C will be skipped; some logic expressed in task A may have been committed before task failure.\n  E. Tasks B and C will be skipped; task A will not commit any changes because of stage failure.",
    "question_vi": "Nhóm kỹ thuật dữ liệu cần đảm bảo pipeline idempotent - chạy nhiều lần với cùng input phải cho kết quả giống nhau. Cách nào tốt nhất để đảm bảo idempotency trong pipeline Delta Lake?"
  },
  {
    "id": 90,
    "topic": 1,
    "question": "Which statement regarding Spark configuration on the Databricks platform is true?",
    "options": {
      "A": "The Databricks REST API can be used to modify the Spark configuration properties for an interactive cluster without interrupting jobs currently running on the cluster.",
      "B": "Spark configurations set within a notebook will affect all SparkSessions attached to the same interactive cluster.",
      "C": "Spark configuration properties can only be set for an interactive cluster by creating a global init script.",
      "D": "Spark configuration properties set for an interactive cluster with the Clusters UI will impact all notebooks attached to that cluster.",
      "E": "When the same Spark configuration property is set for an interactive cluster and a notebook attached to that cluster, the notebook setting will always be ignored."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Spark configuration properties set for an interactive cluster with the Clusters UI will impact all notebooks attached to that cluster.\n\n❌ Các đáp án sai:\n  A. The Databricks REST API can be used to modify the Spark configuration properties for an interactive cluster without interrupting jobs currently run...\n  B. Spark configurations set within a notebook will affect all SparkSessions attached to the same interactive cluster.\n  C. Spark configuration properties can only be set for an interactive cluster by creating a global init script.\n  E. When the same Spark configuration property is set for an interactive cluster and a notebook attached to that cluster, the notebook setting will alw...",
    "question_vi": "Câu nào về cấu hình Spark trên nền tảng Databricks là đúng?"
  },
  {
    "id": 91,
    "topic": 1,
    "question": "A developer has successfully configured their credentials for Databricks Repos and cloned a remote Git repository. They do not have privileges to make changes to the main branch, which is the only branch currently visible in their workspace. Which approach allows this user to share their code updates without the risk of overwriting the work of their teammates?",
    "options": {
      "A": "Use Repos to checkout all changes and send the git diff log to the team.",
      "B": "Use Repos to create a fork of the remote repository, commit all changes, and make a pull request on the source repository.",
      "C": "Use Repos to pull changes from the remote Git repository; commit and push changes to a branch that appeared as changes were pulled.",
      "D": "Use Repos to merge all differences and make a pull request back to the remote repository.",
      "E": "Use Repos to create a new branch, commit all changes, and push changes to the remote Git repository."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ Use Repos to create a new branch, commit all changes, and push changes to the remote Git repository.\n\n❌ Các đáp án sai:\n  A. Use Repos to checkout all changes and send the git diff log to the team.\n  B. Use Repos to create a fork of the remote repository, commit all changes, and make a pull request on the source repository.\n  C. Use Repos to pull changes from the remote Git repository; commit and push changes to a branch that appeared as changes were pulled.\n  D. Use Repos to merge all differences and make a pull request back to the remote repository.",
    "question_vi": "Một lập trình viên đã cấu hình thành công credentials cho Databricks Repos và clone remote Git repository. Họ không có quyền thay đổi nhánh main, là nhánh duy nhất hiện hiển thị trong workspace. Cách tiếp cận nào cho phép người dùng chia sẻ cập nhật mã mà không có rủi ro ghi đè lên công việc của người khác?"
  },
  {
    "id": 92,
    "topic": 1,
    "question": "In order to prevent accidental commits to production data, a senior data engineer has instituted a policy that all development work will reference clones of Delta Lake tables. After testing both DEEP and SHALLOW CLONE, development tables are created using SHALLOW CLON",
    "options": {
      "E": "The data files compacted by VACUUM are not tracked by the cloned metadata; running REFRESH on the cloned table will pull in recent changes.",
      "A": "Because Type 1 changes overwrite existing records, Delta Lake cannot guarantee data consistency for cloned tables.",
      "B": "Running VACUUM automatically invalidates any shallow clones of a table; DEEP CLONE should always be used when a cloned table will be repeatedly queried.",
      "C": "Tables created with SHALLOW CLONE are automatically deleted after their default retention threshold of 7 days.",
      "D": "The metadata created by the CLONE operation is referencing data files that were purged as invalid by the VACUUM command."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ The metadata created by the CLONE operation is referencing data files that were purged as invalid by the VACUUM command.\n\n❌ Các đáp án sai:\n  A. Because Type 1 changes overwrite existing records, Delta Lake cannot guarantee data consistency for cloned tables.\n  B. Running VACUUM automatically invalidates any shallow clones of a table; DEEP CLONE should always be used when a cloned table will be repeatedly que...\n  C. Tables created with SHALLOW CLONE are automatically deleted after their default retention threshold of 7 days.\n  E. The data files compacted by VACUUM are not tracked by the cloned metadata; running REFRESH on the cloned table will pull in recent changes.",
    "question_vi": "Để ngăn việc commit nhầm vào dữ liệu production, kỹ sư cao cấp đã thiết lập chính sách rằng tất cả công việc phát triển sẽ tham chiếu clone của bảng Delta Lake. Sau khi test cả DEEP và SHALLOW CLONE, bảng phát triển được tạo bằng SHALLOW CLONE. Câu nào mô tả đúng hành vi của SHALLOW CLONE?"
  },
  {
    "id": 93,
    "topic": 1,
    "question": "You are performing a join operation to combine values from a static userLookup table with a streaming DataFrame streamingD",
    "options": {
      "F": "Which code block attempts to perform an invalid stream-static join?",
      "A": "userLookup.join(streamingDF, [\"userid\"], how=\"inner\")",
      "B": "streamingDF.join(userLookup, [\"user_id\"], how=\"outer\")",
      "C": "streamingDF.join(userLookup, [\"user_id”], how=\"left\")",
      "D": "streamingDF.join(userLookup, [\"userid\"], how=\"inner\")",
      "E": "userLookup.join(streamingDF, [\"user_id\"], how=\"right\")"
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ userLookup.join(streamingDF, [\"user_id\"], how=\"right\")\n\n❌ Các đáp án sai:\n  A. userLookup.join(streamingDF, [\"userid\"], how=\"inner\")\n  B. streamingDF.join(userLookup, [\"user_id\"], how=\"outer\")\n  C. streamingDF.join(userLookup, [\"user_id”], how=\"left\")\n  D. streamingDF.join(userLookup, [\"userid\"], how=\"inner\")\n  F. Which code block attempts to perform an invalid stream-static join?",
    "question_vi": "Bạn đang thực hiện phép join để kết hợp giá trị từ bảng static userLookup với streaming DataFrame streamingDF. Câu nào mô tả đúng cách stream-static join hoạt động?"
  },
  {
    "id": 94,
    "topic": 1,
    "question": "Spill occurs as a result of executing various wide transformations. However, diagnosing spill requires one to proactively look for key indicators. Where in the Spark UI are two of the primary indicators that a partition is spilling to disk?",
    "options": {
      "A": "Query’s detail screen and Job’s detail screen",
      "B": "Stage’s detail screen and Executor’s log files",
      "C": "Driver’s and Executor’s log files",
      "D": "Executor’s detail screen and Executor’s log files",
      "E": "Stage’s detail screen and Query’s detail screen"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Stage’s detail screen and Executor’s log files\n\n❌ Các đáp án sai:\n  A. Query’s detail screen and Job’s detail screen\n  C. Driver’s and Executor’s log files\n  D. Executor’s detail screen and Executor’s log files\n  E. Stage’s detail screen and Query’s detail screen",
    "question_vi": "Spill xảy ra do thực thi nhiều wide transformations. Tuy nhiên, chẩn đoán spill yêu cầu chủ động tìm kiếm các chỉ số chính. Ở đâu trong Spark UI có hai chỉ số chính cho thấy partition đang spill ra đĩa?"
  },
  {
    "id": 95,
    "topic": 1,
    "question": "A task orchestrator has been configured to run two hourly tasks. First, an outside system writes Parquet data to a directory mounted at /mnt/raw_orders/. After this data is written, a Databricks job containing the following code is executed: Assume that the fields customer_id and order_id serve as a composite key to uniquely identify each order, and that the time field indicates when the record was queued in the source system. If the upstream system is known to occasionally enqueue duplicate entries for a single order hours apart, which statement is correct?",
    "options": {
      "A": "Duplicate records enqueued more than 2 hours apart may be retained and the orders table may contain duplicate records with the same customer_id and order_id.",
      "B": "All records will be held in the state store for 2 hours before being deduplicated and committed to the orders table.",
      "C": "The orders table will contain only the most recent 2 hours of records and no duplicates will be present.",
      "D": "Duplicate records arriving more than 2 hours apart will be dropped, but duplicates that arrive in the same batch may both be written to the orders table.",
      "E": "The orders table will not contain duplicates, but records arriving more than 2 hours late will be ignored and missing from the table."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Duplicate records enqueued more than 2 hours apart may be retained and the orders table may contain duplicate records with the same customer_id and order_id.\n\n❌ Các đáp án sai:\n  B. All records will be held in the state store for 2 hours before being deduplicated and committed to the orders table.\n  C. The orders table will contain only the most recent 2 hours of records and no duplicates will be present.\n  D. Duplicate records arriving more than 2 hours apart will be dropped, but duplicates that arrive in the same batch may both be written to the orders ...\n  E. The orders table will not contain duplicates, but records arriving more than 2 hours late will be ignored and missing from the table.",
    "question_vi": "Một task orchestrator đã được cấu hình để chạy hai tác vụ hàng giờ. Đầu tiên, hệ thống bên ngoài ghi dữ liệu Parquet vào thư mục mount tại /mnt/raw_orders/. Sau khi dữ liệu được ghi, Databricks job chứa đoạn mã sau được thực thi. Giả sử customer_id và order_id là khóa composite. Câu nào mô tả kết quả?"
  },
  {
    "id": 96,
    "topic": 1,
    "question": "A junior data engineer is migrating a workload from a relational database system to the Databricks Lakehouse. The source system uses a star schema, leveraging foreign key constraints and multi-table inserts to validate records on write. Which consideration will impact the decisions made by the engineer while migrating this workload?",
    "options": {
      "A": "Databricks only allows foreign key constraints on hashed identifiers, which avoid collisions in highly-parallel writes.",
      "B": "Databricks supports Spark SQL and JDBC; all logic can be directly migrated from the source system without refactoring.",
      "C": "Committing to multiple tables simultaneously requires taking out multiple table locks and can lead to a state of deadlock.",
      "D": "All Delta Lake transactions are ACID compliant against a single table, and Databricks does not enforce foreign key constraints.",
      "E": "Foreign keys must reference a primary key field; multi-table inserts must leverage Delta Lake’s upsert functionality."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ All Delta Lake transactions are ACID compliant against a single table, and Databricks does not enforce foreign key constraints.\n\n❌ Các đáp án sai:\n  A. Databricks only allows foreign key constraints on hashed identifiers, which avoid collisions in highly-parallel writes.\n  B. Databricks supports Spark SQL and JDBC; all logic can be directly migrated from the source system without refactoring.\n  C. Committing to multiple tables simultaneously requires taking out multiple table locks and can lead to a state of deadlock.\n  E. Foreign keys must reference a primary key field; multi-table inserts must leverage Delta Lake’s upsert functionality.",
    "question_vi": "Một kỹ sư dữ liệu mới đang chuyển đổi workload từ hệ thống cơ sở dữ liệu quan hệ sang Databricks Lakehouse. Hệ thống nguồn sử dụng star schema, tận dụng foreign key constraints và multi-table inserts để validate bản ghi khi ghi. Cân nhắc nào sẽ ảnh hưởng đến quyết định của kỹ sư khi chuyển đổi workload này?"
  },
  {
    "id": 97,
    "topic": 1,
    "question": "A data architect has heard about Delta Lake’s built-in versioning and time travel capabilities. For auditing purposes, they have a requirement to maintain a full record of all valid street addresses as they appear in the customers table. The architect is interested in implementing a Type 1 table, overwriting existing records with new values and relying on Delta Lake time travel to support long-term auditing. A data engineer on the project feels that a Type 2 table will provide better performance and scalability. Which piece of information is critical to this decision?",
    "options": {
      "A": "Data corruption can occur if a query fails in a partially completed state because Type 2 tables require setting multiple fields in a single update.",
      "B": "Shallow clones can be combined with Type 1 tables to accelerate historic queries for long-term versioning.",
      "C": "Delta Lake time travel cannot be used to query previous versions of these tables because Type 1 changes modify data files in place.",
      "D": "Delta Lake time travel does not scale well in cost or latency to provide a long-term versioning solution.",
      "E": "Delta Lake only supports Type 0 tables; once records are inserted to a Delta Lake table, they cannot be modified."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Delta Lake time travel does not scale well in cost or latency to provide a long-term versioning solution.\n\n❌ Các đáp án sai:\n  A. Data corruption can occur if a query fails in a partially completed state because Type 2 tables require setting multiple fields in a single update.\n  B. Shallow clones can be combined with Type 1 tables to accelerate historic queries for long-term versioning.\n  C. Delta Lake time travel cannot be used to query previous versions of these tables because Type 1 changes modify data files in place.\n  E. Delta Lake only supports Type 0 tables; once records are inserted to a Delta Lake table, they cannot be modified.",
    "question_vi": "Kiến trúc sư dữ liệu đã biết về khả năng versioning và time travel tích hợp của Delta Lake. Vì mục đích kiểm toán, họ yêu cầu duy trì bản ghi đầy đủ của tất cả địa chỉ hợp lệ khi chúng xuất hiện trong bảng customers. Kiến trúc sư quan tâm đến việc triển khai bảng Type 1, ghi đè bản ghi hiện tại và dựa vào time travel cho lịch sử. Câu nào mô tả giới hạn của cách tiếp cận này?"
  },
  {
    "id": 98,
    "topic": 1,
    "question": "A table named user_ltv is being used to create a view that will be used by data analysts on various teams. Users in the workspace are configured into groups, which are used for setting up data access using ACLs. The user_ltv table has the following schema: email STRING, age INT, ltv INT The following view definition is executed: An analyst who is not a member of the auditing group executes the following query: SELECT * FROM user_ltv_no_minors Which statement describes the results returned by this query?",
    "options": {
      "A": "All columns will be displayed normally for those records that have an age greater than 17; records not meeting this condition will be omitted.",
      "B": "All age values less than 18 will be returned as null values, all other columns will be returned with the values in user_ltv.",
      "C": "All values for the age column will be returned as null values, all other columns will be returned with the values in user_ltv.",
      "D": "All records from all columns will be displayed with the values in user_ltv.",
      "E": "All columns will be displayed normally for those records that have an age greater than 18; records not meeting this condition will be omitted."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ All columns will be displayed normally for those records that have an age greater than 17; records not meeting this condition will be omitted.\n\n❌ Các đáp án sai:\n  B. All age values less than 18 will be returned as null values, all other columns will be returned with the values in user_ltv.\n  C. All values for the age column will be returned as null values, all other columns will be returned with the values in user_ltv.\n  D. All records from all columns will be displayed with the values in user_ltv.\n  E. All columns will be displayed normally for those records that have an age greater than 18; records not meeting this condition will be omitted.",
    "question_vi": "Bảng user_ltv đang được sử dụng để tạo view cho nhà phân tích dữ liệu nhiều nhóm. Người dùng workspace được cấu hình theo nhóm dùng cho ACL. Bảng user_ltv có schema: email STRING, age INT, ltv INT. View được tạo. Một nhà phân tích không thuộc nhóm managers truy vấn view. Kết quả là gì?"
  },
  {
    "id": 99,
    "topic": 1,
    "question": "The data governance team is reviewing code used for deleting records for compliance with GDPR. The following logic has been implemented to propagate delete requests from the user_lookup table to the user_aggregates table. Assuming that user_id is a unique identifying key and that all users that have requested deletion have been removed from the user_lookup table, which statement describes whether successfully executing the above logic guarantees that the records to be deleted from the user_aggregates table are no longer accessible and why?",
    "options": {
      "A": "No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command.",
      "B": "No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data files.",
      "C": "Yes; the change data feed uses foreign keys to ensure delete consistency throughout the Lakehouse.",
      "D": "Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records.",
      "E": "No; the change data feed only tracks inserts and updates, not deleted records."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data files.\n\n❌ Các đáp án sai:\n  A. No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command.\n  C. Yes; the change data feed uses foreign keys to ensure delete consistency throughout the Lakehouse.\n  D. Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records.\n  E. No; the change data feed only tracks inserts and updates, not deleted records.",
    "question_vi": "Nhóm quản trị dữ liệu đang review mã xóa bản ghi để tuân thủ GDPR. Logic sau được triển khai để lan truyền yêu cầu xóa từ bảng user_lookup sang bảng user_aggregates. Giả sử user_id là khóa duy nhất và tất cả người dùng yêu cầu xóa đã bị xóa khỏi bảng user_lookup. Câu nào mô tả kết quả?"
  },
  {
    "id": 100,
    "topic": 1,
    "question": "The data engineering team has been tasked with configuring connections to an external database that does not have a supported native connector with Databricks. The external database already has data security configured by group membership. These groups map directly to user groups already created in Databricks that represent various teams within the company. A new login credential has been created for each group in the external database. The Databricks Utilities Secrets module will be used to make these credentials available to Databricks users. Assuming that all the credentials are configured correctly on the external database and group membership is properly configured on Databricks, which statement describes how teams can be granted the minimum necessary access to using these credentials?",
    "options": {
      "A": "\"Manage\" permissions should be set on a secret key mapped to those credentials that will be used by a given team.",
      "B": "\"Read\" permissions should be set on a secret key mapped to those credentials that will be used by a given team.",
      "C": "\"Read\" permissions should be set on a secret scope containing only those credentials that will be used by a given team.",
      "D": "\"Manage\" permissions should be set on a secret scope containing only those credentials that will be used by a given team. No additional configuration is necessary as long as all users are configured as administrators in the workspace where secrets have been added."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ \"Read\" permissions should be set on a secret key mapped to those credentials that will be used by a given team.\n\n❌ Các đáp án sai:\n  A. \"Manage\" permissions should be set on a secret key mapped to those credentials that will be used by a given team.\n  C. \"Read\" permissions should be set on a secret scope containing only those credentials that will be used by a given team.\n  D. \"Manage\" permissions should be set on a secret scope containing only those credentials that will be used by a given team. No additional configurati...",
    "question_vi": "Nhóm kỹ thuật dữ liệu được giao nhiệm vụ cấu hình kết nối tới cơ sở dữ liệu bên ngoài không có connector native được Databricks hỗ trợ. Cơ sở dữ liệu bên ngoài đã có bảo mật dữ liệu cấu hình theo nhóm. Các nhóm này map trực tiếp với user groups đã tạo trong Databricks. Đáp án nào mô tả cách kết nối?"
  },
  {
    "id": 101,
    "topic": 1,
    "question": "Which indicators would you look for in the Spark UI’s Storage tab to signal that a cached table is not performing optimally? Assume you are using Spark’s MEMORY_ONLY storage level.",
    "options": {
      "A": "Size on Disk is < Size in Memory",
      "B": "The RDD Block Name includes the “*” annotation signaling a failure to cache",
      "C": "Size on Disk is > 0",
      "D": "The number of Cached Partitions > the number of Spark Partitions",
      "E": "On Heap Memory Usage is within 75% of Off Heap Memory Usage"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Size on Disk is > 0\n\n❌ Các đáp án sai:\n  A. Size on Disk is < Size in Memory\n  B. The RDD Block Name includes the “*” annotation signaling a failure to cache\n  D. The number of Cached Partitions > the number of Spark Partitions\n  E. On Heap Memory Usage is within 75% of Off Heap Memory Usage",
    "question_vi": "Bạn sẽ tìm chỉ số nào trong tab Storage của Spark UI để báo hiệu rằng bảng cached không hoạt động tối ưu? Giả sử bạn đang dùng mức lưu trữ MEMORY_ONLY của Spark."
  },
  {
    "id": 102,
    "topic": 1,
    "question": "What is the first line of a Databricks Python notebook when viewed in a text editor?",
    "options": {
      "A": "%python",
      "B": "// Databricks notebook source",
      "C": "# Databricks notebook source",
      "D": "-- Databricks notebook source",
      "E": "# MAGIC %python"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ // Databricks notebook source\n\n❌ Các đáp án sai:\n  A. %python\n  C. # Databricks notebook source\n  D. -- Databricks notebook source\n  E. # MAGIC %python",
    "question_vi": "Dòng đầu tiên của notebook Python Databricks khi xem trong trình soạn thảo văn bản là gì?"
  },
  {
    "id": 103,
    "topic": 1,
    "question": "Which statement describes a key benefit of an end-to-end test?",
    "options": {
      "A": "Makes it easier to automate your test suite",
      "B": "Pinpoints errors in the building blocks of your application",
      "C": "Provides testing coverage for all code paths and branches",
      "D": "Closely simulates real world usage of your application",
      "E": "Ensures code is optimized for a real-life workflow"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Closely simulates real world usage of your application\n\n❌ Các đáp án sai:\n  A. Makes it easier to automate your test suite\n  B. Pinpoints errors in the building blocks of your application\n  C. Provides testing coverage for all code paths and branches\n  E. Ensures code is optimized for a real-life workflow",
    "question_vi": "Câu nào mô tả lợi ích chính của end-to-end test?"
  },
  {
    "id": 104,
    "topic": 1,
    "question": "The Databricks CLI is used to trigger a run of an existing job by passing the job_id parameter. The response that the job run request has been submitted successfully includes a field run_id. Which statement describes what the number alongside this field represents?",
    "options": {
      "A": "The job_id and number of times the job has been run are concatenated and returned.",
      "B": "The total number of jobs that have been run in the workspace.",
      "C": "The number of times the job definition has been run in this workspace.",
      "D": "The job_id is returned in this field.",
      "E": "The globally unique ID of the newly triggered run."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ The globally unique ID of the newly triggered run.\n\n❌ Các đáp án sai:\n  A. The job_id and number of times the job has been run are concatenated and returned.\n  B. The total number of jobs that have been run in the workspace.\n  C. The number of times the job definition has been run in this workspace.\n  D. The job_id is returned in this field.",
    "question_vi": "Databricks CLI được dùng để kích hoạt chạy job hiện có bằng tham số job_id. Phản hồi rằng yêu cầu chạy job đã được gửi thành công bao gồm trường run_id. Câu nào mô tả ý nghĩa của số bên cạnh trường này?"
  },
  {
    "id": 105,
    "topic": 1,
    "question": "The data science team has created and logged a production model using MLflow. The model accepts a list of column names and returns a new column of type DOUBL",
    "options": {
      "E": "df.apply(model, columns).select(\"customer_id, predictions\")",
      "A": "df.map(lambda x:model(x[columns])).select(\"customer_id, predictions\")",
      "B": "df.select(\"customer_id\", model(*columns).alias(\"predictions\"))",
      "C": "model.predict(df, columns)",
      "D": "df.select(\"customer_id\", pandas_udf(model, columns).alias(\"predictions\"))"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ df.select(\"customer_id\", pandas_udf(model, columns).alias(\"predictions\"))\n\n❌ Các đáp án sai:\n  A. df.map(lambda x:model(x[columns])).select(\"customer_id, predictions\")\n  B. df.select(\"customer_id\", model(*columns).alias(\"predictions\"))\n  C. model.predict(df, columns)\n  E. df.apply(model, columns).select(\"customer_id, predictions\")",
    "question_vi": "Nhóm khoa học dữ liệu đã tạo và ghi log mô hình production sử dụng MLflow. Mô hình nhận danh sách tên cột và trả về cột mới kiểu DOUBLE. Câu nào mô tả cách áp dụng mô hình trong pipeline production?"
  },
  {
    "id": 106,
    "topic": 1,
    "question": "A nightly batch job is configured to ingest all data files from a cloud object storage container where records are stored in a nested directory structure YYYY/MM/D",
    "options": {
      "D": "Filter all records in the reviews_raw table based on the review_timestamp; batch append those records produced in the last 48 hours.",
      "A": "Perform a batch read on the reviews_raw table and perform an insert-only merge using the natural composite key user_id, review_id, product_id, review_timestamp.",
      "B": "Configure a Structured Streaming read against the reviews_raw table using the trigger once execution mode to process new records as a batch job.",
      "C": "Use Delta Lake version history to get the difference between the latest version of reviews_raw and one version prior, then write these records to the next table.",
      "E": "Reprocess all records in reviews_raw and overwrite the next table in the pipeline."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Use Delta Lake version history to get the difference between the latest version of reviews_raw and one version prior, then write these records to the next table.\n\n❌ Các đáp án sai:\n  A. Perform a batch read on the reviews_raw table and perform an insert-only merge using the natural composite key user_id, review_id, product_id, revi...\n  B. Configure a Structured Streaming read against the reviews_raw table using the trigger once execution mode to process new records as a batch job.\n  D. Filter all records in the reviews_raw table based on the review_timestamp; batch append those records produced in the last 48 hours.\n  E. Reprocess all records in reviews_raw and overwrite the next table in the pipeline.",
    "question_vi": "Một batch job hàng đêm được cấu hình để nạp tất cả file dữ liệu từ container cloud storage, nơi bản ghi được lưu trong cấu trúc thư mục lồng nhau YYYY/MM/DD. Câu nào mô tả cách nạp dữ liệu hiệu quả?"
  },
  {
    "id": 107,
    "topic": 1,
    "question": "Which statement describes Delta Lake optimized writes?",
    "options": {
      "A": "Before a Jobs cluster terminates, OPTIMIZE is executed on all tables modified during the most recent job.",
      "B": "An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed toward a default of 1 G",
      "C": "Data is queued in a messaging bus instead of committing data directly to memory; all data is committed from the messaging bus in one batch once the job is complete.",
      "D": "Optimized writes use logical partitions instead of directory partitions; because partition boundaries are only represented in metadata, fewer small files are written.",
      "E": "A shuffle occurs prior to writing to try to group similar data together resulting in fewer files instead of each executor writing multiple files based on directory partitions."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ A shuffle occurs prior to writing to try to group similar data together resulting in fewer files instead of each executor writing multiple files based on directory partitions.\n\n❌ Các đáp án sai:\n  A. Before a Jobs cluster terminates, OPTIMIZE is executed on all tables modified during the most recent job.\n  B. An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed toward a defa...\n  C. Data is queued in a messaging bus instead of committing data directly to memory; all data is committed from the messaging bus in one batch once the...\n  D. Optimized writes use logical partitions instead of directory partitions; because partition boundaries are only represented in metadata, fewer small...",
    "question_vi": "Câu nào mô tả tính năng Optimized Writes của Delta Lake?"
  },
  {
    "id": 108,
    "topic": 1,
    "question": "Which statement describes the default execution mode for Databricks Auto Loader?",
    "options": {
      "A": "Cloud vendor-specific queue storage and notification services are configured to track newly arriving files; the target table is materialized by directly querying all valid files in the source directory.",
      "B": "New files are identified by listing the input directory; the target table is materialized by directly querying all valid files in the source directory.",
      "C": "Webhooks trigger a Databricks job to run anytime new data arrives in a source directory; new data are automatically merged into target tables using rules inferred from the data.",
      "D": "New files are identified by listing the input directory; new files are incrementally and idempotently loaded into the target Delta Lake table.",
      "E": "Cloud vendor-specific queue storage and notification services are configured to track newly arriving files; new files are incrementally and idempotently loaded into the target Delta Lake table."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ New files are identified by listing the input directory; new files are incrementally and idempotently loaded into the target Delta Lake table.\n\n❌ Các đáp án sai:\n  A. Cloud vendor-specific queue storage and notification services are configured to track newly arriving files; the target table is materialized by dir...\n  B. New files are identified by listing the input directory; the target table is materialized by directly querying all valid files in the source direct...\n  C. Webhooks trigger a Databricks job to run anytime new data arrives in a source directory; new data are automatically merged into target tables using...\n  E. Cloud vendor-specific queue storage and notification services are configured to track newly arriving files; new files are incrementally and idempot...",
    "question_vi": "Câu nào mô tả chế độ thực thi mặc định của Databricks Auto Loader?"
  },
  {
    "id": 109,
    "topic": 1,
    "question": "A Delta Lake table representing metadata about content posts from users has the following schema: user_id LONG, post_text STRING, post_id STRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE Based on the above schema, which column is a good candidate for partitioning the Delta Table?",
    "options": {
      "A": "post_time",
      "B": "latitude",
      "C": "post_id",
      "D": "user_id",
      "E": "date"
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ date\n\n❌ Các đáp án sai:\n  A. post_time\n  B. latitude\n  C. post_id\n  D. user_id",
    "question_vi": "Bảng Delta Lake đại diện cho metadata về bài đăng nội dung người dùng có schema: user_id LONG, post_text STRING, post_id STRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE. Dựa trên schema trên, cột nào là ứng viên tốt để phân vùng bảng Delta?"
  },
  {
    "id": 110,
    "topic": 1,
    "question": "A large company seeks to implement a near real-time solution involving hundreds of pipelines with parallel updates of many tables with extremely high volume and high velocity data. Which of the following solutions would you implement to achieve this requirement?",
    "options": {
      "A": "Use Databricks High Concurrency clusters, which leverage optimized cloud storage connections to maximize data throughput.",
      "B": "Partition ingestion tables by a small time duration to allow for many data files to be written in parallel.",
      "C": "Configure Databricks to save all data to attached SSD volumes instead of object storage, increasing file I/O significantly.",
      "D": "Isolate Delta Lake tables in their own storage containers to avoid API limits imposed by cloud vendors.",
      "E": "Store all tables in a single database to ensure that the Databricks Catalyst Metastore can load balance overall throughput."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Partition ingestion tables by a small time duration to allow for many data files to be written in parallel.\n\n❌ Các đáp án sai:\n  A. Use Databricks High Concurrency clusters, which leverage optimized cloud storage connections to maximize data throughput.\n  C. Configure Databricks to save all data to attached SSD volumes instead of object storage, increasing file I/O significantly.\n  D. Isolate Delta Lake tables in their own storage containers to avoid API limits imposed by cloud vendors.\n  E. Store all tables in a single database to ensure that the Databricks Catalyst Metastore can load balance overall throughput.",
    "question_vi": "Một công ty lớn muốn triển khai giải pháp gần thời gian thực bao gồm hàng trăm pipeline cập nhật song song nhiều bảng với dữ liệu khối lượng và tốc độ rất cao. Giải pháp nào nên được triển khai để đáp ứng yêu cầu này?"
  },
  {
    "id": 111,
    "topic": 1,
    "question": "Which describes a method of installing a Python package scoped at the notebook level to all nodes in the currently active cluster?",
    "options": {
      "A": "Run source env/bin/activate in a notebook setup script",
      "B": "Use b in a notebook cell",
      "C": "Use %pip install in a notebook cell",
      "D": "Use %sh pip install in a notebook cell",
      "E": "Install libraries from PyPI using the cluster UI"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Use %sh pip install in a notebook cell\n\n❌ Các đáp án sai:\n  A. Run source env/bin/activate in a notebook setup script\n  B. Use b in a notebook cell\n  C. Use %pip install in a notebook cell\n  E. Install libraries from PyPI using the cluster UI",
    "question_vi": "Đáp án nào mô tả phương pháp cài đặt Python package trong phạm vi notebook cho tất cả node trong cluster đang hoạt động?"
  },
  {
    "id": 112,
    "topic": 1,
    "question": "Each configuration below is identical to the extent that each cluster has 400 GB total of RAM 160 total cores and only one Executor per VM. Given an extremely long-running job for which completion must be guaranteed, which cluster configuration will be able to guarantee completion of the job in light of one or more VM failures?",
    "options": {
      "A": "• Total VMs: 8 • 50 GB per Executor • 20 Cores / Executor",
      "B": "• Total VMs: 16 • 25 GB per Executor • 10 Cores / Executor",
      "C": "• Total VMs: 1 • 400 GB per Executor • 160 Cores/Executor",
      "D": "• Total VMs: 4 • 100 GB per Executor • 40 Cores / Executor",
      "E": "• Total VMs: 2 • 200 GB per Executor • 80 Cores / Executor"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ • Total VMs: 4 • 100 GB per Executor • 40 Cores / Executor\n\n❌ Các đáp án sai:\n  A. • Total VMs: 8 • 50 GB per Executor • 20 Cores / Executor\n  B. • Total VMs: 16 • 25 GB per Executor • 10 Cores / Executor\n  C. • Total VMs: 1 • 400 GB per Executor • 160 Cores/Executor\n  E. • Total VMs: 2 • 200 GB per Executor • 80 Cores / Executor",
    "question_vi": "Mỗi cấu hình dưới đây giống nhau: mỗi cluster có 400 GB RAM, 160 core và 1 Executor mỗi VM. Với job chạy cực dài mà việc hoàn thành phải được đảm bảo, cấu hình cluster nào có thể đảm bảo hoàn thành job khi có một hoặc nhiều VM bị lỗi?"
  },
  {
    "id": 113,
    "topic": 1,
    "question": "A Delta Lake table in the Lakehouse named customer_churn_params is used in churn prediction by the machine learning team. The table contains information about customers derived from a number of upstream sources. Currently, the data engineering team populates this table nightly by overwriting the table with the current valid values derived from upstream data sources. Immediately after each update succeeds, the data engineering team would like to determine the difference between the new version and the previous version of the table. Given the current implementation, which method can be used?",
    "options": {
      "A": "Execute a query to calculate the difference between the new version and the previous version using Delta Lake’s built-in versioning and lime travel functionality.",
      "B": "Parse the Delta Lake transaction log to identify all newly written data files.",
      "C": "Parse the Spark event logs to identify those rows that were updated, inserted, or deleted.",
      "D": "Execute DESCRIBE HISTORY customer_churn_params to obtain the full operation metrics for the update, including a log of all records that have been added or modified.",
      "E": "Use Delta Lake’s change data feed to identify those records that have been updated, inserted, or deleted."
    },
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n→ Use Delta Lake’s change data feed to identify those records that have been updated, inserted, or deleted.\n\n❌ Các đáp án sai:\n  A. Execute a query to calculate the difference between the new version and the previous version using Delta Lake’s built-in versioning and lime travel...\n  B. Parse the Delta Lake transaction log to identify all newly written data files.\n  C. Parse the Spark event logs to identify those rows that were updated, inserted, or deleted.\n  D. Execute DESCRIBE HISTORY customer_churn_params to obtain the full operation metrics for the update, including a log of all records that have been a...",
    "question_vi": "Bảng customer_churn_params trong Lakehouse được nhóm ML sử dụng cho dự đoán churn. Bảng chứa thông tin khách hàng từ nhiều nguồn thượng nguồn. Hiện tại, nhóm kỹ thuật dữ liệu cập nhật bảng hàng đêm bằng cách ghi đè với giá trị hiện hành. Mô hình churn ổn định trong production. Nhóm chỉ quan tâm dự đoán bản ghi thay đổi trong 24 giờ qua. Cách tiếp cận nào đơn giản hóa xác định bản ghi đã thay đổi?"
  },
  {
    "id": 114,
    "topic": 1,
    "question": "A data team’s Structured Streaming job is configured to calculate running aggregates for item sales to update a downstream marketing dashboard. The marketing team has introduced a new promotion, and they would like to add a new field to track the number of times this promotion code is used for each item. A junior data engineer suggests updating the existing query as follows. Note that proposed changes are in bold. Original query: Proposed query: Which step must also be completed to put the proposed query into production?",
    "options": {
      "A": "Specify a new checkpointLocation",
      "B": "Remove .option('mergeSchema', 'true') from the streaming write",
      "C": "Increase the shuffle partitions to account for additional aggregates",
      "D": "Run REFRESH TABLE delta.‛/item_agg‛"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Specify a new checkpointLocation\n\n❌ Các đáp án sai:\n  B. Remove .option('mergeSchema', 'true') from the streaming write\n  C. Increase the shuffle partitions to account for additional aggregates\n  D. Run REFRESH TABLE delta.‛/item_agg‛",
    "question_vi": "Structured Streaming job của nhóm dữ liệu được cấu hình để tính aggregates liên tục cho doanh số sản phẩm cập nhật dashboard marketing. Nhóm marketing giới thiệu khuyến mãi mới và muốn thêm trường theo dõi số lần mã khuyến mãi được sử dụng cho mỗi sản phẩm. Kỹ sư mới đề xuất cập nhật schema streaming query. Câu nào mô tả kết quả?"
  },
  {
    "id": 115,
    "topic": 1,
    "question": "When using CLI or REST API to get results from jobs with multiple tasks, which statement correctly describes the response structure?",
    "options": {
      "A": "Each run of a job will have a unique job_id; all tasks within this job will have a unique job_id",
      "B": "Each run of a job will have a unique job_id; all tasks within this job will have a unique task_id",
      "C": "Each run of a job will have a unique orchestration_id; all tasks within this job will have a unique run_id",
      "D": "Each run of a job will have a unique run_id; all tasks within this job will have a unique task_id",
      "E": "Each run of a job will have a unique run_id; all tasks within this job will also have a unique run_id"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Each run of a job will have a unique run_id; all tasks within this job will have a unique task_id\n\n❌ Các đáp án sai:\n  A. Each run of a job will have a unique job_id; all tasks within this job will have a unique job_id\n  B. Each run of a job will have a unique job_id; all tasks within this job will have a unique task_id\n  C. Each run of a job will have a unique orchestration_id; all tasks within this job will have a unique run_id\n  E. Each run of a job will have a unique run_id; all tasks within this job will also have a unique run_id",
    "question_vi": "Khi sử dụng CLI hoặc REST API để lấy kết quả từ jobs có nhiều tasks, câu nào mô tả đúng cấu trúc phản hồi?"
  },
  {
    "id": 116,
    "topic": 1,
    "question": "The data engineering team is configuring environments for development, testing, and production before beginning migration on a new data pipeline. The team requires extensive testing on both the code and data resulting from code execution, and the team wants to develop and test against data as similar to production data as possible. A junior data engineer suggests that production data can be mounted to the development and testing environments, allowing pre-production code to execute against production data. Because all users have admin privileges in the development environment, the junior data engineer has offered to configure permissions and mount this data for the team. Which statement captures best practices for this situation?",
    "options": {
      "A": "All development, testing, and production code and data should exist in a single, unified workspace; creating separate environments for testing and development complicates administrative overhead.",
      "B": "In environments where interactive code will be executed, production data should only be accessible with read permissions; creating isolated databases for each environment further reduces risks.",
      "C": "As long as code in the development environment declares USE dev_db at the top of each notebook, there is no possibility of inadvertently committing changes back to production data sources.",
      "D": "Because Delta Lake versions all data and supports time travel, it is not possible for user error or malicious actors to permanently delete production data; as such, it is generally safe to mount production data anywhere.",
      "E": "Because access to production data will always be verified using passthrough credentials, it is safe to mount data to any Databricks development environment."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ In environments where interactive code will be executed, production data should only be accessible with read permissions; creating isolated databases for each environment further reduces risks.\n\n❌ Các đáp án sai:\n  A. All development, testing, and production code and data should exist in a single, unified workspace; creating separate environments for testing and ...\n  C. As long as code in the development environment declares USE dev_db at the top of each notebook, there is no possibility of inadvertently committing...\n  D. Because Delta Lake versions all data and supports time travel, it is not possible for user error or malicious actors to permanently delete producti...\n  E. Because access to production data will always be verified using passthrough credentials, it is safe to mount data to any Databricks development env...",
    "question_vi": "Nhóm kỹ thuật dữ liệu đang cấu hình môi trường development, testing và production trước khi bắt đầu migrate pipeline mới. Nhóm yêu cầu test mã kỹ lưỡng và muốn phát triển, test với dữ liệu gần giống production nhất có thể. Kỹ sư mới đề xuất sử dụng clone của bảng production. Câu nào mô tả cách tiếp cận phù hợp nhất?"
  },
  {
    "id": 117,
    "topic": 1,
    "question": "A data engineer, User A, has promoted a pipeline to production by using the REST API to programmatically create several jobs. A DevOps engineer, User B, has configured an external orchestration tool to trigger job runs through the REST API. Both users authorized the REST API calls using their personal access tokens. A workspace admin, User C, inherits responsibility for managing this pipeline. User C uses the Databricks Jobs UI to take \"Owner\" privileges of each job. Jobs continue to be triggered using the credentials and tooling configured by User",
    "options": {
      "B": "User B’s email address will always appear in this field, as their credentials are always used to trigger the run.",
      "A": "Once User C takes \"Owner\" privileges, their email address will appear in this field; prior to this, User A’s email address will appear in this field.",
      "C": "User A’s email address will always appear in this field, as they still own the underlying notebooks.",
      "D": "Once User C takes \"Owner\" privileges, their email address will appear in this field; prior to this, User B’s email address will appear in this field.",
      "E": "User C will only ever appear in this field if they manually trigger the job, otherwise it will indicate User B."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ User A’s email address will always appear in this field, as they still own the underlying notebooks.\n\n❌ Các đáp án sai:\n  A. Once User C takes \"Owner\" privileges, their email address will appear in this field; prior to this, User A’s email address will appear in this field.\n  B. User B’s email address will always appear in this field, as their credentials are always used to trigger the run.\n  D. Once User C takes \"Owner\" privileges, their email address will appear in this field; prior to this, User B’s email address will appear in this field.\n  E. User C will only ever appear in this field if they manually trigger the job, otherwise it will indicate User B.",
    "question_vi": "Kỹ sư dữ liệu, User A, đã đưa pipeline lên production bằng REST API để tạo jobs. Kỹ sư DevOps, User B, đã cấu hình công cụ điều phối bên ngoài để kích hoạt job runs qua REST API. Cả hai dùng personal access token. Quản trị viên workspace, User C, kế thừa pipeline. Câu nào mô tả kết quả?"
  },
  {
    "id": 118,
    "topic": 1,
    "question": "A member of the data engineering team has submitted a short notebook that they wish to schedule as part of a larger data pipeline. Assume that the commands provided below produce the logically correct results when run as presented. Which command should be removed from the notebook before scheduling it as a job?",
    "options": {
      "A": "Cmd 2",
      "B": "Cmd 3",
      "C": "Cmd 4",
      "D": "Cmd 5"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Cmd 5\n\n❌ Các đáp án sai:\n  A. Cmd 2\n  B. Cmd 3\n  C. Cmd 4",
    "question_vi": "Một thành viên nhóm kỹ thuật đã gửi notebook ngắn muốn lập lịch như phần của pipeline lớn. Giả sử các lệnh cho kết quả đúng khi chạy. Lệnh nào nên được loại bỏ trước khi lập lịch?"
  },
  {
    "id": 119,
    "topic": 1,
    "question": "Which statement regarding Spark configuration on the Databricks platform is true?",
    "options": {
      "A": "The Databricks REST API can be used to modify the Spark configuration properties for an interactive cluster without interrupting jobs currently running on the cluster.",
      "B": "Spark configurations set within a notebook will affect all SparkSessions attached to the same interactive cluster.",
      "C": "When the same Spark configuration property is set for an interactive cluster and a notebook attached to that cluster, the notebook setting will always be ignored.",
      "D": "Spark configuration properties set for an interactive cluster with the Clusters UI will impact all notebooks attached to that cluster."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Spark configuration properties set for an interactive cluster with the Clusters UI will impact all notebooks attached to that cluster.\n\n❌ Các đáp án sai:\n  A. The Databricks REST API can be used to modify the Spark configuration properties for an interactive cluster without interrupting jobs currently run...\n  B. Spark configurations set within a notebook will affect all SparkSessions attached to the same interactive cluster.\n  C. When the same Spark configuration property is set for an interactive cluster and a notebook attached to that cluster, the notebook setting will alw...",
    "question_vi": "Câu nào về cấu hình Spark trên nền tảng Databricks là đúng?"
  },
  {
    "id": 120,
    "topic": 1,
    "question": "The business reporting team requires that data for their dashboards be updated every hour. The total processing time for the pipeline that extracts, transforms, and loads the data for their pipeline runs in 10 minutes. Assuming normal operating conditions, which configuration will meet their service-level agreement requirements with the lowest cost?",
    "options": {
      "A": "Configure a job that executes every time new data lands in a given directory",
      "B": "Schedule a job to execute the pipeline once an hour on a new job cluster",
      "C": "Schedule a Structured Streaming job with a trigger interval of 60 minutes",
      "D": "Schedule a job to execute the pipeline once an hour on a dedicated interactive cluster"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Schedule a job to execute the pipeline once an hour on a new job cluster\n\n❌ Các đáp án sai:\n  A. Configure a job that executes every time new data lands in a given directory\n  C. Schedule a Structured Streaming job with a trigger interval of 60 minutes\n  D. Schedule a job to execute the pipeline once an hour on a dedicated interactive cluster",
    "question_vi": "Nhóm báo cáo kinh doanh yêu cầu dữ liệu dashboard được cập nhật mỗi giờ. Pipeline xử lý chạy trong 10 phút. Giả sử điều kiện bình thường, cấu hình nào đáp ứng SLA với chi phí thấp nhất?"
  },
  {
    "id": 121,
    "topic": 1,
    "question": "A Databricks SQL dashboard has been configured to monitor the total number of records present in a collection of Delta Lake tables using the following query pattern: SELECT COUNT (*) FROM table - Which of the following describes how results are generated each time the dashboard is updated?",
    "options": {
      "A": "The total count of rows is calculated by scanning all data files",
      "B": "The total count of rows will be returned from cached results unless REFRESH is run",
      "C": "The total count of records is calculated from the Delta transaction logs",
      "D": "The total count of records is calculated from the parquet file metadata"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ The total count of rows is calculated by scanning all data files\n\n❌ Các đáp án sai:\n  B. The total count of rows will be returned from cached results unless REFRESH is run\n  C. The total count of records is calculated from the Delta transaction logs\n  D. The total count of records is calculated from the parquet file metadata",
    "question_vi": "Nhóm kỹ thuật dữ liệu đã cấu hình cluster production all-purpose với Auto Scaling. Cluster được chia sẻ bởi tất cả thành viên trong nhóm. Nhóm DevOps nhận thấy cluster hiếm khi tắt tự động trong giờ làm việc. Thay đổi nào giúp giảm chi phí?"
  },
  {
    "id": 122,
    "topic": 1,
    "question": "A Delta Lake table was created with the below query: Consider the following query: DROP TABLE prod.sales_by_store - If this statement is executed by a workspace admin, which result will occur?",
    "options": {
      "A": "Data will be marked as deleted but still recoverable with Time Travel.",
      "B": "The table will be removed from the catalog but the data will remain in storage.",
      "C": "The table will be removed from the catalog and the data will be deleted.",
      "D": "An error will occur because Delta Lake prevents the deletion of production data."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The table will be removed from the catalog but the data will remain in storage.\n\n❌ Các đáp án sai:\n  A. Data will be marked as deleted but still recoverable with Time Travel.\n  C. The table will be removed from the catalog and the data will be deleted.\n  D. An error will occur because Delta Lake prevents the deletion of production data.",
    "question_vi": "Đội kỹ thuật dữ liệu đang đánh giá quy trình hiện tại cho pipeline sử dụng Auto Loader để nạp tệp JSON lồng nhau. Câu nào mô tả đúng cách Auto Loader xử lý schema inference cho JSON lồng nhau?"
  },
  {
    "id": 123,
    "topic": 1,
    "question": "A developer has successfully configured their credentials for Databricks Repos and cloned a remote Git repository. They do not have privileges to make changes to the main branch, which is the only branch currently visible in their workspace. Which approach allows this user to share their code updates without the risk of overwriting the work of their teammates?",
    "options": {
      "A": "Use Repos to create a new branch, commit all changes, and push changes to the remote Git repository.",
      "B": "Use Repos to create a fork of the remote repository, commit all changes, and make a pull request on the source repository.",
      "C": "Use Repos to pull changes from the remote Git repository; commit and push changes to a branch that appeared as changes were pulled.",
      "D": "Use Repos to merge all differences and make a pull request back to the remote repository."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Use Repos to create a new branch, commit all changes, and push changes to the remote Git repository.\n\n❌ Các đáp án sai:\n  B. Use Repos to create a fork of the remote repository, commit all changes, and make a pull request on the source repository.\n  C. Use Repos to pull changes from the remote Git repository; commit and push changes to a branch that appeared as changes were pulled.\n  D. Use Repos to merge all differences and make a pull request back to the remote repository.",
    "question_vi": "Một kỹ sư dữ liệu đang phát triển pipeline sử dụng APPLY CHANGES INTO trong DLT để xử lý CDC feeds. Câu nào mô tả đúng cách sử dụng APPLY CHANGES INTO cho SCD Type 2?"
  },
  {
    "id": 124,
    "topic": 1,
    "question": "The security team is exploring whether or not the Databricks secrets module can be leveraged for connecting to an external database. After testing the code with all Python variables being defined with strings, they upload the password to the secrets module and configure the correct permissions for the currently active user. They then modify their code to the following (leaving all other variables unchanged). Which statement describes what will happen when the above code is executed?",
    "options": {
      "A": "The connection to the external table will succeed; the string \"REDACTED\" will be printed.",
      "B": "An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the encoded password will be saved to DBFS.",
      "C": "An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the password will be printed in plain text.",
      "D": "The connection to the external table will succeed; the string value of password will be printed in plain text."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ The connection to the external table will succeed; the string \"REDACTED\" will be printed.\n\n❌ Các đáp án sai:\n  B. An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the encoded password will ...\n  C. An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the password will be print...\n  D. The connection to the external table will succeed; the string value of password will be printed in plain text.",
    "question_vi": "Câu nào mô tả đặc trưng chung của mô hình lập trình Spark Structured Streaming?"
  },
  {
    "id": 125,
    "topic": 1,
    "question": "The data science team has created and logged a production model using MLflow. The model accepts a list of column names and returns a new column of type DOUBL",
    "options": {
      "E": "The following code correctly imports the production model, loads the customers table containing the customer_id key column into a DataFrame, and defines the feature columns needed for the model. Which code block will output a DataFrame with the schema \"customer_id LONG, predictions DOUBLE\"?",
      "A": "df.map(lambda x:model(x[columns])).select(\"customer_id, predictions\")",
      "B": "df.select(\"customer_id\", model(*columns).alias(\"predictions\"))",
      "C": "model.predict(df, columns)",
      "D": "df.apply(model, columns).select(\"customer_id, predictions\")"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ df.select(\"customer_id\", model(*columns).alias(\"predictions\"))\n\n❌ Các đáp án sai:\n  A. df.map(lambda x:model(x[columns])).select(\"customer_id, predictions\")\n  C. model.predict(df, columns)\n  D. df.apply(model, columns).select(\"customer_id, predictions\")\n  E. The following code correctly imports the production model, loads the customers table containing the customer_id key column into a DataFrame, and de...",
    "question_vi": "Đoạn mã sau sử dụng DLT với expectations. Câu nào mô tả đúng cách expectations hoạt động khi một bản ghi vi phạm?"
  },
  {
    "id": 126,
    "topic": 1,
    "question": "A junior member of the data engineering team is exploring the language interoperability of Databricks notebooks. The intended outcome of the below code is to register a view of all sales that occurred in countries on the continent of Africa that appear in the geo_lookup table. Before executing the code, running SHOW TABLES on the current database indicates the database contains only two tables: geo_lookup and sales. What will be the outcome of executing these command cells m order m an interactive notebook?",
    "options": {
      "A": "Both commands will succeed. Executing SHOW TABLES will show that countries_af and sales_af have been registered as views.",
      "B": "Cmd 1 will succeed. Cmd 2 will search all accessible databases for a table or view named countries_af: if this entity exists, Cmd 2 will succeed.",
      "C": "Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable representing a PySpark DataFrame.",
      "D": "Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable containing a list of strings."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable containing a list of strings.\n\n❌ Các đáp án sai:\n  A. Both commands will succeed. Executing SHOW TABLES will show that countries_af and sales_af have been registered as views.\n  B. Cmd 1 will succeed. Cmd 2 will search all accessible databases for a table or view named countries_af: if this entity exists, Cmd 2 will succeed.\n  C. Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable representing a PySpark DataFrame.",
    "question_vi": "Tham số cấu hình nào ảnh hưởng trực tiếp đến kích thước spark-partition khi nạp dữ liệu vào Spark?"
  },
  {
    "id": 127,
    "topic": 1,
    "question": "The data science team has requested assistance in accelerating queries on free-form text from user reviews. The data is currently stored in Parquet with the below schema: item_id INT, user_id INT, review_id INT, rating FLOAT, review STRING The review column contains the full text of the review left by the user. Specifically, the data science team is looking to identify if any of 30 key words exist in this field. A junior data engineer suggests converting this data to Delta Lake will improve query performance. Which response to the junior data engineer’s suggestion is correct?",
    "options": {
      "A": "Delta Lake statistics are not optimized for free text fields with high cardinality.",
      "B": "Delta Lake statistics are only collected on the first 4 columns in a table.",
      "C": "ZORDER ON review will need to be run to see performance gains.",
      "D": "The Delta log creates a term matrix for free text fields to support selective filtering."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Delta Lake statistics are not optimized for free text fields with high cardinality.\n\n❌ Các đáp án sai:\n  B. Delta Lake statistics are only collected on the first 4 columns in a table.\n  C. ZORDER ON review will need to be run to see performance gains.\n  D. The Delta log creates a term matrix for free text fields to support selective filtering.",
    "question_vi": "Một kỹ sư dữ liệu đang cấu hình workload batch sản xuất mới cần lấy dữ liệu từ external object storage sử dụng Unity Catalog. Kỹ sư có CREATE TABLE trên catalog và schema hiện tại. Đáp án nào hoàn thành nhiệm vụ?"
  },
  {
    "id": 128,
    "topic": 1,
    "question": "The data engineering team has configured a job to process customer requests to be forgotten (have their data deleted). All user data that needs to be deleted is stored in Delta Lake tables using default table settings. The team has decided to process all deletions from the previous week as a batch job at 1am each Sunday. The total duration of this job is less than one hour. Every Monday at 3am, a batch job executes a series of VACUUM commands on all Delta Lake tables throughout the organization. The compliance officer has recently learned about Delta Lake's time travel functionality. They are concerned that this might allow continued access to deleted data. Assuming all delete logic is correctly implemented, which statement correctly addresses this concern?",
    "options": {
      "A": "Because the VACUUM command permanently deletes all files containing deleted records, deleted records may be accessible with time travel for around 24 hours.",
      "B": "Because the default data retention threshold is 24 hours, data files containing deleted records will be retained until the VACUUM job is run the following day.",
      "C": "Because the default data retention threshold is 7 days, data files containing deleted records will be retained until the VACUUM job is run 8 days later.",
      "D": "Because Delta Lake's delete statements have ACID guarantees, deleted records will be permanently purged from all storage systems as soon as a delete job completes."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Because the default data retention threshold is 7 days, data files containing deleted records will be retained until the VACUUM job is run 8 days later.\n\n❌ Các đáp án sai:\n  A. Because the VACUUM command permanently deletes all files containing deleted records, deleted records may be accessible with time travel for around ...\n  B. Because the default data retention threshold is 24 hours, data files containing deleted records will be retained until the VACUUM job is run the fo...\n  D. Because Delta Lake's delete statements have ACID guarantees, deleted records will be permanently purged from all storage systems as soon as a delet...",
    "question_vi": "Một Spark job mất nhiều thời gian hơn dự kiến. Spark UI cho thấy Min và Median Duration cho tasks gần bằng nhau, nhưng Max Duration dài gấp khoảng 100 lần minimum. Tình huống nào gây ra thời gian kéo dài?"
  },
  {
    "id": 129,
    "topic": 1,
    "question": "Assuming that the Databricks CLI has been installed and configured correctly, which Databricks CLI command can be used to upload a custom Python Wheel to object storage mounted with the DBFS for use with a production job?",
    "options": {
      "A": "configure",
      "B": "fs",
      "C": "workspace",
      "D": "libraries"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ fs\n\n❌ Các đáp án sai:\n  A. configure\n  C. workspace\n  D. libraries",
    "question_vi": "Mỗi cấu hình dưới đây giống nhau: mỗi cluster có 400 GB RAM, 160 core, 1 Executor mỗi VM. Với job có ít nhất một wide transformation, cấu hình cluster nào cho hiệu suất tối đa?"
  },
  {
    "id": 130,
    "topic": 1,
    "question": "The following table consists of items found in user carts within an e-commerce website. The following MERGE statement is used to update this table using an updates view, with schema evolution enabled on this table. How would the following update be handled?",
    "options": {
      "A": "The update throws an error because changes to existing columns in the target schema are not supported.",
      "B": "The new nested Field is added to the target schema, and dynamically read as NULL for existing unmatched records.",
      "C": "The update is moved to a separate \"rescued\" column because it is missing a column expected in the target schema.",
      "D": "The new nested field is added to the target schema, and files underlying existing records are updated to include NULL values for the new field."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The new nested Field is added to the target schema, and dynamically read as NULL for existing unmatched records.\n\n❌ Các đáp án sai:\n  A. The update throws an error because changes to existing columns in the target schema are not supported.\n  C. The update is moved to a separate \"rescued\" column because it is missing a column expected in the target schema.\n  D. The new nested field is added to the target schema, and files underlying existing records are updated to include NULL values for the new field.",
    "question_vi": "Một kỹ sư dữ liệu mới đã triển khai khối mã sau. View new_events chứa lô bản ghi cùng schema với bảng Delta events. Trường event_id là khóa duy nhất. Khi truy vấn thực thi, điều gì xảy ra với bản ghi mới có cùng event_id với bản ghi hiện có?"
  },
  {
    "id": 131,
    "topic": 1,
    "question": "An upstream system is emitting change data capture (CDC) logs that are being written to a cloud object storage directory. Each record in the log indicates the change type (insert, update, or delete) and the values for each field after the change. The source table has a primary key identified by the field pk_id. For auditing purposes, the data governance team wishes to maintain a full record of all values that have ever been valid in the source system. For analytical purposes, only the most recent value for each record needs to be recorded. The Databricks job to ingest these records occurs once per hour, but each individual record may have changed multiple times over the course of an hour. Which solution meets these requirements?",
    "options": {
      "A": "Iterate through an ordered set of changes to the table, applying each in turn to create the current state of the table, (insert, update, delete), timestamp of change, and the values.",
      "B": "Use merge into to insert, update, or delete the most recent entry for each pk_id into a table, then propagate all changes throughout the system.",
      "C": "Deduplicate records in each batch by pk_id and overwrite the target table.",
      "D": "Use Delta Lake’s change data feed to automatically process CDC data from an external system, propagating all changes to all dependent tables in the Lakehouse."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Iterate through an ordered set of changes to the table, applying each in turn to create the current state of the table, (insert, update, delete), timestamp of change, and the values.\n\n❌ Các đáp án sai:\n  B. Use merge into to insert, update, or delete the most recent entry for each pk_id into a table, then propagate all changes throughout the system.\n  C. Deduplicate records in each batch by pk_id and overwrite the target table.\n  D. Use Delta Lake’s change data feed to automatically process CDC data from an external system, propagating all changes to all dependent tables in the...",
    "question_vi": "Kỹ sư dữ liệu đang thiết kế pipeline xử lý dữ liệu từ nhiều nguồn. Cần đảm bảo dữ liệu trùng lặp được loại bỏ và chỉ nạp dữ liệu mới. Đáp án nào mô tả cách tiếp cận tốt nhất?"
  },
  {
    "id": 132,
    "topic": 1,
    "question": "An hourly batch job is configured to ingest data files from a cloud object storage container where each batch represent all records produced by the source system in a given hour. The batch job to process these records into the Lakehouse is sufficiently delayed to ensure no late-arriving data is missed. The user_id field represents a unique key for the data, which has the following schema: user_id BIGINT, username STRING, user_utc STRING, user_region STRING, last_login BIGINT, auto_pay BOOLEAN, last_updated BIGINT New records are all ingested into a table named account_history which maintains a full record of all data in the same schema as the source. The next table in the system is named account_current and is implemented as a Type 1 table representing the most recent value for each unique user_id. Which implementation can be used to efficiently update the described account_current table as part of each hourly batch job assuming there are millions of user accounts and tens of thousands of records processed hourly?",
    "options": {
      "A": "Filter records in account_history using the last_updated field and the most recent hour processed, making sure to deduplicate on username; write a merge statement to update or insert the most recent value for each username.",
      "B": "Use Auto Loader to subscribe to new files in the account_history directory; configure a Structured Streaming trigger available job to batch update newly detected files into the account_current table.",
      "C": "Overwrite the account_current table with each batch using the results of a query against the account_history table grouping by user_id and filtering for the max value of last_updated.",
      "D": "Filter records in account_history using the last_updated field and the most recent hour processed, as well as the max last_login by user_id write a merge statement to update or insert the most recent value for each user_id."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Filter records in account_history using the last_updated field and the most recent hour processed, as well as the max last_login by user_id write a merge statement to update or insert the most recent value for each user_id.\n\n❌ Các đáp án sai:\n  A. Filter records in account_history using the last_updated field and the most recent hour processed, making sure to deduplicate on username; write a ...\n  B. Use Auto Loader to subscribe to new files in the account_history directory; configure a Structured Streaming trigger available job to batch update ...\n  C. Overwrite the account_current table with each batch using the results of a query against the account_history table grouping by user_id and filterin...",
    "question_vi": "Quản trị viên Databricks workspace đã cấu hình cluster tương tác cho từng nhóm kỹ thuật dữ liệu. Để kiểm soát chi phí, cluster tự tắt sau 30 phút không hoạt động. Người dùng cần chạy workload bất cứ lúc nào. Quyền tối thiểu nào cần để khởi động và gắn vào cluster đã cấu hình?"
  },
  {
    "id": 133,
    "topic": 1,
    "question": "The business intelligence team has a dashboard configured to track various summary metrics for retail stores. This includes total sales for the previous day alongside totals and averages for a variety of time periods. The fields required to populate this dashboard have the following schema: For demand forecasting, the Lakehouse contains a validated table of all itemized sales updated incrementally in near real-time. This table, named products_per_order, includes the following fields: Because reporting on long-term sales trends is less volatile, analysts using the new dashboard only require data to be refreshed once daily. Because the dashboard will be queried interactively by many users throughout a normal business day, it should return results quickly and reduce total compute associated with each materialization. Which solution meets the expectations of the end users while controlling and limiting possible costs?",
    "options": {
      "A": "Populate the dashboard by configuring a nightly batch job to save the required values as a table overwritten with each update.",
      "B": "Use Structured Streaming to configure a live dashboard against the products_per_order table within a Databricks notebook.",
      "C": "Define a view against the products_per_order table and define the dashboard against this view.",
      "D": "Use the Delta Cache to persist the products_per_order table in memory to quickly update the dashboard with each query."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Populate the dashboard by configuring a nightly batch job to save the required values as a table overwritten with each update.\n\n❌ Các đáp án sai:\n  B. Use Structured Streaming to configure a live dashboard against the products_per_order table within a Databricks notebook.\n  C. Define a view against the products_per_order table and define the dashboard against this view.\n  D. Use the Delta Cache to persist the products_per_order table in memory to quickly update the dashboard with each query.",
    "question_vi": "Đoạn SQL DDL sau được thực thi để tạo bảng: Câu nào mô tả đúng kết quả khi sử dụng CREATE OR REPLACE TABLE?"
  },
  {
    "id": 134,
    "topic": 1,
    "question": "A Delta lake table with CDF enabled table in the Lakehouse named customer_churn_params is used in churn prediction by the machine learning team. The table contains information about customers derived from a number of upstream sources. Currently, the data engineering team populates this table nightly by overwriting the table with the current valid values derived from upstream data sources. The churn prediction model used by the ML team is fairly stable in production. The team is only interested in making predictions on records that have changed in the past 24 hours. Which approach would simplify the identification of these changed records?",
    "options": {
      "A": "Apply the churn model to all rows in the customer_churn_params table, but implement logic to perform an upsert into the predictions table that ignores rows where predictions have not changed.",
      "B": "Convert the batch job to a Structured Streaming job using the complete output mode; configure a Structured Streaming job to read from the customer_churn_params table and incrementally predict against the churn model.",
      "C": "Replace the current overwrite logic with a merge statement to modify only those records that have changed; write logic to make predictions on the changed records identified by the change data feed.",
      "D": "Modify the overwrite logic to include a field populated by calling spark.sql.functions.current_timestamp() as data are being written; use this field to identify records written on a particular date."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Replace the current overwrite logic with a merge statement to modify only those records that have changed; write logic to make predictions on the changed records identified by the change data feed.\n\n❌ Các đáp án sai:\n  A. Apply the churn model to all rows in the customer_churn_params table, but implement logic to perform an upsert into the predictions table that igno...\n  B. Convert the batch job to a Structured Streaming job using the complete output mode; configure a Structured Streaming job to read from the customer_...\n  D. Modify the overwrite logic to include a field populated by calling spark.sql.functions.current_timestamp() as data are being written; use this fiel...",
    "question_vi": "Một kỹ sư dữ liệu đang review cấu hình DLT pipeline. Câu nào mô tả đúng sự khác nhau giữa streaming table và materialized view trong DLT?"
  },
  {
    "id": 135,
    "topic": 1,
    "question": "A view is registered with the following code: Both users and orders are Delta Lake tables. Which statement describes the results of querying recent_orders?",
    "options": {
      "A": "All logic will execute when the view is defined and store the result of joining tables to the DBFS; this stored data will be returned when the view is queried.",
      "B": "Results will be computed and cached when the view is defined; these cached results will incrementally update as new records are inserted into source tables.",
      "C": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query finishes.",
      "D": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query began."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query began.\n\n❌ Các đáp án sai:\n  A. All logic will execute when the view is defined and store the result of joining tables to the DBFS; this stored data will be returned when the view...\n  B. Results will be computed and cached when the view is defined; these cached results will incrementally update as new records are inserted into sourc...\n  C. All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query finishes.",
    "question_vi": "Nhóm kỹ thuật dữ liệu cần thiết kế pipeline cho workload batch và streaming. Đáp án nào mô tả khi nào nên dùng batch vs streaming?"
  },
  {
    "id": 136,
    "topic": 1,
    "question": "A data ingestion task requires a one-TB JSON dataset to be written out to Parquet with a target part-file size of 512 M",
    "options": {
      "B": "Set spark.sql.shuffle.partitions to 2,048 partitions (1TB*1024*1024/512), ingest the data, execute the narrow transformations, optimize the data by sorting it (which automatically repartitions the data), and then write to parquet.",
      "A": "Set spark.sql.files.maxPartitionBytes to 512 MB, ingest the data, execute the narrow transformations, and then write to parquet.",
      "C": "Set spark.sql.adaptive.advisoryPartitionSizeInBytes to 512 MB bytes, ingest the data, execute the narrow transformations, coalesce to 2,048 partitions (1TB*1024*1024/512), and then write to parquet.",
      "D": "Ingest the data, execute the narrow transformations, repartition to 2,048 partitions (1TB* 1024*1024/512), and then write to parquet."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Set spark.sql.files.maxPartitionBytes to 512 MB, ingest the data, execute the narrow transformations, and then write to parquet.\n\n❌ Các đáp án sai:\n  B. Set spark.sql.shuffle.partitions to 2,048 partitions (1TB*1024*1024/512), ingest the data, execute the narrow transformations, optimize the data by...\n  C. Set spark.sql.adaptive.advisoryPartitionSizeInBytes to 512 MB bytes, ingest the data, execute the narrow transformations, coalesce to 2,048 partiti...\n  D. Ingest the data, execute the narrow transformations, repartition to 2,048 partitions (1TB* 1024*1024/512), and then write to parquet.",
    "question_vi": "Một kỹ sư dữ liệu đang xem lại cấu hình Auto Loader. Câu nào mô tả đúng sự khác biệt giữa COPY INTO và Auto Loader?"
  },
  {
    "id": 137,
    "topic": 1,
    "question": "Which statement regarding stream-static joins and static Delta tables is correct?",
    "options": {
      "A": "The checkpoint directory will be used to track updates to the static Delta table.",
      "B": "Each microbatch of a stream-static join will use the most recent version of the static Delta table as of the job's initialization.",
      "C": "The checkpoint directory will be used to track state information for the unique keys present in the join.",
      "D": "Stream-static joins cannot use static Delta tables because of consistency issues."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Each microbatch of a stream-static join will use the most recent version of the static Delta table as of the job's initialization.\n\n❌ Các đáp án sai:\n  A. The checkpoint directory will be used to track updates to the static Delta table.\n  C. The checkpoint directory will be used to track state information for the unique keys present in the join.\n  D. Stream-static joins cannot use static Delta tables because of consistency issues.",
    "question_vi": "Một bảng Delta Lake đã được tạo. Đoạn mã OPTIMIZE được chạy trên bảng. Câu nào mô tả kết quả của việc chạy OPTIMIZE?"
  },
  {
    "id": 138,
    "topic": 1,
    "question": "A junior data engineer has been asked to develop a streaming data pipeline with a grouped aggregation using DataFrame df. The pipeline needs to calculate the average humidity and average temperature for each non-overlapping five-minute interval. Events are recorded once per minute per device. Streaming DataFrame df has the following schema: \"device_id INT, event_time TIMESTAMP, temp FLOAT, humidity FLOAT\" Code block: Which line of code correctly fills in the blank within the code block to complete this task?",
    "options": {
      "A": "to_interval(\"event_time\", \"5 minutes\").alias(\"time\")",
      "B": "window(\"event_time\", \"5 minutes\").alias(\"time\")",
      "C": "\"event_time\"",
      "D": "lag(\"event_time\", \"10 minutes\").alias(\"time\")"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ window(\"event_time\", \"5 minutes\").alias(\"time\")\n\n❌ Các đáp án sai:\n  A. to_interval(\"event_time\", \"5 minutes\").alias(\"time\")\n  C. \"event_time\"\n  D. lag(\"event_time\", \"10 minutes\").alias(\"time\")",
    "question_vi": "Nhóm kỹ thuật dữ liệu đang cấu hình monitoring cho DLT pipeline. Câu nào mô tả các chỉ số có sẵn để theo dõi hiệu suất pipeline?"
  },
  {
    "id": 139,
    "topic": 1,
    "question": "A Structured Streaming job deployed to production has been resulting in higher than expected cloud storage costs. At present, during normal execution, each microbatch of data is processed in less than 3s; at least 12 times per minute, a microbatch is processed that contains 0 records. The streaming write was configured using the default trigger settings. The production job is currently scheduled alongside many other Databricks jobs in a workspace with instance pools provisioned to reduce start-up time for jobs with batch execution. Holding all other variables constant and assuming records need to be processed in less than 10 minutes, which adjustment will meet the requirement?",
    "options": {
      "A": "Set the trigger interval to 3 seconds; the default trigger interval is consuming too many records per batch, resulting in spill to disk that can increase volume costs.",
      "B": "Use the trigger once option and configure a Databricks job to execute the query every 10 minutes; this approach minimizes costs for both compute and storage.",
      "C": "Set the trigger interval to 10 minutes; each batch calls APIs in the source storage account, so decreasing trigger frequency to maximum allowable threshold should minimize this cost.",
      "D": "Set the trigger interval to 500 milliseconds; setting a small but non-zero trigger interval ensures that the source is not queried too frequently."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Use the trigger once option and configure a Databricks job to execute the query every 10 minutes; this approach minimizes costs for both compute and storage.\n\n❌ Các đáp án sai:\n  A. Set the trigger interval to 3 seconds; the default trigger interval is consuming too many records per batch, resulting in spill to disk that can in...\n  C. Set the trigger interval to 10 minutes; each batch calls APIs in the source storage account, so decreasing trigger frequency to maximum allowable t...\n  D. Set the trigger interval to 500 milliseconds; setting a small but non-zero trigger interval ensures that the source is not queried too frequently.",
    "question_vi": "Một kỹ sư dữ liệu đang cấu hình Structured Streaming đọc từ Delta table dưới dạng stream. Câu nào mô tả hành vi khi schema của source table thay đổi?"
  },
  {
    "id": 140,
    "topic": 1,
    "question": "Which statement describes Delta Lake optimized writes?",
    "options": {
      "A": "Before a Jobs cluster terminates, OPTIMIZE is executed on all tables modified during the most recent job.",
      "B": "An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed toward a default of 1 G",
      "C": "A shuffle occurs prior to writing to try to group similar data together resulting in fewer files instead of each executor writing multiple files based on directory partitions.",
      "D": "Optimized writes use logical partitions instead of directory partitions; because partition boundaries are only represented in metadata, fewer small files are written."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ A shuffle occurs prior to writing to try to group similar data together resulting in fewer files instead of each executor writing multiple files based on directory partitions.\n\n❌ Các đáp án sai:\n  A. Before a Jobs cluster terminates, OPTIMIZE is executed on all tables modified during the most recent job.\n  B. An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed toward a defa...\n  D. Optimized writes use logical partitions instead of directory partitions; because partition boundaries are only represented in metadata, fewer small...",
    "question_vi": "Đoạn mã sử dụng readStream để đọc tăng dần từ bảng Delta. Câu nào mô tả đúng cách Stream đọc dữ liệu từ bảng Delta?"
  },
  {
    "id": 141,
    "topic": 1,
    "question": "Which statement characterizes the general programming model used by Spark Structured Streaming?",
    "options": {
      "A": "Structured Streaming leverages the parallel processing of GPUs to achieve highly parallel data throughput.",
      "B": "Structured Streaming is implemented as a messaging bus and is derived from Apache Kafka.",
      "C": "Structured Streaming relies on a distributed network of nodes that hold incremental state values for cached stages.",
      "D": "Structured Streaming models new data arriving in a data stream as new rows appended to an unbounded table."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Structured Streaming models new data arriving in a data stream as new rows appended to an unbounded table.\n\n❌ Các đáp án sai:\n  A. Structured Streaming leverages the parallel processing of GPUs to achieve highly parallel data throughput.\n  B. Structured Streaming is implemented as a messaging bus and is derived from Apache Kafka.\n  C. Structured Streaming relies on a distributed network of nodes that hold incremental state values for cached stages.",
    "question_vi": "Một bảng Delta Lake đại diện cho metadata bài đăng người dùng có schema: user_id LONG, post_text STRING, post_id STRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE. Bảng được phân vùng theo cột date. Truy vấn chạy với bộ lọc: longitude < 20 & longitude > -20. Câu nào mô tả cách Delta engine xác định file cần tải?"
  },
  {
    "id": 142,
    "topic": 1,
    "question": "Which configuration parameter directly affects the size of a spark-partition upon ingestion of data into Spark?",
    "options": {
      "A": "spark.sql.files.maxPartitionBytes",
      "B": "spark.sql.autoBroadcastJoinThreshold",
      "C": "spark.sql.adaptive.advisoryPartitionSizeInBytes",
      "D": "spark.sql.adaptive.coalescePartitions.minPartitionNum"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ spark.sql.files.maxPartitionBytes\n\n❌ Các đáp án sai:\n  B. spark.sql.autoBroadcastJoinThreshold\n  C. spark.sql.adaptive.advisoryPartitionSizeInBytes\n  D. spark.sql.adaptive.coalescePartitions.minPartitionNum",
    "question_vi": "Một công ty nhỏ tại Mỹ gần đây đã thuê công ty tư vấn ở Ấn Độ triển khai nhiều pipeline kỹ thuật dữ liệu mới cho ứng dụng AI. Tất cả dữ liệu được lưu trong cloud storage khu vực tại Mỹ. Quản trị viên workspace chưa chắc về vị trí cần đặt Databricks workspace. Câu nào mô tả đáp án đúng?"
  },
  {
    "id": 143,
    "topic": 1,
    "question": "A Spark job is taking longer than expected. Using the Spark UI, a data engineer notes that the Min, Median, and Max Durations for tasks in a particular stage show the minimum and median time to complete a task as roughly the same, but the max duration for a task to be roughly 100 times as long as the minimum. Which situation is causing increased duration of the overall job?",
    "options": {
      "A": "Task queueing resulting from improper thread pool assignment.",
      "B": "Spill resulting from attached volume storage being too small.",
      "C": "Network latency due to some cluster nodes being in different regions from the source data",
      "D": "Skew caused by more data being assigned to a subset of spark-partitions."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Skew caused by more data being assigned to a subset of spark-partitions.\n\n❌ Các đáp án sai:\n  A. Task queueing resulting from improper thread pool assignment.\n  B. Spill resulting from attached volume storage being too small.\n  C. Network latency due to some cluster nodes being in different regions from the source data",
    "question_vi": "Một CHECK constraint đã được thêm thành công vào bảng Delta tên activity_details. Một batch job đang insert bản ghi mới, bao gồm bản ghi có latitude = 45.50 và longitude = 212.67. Câu nào mô tả kết quả của batch insert này?"
  },
  {
    "id": 144,
    "topic": 1,
    "question": "Each configuration below is identical to the extent that each cluster has 400 GB total of RAM, 160 total cores and only one Executor per VM. Given an extremely long-running job for which completion must be guaranteed, which cluster configuration will be able to guarantee completion of the job in light of one or more VM failures?",
    "options": {
      "A": "• Total VMs: 8 • 50 GB per Executor • 20 Cores / Executor",
      "B": "• Total VMs: 16 • 25 GB per Executor • 10 Cores / Executor",
      "C": "• Total VMs: 1 • 400 GB per Executor • 160 Cores/Executor",
      "D": "• Total VMs: 4 • 100 GB per Executor • 40 Cores / Executor"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ • Total VMs: 16 • 25 GB per Executor • 10 Cores / Executor\n\n❌ Các đáp án sai:\n  A. • Total VMs: 8 • 50 GB per Executor • 20 Cores / Executor\n  C. • Total VMs: 1 • 400 GB per Executor • 160 Cores/Executor\n  D. • Total VMs: 4 • 100 GB per Executor • 40 Cores / Executor",
    "question_vi": "Một kỹ sư dữ liệu mới đang chuyển workload từ hệ thống cơ sở dữ liệu quan hệ sang Databricks Lakehouse. Hệ thống nguồn sử dụng star schema với foreign key constraints và multi-table inserts. Cân nhắc nào ảnh hưởng đến quyết định khi chuyển đổi?"
  },
  {
    "id": 145,
    "topic": 1,
    "question": "A task orchestrator has been configured to run two hourly tasks. First, an outside system writes Parquet data to a directory mounted at /mnt/raw_orders/. After this data is written, a Databricks job containing the following code is executed: Assume that the fields customer_id and order_id serve as a composite key to uniquely identify each order, and that the time field indicates when the record was queued in the source system. If the upstream system is known to occasionally enqueue duplicate entries for a single order hours apart, which statement is correct?",
    "options": {
      "A": "Duplicate records enqueued more than 2 hours apart may be retained and the orders table may contain duplicate records with the same customer_id and order_id.",
      "B": "All records will be held in the state store for 2 hours before being deduplicated and committed to the orders table.",
      "C": "The orders table will contain only the most recent 2 hours of records and no duplicates will be present.",
      "D": "The orders table will not contain duplicates, but records arriving more than 2 hours late will be ignored and missing from the table."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Duplicate records enqueued more than 2 hours apart may be retained and the orders table may contain duplicate records with the same customer_id and order_id.\n\n❌ Các đáp án sai:\n  B. All records will be held in the state store for 2 hours before being deduplicated and committed to the orders table.\n  C. The orders table will contain only the most recent 2 hours of records and no duplicates will be present.\n  D. The orders table will not contain duplicates, but records arriving more than 2 hours late will be ignored and missing from the table.",
    "question_vi": "Kiến trúc sư dữ liệu đã biết về versioning và time travel của Delta Lake. Vì mục đích kiểm toán, cần duy trì bản ghi đầy đủ tất cả địa chỉ hợp lệ trong bảng customers. Kiến trúc sư muốn triển khai bảng Type 1 và dựa vào time travel cho lịch sử. Câu nào mô tả giới hạn?"
  },
  {
    "id": 146,
    "topic": 1,
    "question": "A data engineer is configuring a pipeline that will potentially see late-arriving, duplicate records. In addition to de-duplicating records within the batch, which of the following approaches allows the data engineer to deduplicate data against previously processed records as it is inserted into a Delta table?",
    "options": {
      "A": "Rely on Delta Lake schema enforcement to prevent duplicate records.",
      "B": "VACUUM the Delta table after each batch completes.",
      "C": "Perform an insert-only merge with a matching condition on a unique key.",
      "D": "Perform a full outer join on a unique key and overwrite existing data."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Perform an insert-only merge with a matching condition on a unique key.\n\n❌ Các đáp án sai:\n  A. Rely on Delta Lake schema enforcement to prevent duplicate records.\n  B. VACUUM the Delta table after each batch completes.\n  D. Perform a full outer join on a unique key and overwrite existing data.",
    "question_vi": "Một kỹ sư dữ liệu muốn join stream impression quảng cáo với stream click chuột của người dùng để tìm mối tương quan khi impression dẫn đến click có thể kiếm tiền. Trong đoạn mã, impressions là streaming DataFrame với watermark (\"event_time\", \"10 minutes\"). Kỹ sư nhận thấy truy vấn chạy chậm dần. Câu nào giải thích và giải quyết vấn đề?"
  },
  {
    "id": 147,
    "topic": 1,
    "question": "A junior data engineer seeks to leverage Delta Lake's Change Data Feed functionality to create a Type 1 table representing all of the values that have ever been valid for all rows in a bronze table created with the property delta.enableChangeDataFeed = true. They plan to execute the following code as a daily job: Which statement describes the execution and results of running the above query multiple times?",
    "options": {
      "A": "Each time the job is executed, newly updated records will be merged into the target table, overwriting previous values with the same primary keys.",
      "B": "Each time the job is executed, the entire available history of inserted or updated records will be appended to the target table, resulting in many duplicate entries.",
      "C": "Each time the job is executed, only those records that have been inserted or updated since the last execution will be appended to the target table, giving the desired result.",
      "D": "Each time the job is executed, the differences between the original and current versions are calculated; this may result in duplicate entries for some records."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Each time the job is executed, the entire available history of inserted or updated records will be appended to the target table, resulting in many duplicate entries.\n\n❌ Các đáp án sai:\n  A. Each time the job is executed, newly updated records will be merged into the target table, overwriting previous values with the same primary keys.\n  C. Each time the job is executed, only those records that have been inserted or updated since the last execution will be appended to the target table,...\n  D. Each time the job is executed, the differences between the original and current versions are calculated; this may result in duplicate entries for s...",
    "question_vi": "Một kỹ sư dữ liệu mới muốn tận dụng Change Data Feed của Delta Lake để tạo bảng Type 1 chứa tất cả giá trị đã từng hợp lệ cho mọi hàng trong bảng bronze có delta.enableChangeDataFeed = true. Họ dự định chạy đoạn mã như job hàng ngày. Câu nào mô tả thực thi và kết quả khi chạy nhiều lần?"
  },
  {
    "id": 148,
    "topic": 1,
    "question": "A DLT pipeline includes the following streaming tables: • raw_iot ingests raw device measurement data from a heart rate tracking device. • bpm_stats incrementally computes user statistics based on BPM measurements from raw_iot. How can the data engineer configure this pipeline to be able to retain manually deleted or updated records in the raw_iot table, while recomputing the downstream table bpm_stats table when a pipeline update is run?",
    "options": {
      "A": "Set the pipelines.reset.allowed property to false on raw_iot",
      "B": "Set the skipChangeCommits flag to true on raw_iot",
      "C": "Set the pipelines.reset.allowed property to false on bpm_stats",
      "D": "Set the skipChangeCommits flag to true on bpm_stats"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Set the skipChangeCommits flag to true on raw_iot\n\n❌ Các đáp án sai:\n  A. Set the pipelines.reset.allowed property to false on raw_iot\n  C. Set the pipelines.reset.allowed property to false on bpm_stats\n  D. Set the skipChangeCommits flag to true on bpm_stats",
    "question_vi": "Một DLT pipeline bao gồm các streaming table: raw_iot nạp dữ liệu đo lường thô từ thiết bị theo dõi nhịp tim; bpm_stats tính toán thống kê người dùng tăng dần từ raw_iot. Kỹ sư dữ liệu có thể cấu hình pipeline thế nào để giữ lại bản ghi xóa hoặc cập nhật thủ công trong raw_iot?"
  },
  {
    "id": 149,
    "topic": 1,
    "question": "A data pipeline uses Structured Streaming to ingest data from Apache Kafka to Delta Lake. Data is being stored in a bronze table, and includes the Kafka-generated timestamp, key, and value. Three months after the pipeline is deployed, the data engineering team has noticed some latency issues during certain times of the day. A senior data engineer updates the Delta Table's schema and ingestion logic to include the current timestamp (as recorded by Apache Spark) as well as the Kafka topic and partition. The team plans to use these additional metadata fields to diagnose the transient processing delays. Which limitation will the team face while diagnosing this problem?",
    "options": {
      "A": "New fields will not be computed for historic records.",
      "B": "Spark cannot capture the topic and partition fields from a Kafka source.",
      "C": "Updating the table schema requires a default value provided for each field added.",
      "D": "Updating the table schema will invalidate the Delta transaction log metadata."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ New fields will not be computed for historic records.\n\n❌ Các đáp án sai:\n  B. Spark cannot capture the topic and partition fields from a Kafka source.\n  C. Updating the table schema requires a default value provided for each field added.\n  D. Updating the table schema will invalidate the Delta transaction log metadata.",
    "question_vi": "Pipeline dữ liệu sử dụng Structured Streaming để nạp từ Apache Kafka vào Delta Lake. Dữ liệu lưu trong bảng bronze, bao gồm timestamp, key và value do Kafka tạo. Ba tháng sau khi triển khai, nhóm nhận thấy vấn đề độ trễ vào một số thời điểm trong ngày. Kỹ sư cao cấp sử dụng công cụ nào để chẩn đoán vấn đề?"
  },
  {
    "id": 150,
    "topic": 1,
    "question": "A nightly job ingests data into a Delta Lake table using the following code: The next step in the pipeline requires a function that returns an object that can be used to manipulate new records that have not yet been processed to the next table in the pipeline. Which code snippet completes this function definition? def new_records():",
    "options": {
      "A": "return spark.readStream.table(\"bronze\")",
      "B": "return spark.read.option(\"readChangeFeed\", \"true\").table(\"bronze\")",
      "C": "return spark.read.option(\"readChangeData\", \"true\").table(\"bronze\")",
      "D": "return spark.readStream.option(\"readChangeFeed\", \"true\").table(\"bronze\")"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ return spark.read.option(\"readChangeData\", \"true\").table(\"bronze\")\n\n❌ Các đáp án sai:\n  A. return spark.readStream.table(\"bronze\")\n  B. return spark.read.option(\"readChangeFeed\", \"true\").table(\"bronze\")\n  D. return spark.readStream.option(\"readChangeFeed\", \"true\").table(\"bronze\")",
    "question_vi": "Một job hàng đêm nạp dữ liệu vào bảng Delta Lake sử dụng đoạn mã. Bước tiếp theo trong pipeline yêu cầu hàm trả về đối tượng có thể dùng để xử lý bản ghi mới chưa được xử lý. Đoạn mã nào hoàn thành định nghĩa hàm? def new_records():"
  },
  {
    "id": 151,
    "topic": 1,
    "question": "A junior data engineer is working to implement logic for a Lakehouse table named silver_device_recordings. The source data contains 100 unique fields in a highly nested JSON structure. The silver_device_recordings table will be used downstream to power several production monitoring dashboards and a production model. At present, 45 of the 100 fields are being used in at least one of these applications. The data engineer is trying to determine the best approach for dealing with schema declaration given the highly-nested structure of the data and the numerous fields. Which of the following accurately presents information about Delta Lake and Databricks that may impact their decision-making process?",
    "options": {
      "A": "The Tungsten encoding used by Databricks is optimized for storing string data; newly-added native support for querying JSON strings means that string types are always most efficient.",
      "B": "Because Delta Lake uses Parquet for data storage, data types can be easily evolved by just modifying file footer information in place.",
      "C": "Schema inference and evolution on Databricks ensure that inferred types will always accurately match the data types used by downstream systems.",
      "D": "Because Databricks will infer schema using types that allow all observed data to be processed, setting types manually provides greater assurance of data quality enforcement."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Because Databricks will infer schema using types that allow all observed data to be processed, setting types manually provides greater assurance of data quality enforcement.\n\n❌ Các đáp án sai:\n  A. The Tungsten encoding used by Databricks is optimized for storing string data; newly-added native support for querying JSON strings means that stri...\n  B. Because Delta Lake uses Parquet for data storage, data types can be easily evolved by just modifying file footer information in place.\n  C. Schema inference and evolution on Databricks ensure that inferred types will always accurately match the data types used by downstream systems.",
    "question_vi": "Một kỹ sư dữ liệu mới đang triển khai logic cho bảng Lakehouse tên silver_device_recordings. Dữ liệu nguồn chứa 100 trường trong cấu trúc JSON lồng sâu. Bảng sẽ được dùng hạ nguồn cho nhiều dashboard giám sát production và mô hình production. Hiện tại 45 trong 100 trường đã được xác định cần thiết. Câu nào mô tả cách tiếp cận tốt nhất?"
  },
  {
    "id": 152,
    "topic": 1,
    "question": "The data engineering team maintains the following code: Assuming that this code produces logically correct results and the data in the source tables has been de-duplicated and validated, which statement describes what will occur when this code is executed?",
    "options": {
      "A": "A batch job will update the enriched_itemized_orders_by_account table, replacing only those rows that have different values than the current version of the table, using accountID as the primary key.",
      "B": "The enriched_itemized_orders_by_account table will be overwritten using the current valid version of data in each of the three tables referenced in the join logic.",
      "C": "No computation will occur until enriched_itemized_orders_by_account is queried; upon query materialization, results will be calculated using the current valid version of data in each of the three tables referenced in the join logic.",
      "D": "An incremental job will detect if new rows have been written to any of the source tables; if new rows are detected, all results will be recalculated and used to overwrite the enriched_itemized_orders_by_account table."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The enriched_itemized_orders_by_account table will be overwritten using the current valid version of data in each of the three tables referenced in the join logic.\n\n❌ Các đáp án sai:\n  A. A batch job will update the enriched_itemized_orders_by_account table, replacing only those rows that have different values than the current versio...\n  C. No computation will occur until enriched_itemized_orders_by_account is queried; upon query materialization, results will be calculated using the cu...\n  D. An incremental job will detect if new rows have been written to any of the source tables; if new rows are detected, all results will be recalculate...",
    "question_vi": "Nhóm kỹ thuật dữ liệu duy trì đoạn mã sau. Giả sử mã cho kết quả đúng và dữ liệu dans bảng nguồn đã được khử trùng lặp và xác thực. Câu nào mô tả kết quả khi mã được thực thi?"
  },
  {
    "id": 153,
    "topic": 1,
    "question": "The data engineering team is configuring environments for development, testing, and production before beginning migration on a new data pipeline. The team requires extensive testing on both the code and data resulting from code execution, and the team wants to develop and test against data as similar to production data as possible. A junior data engineer suggests that production data can be mounted to the development and testing environments, allowing pre-production code to execute against production data. Because all users have admin privileges in the development environment, the junior data engineer has offered to configure permissions and mount this data for the team. Which statement captures best practices for this situation?",
    "options": {
      "A": "All development, testing, and production code and data should exist in a single, unified workspace; creating separate environments for testing and development complicates administrative overhead.",
      "B": "In environments where interactive code will be executed, production data should only be accessible with read permissions; creating isolated databases for each environment further reduces risks.",
      "C": "Because access to production data will always be verified using passthrough credentials, it is safe to mount data to any Databricks development environment.",
      "D": "Because Delta Lake versions all data and supports time travel, it is not possible for user error or malicious actors to permanently delete production data; as such, it is generally safe to mount production data anywhere."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ In environments where interactive code will be executed, production data should only be accessible with read permissions; creating isolated databases for each environment further reduces risks.\n\n❌ Các đáp án sai:\n  A. All development, testing, and production code and data should exist in a single, unified workspace; creating separate environments for testing and ...\n  C. Because access to production data will always be verified using passthrough credentials, it is safe to mount data to any Databricks development env...\n  D. Because Delta Lake versions all data and supports time travel, it is not possible for user error or malicious actors to permanently delete producti...",
    "question_vi": "Nhóm kỹ thuật dữ liệu đang cấu hình môi trường development, testing và production trước khi bắt đầu migrate pipeline mới. Nhóm yêu cầu test kỹ lưỡng và muốn dùng dữ liệu gần giống production. Kỹ sư mới đề xuất sử dụng clone. Câu nào mô tả cách phù hợp nhất?"
  },
  {
    "id": 154,
    "topic": 1,
    "question": "The data architect has mandated that all tables in the Lakehouse should be configured as external Delta Lake tables. Which approach will ensure that this requirement is met?",
    "options": {
      "A": "Whenever a database is being created, make sure that the LOCATION keyword is used.",
      "B": "When the workspace is being configured, make sure that external cloud object storage has been mounted.",
      "C": "Whenever a table is being created, make sure that the LOCATION keyword is used.",
      "D": "When tables are created, make sure that the UNMANAGED keyword is used in the CREATE TABLE statement."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Whenever a table is being created, make sure that the LOCATION keyword is used.\n\n❌ Các đáp án sai:\n  A. Whenever a database is being created, make sure that the LOCATION keyword is used.\n  B. When the workspace is being configured, make sure that external cloud object storage has been mounted.\n  D. When tables are created, make sure that the UNMANAGED keyword is used in the CREATE TABLE statement.",
    "question_vi": "Kiến trúc sư dữ liệu đã yêu cầu tất cả bảng trong Lakehouse phải được cấu hình là external Delta Lake table. Cách tiếp cận nào đảm bảo yêu cầu này được đáp ứng?"
  },
  {
    "id": 155,
    "topic": 1,
    "question": "The marketing team is looking to share data in an aggregate table with the sales organization, but the field names used by the teams do not match, and a number of marketing-specific fields have not been approved for the sales org. Which of the following solutions addresses the situation while emphasizing simplicity?",
    "options": {
      "A": "Create a view on the marketing table selecting only those fields approved for the sales team; alias the names of any fields that should be standardized to the sales naming conventions.",
      "B": "Create a new table with the required schema and use Delta Lake's DEEP CLONE functionality to sync up changes committed to one table to the corresponding table.",
      "C": "Use a CTAS statement to create a derivative table from the marketing table; configure a production job to propagate changes.",
      "D": "Add a parallel table write to the current production pipeline, updating a new sales table that varies as required from the marketing table."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Create a view on the marketing table selecting only those fields approved for the sales team; alias the names of any fields that should be standardized to the sales naming conventions.\n\n❌ Các đáp án sai:\n  B. Create a new table with the required schema and use Delta Lake's DEEP CLONE functionality to sync up changes committed to one table to the correspo...\n  C. Use a CTAS statement to create a derivative table from the marketing table; configure a production job to propagate changes.\n  D. Add a parallel table write to the current production pipeline, updating a new sales table that varies as required from the marketing table.",
    "question_vi": "Nhóm marketing muốn chia sẻ dữ liệu trong bảng aggregate với tổ chức bán hàng, nhưng tên trường không khớp và một số trường riêng của marketing chưa được phê duyệt cho bên bán hàng. Giải pháp nào giải quyết tình huống và nhấn mạnh sự đơn giản?"
  },
  {
    "id": 156,
    "topic": 1,
    "question": "A Delta Lake table representing metadata about content posts from users has the following schema: user_id LONG, post_text STRING, post_id STRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE This table is partitioned by the date column. A query is run with the following filter: longitude < 20 & longitude > -20 Which statement describes how data will be filtered?",
    "options": {
      "A": "Statistics in the Delta Log will be used to identify partitions that might Include files in the filtered range.",
      "B": "No file skipping will occur because the optimizer does not know the relationship between the partition column and the longitude.",
      "C": "The Delta Engine will scan the parquet file footers to identify each row that meets the filter criteria.",
      "D": "Statistics in the Delta Log will be used to identify data files that might include records in the filtered range."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Statistics in the Delta Log will be used to identify data files that might include records in the filtered range.\n\n❌ Các đáp án sai:\n  A. Statistics in the Delta Log will be used to identify partitions that might Include files in the filtered range.\n  B. No file skipping will occur because the optimizer does not know the relationship between the partition column and the longitude.\n  C. The Delta Engine will scan the parquet file footers to identify each row that meets the filter criteria.",
    "question_vi": "Bảng Delta Lake metadata bài đăng người dùng có schema: user_id LONG, post_text STRING, post_id STRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE. Bảng phân vùng theo cột date. Truy vấn chạy với bộ lọc: longitude < 20 & longitude > -20. Câu nào mô tả cách Delta engine xác định file cần tải?"
  },
  {
    "id": 157,
    "topic": 1,
    "question": "A small company based in the United States has recently contracted a consulting firm in India to implement several new data engineering pipelines to power artificial intelligence applications. All the company's data is stored in regional cloud storage in the United States. The workspace administrator at the company is uncertain about where the Databricks workspace used by the contractors should be deployed. Assuming that all data governance considerations are accounted for, which statement accurately informs this decision?",
    "options": {
      "A": "Databricks runs HDFS on cloud volume storage; as such, cloud virtual machines must be deployed in the region where the data is stored.",
      "B": "Databricks workspaces do not rely on any regional infrastructure; as such, the decision should be made based upon what is most convenient for the workspace administrator.",
      "C": "Cross-region reads and writes can incur significant costs and latency; whenever possible, compute should be deployed in the same region the data is stored.",
      "D": "Databricks notebooks send all executable code from the user’s browser to virtual machines over the open internet; whenever possible, choosing a workspace region near the end users is the most secure."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Cross-region reads and writes can incur significant costs and latency; whenever possible, compute should be deployed in the same region the data is stored.\n\n❌ Các đáp án sai:\n  A. Databricks runs HDFS on cloud volume storage; as such, cloud virtual machines must be deployed in the region where the data is stored.\n  B. Databricks workspaces do not rely on any regional infrastructure; as such, the decision should be made based upon what is most convenient for the w...\n  D. Databricks notebooks send all executable code from the user’s browser to virtual machines over the open internet; whenever possible, choosing a wor...",
    "question_vi": "Một công ty nhỏ tại Mỹ thuê công ty tư vấn ở Ấn Độ triển khai pipeline kỹ thuật dữ liệu mới cho ứng dụng AI. Tất cả dữ liệu lưu tại cloud storage khu vực Mỹ. Quản trị viên chưa chắc về vị trí đặt Databricks workspace. Câu nào đúng?"
  },
  {
    "id": 158,
    "topic": 1,
    "question": "A CHECK constraint has been successfully added to the Delta table named activity_details using the following logic: A batch job is attempting to insert new records to the table, including a record where latitude = 45.50 and longitude = 212.67. Which statement describes the outcome of this batch insert?",
    "options": {
      "A": "The write will insert all records except those that violate the table constraints; the violating records will be reported in a warning log.",
      "B": "The write will fail completely because of the constraint violation and no records will be inserted into the target table.",
      "C": "The write will insert all records except those that violate the table constraints; the violating records will be recorded to a quarantine table.",
      "D": "The write will include all records in the target table; any violations will be indicated in the boolean column named valid_coordinates."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The write will fail completely because of the constraint violation and no records will be inserted into the target table.\n\n❌ Các đáp án sai:\n  A. The write will insert all records except those that violate the table constraints; the violating records will be reported in a warning log.\n  C. The write will insert all records except those that violate the table constraints; the violating records will be recorded to a quarantine table.\n  D. The write will include all records in the target table; any violations will be indicated in the boolean column named valid_coordinates.",
    "question_vi": "Một CHECK constraint đã được thêm vào bảng Delta tên activity_details. Batch job insert bản ghi mới có latitude = 45.50 và longitude = 212.67. Câu nào mô tả kết quả batch insert?"
  },
  {
    "id": 159,
    "topic": 1,
    "question": "A junior data engineer is migrating a workload from a relational database system to the Databricks Lakehouse. The source system uses a star schema, leveraging foreign key constraints and multi-table inserts to validate records on write. Which consideration will impact the decisions made by the engineer while migrating this workload?",
    "options": {
      "A": "Databricks only allows foreign key constraints on hashed identifiers, which avoid collisions in highly-parallel writes.",
      "B": "Foreign keys must reference a primary key field; multi-table inserts must leverage Delta Lake’s upsert functionality.",
      "C": "Committing to multiple tables simultaneously requires taking out multiple table locks and can lead to a state of deadlock.",
      "D": "All Delta Lake transactions are ACID compliant against a single table, and Databricks does not enforce foreign key constraints."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ All Delta Lake transactions are ACID compliant against a single table, and Databricks does not enforce foreign key constraints.\n\n❌ Các đáp án sai:\n  A. Databricks only allows foreign key constraints on hashed identifiers, which avoid collisions in highly-parallel writes.\n  B. Foreign keys must reference a primary key field; multi-table inserts must leverage Delta Lake’s upsert functionality.\n  C. Committing to multiple tables simultaneously requires taking out multiple table locks and can lead to a state of deadlock.",
    "question_vi": "Kỹ sư dữ liệu mới đang chuyển workload từ RDBMS sang Databricks Lakehouse. Hệ thống nguồn dùng star schema với foreign key constraints và multi-table inserts. Cân nhắc nào ảnh hưởng đến quyết định chuyển đổi?"
  },
  {
    "id": 160,
    "topic": 1,
    "question": "A data architect has heard about Delta Lake’s built-in versioning and time travel capabilities. For auditing purposes, they have a requirement to maintain a full record of all valid street addresses as they appear in the customers table. The architect is interested in implementing a Type 1 table, overwriting existing records with new values and relying on Delta Lake time travel to support long-term auditing. A data engineer on the project feels that a Type 2 table will provide better performance and scalability. Which piece of information is critical to this decision?",
    "options": {
      "A": "Data corruption can occur if a query fails in a partially completed state because Type 2 tables require setting multiple fields in a single update.",
      "B": "Shallow clones can be combined with Type 1 tables to accelerate historic queries for long-term versioning.",
      "C": "Delta Lake time travel cannot be used to query previous versions of these tables because Type 1 changes modify data files in place.",
      "D": "Delta Lake time travel does not scale well in cost or latency to provide a long-term versioning solution."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Delta Lake time travel does not scale well in cost or latency to provide a long-term versioning solution.\n\n❌ Các đáp án sai:\n  A. Data corruption can occur if a query fails in a partially completed state because Type 2 tables require setting multiple fields in a single update.\n  B. Shallow clones can be combined with Type 1 tables to accelerate historic queries for long-term versioning.\n  C. Delta Lake time travel cannot be used to query previous versions of these tables because Type 1 changes modify data files in place.",
    "question_vi": "Kiến trúc sư dữ liệu biết về versioning và time travel của Delta Lake. Vì kiểm toán, cần duy trì bản ghi đầy đủ địa chỉ hợp lệ trong bảng customers. Muốn triển khai bảng Type 1 dựa vào time travel cho lịch sử. Câu nào mô tả giới hạn?"
  },
  {
    "id": 161,
    "topic": 1,
    "question": "A data engineer wants to join a stream of advertisement impressions (when an ad was shown) with another stream of user clicks on advertisements to correlate when impressions led to monetizable clicks. In the code below, Impressions is a streaming DataFrame with a watermark (\"event_time\", \"10 minutes\") The data engineer notices the query slowing down significantly. Which solution would improve the performance?",
    "options": {
      "A": "Joining on event time constraint: clickTime >= impressionTime AND clickTime <= impressionTime interval 1 hour",
      "B": "Joining on event time constraint: clickTime + 3 hours < impressionTime - 2 hours",
      "C": "Joining on event time constraint: clickTime == impressionTime using a leftOuter join",
      "D": "Joining on event time constraint: clickTime >= impressionTime - interval 3 hours and removing watermarks"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Joining on event time constraint: clickTime >= impressionTime AND clickTime <= impressionTime interval 1 hour\n\n❌ Các đáp án sai:\n  B. Joining on event time constraint: clickTime + 3 hours < impressionTime - 2 hours\n  C. Joining on event time constraint: clickTime == impressionTime using a leftOuter join\n  D. Joining on event time constraint: clickTime >= impressionTime - interval 3 hours and removing watermarks",
    "question_vi": "Kỹ sư dữ liệu muốn join stream impression quảng cáo với stream click chuột để tìm correlation. Impressions là streaming DataFrame với watermark. Truy vấn chậm dần. Câu nào giải thích?"
  },
  {
    "id": 162,
    "topic": 1,
    "question": "A junior data engineer has manually configured a series of jobs using the Databricks Jobs UI. Upon reviewing their work, the engineer realizes that they are listed as the \"Owner\" for each job. They attempt to transfer \"Owner\" privileges to the \"DevOps\" group, but cannot successfully accomplish this task. Which statement explains what is preventing this privilege transfer?",
    "options": {
      "A": "Databricks jobs must have exactly one owner; \"Owner\" privileges cannot be assigned to a group.",
      "B": "The creator of a Databricks job will always have \"Owner\" privileges; this configuration cannot be changed.",
      "C": "Only workspace administrators can grant \"Owner\" privileges to a group.",
      "D": "A user can only transfer job ownership to a group if they are also a member of that group."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Databricks jobs must have exactly one owner; \"Owner\" privileges cannot be assigned to a group.\n\n❌ Các đáp án sai:\n  B. The creator of a Databricks job will always have \"Owner\" privileges; this configuration cannot be changed.\n  C. Only workspace administrators can grant \"Owner\" privileges to a group.\n  D. A user can only transfer job ownership to a group if they are also a member of that group.",
    "question_vi": "Một kỹ sư dữ liệu mới đã cấu hình thủ công nhiều jobs bằng Databricks Jobs UI. Khi review, kỹ sư nhận thấy mình là \"Owner\" của mỗi job. Họ thử chuyển quyền \"Owner\" cho nhóm \"DevOps\" nhưng không thành công. Câu nào giải thích nguyên nhân?"
  },
  {
    "id": 163,
    "topic": 1,
    "question": "A table named user_ltv is being used to create a view that will be used by data analysts on various teams. Users in the workspace are configured into groups, which are used for setting up data access using ACLs. The user_ltv table has the following schema: email STRING, age INT, ltv INT The following view definition is executed: An analyst who is not a member of the auditing group executes the following query: SELECT * FROM user_ltv_no_minors Which statement describes the results returned by this query?",
    "options": {
      "A": "All columns will be displayed normally for those records that have an age greater than 17; records not meeting this condition will be omitted.",
      "B": "All age values less than 18 will be returned as null values, all other columns will be returned with the values in user_ltv.",
      "C": "All values for the age column will be returned as null values, all other columns will be returned with the values in user_ltv.",
      "D": "All columns will be displayed normally for those records that have an age greater than 18; records not meeting this condition will be omitted."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ All columns will be displayed normally for those records that have an age greater than 18; records not meeting this condition will be omitted.\n\n❌ Các đáp án sai:\n  A. All columns will be displayed normally for those records that have an age greater than 17; records not meeting this condition will be omitted.\n  B. All age values less than 18 will be returned as null values, all other columns will be returned with the values in user_ltv.\n  C. All values for the age column will be returned as null values, all other columns will be returned with the values in user_ltv.",
    "question_vi": "Bảng user_ltv đang tạo view cho nhà phân tích nhiều nhóm. Người dùng cấu hình theo nhóm cho ACL. Bảng có schema: email STRING, age INT, ltv INT. View được tạo. Nhà phân tích không thuộc nhóm managers truy vấn view. Kết quả?"
  },
  {
    "id": 164,
    "topic": 1,
    "question": "All records from an Apache Kafka producer are being ingested into a single Delta Lake table with the following schema: key BINARY, value BINARY, topic STRING, partition LONG, offset LONG, timestamp LONG There are 5 unique topics being ingested. Only the \"registration\" topic contains Personal Identifiable Information (PII). The company wishes to restrict access to PII. The company also wishes to only retain records containing PII in this table for 14 days after initial ingestion. However, for non-PII information, it would like to retain these records indefinitely. Which solution meets the requirements?",
    "options": {
      "A": "All data should be deleted biweekly; Delta Lake's time travel functionality should be leveraged to maintain a history of non-PII information.",
      "B": "Data should be partitioned by the registration field, allowing ACLs and delete statements to be set for the PII directory.",
      "C": "Data should be partitioned by the topic field, allowing ACLs and delete statements to leverage partition boundaries.",
      "D": "Separate object storage containers should be specified based on the partition field, allowing isolation at the storage level."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Data should be partitioned by the topic field, allowing ACLs and delete statements to leverage partition boundaries.\n\n❌ Các đáp án sai:\n  A. All data should be deleted biweekly; Delta Lake's time travel functionality should be leveraged to maintain a history of non-PII information.\n  B. Data should be partitioned by the registration field, allowing ACLs and delete statements to be set for the PII directory.\n  D. Separate object storage containers should be specified based on the partition field, allowing isolation at the storage level.",
    "question_vi": "Tất cả bản ghi từ Apache Kafka producer đang được nạp vào một bảng Delta Lake có schema: key BINARY, value BINARY, topic STRING, partition LONG, offset LONG, timestamp LONG. Có 5 topic duy nhất. Chỉ topic \"registration\" chứa PII. Công ty muốn hạn chế quyền truy cập PII. Câu nào mô tả giải pháp?"
  },
  {
    "id": 165,
    "topic": 1,
    "question": "The data governance team is reviewing code used for deleting records for compliance with GDPR. The following logic has been implemented to propagate delete requests from the user_lookup table to the user_aggregates table. Assuming that user_id is a unique identifying key and that all users that have requested deletion have been removed from the user_lookup table, which statement describes whether successfully executing the above logic guarantees that the records to be deleted from the user_aggregates table are no longer accessible and why?",
    "options": {
      "A": "No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command.",
      "B": "No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data files.",
      "C": "No; the change data feed only tracks inserts and updates, not deleted records.",
      "D": "Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data files.\n\n❌ Các đáp án sai:\n  A. No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command.\n  C. No; the change data feed only tracks inserts and updates, not deleted records.\n  D. Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records.",
    "question_vi": "Nhóm quản trị dữ liệu đang review mã xóa bản ghi tuân thủ GDPR. Logic lan truyền yêu cầu xóa từ user_lookup sang user_aggregates. Giả sử user_id là khóa duy nhất. Câu nào mô tả kết quả?"
  },
  {
    "id": 166,
    "topic": 1,
    "question": "An external object storage container has been mounted to the location /mnt/finance_eda_bucket. The following logic was executed to create a database for the finance team: After the database was successfully created and permissions configured, a member of the finance team runs the following code: If all users on the finance team are members of the finance group, which statement describes how the tx_sales table will be created?",
    "options": {
      "A": "A logical table will persist the query plan to the Hive Metastore in the Databricks control plane.",
      "B": "An external table will be created in the storage container mounted to /mnt/finance_eda_bucket.",
      "C": "A managed table will be created in the DBFS root storage container.",
      "D": "An managed table will be created in the storage container mounted to /mnt/finance_eda_bucket."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ An external table will be created in the storage container mounted to /mnt/finance_eda_bucket.\n\n❌ Các đáp án sai:\n  A. A logical table will persist the query plan to the Hive Metastore in the Databricks control plane.\n  C. A managed table will be created in the DBFS root storage container.\n  D. An managed table will be created in the storage container mounted to /mnt/finance_eda_bucket.",
    "question_vi": "Vùng lưu trữ bên ngoài đã mount tại /mnt/finance_eda_bucket. Logic tạo database cho nhóm tài chính. Sau khi tạo database và cấu hình quyền, một thành viên nhóm tài chính chạy đoạn mã. Kết quả là gì?"
  },
  {
    "id": 167,
    "topic": 1,
    "question": "The data engineering team has been tasked with configuring connections to an external database that does not have a supported native connector with Databricks. The external database already has data security configured by group membership. These groups map directly to user groups already created in Databricks that represent various teams within the company. A new login credential has been created for each group in the external database. The Databricks Utilities Secrets module will be used to make these credentials available to Databricks users. Assuming that all the credentials are configured correctly on the external database and group membership is properly configured on Databricks, which statement describes how teams can be granted the minimum necessary access to using these credentials?",
    "options": {
      "A": "No additional configuration is necessary as long as all users are configured as administrators in the workspace where secrets have been added.",
      "B": "\"Read\" permissions should be set on a secret key mapped to those credentials that will be used by a given team.",
      "C": "\"Read\" permissions should be set on a secret scope containing only those credentials that will be used by a given team.",
      "D": "\"Manage\" permissions should be set on a secret scope containing only those credentials that will be used by a given team."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ \"Read\" permissions should be set on a secret key mapped to those credentials that will be used by a given team.\n\n❌ Các đáp án sai:\n  A. No additional configuration is necessary as long as all users are configured as administrators in the workspace where secrets have been added.\n  C. \"Read\" permissions should be set on a secret scope containing only those credentials that will be used by a given team.\n  D. \"Manage\" permissions should be set on a secret scope containing only those credentials that will be used by a given team.",
    "question_vi": "Nhóm kỹ thuật dữ liệu được giao cấu hình kết nối tới CSDL bên ngoài không có connector native Databricks hỗ trợ. CSDL bên ngoài đã có bảo mật theo nhóm. Các nhóm map trực tiếp với user groups trong Databricks. Đáp án nào mô tả cách kết nối?"
  },
  {
    "id": 168,
    "topic": 1,
    "question": "What is the retention of job run history?",
    "options": {
      "A": "It is retained until you export or delete job run logs",
      "B": "It is retained for 30 days, during which time you can deliver job run logs to DBFS or S3",
      "C": "It is retained for 60 days, during which you can export notebook run results to HTML",
      "D": "It is retained for 60 days, after which logs are archived"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ It is retained for 60 days, during which you can export notebook run results to HTML\n\n❌ Các đáp án sai:\n  A. It is retained until you export or delete job run logs\n  B. It is retained for 30 days, during which time you can deliver job run logs to DBFS or S3\n  D. It is retained for 60 days, after which logs are archived",
    "question_vi": "Thời gian lưu giữ lịch sử chạy job là bao lâu?"
  },
  {
    "id": 169,
    "topic": 1,
    "question": "A data engineer, User A, has promoted a new pipeline to production by using the REST API to programmatically create several jobs. A DevOps engineer, User B, has configured an external orchestration tool to trigger job runs through the REST API. Both users authorized the REST API calls using their personal access tokens. Which statement describes the contents of the workspace audit logs concerning these events?",
    "options": {
      "A": "Because the REST API was used for job creation and triggering runs, a Service Principal will be automatically used to identify these events.",
      "B": "Because User A created the jobs, their identity will be associated with both the job creation events and the job run events.",
      "C": "Because these events are managed separately, User A will have their identity associated with the job creation events and User B will have their identity associated with the job run events.",
      "D": "Because the REST API was used for job creation and triggering runs, user identity will not be captured in the audit logs."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Because these events are managed separately, User A will have their identity associated with the job creation events and User B will have their identity associated with the job run events.\n\n❌ Các đáp án sai:\n  A. Because the REST API was used for job creation and triggering runs, a Service Principal will be automatically used to identify these events.\n  B. Because User A created the jobs, their identity will be associated with both the job creation events and the job run events.\n  D. Because the REST API was used for job creation and triggering runs, user identity will not be captured in the audit logs.",
    "question_vi": "Kỹ sư dữ liệu, User A, đã đưa pipeline mới lên production bằng REST API. Kỹ sư DevOps, User B, cấu hình công cụ điều phối bên ngoài kích hoạt job runs qua REST API. Cả hai dùng personal access token. Câu nào mô tả hạn chế?"
  },
  {
    "id": 170,
    "topic": 1,
    "question": "A distributed team of data analysts share computing resources on an interactive cluster with autoscaling configured. In order to better manage costs and query throughput, the workspace administrator is hoping to evaluate whether cluster upscaling is caused by many concurrent users or resource-intensive queries. In which location can one review the timeline for cluster resizing events?",
    "options": {
      "A": "Workspace audit logs",
      "B": "Driver's log file",
      "C": "Ganglia",
      "D": "Cluster Event Log"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Cluster Event Log\n\n❌ Các đáp án sai:\n  A. Workspace audit logs\n  B. Driver's log file\n  C. Ganglia",
    "question_vi": "Một nhóm phân tán các nhà phân tích dữ liệu chia sẻ tài nguyên tính toán trên cluster tương tác với autoscaling. Để quản lý chi phí và throughput truy vấn, quản trị viên workspace muốn đánh giá liệu việc upscaling cluster do nhiều người dùng đồng thời hay truy vấn tốn tài nguyên. Xem ở đâu để review chỉ số này?"
  },
  {
    "id": 171,
    "topic": 1,
    "question": "When evaluating the Ganglia Metrics for a given cluster with 3 executor nodes, which indicator would signal proper utilization of the VM's resources?",
    "options": {
      "A": "The five Minute Load Average remains consistent/flat",
      "B": "CPU Utilization is around 75%",
      "C": "Network I/O never spikes",
      "D": "Total Disk Space remains constant"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ CPU Utilization is around 75%\n\n❌ Các đáp án sai:\n  A. The five Minute Load Average remains consistent/flat\n  C. Network I/O never spikes\n  D. Total Disk Space remains constant",
    "question_vi": "Một kỹ sư dữ liệu đang xem xét DLT pipeline bao gồm nhiều streaming table và materialized view. Câu nào mô tả cách DLT quản lý dependencies và thực thi?"
  },
  {
    "id": 172,
    "topic": 1,
    "question": "The data engineer is using Spark's MEMORY_ONLY storage level. Which indicators should the data engineer look for in the Spark UI's Storage tab to signal that a cached table is not performing optimally?",
    "options": {
      "A": "On Heap Memory Usage is within 75% of Off Heap Memory Usage",
      "B": "The RDD Block Name includes the “*” annotation signaling a failure to cache",
      "C": "Size on Disk is > 0",
      "D": "The number of Cached Partitions > the number of Spark Partitions"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The RDD Block Name includes the “*” annotation signaling a failure to cache\n\n❌ Các đáp án sai:\n  A. On Heap Memory Usage is within 75% of Off Heap Memory Usage\n  C. Size on Disk is > 0\n  D. The number of Cached Partitions > the number of Spark Partitions",
    "question_vi": "Một batch job hàng đêm được cấu hình nạp tất cả file dữ liệu từ container cloud storage. Bản ghi lưu trong cấu trúc thư mục lồng nhau YYYY/MM/DD. Câu nào mô tả cách nạp dữ liệu tăng dần hiệu quả?"
  },
  {
    "id": 173,
    "topic": 1,
    "question": "Review the following error traceback: Which statement describes the error being raised?",
    "options": {
      "A": "There is a syntax error because the heartrate column is not correctly identified as a column.",
      "B": "There is no column in the table named heartrateheartrateheartrate",
      "C": "There is a type error because a column object cannot be multiplied.",
      "D": "There is a type error because a DataFrame object cannot be multiplied."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ There is no column in the table named heartrateheartrateheartrate\n\n❌ Các đáp án sai:\n  A. There is a syntax error because the heartrate column is not correctly identified as a column.\n  C. There is a type error because a column object cannot be multiplied.\n  D. There is a type error because a DataFrame object cannot be multiplied.",
    "question_vi": "Câu nào mô tả tính năng Optimized Writes của Delta Lake?"
  },
  {
    "id": 174,
    "topic": 1,
    "question": "What is a method of installing a Python package scoped at the notebook level to all nodes in the currently active cluster?",
    "options": {
      "A": "Run source env/bin/activate in a notebook setup script",
      "B": "Install libraries from PyPI using the cluster UI",
      "C": "Use %pip install in a notebook cell",
      "D": "Use %sh pip install in a notebook cell"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Use %pip install in a notebook cell\n\n❌ Các đáp án sai:\n  A. Run source env/bin/activate in a notebook setup script\n  B. Install libraries from PyPI using the cluster UI\n  D. Use %sh pip install in a notebook cell",
    "question_vi": "Câu nào mô tả chế độ thực thi mặc định của Databricks Auto Loader?"
  },
  {
    "id": 175,
    "topic": 1,
    "question": "What is the first line of a Databricks Python notebook when viewed in a text editor?",
    "options": {
      "A": "%python",
      "B": "// Databricks notebook source",
      "C": "# Databricks notebook source",
      "D": "-- Databricks notebook source"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ # Databricks notebook source\n\n❌ Các đáp án sai:\n  A. %python\n  B. // Databricks notebook source\n  D. -- Databricks notebook source",
    "question_vi": "Một bảng Delta Lake metadata bài đăng người dùng có schema: user_id LONG, post_text STRING, post_id STRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE. Cột nào là ứng viên tốt để phân vùng bảng?"
  },
  {
    "id": 176,
    "topic": 1,
    "question": "Incorporating unit tests into a PySpark application requires upfront attention to the design of your jobs, or a potentially significant refactoring of existing code. Which benefit offsets this additional effort?",
    "options": {
      "A": "Improves the quality of your data",
      "B": "Validates a complete use case of your application",
      "C": "Troubleshooting is easier since all steps are isolated and tested individually",
      "D": "Ensures that all steps interact correctly to achieve the desired end result"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Troubleshooting is easier since all steps are isolated and tested individually\n\n❌ Các đáp án sai:\n  A. Improves the quality of your data\n  B. Validates a complete use case of your application\n  D. Ensures that all steps interact correctly to achieve the desired end result",
    "question_vi": "Công ty lớn muốn triển khai giải pháp gần thời gian thực với hàng trăm pipeline cập nhật song song nhiều bảng, dữ liệu khối lượng và tốc độ cao. Giải pháp nào đáp ứng yêu cầu?"
  },
  {
    "id": 177,
    "topic": 1,
    "question": "What describes integration testing?",
    "options": {
      "A": "It validates an application use case.",
      "B": "It validates behavior of individual elements of an application,",
      "C": "It requires an automated testing framework.",
      "D": "It validates interactions between subsystems of your application."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ It validates interactions between subsystems of your application.\n\n❌ Các đáp án sai:\n  A. It validates an application use case.\n  B. It validates behavior of individual elements of an application,\n  C. It requires an automated testing framework.",
    "question_vi": "Đáp án nào mô tả phương pháp cài đặt Python package phạm vi notebook cho tất cả node trong cluster đang hoạt động?"
  },
  {
    "id": 178,
    "topic": 1,
    "question": "The Databricks CLI is used to trigger a run of an existing job by passing the job_id parameter. The response that the job run request has been submitted successfully includes a field run_id. Which statement describes what the number alongside this field represents?",
    "options": {
      "A": "The job_id and number of times the job has been run are concatenated and returned.",
      "B": "The globally unique ID of the newly triggered run.",
      "C": "The number of times the job definition has been run in this workspace.",
      "D": "The job_id is returned in this field."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The globally unique ID of the newly triggered run.\n\n❌ Các đáp án sai:\n  A. The job_id and number of times the job has been run are concatenated and returned.\n  C. The number of times the job definition has been run in this workspace.\n  D. The job_id is returned in this field.",
    "question_vi": "Mỗi cấu hình cluster giống nhau: 400 GB RAM, 160 core, 1 Executor mỗi VM. Với job chạy cực dài phải đảm bảo hoàn thành, cấu hình nào đảm bảo hoàn thành khi có VM lỗi?"
  },
  {
    "id": 179,
    "topic": 1,
    "question": "A Databricks job has been configured with three tasks, each of which is a Databricks notebook. Task A does not depend on other tasks. Tasks B and C run in parallel, with each having a serial dependency on task",
    "options": {
      "A": "All logic expressed in the notebook associated with tasks A and B will have been successfully completed; some operations in task C may have completed successfully.",
      "B": "Unless all tasks complete successfully, no changes will be committed to the Lakehouse; because task C failed, all commits will be rolled back automatically.",
      "C": "Because all tasks are managed as a dependency graph, no changes will be committed to the Lakehouse until all tasks have successfully been completed.",
      "D": "All logic expressed in the notebook associated with tasks A and B will have been successfully completed; any changes made in task C will be rolled back due to task failure."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ All logic expressed in the notebook associated with tasks A and B will have been successfully completed; some operations in task C may have completed successfully.\n\n❌ Các đáp án sai:\n  B. Unless all tasks complete successfully, no changes will be committed to the Lakehouse; because task C failed, all commits will be rolled back autom...\n  C. Because all tasks are managed as a dependency graph, no changes will be committed to the Lakehouse until all tasks have successfully been completed.\n  D. All logic expressed in the notebook associated with tasks A and B will have been successfully completed; any changes made in task C will be rolled ...",
    "question_vi": "Bảng customer_churn_params được nhóm ML sử dụng cho dự đoán churn. Nhóm kỹ thuật cập nhật hàng đêm bằng overwrite. Nhóm ML chỉ cần dự đoán bản ghi thay đổi trong 24h. Cách nào đơn giản xác định bản ghi đã thay đổi?"
  },
  {
    "id": 180,
    "topic": 1,
    "question": "When scheduling Structured Streaming jobs for production, which configuration automatically recovers from query failures and keeps costs low?",
    "options": {
      "A": "Cluster: New Job Cluster; Retries: Unlimited; Maximum Concurrent Runs: 1",
      "B": "Cluster: New Job Cluster; Retries: Unlimited; Maximum Concurrent Runs: Unlimited",
      "C": "Cluster: Existing All-Purpose Cluster; Retries: Unlimited; Maximum Concurrent Runs: 1",
      "D": "Cluster: New Job Cluster; Retries: None; Maximum Concurrent Runs: 1"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Cluster: New Job Cluster; Retries: Unlimited; Maximum Concurrent Runs: 1\n\n❌ Các đáp án sai:\n  B. Cluster: New Job Cluster; Retries: Unlimited; Maximum Concurrent Runs: Unlimited\n  C. Cluster: Existing All-Purpose Cluster; Retries: Unlimited; Maximum Concurrent Runs: 1\n  D. Cluster: New Job Cluster; Retries: None; Maximum Concurrent Runs: 1",
    "question_vi": "Structured Streaming job của nhóm tính aggregates cho doanh số. Nhóm marketing muốn thêm trường mới theo dõi mã khuyến mãi. Kỹ sư mới đề xuất cập nhật schema streaming query. Kết quả?"
  },
  {
    "id": 181,
    "topic": 1,
    "question": "A Delta Lake table was created with the below query: Realizing that the original query had a typographical error, the below code was executed: ALTER TABLE prod.sales_by_stor RENAME TO prod.sales_by_store Which result will occur after running the second command?",
    "options": {
      "A": "The table reference in the metastore is updated.",
      "B": "All related files and metadata are dropped and recreated in a single ACID transaction.",
      "C": "The table name change is recorded in the Delta transaction log.",
      "D": "A new Delta transaction log is created for the renamed table."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ The table reference in the metastore is updated.\n\n❌ Các đáp án sai:\n  B. All related files and metadata are dropped and recreated in a single ACID transaction.\n  C. The table name change is recorded in the Delta transaction log.\n  D. A new Delta transaction log is created for the renamed table.",
    "question_vi": "Khi sử dụng CLI hoặc REST API lấy kết quả jobs nhiều tasks, câu nào mô tả đúng cấu trúc phản hồi?"
  },
  {
    "id": 182,
    "topic": 1,
    "question": "The data engineering team has configured a Databricks SQL query and alert to monitor the values in a Delta Lake table. The recent_sensor_recordings table contains an identifying sensor_id alongside the timestamp and temperature for the most recent 5 minutes of recordings. The below query is used to create the alert: The query is set to refresh each minute and always completes in less than 10 seconds. The alert is set to trigger when mean (temperature) > 120. Notifications are triggered to be sent at most every 1 minute. If this alert raises notifications for 3 consecutive minutes and then stops, which statement must be true?",
    "options": {
      "A": "The total average temperature across all sensors exceeded 120 on three consecutive executions of the query",
      "B": "The average temperature recordings for at least one sensor exceeded 120 on three consecutive executions of the query",
      "C": "The source query failed to update properly for three consecutive minutes and then restarted",
      "D": "The maximum temperature recording for at least one sensor exceeded 120 on three consecutive executions of the query"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The average temperature recordings for at least one sensor exceeded 120 on three consecutive executions of the query\n\n❌ Các đáp án sai:\n  A. The total average temperature across all sensors exceeded 120 on three consecutive executions of the query\n  C. The source query failed to update properly for three consecutive minutes and then restarted\n  D. The maximum temperature recording for at least one sensor exceeded 120 on three consecutive executions of the query",
    "question_vi": "Nhóm kỹ thuật dữ liệu đang cấu hình môi trường dev, test, prod. Yêu cầu test kỹ với dữ liệu gần giống production. Kỹ sư mới đề xuất clone bảng production. Cách phù hợp nhất?"
  },
  {
    "id": 183,
    "topic": 1,
    "question": "A junior developer complains that the code in their notebook isn't producing the correct results in the development environment. A shared screenshot reveals that while they're using a notebook versioned with Databricks Repos, they're using a personal branch that contains old logic. The desired branch named dev-2.3.9 is not available from the branch selection dropdown. Which approach will allow this developer to review the current logic for this notebook?",
    "options": {
      "A": "Use Repos to make a pull request use the Databricks REST API to update the current branch to dev-2.3.9",
      "B": "Use Repos to pull changes from the remote Git repository and select the dev-2.3.9 branch.",
      "C": "Use Repos to checkout the dev-2.3.9 branch and auto-resolve conflicts with the current branch",
      "D": "Use Repos to merge the current branch and the dev-2.3.9 branch, then make a pull request to sync with the remote repository"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Use Repos to pull changes from the remote Git repository and select the dev-2.3.9 branch.\n\n❌ Các đáp án sai:\n  A. Use Repos to make a pull request use the Databricks REST API to update the current branch to dev-2.3.9\n  C. Use Repos to checkout the dev-2.3.9 branch and auto-resolve conflicts with the current branch\n  D. Use Repos to merge the current branch and the dev-2.3.9 branch, then make a pull request to sync with the remote repository",
    "question_vi": "Kỹ sư dữ liệu, User A, đưa pipeline lên production bằng REST API. Kỹ sư DevOps, User B, cấu hình công cụ bên ngoài kích hoạt jobs qua REST API. Cả hai dùng personal access token. Quản trị viên workspace, User C, kế thừa pipeline. Kết quả?"
  },
  {
    "id": 184,
    "topic": 1,
    "question": "Two of the most common data locations on Databricks are the DBFS root storage and external object storage mounted with dbutils.fs.mount(). Which of the following statements is correct?",
    "options": {
      "A": "DBFS is a file system protocol that allows users to interact with files stored in object storage using syntax and guarantees similar to Unix file systems.",
      "B": "By default, both the DBFS root and mounted data sources are only accessible to workspace administrators.",
      "C": "The DBFS root is the most secure location to store data, because mounted storage volumes must have full public read and write permissions.",
      "D": "The DBFS root stores files in ephemeral block volumes attached to the driver, while mounted directories will always persist saved data to external storage between sessions."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ DBFS is a file system protocol that allows users to interact with files stored in object storage using syntax and guarantees similar to Unix file systems.\n\n❌ Các đáp án sai:\n  B. By default, both the DBFS root and mounted data sources are only accessible to workspace administrators.\n  C. The DBFS root is the most secure location to store data, because mounted storage volumes must have full public read and write permissions.\n  D. The DBFS root stores files in ephemeral block volumes attached to the driver, while mounted directories will always persist saved data to external ...",
    "question_vi": "Một thành viên nhóm kỹ thuật gửi notebook ngắn muốn lập lịch như phần của pipeline lớn. Giả sử lệnh cho kết quả đúng. Lệnh nào nên loại bỏ trước khi lập lịch?"
  },
  {
    "id": 185,
    "topic": 1,
    "question": "An upstream system has been configured to pass the date for a given batch of data to the Databricks Jobs API as a parameter. The notebook to be scheduled will use this parameter to load data with the following code: df = spark.read.format(\"parquet\").load(f\"/mnt/source/(date)\") Which code block should be used to create the date Python variable used in the above code block?",
    "options": {
      "A": "date = spark.conf.get(\"date\")",
      "B": "import sys date = sys.argv[1]",
      "C": "date = dbutils.notebooks.getParam(\"date\")",
      "D": "dbutils.widgets.text(\"date\", \"null\") date = dbutils.widgets.get(\"date\")"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ dbutils.widgets.text(\"date\", \"null\") date = dbutils.widgets.get(\"date\")\n\n❌ Các đáp án sai:\n  A. date = spark.conf.get(\"date\")\n  B. import sys date = sys.argv[1]\n  C. date = dbutils.notebooks.getParam(\"date\")",
    "question_vi": "Câu nào về cấu hình Spark trên nền tảng Databricks là đúng?"
  },
  {
    "id": 186,
    "topic": 1,
    "question": "The Databricks workspace administrator has configured interactive clusters for each of the data engineering groups. To control costs, clusters are set to terminate after 30 minutes of inactivity. Each user should be able to execute workloads against their assigned clusters at any time of the day. Assuming users have been added to a workspace but not granted any permissions, which of the following describes the minimal permissions a user would need to start and attach to an already configured cluster.",
    "options": {
      "A": "\"Can Manage\" privileges on the required cluster",
      "B": "Cluster creation allowed, \"Can Restart\" privileges on the required cluster",
      "C": "Cluster creation allowed, \"Can Attach To\" privileges on the required cluster",
      "D": "\"Can Restart\" privileges on the required cluster"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Cluster creation allowed, \"Can Attach To\" privileges on the required cluster\n\n❌ Các đáp án sai:\n  A. \"Can Manage\" privileges on the required cluster\n  B. Cluster creation allowed, \"Can Restart\" privileges on the required cluster\n  D. \"Can Restart\" privileges on the required cluster",
    "question_vi": "Nhóm báo cáo kinh doanh yêu cầu dữ liệu dashboard cập nhật mỗi giờ. Pipeline xử lý chạy 10 phút. Cấu hình nào đáp ứng SLA chi phí thấp nhất?"
  },
  {
    "id": 187,
    "topic": 1,
    "question": "The data science team has created and logged a production model using MLflow. The following code correctly imports and applies the production model to output the predictions as a new DataFrame named preds with the schema \"customer_id LONG, predictions DOUBLE, date DATE\". The data science team would like predictions saved to a Delta Lake table with the ability to compare all predictions across time. Churn predictions will be made at most once per day. Which code block accomplishes this task while minimizing potential compute costs?",
    "options": {
      "A": "preds.write.mode(\"append\").saveAsTable(\"churn_preds\")",
      "B": "preds.write.format(\"delta\").save(\"/preds/churn_preds\")",
      "C": "spark.readStream.load(\"/preds/churn_preds\").writeStream.option(\"checkpointLocation\", \"/preds/checkpoint\").toTable(\"churn_preds\")",
      "D": "preds.write.mode(\"overwrite\").saveAsTable(\"churn_preds\")",
      "E": "preds.writeStream.option(\"checkpointLocation\", \"/preds/checkpoint\").toTable(\"churn_preds\")"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ preds.write.mode(\"append\").saveAsTable(\"churn_preds\")\n\n❌ Các đáp án sai:\n  B. preds.write.format(\"delta\").save(\"/preds/churn_preds\")\n  C. spark.readStream.load(\"/preds/churn_preds\").writeStream.option(\"checkpointLocation\", \"/preds/checkpoint\").toTable(\"churn_preds\")\n  D. preds.write.mode(\"overwrite\").saveAsTable(\"churn_preds\")\n  E. preds.writeStream.option(\"checkpointLocation\", \"/preds/checkpoint\").toTable(\"churn_preds\")",
    "question_vi": "Dashboard Databricks SQL theo dõi tổng bản ghi trong các bảng Delta Lake bằng SELECT COUNT(*) FROM table. Đáp án nào mô tả cách kết quả được tạo mỗi khi dashboard cập nhật?"
  },
  {
    "id": 188,
    "topic": 1,
    "question": "The following code has been migrated to a Databricks notebook from a legacy workload: The code executes successfully and provides the logically correct results, however, it takes over 20 minutes to extract and load around 1 GB of data. Which statement is a possible explanation for this behavior?",
    "options": {
      "A": "%sh triggers a cluster restart to collect and install Git. Most of the latency is related to cluster startup time.",
      "B": "Instead of cloning, the code should use %sh pip install so that the Python code can get executed in parallel across all nodes in a cluster.",
      "C": "%sh does not distribute file moving operations; the final line of code should be updated to use %fs instead.",
      "D": "%sh executes shell code on the driver node. The code does not take advantage of the worker nodes or Databricks optimized Spark."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ %sh executes shell code on the driver node. The code does not take advantage of the worker nodes or Databricks optimized Spark.\n\n❌ Các đáp án sai:\n  A. %sh triggers a cluster restart to collect and install Git. Most of the latency is related to cluster startup time.\n  B. Instead of cloning, the code should use %sh pip install so that the Python code can get executed in parallel across all nodes in a cluster.\n  C. %sh does not distribute file moving operations; the final line of code should be updated to use %fs instead.",
    "question_vi": "Bảng Delta Lake được tạo bằng truy vấn. Xét lệnh: DROP TABLE prod.sales_by_store. Nếu workspace admin thực thi, kết quả nào xảy ra?"
  },
  {
    "id": 189,
    "topic": 1,
    "question": "A Delta table of weather records is partitioned by date and has the below schema: date DATE, device_id INT, temp FLOAT, latitude FLOAT, longitude FLOAT To find all the records from within the Arctic Circle, you execute a query with the below filter: latitude > 66.3 Which statement describes how the Delta engine identifies which files to load?",
    "options": {
      "A": "All records are cached to an operational database and then the filter is applied",
      "B": "The Parquet file footers are scanned for min and max statistics for the latitude column",
      "C": "The Hive metastore is scanned for min and max statistics for the latitude column",
      "D": "The Delta log is scanned for min and max statistics for the latitude column"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The Parquet file footers are scanned for min and max statistics for the latitude column\n\n❌ Các đáp án sai:\n  A. All records are cached to an operational database and then the filter is applied\n  C. The Hive metastore is scanned for min and max statistics for the latitude column\n  D. The Delta log is scanned for min and max statistics for the latitude column",
    "question_vi": "Hai vị trí dữ liệu phổ biến nhất trên Databricks là DBFS root storage và external object storage mount bằng dbutils.fs.mount(). Câu nào đúng?"
  },
  {
    "id": 190,
    "topic": 1,
    "question": "In order to prevent accidental commits to production data, a senior data engineer has instituted a policy that all development work will reference clones of Delta Lake tables. After testing both DEEP and SHALLOW CLONE, development tables are created using SHALLOW CLON",
    "options": {
      "E": "A few weeks after initial table creation, the cloned versions of several tables implemented as Type 1 Slowly Changing Dimension (SCD) stop working. The transaction logs for the source tables show that VACUUM was run the day before. Which statement describes why the cloned tables are no longer working?",
      "A": "Because Type 1 changes overwrite existing records, Delta Lake cannot guarantee data consistency for cloned tables.",
      "B": "Running VACUUM automatically invalidates any shallow clones of a table; DEEP CLONE should always be used when a cloned table will be repeatedly queried.",
      "C": "The data files compacted by VACUUM are not tracked by the cloned metadata; running REFRESH on the cloned table will pull in recent changes.",
      "D": "The metadata created by the CLONE operation is referencing data files that were purged as invalid by the VACUUM command."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ The metadata created by the CLONE operation is referencing data files that were purged as invalid by the VACUUM command.\n\n❌ Các đáp án sai:\n  A. Because Type 1 changes overwrite existing records, Delta Lake cannot guarantee data consistency for cloned tables.\n  B. Running VACUUM automatically invalidates any shallow clones of a table; DEEP CLONE should always be used when a cloned table will be repeatedly que...\n  C. The data files compacted by VACUUM are not tracked by the cloned metadata; running REFRESH on the cloned table will pull in recent changes.\n  E. A few weeks after initial table creation, the cloned versions of several tables implemented as Type 1 Slowly Changing Dimension (SCD) stop working....",
    "question_vi": "Đoạn mã đã migrate từ workload cũ sang Databricks notebook. Mã thực thi thành công cho kết quả đúng nhưng mất hơn 20 phút để extract và load khoảng 1 GB. Câu nào giải thích hành vi này?"
  },
  {
    "id": 191,
    "topic": 1,
    "question": "A junior data engineer has configured a workload that posts the following JSON to the Databricks REST API endpoint 2.0/jobs/create. Assuming that all configurations and referenced resources are available, which statement describes the result of executing this workload three times?",
    "options": {
      "A": "The logic defined in the referenced notebook will be executed three times on the referenced existing all purpose cluster.",
      "B": "The logic defined in the referenced notebook will be executed three times on new clusters with the configurations of the provided cluster I",
      "C": "Three new jobs named \"Ingest new data\" will be defined in the workspace, but no jobs will be executed.",
      "D": "One new job named \"Ingest new data\" will be defined in the workspace, but it will not be executed."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Three new jobs named \"Ingest new data\" will be defined in the workspace, but no jobs will be executed.\n\n❌ Các đáp án sai:\n  A. The logic defined in the referenced notebook will be executed three times on the referenced existing all purpose cluster.\n  B. The logic defined in the referenced notebook will be executed three times on new clusters with the configurations of the provided cluster I\n  D. One new job named \"Ingest new data\" will be defined in the workspace, but it will not be executed.",
    "question_vi": "Nhóm khoa học dữ liệu yêu cầu hỗ trợ tăng tốc truy vấn trên văn bản tự do từ đánh giá người dùng. Dữ liệu trong Parquet với schema bao gồm cột review chứa toàn bộ văn bản đánh giá. Câu nào mô tả cách tăng tốc truy vấn?"
  },
  {
    "id": 192,
    "topic": 1,
    "question": "A Delta Lake table in the Lakehouse named customer_churn_params is used in churn prediction by the machine learning team. The table contains information about customers derived from a number of upstream sources. Currently, the data engineering team populates this table nightly by overwriting the table with the current valid values derived from upstream data sources. Immediately after each update succeeds, the data engineering team would like to determine the difference between the new version and the previous version of the table. Given the current implementation, which method can be used?",
    "options": {
      "A": "Execute a query to calculate the difference between the new version and the previous version using Delta Lake’s built-in versioning and lime travel functionality.",
      "B": "Parse the Delta Lake transaction log to identify all newly written data files.",
      "C": "Parse the Spark event logs to identify those rows that were updated, inserted, or deleted.",
      "D": "Execute DESCRIBE HISTORY customer_churn_params to obtain the full operation metrics for the update, including a log of all records that have been added or modified."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Execute a query to calculate the difference between the new version and the previous version using Delta Lake’s built-in versioning and lime travel functionality.\n\n❌ Các đáp án sai:\n  B. Parse the Delta Lake transaction log to identify all newly written data files.\n  C. Parse the Spark event logs to identify those rows that were updated, inserted, or deleted.\n  D. Execute DESCRIBE HISTORY customer_churn_params to obtain the full operation metrics for the update, including a log of all records that have been a...",
    "question_vi": "Giả sử Databricks CLI đã cài đặt và cấu hình đúng, lệnh CLI nào upload Python Wheel tùy chỉnh lên object storage mount với DBFS cho job production?"
  },
  {
    "id": 193,
    "topic": 1,
    "question": "A view is registered with the following code: Both users and orders are Delta Lake tables. Which statement describes the results of querying recent_orders?",
    "options": {
      "A": "The versions of each source table will be stored in the table transaction log; query results will be saved to DBFS with each query.",
      "B": "All logic will execute when the table is defined and store the result of joining tables to the DBFS; this stored data will be returned when the table is queried.",
      "C": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query finishes.",
      "D": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query began."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query finishes.\n\n❌ Các đáp án sai:\n  A. The versions of each source table will be stored in the table transaction log; query results will be saved to DBFS with each query.\n  B. All logic will execute when the table is defined and store the result of joining tables to the DBFS; this stored data will be returned when the tab...\n  D. All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query began.",
    "question_vi": "Nhóm BI có dashboard theo dõi tổng hợp cửa hàng bán lẻ. Cho dự báo nhu cầu, Lakehouse chứa bảng đã validate. Đáp án nào mô tả kiến trúc phù hợp?"
  },
  {
    "id": 194,
    "topic": 1,
    "question": "A data engineer is performing a join operation to combine values from a static userLookup table with a streaming DataFrame streamingD",
    "options": {
      "F": "Which code block attempts to perform an invalid stream-static join?",
      "A": "userLookup.join(streamingDF, [\"user_id\"], how=\"right\")",
      "B": "streamingDF.join(userLookup, [\"user_id\"], how=\"inner\")",
      "C": "userLookup.join(streamingDF, [\"user_id\"), how=\"inner\")",
      "D": "userLookup.join(streamingDF, [\"user_id\"], how=\"left\")"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ userLookup.join(streamingDF, [\"user_id\"], how=\"left\")\n\n❌ Các đáp án sai:\n  A. userLookup.join(streamingDF, [\"user_id\"], how=\"right\")\n  B. streamingDF.join(userLookup, [\"user_id\"], how=\"inner\")\n  C. userLookup.join(streamingDF, [\"user_id\"), how=\"inner\")\n  F. Which code block attempts to perform an invalid stream-static join?",
    "question_vi": "Tác vụ nạp dữ liệu yêu cầu ghi dataset JSON 1 TB ra Parquet với part-file mục tiêu 512 MB. Cấu hình nào đạt kích thước file mục tiêu?"
  },
  {
    "id": 195,
    "topic": 1,
    "question": "A junior data engineer has been asked to develop a streaming data pipeline with a grouped aggregation using DataFrame df. The pipeline needs to calculate the average humidity and average temperature for each non-overlapping five-minute interval. Incremental state information should be maintained for 10 minutes for late-arriving data. Streaming DataFrame df has the following schema: \"device_id INT, event_time TIMESTAMP, temp FLOAT, humidity FLOAT\" Code block: Choose the response that correctly fills in the blank within the code block to complete this task.",
    "options": {
      "A": "withWatermark(\"event_time\", \"10 minutes\")",
      "B": "awaitArrival(\"event_time\", \"10 minutes\")",
      "C": "await(\"event_time + ‘10 minutes'\")",
      "D": "slidingWindow(\"event_time\", \"10 minutes\")"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ withWatermark(\"event_time\", \"10 minutes\")\n\n❌ Các đáp án sai:\n  B. awaitArrival(\"event_time\", \"10 minutes\")\n  C. await(\"event_time + ‘10 minutes'\")\n  D. slidingWindow(\"event_time\", \"10 minutes\")",
    "question_vi": "Kiến trúc sư dữ liệu cấu hình DLT pipeline với tham số mặc định. Pipeline dùng Auto Loader nạp log từ cloud storage, enriches bằng static lookup, tạo aggregate. DLT lưu trữ tự động nội dung nào?"
  },
  {
    "id": 196,
    "topic": 1,
    "question": "A data architect has designed a system in which two Structured Streaming jobs will concurrently write to a single bronze Delta table. Each job is subscribing to a different topic from an Apache Kafka source, but they will write data with the same schema. To keep the directory structure simple, a data engineer has decided to nest a checkpoint directory to be shared by both streams. The proposed directory structure is displayed below: Which statement describes whether this checkpoint directory structure is valid for the given scenario and why?",
    "options": {
      "A": "No; Delta Lake manages streaming checkpoints in the transaction log.",
      "B": "Yes; both of the streams can share a single checkpoint directory.",
      "C": "No; only one stream can write to a Delta Lake table.",
      "D": "No; each of the streams needs to have its own checkpoint directory."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ No; each of the streams needs to have its own checkpoint directory.\n\n❌ Các đáp án sai:\n  A. No; Delta Lake manages streaming checkpoints in the transaction log.\n  B. Yes; both of the streams can share a single checkpoint directory.\n  C. No; only one stream can write to a Delta Lake table.",
    "question_vi": "Một Structured Streaming job production gặp trễ giờ cao điểm. Bình thường mỗi microbatch xử lý dưới 3 giây. Giờ cao điểm thỉnh thoảng vượt 30 giây. Câu nào mô tả giải pháp?"
  },
  {
    "id": 197,
    "topic": 1,
    "question": "A Structured Streaming job deployed to production has been experiencing delays during peak hours of the day. At present, during normal execution, each microbatch of data is processed in less than 3 seconds. During peak hours of the day, execution time for each microbatch becomes very inconsistent, sometimes exceeding 30 seconds. The streaming write is currently configured with a trigger interval of 10 seconds. Holding all other variables constant and assuming records need to be processed in less than 10 seconds, which adjustment will meet the requirement?",
    "options": {
      "A": "Decrease the trigger interval to 5 seconds; triggering batches more frequently allows idle executors to begin processing the next batch while longer running tasks from previous batches finish.",
      "B": "Decrease the trigger interval to 5 seconds; triggering batches more frequently may prevent records from backing up and large batches from causing spill.",
      "C": "The trigger interval cannot be modified without modifying the checkpoint directory; to maintain the current stream state, increase the number of shuffle partitions to maximize parallelism.",
      "D": "Use the trigger once option and configure a Databricks job to execute the query every 10 seconds; this ensures all backlogged records are processed with each batch."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Decrease the trigger interval to 5 seconds; triggering batches more frequently may prevent records from backing up and large batches from causing spill.\n\n❌ Các đáp án sai:\n  A. Decrease the trigger interval to 5 seconds; triggering batches more frequently allows idle executors to begin processing the next batch while longe...\n  C. The trigger interval cannot be modified without modifying the checkpoint directory; to maintain the current stream state, increase the number of sh...\n  D. Use the trigger once option and configure a Databricks job to execute the query every 10 seconds; this ensures all backlogged records are processed...",
    "question_vi": "Một DLT pipeline bao gồm streaming table raw_iot nạp dữ liệu thô từ thiết bị nhịp tim; bpm_stats tính thống kê tăng dần từ raw_iot. Làm sao cấu hình pipeline lưu giữ bản ghi xóa/cập nhật thủ công trong raw_iot?"
  },
  {
    "id": 198,
    "topic": 1,
    "question": "Which statement describes the default execution mode for Databricks Auto Loader?",
    "options": {
      "A": "Cloud vendor-specific queue storage and notification services are configured to track newly arriving files; new files are incrementally and idempotently loaded into the target Delta Lake table.",
      "B": "New files are identified by listing the input directory; the target table is materialized by directly querying all valid files in the source directory.",
      "C": "Webhooks trigger a Databricks job to run anytime new data arrives in a source directory; new data are automatically merged into target tables using rules inferred from the data.",
      "D": "New files are identified by listing the input directory; new files are incrementally and idempotently loaded into the target Delta Lake table."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Cloud vendor-specific queue storage and notification services are configured to track newly arriving files; new files are incrementally and idempotently loaded into the target Delta Lake table.\n\n❌ Các đáp án sai:\n  B. New files are identified by listing the input directory; the target table is materialized by directly querying all valid files in the source direct...\n  C. Webhooks trigger a Databricks job to run anytime new data arrives in a source directory; new data are automatically merged into target tables using...\n  D. New files are identified by listing the input directory; new files are incrementally and idempotently loaded into the target Delta Lake table.",
    "question_vi": "Pipeline sử dụng Structured Streaming nạp từ Kafka vào Delta Lake. Dữ liệu lưu bảng bronze. Ba tháng sau, nhóm phát hiện vấn đề độ trễ. Kỹ sư cao cấp sử dụng gì để chẩn đoán?"
  },
  {
    "id": 199,
    "topic": 1,
    "question": "Which statement describes the correct use of pyspark.sql.functions.broadcast?",
    "options": {
      "A": "It marks a column as having low enough cardinality to properly map distinct values to available partitions, allowing a broadcast join.",
      "B": "It marks a column as small enough to store in memory on all executors, allowing a broadcast join.",
      "C": "It caches a copy of the indicated table on all nodes in the cluster for use in all future queries during the cluster lifetime.",
      "D": "It marks a DataFrame as small enough to store in memory on all executors, allowing a broadcast join."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ It marks a DataFrame as small enough to store in memory on all executors, allowing a broadcast join.\n\n❌ Các đáp án sai:\n  A. It marks a column as having low enough cardinality to properly map distinct values to available partitions, allowing a broadcast join.\n  B. It marks a column as small enough to store in memory on all executors, allowing a broadcast join.\n  C. It caches a copy of the indicated table on all nodes in the cluster for use in all future queries during the cluster lifetime.",
    "question_vi": "Kỹ sư dữ liệu mới muốn tận dụng Change Data Feed tạo bảng Type 1 chứa tất cả giá trị đã từng hợp lệ từ bảng bronze có enableChangeDataFeed = true. Dự định chạy job hàng ngày. Kết quả khi chạy nhiều lần?"
  },
  {
    "id": 200,
    "topic": 1,
    "question": "Spill occurs as a result of executing various wide transformations. However, diagnosing spill requires one to proactively look for key indicators. Where in the Spark UI are two of the primary indicators that a partition is spilling to disk?",
    "options": {
      "A": "Stage’s detail screen and Query’s detail screen",
      "B": "Stage’s detail screen and Executor’s log files",
      "C": "Driver’s and Executor’s log files",
      "D": "Executor’s detail screen and Executor’s log files"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Stage’s detail screen and Executor’s log files\n\n❌ Các đáp án sai:\n  A. Stage’s detail screen and Query’s detail screen\n  C. Driver’s and Executor’s log files\n  D. Executor’s detail screen and Executor’s log files",
    "question_vi": "Job hàng đêm nạp dữ liệu vào bảng Delta. Bước tiếp theo cần hàm trả về đối tượng xử lý bản ghi mới chưa được xử lý. Đoạn mã nào hoàn thành? def new_records():"
  },
  {
    "id": 201,
    "topic": 1,
    "question": "An upstream source writes Parquet data as hourly batches to directories named with the current date. A nightly batch job runs the following code to ingest all data from the previous day as indicated by the date variable: Assume that the fields customer_id and order_id serve as a composite key to uniquely identify each order. If the upstream system is known to occasionally produce duplicate entries for a single order hours apart, which statement is correct?",
    "options": {
      "A": "Each write to the orders table will only contain unique records, and only those records without duplicates in the target table will be written.",
      "B": "Each write to the orders table will only contain unique records, but newly written records may have duplicates already present in the target table.",
      "C": "Each write to the orders table will only contain unique records; if existing records with the same key are present in the target table, these records will be overwritten.",
      "D": "Each write to the orders table will run deduplication over the union of new and existing records, ensuring no duplicate records are present."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Each write to the orders table will only contain unique records, but newly written records may have duplicates already present in the target table.\n\n❌ Các đáp án sai:\n  A. Each write to the orders table will only contain unique records, and only those records without duplicates in the target table will be written.\n  C. Each write to the orders table will only contain unique records; if existing records with the same key are present in the target table, these recor...\n  D. Each write to the orders table will run deduplication over the union of new and existing records, ensuring no duplicate records are present.",
    "question_vi": "Kỹ sư dữ liệu mới triển khai logic cho bảng silver_device_recordings. Dữ liệu nguồn chứa 100 trường JSON lồng sâu. Bảng dùng cho dashboard giám sát production và mô hình production. 45 trường đã xác định cần thiết. Cách tiếp cận tốt nhất?"
  },
  {
    "id": 202,
    "topic": 1,
    "question": "A junior data engineer on your team has implemented the following code block. The view new_events contains a batch of records with the same schema as the events Delta table. The event_id field serves as a unique key for this table. When this query is executed, what will happen with new records that have the same event_id as an existing record?",
    "options": {
      "A": "They are merged.",
      "B": "They are ignored.",
      "C": "They are updated.",
      "D": "They are inserted."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ They are ignored.\n\n❌ Các đáp án sai:\n  A. They are merged.\n  C. They are updated.\n  D. They are inserted.",
    "question_vi": "Nhóm kỹ thuật dữ liệu duy trì đoạn mã. Giả sử mã cho kết quả đúng và dữ liệu đã khử trùng lặp, xác thực. Câu nào mô tả kết quả khi thực thi?"
  },
  {
    "id": 203,
    "topic": 1,
    "question": "A new data engineer notices that a critical field was omitted from an application that writes its Kafka source to Delta Lake. This happened even though the critical field was in the Kafka source. That field was further missing from data written to dependent, long-term storage. The retention threshold on the Kafka service is seven days. The pipeline has been in production for three months. Which describes how Delta Lake can help to avoid data loss of this nature in the future?",
    "options": {
      "A": "The Delta log and Structured Streaming checkpoints record the full history of the Kafka producer.",
      "B": "Delta Lake schema evolution can retroactively calculate the correct value for newly added fields, as long as the data was in the original source.",
      "C": "Delta Lake automatically checks that all fields present in the source data are included in the ingestion layer.",
      "D": "Ingesting all raw data and metadata from Kafka to a bronze Delta table creates a permanent, replayable history of the data state."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Ingesting all raw data and metadata from Kafka to a bronze Delta table creates a permanent, replayable history of the data state.\n\n❌ Các đáp án sai:\n  A. The Delta log and Structured Streaming checkpoints record the full history of the Kafka producer.\n  B. Delta Lake schema evolution can retroactively calculate the correct value for newly added fields, as long as the data was in the original source.\n  C. Delta Lake automatically checks that all fields present in the source data are included in the ingestion layer.",
    "question_vi": "Nhóm cấu hình môi trường dev, test, prod trước khi migrate pipeline. Yêu cầu test kỹ dùng dữ liệu gần giống production. Kỹ sư đề xuất clone. Câu nào phù hợp?"
  },
  {
    "id": 204,
    "topic": 1,
    "question": "The data engineering team maintains the following code: Assuming that this code produces logically correct results and the data in the source table has been de-duplicated and validated, which statement describes what will occur when this code is executed?",
    "options": {
      "A": "The silver_customer_sales table will be overwritten by aggregated values calculated from all records in the gold_customer_lifetime_sales_summary table as a batch job.",
      "B": "A batch job will update the gold_customer_lifetime_sales_summary table, replacing only those rows that have different values than the current version of the table, using customer_id as the primary key.",
      "C": "The gold_customer_lifetime_sales_summary table will be overwritten by aggregated values calculated from all records in the silver_customer_sales table as a batch job.",
      "D": "An incremental job will detect if new rows have been written to the silver_customer_sales table; if new rows are detected, all aggregates will be recalculated and used to overwrite the gold_customer_lifetime_sales_summary table."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ The gold_customer_lifetime_sales_summary table will be overwritten by aggregated values calculated from all records in the silver_customer_sales table as a batch job.\n\n❌ Các đáp án sai:\n  A. The silver_customer_sales table will be overwritten by aggregated values calculated from all records in the gold_customer_lifetime_sales_summary ta...\n  B. A batch job will update the gold_customer_lifetime_sales_summary table, replacing only those rows that have different values than the current versi...\n  D. An incremental job will detect if new rows have been written to the silver_customer_sales table; if new rows are detected, all aggregates will be r...",
    "question_vi": "Kiến trúc sư yêu cầu tất cả bảng Lakehouse phải cấu hình là external Delta Lake table. Cách nào đảm bảo yêu cầu?"
  },
  {
    "id": 205,
    "topic": 1,
    "question": "The data engineering team is migrating an enterprise system with thousands of tables and views into the Lakehouse. They plan to implement the target architecture using a series of bronze, silver, and gold tables. Bronze tables will almost exclusively be used by production data engineering workloads, while silver tables will be used to support both data engineering and machine learning workloads. Gold tables will largely serve business intelligence and reporting purposes. While personal identifying information (PII) exists in all tiers of data, pseudonymization and anonymization rules are in place for all data at the silver and gold levels. The organization is interested in reducing security concerns while maximizing the ability to collaborate across diverse teams. Which statement exemplifies best practices for implementing this system?",
    "options": {
      "A": "Isolating tables in separate databases based on data quality tiers allows for easy permissions management through database ACLs and allows physical separation of default storage locations for managed tables.",
      "B": "Because databases on Databricks are merely a logical construct, choices around database organization do not impact security or discoverability in the Lakehouse.",
      "C": "Storing all production tables in a single database provides a unified view of all data assets available throughout the Lakehouse, simplifying discoverability by granting all users view privileges on this database.",
      "D": "Working in the default Databricks database provides the greatest security when working with managed tables, as these will be created in the DBFS root."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Isolating tables in separate databases based on data quality tiers allows for easy permissions management through database ACLs and allows physical separation of default storage locations for managed tables.\n\n❌ Các đáp án sai:\n  B. Because databases on Databricks are merely a logical construct, choices around database organization do not impact security or discoverability in t...\n  C. Storing all production tables in a single database provides a unified view of all data assets available throughout the Lakehouse, simplifying disco...\n  D. Working in the default Databricks database provides the greatest security when working with managed tables, as these will be created in the DBFS root.",
    "question_vi": "Nhóm marketing muốn chia sẻ bảng aggregate với tổ chức bán hàng nhưng tên trường không khớp và một số trường marketing chưa được phê duyệt cho bên bán. Giải pháp đơn giản nhất?"
  },
  {
    "id": 206,
    "topic": 1,
    "question": "The data architect has mandated that all tables in the Lakehouse should be configured as external (also known as \"unmanaged\") Delta Lake tables. Which approach will ensure that this requirement is met?",
    "options": {
      "A": "When a database is being created, make sure that the LOCATION keyword is used.",
      "B": "When the workspace is being configured, make sure that external cloud object storage has been mounted.",
      "C": "When data is saved to a table, make sure that a full file path is specified alongside the USING DELTA clause.",
      "D": "When tables are created, make sure that the UNMANAGED keyword is used in the CREATE TABLE statement."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ When data is saved to a table, make sure that a full file path is specified alongside the USING DELTA clause.\n\n❌ Các đáp án sai:\n  A. When a database is being created, make sure that the LOCATION keyword is used.\n  B. When the workspace is being configured, make sure that external cloud object storage has been mounted.\n  D. When tables are created, make sure that the UNMANAGED keyword is used in the CREATE TABLE statement.",
    "question_vi": "Kỹ sư mới cấu hình thủ công nhiều jobs bằng Jobs UI. Khi review, kỹ sư là \"Owner\" mỗi job. Thử chuyển \"Owner\" cho nhóm \"DevOps\" nhưng không thành công. Nguyên nhân?"
  },
  {
    "id": 207,
    "topic": 1,
    "question": "To reduce storage and compute costs, the data engineering team has been tasked with curating a series of aggregate tables leveraged by business intelligence dashboards, customer-facing applications, production machine learning models, and ad hoc analytical queries. The data engineering team has been made aware of new requirements from a customer-facing application, which is the only downstream workload they manage entirely. As a result, an aggregate table used by numerous teams across the organization will need to have a number of fields renamed, and additional fields will also be added. Which of the solutions addresses the situation while minimally interrupting other teams in the organization without increasing the number of tables that need to be managed?",
    "options": {
      "A": "Send all users notice that the schema for the table will be changing; include in the communication the logic necessary to revert the new table schema to match historic queries.",
      "B": "Configure a new table with all the requisite fields and new names and use this as the source for the customer-facing application; create a view that maintains the original data schema and table name by aliasing select fields from the new table.",
      "C": "Create a new table with the required schema and new fields and use Delta Lake's deep clone functionality to sync up changes committed to one table to the corresponding table.",
      "D": "Replace the current table definition with a logical view defined with the query logic currently writing the aggregate table; create a new table to power the customer-facing application."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Configure a new table with all the requisite fields and new names and use this as the source for the customer-facing application; create a view that maintains the original data schema and table name by aliasing select fields from the new table.\n\n❌ Các đáp án sai:\n  A. Send all users notice that the schema for the table will be changing; include in the communication the logic necessary to revert the new table sche...\n  C. Create a new table with the required schema and new fields and use Delta Lake's deep clone functionality to sync up changes committed to one table ...\n  D. Replace the current table definition with a logical view defined with the query logic currently writing the aggregate table; create a new table to ...",
    "question_vi": "Tất cả bản ghi từ Kafka producer nạp vào bảng Delta Lake. Có 5 topic duy nhất. Chỉ topic \"registration\" chứa PII. Công ty muốn hạn chế truy cập PII. Giải pháp?"
  },
  {
    "id": 208,
    "topic": 1,
    "question": "A Delta Lake table representing metadata about content posts from users has the following schema: user_id LONG, post_text STRING, post_id STRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE Based on the above schema, which column is a good candidate for partitioning the Delta Table?",
    "options": {
      "A": "post_time",
      "B": "date",
      "C": "post_id",
      "D": "user_id"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ date\n\n❌ Các đáp án sai:\n  A. post_time\n  C. post_id\n  D. user_id",
    "question_vi": "Nhóm kỹ sư dữ liệu đang thêm bảng vào DLT pipeline với expectations lặp lại cho nhiều kiểm tra chất lượng dữ liệu giống nhau. Một thành viên đề xuất tái sử dụng các data quality rules. Cách tiếp cận nào cho phép thực hiện điều này?"
  },
  {
    "id": 209,
    "topic": 1,
    "question": "The downstream consumers of a Delta Lake table have been complaining about data quality issues impacting performance in their applications. Specifically, they have complained that invalid latitude and longitude values in the activity_details table have been breaking their ability to use other geolocation processes. A junior engineer has written the following code to add CHECK constraints to the Delta Lake table: A senior engineer has confirmed the above logic is correct and the valid ranges for latitude and longitude are provided, but the code fails when executed. Which statement explains the cause of this failure?",
    "options": {
      "A": "The current table schema does not contain the field valid_coordinates; schema evolution will need to be enabled before altering the table to add a constraint.",
      "B": "The activity_details table already exists; CHECK constraints can only be added during initial table creation.",
      "C": "The activity_details table already contains records that violate the constraints; all existing data must pass CHECK constraints in order to add them to an existing table.",
      "D": "The activity_details table already contains records; CHECK constraints can only be added prior to inserting values into a table."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ The activity_details table already contains records that violate the constraints; all existing data must pass CHECK constraints in order to add them to an existing table.\n\n❌ Các đáp án sai:\n  A. The current table schema does not contain the field valid_coordinates; schema evolution will need to be enabled before altering the table to add a ...\n  B. The activity_details table already exists; CHECK constraints can only be added during initial table creation.\n  D. The activity_details table already contains records; CHECK constraints can only be added prior to inserting values into a table.",
    "question_vi": "Nhóm DevOps cấu hình workload production dạng notebook lập lịch hàng ngày qua Jobs UI. Nhân viên mới cần xem logic production. Quyền notebook tối đa nào cấp được mà không cho phép thay đổi mã production?"
  },
  {
    "id": 210,
    "topic": 1,
    "question": "What is true for Delta Lake?",
    "options": {
      "A": "Views in the Lakehouse maintain a valid cache of the most recent versions of source tables at all times.",
      "B": "Primary and foreign key constraints can be leveraged to ensure duplicate values are never entered into a dimension table.",
      "C": "Delta Lake automatically collects statistics on the first 32 columns of each table which are leveraged in data skipping based on query filters.",
      "D": "Z-order can only be applied to numeric values stored in Delta Lake tables."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Delta Lake automatically collects statistics on the first 32 columns of each table which are leveraged in data skipping based on query filters.\n\n❌ Các đáp án sai:\n  A. Views in the Lakehouse maintain a valid cache of the most recent versions of source tables at all times.\n  B. Primary and foreign key constraints can be leveraged to ensure duplicate values are never entered into a dimension table.\n  D. Z-order can only be applied to numeric values stored in Delta Lake tables.",
    "question_vi": "Điều gì đúng về Delta Lake?"
  },
  {
    "id": 211,
    "topic": 1,
    "question": "The view updates represents an incremental batch of all newly ingested data to be inserted or updated in the customers table. The following logic is used to process these records. Which statement describes this implementation?",
    "options": {
      "A": "The customers table is implemented as a Type 2 table; old values are overwritten and new customers are appended.",
      "B": "The customers table is implemented as a Type 2 table; old values are maintained but marked as no longer current and new values are inserted.",
      "C": "The customers table is implemented as a Type 0 table; all writes are append only with no changes to existing values.",
      "D": "The customers table is implemented as a Type 1 table; old values are overwritten by new values and no history is maintained."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ The customers table is implemented as a Type 2 table; old values are maintained but marked as no longer current and new values are inserted.\n\n❌ Các đáp án sai:\n  A. The customers table is implemented as a Type 2 table; old values are overwritten and new customers are appended.\n  C. The customers table is implemented as a Type 0 table; all writes are append only with no changes to existing values.\n  D. The customers table is implemented as a Type 1 table; old values are overwritten by new values and no history is maintained.",
    "question_vi": "View updates đại diện cho incremental batch dữ liệu mới nạp vào cần insert hoặc update trong bảng customers. Logic sau xử lý các bản ghi này. Câu nào mô tả cách triển khai?"
  },
  {
    "id": 212,
    "topic": 1,
    "question": "A team of data engineers are adding tables to a DLT pipeline that contain repetitive expectations for many of the same data quality checks. One member of the team suggests reusing these data quality rules across all tables defined for this pipeline. What approach would allow them to do this?",
    "options": {
      "A": "Add data quality constraints to tables in this pipeline using an external job with access to pipeline configuration files.",
      "B": "Use global Python variables to make expectations visible across DLT notebooks included in the same pipeline.",
      "C": "Maintain data quality rules in a separate Databricks notebook that each DLT notebook or file can import as a library.",
      "D": "Maintain data quality rules in a Delta table outside of this pipeline's target schema, providing the schema name as a pipeline parameter."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Maintain data quality rules in a separate Databricks notebook that each DLT notebook or file can import as a library.\n\n❌ Các đáp án sai:\n  A. Add data quality constraints to tables in this pipeline using an external job with access to pipeline configuration files.\n  B. Use global Python variables to make expectations visible across DLT notebooks included in the same pipeline.\n  D. Maintain data quality rules in a Delta table outside of this pipeline's target schema, providing the schema name as a pipeline parameter.",
    "question_vi": "Nhóm kỹ sư thêm bảng vào DLT pipeline với expectations lặp lại. Một thành viên đề xuất tái sử dụng data quality rules. Cách nào cho phép?"
  },
  {
    "id": 213,
    "topic": 1,
    "question": "The DevOps team has configured a production workload as a collection of notebooks scheduled to run daily using the Jobs UI. A new data engineering hire is onboarding to the team and has requested access to one of these notebooks to review the production logic. What are the maximum notebook permissions that can be granted to the user without allowing accidental changes to production code or data?",
    "options": {
      "A": "Can manage",
      "B": "Can edit",
      "C": "Can run",
      "D": "Can read"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Can read\n\n❌ Các đáp án sai:\n  A. Can manage\n  B. Can edit\n  C. Can run",
    "question_vi": "Nhóm DevOps cấu hình workload production dạng notebook hàng ngày. Nhân viên mới cần xem logic production. Quyền notebook tối đa được cấp mà không cho thay đổi mã production?"
  },
  {
    "id": 214,
    "topic": 1,
    "question": "A table named user_ltv is being used to create a view that will be used by data analysts on various teams. Users in the workspace are configured into groups, which are used for setting up data access using ACLs. The user_ltv table has the following schema: email STRING, age INT, ltv INT The following view definition is executed: An analyst who is not a member of the marketing group executes the following query: SELECT * FROM email_ltv - Which statement describes the results returned by this query?",
    "options": {
      "A": "Three columns will be returned, but one column will be named \"REDACTED\" and contain only null values.",
      "B": "Only the email and ltv columns will be returned; the email column will contain all null values.",
      "C": "The email and ltv columns will be returned with the values in user_ltv.",
      "D": "Only the email and ltv columns will be returned; the email column will contain the string \"REDACTED\" in each row."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Only the email and ltv columns will be returned; the email column will contain the string \"REDACTED\" in each row.\n\n❌ Các đáp án sai:\n  A. Three columns will be returned, but one column will be named \"REDACTED\" and contain only null values.\n  B. Only the email and ltv columns will be returned; the email column will contain all null values.\n  C. The email and ltv columns will be returned with the values in user_ltv.",
    "question_vi": "Bảng user_ltv tạo view cho nhà phân tích. Người dùng cấu hình theo nhóm cho ACL. Schema: email STRING, age INT, ltv INT. Nhà phân tích không thuộc nhóm managers truy vấn. Kết quả?"
  },
  {
    "id": 215,
    "topic": 1,
    "question": "The data governance team has instituted a requirement that all tables containing Personal Identifiable Information (PII) must be clearly annotated. This includes adding column comments, table comments, and setting the custom table property \"contains_pii\" = true. The following SQL DDL statement is executed to create a new table: Which command allows manual confirmation that these three requirements have been met?",
    "options": {
      "A": "DESCRIBE EXTENDED dev.pii_test",
      "B": "DESCRIBE DETAIL dev.pii_test",
      "C": "SHOW TBLPROPERTIES dev.pii_test",
      "D": "DESCRIBE HISTORY dev.pii_test"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ DESCRIBE EXTENDED dev.pii_test\n\n❌ Các đáp án sai:\n  B. DESCRIBE DETAIL dev.pii_test\n  C. SHOW TBLPROPERTIES dev.pii_test\n  D. DESCRIBE HISTORY dev.pii_test",
    "question_vi": "Nhóm quản trị dữ liệu yêu cầu tất cả bảng chứa PII phải được ghi chú rõ: chú thích cột, chú thích bảng, và thuộc tính \"contains_pii\" = true. Câu lệnh DDL tạo bảng mới. Lệnh nào xác nhận ba yêu cầu đã đáp ứng?"
  },
  {
    "id": 216,
    "topic": 1,
    "question": "The data governance team is reviewing code used for deleting records for compliance with GDPR. They note the following logic is used to delete records from the Delta Lake table named users. Assuming that user_id is a unique identifying key and that delete_requests contains all users that have requested deletion, which statement describes whether successfully executing the above logic guarantees that the records to be deleted are no longer accessible and why?",
    "options": {
      "A": "Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records.",
      "B": "No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data files.",
      "C": "Yes; the Delta cache immediately updates to reflect the latest data files recorded to disk.",
      "D": "No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data files.\n\n❌ Các đáp án sai:\n  A. Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records.\n  C. Yes; the Delta cache immediately updates to reflect the latest data files recorded to disk.\n  D. No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command.",
    "question_vi": "Nhóm quản trị review mã xóa bản ghi tuân thủ GDPR. Logic xóa từ bảng Delta Lake tên users. Giả sử user_id là khóa duy nhất. Câu nào mô tả liệu thực thi thành công có đảm bảo bản ghi cần xóa không còn truy cập được?"
  },
  {
    "id": 217,
    "topic": 1,
    "question": "The data architect has decided that once data has been ingested from external sources into the Databricks Lakehouse, table access controls will be leveraged to manage permissions for all production tables and views. The following logic was executed to grant privileges for interactive queries on a production database to the core engineering group. GRANT USAGE ON DATABASE prod TO eng; GRANT SELECT ON DATABASE prod TO eng; Assuming these are the only privileges that have been granted to the eng group and that these users are not workspace administrators, which statement describes their privileges?",
    "options": {
      "A": "Group members are able to create, query, and modify all tables and views in the prod database, but cannot define custom functions.",
      "B": "Group members are able to list all tables in the prod database but are not able to see the results of any queries on those tables.",
      "C": "Group members are able to query and modify all tables and views in the prod database, but cannot create new tables or views.",
      "D": "Group members are able to query all tables and views in the prod database, but cannot create or edit anything in the database."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Group members are able to query all tables and views in the prod database, but cannot create or edit anything in the database.\n\n❌ Các đáp án sai:\n  A. Group members are able to create, query, and modify all tables and views in the prod database, but cannot define custom functions.\n  B. Group members are able to list all tables in the prod database but are not able to see the results of any queries on those tables.\n  C. Group members are able to query and modify all tables and views in the prod database, but cannot create new tables or views.",
    "question_vi": "Kiến trúc sư quyết định sau khi nạp dữ liệu từ nguồn bên ngoài vào Lakehouse, table access controls sẽ quản lý quyền cho tất cả bảng và view production. Logic sau cấp quyền: GRANT USAGE ON DATABASE prod TO eng; GRANT SELECT ON DATABASE prod TO eng; Giả sử đây là quyền duy nhất cho nhóm eng và họ không phải admin. Câu nào mô tả quyền của họ?"
  },
  {
    "id": 218,
    "topic": 1,
    "question": "A user wants to use DLT expectations to validate that a derived table report contains all records from the source, included in the table validation_copy. The user attempts and fails to accomplish this by adding an expectation to the report table definition. Which approach would allow using DLT expectations to validate all expected records are present in this table?",
    "options": {
      "A": "Define a temporary table that performs a left outer join on validation_copy and report, and define an expectation that no report key values are null",
      "B": "Define a SQL UDF that performs a left outer join on two tables, and check if this returns null values for report key values in a DLT expectation for the report table",
      "C": "Define a view that performs a left outer join on validation_copy and report, and reference this view in DLT expectations for the report table",
      "D": "Define a function that performs a left outer join on validation_copy and report, and check against the result in a DLT expectation for the report table"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Define a temporary table that performs a left outer join on validation_copy and report, and define an expectation that no report key values are null\n\n❌ Các đáp án sai:\n  B. Define a SQL UDF that performs a left outer join on two tables, and check if this returns null values for report key values in a DLT expectation fo...\n  C. Define a view that performs a left outer join on validation_copy and report, and reference this view in DLT expectations for the report table\n  D. Define a function that performs a left outer join on validation_copy and report, and check against the result in a DLT expectation for the report t...",
    "question_vi": "Người dùng muốn sử dụng DLT expectations để xác thực bảng dẫn xuất report chứa tất cả bản ghi từ nguồn validation_copy. Thử thêm expectation nhưng thất bại. Cách nào cho phép sử dụng DLT expectations để xác thực?"
  },
  {
    "id": 219,
    "topic": 1,
    "question": "A user new to Databricks is trying to troubleshoot long execution times for some pipeline logic they are working on. Presently, the user is executing code cell-by-cell, using display() calls to confirm code is producing the logically correct results as new transformations are added to an operation. To get a measure of average time to execute, the user is running each cell multiple times interactively. Which of the following adjustments will get a more accurate measure of how code is likely to perform in production?",
    "options": {
      "A": "The Jobs UI should be leveraged to occasionally run the notebook as a job and track execution time during incremental code development because Photon can only be enabled on clusters launched for scheduled jobs.",
      "B": "The only way to meaningfully troubleshoot code execution times in development notebooks is to use production-sized data and production- sized clusters with Run All execution.",
      "C": "Production code development should only be done using an IDE; executing code against a local build of open source Spark and Delta Lake will provide the most accurate benchmarks for how code will perform in production.",
      "D": "Calling display() forces a job to trigger, while many transformations will only add to the logical query plan; because of caching, repeated execution of the same logic does not provide meaningful results."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Calling display() forces a job to trigger, while many transformations will only add to the logical query plan; because of caching, repeated execution of the same logic does not provide meaningful results.\n\n❌ Các đáp án sai:\n  A. The Jobs UI should be leveraged to occasionally run the notebook as a job and track execution time during incremental code development because Phot...\n  B. The only way to meaningfully troubleshoot code execution times in development notebooks is to use production-sized data and production- sized clust...\n  C. Production code development should only be done using an IDE; executing code against a local build of open source Spark and Delta Lake will provide...",
    "question_vi": "Người dùng mới Databricks đang troubleshoot thời gian thực thi lâu. Chạy mã từng ô, dùng display() xác nhận kết quả, chạy nhiều lần để đo thời gian. Thay đổi nào đo chính xác hơn cách mã hoạt động trong production?"
  },
  {
    "id": 220,
    "topic": 1,
    "question": "Where in the Spark UI can one diagnose a performance problem induced by not leveraging predicate push-down?",
    "options": {
      "A": "In the Executor’s log file, by grepping for \"predicate push-down\"",
      "B": "In the Stage’s Detail screen, in the Completed Stages table, by noting the size of data read from the Input column",
      "C": "In the Query Detail screen, by interpreting the Physical Plan",
      "D": "In the Delta Lake transaction log. by noting the column statistics"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ In the Query Detail screen, by interpreting the Physical Plan\n\n❌ Các đáp án sai:\n  A. In the Executor’s log file, by grepping for \"predicate push-down\"\n  B. In the Stage’s Detail screen, in the Completed Stages table, by noting the size of data read from the Input column\n  D. In the Delta Lake transaction log. by noting the column statistics",
    "question_vi": "Ở đâu trong Spark UI có thể chẩn đoán vấn đề hiệu suất do không tận dụng predicate push-down?"
  },
  {
    "id": 221,
    "topic": 1,
    "question": "A data engineer needs to capture pipeline settings from an existing setting in the workspace, and use them to create and version a JSON file to create a new pipeline. Which command should the data engineer enter in a web terminal configured with the Databricks CLI?",
    "options": {
      "A": "Use list pipelines to get the specs for all pipelines; get the pipeline spec from the returned results; parse and use this to create a pipeline",
      "B": "Stop the existing pipeline; use the returned settings in a reset command",
      "C": "Use the get command to capture the settings for the existing pipeline; remove the pipeline_id and rename the pipeline; use this in a create command",
      "D": "Use the clone command to create a copy of an existing pipeline; use the get JSON command to get the pipeline definition; save this to git"
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Use the get command to capture the settings for the existing pipeline; remove the pipeline_id and rename the pipeline; use this in a create command\n\n❌ Các đáp án sai:\n  A. Use list pipelines to get the specs for all pipelines; get the pipeline spec from the returned results; parse and use this to create a pipeline\n  B. Stop the existing pipeline; use the returned settings in a reset command\n  D. Use the clone command to create a copy of an existing pipeline; use the get JSON command to get the pipeline definition; save this to git",
    "question_vi": "Kỹ sư dữ liệu cần lấy cài đặt pipeline từ thiết lập hiện có trong workspace, tạo và quản lý phiên bản file JSON cho pipeline mới. Lệnh nào nhập trong web terminal đã cấu hình Databricks CLI?"
  },
  {
    "id": 222,
    "topic": 1,
    "question": "Which Python variable contains a list of directories to be searched when trying to locate required modules?",
    "options": {
      "A": "importlib.resource_path",
      "B": "sys.path",
      "C": "os.path",
      "D": "pypi.path"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ sys.path\n\n❌ Các đáp án sai:\n  A. importlib.resource_path\n  C. os.path\n  D. pypi.path",
    "question_vi": "Biến Python nào chứa danh sách thư mục được tìm kiếm khi định vị module cần thiết?"
  },
  {
    "id": 223,
    "topic": 1,
    "question": "You are testing a collection of mathematical functions, one of which calculates the area under a curve as described by another function. assert(myIntegrate(lambda x: x*x, 0, 3) [0] == 9) Which kind of test would the above line exemplify?",
    "options": {
      "A": "Unit",
      "B": "Manual",
      "C": "Functional",
      "D": "Integration"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ Unit\n\n❌ Các đáp án sai:\n  B. Manual\n  C. Functional\n  D. Integration",
    "question_vi": "Bạn đang test tập hợp hàm toán học, một trong đó tính diện tích dưới đường cong. assert(myIntegrate(lambda x: x*x, 0, 3)[0] == 9). Dòng trên là ví dụ loại test nào?"
  },
  {
    "id": 224,
    "topic": 1,
    "question": "What is a key benefit of an end-to-end test?",
    "options": {
      "A": "It makes it easier to automate your test suite",
      "B": "It pinpoints errors in the building blocks of your application",
      "C": "It provides testing coverage for all code paths and branches",
      "D": "It closely simulates real world usage of your application"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ It closely simulates real world usage of your application\n\n❌ Các đáp án sai:\n  A. It makes it easier to automate your test suite\n  B. It pinpoints errors in the building blocks of your application\n  C. It provides testing coverage for all code paths and branches",
    "question_vi": "Lợi ích chính của end-to-end test là gì?"
  },
  {
    "id": 225,
    "topic": 1,
    "question": "Which REST API call can be used to review the notebooks configured to run as tasks in a multi-task job?",
    "options": {
      "A": "/jobs/runs/list",
      "B": "/jobs/list",
      "C": "/jobs/runs/get",
      "D": "/jobs/get"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ /jobs/get\n\n❌ Các đáp án sai:\n  A. /jobs/runs/list\n  B. /jobs/list\n  C. /jobs/runs/get",
    "question_vi": "Lệnh REST API nào xem các notebook cấu hình chạy dưới dạng tasks trong multi-task job?"
  },
  {
    "id": 226,
    "topic": 1,
    "question": "A Data Engineer wants to run unit tests using common Python testing frameworks on Python functions defined across several Databricks notebooks currently used in production. How can the data engineer run unit tests against functions that work with data in production?",
    "options": {
      "A": "Define and import unit test functions from a separate Databricks notebook",
      "B": "Define and unit test functions using Files in Repos",
      "C": "Run unit tests against non-production data that closely mirrors production",
      "D": "Define unit tests and functions within the same notebook"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Define and unit test functions using Files in Repos\n\n❌ Các đáp án sai:\n  A. Define and import unit test functions from a separate Databricks notebook\n  C. Run unit tests against non-production data that closely mirrors production\n  D. Define unit tests and functions within the same notebook",
    "question_vi": "Kỹ sư dữ liệu muốn chạy unit tests bằng testing framework Python phổ biến trên các hàm Python trong nhiều Databricks notebook production. Làm sao chạy unit tests đối với hàm làm việc với dữ liệu production?"
  },
  {
    "id": 227,
    "topic": 1,
    "question": "A data engineer wants to refactor the following DLT code, which includes multiple table definitions with very similar code. In an attempt to programmatically create these tables using a parameterized table definition, the data engineer writes the following code. The pipeline runs an update with this refactored code, but generates a different DAG showing incorrect configuration values for these tables. How can the data engineer fix this?",
    "options": {
      "A": "Wrap the for loop inside another table definition, using generalized names and properties to replace with those from the inner table definition.",
      "B": "Convert the list of configuration values to a dictionary of table settings, using table names as keys.",
      "C": "Move the table definition into a separate function, and make calls to this function using different input parameters inside the for loop.",
      "D": "Load the configuration values for these tables from a separate file, located at a path provided by a pipeline parameter."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Move the table definition into a separate function, and make calls to this function using different input parameters inside the for loop.\n\n❌ Các đáp án sai:\n  A. Wrap the for loop inside another table definition, using generalized names and properties to replace with those from the inner table definition.\n  B. Convert the list of configuration values to a dictionary of table settings, using table names as keys.\n  D. Load the configuration values for these tables from a separate file, located at a path provided by a pipeline parameter.",
    "question_vi": "Kỹ sư muốn refactor mã DLT có nhiều định nghĩa bảng giống nhau. Viết mã parameterized table definition. Pipeline chạy nhưng tạo DAG khác với giá trị cấu hình sai. Sửa thế nào?"
  },
  {
    "id": 228,
    "topic": 1,
    "question": "A data engineer has created a 'transactions' Delta table on Databricks that should be used by the analytics team. The analytics team wants to use the table with another tool which requires Apache Iceberg format. What should the data engineer do?",
    "options": {
      "A": "Require the analytics team to use a tool which supports Delta table.",
      "B": "Create an Iceberg copy of the 'transactions' Delta table which can be used by the analytics team.",
      "C": "Convert the 'transactions' Delta to Iceberg and enable uniform so that the table can be read as a Delta table.",
      "D": "Enable uniform on the transactions table to 'iceberg' so that the table can be read as an Iceberg table."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Enable uniform on the transactions table to 'iceberg' so that the table can be read as an Iceberg table.\n\n❌ Các đáp án sai:\n  A. Require the analytics team to use a tool which supports Delta table.\n  B. Create an Iceberg copy of the 'transactions' Delta table which can be used by the analytics team.\n  C. Convert the 'transactions' Delta to Iceberg and enable uniform so that the table can be read as a Delta table.",
    "question_vi": "Kỹ sư đã tạo bảng Delta 'transactions' trên Databricks cho nhóm phân tích. Nhóm muốn dùng bảng với công cụ khác yêu cầu Apache Iceberg. Kỹ sư nên làm gì?"
  },
  {
    "id": 229,
    "topic": 1,
    "question": "A junior data engineer is working to implement logic for a Lakehouse table named silver_device_recordings. The source data contains 100 unique fields in a highly nested JSON structure. The silver_device_recordings table will be used downstream for highly selective joins on a number of fields, and will also be leveraged by the machine learning team to filter on a handful of relevant fields. In total, 15 fields have been identified that will often be used for filter and join logic. The data engineer is trying to determine the best approach for dealing with these nested fields before declaring the table schema. Which of the following accurately presents information about Delta Lake and Databricks that may impact their decision-making process?",
    "options": {
      "A": "Because Delta Lake uses Parquet for data storage, Dremel encoding information for nesting can be directly referenced by the Delta transaction log.",
      "B": "Schema inference and evolution on Databricks ensure that inferred types will always accurately match the data types used by downstream systems.",
      "C": "The Tungsten encoding used by Databricks is optimized for storing string data; newly-added native support for querying JSON strings means that string types are always most efficient.",
      "D": "By default, Delta Lake collects statistics on the first 32 columns in a table; these statistics are leveraged for data skipping when executing selective queries."
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ By default, Delta Lake collects statistics on the first 32 columns in a table; these statistics are leveraged for data skipping when executing selective queries.\n\n❌ Các đáp án sai:\n  A. Because Delta Lake uses Parquet for data storage, Dremel encoding information for nesting can be directly referenced by the Delta transaction log.\n  B. Schema inference and evolution on Databricks ensure that inferred types will always accurately match the data types used by downstream systems.\n  C. The Tungsten encoding used by Databricks is optimized for storing string data; newly-added native support for querying JSON strings means that stri...",
    "question_vi": "Kỹ sư mới triển khai logic cho bảng silver_device_recordings. Dữ liệu 100 trường JSON lồng sâu. Bảng dùng cho selective joins và nhóm ML lọc. 15 trường thường dùng cho filter/join. Đáp án nào cung cấp thông tin chính xác về Delta Lake và Databricks ảnh hưởng đến quyết định?"
  },
  {
    "id": 230,
    "topic": 1,
    "question": "A platform engineer is creating catalogs and schemas for the development team to use. The engineer has created an initial catalog, Catalog_A, and initial schema, Schema_",
    "options": {
      "A": "The owner of the schema does not automatically have permission to tables within the schema, but can grant them to themselves at any point.",
      "B": "Users granted with USE CATALOG can modify the owner's permissions to downstream tables.",
      "C": "Permissions explicitly given by the table creator are the only way the Platform Engineer could access the underlying tables in their schema.",
      "D": "The platform engineer needs to execute a REFRESH statement as the table permissions did not automatically update for owners."
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ The owner of the schema does not automatically have permission to tables within the schema, but can grant them to themselves at any point.\n\n❌ Các đáp án sai:\n  B. Users granted with USE CATALOG can modify the owner's permissions to downstream tables.\n  C. Permissions explicitly given by the table creator are the only way the Platform Engineer could access the underlying tables in their schema.\n  D. The platform engineer needs to execute a REFRESH statement as the table permissions did not automatically update for owners.",
    "question_vi": "Kỹ sư platform tạo catalogs và schemas cho nhóm phát triển. Đã tạo Catalog_A và Schema_A ban đầu. Câu nào mô tả bước tiếp theo?"
  },
  {
    "id": 231,
    "topic": 1,
    "question": "A data engineer has created a new cluster using shared access mode with default configurations. The data engineer needs to allow the development team access to view the driver logs if needed. What are the minimal cluster permissions that allow the development team to accomplish this?",
    "options": {
      "A": "CAN VIEW",
      "B": "CAN RESTART",
      "C": "CAN ATTACH TO",
      "D": "CAN MANAGE"
    },
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n→ CAN VIEW\n\n❌ Các đáp án sai:\n  B. CAN RESTART\n  C. CAN ATTACH TO\n  D. CAN MANAGE",
    "question_vi": "Kỹ sư tạo cluster mới shared access mode cấu hình mặc định. Cần cho nhóm phát triển xem driver logs. Quyền cluster tối thiểu?"
  },
  {
    "id": 232,
    "topic": 1,
    "question": "A data engineer wants to create a cluster using the Databricks CLI for a big ETL pipeline. The cluster should have five workers and one driver of type i3.xlarge and should use the '14.3.x-scala2.12' runtime. Which command should the data engineer use?",
    "options": {
      "A": "databricks compute add 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster",
      "B": "databricks clusters create 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster",
      "C": "databricks compute create 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster",
      "D": "databricks clusters add 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ databricks clusters create 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster\n\n❌ Các đáp án sai:\n  A. databricks compute add 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster\n  C. databricks compute create 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster\n  D. databricks clusters add 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster",
    "question_vi": "Kỹ sư muốn tạo cluster bằng Databricks CLI cho pipeline ETL lớn. Cluster cần 5 workers, 1 driver i3.xlarge, runtime '14.3.x-scala2.12'. Lệnh nào?"
  },
  {
    "id": 233,
    "topic": 1,
    "question": "A 'transactions' table has been liquid clustered on the columns 'product_id’, ’user_id' and 'event_date'. Which operation lacks support for cluster on write?",
    "options": {
      "A": "CTAS and RTAS statements",
      "B": "spark.writeStream.format(’delta').mode(’append’)",
      "C": "spark.write.format('delta’).mode('append')",
      "D": "INSERT INTO operations"
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ spark.writeStream.format(’delta').mode(’append’)\n\n❌ Các đáp án sai:\n  A. CTAS and RTAS statements\n  C. spark.write.format('delta’).mode('append')\n  D. INSERT INTO operations",
    "question_vi": "Bảng 'transactions' đã liquid clustered trên cột 'product_id', 'user_id', 'event_date'. Thao tác nào không hỗ trợ cluster on write?"
  },
  {
    "id": 234,
    "topic": 1,
    "question": "The data governance team has instituted a requirement that the \"user\" table containing Personal Identifiable Information (PII) must have the appropriate masking on the SSN column. This means that anyone outside of the HRAdminGroup should see masked social security numbers as ***-**-****. The team created a masking function: What does the data governance team need to do next to achieve this goal?",
    "options": {
      "A": "CREATE TABLE users - (name STRING); ALTER TABLE users CREATE COLUMN ssn CREATE MASK ssn_mask;",
      "B": "CREATE TABLE users - (name STRING, int STRING); ALTER TABLE users ALTER COLUMN ssn CREATE MASK if is_member('HRAdminGroup');",
      "C": "CREATE TABLE users - (name STRING, ssn INT MASKED ssn_mask);",
      "D": "CREATE TABLE users - (name STRING, ssn STRING); ALTER TABLE users ALTER COLUMN ssn SET MASK ssn_mask;"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ CREATE TABLE users - (name STRING, ssn STRING); ALTER TABLE users ALTER COLUMN ssn SET MASK ssn_mask;\n\n❌ Các đáp án sai:\n  A. CREATE TABLE users - (name STRING); ALTER TABLE users CREATE COLUMN ssn CREATE MASK ssn_mask;\n  B. CREATE TABLE users - (name STRING, int STRING); ALTER TABLE users ALTER COLUMN ssn CREATE MASK if is_member('HRAdminGroup');\n  C. CREATE TABLE users - (name STRING, ssn INT MASKED ssn_mask);",
    "question_vi": "Nhóm quản trị yêu cầu bảng \"user\" chứa PII phải có masking trên cột SSN. Ai ngoài HRAdminGroup sẽ thấy ***-**-****. Nhóm đã tạo hàm masking. Cần làm gì tiếp?"
  },
  {
    "id": 235,
    "topic": 1,
    "question": "A data engineer needs to create an application that will collect information about the latest job run including the repair history. How should the data engineer format the request?",
    "options": {
      "A": "Call/api/2.1/jobs/runs/list with the run_id and include_history parameters",
      "B": "Call/api/2.1/jobs/runs/get with the run_id and include_history parameters",
      "C": "Call/api/2.1/jobs/runs/get with the job_id and include_history parameters",
      "D": "Call/api/2.1/jobs/runs/list with the job_id and include_history parameters"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Call/api/2.1/jobs/runs/list with the job_id and include_history parameters\n\n❌ Các đáp án sai:\n  A. Call/api/2.1/jobs/runs/list with the run_id and include_history parameters\n  B. Call/api/2.1/jobs/runs/get with the run_id and include_history parameters\n  C. Call/api/2.1/jobs/runs/get with the job_id and include_history parameters",
    "question_vi": "Kỹ sư cần tạo ứng dụng thu thập thông tin về lần chạy job gần nhất bao gồm lịch sử sửa chữa. Định dạng request thế nào?"
  },
  {
    "id": 236,
    "topic": 1,
    "question": "A data engineer is working in an interactive notebook with many transformations before outputting the result from display(df.collect() ). The notebook includes wide transformations and a cross join. The data engineer is getting the following error: \"The spark driver has stopped unexpectedly and is restarting. Your notebook will be automatically reattached.\" Which action should the data engineer take?",
    "options": {
      "A": "Run the notebook on a single node cluster to keep driver from falling.",
      "B": "Rewrite their code to avoid putting memory pressure on the driver node.",
      "C": "Check into the Spark UI to see how many jobs are assigned to each stage as they are employing fewer executors.",
      "D": "Look at the compute metrics UI to see if the executors have higher than 90% memory utilization."
    },
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n→ Rewrite their code to avoid putting memory pressure on the driver node.\n\n❌ Các đáp án sai:\n  A. Run the notebook on a single node cluster to keep driver from falling.\n  C. Check into the Spark UI to see how many jobs are assigned to each stage as they are employing fewer executors.\n  D. Look at the compute metrics UI to see if the executors have higher than 90% memory utilization.",
    "question_vi": "Kỹ sư làm việc trong notebook tương tác với nhiều biến đổi trước display(df.collect()). Có wide transformations và cross join. Gặp lỗi: \"The spark driver has stopped unexpectedly and is restarting.\" Nên làm gì?"
  },
  {
    "id": 237,
    "topic": 1,
    "question": "An analytics team wants run an experiment in the short term on the customer transaction Delta table (with 20 billions records) created by the data engineering team in Databricks SQL. Which strategy should the data engineering team use to ensure minimal downtime and no impact on the ongoing ETL processes?",
    "options": {
      "A": "Deep clone the table for the analytics team.",
      "B": "Create a new table for the analytics team using a CTAS statement.",
      "C": "Shallow clone the table for the analytics team.",
      "D": "Give access to the table for the analytics team."
    },
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n→ Shallow clone the table for the analytics team.\n\n❌ Các đáp án sai:\n  A. Deep clone the table for the analytics team.\n  B. Create a new table for the analytics team using a CTAS statement.\n  D. Give access to the table for the analytics team.",
    "question_vi": "Nhóm phân tích muốn chạy thực nghiệm ngắn hạn trên bảng Delta giao dịch khách hàng (20 tỷ bản ghi) trong Databricks SQL. Chiến lược nào đảm bảo downtime tối thiểu và không ảnh hưởng ETL đang chạy?"
  },
  {
    "id": 238,
    "topic": 1,
    "question": "A data team is working to optimize an existing large, fast-growing table 'orders' with high cardinality columns, which experiences significant data skew and requires frequent concurrent writes. The team notice that the columns 'user_id', 'event_timestamp' and 'product_id' are heavily used in analytical queries and filters, although those keys may be subject to change in the future due to different business requirements. Which partitioning strategy should the team choose to optimize the table for immediate data skipping, incremental management over time, and flexibility?",
    "options": {
      "A": "Partition the table with: ALTER TABLE orders PARTITION BY user_id, product_id, event_timestamp",
      "B": "Use z-order after partitiing the table: OPTIMIZE orders ZORDER BY (user_id, product_id) WHERE event_timestamp = current date () - 1 DAY",
      "C": "Cluster the table with: ALTER TABLE orders CLUSTER BY user_id, product_id, event_timestamp",
      "D": "Z-order the table with OPTIMIZE orders ZORDER BY (user_id, product_id, event_timestamp)"
    },
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n→ Z-order the table with OPTIMIZE orders ZORDER BY (user_id, product_id, event_timestamp)\n\n❌ Các đáp án sai:\n  A. Partition the table with: ALTER TABLE orders PARTITION BY user_id, product_id, event_timestamp\n  B. Use z-order after partitiing the table: OPTIMIZE orders ZORDER BY (user_id, product_id) WHERE event_timestamp = current date () - 1 DAY\n  C. Cluster the table with: ALTER TABLE orders CLUSTER BY user_id, product_id, event_timestamp",
    "question_vi": "Nhóm tối ưu bảng 'orders' lớn, tăng trưởng nhanh, cardinality cao, data skew đáng kể, cần ghi đồng thời thường xuyên. Các cột 'user_id', 'event_timestamp', 'product_id' dùng nhiều trong truy vấn và bộ lọc, nhưng có thể thay đổi do yêu cầu kinh doanh. Chiến lược phân vùng nào tối ưu cho data skipping, quản lý tăng dần, và linh hoạt?"
  }
];

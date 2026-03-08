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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrong Databricks, để truyền và nhận tham số (parameter) từ Jobs API hoặc giao diện UI một cách an toàn và chuẩn xác nhất, ta sử dụng `dbutils.widgets`. Lệnh `dbutils.widgets.text(\"date\", \"null\")` sẽ khởi tạo widget (nếu chạy trên UI) hoặc đăng ký tham số (khi chạy Job). Sau đó, `dbutils.widgets.get(\"date\")` sẽ lấy giá trị thực tế của tham số đó để đưa vào mã Python. Các cách dùng `sys.argv` (áp dụng cho python script nguyên thuỷ) hay lệnh `input()` đều không hoạt động đúng trong môi trường Databricks Notebook chạy qua Jobs API.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCụm cluster đã được cài đặt tự động tắt (terminate) sau 30 phút để tiết kiệm chi phí. Khi user cần chạy lại lúc cụm đang ở trạng thái \"Terminated\", quyền \"Can Attach To\" là không đủ (vì nó chỉ áp dụng khi cluster đang chạy). Quyền \"Can Restart\" cung cấp mức độ cho phép vừa vặn nhất: user có thể khởi động lại (start) cụm đã tắt, và sau đó được phép \"Attach to\" để chạy lệnh. Việc cấp Workspace Admin hay \"Can Manage\" là trao quyền quá mức (excessive) không cần thiết.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐể duy trì các tác vụ Structured Streaming ổn định và tối ưu chi phí (production), best practices khuyên dùng:\n1. **Cluster: New Job Cluster** (Mới cho mỗi Job): Đảm bảo tách biệt môi trường, giảm rủi ro lỗi bộ nhớ và chi phí cũng rẻ hơn All-Purpose Cluster.\n2. **Retries: Unlimited**: Streaming thường gặp lỗi mạng tạm thời (transient). Việc set thử lại không giới hạn giúp job tự động khôi phục.\n3. **Maximum Concurrent Runs: 1**: Streaming dùng cơ chế Checkpoints để lưu trạng thái. Nếu nhiều luồng chạy song song (concurrent runs > 1) sẽ ghi đè lên cùng 1 checkpoint, gây xung đột và hỏng dữ liệu.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nThông báo cảnh báo (Alert) này sử dụng một câu lệnh SQL gom nhóm theo `sensor_id` và tính hàm `mean(temperature)` (tức là Average/Trung bình). Điều kiện kích hoạt là `mean(temperature) > 120`. Do Alert kích hoạt báo lỗi mỗi phút một lần và kéo dài liên tục 3 phút, điều này khẳng định tại cả 3 lần chạy liên tiếp (1 phút/lần), đã có ít nhất một cảm biến (sensor) có trị số \"Nhiệt độ trung bình\" (Average) thỏa mãn điều kiện > 120.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrong tính năng Databricks Repos, Git cục bộ trong workspace đóng vai trò như một bản sao (clone) của Remote Git (như GitHub). Khi một nhánh (như dev-2.3.9) đã được đồng nghiệp tạo trên Remote nhưng chưa hiện ở dropdown Repos của người dùng, đó là do Repos cục bộ chưa fetch bản cập nhật. Nút \"Pull\" trong giao diện của Databricks Repos sẽ kéo toàn bộ danh sách Branch cùng commit mới nhất về. Sau đó người dùng mới có thể tuỳ chọn (checkout) sang nhánh đó để xem code hiện tại.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nModule `dbutils.secrets` của Databricks được thiết kế để giấu nhẹm (redact) bất kỳ nội dung nào trùng khớp với giá trị khóa bí mật khi nó xuất hiện trong Standard Output (như lệnh `print`). Mặc dù mật khẩu được truyền thành công vào chuỗi kết nối ở tầng background (nên kết nối tới external table vẫn succeed), nhưng dòng lệnh `print()` xuất ra màn hình sẽ bị Databricks bắt lại và tự động thay thế chuỗi mật khẩu thật bằng chữ `[REDACTED]` để bảo vệ.\n",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nYêu cầu đặt ra là lưu kết quả \"có khả năng so sánh qua các thời điểm\" (tức là giữ lại lịch sử các ngày) và \"chạy tối đa 1 lần/ngày\". Vì chỉ chạy 1 lần/ngày, việc dùng các hàm Streaming (như `readStream`, `writeStream`) là tốn tài nguyên liên tục một cách không cần thiết. Cách tối ưu (minimize compute costs) là viết theo Batch (thực thi xong rồi tắt): dùng hàm DataFrame API `write.mode(\"append\")` để chèn thêm phân vùng mới vào bảng Delta thay vì ghi đè (`overwrite`).",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nThực thi logic đọc batch theo ngày: Các bản ghi được lấy trong \"hôm qua\" sẽ là bộ dữ liệu unique nội tại nếu chúng ta áp dụng deduplicate. Tuy nhiên, nó sẽ CHỈ KHÔNG CHỨA BẢN SAO đối chiếu với chính các record trong khối batch đó. Giao dịch Write Mode cơ bản sẽ không tự động so sánh toàn bộ bản ghi này với bảng (Target Table) đã lưu trước đó. Do upstream đôi khi tạo ra duplicate *vài giờ sau*, rất có thể 1 record gốc nằm ở ngày X, nhưng bản duplicate bị kéo sang batch của ngày Y, dẫn tới khi Write thì bảng orders vẫn dính duplicate giữa các ngày.\n",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhả năng liên tác (interoperability) giữa các ngôn ngữ trong một Databricks Notebook như `%python` và `%sql`. Nếu bạn tạo một Object Python thuần túy (ví dụ 1 danh sách chuỗi list strings `countries_af`), Spark SQL Kernel sẽ không thể hiểu hoặc query trực tiếp bằng lệnh `SELECT * FROM countries_af` như một bảng dữ liệu. Bắt buộc bạn phải dùng PySpark để chuyển biến List đó thành một Dataframe, và đăng ký nó dạng View tạm bằng `.createOrReplaceTempView(\"countries_af\")` thì câu truy vấn SQL sau đó (Cmd 2) mới chạy thành công.",
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
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrái ngược với hệ thập phân Parquet tiêu chuẩn đọc min/max stat từ đuôi file Footer, công cụ Delta Engine sử dụng cơ chế Data Skipping nâng cao được lưu trữ sẵn bên trong sổ cái giao dịch Delta (Delta Transaction Log - thư mục `_delta_log`). Khi có câu query `latitude > 66.3`, Delta engine chỉ việc đọc các tệp JSON/Checkpoint trong Delta Log để quét cột statistics, sau đó tự điều hướng tới trực tiếp các tệp parquet chứa dữ liệu thoả mãn mà không cần phải mở Footer của từng file Parquet để kiểm tra.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nLệnh VACUUM dùng để xóa vĩnh viễn các tệp dữ liệu không còn được tham chiếu (như các bản ghi đã bị DELETE) và cũ hơn một khoảng thời gian giữ lại ấn định (Retention Threshold). Tuy mặc định Retention của Delta Lake là 7 ngày (168 giờ), nhưng nếu lệnh VACUUM kích hoạt và xóa tệp thành công, khả năng Time Travel về dữ liệu đó sẽ biến mất lập tức. Câu hỏi ngụ ý VACUUM Job được hẹn giờ chạy vào 3am Thứ Hai (tức 26 tiếng sau khi chạy Delete job lúc 1am Chủ Nhật), nên dữ liệu bị xóa chỉ có thể khôi phục qua time travel trong khoảng thời gian ~24 tiếng này.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nEndpoint Databricks REST API `2.0/jobs/create` chỉ có chức năng ĐỊNH NGHĨA (Define) một Job mới trong Workspace, đăng ký tên và các cấu hình liên quan. Nó KHÔNG tự động kích hoạt (execute) Job đó. Để định nghĩa và chạy ngay lập tức, người ta mới dùng endpoint `2.0/jobs/run-now`. Vì vậy, khi gửi request 3 lần vào `/create`, hệ thống sẽ tạo ra 3 Job Definitions mới tinh mang tên \"Ingest new data\", nhưng không có Job nào được chạy.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nYêu cầu bài toán gồm 2 vế: (1) Lưu trữ toàn bộ lịch sử các luồng thay đổi (Audit Logging) và (2) Cung cấp bảng phân tích chỉ chứa số liệu mới nhất (Analytical). Cách thiết kế Lakehouse chuẩn nhất là viết toàn bộ log thô (insert, update, delete) nhồi vào một bảng Bronze để không mất dữ liệu lịch sử. Sau đó từ bảng Bronze, ta dùng lệnh `MERGE INTO` để quét các pk_id và chỉ cập nhật (hoặc xóa) các bản ghi mới nhất vào bảng Silver. Bảng Silver lúc này chính là trạng thái \"hiện tại nhất\" của dữ liệu, đạt yêu cầu phân tích.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nViệc lọc (Filter) các bản ghi trong `account_history` có giá trị `last_updated` và `last_login` ứng với giờ gần nhất giúp ta khoanh vùng được những Account nào đã phát sinh giao dịch/sự kiện mới. Sau khi tìm ra được trạng thái (phiên bản) mới nhất của từng User ID, ta dùng cú pháp `MERGE` để Upsert (Insert/Update) vào bảng `account_current` (bảng Type 1 - Ghi đè trạng thái cũ). Việc này rất tối ưu cho khối lượng dữ liệu khổng lồ vì ta chỉ tính toán và Merge những Account có biến động trong 1 giờ qua, chứ không ghi đè lại toàn bộ triệu người dùng.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nThay vì dùng logic OVERWRITE (xóa toàn phần bảng và viết lại), việc chuyển qua MERGE INTO sẽ chỉ tác động tới những row có sự thay đổi từ nguồn. Tính năng `Change Data Feed` (CDF) của Delta Lake cung cấp khả năng track được chính xác row nào vừa bị Insert / Update / Delete ở lần Merge đó. Team Data Science chỉ việc đọc luồng CDF này ra và áp dụng model lên đúng những khách hàng vừa có biến động dữ liệu. Điều này giúp hệ thống khỏi phải chạy model cồng kềnh cho các User vốn không có data đổi tay trong suốt 24h.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhi bạn dùng lệnh `CREATE OR REPLACE VIEW`, bản chất là bạn đang tạo ra một khung nhìn (cấu trúc logic ảo) chứ không phải lưu dữ liệu vật lý xuống đĩa (DBFS). Khung nhìn (View) này sẽ kéo và tính toán lại câu lệnh SQL bên trong (JOIN giữa bảng users và orders) dựa theo trạng thái bảng TẠI ĐÚNG THỜI ĐIỂM người dùng truy vấn Query (at query time). Nghĩa là, nếu bảng nguồn thay đổi thì View khi Query cũng sẽ lập tức cho ra dữ liệu nội suy mới nhất.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nVới tính năng `Auto Compaction` (Tự động nén tệp) trong một luồng ghi Structured Streaming diễn ra liên tục (Always-on) kết hợp lệnh MERGE, lượng dữ liệu mới vào bảng (Bronze/Silver) sẽ nhỏ giọt liên tục. Để tối ưu tốc độ đọc-ghi nhanh, Databricks sẽ tự động điều chỉnh (autotuned) size mục tiêu của các tệp Parquet xuống mức nhỏ hơn (thay vì cố gộp lên hẳn 1 GB) nhằm giúp tiến trình Merge các file Delta nhanh gọn lẻ tẻ và không làm tăng độ trễ (latency) của luồng streaming.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhi bạn chạy JOIN một luồng dữ liệu thời gian thực (Stream DataFrame) với một bảng tĩnh (Static DataFrame - thường nằm ở Delta Lake), tại ĐẦU MỖI MICRO-BATCH, Spark tự động chớp lấy Version (phiên bản) mới nhất lúc đó của bảng Delta Tĩnh để nạp lên thực hiện phép Join. Việc này giúp luồng Stream luôn được đối chiếu với Bộ Master Data (bảng tĩnh) cập nhật nhất mà không cần phải tắt/bật lại Streaming Job.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrong PySpark Structured Streaming, để nhóm dữ liệu (group by) dựa trên khía cạnh Thời gian (Timestamp), ta không thể dùng `groupBy` thông thường mà phải dùng hàm Windowing. Cú pháp `window(\"event_time\", \"5 minutes\")` sẽ tự động chặt mốc thời gian thành các khung cửa sổ 5 phút không chéo lấn (non-overlapping / Tumbling window), gom các event rớt vào cửa sổ đó lại và tính toán `avg()` cho bước tiếp theo.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nThư mục Checkpoint (Checkpoint Directory) trong Structured Streaming đóng vai trò như \"sổ ghi nợ\" lưu trữ offset hiện tại (bản ghi nào Kafka đã đọc thành công) và file state. Nó TUYỆT ĐỐI không bao giờ được phép chia sẻ (share) giữa nhiều ứng dụng streaming song song nhau. Nếu ghi chung, luồng stream này sẽ ghi đè checkpoint của luồng stream kia, dẫn đến mất checkpoint và dữ liệu hỏng. Mỗi job bắt buộc phải có checkpoint folder cô lập, cho dù chúng cùng ghi vào 1 bảng Delta duy nhất (Đọc đồng thời vào Delta là hoàn toàn cho phép).",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhi độ trễ (execution time) của Micro-batch vào giờ cao điểm dao động vọt lên quá lâu (hơn 30 giây) so với Trigger mặc định (10 giây), việc hàng đợi stream phải duy trì cluster chờ đợi liên tục rất kém hiệu quả. Thay đổi cấu hình Job thành \"Trigger Once\" (hoặc \"AvailableNow\" ở bản mới) kết hợp với công cụ lên lịch (Scheduler) của Databricks Job chạy đều đặn mỗi 10 giây sẽ biến luồng Streaming thành các mini-batch. Mỗi mini-batch sẽ lấy hốt sạch lượng dữ liệu tồn đọng trong hàng đợi và xử lý dứt điểm, giảm hẳn chi phí duy trì trạng thái Idle cho hệ thống.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTính năng `Auto Compaction` (Nén tự động) trên Databricks là một Background Job tự khởi chạy ngay sau khi lệnh Ghi dữ liệu (Write commits) hoàn tất và sinh ra nhiều file nhỏ. Nó sẽ ngầm gom nhóm (OPTIMIZE) các khối file vụn vặt đó thành một tệp Parquet lớn hơn, chạy ẩn song song phía sau. Đặc điểm nhận diện của Compaction là kích thước đích tối ưu hướng đến sẽ linh hoạt tùy vào loại bảng, nhưng default cơ chế sẽ cố nén dồn tiệm cận quy chuẩn dung lượng (từ 128MB tới 1GB) để tăng tối đa tốc độ đọc cho Delta Tables.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCốt lõi (Programming Model) của Spark Structured Streaming cực kỳ đơn giản và thanh lịch đó là: Khái niệm \"Bảng tĩnh\" và \"Bảng luồng\" là một! Nó coi luồng dữ liệu trực tiếp đang được đưa vào (New data stream) y hệt như những dòng (rows) mới đang liên tục được gắn theo dạng APPEND vào một bảng cơ sở dữ liệu ảo vô tận (Unbounded Table). Nhờ mô hình này, ta có thể dễ dàng viết mã Dataframe / SQL cho Streaming hệt như cách ta truy vấn file CSV Batch.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhi Spark đọc dữ liệu từ các file cục bộ/cloud để kéo vào bộ nhớ Memory tạo thành DataFrame, tham số `spark.sql.files.maxPartitionBytes` định nghĩa KÍCH THƯỚC GIỚI HẠN DỮ LIỆU TỐI ĐA (tính bằng byte - mặc định 128MB) được phép đóng gói vào bên trong một phân vùng Spark Partition đơn lẻ. Thông số này quyết định trực tiếp số lượng Task và kích cỡ cục bộ dữ liệu rải đều trong cụm tính toán ở chặng đọc (Ingestion Stage).",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nHiện tượng \"Skew\" (Dữ liệu bị lệch sóng) xảy ra khi dữ liệu của một/một số key tập trung dồn dập vào cùng duy nhất một Partition (ví dụ key \"Trạng thái: Hoàn tất\" đếm chiếm 99% tổng dòng). Hệ quả là Executor chịu trách nhiệm giải quyết Partition đó sẽ phải oằn mình làm việc lâu gấp cả ngàn lần (max duration rất cao) trong khi phần lớn các Executor kia nắm các partition ít dữ liệu nên chạy xong chớp nhoáng (min và median ngắn). Cả Job Pipeline sẽ bị nghẽn (bottleneck) và phải chờ task chậm nhất này.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nHướng dẫn Best Practice cho Spark Shuffle / Wide Transformation (như GroupBy, Join) luôn khuyên KHÔNG NÊN nhồi quá nhiều CPU Cores vào chung 1 Executor duy nhất vì rất dễ gây ra tình trạng khóa luồng rác bộ nhớ (JVM Garbage Collection overhead) và I/O rớt mạng (network saturation). Giới hạn Vàng số Cores / 1 Executor để Spark chạy nhanh mượt thường nằm ở mốc 4 đến 5 Cores. Option B với (8 VMs * 20 Cores) có tính phân tán cao hơn nhiều so với việc bắt một máy gánh 160 Core cùng lúc (A), đồng thời RAM (50GB) không quá nhỏ để gây lỗi Spill như C.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nViệc ứng xử ra sao với dữ liệu dính trùng `event_id` được quyết định bởi hành động (Action) viết mã DataFrame vào Database. Câu hỏi này nhắm vào chức năng của `MERGE INTO ... WHEN NOT MATCHED THEN INSERT` phổ biến trong Databricks, nơi mà các bản ghi mới có Key ĐÃ TỒN TẠI (trùng `event_id`) sẽ bị loại bỏ bỏ qua (Ignored) để không gây trùng lặp, còn những bản ghi mới chưa hề có dấu vết thì mới được Insert.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nChange Data Feed (CDF) phơi bày ra toàn bộ dòng mô tả Lịch sử CRUD của mỗi hàng (Insert, Update_Preimage, Update_Postimage, Delete). Nếu kỹ sư CHỈ DÙNG LUẬT APPEND (Nối đuôi thêm) toàn bộ Output từ bảng bật rãnh CDF sang target table mà không có bất kỳ lệnh gạt bỏ/Merge nào, thì mọi chỉnh sửa của một ID (ví dụ 1 order được khách báo Đổi địa chỉ 5 lần) đều sẽ bị vứt thẳng vào Target Table thành 5 Row khác biệt trùng ID. Điều đó gây nhiễu và đẻ ra hàng loạt dư thừa trùng lặp (Duplicate Entries).",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKiến trúc Bronze (Raw layer) của Medallion Lakehouse yêu cầu Ingestion trực tiếp và KHÔNG ĐƯỢC PHÉP CHỈNH SỬA / MẤT MÁT nguyên bản dữ liệu đổ từ luồng ống gốc. Kể cả khi logic Silver layer (Do App lỗi code) vứt nhầm 1 field rất quan trọng, toàn bộ JSON payload gốc vẫn an toàn nằm vẹn nguyên tại bảng Delta Bronze. Chúng ta có thể quay lại đọc lại (Replay) vĩnh viễn dòng thời gian bằng cách viết lại Logic mới cho luồng Bronze -> Silver để trích xuất cái Field từng bị quên kia, xóa bỏ vĩnh viễn mối đe doạ data mất dạng sau 7 ngày trên Kafka.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTham số options `readChangeFeed` sử dụng để khai báo rằng hàm DataFrame nên truy vấn vào lớp dữ liệu bảng CDF (Change Data Feed) thay cho bảng tĩnh. Cho job chạy theo từng đợt hằng đêm (Nightly Job), thao tác đọc Batch (qua `.read.` của PySpark DataFrame) chứ KHÔNG PHẢI thao tác cấu hình Stream (.readStream.) là phù hợp nhất. Đoạn lệnh `spark.read.option(\"readChangeFeed\", \"true\").table(...)` sẽ fetch ra danh sách records đổi mới tính từ Version Delta được set.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n`Schema Inference` (Dự đoán kiểu dữ liệu) tiện thì có tiện, nhưng rủi ro nhầm lẫn datatype là khổng lồ đối với JSON phức tạp lồng nhau chứa tận 100 Keys (Ví dụ: ID là String nhưng có đợt toàn số, Spark sẽ Inferred ra Long, làm gãy code đợt sau). Định nghĩa ép kiểu rõ ráng (Schema Declaration / DDL) ngay từ đầu cho bảng Silver cung cấp tính răn đe độ tin cậy của chất lượng dữ liệu (Data Quality Enforcement), loại trừ thẳng tay nếu kiểu json hỏng xó từ khâu Ingestion.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMã viết batch truyền thống với Dataframe `.write.mode(\"overwrite\")` là phương thức phá hủy-và-xây-lại. Mỗi lần đoạn mã Batch Job chạy, Spark sẽ mở 3 bảng nguồn lên đếm đếm Joined tốn rất nhiều công, rồi thẳng tay vứt (Overwrite) bản version cũ của `enriched_itemized_orders_by_account` để nhét toàn bộ đống dữ liệu tĩnh vừa Join xuống đĩa cứng. Cách viết thô sơ này không có tính Incremental, dẫu không có dòng dữ liệu nào thay đổi, nó vẫn hì hục Replace lại 100%.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nPhương pháp tối ưu (Best Practice) quản trị kiến trúc Medallion Lakehouse là quy hoạch tách biệt MỖI LỚP (Bronze, Silver, Gold,...) THÀNH MỘT DATABASE riêng rẽ trên Databricks. Nhờ cấu trúc logic Database, người quản trị Workspace (Admin) có hể phân phối ACLs Access Control cực dễ dàng (VD: Data Scientist được read DB Silver, Marketing chỉ được dùng DB Gold), đồng thời Map ổ đĩa Cloud Storage vật lý chứa database cũng được băm chia theo tầng lớp an toàn.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nBảng Managed Delta Table sẽ được Databricks tự cấu hình đường dẫn tới bucket default `/user/hive/warehouse`. Ngược lại, External Delta Table là Bảng trỏ tới một thùng chứa data (Azure ADLS, AWS S3) có địa chỉ tùy biến riêng của Data Team. Bằng việc chèn từ khoá `LOCATION 's3://my-bucket/path/to/table'` trong lệnh `CREATE TABLE`, ta ép Hive Metastore phải khai sinh bảng với loại tuỳ chỉnh External Table.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMục tiêu của bài toán: Cần bảng MỚI cho app mới, vừa phải đổi tên Field, vừa thêm Field mới. Nhưng bảng CŨ lại đang dùng bởi hàng chục Team khác (họ sẽ sụp nếu ta can thiệp đổi Column bảng này). Cách khôn ngoan nhất gỡ nút thắt Tương Thích Ngược (Backward compatibility) là: Phá bảng Aggregate cũ đi, định danh một bảng Delta Hoàn Toàn Mới chứa đúng data mới/Field Đổi. Bù lại, ta dựng nên một VIEW dùng TÊN và SCHEMA y hệt Bảng CŨ và select đổ ra từ bảng mới. Các phòng ban khác vẫn query vào View đó và hoạt động bình thường, không ai bị thương tích.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nHệ thống tự tối ưu và bỏ qua phân vùng/tệp tin rác không chứa dữ liệu cần tìm là Data Skipping. Với mệnh đề `longitude < 20 & longitude > -20`, Delta Engine sẽ kiểm tra trực tiếp sổ log giao dịch Delta (Delta Log - Transaction logs). Quá trình đối chiếu các cột thống kê (Statistics) Min_Value/Max_Value chứa sẵn ở Log sẽ lập tức trả về cho Engine danh sách những files nào CÓ THỂ chứa kinh độ (longitude) khớp khoảng trên, giúp bỏ qua hẳn việc tải hàng ngàn Data files không liên quan lên bộ nhớ.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nData Gravity - Dữ liệu ở đâu thì Máy Chủ tính toán (Compute VM Workspace) phải đẻ ra ở quanh đó. Nếu Cloud Storage Bucket chứa Data nằm trên AWS region Mỹ (US-East-1) mà Cụm Databricks Spark Workspace lại được thuê tại Data Center bên khu vực Ấn Độ (ap-south-1), thì việc Đọc-Ghi chéo lục địa đại dương sẽ đốt cháy một khoản phí băng thông mạng siêu khủng, kèm tốc độ trễ/Lag cực chậm. Do vậy Workspace bắt buộc đặt tại Mỹ dù Engineer ở tận đâu.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrong Databricks phiên bản thời điểm kiểm tra, các ràng buộc điều kiện nội soi (CHECK constraints) đôi khi chỉ được hỗ trợ khai báo cùng thời điểm chạy lệnh khởi tạo sinh bảng (Initial Table Creation / CTAS). Việc bảng đã tồn tại sẵn, đã có data sau đó gọi `ALTER TABLE ADD CONSTRAINT` sẽ bị Engine chặn lại do khả năng cao không tương thích cơ chế kiểm định Schema Constraint cho hệ quản trị giao dịch có sẵn (trừ chức năng NOT NULL).",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐể đảm bảo quá trình Data Skipping qua Delta Logs File chạy với tốc độ tên lửa, Delta Engine giới hạn việc tự động tích luỹ thu thập dữ liệu thống kê min, max, count, nulls... CHỈ CHO 32 CỘT ĐẦU TIÊN (first 32 columns) của Bảng. Những cột từ 33 trở đi sẽ bị ignore (không thu gom thông tin Statistic) nhằm giữ cho File Checkpoint JSON của ổ Delta Log nhẹ nhàng và nhanh lẹ. Nếu bạn muốn thay đổi, bạn phải manual config `dataSkippingNumIndexedCols`.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐặc tả kỹ thuật của bảng Slowly Changing Dimension (SCD) theo chuẩn **Type 2**: Lịch sử của Object được giữ lại toàn vẹn qua các dòng mốc thời gian. Bản ghi trị giá cũ sẽ KHÔNG bao giờ bị ghi đè hay xóa sổ (Overwrite), nó chỉ bị gạt biến cờ đánh dấu (Ví dụ `is_active = FALSE` hoặc Update `end_date = hôm_nay`). Sau đó, hệ thống sẽ chèn / INSERT thêm một Bản ghi dòng mới tinh chứa bộ Profile User mới, với cờ đính kèm là Active. Cách này làm Data To lên, nhưng bù lại ghi nhận hoàn toàn Timeline quá khứ.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐể cho một nhân sự mới xem mã nguồn Notebook đang cấu hình chạy Production Job mà không lo họ vô tình can thiệp/lưu lại (save) làm thay đổi logic, quyền cao nhất và an toàn nhất là `Can Read`. Quyền này cho phép người dùng mở xem nội dung code từng cell một cách đầy đủ nhưng nút Run và Save bị vô hiệu hóa hoàn toàn.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhi tạo View (Khung nhìn) trong Databricks, ta có thể cài đặt Dynamic View (View động) kết hợp với hàm cấp quyền `is_account_group_member('marketing')`. Nếu User gõ lệnh SELECT thỏa mãn thuộc nhóm Marketing, họ sẽ thấy Email thật. Còn nếu Analyst này KHÔNG CÓ TRONG NHÓM, logic hàm IF/CASE bên trong View sẽ nhảy sang luồng thay thế chuỗi Email thành chữ \"REDACTED\". Tuy nhiên cột ltv (không bị che) thì vẫn trả về bình thường. Do đó Đáp án E là chính xác.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCâu lệnh `DESCRIBE EXTENDED tên_bảng` là lệnh xuất ra bản báo cáo tóm tắt toàn diện nhất về bảng Delta. Nó sẽ hiển thị danh sách tất cả các Cột kèm theo *Column Comments* (chú thích cột), và ở dưới cùng nó có phần Detailed Table Information chứa *Table Comments* cùng với các *Table Properties* (ví dụ `contains_pii = true`). Lệnh `DESCRIBE DETAIL` thì chỉ ưu tiên show Table Properties (mà bỏ quên Column Comment).",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nLệnh `DELETE FROM` trong Delta Lake cung cấp cơ chế ACID siêu chuẩn xác, nó sẽ tạo một tệp Parquet mới CHỈ CHỨA NHỮNG BẢN GHI KHÔNG BỊ XÓA, rồi ghi vào Transaction Log rằng phiên bản hiện tại từ nay đã loại các Row bị xóa. TUY NHIÊN, về mặt lưu trữ ổ cứng, tệp Parquet CŨ (chứa danh sách Data đã bị xóa đó) vẫn hoàn toàn nằm phơi thây trên Cloud Storage (phục vụ chức năng Time Travel). Nên muốn tuân thủ triệt để GDPR (xóa bay màu file cứng), bạn PHẢI CHẠY lệnh `VACUUM` cho bảng đó.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhi bạn dùng mệnh đề `LOCATION '/mnt/...'` trong tiến trình tạo Database hoặc tạo Bảng, bạn đang ép Databricks không được cất giữ File Parquet ở nơi quy định của hệ thống Default nội bộ (Manage Table). Do đó lúc tạo Bảng kế tiếp `CREATE TABLE` và trỏ vào Database chỉ định, Databricks hiểu ngay đây là bảng `External Table` (Bảng bên ngoài), vì dữ liệu nằm độc lập ở /mnt external bucket.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTính năng Data Redaction của Databricks Secret (Cơ chế che mật khẩu thành chữ `[REDACTED]` khi hiện ra màn hình stdout) dựa trên việc khớp TRỌN VẸN toàn bộ chuỗi ký tự mật khẩu. Nó khá \"ngốc nghếch\"! Nếu một nội gián ác ý dùng vòng lặp `for char in dbutils.secrets.get(...): print(char)`, lúc in ra mỗi dòng chỉ có 1 ký tự lẻ loi rời rạc, cơ chế Che giấu sẽ không nhận diện được đoạn substring bị vỡ vụn đó, và mật khẩu bị lộ hoàn toàn trên màn hình (Plain text).",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nLịch sử chạy Jobs (Job Runs History) trên cụm Databricks thường duy trì trong khoảng thời gian 60 ngày. Trong 60 ngày này, kết quả in ra của từng Cell, Log lỗi hay Console Output đều có thể được export tải xuống dưới dạng HTML tĩnh hoặc JSON API để tiện cho việc kiểm toán luồng dữ liệu.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nDatabricks Audit Logs (Nhật ký tốn toán) hoạt động cực kì rạch ròi. Bất kỳ khi nào một Request API đập vào hệ thống (cho dù là /create hay /run-now), Token của ai vung ra thì tên người đó được đóng dấu Auth Identity. Do User A tạo job (create), Log Create chép tên A. Do User B chủ động gọi API Start/Trigger, Log Trigger ghi nhận tên B. Không có chuyện hệ thống gộp chung tự suy diễn.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTuyệt chiêu Lười biếng (Lazy Evaluation) của Spark khiến việc băm các cục Transform từng tí một bằng tổ hợp phím Shift+Enter trên Notebook là ảo mộng nếu không vấp phải 1 Action. Lệnh `display()` kích hoạt Action, ép hệ thống chạy dồn toa toàn bộ chuỗi Pipeline trước đó. Sự nguy hiểm là sau lần Run đầu, file được hệ thống bỏ sẵn vào Disk/RAM Cache, làm các lần bấm chạy cell lặp lại của Engineer kia hoàn thành thần tốc trong nháy mắt. Benchmark như vậy hoàn toàn vô nghĩa so với Cold-start dưới Production.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMô hình Spark chia làm Driver (nhạc trưởng) và Executor (nhạc công). Khi tải công việc Dữ liệu quá nặng bị bắt phải tính toán ở DUY NHẤT một cục node Driver (Ví dụ lỡ tay dùng `.collect()` rồi băm logic Python thường), thì các Node Executor ngồi chơi xơi nước vì Driver chả thèm phân luồng Giao task (Shuffle) qua mạng xuống cho chúng. Dấu hiệu hiện rành rành trên biểu đồ Ganglia là Nút Driver CPU dâng cao chót vót nhưng \"Network I/O\" (Giao tiếp mạng chuyển byte) lại nằm bẹp dí (never spikes).",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTính năng Ép lọc sâu `Predicate Push-down` (Lọc đẩy) cho phép Engine chặn dữ liệu ngay ở cổng Đọc File Storage thay vì Vác toàn bộ file nặng nề lên RAM rồi mới Filter. Nơi duy nhất để kỹ sư soi xem Spark có thực sự đang dùng phép Pushdown hay không chính là Màn hình \"Spark UI > SQL Query Detail\". Tới phần Graph DAG màu xanh, click vô khối Scan Parquet/Scan Delta cuối cùng dòng `Physical Plan`, ta sẽ thấy rõ dòng \"PushedFilters: [IsNotNull(id)...]\" nếu nó đang hoạt động hoàn hảo.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nHệ sinh thái PySpark đòi hỏi sự chuẩn mực trong Dataframe Column Reference. Thông thường người ta chọn cột bằng cú pháp `df[\"heartrate\"]` hoặc `col(\"heartrate\")`. Việc dùng Object alias `df.heartrate` đôi khi bị lẫn lộn giữa cú pháp Class Attribute gốc của Python nếu chuỗi đó dính các Method bị trùng lặp, gây ra lỗi Cú pháp TypeError lúc Python cố Evaluate phép nhân Toán học. Do vậy Error báo Object không thể Multiplied sinh ra do Parser fail nhận diện Cột.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐể triển khai Custom Python Code Modules (Thư viện tự code) vào Databricks Clusters, chuẩn gói Distribution được Databricks support cực chu đáo cho python chính là Python Wheels (.whl). Bạn chỉ việc Compile source Python thành file `.whl`, quăng vảo ổ đĩa DBFS hoặc kho s3, rồi trỏ Install Packages trên cụm Job tới đường dẫn đó. (Lưu ý: JAR là cài cho gói ngôn ngữ Scala/Java).",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nBiến `sys.path` trong thư viện chuẩn `sys` của Python chứa danh sách (list) toàn bộ các đường dẫn thư mục gốc mà Trình thông dịch Python sẽ cố gắng lùng sục rà quét hòng tìm cho ra File Library mỗi khi bạn có hiệu lệnh `import ...`. Bằng thủ thuật chèn thêm Path ổ mạng hoặc /dbfs vào `sys.path.append()`, Databricks Notebook có thể import ngon lành các Repo bên ngoài.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nUnit test (Kiểm thử đơn vị), đúng như tên gọi, là đập vụn Logic App lớn thành các \"Đơn vị Hàm con\" lẻ tẻ và dội Input/Output ảo kiểm tra. Lợi ích lớn nhất của việc mất công nhào nặn cấu trúc Code (Refactoring) cho Unit test là khi 1 Hàm bị tạch, ta biết ngay rành rành Lỗi đến từ dòng Code ở \"Bước xử lý Chuẩn Hóa chữ In Hoa\" này, thay vì phải chạy vã mồ hôi hàng giờ đồng hồ nguyên một con Data Pipeline dài dằng dặc rồi khóc thét chả hiểu rớt Data ở khâu nào (Troubleshooting is easier).",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrái ngược với Unit test cô lập 1 Function, Integration Testing (Kiểm thử Tích Hợp) đảm đương sứ mệnh ráp nối nhiều Service, Database, Module lại với nhau. Thử nghiệm này xác nhận xem cái Subsystem Ghi JSON có nhét trọn vẹn data vào được ống Subsystem Kafka đầu kia hay không, hoặc DB có tương tác trơn tru với API hay không. Đáp án là Validates interactions between subsystems.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nEndpoint `GET /2.1/jobs/get?job_id=XYZ` là trái tim của hệ thống truy vấn thông tin định hình. Khi gọi Request này, payload JSON trả về sẽ trút xuống rành rọt tên Job, cụm Cluster ảo, thông số Schedule và ĐẶC BIỆT LÀ bộ mảng mảng `tasks: []` gồm tất cả các con Notebook đa luồng (Multi-task) đang nằm chi chít bên trong sơ đồ Pipeline của Job đó.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMulti-task Job của Databricks cho phép nhồi sơ đồ DAG (Dependence Graph). Rất khác với Relation Database RDBMS truyền thống (Lỗi thì Rollback Undo lại). Databricks Delta Lake lưu dữ liệu ở cấp Task từng Notebook. Task A làm đúng thì Task A sinh ra file Data lưu cứng trên Đĩa. Kể cả luồng Task C chết (do code ngu / OutOfMem), thì Task A và B vẫn bình an vô sự và Dữ liệu Của Task A + B ĐÃ ĐƯỢC COMMIT CHẮC CHẮN. Cụm Lakehouse không có chuyện \"Undo/Rollback tự động toàn bộ DAG\" vì Fail 1 node ở cuối đuôi.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nVới Bảng External / Delta Lake, tên Bảng (Table Name) chỉ là cái \"Bìa sổ\" (Metastore pointer) treo ở Hive. Cục vàng thật sự (Files Parquet) vẫn chôn im lìm ở /mnt/bucket/. Lệnh `RENAME TO` chỉ đơn thuần lôi kéo cái Bìa sổ dính lại cái tên mới trong Metastore Catalog, vĩnh viễn không hề cựa quậy động chạm hay bưng bê dời đổi một megabytes data file vật lý nào cả. Cực nhanh!",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nSự lợi hại của bảng Thống Kê Tổng Hợp (Aggregated Table). Bảng Gốc `daily_store_sales` có thể bị Sale Manager \"Sửa tay lén\" tiền hàng về hôm qua (update value). Nếu dùng Append đắp thêm, Data sẽ nhân đôi trùng. Nếu Overwrite thì giựt sập toàn bảng Dashboard làm khựng hệ thống. Phương án chói lòa nhất là lệnh Batch Update UPSERT (`MERGE INTO`). Nó sẽ chạy SQL Sum/Avg hằng đêm, dòng nào (Ngày/Store) chưa có thì đắp mới vào, dòng nào bị đổi Data sửa tay bên gốc thì cập nhật gạch đè đúng dòng đó, siêu mượt.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nLệnh Cmd 6 trong Notebook thường là gọi `display(df)`. Bạn phải luôn tự giác xóa Sạch hoặc comment lại mấy lệnh render bảng biểu đồ Hữu hình (Interactive Visualization) trước khi ném Code vào Schedule Automated Data Pipeline. Vì khi chạy tự động ngầm dưới Background vắng bóng con người, thao tác Render đồ thị tĩnh vừa đốt Compute RAM vô nghĩa, vừa dễ treo Node nếu Output quá dài.",
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
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án từ PDF): Yêu cầu bài ra là chỉ cần update Dashboard Hourly (Mỗi giờ) và Script mất 10 phút. Nếu cắm Streaming (Job C) bắt Cluster sống luôn tục thì nướng cháy túi tiền. Lựa chọn RẺ NHẤT (Lowest cost) và chuẩn nhất là Setup Schedule Đặt giờ: cứ 1 tiếng gọi Job Cluster dậy (New job cluster), quét Batch 10 phút tải lên, rồi tắt Cluster ngủ bù 50 phút. Tuy nhiên PDF key là C do ngụ ý Trigger.Once trong Streaming. Ở đây tôi hướng dẫn bản chất thực của Cost tối ưu là Batch Pipeline/Trigger Once.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nVới định dạng Delta Parquet thông minh, 1 Table khi gọi truy vấn rỗng `SELECT COUNT(*)` mà chẳng có WHERE, Engine Delta KHÔNG HỀ ngớ ngẩn đi quét mòn rách ổ đĩa file hòng đếm từng Row một. Nó mở thư mục siêu nhẹ `_delta_log` ra, và bốc lấy tổng Sum_Records đã được tích lũy sẵn trong File Checkpoint JSON gần nhất của Giao dịch hiện hành. Đếm bằng metadata này trả kết quả 0.001 giây.",
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
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Chú ý: Đáp án trong bộ đề trích xuất là D nhưng sai bản chất theo Databricks Docs, đáp án thật sự đúng về Delta Architecture là B). Khi Bảng được định nghĩa trỏ LOCATION vào `/path/to/data/` (Bảng External Table). Lệnh XÓA `DROP TABLE` tới từ Admin Đơn Thuần chỉ tháo gỡ tên của bảng đó khỏi Danh bạ Tra cứu (Hive Metastore Catalog). Nguyên đống Data Parquet vật lý dưới nền tảng (Storage) chẳng sứt mẻ lấy 1 phân.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nWait, Cảnh báo: DBFS Root KHÔNG BAO GIỜ bị bay hơi (ephemeral) nếu bạn ghi vào đúng Persistent Cloud Bucket. Bất chấp bộ đề có gài câu trả lời kì quặc nào cho Q65, điều bạn cần biết là việc Gắn /Mount Storage ngoài là best-practice để kết nối Azure Data Lake hoặc AWS S3 vào Workspace hòng cô lập các khu vực Data bảo mật. Ghi vào Mount Storage giúp Data sống dai sống thọ độc lập với vòng đời tồn vong của Cụm Databricks đang chạy.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nBạn gõ `%sh mv file /dbfs/data` để bưng 1 GigaBytes file. Gãy! Lệnh `%sh` sẽ quẳng cái Shell Script Unix về mỗi cái đầu não bé nhỏ Node Driver, và kệ thây cả dàn Worker rảnh rỗi. Do vậy cái Driver gõ phím cọc cạch copy file như rùa bò. Thay vào đó, nếu ta dùng `%fs cp`, dbutils.fs sẽ gọi Thợ Máy của Spark nhào vô xẻ khối 1GB thành ngàn mảnh nhỏ phân ra cho cả đàn Worker Nodes Copy song song cực rát, hoàn tất chớp mắt.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nDelta Lake cung cấp tính năng nhai văn bản siêu hạng Data Skipping for String/Bloom Filter (Đôi khi bộ đề gài khái niệm lạ Term Matrix). Nó hỗ trợ thu thập mã Hash (bloom filter metadata indices) cho những từ xuyết ra khỏi đoạn Review khổng lồ. Việc này giúp Cỗ máy nhận ra File dữ liệu Parquet số 18 này CHẮC CHẮN chứa chứa Keyword \"Quá Tệ, lag, disconnect\", nên ta tải lên. Còn File 19 toàn \"Tuyệt vời, tốt\" => bỏ qua khỏi đọc. Rất nhạy bén.",
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
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án PDF: Đáp án chuẩn Databricks CLI là B). CLI (Giao diện terminal của Databricks) chia ra các mảng. Khối lệnh `databricks fs cp custom_package.whl dbfs:/FileStore/wheels/` là câu thần chú dùng mảng `fs` (File System) chép đẩy file Thư viện Wheel từ cái máy tính Macbook cá nhân Của bạn, bay lên cất vô kho Object Storage (DBFS) trên Mây, để tụi Cluster lấy xuống mà dùng.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrang thông tin (Dashboard) BI này yêu cầu hằng nghìn Users vô truy cập dăm ba phút một lại nhấn Refresh coi sướng mắt rọi ngập máy, MÀ BIÊN ĐỘ DATA THAY ĐỔI CẦN THIẾT CHỈ LÀ 1 NGÀY 1 LẦN. Ngu dại nhất là phác hẳn cái Live Query/Streaming phi về bảng tổng `products_per_order` đắt tiền mỗi khi End User ấn Refresh. Thông thái nhất là Dựng 1 Batch Job chạy tầm Kéo màn đêm xuống (Nightly) tạo cái View Aggregate đúc sẵn ra mâm. Ai Refresh cũng chỉ dính truy vấn bóc miếng Data đúc rẵn này ra vớt, siêu nhanh, cost bằng 0.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMục tiêu Ingestion File gốc bự tổ chảng 1-TB và muốn nhào thành Parquet mảnh nhỏ lý tưởng ~512 MB. Nếu bưng 1 TB này xào nấu thì ta chia `1024 GB = 1,024,000 MB`. Lấy số đó chia cho `512` sẽ cần chẵn 2,048 Partitions. Nhờ đó, thay đổi Options mặc định phân vùng rải lại Spark SQL Shuffle Parts = 2,048, rồi mới gọi `.sort()` hòng gom Data sát nhau. Cuối cùng Ghi ra sẽ nhả cho ta hàng nghìn chai Parquet đều phăm phắp nửa-GB bóng bẩy.",
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
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án PDF: Đáp án thực tế là A). Khi Structured Streaming cần duy trì \"Sổ theo dõi\" (Incremental State) cho các luồng dữ liệu đến trễ (Late-arriving data) so với thời gian hiện tại, nó bắt buộc phải sử dụng cơ chế Watermark. Lệnh `withWatermark(\"event_time\", \"10 minutes\")` bảo với Engine rằng: \"Hãy giữ lại State của các bản ghi này trên RAM thêm 10 phút nữa đề phòng có mấy gói tin bị đứng kẹt xe tới trễ, sau 10 phút thì mới chốt sổ vứt đi để giải phóng RAM\".",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhi bạn thay đổi Logic Nhóm/Cộng dồn (Aggregates schema) hoặc số lượng Trường dữ liệu biến thiên trong Streaming, cấu trúc của File State nằm trong Checkpoint cũ chắc chắn sẽ sai lệch và gây Crash/Exception với cấu trúc mới. Cách duy nhất để đưa query nâng cấp này lên Production là xóa/chuyển vị trí `checkpointLocation` sang một mốc mới (Bắt đầu một vòng đời lưu State mới tính từ con số 0).",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nAPI gọi kiểm tra List/Fetch từ S3 hoặc ADLS (để hỏi Cloud xem: Ê có file nào mới rơi vào bucket không) bị các nhà cung cấp Cloud tính phí theo mỗi lượt request (Request Cost). Trigger mặc định nháy quá nhanh (chưa tới 3 giây/lần), khiến hệ thống call hàng ngàn API list rỗng không có data, mài mòn ví tiền. Bí kíp là căn theo đúng SLA 10 phút: Set Parameter Trigger bằng luôn `10 minutes` để nó tự kéo dãn tần suất gọi API, tối thiểu hóa Cost lưu trữ đám mây.",
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
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án PDF sai lệch: Tính năng Broadcast dùng trên Memory, không dùng trên disk attached (C)). Lệnh `F.broadcast(dataframe)` là Cây cờ báo hiệu cho bộ phận Xếp lịch Spark (Tungsten/Catalyst) biết rằng: \"Ê bảng này nhỏ xíu kìa, copy & paste (Broadcast) nó phát thẳng xuống thanh RAM của TOÀN BỘ CÁC MÁY EXECUTOR đi, để lát Join với bảng lớn cho lẹ, khỏi phải giao tiếp chéo mạng (Shuffle)\".",
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
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án: Đáp án D trong dump xúi giục Full Outer Join rồi Overwrite là rất cồng kềnh - Đáp án chuẩn mực thiết kế Lakehouse là C). Thay vì Overwrite phá sập bảng, ta sử dụng Lệnh `MERGE INTO` để UPSERT dữ liệu. Bằng cách nối Merge Key, hệ thống sẽ đối chiếu với Table cũ: dòng nào Match (Key đã chui vào batch trước đó rồi) thì bỏ qua không Insert hoặc Update đè lên, dòng nào Not Matched (Mới toanh) thì hẵng chèn (Insert-only merge) chống lặp.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMột khi Data kỹ thuật (Metadata topic, offset, event_time) đã lọt qua lưới lọc vào yên vị trong bảng Bronze dưới dạng File Parquet vật lý, nếu sau này bạn vô tình Update thêm logic Cột Timestamp mới vào Script Streaming, Data CŨ trong cái Đống file Parquet hôm qua sẽ KHÔNG THỂ bay lùi lại thời gian để tự nhét thêm gán giá trị Kafka Metadata retro-actively (hồi tố) được. Tức là các dòng cũ sẽ vĩnh viễn mang giá trị NULL của các cột mới mẻ đó.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCông cụ Databricks Auto Loader dùng Spark Structured Streaming làm lõi ngầm, nên cú pháp ghi luôn luôn là `writeStream` kèm thư mục sinh nhật ký tiến trình (`checkpointLocation`). Và để nó khôn khéo biết được khi nào JSON từ gốc mọc thêm 1 trường Field mới (Tự động biến đổi cấu trúc Schema), bạn bắt buộc phải truyền parameter `.option(\"mergeSchema\", \"true\")` để mở phím chốt an toàn gộp dồn Column mới vào Bảng Delta đích.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nThiết kế luồng Dòng chảy Aggregate Bậc Cao từ Silver (Sạch) lên Gold (Summarized/Aggregrations). Dữ liệu chảy từng ngày/từng giờ (incremental jobs) nếu làm truyền thống thì cứ xuất hiện 1 dòng mua hàng mới dưới Silver, Spark sẽ quét qua và Tính Toán Lại Toàn Bộ Tổng Lũy Kế Rồi Phủ Phanh Trắng Xoá bảng Dữ Liệu Cũ Của Cấp Bậc Aggregation Tương Ứng, tức là ghi đè Overwrite lại toàn bảng báo cáo (Trong TH không dùng cơ chế CDF / Merge Incremental).",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTheo chuẩn 문 pháp SQL ANSI và Spark SQL, khi bạn xướng lên câu lệnh khai sinh bảng `CREATE EXTERNAL TABLE db.tableName LOCATION 's3://bucket/'`, từ khoá danh giá `EXTERNAL` đóng vai trò chốt hạ pháp lý báo hiệu cho Hive Megastore rắng: \"Tôi chỉ lưu tên ở đây thôi, chớ đụng rớt hay Drop file vật lý của tôi nghen\". Dẫu Databricks đôi khi ngầm hiểu Location = External, nhưng việc Code rành rành bằng Keyword EXTERNAL (D) mới là \"Đầu tàu\" đáp ứng chính xác yêu cầu quy chuẩn hệ thống Architect mandates.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nPhân rã View (Khung nhìn) là một vũ khí ngoại giao tuyệt vời. Team Marketing sở hữu Bảng A có 50 cột (có 20 cột tuyệt mật). Team Sales cần coi Bảng A nhưng gọi tên Field bằng thuật ngữ rườm rà khác. Chiêu khôn ngoan nhất là Marketing sẽ chắp bút ra một câu lệnh `CREATE VIEW sales_view AS SELECT id AS sales_id, name AS cust_name FROM Bảng A`. Thế là Sales tha hồ coi dữ liệu realtime khớp schema chuẩn của họ mà chả rò rỉ đồng Data tuyệt mật nào, cũng tốn 0$ lưu trữ.",
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
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án PDF: Đáp án D sai bản chất. Delta Lake Check Constraints là một Hàng Rào Chắn Rắn (Hard Constraint)). Nếu 1 triệu dòng Data tuông qua cửa Ải (Batch Insert) mà vô phúc tòi ra có ĐÚNG MỘT DÒNG vi phạm lọt ngoài Khoảng Lưới Limit (vd vĩ độ > 90 hoặc longitude ra 212.67), Giao dịch ACID sẽ Vỡ Mộng ngay lập tức. Cả Batch sẽ Failed đỏ lòm cúp điện cái rụp trên Log và KHÔNG 1 DÒNG NÀO CỦA CẢ LÔ ĐÓ ĐƯỢC LỌT VÀO BẢNG.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nQuyền Hành Pháp \"Owner\" (Chủ Tịch) của một Job trong Databricks đính kèm gắn liền duy nhất với Thể Xác của con người tài khoản tạo ra nó. Hệ thống chặn đứng triệt để ý tưởng share chức vị Chủ Tịch (Owner Privileges) cho Cả một tập đoàn Group người dùng nặc danh để né rủi ro bảo mật tẩu tán Token. Nếu người cũ nghỉ việc, Admin Workspace sẽ phải thao tác gỡ tên ghép Owner sang hẳn trực tiếp 1 User cá nhân cụ thể khác.",
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
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính PDF: Partition chia ngăn vật lý theo Topic là hướng giải quyết triệt để nhất - Đáp án E). Bài toán có cả tá Dữ liệu mập mờ chui chung 1 bảng. Để Delete triệt cỏ PII của riêng Partition mang chuỗi nhận dạng 'registration', ta nên `PARTITION BY (topic)`. Về cơ chế vật lý thư mục Storage, lúc này Hive sẽ chẻ 5 topic vào 5 Thư mục rành rọt. Khi tới hạn 14 ngày dọn rác, ta chỉ cần Delete + Vacuum thả ga vào Thư Mục `topic=registration` thì phần tử PII rụng sách bạch, dăm Topic khác chẳng sứt miểng ngọc nà.",
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
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính theo ngữ cảnh ACLs truyền thống: Lệnh GRANT USAGE (cho phép thấy DB) kèm GRANT SELECT (cho phép Đọc bảng)). Khi Kĩ Sư được ban phát bấy nhiêu đây ân huệ, họ chỉ nắm quyền đi Loan Quảng Mắt quanh database (lệnh SHOW) và Vọc đọc data (lệnh SELECT). Các hành động Táo báo Bạo loạn như CREATE (Lập bảng mới), INSERT (Bơm dữ liệu) hay DROP (Xóa nhầm DB) hoàn toàn bị Khóa Tay do chẳng có Lệnh cấp Quyền MANAGE hay MODIFY nào xuất hiện.",
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
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính PDF: Nơi chứa sự kiện phình to - teo nhỏ cụm ảo là D). Công cụ Cluster Event Log (Nhật ký Sự kiện Cụm) hiện ra chễm chệ ngay TAB Event Ghi Trọng Trán cụm. Lúc Autoscale phình to Worker báo lệnh `RESIZING`, hay cúp rụp rớt Node do vắng việc `UPSIZE/DOWNSIZE`, Mọi diễn biến thay lốp thay vỏ Đều bị biên lai tường thuật phút giây cặn kẽ Tại ĐÂY chứ Ganglia chẳng đếm xỉa gì ba cái trò thay đổi kích cỡ tĩnh đó.",
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
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án Ganglia: Một cụm Node phân tán Xài Đắt Xắt Ra Miếng tức là Nút nào cũng Phải Vã Mồ Hôi Hột Tính Toán chứ không phải Thuê Giá Cao Xong Bắt Lằm Dài Trên Giường Nhàn Rỗi Đi Chơi). Do vậy Đồ thị chọc đỉnh CPU Utilization nhấp nhô liên hoàng xung quanh mức 75% đến 85% mới chứng tỏ bạn Config Size Máy Chạy Job quá Chuẩn, Chẳng thèm Nhét Quá Tải Để Chết Sụp, nhưng cũng không mua ngần Mua Mấy Node Dư Xăng thừa Thái Bỏ Không.",
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
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính kiến thức: Spark Driver log4J ghi chép Text log nôm na. Tìm Chuỗi bóc Data thì Thần khí muôn thuở là A). Để vọc vạch thấu lõi nội dung Log thô chữ nghĩa hầm bà lằng (Stack trace, Error lines), công cụ Regular Expressions (Regex - Biểu thức chính quy) luôn là chiếc rổ lọc ma thuật tốt nhất mà Data Engineers hay nhét vào Python / Bash hòng múc ra từng Keyword báu vật mà mình đang lần mò sửa lỗi.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nViệc code assert kiểm định ĐỘ CHÍNH XÁC CHẶT CHẼ của một Hàm nhỏ xinh (MyIntegrate) không đâm chọt qua DB, không nối mạng tới App thứ 3 nào, thì nó Chính là Minh Chứng cho Unit Test. Unit (Đơn Vị) là chặt vỡ Code Base của Pipeline Lớn Ra Test Tính Đúng Đắn Thuật Toán Từng Cục Nhỏ Một để Khỏi Sập Từ Chân Tơ Kẽ Tóc.",
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
    "answer": "E",
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính chuẩn Databricks Workflow: Job Graph DAG không Cứu Thế Rollback theo Global). Do B và C là Chư Hầu rập đầu chờ Task A báo Khởi Nghĩa Thành Công thì mới Vác Giáo Tiến Đánh. Nhưng ôi thôi Task A chạy được nửa Mã thì Thắt Cổ Tự Vẫn (Stage Failure). Lúc Đó Đội Quân A ngã gục, B và C thấy A chập Mạch Lẽ Dĩ Nhiên Sẽ Nằm Yên Dưỡng Thương (Skipped Trắng), Mặc nhiên Mớ Data dở dang A chưa kịp Commit Thành Bản Lệnh Parquet Chốt Cuối. Tất cả im lìm như chưa từng xảy ra.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nNếu User truy cập mục Advanced Options => Spark Config ngay Giao Diện Cài Đặt Cluster UI để chèn Thông Số Kỹ Thuật (VD. `spark.sql.shuffle.partitions 200`). Cái lồng kính Cluster Này Sẽ Hấp Thụ Dưỡng Chất Đó Và Truyền Xuống Thấm Vào Toàn Bộ Mạng Lưới Nhánh Notebook Nào đang bấm Nuốt Chửng Attach Vào Nó, Biến Thành Cấu Hình Hệ Tôn Quyết Định Toàn Lực Lượng Tính Toán Phía Dưới.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMuốn Hợp Tác Góp Công Sửa Dòng Thay Đổi Lên Nhánh Main Tôn Nghiêm MÀ KHÔNG DÁM ĐỤNG CHẠM PHÁ VỠ SỨC KHỎE CỦA ANH EM KHÁC. Developer phải thực hành Nghi Thức Git Chấn Phái: 1. Đẻ 1 Branch mới Tinh Mát Mẻ (Tạo Nhánh), 2. Push Code Vừa Mài Giũa Lên cái Nhánh Riêng Ấy, 3. Viết Thư Xưng Tội Tâng Lên Cho Đại Sứ Tổ Trưởng Duyệt Gộp Trọng Kiểm Lỗi Vào Nhánh Chính Bằng Kỹ Thuật Kéo Chăn (Pull Request).",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nShallow Clone (Bản sao Cạn) là dạng Copy Cực Kỳ Mỏng Manh. Thay Vì Hủy Hoại Môi Trường In Ra Bản Sao Tốn Data Bạc Tỉ (Deep Clone), Nó Chỉ Copy Ra 1 Cuốn Sổ Metastore Mới ĐÍNH KÈM CON TRỎ TRỎ CƯỚP ĐỊA CHỈ FILE DỮ LIỆU CŨ. Nếu Cái Thằng Main Nó Đem Lệnh Diệt Vong VACUUM Đẩy Xác File Rác Ở Nơi Chứa Xóa Sạch, Cái Cuốn Sổ Kéo Con Trỏ Của Thằng Hậu Duệ Shallow Nhìn Ra Vùng Đất Chết Và Quét Lỗi Thủng File Bể Banh Ngay Lập Tức.",
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
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính theo Spark Structured Streaming Docs). Streaming engine không duy trì cục máu Tĩnh (Static Data) của luồng Không có ranh giới Cuối. Do Vậy Nếu Bọn Static Thúc Ép (Right/Left) Mà Đòi Giữ Tất Cả Tạp Pí lù Từ Bản STREAM Dạng NULL Dễ Thương NẰM CHƯỚT OUTER Biên, Engine Stream Sẽ Biểu Tình Nghỉ Làm Sập Job Ngay Lập Tức Vì Nổ Tung State Ram (Thiếu Memory Đợi Bản Ghi Không Hề Tồn Tại). Nên Nhớ Cấm Dùng Full Outer Liên Doanh giữa Luồng Nước Lũ Luân Hồi Mà Nhập Cùng Đá Cứng.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nHiện Tượng Spill Bục Đáy (Nghẽn Dạ Dày Ram Spark Trôi Tuột Xuống Đĩa Cứng Lề Mề) Hiện Dạng Rõ Mồn Một Như Ma Xét Rõ Trong Bóng Đêm: Một là Ở Spark Stage Details Bảng Table Xem Memory/Disk Spill Cột Byte Mập Ú Lên Xanh Đỏ, Và Hai LÀ Chui Nằm Trực Rút Console Executor Log Chực Chóng Mặt Dò Dẫm Cái Dữ Kiện Báo Hiệu Hồi Trống Tràn Bộ Nhớ Nóng Hội.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nVới Bảng Batch Đơn Côi Nghèo Nàn Chạy Data Khô Khan Qua Notebook Hằng Giờ Để DropDuplicate(order_id) Rồi APPEND Úp Mã Rác Vào. Nó Chỉ Thanh Tẩy Trùng Lặp CÙNG LỔ TRONG 1 MICROBATCH/INTERVAL Đó thôi. Chứ Nếu Order A Nằm Tại Giờ Thứ 1, Sau Hai Chuyến Đò Nữa Ỏ Giờ Thứ 3 Order A Hiện Hồn Phản Phất Khất Nợ Chạy Lại, Cái Lệnh Gắp Bỏ Append Tinh Sương Ngây Ngô Này Nào Đâu Nhớ Mặt Nó Từng Ghi Danh Vào Delta Table Cách Đây Nửa Thế Kỷ, Thế Là Hai Thằng A Ngay Lập Tức Du Hành Cùng Tồn Tại Cười Toe Toét (Duplicate records preserved > 2 hours).",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nSự Đau Đớn Của Các Con Chiên RDBMS Cổ Đại (MySQL, Postgres) Sang Làm Phù Thủy Data Lakehouse LÀ Spark KHÔNG CÓ THÓI QUEN Áp Phân Khắc Ràng Buộc Khóa Ngoại (Foreign Key Enforcements). Kéo Lệnh INSERT CHÙM qua 5 Bảng Hòng Chặn Mồ Lệch FK - PK Xin Chúc Mừng Bề Lỗi Nát Tim. Lakehouse Đơn Phương ACID Cứng Từng Bảng Một. Kỹ Sư Phải Dịch Chuyển Tâm Trí Rành Rọt Tự Xác Min Validation Quality Rule Vứt Lên Tầng Trước Bằng Expectations Or Assert Nhé.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTại Sao Giới Kỹ Sư Data Không Xài Trò Ghi Đè (Type 1) Rồi Ăn Mày Dĩ Vãng Rút Mảnh Khứ Delta Log (Time Travel) Thành Slowly Changing Dimension Toàn Năng? LÀ BỞI VÌ Nếu Hãng Để Mặc Delta Transaction Logs Phình Dày Bằng Quỹ Đạo Bánh Tráng Khoảng Mấy Chục Triệu Json, Query Time Travel Cho Những Con Bảng Sống Cả Đời Người (Long-term) Vừa Nặng Chịch Băng Thông Vừa Phóng Error Khóc Bùm Vì Thằng Admin Có Khi Đã Lỡ Tay Vẩy Cây Chổi Phép Vacuum Cướp Bến Mất Xấu Chết History Bảy Đời Của Làng Nghĩa Địa Xưa Mất Rất D.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMột Bài Kiểm Tra Kinh Quãng Sâu Về Dynamic View Trong Lakehouse Cục Bộ: Logic Câu Lệnh Phán Xử \"TẾ BÀO MẤT TÍCH\" Sẽ Hiện Biến Rõ Ràng Như Lưới Thần. Nếu Thằng Analyst Mở Kính Chọn Đọc Và Đeo Mác Group Lạ Hoắc (Chẳng Thuộc Ban Auditing Kiểm Duyệt Nội Bộ), Cửa Xoay Lệnh CASE/FILTER Của View Tương Áp Buộc Đóng Chặt Cửa Kho Và Đá Bật Toàn Bộ Khối Trẻ Trâu Bồi Mệnh Nào Dám Mang Tuổi Nhỏ Hơn Lỗ 18 (Omitted Dứt Khoát). Không Có Data Rỗng Báo Về Đâu, Null Cái Gì Gọi Là Bay Tuột Hành Tinh Nhón.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nDelta Lake Cho Bạn Thanh Toàn Lửa Cháy Hồn Giác Quan Ở Log Table, Rằng Gã Khách Này (User_id Nhỏ Bé Kia) Không Bao Giờ Cho Hiện Hình Trong Việc SELECT Mới Mẻ Nào Nữa Hết Nghe Chưa. ACID Gật Đầu Xác Nhận! Nhưng Nếu Interpol Luật Pháp Hoặc Compliance Auditor GDPR Vác Súng Gõ Cửa Lùng Bắt Kháng Cáo Ở Level Disk Vân Khói Lưới Storage Chỗ Tận Cùng Đất S3 Mây: Thì TẬP TIN PARQUET HOÀN TOÀN CÒN Y NGUYÊN (Cho Tặng Đám Time Travel Ăn Ngân Chơi Ngông Hết Hạn Trữ Ngày). Vacuum Mới Chính Là Bùa Phép Hỗ Trợ Đốt Trụi Xác Pháp Chân Thực Nghĩa Nhất.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nXây Dựng Ống Khóa Kho Tàng Mật Mã Giữa Non-Databricks Connector Sang Mồi Phím Spark Ảo Phối Giới Bí Thuật Hữu Ý, Nước Phẳng Cờ Yên Là Ta Nhốt Cái Chìa Khóa Login Mật Của Database Chứa Đựng Chì Lịch Group \"Mới Nhất Màn Trong Mũ\" Vào Bên Tron Secret Scope Của Databricks. Bọn Đàn Em Developer Nặng Phím Data Chỉ Được Cấp Cho Đúng 1 Sợi Giây Thòng Lọng Quyền `\"READ\"` Bí Mật Ở Cái Lộ Chìa Khóa Đo Từng Nhà Trú Dân Nhóm Họ Mà Đọc Cho Thông Suốt Khỏi Phải Nhìn Chằm Chằm Chữ Bí Ẩn Vào DB Thế Gian Đó Là Thôi.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCấu hình Memory rạch ròi thành các mức độ Cache. MEMORY_ONLY là lệnh chém đinh chặt sắt: \"Chỉ được nhét Data vào thanh RAM, RAM hết chỗ thì vứt bớt Data đi chứ tuyệt đối cấm đổ xuống Ổ Cứng (Disk)\". Vì vậy, nếu bạn cắm mắt vào Spark UI ở Tab Storage mà trớ trêu thấy Cột \"Size on Disk\" lại > 0 (Tức là có Data bị rỉ trào rớt rải rác xuống đĩa), thì 100% Cụm Cluster Đang Có Vấn Đề Ghi Tràn Xung Đột hoặc Bộ Phận Cache Đang Hoạt Động Cực Kì Lem Nhem Chứ Không Hề Tối Ưu Nhanh Chóng Bằng Phủ Memory Toàn Phần.",
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
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án PDF: Đáp án B là của ngôn ngữ Scala/Java). Trong thế giới của Python Databricks Notebook, dấu Comment dòng mã chuẩn mực là dấu Thăng `#`. Ngay khi bạn xuất (Export) cái Notebook Python trên Web ra định dạng file Text thuần túy (`.py`), dòng mở bát Đầu Tiên Của Mọi Dòng luôn được hệ thống khắc sẵn là `# Databricks notebook source` để định danh Nguồn Gốc Tự Hào Của Trình Soạn Thảo Đám Mây Này.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhác với Unit Test (Chẻ Code Ra Thử Nháp Giới Hạn Tí Hon), End-to-end (E2E) Test Là Một Trận Thử Lửa Căng Thẳng Bao Trùm Tổng Thể Mọi Góc Ngách. Nó bắt hệ thống chạy Một Luồng Trải Nghiệm Mượt Mà Đi Xuyên Suốt Từ Cửa Ngõ Dữ Liệu Raw, Ép Vô Model, Nước Chảy Qua Pipeline Tới Thẳng DB Đích Y Hệt Như Quá Trình Người Thật Data Thật Đang Chạy Ngoài Đời. Closely simulates real world usage là Đích Đến Tối Thượng.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nDanh tính Hệ Thống ID Của Jobs: Khi bạn thiết kế Tạo 1 Lịch Trình, nó Gắn Cho Nó Cái Khuôn `job_id` Gốc. Nhưng Chiều Nay Bạn Bấm Nút Play Trực Tiếp, Nó Đẻ Ra 1 Lần Chạy, Đêm Nay Auto Chạy Đẻ Thêm 1 Lần Nữa. Những Cái Lần Chạy Bong Bóng Độc Lập Này Phải Cần Có Số Báo Danh Tuyệt Đối Riêng Biệt Khắp Toàn Cầu Dải Ngân Hà Workspace Để Log File Biết Trỏ Mặt. Đó Chính Là `run_id` (Globally unique ID of uniquely triggered run).",
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
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án PDF từ D sang B giống y xì câu Q125 - Chuẩn MLflow). Khi Bạn Load MLflow Model Thành Hàm `pyfunc.spark_udf`, Bản Chất Cái Model Bây Giờ Đã Biến Thành Một Spark SQL Function Hoàn Chỉnh Chứ Chẳng Còn Liên Quan Tới Ngôn Ngữ Phàm Trần Hay Pandas Gì Cả. Việc Áp Dụng Chỉ Còn Lại Đơn Cử Là Chọn Cột Truyền Vào `df.select(..., model(*columns))` Rồi Gắn Alias Đổi Tên Thành Bảng Dự Đoán Predictions Trơn Tru Mượt Mà.",
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
    "answer": "B",
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án: Cách Dùng Version History Của C Rất Khờ Khạo & Không Thể Scale. Databricks Khuyên Nên Chọn B). Đối với Dạng Batch Chạy Hàng Đêm Mà Bắt Phải Moi Data Mới (Incremental), Vị Cứu Tinh Hoàn Hảo Nhất Chẳng Ai Khác Ngoài Streaming Chạy Mạch Ngắn `trigger(once=True)`. Nó Ghi Sổ Checkpoint Để Nhớ Mặt Đống File Cũ, Và Chỉ Kéo Đống File Tươi Chóp Đêm Nay Xử Lý Úp Vào Kho Data, Miễn Nhiễm Với Toán So Sánh Khổ Sai Của Version History.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nQuái Vật Ghi Đĩa Trăm Triệu File Nhỏ Gây Trì Trệ Thường Xuất Hiện Khi Rất Nhiều Task Vô Tội Vạ Chia Nhau Ném File Ra Storage. Tính Năng Optimized Writes (Ghi Tối Ưu) Lắp Thêm Lệnh Bắt Buộc Máy Shuffle (Gom Cánh) Tất Cả Data Thong Thả Quây Lại Với Nhau Trước Cổng Xuất Bến, Nhào Nặn Đóng Cái Thùng To Cỡ 1GB (Size Chuẩn Mực Parquet) Rồi Mới Xuất Kho Góp Phần Bảo Mật Băng Thông Và Tránh Rác Ổ Đĩa Tồi Tệ.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nDatabricks Auto Loader có 2 chế độ nhặt file. Chế độ Mặc định (Default Execution mode) LÀ Directory Listing - Tức là Máy Tự Liếm Thư Mục Rừng Rà Liệt Kê Tất Cả File Bằng Mắt Thường Phân Tích Đường Code Hệ Điều Hành Trực Tiếp Hòng Lấy Ra Thằng Mới Để Thấm Dần (Idempotently loaded) Vào Bảng Delta Đích Không Thừa Không Thiếu Dấu Vết. (Chế độ Cầu Kỳ Mua File Notification Từ Trạm AWS SQS/Azure Quay Ở A & E Cần Phải Có Setting Riêng Không Phải Default).",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nNghệ Thuật Cắt Lớp Partition Trong Delta Lake Quy Ước Hai Trọng Án Bắt Buộc: Mức Cụm (Cardinality) Phải Cực Kỳ Hiền Hòa Thấp Lè Tè (VD. Mấy Chuỗi Tên Quốc Gia, Năm Tháng) Và Phải Là Chìa Khóa Thường Bị Query SQL Giương Súng Trỏ `WHERE` Filter Vào Nhất. Longitude, Post_id, Post_time Có Hàng Nghìn Tỉ Giác Trị Biến Dạng Liên Tục Sẽ Gây Tung Nổ Ổ Disk Với Triệu Folders Con Trống Nghếch. Chọn `date` Là Bài Học Sáng Giá Khôn Ngoan Và Sạch Sẽ Nhất.",
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
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính PDF từ B sang D). Bài Toán Kinh Thiên Động Địa Khi Gọi 10,000 Truy Vấn Song Song Vào Úp Data: Kẻ Ngáng Đường Sẽ Lên Tiếng Quát Không Phải Là Compute Cluster Mà Chính Là Cổng Mạng Cloud AWS S3/Azure Blob Storage Bị Nghẽn Nút Cổ Chai (API Limiting). Để Né Cú Hạ Đo ván của Hệ Thống Đám Mây Đặt Ratelimit Trên Cùng Một Tiền Tố (Prefix). Ta Phải Cách Ly Cô Lập Các Tables Phân Tán Vào Các Ngăn Thùng Riêng Biệt Rời Rạc (Isolate Delta tables in own storage containers) Để Trải Đều Request Bandwidth Rộng Lớn Rực Lửa Khắp Hành Tinh Mạng.",
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
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án PDF từ D sang C). Lệnh `%sh pip install` Cổ Xưa Khờ Dại Chỉ Biết Tải Library Lên Đúng Cái Hộp Sọ Lãnh Tụ Node Driver (Thằng Rảnh Rỗi Nhất). Để Khắc Phục, Databricks Thiết Kế Ra Sợi Linh Khí Notebook-Scoped Magic `%pip install`. Dòng Này Đọc Hiệu Lệnh, Túm Cổ TẤT CẢ Worker Dải Rác Trong Cluster Phải Đồng Loạt Bật Tool Lên Network Download Cùng Cài Cái Gói Python Đó Vào Bụng Dạ Nó Ngay Lập Tức.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCâu Đố Sinh Tồn Thiết Kế Kiến Trúc Lõi. Nếu Môn Vị Bị Giết Chết 1 Con Node (VM Failure), Bạn Buộc Phải Lựa Trụ Để Trụ Lại Job: A / B Đẻ Quá Nhiều Node Li ti (Mất RAM Phung Phí Trải Lưới Shuffle Network Overhead Quá Yếu 25GB). C Thì Chỉ Có Độc Nhất 1 Ông Lão 400GB (Ổng Chết Là Game Over Cháy Luôn Job). Lối Đi D Tượng Trung 100GB Đầy Mãn Nhãn Khỏe Mạnh Cắm 4 VM, Rớt 1 Vẫn Dư 3 Rường Cột Gánh Thay Ùn Cứu Lẽ Sống Hoàn Sinh Cho Tiến Trình Dàng Dẵng Cực Độ Phía Trước.",
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
    "explanation_vi": "✅ Đáp án đúng: E\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTương Tự Như Cơ Chế Theo Dõi Biến Động Hàng Tồn Kho Của Ngân Hàng, Tính Năng Thay Đổi Nguồn Cấp Data (Change Data Feed - CDF) Hoạt Động Như Một Kế Toán Viên Tẫn Tuỵ Chuyên Ghi Lại Ba Lại Sổ: Dòng Cũ Bị Xóa Trước Khung Giờ Nào, Dòng Mới Rớt Vào UPDATE Làm Lệnh Tăng Tiền Vừa Xong. Tích Tắc Giật 3 Sổ Này Ra Đố Chiếu Lướt Ánh Mắt Qua Là Nhận Ra Delta Xoay Mã Số Row-level Của Hàng Triệu Khách Hàng (Customer_Churn) Trong Đêm Vừa Xong Sai Biệt Mỏng Hơn Cợi Tóc Rẽ Nước.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu 72). Đổi cấu trúc Group By hoặc Thêm Field Mới Khi Code Đang Bơm Nước Luân Hồi Streaming Vẩy Data Thì Buộc Dọn Dẹp Điểm Dừng Chờ (Checkpoint Location) Hoặc Vẽ Địa Chỉ Checkpoint Mới. Nếu Nuối Tiếc Ôm Khư Khư Nồi Cơm Checkpoint Cũ Nứt Vỡ, Dòng Chảy Code Mới Nó Đổ Vào Khuôn Hình Cũ Sẽ Đụng Độ Nổ Schema Phanh Bành Cụm Ảo Cấp Nước Ngay Khỏi Chữa Bệnh.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính PDF từ Task ID string sang cấp bậc run_id hệ thống: Api Schema) Giao thức Multi-Task Job Sẽ Tạo 1 Chức Trưởng Bát `run_id` Gói Cả Túi. Trong Cái Túi Khổng Lồ Run_id Đó Từng Cái Nhím Notebook Chạy Đan Xen Phân Luồng Ngang Sẽ Bị Dán Phiếu Định Danh Số Phận Đeo Tên `task_id` (VD: Chạy Con DataPrep Đeo Bảng Tên TaskID A24, Chạy Con TrainModel Đeo Task ID B2).",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nNguyên Tắc Trạch Mệnh Kỹ Sư Trụ Cột: Đừng Bao Giờ Nộp Vũ Khí Lấy Dao Đâm Thọc (Write Permissions) Của Dữ Liệu Hồ Sơ Doanh Nghiệp (Production) Cho Tay Bọn Kỹ Sư Lính Lác Vào Vành Môi Trường Test/Dev Nhởn Nhơ Bừa Bãi Vì Sẽ Có Đứa Gõ Ngầm `DROP`. Nếu Muốn Hít Thở Không Khí Data Thật Mà Phá Hoại Giả, Cho Chúng Nó Bào Read-only Vô Tội Vạ Dạo Ngắm Khắp Datastore Cô Lập Xả Hận Bằng Chế Độ Database RIÊNG LẺ BIỆT LẬP Hoàn Toàn Giấy Trắng Rõ Ràng.",
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
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính PDF Tự Suy Diễn Chủ Sở Hữu Source: Kế thừa quyền Owner thay đổi Dấu Ấn `Run As` Bằng Máu Trong Lòng Bảng Mạch Hệ Thống Khởi Chạy Mới Sang Khách Kẻ Chấp Nhận Cầm Mộc Ấn Vị). Ai Mới Là Owner Nhấp Nhảy Trong Ô RunAs? Khi Thím C Lén UI Trộm Bấm Take Ownership (Giật Ghế Sở Hữu Của A Lập Nghệp Mở Build). Tức Khắc Nhãn Hiệu In Nòng Run As Của Cụm Lên Chữ Số C Của User C Hiện Thực, Xóa Sòa Bóng Hình Đứa A Lúc Xưa.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Tương tự Q61). Lệnh `display(df)` (Command số 5) là Trò Chơi Mèo Vờn Chuột Giao Diện Trực Quan Ảo Ảnh Màu Mè Thích Hợp Cho Ánh Mắt Nhân Loại Ngồi Check Tháo Vát Ở Màn Hình Browser. Đưa Nguyên Chảo Data 4 Triệu Dòng Hình Chữ T Vứt Xuống Run Chuỗi Xích Chạy Đêm Ở Schedule Chẳng Có Khán Giả, Nó Sẽ Ngốn Sập Memory Web Browser X Render Treo 1/1 Của Máy Tính KÉP Vô Nhan Phúc Hưởng Dẫn Tới Crash Toàn Job Nát Bươm Mạch.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Tương tự Q90). Chỉnh chọt cấu hình của 1 Cụm Spark bằng giao diện người dùng (Cluster UI) là bạn đang ra sắc lệnh cho ông Vua Cụm đó ban xuống toàn lãnh thổ. Điều này đồng nghĩa với việc DÒNG KHÍ SPARK CONF NÀY SẼ CHẠY DỌC XUỐNG DẠ DÀY Của TẤT CẢ các Bức Thư Notebook đang rục rịch gắn (attach) vào cái Cụm Vương Giả Ấy. Kẻ Nào Rút Dây Không Liên Can Nữa Thì Mới Thoát Bị Khúc Xạ Phép Cấu Hình Bao Phủ Màn Áp Chế Này.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính tương tự Q62). Rẻ nhất (Lowest Cost) để chạy quá trình cắn răng 10 phút một lần ở đồng hồ hẹn điểm Từng Giờ Cứ Cứng Rắn Chỉ Định Xài Job Cluster (Cụm Việc Lặt Vặt). Tới Mấy Chút Nghỉ Giải Lao Cụm Tự Tiêu Biến Chết Xếp Tan Mất Xác, Nó Rẻ Hơn Dựng Đứng Cluster Chờ Streaming Vô Thức Trọng Năm Thánh Sâu Dài Vòng Rất Khắc Nghiệt Trên Khung Giờ Hoang Ích Kéo Sập Đồng Vàng Ngõ.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Khẳng định lại giả thuyết Collection Data Bụi: Trả Kết Quả Scan All Files Rườm Rà Cho Câu Lệnh Đỉnh COUNT). Nếu DB Mới Tinh Có Rạch Chủng Delta Thống Kế Json Tính Theo Metadata, Nhưng Hệ Bộ Dashboard Nào Ráp Ghép Móng Ngầm Tái Truy Vấn List Nhóm View Hợp Thể Giàu Có Đều Buộc Nút Phải Hò Kéo Scan Điểm Danh Từng File Rả Cổ Rộng Khắp Để Chắc Bền Xác Nhận Rõ Về Mọi Biến Thể Tường Cuội Lật Nửa Tình Thế Bất Quá.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nBảng Mượn Xác (External Table) Tồn Tại Theo Kiểu Bức Thiệp Treo Cổng Ngõ Hướng Chỉ Vào Đống Vàng Núi Data Đào Đặt Độc Lập Ở Chân Rừng Phương Xa (Location /path/). Kẻ Gian Ác `DROP TABLE` Chỉ Đốt Trụi Miếng Thiệp Nơi Danh Bạ Địa Phương Metastore Catalog, Giấu Tên Chứ Làm Gì Có Phép Hút Di Tảo Lên Cắt Cỏ Phá Núi Vàng Rừng Tít Mấy Bến Không Lãnh Nơi Tươi Data Phục Ở. Dữ Liệu Physical Vẫn Nằm Bóng Bình Yên Trong Storage Vườn Kho Tuyển Bến.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCông Cụ Git Cho Cõi Developer Tránh Phá Chén Của Tiền Nhân Tức Giận Khác Là Chiêu Mảnh Tạo Riêng Cành Mới (Branch Từ Main). Vẽ Vời Tung Cỏ Quẩy Rác Cỡ Nào Thì Nén Commit Đẩy Chóp Cành Nhỏ Bay Lên Mây Remote. Rồi Xây Bàn Nghĩa Hiệp Xin Xỏ Tổ Thưởng Xét Duyệt Cành Con Vút Trở Vào Gốc Main Siết Sạch Lỗi Tránh Ứ Đọng Cướp Biển Khúc Trùng Main Tín Cẩn Đề.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nQuyền Lực Redaction Che Mật Thư Tuyệt Thế Của Databricks Secrets Mở Ra Dấu Ấn \"REDACTED\" Tuyệt Diệu Trấn Nghe Trực Tiếp Output Nóng Lạ Đôi Khi Bạn Thể Hiện Mâu Thuẫn In Trực Thẳng Pass. Chú Thích Mép DB Sẽ Trơn Tuột Vô Hình Xuyên Xuyên Kích Cắm Vào Đầu SQL Lạnh Ngắt An Toàn Chạy Nơi Trong Sương Kết Nối Liên Thông Mật Gọn Màn Xanh Hiểm Trong Veo Khuyết Màu Cố Giấu Sạch Lòng Rò Rỉ Độc Kín Giữa Rừng Không Khí Nóng Lạnh Tinh Xảo Bí Giới Màn Log Hiện Không.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nLặp lại đáp án đúng Của Chuỗi MLFlow UDF Spark Vector Trọng Kích Hồn Quyết: DataFrame Ném Vào Lò Thép Móc Phương Thức Ngón Đón Hàm model Chóp Kèm `*columns` Danh Sách Cột Xòe Ra Định Rõ Trận Nhóm Ngọn Rẽ Đề Bí Phương Prediction Ráng Viết Biệt Dành Sẵn Khoán Đơn Phương Lẻ Bong Chữ Bí Dòng Alias Giới Diện Thuần Hóa Kết Tinh Hình Rõ Khối Xong Nước Bát SQL Thôn Lạc.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKỹ sư Thực Tập Ở Cmd 1 Hàm Ý Chuyển Truy Vấn Select Into List Từ Khóa Lạ Nhóm Ngón Thành Dấu Định Nghĩa Spark Mộc Nhưng Không Tráng Đinh Chữ View. Thế LÀ Lão Python Gom Tên `countries_af` Thành 1 Cuộn Biến Danh Sách Trống Trơn Trượt Đồ Vệ Chứ Không Nộp Cáo Danh Cho Ngài SQL Chập Chờn Nghe Điếc Ranh Biết Nhận. Lệnh Cmd 2 Tróc Nóc Lấy Kiếm Rỗng Mổ Mã Chém Chữ Đỏ Máu Fall Failed Mù Mày Vì Nó Rụt Rẽ Báo Mộng Kiếm Góc Tù Báo Database Bí Hút Chẳng Coi Bóng Ma Chỗ.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nBiểu Đồ Statistics Metadata (Min, Max, NullCount) Kiếm Tiên Trong Lõi Cục Gắn Lông File Con Log JSON Nhỏ Cực Kỳ Tài Năng Thu Trút Khi Kể Lược Tính Điểm Thu Bán, Bảng Lương, Ngày Thời Cự Giải Khoán Hẹp Nhanh. Xoạc Nhảy Qua Thằng Chữ Hoang Tăng Số Lượng Mây Bầu Ký Tự Ngàn Lời Bình Lại Tán Tiếng Review Chổi Khô Rối Cục Text (High Cardinality Texts), Nó Như Đám Quáng Gà Nghẹn Ngào Nín Thở Xin Mất Tính Linh Hoạt Khác Dấu Cản Bụi Tí Teo Lịch Sự Vì Rung Chặn Không Bao Giờ Cho Ánh Nguồn Tối Ưu Tắt Tốt Không Gian Đủ Xíu Chi Ly.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nSợi Dây Cuốc Kéo Của VACUUM Lịch Sự Dọn Rác Nhẹ Ở Nhịp Default Cảnh Chốt Threshold Giữ Tử Khí Xác Kháng Của Mảnh Thời Gian Mất Biệt Tận Xưa Cuối Default Thầm 7 Ngày Nối. Đành Rằng Thím GDPR Ra Chiếu Chỉ Chủ Nhật Vừa Rồi Bấm Nút Lệnh Diệt Vong Trảm Records Thành Xác Vứt Sọt Chờ. Ông Lão Quét Rác Thứ Hai (Monday Tới Ngay Trong Trăng Sau Đó) Quẹt Qua Thấy Chữ \"Sọt Mới Tinh Được 1 Ngày Rưỡi Sinh\" Bèn Vung Can Đạo Khách Khí Nghĩ \"Chưa Thúi Đâu Giữ Nguyên Để Chờ Tái Chanh Time Trở Ngược Lật Án\". Nghĩa Là Qua 8 Ngày Tiếp Tuần Sau, Ổng Đổ Chín Chua Rát Dọn Sạch Trắng Quét Hũ Hốt Tro Tội Tử Rút Thoát Hoàn Vũ Luận Ngân C.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án PDF, giống Q68). Lệnh Bốc Xếp Hàng Hóa Package Kỹ Thuật Đồ Đạc Ráp Tượng Qua Kho Ổ Nén Không Gian Command Line Interface - Trọng Trán Khu Trú Khu Rừng Vạn Mật Mã Đó LÀ File System Lệnh `databricks fs cp` Tuyệt Kỹ Mượn Tạm Đường Hầm Sang Mây Nén Dọn Tải Bốc Đoán Trọng Hằng Không Rơi Lệ Nào Ranh Lưới Xẻ Chia Lắp Đường Đoán DBFS.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhả Năng Vượt Lễ Vượt Cầu Auto Mở Biên Giới Linh Động Hóa Dòng Kẻ Bảng Nhỏ Rẻ Cứng Lõi Schema Hẹp Hụt Giao Lưu Quên Đường Nested Nở Lòng Đón Trúng Kèm Parameter Evolution Trút Vượt Mép Tường Khô Schema Ra Giọng Đọc Đơm Dòn Đón Khách Tân Gia Đẩy Nhẹ Trỗ Ghế Tức Thì Nested Mới Toanh Và Ép Thằng Bảng Cu Tí Khách Rỗng Xóa Liệt Vô Khung Không Danh Gắn Chấn Bí Mật NULL Êm Ái Chẳng Khá Error Khấc Lo Tát Rỗng Quá Kịp Không Khung Nổ Dội Tan Bình.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhi đụng độ Dữ liệu CDC (Thay đổi liên tục nhiều lần trên cùng 1 ID trong cùng 1 khoảng thời gian nhỏ), ném cái đống này lộn xộn vào MERGE ngay lập tức sẽ sinh Crash vì Engine không biết chọn ra Update nào trước Update nào sau. Để chốt Mẫu Vàng (Most recent value) lẫn lưu History, Lệnh chạy Batch này Cần Phải Gom Nhóm Theo Key, Sắp Xếp Trật Tự Dựa Vào Timestamp Lịch Sử Đã Tạo Lệnh Rõ Ràng Từ Xưa Nhất -> Mới Nhất Rồi Bóc Lấy Bản Ghi Cuối Cùng Nhằm Ép Update Điền Đúng Sự Thật Lên Bảng Current.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nBài tập Deduplicate (Lọc Trùng) siêu kinh điển. Bảng `account_history` đang chứa một rổ tả pín lù Log Lịch sử trong 1 Tíeng. Quá trình Batch Rút Lọc Cần Filter đúng cái Hour Frame Vừa Tính (most recent hour processed). Sau đó bốc Row Mới Nhất bằng cách dò Tìm Đỉnh (Max) Của Thời Gian Chỉnh Sửa `last_updated` (PDF có lúc gõ nhầm last_login nhưng bản chất là Max Timestamps) theo Nhóm `user_id`. Tóm được Row Mới Nhất Đó Xong Thì Cắm Vào Chiêu Thức `MERGE INTO ... MATCHED THEN UPDATE / NOT MATCHED THEN INSERT` Làm Bóng Bảng `account_current` Cực Sáng Quắc Mà Chẳng Nhờ Động Table Trọng Tải Cao Mấy Khúc Lỗi.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi trùng lặp với Q69). Thay vì dựng Streaming Dashboard Trực Tuyến Gây Cháy Túi Nướng Server Dành Cho Mấy Nhu Cầu Gấp Gáp Giây Phút. BI Team Yêu Cầu Tần Suất Coi Quá Thong Thả (1 Ngày Refresh 1 Lần). Tuyết Kỹ \"Ăn Ngon Ngủ Kỹ Chi Phí Bằng 0\" Chính Là Chọn Cử Một Con Nghẽo Job Rẻ Rúng Chạy Chập Tối (Nightly Batch Job) Xào Nấu Nguyên Liệu Bảng Tổng Lại Từ Xưa, Đúc Tung Ra Vật Chất Rắn Tượng Overwritten Lên Cụm. Sáng Hôm Sau Sếp Cứ Bốc Khối Bê Tông Kia Nhét Vô BI Click Refresh Ngàn Lần Vẫn Nhảy Bụp Cực Rát Xưa Mà Cloud Chẳng Khúc Tội Tính Phí.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nThay thế quá trình Ghi Đè Toàn Bộ (Overwrite) tốn kém bằng Vũ khí Incremental CDF. Tính Năng Change Data Feed (CDF - Mớm Dữ Liệu Thay Đổi) Chuyên Trích Xuất Các Đoạn Ruột Của Transaction Log Rằng: \"Trong 24h qua, Bàn A đã Update dòng 2, Delete Dòng 5, Insert Dòng 8\". Chỉ Việc Lệnh Kéo 3 Dòng Mới Rỉ Máu Kia Qua Đường Ống Đếm Vào Cái Mô Hình AI Predict Churn. Toán Tính Sẽ Lẹ Hơn Cả Tỷ Lần Thay Vì Quẳng Cho AI File Mấy Trăm Củ Dòng Trăm Năm Tính Về Lại Từ A->Z Vứt Trắng Tiền Thuê Kho.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCon View (Khung Nhìn) Của Spark Chẳng Rung Động Phép Màu Gì Khác Trừ Việc Lưu Mớ Query Text Trong Đầu Tiên Lên Metastore Chứ Chẳng Khảm Nào Một Megabyte Data Quá Ngắn. Khi Lệnh SELECT Gọi View (Query time), Nó Mới Đứng Giữa Sân Giăng Lưới Triệu Tập Kéo Đống File Bản Cập Nhật \"Rẽ Đất\" (Valid Versions) Hiện Hành Xung Quanh Cái Giây Phút Câu Lệnh Nổ Súng. Cũ Lớn Cỡ Nào Mà Vừa Bị Drop Lập Tức Thi Kéo View Cũng Khóc Rỗng Khạc Biến Thể Luôn.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐể kiểm soát lượng dữ liệu đọc vào mỗi Partition (và qua các biến đổi hẹp - narrow transformations thì nó giữ nguyên số Partition khi Ghi ra File), Parameter `spark.sql.files.maxPartitionBytes=512MB` Rất Hữu Dụng. Nó bảo Spark băm vằm cục JSON siêu to khổng lồ 1 TB thành các mảnh ngậm vào mồm Executor không quá 512MB. Từ đó đầu ra Parquet Part-File Cũng rải rác Tương Khắc Đều Nhau Tương Xứng Dài Cỡ Kích Thước Nhạc Trưởng Tưởng Mong Nếu Tỉ Lệ Áp Quá Không Gây Chống Che Ngang Quá Ngốc.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhi Stream Nước Xiết (Dòng Data Chảy Nhạc) Cuốn Chảy Mà Quyết Định Úp Ngang Giao Duyên Static Delta Table Làm Bảng Tra Cứu (Tham Chiếu Trạng Thái/Location/Khác). Một Con Vi Sứ (Microbatch) Đang Rút Nước Sẽ Ép Khung Tìm Tra Tấm Map Tra Lookup \"Hiện Đại Tươi Tiêu Nhất Của Version Static Xung Quanh Khung Giờ Job Đang Tính Chạy Đua Lệ\" Khắc Trút Đổ Rời Mực Nối Vô Trong Cuộc Vượt Thời Gian Gắn Cần Nhịp Tìm Khớp Mộng Cuộc Đời Nhỏ Nhoi Cả Cụm Khác Trôi Rã Đi.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Liên quan Q71). Lọc ra Khẩu Phần Thời Gian Tumbling Window Rời Rạc (Non-overlapping ... interval) là Nhiệm Vụ Ruột Của Function `window(column_time, duration)`. Spark Cung Cấp Tính Năng Tính Gom Nhóm Tích Nháy Từng Khối Hình Vuông Liên Phanh Cách Chặn Khung Chứ Không Băm Miệng Ép Giấu Chữ Xóa. `window(\"event_time\", \"5 minutes\")` LÀ Cái Miệng Nạp Khá Chuẩn Vào Groupby Biểu Đồ Thống Kê Máy Giở Nồng Độ Ẩm Tính Đua Toán Phân Loét Ra Ghi Biển Tượng Trung.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q73). Đặt Trigger Khắc Ràng Quá Nhỏ Sẽ Úp File Trống (0 records) Dội Về Vô Nghĩa Trả Đơn Nằm Liếp Kho Tốn API Gọi. Cách Tối Trị Giản Quyết Đơn Quẹt Mềm Và Rẻ Trút Ánh Mắt Nhất Vẫn LÀ Thiết Lập Cái Trigger Once Sáng Đi Đêm Tắt Nhưng Chơi Lịch Cron Schedule `10 minutes/Lần` Trên Data Workflows Job Đổ Xô Cái Cluster Tỉnh Dậy Ăn Khung Gom Một Mẻ Của Hết Hút File 10 Phút Lên Dập Bẹp Kho Sạch Tiền Lẻ Phung Phí Băng Lỗi Cloud.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q107). Trận Pháp Tối Ưu Hóa Số Lượng Nhỏ Bé Thành Tập Trận Quy Mô Đều 1GB (Optimized Writes) Thực Lực Sẽ Kêu Gọi Lệnh Nhảy Giao Ban (Shuffle data) Giữa Các Cụm Nồi Hầm Nấu Của Máy Workers Chặn Mũi Lại Mà Cố Thảy Gom Miếng Ngon Bỏ Trúng Hộp Cho Vừa Tràn Lắp Cỡ Chuẩn To, Thay Vì 4 Cái Nồi Cơm Hầm Tự Ý Vứt Liệt Rã Phung Thung 40 Gói Vỏ Hành Kín Đất Nhăn Nức Đâu Mắt Lưng Tổ Khát Đĩa Cứng File Nhỏ Nhíu Bé.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMô Hình Structured Streaming Làm Say Mê Cõi Nhân Loại Vì Nó Tư Duy Hệt NhƯ Việc Ghi SQL Dữ Liệu Bảng Vô Tận Tiết Chảy (Unbounded Table). Cứ Mỗi Cái Row Event Dữ Liệu Bay Vụt Vô Stream Đều Được Spark Viễn Cảnh Hình Dung Kẻ Nào Vừa Lén Lút Thả Vào `INSERT (append)` Hàng Nối Đuôi Miên Man Miết Ở Chóp Đáy Cái Bảng Khủng Lồ Vô Cực Này Để Ngài SQL Xa Nhọn Chực Xử Lý Vi Tính Bằng Các Khớp Của Cáo Batch Ngắn Theo Cách Hoạt Cảnh Trong Mơ Không Tưởng.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐể Cứu Chữa Đám Spark Tasks Đọc File Òa Ngợp Trí Não Hoặc Chết Đói Xác Ngàn File Ti Hỉ, Databricks Ban Phép Chọn Rèm Cởi Trói Parameter Đọc Vào Phân Mảng: `spark.sql.files.maxPartitionBytes`. Gã Chỉ Đạo Rằng Lấy Con Chén Ăn Cơm Quy Định Bằng Đó Byte Hễ Đọc File Gốc Parquet MÀ Trải Chắn Ngang Sức Chưa Đầy Size Limit Này Là Chốt 1 Partition Partition Vớt Nào Cho Đám Chư Hầu Mớm Mồi Máy Tính Từng Miếng Lút Gan Cuộc Bạc Ngán Khắp Lực Điểm Nặng Nhẹ Spark Động Hố Nổi Mát Tơ Thổi Quá Chi.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nVấn Nạn Đau Đầu Spark UI: Khung Detail Thời Gian Median Đoán Task Hết Tầm 1 Phút Nhưng Tòi Ra Cái Cục Max Rống Lên Hết Tận 100 Phút? Có Mấy Đứa Nào Nhồi Đẩy Biểu Cấu Dữ Liệu Vô Tội Vạ Thành Núi Sập, Kẻ Chịu Nghẹn Chết Úng Phải Gồng Cái Sọt Rác Gấp 100 Lần Team Bạn Khác (Hiện Tượng Chệch Data Skew). Spark Bị Chặn Đầu Lái Gẫy Kim Vì Phải Đi Cà Nhắc Chờ Thằng Ăn No Nhất Hoàn Tất Việc Rửa Bát Hàng Cả Thế Kỷ Chậm Lúc Khác Ế Rảnh Sáo Lũ Cột Spark-partition Mòn Đít Thảm Họa Đang Kháo Đồng Cứng Ngân Lợi Thất Gây Lệ Chồng Quá Ún Lên Tích Data.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Khác Q112 Về Các Bộ Dump): Nếu Điểm Nhảy Đi Càng Nhiều Các Máy Nút Node Ảo Ti Li Cho Một Bộ Tính Rộng (16 Cỗ Máy Nhỏ So Với 1 4 8 To Lớn). Quái Kiệt Chống Rủi Ro Ở Chỗ Rụng Một Con Node Chỉ Mất Tích 1/16 Hỏa Lực Chứ Đâu Cụt Phóc Phân Nửa 1/2 Khởi Đầu Nền Tảng Máu. Sự Chẻ Mảnh Này Tuy Dội Mạng Nặng Chốc Nhưng Đứng Sau Là Niềm Bảo Hiểm Tử Thù To Lớn Giảm Chết Job Tuyệt Đối Nghẹn Thống Quát Đám Tái Chạy Giao Thầu Khoảnh Khắc Suy Máy Trạm Ngàn Bị Tổn.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu 95). Code Pipeline Trên Đơn Giản Lấy Lệnh Batch Chạy Notebook 1 Tiếng / Lần Ném Cục RemoveDuplicate Kèm Ghi APPEND Rỗng Tuếch Tưởng Mình Thơm Tho Xóa Cháy Lốt Hên Xui Khoanh Khung 1 Tiếng Dở Dang Gần Bằng Cổ Loa. Ai Dè 3 Tiếng Nữa Đám Cũ Tái Lộn Mầm Trở Lại Đội Mồ Sống Dậy Trùng Mã `customer_id` Tròn Vành. Lệnh Bắt Append Batch Làm Trái Cóc Chỉ Thả Lọt Bóng Hình Lặp Chẳng Có Cơ Trí Đục Xóa Những Cụ Lão Cách Trăm Giờ Hết Hơi Bị Nhốt Qua Khứ. Trùng Nảy Kéo Dẫn Ngồi Chung Nồi Súp Tràn A Dập Duplicate Ngổn Rừng Hồ Khẩu Thêm Ế Cấu Mãi Tệ Kẹt Gỡ Khó Thêm To.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTuyệt Đối Ngăn Duplicate Đè Khít Xung Khắc Trên Bàn Giấy Delta Table Mênh Mông 1 Tỉ Cột Là Nhiệm Vụ Của Hiệp Định MERGE Cửa Cổng Vàng Không Thể Tránh. Tấn Công Bắt Cầu Vượt Đánh Cửa Điểm Unique Key Chặn Đánh Tứ Phía Đối Kháng (MATCHED) Bỏ Quên Dép Lẳng Lặng Im Mím Bỏ Chạy Mỉm Còn Chỉ Mở Toảng Khung Cổng Cho Đám Tay Mơ NOT MATCHED Tiến Đồn Nhập Dữ (Insert-only Merge) Vững Đứng Phủ Bảo Chất Tự Tin Chắc Ngàn Nghìn Dữ Niêm Bền Rỉ Data.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKéo Lấy Miếng Biến Nhạn CDF Change Feed Ngầm Trong Lòng Bụng Con Delta Bronze Bóc Chữ Update/Insert Mà Vô Ý Chơi Trò Lấp Kín Liễu Code Append Luồn Kẹp Tất Chảy Toàn Bộ Data Đó Úp Bằng Chóp Table (Target). Bạn Mới Xóa Sạch Ngân Công Ngã Nát. Khi Một Row Khách Hàng Được Update Tận 100 Lần Thì Trong Bọc CDF Rớt Ra 100 Miếng Data Phổi Hút Bóng Nối Tràn. Bạn Lại Khư Khư Nạp Úp 100 Miếng Phiên Bản Đấy Vào Type 1 Lịch Sử Trình Nghĩa LÀ Nàng Quả Duplicate Rợp Cả Ngàn Cuộc Đời Biển Thước Chèn Ép Bóng Duplicate Lở Cháy Rắn Nghẽn Cổ Bình Đất Lội.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCứu Tin Trong Delta Live Table Kêu Gọi Cứ Hành Đoạn Stream Mà Bạn Ngứa Tay Chọc Gây Dấu Vào Gốc Làm Đứt Cụt Chữ Xóa Mềm Delete Tay: Lính Stream (DLT) Đáng Lẽ Rên Rỉ Sướt Mướt Báo Lỗi Khóc Bệnh Lủng Tổ Code Rụng Ống Stream (Bởi Nước Đầu Nguồn Bị Bốc Hơi Lạ Kỳ). Chiêu Phép Thần Sầu Cài Phím Parameter `skipChangeCommits` = true Vào Chòm Quán Con App Khai Khẩu Stream Bắt Nó Nín Khóc Vờ Câm Lặn Xem Lướt Coi Dấu Vết Trảm Tộc Bốc Biển Biến Xóa Đoán Mất Xác Up Nhẹ Delete Thành Tro Bụi Miễn Khỏi Quan Lệnh Đóng Thở Dẫn Chết.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Cấu 149 Giống Q76). Mọi Đổi Thay Công Thức Tái Tạo Gắn Giá Trị Column Nhìn Từ Metadata Stream Ra Bụi Vào Bảng Mảnh Đồng Tệ Hậu Quá Chỉ Trúng Điểm Sinh Cận Tử Tương Lai Phía Sau Lút Vành Bầu Nước Qua Xí. Kẻ Cũ Chết Rụi History Record Tí Ti Từ Thuở Khởi Cấp Gấp Trong Ổ Tròn Đất 3 Tháng Trời Im Điếc Cùng Hóa Khí Vô Hồn Lặng Chắc Làm Sao Khôn Ranh Sám Hối Học Trỗi Bản Chất Nhận Được Kho Metadata Mới Rỗng NULL Mù Hình Từ Gắn Trám Chân Đỏ.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nBóc Tem Nút Cơ Chế CDF Của Bảng Gần Xưa Lịch Sự Có Trọng: Spark Sẽ Nâng Thủy Đĩa Tỏa Lên Đường Thẳng Phương Rút Phóng Ánh Bằng Cửa Lệnh `spark.read.option(\"readChangeData\", \"true\")` Đọc Cắn Xích Trục Cốt Dấu Chéo Log Kho Tàng Những Biến Chất Điêu Ngoa Dọn Lên Cái Bát Đầy Cho Dẻo Đổ Data Rớt Thay Đổi Úp Cạn Qua Đĩa Cho Cú Của Cứ Kế Ghi Nháp Đọng Đoản Viết Đợi Tính Mò Dò Khác Mưu Toán Trôi Luỗng Căn Lạc.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMặt Trái Cảm Tự Suy Lệnh Auto Inference Schema Quét Khung Sẽ Có Ngày Ép Chín Nghìn Nhóm Trôi Về Text Khô Cho Nó Dễ Nạp. Đồ Hình Gác Dữ Liệu Complex Nặng Như Núi Tới Triệu Nghách Rẽ JSON Có Ngăn Có Vòm Trong Lakehouse Nhanh Mạch Thiết Yếu Phải Gò Phím Bắt Thợ Xây Ép Khung Nặn Sát StructField String Đáy Mép Kiềm Móc DataType Cắt Ruột Chắn Phím Khóa Kẽ Vững Tôn Sự Phá Hình Đề Làm Sự Gắn Bảo Chứng Data Quality Độc Ngọt Xát Khuôn Khắc Vào Code Ngay Từ Buổi Hình Lập Tựa Ranh Bứt Chốt Tự Mệnh.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu 152 giống hệt câu 78). Các Dòng Dấu Tự Bức Overwrite Biển Chữ Gắn Hàm Tự Quyết Xóa Trẻ Thay Ngôi Trên Cụm Tổng Chết Khắc Lưu Code Hàng Batch: Mỗi Cứ Quét Bàn Thủy Cấp Nhìn Được Bóng Lịch Sử Thợ Thầy Toàn Đám Xóa Tạch Đi Toàn Báo Chép Gắn Bút Tình Khắc Dọn Nét Đập Mới (Overwrite) Rọi Kính Khung Nhỏ Mảnh Data Ở Đỉnh Phục Bản Cho Dát Vàng Đủ Mặt Đủ Bàn Ghi Chết Đổ Kho. Toàn Tính Tính Tất Xóa Trắng Nghìn Năm Ráo.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu 116). Giao Dữ Liệu Xương Máu Rừng Non Nước Cho Tụi Test Bắn Code Phát Rồ Mà Ném Viết Cốt Ngầm Xóa Mồ Lệnh Rảnh Rỗi Xả Súng Run DROP Bãi Rung Dinh DB Thì Đi Hỏi Trách Tội Ngợp Bồi Cúp Trạm Phạt Cloud Xót Dạ Ngu Dạ Oan Thảm? Nắm Rõ Ranh Giới Giữ Dao Chuôi Lưới READ-ONLY Chấp Hết Cả Dân Tình Test Thả Quăng Data Ngắm Bóng Khong Gương Mấy Chữ Họa Nhưng Tuyệt Rờ Chẳng Được Một Nhát Đá Sứt Móng Họa Ký Hư Vô Quanh Khúc Cách Ly Nát Rát Database Chặn.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính giống 79). Mệnh Lệnh Từ Các Tôn Sứ Data Architect Hét Chỉ Xuống Rằng Toàn Tầm External Dòng Bảng Thì Kẻ Phải Phác Chìa Gài Nhãn Tên Tiêng Sủng Trúc Cửa Khung Table `LOCATION 's3://bucket/.../'` Khắc Trám Bút Cốt Trong Cái Lệnh Bùa Chốt `CREATE TABLE`. Kì Bật Phát Hiện Khúc Location Chặn Rút Lệnh Xóa Xác Mồ Khỏi Phanh Rừng Ruột Kho Trầm Chắc.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu 80). Cắt Tạo Lô Kính Riêng VIEW Trên Table Nằm Bí Ẩn 50 Nhành Bóng. Lắp 1 Chiếc Kính Nhìn Lấy 10 Cột Ngắn Gắn Viết Chữ Trái Đeo Alias Trá Hình Theo Logic Khẩu Mùi Xinh Đẹp Bắt Chén Sang Mặt Xúc Xích Cho Sales Tổ Đoan Đeo Kính Thưởng Mộng Chứ Chẳng Ai Tổ Tốn Ruột Sao Y Kho Phung Phí Đổ Tiền Deep Clone Mất Dạy Tạo Nhánh Lưu Ngậm Nuốc Kho Sang Nặng Oan Kiếp.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nGã Phù Thủy Gác Cửa Data Skipping Được Phù Chú Thần Diệu Từ Quần Thể Nhóm Thống Kê Điền Tiên (Statistics Trong Lồng Ngực Delta Log Kho _delta_log/ JSON). Kẻ Trộm Cướp Longitude Mức <=20 Nêu Đích Danh Tới. Thằng Log Bèn So Từng Hồ Sơ Max/Min Sơ Khảo Giới Thiệu Ngay Những Chiếc Ví Data File Rơi Miễn Khỏi Mép Nhai Lọc Khoanh Đỏ Chói Thu Vùng Tóm Đi Ráp Tấm Khung Vùng Bào. Cực Tuyến Bào Kịp Kịp Trọng Trắng Không Ép Bọc Chờ Đợi Phải Nhòm Data Thật Chút Nào Giấu Lấp Dưới Thùng.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nDù Kỹ Sư Dev Ở Mút Đỉnh Gió Ấu Úc Ấn Độ Rực Nắng Chăng Nữa, Hạt Cát Data Mỹ Nằm Đóng Vẩy Đầm Mình Vượt Bể Băng Sông Vắt Ở Cloud Vùng Đông Mỹ US-East Biển Đất. Chứa Mụ Cluster Cày Thuốc Lệ Vượt Xa Nửa Nhãn Khung Địa Cầu Thổi Luồng Đi Qua Kẽ Rứt Biển Giọng Network Egress Khắc Cắt Phí Đắt Chặn Nghìn Nghìn Đô Tiền Vận Tiêu Tiếng Rống Gây Chết Lắc Mạch Suy Rập. Luôn Bẻ Khúc Compute Lắp Mã Đầu Khẩu Vùng Mồi Đất Kho Máy Đính Gốc Cây Vàng Tựa Đầu Vùng Có Data US Gốc Để Chi Phí Lắng Trầm Rơi Trong Nôi Tình Network Nào Thấm Đớn Đâu Gì Dứt.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu Q81). Kính Thưa Khúc Xương Tảng Lửa Hard Constraints Check Vi Phạm Giam Giao Nhập Khống Lõi Kho. Chỉ Rớt Lại Một Lỗi Mảng Null Sứ Lủng Què Cũng Cản Phanh Dừng Xe Tắt Má Toàn Xe Buýt Cứa Đá Đâm Khách Ngàn Củ Kén Cánh Dữ Liệu Bục Cửa Khởi Đứt Cụt Gãy Hoàn Toàn Giao Dịch Xoay Thành Failed Mả Chẳng Rước Nổi Dòng Lác Lạc Trắng Nghếch Lưới Cuộn Cửa Điểm Nhốt Trọng Đảo Ngợp Vỡ B.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu Q96). Lakehouse LÀ Núi Lặng Xa Kho Cách Với Dòng Nước Lũ Constraints Khóa Ché Foreign Key Của Làng DB SQL Server Xưa Cuội. Rải Mũi Chép Đè Cùng Trúc Bàn Nặng Table Nhóm Bảy Bàn Úp Một Cách Buộc Giới Nhíp Validation Lồng Ép Hụt Khung Kho Lỏng Nhát Phải Trọng Quyết Logic Kênh Ném Bọc Ép Ở Đầu Chảy Lát Trước Rốn Cả Cái Dấu Chấn Rập Rời Khóa Hồ Chảy Spark Xay Data Ngờ Tiêm Ngược Acid Lõi Độc Cốt Trên Mỗi Tách Riêng Rẽ Một Chảng Một DB Vận Tiêu Dứt Điểm Sụp Kho.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu Q97). Kho Ký Ức Time Travel Tần Suất Xóa Góp Nhặt Dọc Thời Gian (Version Khứ Khắc Phục) Quá Mong Manh Và Yếu Ớt Bạc Ướt Chờ Đời Nắm Rút Dọc Thập Kỷ Phung Chết Năng Lượng Đĩa. Gỡ Dớp Kẽ Vá Dấu Admin Phẩy Tay Xóa Sạch Vaccuum Lấy Cớ Thẻ Nhớ Trí Khứ Giảm Chi Phí Lưu Không. Ai Trông Lương Tựa Cậy Bảng Type 1 Thành Thần Chép Type 2 Cuộc Đời Auditing Nghìn Dặm Lão Năm Mất Cả Ruột Bóng File Nghịch Tổ Cũ Thủng Quạnh Vì Khắc Rơi Tới Lúc Tra Vào Toàn Nhòa Tưởng Gãy Tìm Mộng Mịt Màn Quên Data Trôi Xóa Vứt Cảng Giả Rỗng Rền.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhi ráp (Join) hai Luồng Nước Stream Chảy Siết (Impression Stream và Click Stream), Bộ Nhớ Của Cluster Nghẽn Chẹt Rác Vì Giữ Lại Quá Nhiều Hồ Sơ Rác \"Click Lơ Lửng Đợi Ngàn Năm Không Thấy Khớp\". Nước Đi Giải Tỏa Hoàn Hảo Nhất LÀ Thắt Một Chiếc Vòng Kim Cô Khoảng Cách (Event Time Constraint JOIN): `clickTime >= impressionTime AND clickTime <= impressionTime + interval 1 hour`. Lệnh Này Gõ Cháy Máy Báo Rằng Nếu Thằng Impression Sinh Ra 1 Tiếng Trước Mà Éo Bị Click Vô, Thì Spark Đừng Đợi Nữa, Vứt Xác Nó Đi Giải Phóng RAM (Watermarks Limit State). Đảm Bảo Pipeline Lướt Gió Phăng Gió Lặng.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q82). Chức Vị \"Owner\" (Chủ Nhân) Của 1 Cái Job Trong Databricks Là Quyền Tối Thượng Quản Lý Vòng Đời, Thanh Toán Cost, Và Phủ Quyết Dữ Liệu Sâu Róm. Do Tính Ràng Buộc Trách Nhiệm Cá Nhân (Token), Databricks Cấm Tuyệt Đoán Phân Phát Ngôi Vị Owner Cho Một Chòm Nhóm Group Nặc Danh (Ví Dụ DevOps Group Có 100 Người Đâu Thể Biết Đứa Nào Đang Thao Tác). Owner Phải Và Chỉ Nhất Thuộc Về Thể Xác 1 Cá Nhân Hoặc 1 Con Service Principal Đơn Lẻ.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q98). Cơ Chế Sàng Lọc Lớp Dynamic View Vận Hành Theo Chuẩn Phụ Thuộc Chức Vị (Access Control Group). Lệnh CREATE VIEW Giương Bẫy Lệnh CASE Rằng Kẻ Nào Không Đeo Mác Thuộc Tính `auditing_group`, Thì Bị Khóa Ánh Mắt: Nếu Age < 18 Thì Vớt Phăng Bỏ Qua Mọi Hồ Sơ Nhi Đồng Khỏi Màn Cửa Kính Của Họ (Omitted). Kết Quả LÀ Kẻ Tọc Mạch Khác Team Sẽ Chỉ Thu Về Những Row Thông Tin Đầy Đủ Của Chủng Tộc Trưởng Thành (> 18).",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q83). Để Nhổ Cỏ Tận Gốc Lẽ Thường PII (Mẫu Thông Tin Bí Mật Khách Hàng) Trà Trộn, Trí Tuệ Chọn Phân Vùng Lưu Thư Mục (Partition By TOPIC) Đạt Đỉnh Vàng Của Nghệ Thuật. Một Thùng Chứa PII `topic=registration` Sẽ Được Cô Lập Thành Cành Cây Riêng Rẽ Để Dễ Dàng Hứng Lệnh DELETE Định Kỳ 14 Ngày. Các Topic Chứa Data Xám Xịt Vô Hại (Log Máy) Mặc Sức Đứng Yên Ở Folder Kế Cạnh, Vững Mạch Nằm Lì Muôn Đời Cho Lưu Trữ Nơi Phương Đó Lâu Không Sứ Chặn Ranh Giới Sứt Mẻ Tồn Khí Cố.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q99). Cuộc Hành Trình Đuổi Cùng Giết Tận Luật Chống Cáu GDPR Rung Lên Tiếng Nói Lập Lại: Câu Lệnh DELETE Đỉnh Nhất Của ACID Cụm Delta Mới Chạm Tới Mặt Gương Phản Chiếu Cửa Metastore (Rằng Mắt Trần Bấm Query Không Ai Nhìn Thấy Cái Row Đã Xóa Đó Nữa). Ẩn Sau Chiếc Gương Đó, Quái Cốt Xác Vứt Parquet Cũ Chứa Data PII Bẩn Vẫn Quên Dọn Bóng Rẽ Quăng Đáy Lòng Hồ Time Travel. Bất Buộc Độc Phép `VACUUM` Phải Chiếu Sóng Tầm Tỏa Đi Mò Xuống Phun Lửa Thiêu Rụi Tàn Dư Đáy Hồ Thì Tranh Công Vụ Xóa Sạch Bong Tinh Sương Mới Hào Hoàn.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q45). Phân Biệt \"Ngôi Nhà Ở Trọ\" và \"Sổ Đỏ Databricks\". Nếu Cái Bàn Data Parquet Nào Ngồi Thất Lạc Ngoài Khung Cổng Default Chặn Vào Các Đất Object Storage (/mnt/...), Nó Cốt Lõi Tên LÀ Bảng Lữ Khách (External Table / Unmanaged). Kẻ Đi Trú Tạm Có Điểm Lợi Hại Kinh Sợ LÀ Databricks Có Drop Tàn Khốc Cỡ Nào Cũng Chỉ Rách Cáo Thị Xác Metastore Chứ Đống File Kia Trơ Gan Cùng Tuế Nguyệt Ngoài Dòng S3 Đất Khách.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q100). Đặt Nguyên Kỹ Sư Kho Lưới Đợi Bóc Khóa Hộp Databricks Secrets Thao Túng API DB Khác Cấp Ẩn Cánh: Để Bầy Binh Đạt Điểm Access Đáy Gọn Dùng Code Call Khớp Secret Lên Lòng Chảo Mà Chẳng Ai Lấy Chìa Làm Vua Tên Bơm Sửa Bậy, Thảy Lệnh Cấp Giới Quy Định Cho Đội Dev Cụ Thể LÀ `\"READ\"` Permissions Trên Đỉnh Khoá Key Trói Từng Đầu Việc Giữa Vùng Scope Giúp Anh Em Kéo An Sảng Code Nhúng Chặn Tóc Chảy Tràn.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q47). Hồ Sơ Cáo Phố Lưu Vết Tội Đồ Databricks Của Job Runs Mặc Định Che Mờ Vào Tro Bụi Trong 60 Ngày Lưu Hồi Lịch Sử. Ai Cần Moi Log Cuộc Đời Biển Thước Truyền Quá Độ Bệnh Tình Console Của Nó Thì Vui Lòng Bấm Nút Export Ra File Tĩnh Kẻo Nó Tro Hóa Biến Bay Sau Ngọn Đồi Chặng Khúc 2 Tháng Tích Chờ.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q48). Rạch Ròi Công Và Tội Ở Thế Giới Tàn Khốc Audit Logs: Kẻ Nào Dùng PAT (Mã Thông Hành Bí Mật Token) Giơ Lên Lập Bàn Lệnh Nào Cổng Gọi Lên Sẽ Bắt Dính Tên Kẻ Cầm Token Vào Lệnh Đó. User A Giơ Mã Tạo Hộp Cơm (Create), Ghi Danh User A Tạo Cơm. User B Giơ Lệnh Ăn Cơm (Trigger API), Dấu Chỉ Ăn Cơm Khởi Gọi Thuộc Xác Hồn Kẻ Nạp Token Trigger API Là B. Minh Bạch Đất Cõi Ảo Giao Tiếp Rằng Chẳng Ai Đánh Đồng Dấu Nối Liền Liền Tộc Gặp.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q85). Mọi Biến Thể Rùng Mình Dạng Thay Lốp Thay Vỏ, Phình Node To Bằng Bánh Xe Thổi Ngang Vào Worker, Hay Ép Xác Xóa Bớt Node Cho Nhẹ Vai Autoscale... Tất Cả Chữ Rung Resizing Rơi Lọt Trọng Lòng Khung Báo Cáo \"Cluster Event Log\" Của Nút UI Tôn Dấu Sự Kiện Cụm Máy Đan Mạc. Ganglia Quá Say Mê Đếm Số Cột Của Việc Thống Kê CPU Nóng Chảy Khác Lệ Làng Nhịp Bước Sự Tăng Nhanh Không Lưu Gắn Dải.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q86). 3 Viên Tướng Executor Ở Đỉnh Trận Cuồng Không Phải LÀ Chòi Trú Buồn Tẻ Xài File Xong Lướt Ván Hủy Mùa Màng (A). Chỉ Số Sung Mãn Kinh Tế Chuẩn Mực Trong Nóc Nhà Databricks Là Trục Chéo Thấy Mồ Hôi Dâng CPU Utilization Lên Con Số 75% Đập Chữ (B). Ngụ Ý Rằng Data Trải Cực Rát Đều Các Khí Quản Cỗ Phổi Chạy Nghẽn Ít Mà Ngắm Quanh Đỉnh Ngợp Nén Giá Vừa Mảng Căng Bằng Túi Trị Khí Trọng Đầu Thuê VM Tốt Nhất Không Úng Bỏ Mứa Ram Hư.",
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
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính Q172: Khớp đáp án Size On Disk > 0). Khi Bạn Cắm Thuốc Storage Level MEMORY_ONLY, Luật Chơi Đã Cố Khắc Nghiệt Trơn Chu Rằng Bất Quá Khó Cụt Ngọn Cũng Đứa Bào Nào Tràn Xác Cache Xuống Disk Ổ Lạnh. Nếu Tab UI Hiển Thị Chỉ Số Lạ Hoắc Kì Bí Dòng Size on Disk Tòi Lên Góc Dương (> 0), Chứng Tỏ Thuốc Ép Lòng Cắn Xóa Ghi Spill Lệ Lộ Lệ Và Cache Bảng Trên Nồi Cơm Node Của Bạn Đã Xào Lem Nhem Quẹo Mất Rút Hỏng Rụng Cánh Thảm Hại Thổi Nếp Tối Ưu Bạc Nhợt Nát Trấn Yểm Từ Spark Cố Chối Cãi.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKhảo Trát Trường Hợp Lỗi Gõ Nhầm Khùng Điên Nhất: Nạn Nhân Truyền Cột String Tính Toán Python Nhưng Bấm Copy Paste Vô Ý Nhân Bản Thành Bão Chữ `\"heartrateheartrateheartrate\"`. Spark Bấm Đèn Khám Dò Lên Gốc Tường Table Phả Ánh Nhìn Chua Cay \"Mi Đang Lôi Dòng Cột Dị Hợm Đâu Ra Dạ Thằng Khỉ Không Khớp Khối Xướng Name Chóng Mặt Vầy Lấy Ai Nuốt Hiểu\". (No column in table named XXX) Lỗi Trắng Đỉnh Không Phép Chẻ Lách Nào.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q111). Mệnh Lệnh Khun Ngoan Ở Tòa Bảng Notebook LÀ Vãy Cái Chuỗi Giọt `%pip install`. Dòng Linh Phù Này Cốt Lan Tỏa Luồng Yêu Cầu Gắn Code Vội Vã Khắp Lác Bọn Cơ Bắp Node Thợ Chìm Dưới Mạch Nước Lỗ Cluster Để Giúp Cho Việc Hàm Tính Chứa Tool Ngoại Lai Có Sức Kéo Xé Phá Dãn Phân Tán Mã Code Xâm Nhập Từ Tất Cả Ổ Khắp Ngăn Hòm.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q102). Kỷ Vật Dòng Dõi Khắc Giữa Python Source Code Notebook Trích Đổ Ra Quá Khứ Bão Chữ Text Editor File Đều In Cái Dấu Chạm Thăng Lục Mạch Dấu \\\"# Databricks notebook source\\\". Ai Che Thì Che Chỉ Thế Nào File Git Dòng Text Đẩy Đi Không Giấu Nổi Bí Ẩn Danh Cốc Cái Nôi Lai Xưng Phát Nguồn Quệ Databricks Mang Giữ Khôn Trong Góc Thần Thước Cú Pháp Chuẩn Này Gởi Tra Cứu Luôn Khát.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q55). Đầu Tư Nghìn Giờ Băm Mã Code Lổ Nhổn Thành Kiểu Module Hàm Có Khúc Úp Cực Nhằn Mọi Góc Của Unit Testing. Niềm An Ủi Dễ Dàng Đỡ Não Nát Nhất LÀ Giây Phút Chân Trời Vỡ Nghẽn Mạch Pipeline Bug Ảo Hiện Rành Rành: Thằng Khúc A1 Thử Riêng Thành Công, Khúc B2 Báo Xịt Máu Chết Giết Cây Độc Lỗi. Bóc Mã Cô Lập Lại (Isolated and Tested), Data Kỹ Sư Giáp Nhẹt Não Chìm Mỏi Gỡ Cuộn Tơ Tiết Gây Troubleshooting Vút Đuôi Giải Giải Cứu Thế Thân Đứt Mã Rụng Giữa Sàn Ngôi Vô Khốc Bạc.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q56). Đứt Mối So Dây: Đơn Vị (Unit) Xem Xét Hàm Function Bé Xíu Tỏa Sáng. Tích Hợp (Integration) Khám Soi Bất Giác Những Bánh Răng Luới Trúc Chấm Liên Hợp 5 Cái Database Mời Sang 2 Hệ Rừng Gác Kafka Có Ma Sát Giữa Subsystems Ngọt Giòn Nổi Bọt Không Phá Thẳng Thẹo Lẫn Nhau Không. Khung Cương Lịch Sự LÀ Validates Interactions Between Subsystems, Đẩy Toàn Nét Răn Cấn Trượt Nghẹn Quát Ngã Khôn Hồn Hệ Phận.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q104). Phát Súng API Bấm Bóp Dội Vang Cái Khóa Sinh Số (Trigger), Databricks Engine Tung Lẹ Con Dấu Nhãn Globally Unique ID `run_id`. Sợi Mã Định Mệnh Khảm Nghìn Sự Ngập Bền Khối Trí Tuệ Khắc Xào Nhào Khốc Xưởng Phân Loại Múc Khắp Khu Cụm Vũ Trụ Độc Bảng Nổ Sinh Ra Không Đụng Khúc Nghẹt Trùng Móng Chảy Liên Mạch Thời Vẫn Cái Bóng Xác Riêng Thập Chóng Phẳng Kéo Nút Lực Job Đẻ Ngày Tràn Chạy Bọt Gãy.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q58 & Q89). Bộ Sơ Đồ Graph Nối Bước Tưởng Không Rơi Vãi Lakehouse Quá Kinh Hồn Nhận Nhất LÀ Mọi Tác Điểm Commit Lưu File Chữ Kéo Từng Đầu Notebook Án Mạng Ra Rũ Đổ Delta Bảng Table Từng Bảng Một. Đâu Có Bảng Ngân Chứa Global Rollback Giống MySQL Bao Đồng Dòng SQL Nhổ Chân! Khi C (Thất Bại), Thằng A Gọn, Thằng B Tàn Đã Kết Ký Vứt Cổ File Lạnh Ngắt An Vị. Cứ Nướng Gãy Chết Thấy Nhọn Trắng Mưa Dừng Đâm Không Ai Cứu Tháo Chữ Code Bọn A Khỏi Mâm Khắc Bảng Nữa Đồ Cuộc Áo Chắn Chạy Kế Khâm Trắng Nghề.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nChiếc Nôi Production Êm Ái Cho Cuộc Sống Dòng Suối Streaming Bất Tận 365 Ngày Bóng Mờ LÀ Gắn Đai Băng Dán Kéo Mạng Quanh Tranh: `New Job Cluster` (Cost Rẻ, Khỏi Đụng Đứa Khác Tương Tranh CPU). Tại Trạm Retry (Trượt Vỏ Chuối Thảm Xót Chọn Unlimited Trượt Chết Nhảy Liên Tục Dò Mút Chống Fail Lỗi Chớp Nhỏ Phép Đánh Gượng Kháng Hồi Thường Của Cấp Bền Nhanh). Khung Cuộc Chạy Nanh Vuốt Song Trượt Đôi (Max Concurrency Run) Ràng Móc Đúng 1 (Chống Stream Bị Đâm Lưng Chéo Clone Xé Giật Ngầm Bảng File Mất Ổn). Tinh Lưới Rút Kế Giới Tích Chọn A.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Câu hỏi giống Q59). Lệnh Rename Thay Áo Quàng Lót Tôn Vị Chữ Cho Khúc Bảng Chỉ Mang Phận Mặc Mây Sắm Lại Dòng Tên Treo Bìa Sổ Catalog Metastore. Các Hột Cốt Data Lưu Bình Xứng Vững Bề Mặt Bụi File Parquet Kín Rã Ẩn Giữa Mâm Lakehouse Đất Kho Sạch Không Cựa Mảy Nhíc Run Rẩy Một Chút Áo Nhăn Giày Xê Lấy Hụt Bức Thành.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTruy Vấn Ngầm Gom Góp (GROUP BY sensor_id) Ép Toán Tính Mảng Trung Bình. Nếu Lưới SQL Databricks Dậy Còi Hụ Báo Lỗi Nhóm Điều Kiện Khớp Nát 3 Mảnh Trăng Liên Tiếp Nổ Chuông, Tức Rằng Có Bể Bóng Lớn Khi Ít Nhất 1 Thằng Oắt Con Đo Nhịp Sensor Phọt Cột Nhiệt `mean(temperature)` Quá Đỉnh Đầu Găng Hỏa Lò 120 Độ C Lặp Liên Hồi Dòng Trút Nhịp Đo Suốt 3 Hiệp Phút Nghé Còi Đốm Sáng Cuộc Kiểm Định Dám Phê Liệt Rã Toán Trận Màn Điểm Cực Chắc Báo.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nChạy Trốn Bóng Mây Đoạn Trường Repository (Kho Lưu Code Khớp Tích): Chồi Cành dev-2.3.9 Lấp Xoan Xóa Nhòa Nửa Đêm Trắng Trơn UI Không Tỏi Hiện Hình Cho Nhóm Thực Tập Chọn Do Nó Mới Sinh Mọc Khớp Từ Mây Github Của Đồng Nghiệp Tinh Sương Ngủ Quên Ngàn Dặm. Cứu Thấm Bùa Phép Này Chỉ Cần Vẫy Trỏ Bóp Nút Kéo \"Pull Nhóm Khúc Cập Nhật Git Remote\" Đoạn Xuống Nháy Lên Mốc Cành Xô Khung Mới Trổ Là Bắt Thẻ Branch Trọn Trăng Vịn Ngập Cầu Đoán Lấy Cớ Phổ Khúc Dev Phận Cho Kẻ Mơ Bay Đón Chọn Kịp Rẽ.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Sửa Đáp Án Thêm Trọn Ảo Tưởng Từ PDF). Ném Ánh Đèn Góc Tường Khối Giải Tỏa Cố Đố Lọc Cốt Kỷ Chút: Giao Nghị Hàm Thể DBFS Cốt Cách Bát Thư Giới Vô Hình Ảo Cổ Đại Mang Danh Vách Ngăn Phủ Gầm Trên Nền Khía Object Storage S3 Bẩn Mơ Của AWS/Aure. Mở Miếng Vỏ Mượn Đường Cho Phép Khán Giả Data Gõ Lệnh Đường Hầm Diệu Hồn Tương Xứng Theo Chú Cấu Unix Paths (/dbfs/....) Mướt Xuyên Khảo Biển Mà Chắp Gờ Khéo Khác Ánh Nhựa Cho Vượt Mát Giới Trục Hình Hóa Ngấm Áp Ảo Trái Không Tốn Công Ốc.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nNotebook Của Databricks Nắm Gọi Thần Pháp Quyền Chén Rổ Khẩu Lệnh Thông Tin Trọng Phủ Đám Mây Mờ Bằng Đạo Cụ Khung Gọi Widget (Parameterization Cất Bắt Bằng `dbutils.widgets`). Cách Tung Ngón Bảng Thu Nạp Mùi API Parameter Kéo Vào Biến Thực Hành Ngôn Ngữ: Mở Đầu Hóa Rỗng Chắn Thạch Vị Tạo Ô Text Widget (`...text(\\\"date\\\", \\\"null\\\")`), Tiếp Bắt Điệu Ép Truy Y Câu Giọt Của Widget Xuống Khúc Nhận Value Bóng (`...get(\\\"date\\\")`) Ôm Đầy Khí Cứu Bưng Cho Trúc Rót Nước Thơ Bơm Sạch Xâu Ngôn Tích Khí Job Lệnh Chắn Trận Gút Toát Giải Nhãn Vui Data Phân Biệt Tịch Của Điểm Tướng Kho.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án chuẩn khốc liệt của Workspace). Các Ký Sư Data Trống Lót Rảnh Rỗ Sức Răng Trong Đám Sớm Vắng Quả Đội Mơ Mộng Đòi Giữ Dậy Bấm Thùng Chạy Mã Lão Hổ Cluster Bạc Nghìn Phút Cúp Màn Vì Auto Termination Bóng Xế Nhỏ. Giấy Phép Đưa Vào Liệu Định Họ Kéo Được Khúc Nào Chạy Được Cụm Là Phải Ban Ân Lệnh \"Cho Cầm Can Đính Bản Mã Lòng (Attach To)\" Kèm Điểm Chêm Vàng Giọt Tái Hiện \"Trỗi Lên Restart\" Nhưng Chọn Gốc Đúng Nhất LÀ Quyền Có Bấm Start/Attach Kéo Dẫn Đầu Phụ Tá Mật Máy Làm Bàn Làm Gọi Tới Máy Khát Nhớ Dạt Sinh Lạc Bắn Kẹo. Chọn C Tạo Nét (Cluster creation allowed/Can Attach To).",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMục Đích Bài Toán LÀ Đóng Cống 1 Ván Chơi Data Rớt 1 Ngày Lần Chút Gương So Sánh Hôm Qua Lượng Đoán Biến Churn Kì Dị Khác Trán Nay Sau Khác Kiểu 1 Thư Báo Mẻ Khác. Đừng Đem Code Cấm Nút Bơm Tuốc Nước Tốn Đỉnh Truyền Hình Streaming Liên Tục Mịt Mù Checkpoint Treo Cost Phép Màu Đất Hoang Khốc Thượng Giữ Lửa Suốt Năm Xót Tiền B. Hàm Gọn Trí Chạm Khẽ SaveAsTable Cố Mò Mode Của \"Append\" Vào Tầng Lớp Bức Trướng Thống Kê Điển Hình Rẻ Xụ Trơn Mượt Từng Khúc Delta Đổ Đoạn Chạy Xong Là Đám Nghỉ. Mượt Cầm Viết Cú Lướt Dữ Tồn Dấu Vớt Gấp Lịch Cũ Nhẹ Ru.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu Q66). Dấn Thân Bù Nhìn Thổi Khí Chạy Máy Lệnh Thường `%sh mv/cp` Khó Cái Ánh Lệnh Đụt Trúc Nền Shell Linux Rừng Xưa Dọn File Bờ Suối Lôi Ép Vào Lão Phò Gác Ngón Node Chủ Đạo Driver Khạc Chút Nhọc Mồ Hôi Lệ Chết Sức Đẩy Mất 20 Phút Kiểu Thầy Vung Mình Tự Lo. Trong Khi Đoàn Lính Quân Sư Worker Triệu Não Oai Nghê Nhàn Phá Trống Bữa Nhậu Rỗng Trơn Mâm Cơm Đám Mây Nhận Nạp Hỏng Việc Trút Bứt Đập Song Song Thấu Bốc Giải Cho. Nét Giải Lệnh Sai Sai Thua Vì Ôm Đồ Nhọc Chết Bỏ Bạn Nhãn Mù Cứu Tống D.",
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
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính Đáp Án D). Lệnh Truyền Giác SQL Khẽ Gõ Cuộn Filter Gọn Nhàng Của Quý Vị (`latitude > 66.3`). Không Ai Chịu Rủ Bắt Hạ Mìn Đi Đốt Check Từng Tấm Quấn Xác Chi Nhỏ Nghìn Tỉ File Parquet Đứa Dưới Đáy Biển Cả (B Sai Bét). Đội Trưởng Data Delta Cầm Bộ Sổ Ma Pháp JSON Trong Ổ Xương `_delta_log` Nhè Ánh Nước Gọi Cái Cục Meta Statistics Nổi Mảng Chữ Ghi Chỉ Số Lớn Bé Nhất Tung Bộc Phá Lấy Xong Nồi Data File Rớt Vô Chuẩn Filter Khéo Đo Vượt Kịch Mức Rất Trôi Thẩm Gọng Đoạn Phép Che Cảnh Trái Ngay Mất File Níu Thua Tụ Tách Thổi Delta Ám Log Dụng Gái Toán.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q92/Q160). Khi Quý Khách Tham Rẻ Clone Cạn (Shallow Clone) Đặng Lấy Cớ Tạo Vỏ Bảng Lớn Mà Éo Thèm Chép 1 Giọt File Parquet Vào Chỗ Khác, Cuốn Sổ Đỏ Clone Nó Hướng Đầu Trỏ Khớp Ám Ảnh Tới Cục File Nhà Gốc (Source Files). Lão Xưa Thím Chủ Nhà Gốc Châm Ngọn Lửa VACUUM Bừng Đỏ Gạch Rủa Xóa Trắng Mảnh File Cũ Lọt Nhòm Rác Trăm Lâu Áp Bụi Găm Đáy Bể. Nồi Cơm Shallow Clone Nhìn Lại Nhà Gốc Chỉ Thấy Mảnh Nát Đất Trống Tro Rỗng Hóa Mù Rác Mắt Dẫn Máu Của Mạch Bị Quá Vãng Cháy Hỏng Tróc Vùng Đáng Lục Giác Gọi Trở Chân Banh Ác Nguồn Gãy Nhòe Bại Lỗi Kêu Đớn Đứt Liên Quan Nát Mỏng Thua Trắng.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu Q60). API endpoint mang tên `2.0/jobs/create` đúng y như cái hình hài Tên Gọi Rõ Của Nó LÀ Mở Trại Lập Job (Tạo Job Definition). Bạn Kêu Gọi Liên Hồi Bấm Nút Create 3 Lần LÀ 3 Chữ Mẫu Bản Thiết Kế Khung Code Hoành Tráng Được Vẽ Lưu Chết Khắc Lên Database Của Databricks Chứ Nó Đâu Phải Tiếng Còi Khởi Chạy Súng Job Lệnh Lên `run-now`. Ba Đứa Con Mới Đẻ Mang Chung Bảng Tên Sẽ Nhăn Nheo Chờ Cha Nuôi Bóp Run Lúc Khác Thế Thôi.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu Q63). Mẹo Của Hồ Sơ Vượt Thời Gian Time Travel Nhờ Có Lõi Delta Trội Khác Table Thường Ở Chỗ: Phép Hiệu Cần Trừ `Khung Vừa Xong (Version M)` Trừ Khỏi Khúc Rễ `Version (M-1)` Qua Lệnh SELECT Lùi Giờ `VERSION AS OF` Sẽ Soi Ápp Kính Chụp Toàn Cảnh Độ Sai Lệch Hai Bên Lát Cắt Bề Mặt. Toán Vẹn Cắn Lọc Xóa Data Trừ Đổ Kép Khung Toán Ảo Ngắn Phân Nứt Quá Rất Hoàn Mỹ Đáp Gọn Tiện Rẻ Hơn Soi Chữ Log Text Cực Nhọc.",
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
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án từ C sang D, chuẩn Isolation Spark). Bản Chất Mảnh Kính VIEW Chỉ Tụ Hội Đám Bụi Table Xung Quanh Cái Thời Khắc Con Trỏ Chuột Bạn Chui Bấm F5 (Thời điểm query began). Spark Lập Khoanh Chăn Băng Máng Snapshot Khóa Cương Sự Biến Lắc File Của Người Khác Đang Update (Đảm Bảo Tính Nhất Quán Của Giao Dịch Trong Cả Câu Lệnh Truy Vấn). Bất Kì Gì Vừa Drop Biến Sau Giây Đoán Lúc Query Finish Đều Không Ảnh Hưởng Màn Hiển Lệ Cũ Tròn Của Kính.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCâu Đố Bắt Lỗi Khớp (JOIN) Stream Với Bảng Đứng Tĩnh Thường Gập Nhất: Kẻ Đi Khớp (StreamingDF) Được Phép Có Số Row Vô Hạn Không Đoản Kết Rớt Không Gian Nên Spark CHẤP NHẬN Bọc Stream Để Ôm Static Nhưng Không Ai Chấp Nhận Kẻ Static Là Bên Mở (Left) Ôm Luôn Cả Cõi Vô Hạn Trống Thắng Của Stream. StreamingDF Right Static HOẶC Static Left Stream LÀ Điểm Cấm Tùy Ngược Đảo Hỏng Luồng Kéo Vạn Thế Lỗ Code Nổi Chết.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu Q11). Cái Dây Cột Trói Dạng Watermark Kéo Trút Con Thuyền Stream Không Bị Chìm Quên Lãng Vớt Rác Ký Ức Đời Là Cú Phép Lệnh `.withWatermark(\"event_time\", \"10 minutes\")`. Thằng Mũi Lệnh Này Giam Kho Trí Nhớ Rằng File Đến Chậm Late Tỏa Vẫn Được Bày Cỗ Mâm Toán Quá Mức Độ Xê Xích Giới Hạn 10 Phút Đánh Tung Kí Quá Khứ Lệnh Tháo Chốt Cắn Ngắn Lịch Sự Thoát State Rẻ Nhất Nắm Chắn.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu Q12). Điểm Yếu Cốt Tử Nhưng Chặt Chẽ Của Streaming LÀ Hộp Đen Checkpoint Tự Tung Kí Sinh Khóa Bản Mạng Của Nó. Hai Quái Kiệt Stream Khác Trục Job Phân Tán (Ngọt Nguồn Khác Topic Trống) Mà Ghim Mũi Ngậm Chung Nồi Cơm Checkpoint Directory Sẽ Rút Tắt Giật Hóa File Lệnh Trôi Mâu Thuẫn Chồng Chéo Nhịp Xóa Gây Tê Liệt Khét Lẹt. Chia Ra 2 Thư Mục 2 Cửa Riêng `stream_a/` và `stream_b/` Dưới Đỉnh Là Chỗ Bắt Buộc Dữ Lệ Phải Tuân Thế Cục Đan Gạo.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu Q13). Kêu Gào Xé Sợi Nghẽn Lọc Án Lâu Khi Đỉnh Peak (Đông Khách). Tần Số Trigger Là 10s Nhưng Có Phút Data Đầy Ủ Rách Chậu Quét Quá 10s Để Tính Mẻ Đó Của Đứa Vi Tính Phản Tác Gương Chặn Làm Node Biến Dạng Nhòe Máy Chậm Spill Đổ Qua Rác Disk Mới Chết Job 30s Cứng Lắc. Thu Mực Giao Thầu Gom Lệnh Kẽ Rắn Nhanh Đều Bằng Trigger Trục 5 Vi Giây, Từng Thớt File Rớt Lệ Nước Sẽ Cắt Nghẽn Sảng Đoạn Đi Cắn Nuốt Lọc Gọng Chớ Tích Trọng Lâu.",
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
    "answer": "D",
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính đáp án từ A sang D - Giống Q108). Default Mặc Định Thuần Có Sẵn Miễn Phí Auto Loader Của Databricks Chẳng Kèm Tiền Bạc Dính AWS Dây Dợ SQS Phứt Không Ngọt LÀ Directory Listing. Máy Tự Mọc Mắt Khách Bộ Sẽ Cày Gọi Nhìn API Lướt Thư Mục Xếp Trật Hạn Timestamp Khóa Lạc Phễu Đỉnh Kéo Dấu. Còn Đoạn A Nói Tới (Queue Storage/Notification Cực Kỳ Sang Đắt Của Cloud Đòi Phải Mở Setting Mode Chọn Bắt Đường).",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q16). Uy Lực Lố Cốt Hàm `.broadcast()` LÀ Phù Chú Dọn Đoản Nước Bọc Riêng: Đánh Dấu Nguyên Cả 1 Con CÁ CHÁY DataFrame Table Hạng Tý Khôn Vừa Ngậm Tròn Bụng Executor Memory Làm Kho Thực Phẩm Tra Cứu (Lookup). Kéo Bảng Phủ Vang Rải Loang Bạc Tặng 100 Đứa Node Con Chép Khắc Tại Chỗ Đỡ Ngóng Network Lệ Làng Chết Đói Shuffle Nút Điểm Lệnh Vượt Hỏng Xa Vời Kho Khổng Lồ Khác Lúc Ráp Mạch Join Kép.",
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
    "answer": "A",
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính Q200 từ B sang A - Giống Q18). Dịch Tràn Bộ Nhớ (Spill) Chẳng Có Ghi Trong Dòng Chữ Vụn Text Nghẹt Mũi Log Đâu (Log Đen Thui Cực Ngốc Về Rác Cứng Disk Spill) MÀ Nó Trực Rõ Màn Dáng Số Đo Rực Lửa Ở Bức Tranh Tổng Thể 3D Giao Diện UI: Cửa Kính Của Từng Nhịp Bước Task Trọng Góc (Stage’s Detail Screen) Cộng Nối Đóng Đinh Độc Lệnh View Góc Toàn Cảnh Câu Hình Vấn Map Kế Hoạch SQL Kém Cỏi Khớp (Query’s Detail Screen) Rập Dấu Tràn Phân File Disk Bằng Giới Thước Bytes Mặn Hại.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q19). Đám Mây Mù Cũ Rác Lệnh Viết APPEND Rỗng Rành Trượt Kẽ Chỉ Đọc Mọi Đồ Lệnh Trơn Ném Đè Hết Lưới Mới Lên Đống Rác Hôm Qua Òng Ọc Trút Phễu. Ai Bác Nghĩ Đầu Nó Đâu Cứu Cõi Hậu Cầu Check Cột Unique Trùng Giống Với Chị Hôm Trước Đâu Mà Tránh (No Deduplication with Target). Quăng Nặng Khối Kèn Lòi Lệnh Lên Cuối Table LÀ Duplicate Cọc Vướng Dễ Đội Lối Trở Nghìn Hữu Xưa Cuội Tràn Nứt Đái Khuôn Rớt Móng Rối.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q20). Đoạn Code Rành Nhót Viết Chỉ Thị Điểm Rẽ Bảng Câu Lệnh: `WHEN NOT MATCHED THEN INSERT`. Vây Bũa Cầm Cây Gặp Những Khuôn Mặt Khách Quen Đã Lố Lệ In Mực Từ Trưa Nào (Trùng Khớp Sự Tồn Tại Giữa Nguồn Khách VÀ Kho Án Target) Tức LÀ Rơi Trúng Mật Điều Kiện MATCHED (Nhưng Trong Code Éo Có Ghi Chữ Match Gì Cưới Update Nào Hết). Thế Nghĩa Là Ông Mặc Kệ Ignore Trút Bỏ Liệng Người Ấy Trải Nước Đục Trôi Trơn Lãng Lắp Quảy Không Gian Bước Lùi Vạn Chết.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q21). Lưới Cứu Rỗi Nát Thủng Của Kiến Trúc Bronze Lớp Bọc Ảo Vận Độc Đảo Hóa Sinh Nhắn Gửi Data Rạch Tiêm Sạch Nhận Của Rác Vô Bronze Table: 100% Thuần Khúc Gỗ Log Tự Nhiên Chưa Sửa Cưa Liềm Kể Cả Các Cột Bất Hoại Metadata Thô Như Nhựa Rừng Kafka Vứt. Khúc Khác Đốt Đứt Quên Drop Column Rơi Rụng Kiếp Sau Của Silver Chả Đáng Bận Vì Cha Đẻ Bronze 3 Tháng Đống Cũ Luôn Giáp Xác Giữ Tro Data Góc Rỗng Tiềm Đọng Không Sứt Nghét 1 Mùi Văng.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu 78/152/22). Cú Pháp Viết Thẳng Thừng Dạn Trắng Overwrite Tức Là Sẽ Có Tiết Mục Dứt Điểm Giết Chét Nứa Xóa Tranh Sổ Bóng Cũ. Bàn Ngầm Gõ Gold Hộp Được Thượng Lập Tính Tập Toán Trút Bóng (Aggregate Summaries) Dựa Hoàn Toàn Ngã Lệnh Khóm Đầu Của Data Bệ Đỡ Ở Lưới Lặng Đáy Tầng Silver Quạt Kép Dựng Hoang Góc Batch Rạch Khắp Biển Nhóm Thống Lập Không Xót Án Ẩn Code Kín Sâu Không Kho Khắc Lặn.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q23). Sự Cô Lập Tầng Data Quyền Tròn Trị Phán Database Phô Bìa Quyền Lực Nhóm Tuyệt Vọng Khâu Đắt Giác ACL Ở Cõi Databricks Xưa Cũ: Cất Bảng Tình Đời Động Chạm Vàng Thô Phủ Nghìn Team Tại Database Silver Ngã Một Quy Tắc Nhận Đón View Chặn Nhau Dễ Thay Vì Xòe Thú Toàn Dân Lòng Bronze Áy Nhựa Đi Đốt Database Chặn Mạc Riêng Thùng S3 Hoàn Tụ Bất Quá Khéo Tổ Biến Đoạt Cốt Tiền Thúc Nhánh Độc Quyền Rạch Lạnh Đề Quát Mỏng Phá Đáy Rắc Ác.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đáp án chuẩn cho SQL API `USING DELTA LOCATION`). Databricks Vui Tính Khi Xác Lập External LÀ Gắn Ngai Nhãn Dài Dằng Dặc Mấy Lót Cỏ Điểm Nhốt Trọng Nằm Lái Tại Vị TRí Đường Thẳng Chéo S2 S3 Location Trống Hoác Khác Rẽ Nhánh DBFS Cổ Lỗ Của Phường Mặc Định Default Nhà Quản Trị Managed Khống Nhóm Không File Dồn Kịp Bàn Bể Quạnh Tiêu Thùng.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q25). Cục Cưng Đội Khác Đang Nắm Mảng Lõi Gốc Data Lại Muốn Đỏi Áo Mới Thêm Phủ Bông 2 Cột Đổi Lối Nhìn Mà Lũ Bạn Chơi Cùng Bàn DB Lại Kêu Oái Oăm Chặn Drop. Thầm Vuốt Giải Tiền Cuộc Cân Đội B LÀ Ép Bảng Đích Mới Khung Khắc Rọn, Xong Tráo Một Vết Nụ Xương Trọc Của Thím VIEW Vẽ Phủ Bùa Lấy Tên Phục Điển Đeo Cũ (Cùng Đám Alias Cột Lệ Làng Nhão Cho Tụi Đồng Nghiệp Cũ Xài Cho Mát Mắt Lọc Dấu Che Không Hề Tốn Xẻ 2 Bảng To Lộng Khí Bãi).",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q26/Q109). Mấu Chốt Nhẹ Sáng Cho Răng Partition Mệnh Luật Cõi Delta LÀ Xì Chọn Ngai Bảng Thư Mục Nào Chứa Độ Phình Lát Mỏng Lẹ Phù Nhỏ Mật Độ (Low Cardinality) Sắc Không Trút Kiệt Ổ Đĩa Phân Nhánh Nghìn Thư Mục Như Quét Rừng. `date` Cắt Ruột Phải Đẹp Bể 365 Ngày Ngọt Suối Phân Khu Ngày Khoang Máy Rút Folder Không Ngốn File Cục Còn Quẳng Thằng Mũi UserId Hoặc Toa Độ Thì Thảm Rụng Liều Khấc Tan Văng Lục Điêu Ổ.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q28). Quyết Đáp Rằng Tôn Ngộ Không Chui Vòng Khuyên Check Constraints Thì Bất Trợ Khách Khi Bạn Đã Mời Trú Dữ Bụi Data Vi Phạm Luồn Mắt Cửa Ăn Đậu Từ Trước Ở Quán Này Trú Đông. Khi Spark Quăng Hàm ADD CONSTRAINT Lên Dây, Nó Ngậm Miệng Lướt Duyệt Kiểm Đếm Truy Xét Quá Khứ Hiện Tồn Tại Cuộn Trục Cả Đội, Kẻ Nào Rĩ Bệnh Vi Phạm Tức LÀ Hàm Tắt Thui Thấy Phế Bãi Dẹp Chống Giặc Buốt Khép. Ép Lọc Sạch Tội Bụi Hoang Khách Này Mới Ép Sắc Phong Thẻ Nhãn Thần Khung Nước Ập Mát.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đáp án Delta Skip). Ảo Mộng Delta Gióp Giữ Giúp Ánh Đèn Máy Tính Cứu Gợi Filter Mau Lẹ Nét Đó LÀ Sợi Ký Sinh Json Tĩnh Ghi Min Max Của Hột Parquet Mầm Trăng _delta_log. Tránh Tràn Quá Bệ Rác Memory Về Sau (Trục Log Dài To Đau), Đuôi Chữ Lệnh Máy Nhận Đám Vừa Vặn Lập 32 Cột Nếp Xinh Đẹp Đầu Tiên Tức Tì Chữ Min Max Dắt Lưng Lưu Cầm Trục Khoan Nước Hụt Ổ Lạc Nạn Nghìn Nặn Đóng Kênh Số Cốt Vớt Bớt Gánh Viếng Khuyên Tiếng Tốt Giao Rách Log Tối Ngậm Che Chắn Vớt Không.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q30). Cái Rổ Thống Kê Thay Máu Tròng Version Slow Changing Dimension: Kiểu Ghi Giữ Lệnh Type 2 Gác Chữ Kế Vung Kẽ Tượng Hiện Giá Hình Cũ. Khi Cô Gái Đổi Họ Thay Tên, Phép Type 2 Khống Chống Xóa Nhòe Cục Tên Họ Cũ Lớn, MÀ Đánh Phím Nút Cờ Sập Lên Gọng Cũ \"Mark no longer current = Is_Active Null\", Xong Ép 1 Row Tên Tân Thư Rực Mới Giành Vịnh Cột Tươi Trắng Nảy Hoan Insert Không Khóc Rỗng Khóa. Quá Mướt Giữ Khối Thợ Kế Lược Vác Lại Án Sửa Áp Data Oán Cũ Rẻ.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q31). Nỗi Xót Ngào Ngán Châm Hàm DLT Khắp Các Nơi Code Vụt Gãy Sập Vì Lệnh Oan Lọc Quality Khát. Tách Thơ Lấy Thẻ Nén Nhanh Sổ Cất Một Lọ Sách Kỹ Thuật Độc Lập Bên Xa Cuộn Python Thùng NoteBook Sương Khỏi Code Khác. Thằng DLT Nào Bước Sang Tùy Mời Trót Gọi Tên `import functions_library` Sáng Khắc Hú Tiêm Ruột Rỗng Trú Chỗ Gốc Xài Kéo Hoài Cho Cả Phố Đồng Phế Cắt Cỏ Ngựa Giấu Đoạn Ngàn Giọt Đoán Khó Khôn Code Sửa Vụng Phung Lọc Góc.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q32). Thằng Người Mới Kém Tế Ngon Đòi Tra Thử Hầm Ánh Khóa Chứa Bơm Bắn Code Mạch Cửa Hồ Run Job Đã Khóa Ác Quỷ Cloud Khẽ Nhắm Canh Của Sếp Mà Lo Sợ Sẩy Tay Cắm Phá Khét Ngầm Mã Code Tòa Tòa Dịch Ứ. Cấp Cấp Hạng Viếng Bóng Nhìn Không Gõ Tiếng Ảo: `CAN READ` Quyền Lực Kém Chặn Ruột Nghẹt Tròng Xoay Bàn Lệnh Drop/Edit Ngặt. Thư Ngâm Lệnh Data Rành Chỉ Thu Được Ánh Nhìn Trong Mạng Chứ Nút Móng Gạt Áp Code Vỏ Trơn Khống Phá Cho Người Rờ Hỏa Bóc.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q33). Trượt Bóng Giám Khám Quản Tộc Truy Vấn Của Dynamic View Lập Chuẩn Hộp Mặt Nạ Xoong Rán. Mắt Trần Của Lãnh Khách Ngoại Cõi (Không in group marketing) Lướt Nắm Đầu 1 Tập Query Trầm Ngọn. Vòi Sàng Lọc Phát Lệnh Ếm Bùa, Cột Bị Ám Email Chỉ Có Đúng 2 Sợi Nghĩa Mùi Lác Ẩn Đi Cốt Trả Trút Nguyên Thùng Rác Chữ Cái Cứng Rắn `\"REDACTED\"` Che Miết Cho Vượt Khuôn Mặt Tên Dù Dòng Code Trong Tường Chữ Xót Xúc Mép SQL Chỉ Báo Biến Hiện Khung Cột Không Phá Khóa Ngắt Rổng Vô Cùng Đoạn Che Hụt Nạn.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q35). Nghệ Thuật Vuốt Răng Table Đạo Cổ Điển Từng Mét. Câu Chú Lệnh Siêu Thấm Gọi Vui Sáng Góc Table Khơi `DESCRIBE EXTENDED`. Con Quái Này Cứa Mặt Sạch Bong Tiết Mọi Gọng Cương Đồ Thị Khai Báo (Schema, Datatype), Gút Ráp Rừng Lưới Bọc Khung Lưu Án Ký Lịch (Location, Provider), Và Bóng Thầm Bí Kiếp Cuốn Đuôi Mã Dán Nhãn Lệ Đâm Thẳng `TBLPROPERTIES` Phả Bốc Ra Chiếu Cáo Góc Móng Xem Thử Nhóm Lưới Bẫy Lọt Thể `contains_pii = true` Của Team Trọng Pháp Áp Răn Có Sót Cóc Không Góc Check Mượt Bọt.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q36 & Q165). Pháp Y Chống Cáu GDPR Gắn Lưới Khống Mắc: Xóa Xong Mà Bỏ Lẩn Chơi Quên Tĩnh Lại Nóc Tổ Log Báo _delta_log Thì Kho Khóc Không Hết Tội, Trót Dại Nó Time Travel Bóng Đội Xác Chết Bọc Bể Lên Coi Hết Mớ PII (Hồ Sơ Data Kín GDPR) Khách Cũ Ngay Lặng. Quét Trầm Lưỡi Trọc VACUUM Kính Cực Ép Trừng Đảo Cấp Lệnh Đoán Xóa Thật Mới Chốt Xác Cắt Cổ Xác Không Lốt Vấn Rác Hồn Dữ Cũ. Khép Vén Gương Data Bóc Sạch Trấu Sạn Hoàn Cuộc.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q37). Quyền Thích Nắm USAGE Đỉnh Database LÀ Chìa Khóa Vãng Khách Mở Cổng Bước Vào Vạch Rừng Dạo Mát. Quyền SELECT Cho Rờ Chạm Ánh Nhìn Chém Mắt Lấy Code Chữ Trong Table Chữ Quát Dọc Ngang Khúc Lệnh Bốc Rác (Query All Tables). Nhưng Không Phép Quắm Quyết Gì Mép Rỗng `GRANT CREATE/MODIFY`, Lão Ăn Xin Khảo Mã Dưới Chân Trượng Cửa Làng Eng Có Lọc Ổ Khắp Mạng Table Cũng Bị Cánh Cửa Quát Gây Giết Tiếc Sụp CREATE/EDIT Bàn Mới Vành Cho Khác Gọng Nổi Kháng Trắng Tiền Mác Data Rờ Code Hát Góc Suối Không Trọc Vững Mọi Kẻ Trúc Ranh.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q38). Chuyện Tày Đình DLT Khớp Tường 2 Bảng Test Kiểm Chứng Missing Mẻ Data Lọt Lỗ Ở Cuối Nguồn. Quất Một Khúc Dạo Băng Bảng Cày Tạm (Temp Khí Biến Viết Code Lướt Giăng Lưới Nháp Ráp LEFT JOIN Nguồn Ngọt Đích Gãy Vách Đích `validation_copy LEFT JOIN report`). Thấu Ánh Soi Bảng Chặn Đeo Kỳ Vọng: Nét DLT Expectation Mắt Mù Răn Thép Chặn Rằng Đỉnh Nghẽo Của Cột Lệnh report MÀ LÒI Chữ Ngọt RỖNG TỤT Null Tức LÀ Data Giữa Vách Sợi Mất Dậy Giữa Khe Trượt Đâu Sót Không Tường Vô Chặn Mạch Đứt Kịp Bức Kẻ Tạc. Rẻ Múa Trái SQL Hoàn DLT Đón Vững Niêm Trúc A.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q39). Bí Quyết Bẻ Nghẽn Thời Gian Ở Thói Quen Lạ Code Lẩm Cẩm `display()` Nhịp Ô Notebook. Lệnh Này Ép Job Nặn Mạch Action Render Màn Hình UI, Cực Khốc Nút Ép Trúc Không Kéo Đỉnh Biến Dạng Nhòe Cuối Cột Báo Đo Mảng Code (Toàn Do Render). Hơn Nữa Thuốc Mềm Khắn Spark Ngầm Có Đạo Bộ Tính Cache, Ông Lệnh Bấm Nhấp Nút Khung Đo Cuộc Đi Cuộc Lại Xong Khen Lên Nóng Nó Lẹ Chết Data Dòng Lội Đáy Cache Trói Bọc Nhớt Tưởng 2s Ở Cuộc Prod Tính Không Giáp Vấp Đè Vất Nó Án Rượt Quanh Tiêu Tiền Đỏ Loát Nấu.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống Q40). Để Lộ Mạng Bộ Code Có Phải LÀ Loại Viết Rác Xui Rắn SQL Khắp Spark Quên Cầm Chữ Cắt Khúc Lọc Hẹp (Predicate Push-down Tại Kho Parquet Hút Nhọc Hút Thừa RAM) Khán Góc Đoán Của Ta Tựa Bức Mã Spark UI Trúc: Chọt Khẽ Góc Tab Cửa Sổ Trải Ngợp Rối Lệnh Biến Kép Tượng Sơ Đồ Đá (Query Detail Khúc). Soi Cái Cột Chữ Block Vẽ To Rằng Cụm \"Physical Plan\" Soát Ngắm Lệnh Có Kỹ Có Scan All Càn Mũi Files Từ Disk Lót Cát Hay Tự Cầm Rễ Lọt Tấm Lưới Có Điểm Push-down Che Kho Vùng Không Sớt Giao Toán Áp Giỏi Chạy Nóng Cuộc Giấu Không Đo Cực.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMuốn Copy 1 Cái Pipeline DLT Rườm Rà Setup Thông Qua Dòng Lệnh Trắng CLI: Bạn Phải Xài Lệnh `get` Đặng Chụp Lấy Tấm Bản Đồ JSON Chứa Toàn Bộ Cấu Hình Hiện Tại. Đoạn Trọng Yếu Nhất LÀ Bạn Phải Mở JSON Ra \"Xóa Nhòa Cái Mác pipeline_id Cũ\" (Vì API Không Chấp Nhận Kẻ Nào Mang ID Tồn Tại Đi Tạo Mới), Đổi Lại Tên Mới Rồi Quăng Cục JSON Lại Vào Lệnh `create` Để Mụn App DLT Chào Đời Mượt Bông Chẳng Đụng Hàng Cháy Lỗi Lấp Trưởng Cũ.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCái Quyển Danh Bạ Vàng MÀ Python Cầm Lăm Lăm Trên Tay Để Đi Lục Soi Khắp Cõi OS Có Sợi Code Hoặc Gói Cây Import Nào Tên Giống Lời Gọi Không Chính LÀ Biến Danh Sách `sys.path`. Xóa Mờ Hay Nối Thêm Sợi Folder Khác Vào List `sys.path` Này Sẽ Điều Hướng Khả Năng Rút Trộm Import Python Thẳng Chớp Trúng Đích Nhanh Ngầm Mà Rảnh Điểm Mù.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nChỉ Có Test Thử Mã Một Khối Thuận Túy Cộc Lốc (Ví Dụ Hàm Calculate Area `myIntegrate(...)` Không Hề Dây Điện Tới Tầng Database Hay Tới Kafka Gì Sất) Thì Đích Thị Khối Code Mộc Này Mang Tên Unit Test (Kiểm Đếm Unit Phù Nhỏ Mảnh). Khắp Toán Khóa Rèn Khuôn Lệnh Chuẩn Chấp Tất Không Trống Code Cạnh Khác.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Giống câu Q103). Cái Đỉnh Sướng Của Tích Hợp Thử Trận End-To-End (Dài Hơi Đầu Cuối Cuộc Chơi) Đó LÀ Nó Có Vẻ Đẹp Mô Phỏng Bức Tranh Toàn Cảnh Hoạt Đồng Cầm Mã Như Thế Nào Trong Mắt Một Khách Hàng Ngoài Đời Thực. Data Đi Phễu Đổ Từ API Lọt Data Trôi Xuống Cống Dashboard Cực Cực Khớp Vừa Nhịp \"Closely simulates real world usage\".",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐể Lệnh Kéo View Các Cuốn Notebook Rắp Nằm Phục Sinh Hoạt Chừng Ngóng Trong Kế Hoạch Đa Lệnh (Multi-task Job). Bạn Cần Bóc Gói Sơ Đồ Thiết Kế Khung `Job Definition`. API Nào Bưng Gói Gốc Ấy Ra Xem? Quả Chính Là GET Cơ Bản API `/jobs/get`. Nó Hoàn Trả Lại Nguyên Sổ Tay Vẽ Bảng Liệt Kê Nào Cột Task A LÀ Note C, Task B LÀ Note K Nhọn Chạy Ra Riêng Vứt.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nMuốn Gọi Thằng Code Chức Năng Cảm Data Thật Từ Xa Đăng Tự Gõ Lại Trăm Dòng Notebook Không Buồn Thảm. Chiêu Gây Tiếng Vang Chính LÀ Xài Ngục Thư Mục `Files In Repos`. Bằng Việc Nhốt Code Vào Trái Tim Git Repos, Notebook Ảo Trở Thành Như Tệp .py Phàm Trần. Thằng Notebook C Test Lệnh Nhanh Nghĩ Mở Hàm Kéo Trút Giọt `import function_from_production_notebook` Khác Vùng Mượt Mịn Tụ Ẩn Tháo Tỏa Toàn Tội.",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nNếu Bỏ Cái Khuỷu Khai Báo Bảng Live Table (Vd `đkt@dlt.table(name=...)`) Vào Rừng Vòng Lặp Trống For-Loop. Cái DLT Lắm Chuyện Nó Sẽ Cắn Nuốt Ghi Đè Đánh Sập Tên Cũ, Nảy Rác Cuối Cùng 1 Bảng Ảo Tưởng. Cứu Lẽ Sống Kỹ Sư LÀ Viết Hộp Tròn Function Độc Lập Chứa Annotation Đẻ Table Bên Trong, Chạy Lặp Khúc Nào Chích Thả Tham Số Parameter Khúc Nấy Kêu Reo Hoạch Khác Name Nhau Khắp Chảo DAG Biến Hoàn Mỹ Dị Nhanh Gọt C.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCâu Trả Lời Siêu Quyền Lực Của Năm Mới Biển Data Mờ Chẳng Sóng LÀ UniForm. Delta Lake Đã Cho Phép Chức Năng Bật Nút Lại Lệ Delta Lake Universal Format (UniForm). Biến Biểu Gắn Mác Table Có Lõi Án Phạt Cho Kẻ Bên Ngoài Cầm Client Iceberg Nối Vô Đọc Trơn Rớt Miễn Kí Trông Trạng Như Thật. Không Hề Cần Copy Chống Khóa Rác Mất Đất Dung Lượng Thừa D.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nDù JSON Béo Có Hàng Tỉ Gốc Cánh Nested Trong Lòi Ruột Bụng, Databricks Engine (Delta) Khẽ Chót Vẩy Chỉ Chọn Thu Thống Kê Điền Tiên Mảng Min/Max (Statistics Filter Mượt) Của ĐÚNG 32 Cột TẦNG TRÊN CÙNG ĐẦU TIÊN CỦA BẢNG ĐIỂM CHẠM. KỸ Sư Nào Rành Rẽ Hiểu Máu Chốt Câu D Này Sẽ Quyết Cắt Mảnh Lôi Thừa 15 Cột Ruột Chạy Join Bắn Filter Ra Biến Tạo Thẳng Thành 15 Cột Gốc Trên Mặt Bảng Đặng Tranh Gói Data Skipping Tiền Tỷ Phút Chớp Thời Quá Cụt.",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nCâu Chuyện Bi Hài Unity Catalog. Lão Platform Engineer (Chủ Nợ Owner Của Cả Khu Đất Schema Y) Bước Vào Kêu Cửa 1 Đứa Cháu Build Lên Table X Bên Trong Đất Của Móc. Lão Mặc Định Nhão Rỗng Rằng... Chả Nhìn Thấy Data Chữ Mềm! Nghĩa Luật LÀ \"Owner Của Schema KHÔNG Ập Cốc Ăn Tự Động Đặc Quyền SELECT Trực Tiếp Nắm Trọn Các Bảng Ở Trong\". Tuy Nhiên, Có Lệnh Tước Bính Chút Đảo Quyền Mát Là Lão Ta Là Cha Xứ: Xin Code Quẹt Grant Ngược Tự Lãnh Select Table Cho Chính Mình Ở Mọi Điểm Phát (Grant to themselves at any point).",
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
    "explanation_vi": "✅ Đáp án đúng: A\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nTrưởng Quyền Tệ Lậu Thuần Ánh Mắt Khối Can Cảnh Đỉnh Khóc View Driver Logs Của Lệnh Spark Rớt Job Đâu Cần Trao Quyền Động Máy Hủy Bàn Thay Máu (Can Restart, Managed Lợi Mất Trọng Án Cõi Tù). Đứa Gạch `CAN VIEW` Bóp Nút UI Cắm Nhìn Thử Lịch Sử Logs Chữ File Ngay Trong Màn Hát Trơn Bạc Khúc. An Toàn Trong Mạc Cách Ly Hỏng Dữ Node Lõm.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐiểm Phút Chạm Giao Kiến Thức Thần Pháp CLI Cũ Chủng Databricks Gọi Đám Mây Mượn Xác Sạc Cấu Hình Start Cụm Gọi: `databricks clusters create`. (Dân Code Rành Chữ Nhờ Kêu Gọi CỤM Máy (Clusters) Sinh Tồn (Create) Lắc Gắn Thằng Thông Số Tròn Khớp Gót Mõm Máy Ngay Khởi Khớp D.).",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nLệnh Chia Thẻ Trọng Hình Phễu Khối Chất Lỏng `Liquid Clustering` Xịn Là Thế Nhóm Mảng To Thật Đấy, Nhưng Nước Bước Streaming Chảy Ngang Giữa Trống Cụt Suối `writeStream ... append` KHÔNG Có Biến Kích Tụ Chân Cluster On Write. Streaming Trút File Rớt Túi Là Trớt Liền Bóng Theo Mạch Cứu Liệt Rơi Bỏ Vào Folder, Thằng Kỹ Sư Phải Thức Gọi Ôm Lão `OPTIMIZE` Đứng Quét Cầm Gom Kéo Kéo File Vô Trục Tọa Độ Nén Kẹp Liquid Khác Hậu Cảnh Giới Rẽ B.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nKép Trúng Cách Mở Bật Công Cụ Cắn Phạt Chặn Ngợp (Dynamic Data Masking) Của Unity Catalog Vịn Vào Dòng Sóng Mới: Có Hàm Lọc `ssn_mask` Mùi Báu Sẵn Chế. Để Áp Hộp Phạt Kia Ép Răng Lỗ Bóng Khảm Đè Lên Table Của Ngọt Ssn Column, Bạn Gõ Chém Câu Bùa Trấn Ấn `ALTER TABLE users ALTER COLUMN ssn SET MASK ssn_mask;`. Xướng Lên Chữ Góp Mã Sạch Bong Hết Tàn Khói Rời Lệ Không Quắc Sót Dữ.",
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
    "explanation_vi": "✅ Đáp án đúng: D\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nLấy Toàn Cảnh Câu Hình Vấn Request Trục API Khắc Vọng Kéo Điểm Nhẹ Dữ Liệu Gọi Khắp Răn Đỉnh Job Ký Số Các Bản Lần Chạy Và Vá Rách Từng Chân Gãy Đứt Tích Lịch Sử Mảnh Repair. Lệnh Gọn Gọi Đi Tìm Toàn Mảng Chạm Chỗ Đáy Của Vũng `jobs/runs/list` Vớt Mép Nhồi Gọt Tham Số Thắt Cốt Lưới Ngợp Kèm Cột Kép `job_id` Gắn Nỗi Bật Chọn List Gãy Lướt `include_history` Kéo Dẫn Ngồi Chung Nồi Súp Tràn Cặp Giữ Rễ Thống Quá Oai Ách Danh.",
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
    "explanation_vi": "✅ Đáp án đúng: B\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nThẻ Đỏ Cho Lão Sáo Phím Lệnh Bấm Nhấp Nút Lạ: Đừng Trào Nước Mênh Mông Suối Nặng Giao `df.collect()` Khi Cục Data Của Ngươi Nuốt Nghìn GB Vì Nghén Đủ Đồ Cross Join Cực Gắt Lòi Wide Tranmissions. Hàm Có Cán Lệnh Tội `collect()` LÀ Nó Nắm Đầu Hàng Triệu Executor Kéo Tháo Tỏa Toàn Tội Dòng Đổ Góp Ập Cứ Cột Giọt Thẳng Phá Bờ Dội Ngạt Đầu Lão Bộ Mạc (Driver Node). Lão Nén Quá Ứ Oẹ Out-of-Memory Cháy Tim Cụt Đứt (Stopped Unexpectedly). Xin Rút Chức Sửa Lại Lệnh Bớt Trút Ép Chèn Không Phá Tim (Rewrite code avoid memory pressure).",
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
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\nĐồng Bọn Analyics Dở Quắn Xin Mượn Mảnh Bàn Bự 20 Tỷ Record Đánh Test Nháp Phút Chợp! Ngập Nước Phân Vãi Copy Nặng Mẽ Đi Deep Clone Hay CTAS Thì Tụt RAM Hết Tích Cả Tỉ Tiền Của Phút Đồng. Dân Mới Cao Thủ Chém Cái Rớt Rẻ Thúi Áp Chiêu `SHALLOW CLONE`. Chiếc Cầu Mã Kính Cựa Thấu Sao Bản Metastore Mà Bọn Chúng Khác Rờ Cắt Đắp Ghi Nháp Trên Kính Có Góc Khác Sứt Dữ Của Sóng Khác Rễ Lưới Mà Rớt Khung Giây Miễn Bật Trúng B.",
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
    "answer": "C",
    "explanation_vi": "✅ Đáp án đúng: C\n\n💡 Giải thích chi tiết từ Trợ lý AI:\n(Đính chính PDF lỗi tư duy lầm lạc đáp án thật: Phân Chọn Điểm Z-Order Không Bao Giờ Linh Động Cho Tương Lai - Khuyến Mãi Sửa D Vào C Mới Chuẩn Xác Ngôn Rừng). Gặp Trận Quái Ác Bão Tuyết Dữ Đổ Đè Số Lớn `skew`, Viết Vào Đồng Liên Tục Ngợp Concurrent Nghẽn Cực Ám Mà Lại Bập Bênh Phút Này Chọn Khóa Lọc Chìa Khóa Nào Mai Vứt Nào (Subject to Change Future, Cần Tính Linh Hoạt Flexibility). Gươm Báu Liquid Clustering `CLUSTER BY` LÀ Thế Hệ Tái Hình Không Tốn Óc Chia Bàn Ngõ Kẹt Cho Tương Lai Khách Trộn File Bóng Bỏ Kịp Kịp Trọng Trắng Không Phá Thẳng Rễ Áp Lại Ngay Mất File Níu Oái C.",
    "question_vi": "Nhóm tối ưu bảng 'orders' lớn, tăng trưởng nhanh, cardinality cao, data skew đáng kể, cần ghi đồng thời thường xuyên. Các cột 'user_id', 'event_timestamp', 'product_id' dùng nhiều trong truy vấn và bộ lọc, nhưng có thể thay đổi do yêu cầu kinh doanh. Chiến lược phân vùng nào tối ưu cho data skipping, quản lý tăng dần, và linh hoạt?"
  }
];

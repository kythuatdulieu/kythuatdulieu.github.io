const QUESTIONS_DATA = [
  {
    "id": 1,
    "topic": 1,
    "question": "An upstream system has been configured to pass the date for a given batch of data to the Databricks Jobs API as a parameter. The notebook to\nbe scheduled will use this parameter to load data with the following code: df = spark.read.format(\"parquet\").load(f\"/mnt/source/(date)\")\nWhich code block should be used to create the date Python variable used in the above code block?",
    "options": {
      "A": "date = spark.conf.get(\"date\")",
      "B": "input_dict = input()\ndate= input_dict[\"date\"]",
      "C": "import sys\ndate = sys.argv[1]",
      "D": "date = dbutils.notebooks.getParam(\"date\")",
      "E": "dbutils.widgets.text(\"date\", \"null\")\ndate = dbutils.widgets.get(\"date\")"
    },
    "answer": "E",
    "question_vi": "Hệ thống upstream truyền tham số ngày cho Databricks Jobs API. Notebook sẽ dùng tham số này để đọc dữ liệu với df = spark.read.format('parquet').load(f\"/mnt/source/(date)\"). Khối lệnh nào dùng để tạo biến date trong Python?",
    "options_vi": {
      "A": "date = spark.conf.get('date')",
      "B": "input_dict = input(); date = input_dict['date']",
      "C": "import sys; date = sys.argv[1]",
      "D": "date = dbutils.notebooks.getParam('date')",
      "E": "dbutils.widgets.text('date', 'null'); date = dbutils.widgets.get('date')"
    },
    "explanation_vi": "Đáp án đúng: E. Với notebook chạy qua Jobs, nên tạo widget cùng tên tham số rồi lấy giá trị bằng dbutils.widgets.get; các lựa chọn khác không lấy được tham số job (getParam không tồn tại).",
    "page": null,
    "image": "img/q_1.jpg"
  },
  {
    "id": 2,
    "topic": 1,
    "question": "The Databricks workspace administrator has configured interactive clusters for each of the data engineering groups. To control costs, clusters are\nset to terminate after 30 minutes of inactivity. Each user should be able to execute workloads against their assigned clusters at any time of the\nday.\nAssuming users have been added to a workspace but not granted any permissions, which of the following describes the minimal permissions a\nuser would need to start and attach to an already configured cluster.",
    "options": {
      "A": "\"Can Manage\" privileges on the required cluster",
      "B": "Workspace Admin privileges, cluster creation allowed, \"Can Attach To\" privileges on the required cluster",
      "C": "Cluster creation allowed, \"Can Attach To\" privileges on the required cluster",
      "D": "\"Can Restart\" privileges on the required cluster",
      "E": "Cluster creation allowed, \"Can Restart\" privileges on the required cluster"
    },
    "answer": "A",
    "question_vi": "Quản trị viên cấu hình các interactive cluster tự dừng sau 30 phút. Người dùng đã có trong workspace nhưng chưa có quyền. Quyền tối thiểu nào để khởi động và gắn vào cluster đã cấu hình?",
    "options_vi": {
      "A": "Quyền 'Can Manage' trên cluster cần dùng",
      "B": "Quyền Workspace Admin, được tạo cluster, và 'Can Attach To' trên cluster",
      "C": "Được tạo cluster và 'Can Attach To' trên cluster",
      "D": "Quyền 'Can Restart' trên cluster",
      "E": "Được tạo cluster và 'Can Restart' trên cluster"
    },
    "explanation_vi": "Đáp án: A. 'Can Manage' bao gồm quyền khởi động, dừng, gắn notebook/job vào cluster. Các quyền thấp hơn (Restart/Attach) không đủ để đảm bảo gắn và chạy khi auto-terminate.",
    "page": null,
    "image": "img/q_2.jpg"
  },
  {
    "id": 3,
    "topic": 1,
    "question": "When scheduling Structured Streaming jobs for production, which configuration automatically recovers from query failures and keeps costs low?",
    "options": {
      "A": "Cluster: New Job Cluster;\nRetries: Unlimited;\nMaximum Concurrent Runs: Unlimited",
      "B": "Cluster: New Job Cluster;\nRetries: None;\nMaximum Concurrent Runs: 1",
      "C": "Cluster: Existing All-Purpose Cluster;\nRetries: Unlimited;\nMaximum Concurrent Runs: 1",
      "D": "Cluster: New Job Cluster;\nRetries: Unlimited;\nMaximum Concurrent Runs: 1",
      "E": "Cluster: Existing All-Purpose Cluster;\nRetries: None;\nMaximum Concurrent Runs: 1"
    },
    "answer": "D",
    "question_vi": "Lên lịch job Structured Streaming cho production, cấu hình nào tự khôi phục sau lỗi và tiết kiệm chi phí?",
    "options_vi": {
      "A": "Cluster job mới; retries vô hạn; chạy đồng thời vô hạn",
      "B": "Cluster job mới; không retry; chạy đồng thời 1",
      "C": "Cluster all-purpose hiện có; retries vô hạn; chạy đồng thời 1",
      "D": "Cluster job mới; retries vô hạn; chạy đồng thời 1",
      "E": "Cluster all-purpose hiện có; không retry; chạy đồng thời 1"
    },
    "explanation_vi": "Đáp án: D. Dùng job cluster mới cho mỗi run, giới hạn concurrent =1 để tránh chồng lấn, và cho phép retries vô hạn để streaming tự phục hồi khi lỗi.",
    "page": null,
    "image": "img/q_3.jpg"
  },
  {
    "id": 4,
    "topic": 1,
    "question": "The data engineering team has configured a Databricks SQL query and alert to monitor the values in a Delta Lake table. The\nrecent_sensor_recordings table contains an identifying sensor_id alongside the timestamp and temperature for the most recent 5 minutes of\nrecordings.\nThe below query is used to create the alert:\nThe query is set to refresh each minute and always completes in less than 10 seconds. The alert is set to trigger when mean (temperature) > 120.\nNotifications are triggered to be sent at most every 1 minute.\nIf this alert raises notifications for 3 consecutive minutes and then stops, which statement must be true?",
    "options": {
      "A": "The total average temperature across all sensors exceeded 120 on three consecutive executions of the query",
      "B": "The recent_sensor_recordings table was unresponsive for three consecutive runs of the query",
      "C": "The source query failed to update properly for three consecutive minutes and then restarted",
      "D": "The maximum temperature recording for at least one sensor exceeded 120 on three consecutive executions of the query",
      "E": "The average temperature recordings for at least one sensor exceeded 120 on three consecutive executions of the query"
    },
    "answer": "E",
    "question_vi": "Alert kiểm tra bảng Delta recent_sensor_recordings (5 phút dữ liệu gần nhất), chạy mỗi phút, trigger khi mean(temperature)>120 và đã gửi cảnh báo 3 phút liên tiếp rồi dừng. Điều nào chắc chắn đúng?",
    "options_vi": {
      "A": "Nhiệt độ trung bình toàn bộ cảm biến >120 trong 3 lần chạy liên tiếp",
      "B": "Bảng recent_sensor_recordings không phản hồi 3 lần liên tiếp",
      "C": "Query nguồn lỗi 3 phút liên tiếp rồi chạy lại",
      "D": "Nhiệt độ tối đa của ít nhất một cảm biến >120 trong 3 lần chạy",
      "E": "Nhiệt độ trung bình của ít nhất một cảm biến >120 trong 3 lần chạy"
    },
    "explanation_vi": "Đáp án: E. Điều kiện alert là trung bình >120; nếu báo 3 lần liên tiếp nghĩa là ít nhất một cảm biến có giá trị trung bình vượt ngưỡng ở cả 3 lần.",
    "page": null,
    "image": "img/q_4.jpg"
  },
  {
    "id": 5,
    "topic": 1,
    "question": "A junior developer complains that the code in their notebook isn't producing the correct results in the development environment. A shared\nscreenshot reveals that while they're using a notebook versioned with Databricks Repos, they're using a personal branch that contains old logic.\nThe desired branch named dev-2.3.9 is not available from the branch selection dropdown.\nWhich approach will allow this developer to review the current logic for this notebook?",
    "options": {
      "A": "Use Repos to make a pull request use the Databricks REST API to update the current branch to dev-2.3.9",
      "B": "Use Repos to pull changes from the remote Git repository and select the dev-2.3.9 branch.",
      "C": "Use Repos to checkout the dev-2.3.9 branch and auto-resolve conflicts with the current branch",
      "D": "Merge all changes back to the main branch in the remote Git repository and clone the repo again",
      "E": "Use Repos to merge the current branch and the dev-2.3.9 branch, then make a pull request to sync with the remote repository"
    },
    "answer": "B",
    "question_vi": "Dev đang ở nhánh cá nhân cũ, cần xem logic mới ở nhánh dev-2.3.9 nhưng không thấy trong dropdown. Cách nào để xem đúng logic?",
    "options_vi": {
      "A": "Dùng Repos tạo pull request và dùng REST API đổi nhánh hiện tại sang dev-2.3.9",
      "B": "Dùng Repos kéo thay đổi từ remote và chọn nhánh dev-2.3.9",
      "C": "Checkout nhánh dev-2.3.9 và tự động resolve conflict",
      "D": "Merge mọi thay đổi về main rồi clone lại repo",
      "E": "Merge nhánh hiện tại với dev-2.3.9 rồi mở pull request đồng bộ"
    },
    "explanation_vi": "Đáp án: B. Cần pull cập nhật từ remote, sau đó chọn nhánh dev-2.3.9 trong Repos để xem logic mới mà không phải tự merge hay API.",
    "page": null,
    "image": "img/q_5.jpg"
  },
  {
    "id": 6,
    "topic": 1,
    "question": "The security team is exploring whether or not the Databricks secrets module can be leveraged for connecting to an external database.\nAfter testing the code with all Python variables being defined with strings, they upload the password to the secrets module and configure the\ncorrect permissions for the currently active user. They then modify their code to the following (leaving all other variables unchanged).\nWhich statement describes what will happen when the above code is executed?",
    "options": {
      "A": "The connection to the external table will fail; the string \"REDACTED\" will be printed.",
      "B": "An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the encoded\npassword will be saved to DBFS.",
      "C": "An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the password will be\nprinted in plain text.",
      "D": "The connection to the external table will succeed; the string value of password will be printed in plain text.",
      "E": "The connection to the external table will succeed; the string \"REDACTED\" will be printed."
    },
    "answer": "E",
    "question_vi": "Đội bảo mật lưu mật khẩu vào Databricks secrets và đổi code để lấy bằng dbutils.secrets.get(). Khi chạy, điều gì xảy ra?",
    "options_vi": {
      "A": "Kết nối thất bại, in chuỗi 'REDACTED'",
      "B": "Hiện ô nhập mật khẩu; nếu đúng sẽ lưu mật khẩu đã mã hóa vào DBFS",
      "C": "Hiện ô nhập mật khẩu; nếu đúng sẽ in mật khẩu dạng rõ",
      "D": "Kết nối thành công và in mật khẩu dạng rõ",
      "E": "Kết nối thành công và in chuỗi 'REDACTED'"
    },
    "explanation_vi": "Đáp án: E. Secrets trả về giá trị thật cho biến password dùng kết nối, nhưng khi print sẽ bị Databricks tự động che bằng 'REDACTED'.",
    "page": null,
    "image": "img/q_6.jpg"
  },
  {
    "id": 7,
    "topic": 1,
    "question": "The data science team has created and logged a production model using MLflow. The following code correctly imports and applies the production\nmodel to output the predictions as a new DataFrame named preds with the schema \"customer_id LONG, predictions DOUBLE, date DATE\".\nThe data science team would like predictions saved to a Delta Lake table with the ability to compare all predictions across time. Churn predictions\nwill be made at most once per day.\nWhich code block accomplishes this task while minimizing potential compute costs?",
    "options": {
      "A": "preds.write.mode(\"append\").saveAsTable(\"churn_preds\")",
      "B": "preds.write.format(\"delta\").save(\"/preds/churn_preds\")",
      "C": "",
      "D": "",
      "E": ""
    },
    "answer": "A",
    "question_vi": "Nhóm DS đã có DataFrame preds dự đoán churn (customer_id, predictions, date) và muốn lưu Delta để so sánh theo thời gian, chạy tối đa 1 lần/ngày. Đoạn mã nào phù hợp và tiết kiệm compute?",
    "options_vi": {
      "A": "preds.write.mode('append').saveAsTable('churn_preds')",
      "B": "preds.write.format('delta').save('/preds/churn_preds')",
      "C": "",
      "D": "",
      "E": ""
    },
    "explanation_vi": "Đáp án: A. Ghi append vào bảng Delta quản lý bởi metastore, mỗi lần chạy thêm bản ghi mới theo ngày để so sánh lịch sử.",
    "page": null,
    "image": "img/q_7.jpg"
  },
  {
    "id": 8,
    "topic": 1,
    "question": "An upstream source writes Parquet data as hourly batches to directories named with the current date. A nightly batch job runs the following code\nto ingest all data from the previous day as indicated by the date variable:\nAssume that the fields customer_id and order_id serve as a composite key to uniquely identify each order.\nIf the upstream system is known to occasionally produce duplicate entries for a single order hours apart, which statement is correct?",
    "options": {
      "A": "Each write to the orders table will only contain unique records, and only those records without duplicates in the target table will be written.",
      "B": "Each write to the orders table will only contain unique records, but newly written records may have duplicates already present in the target\ntable.",
      "C": "Each write to the orders table will only contain unique records; if existing records with the same key are present in the target table, these\nrecords will be overwritten.",
      "D": "Each write to the orders table will only contain unique records; if existing records with the same key are present in the target table, the\noperation will fail.",
      "E": "Each write to the orders table will run deduplication over the union of new and existing records, ensuring no duplicate records are present."
    },
    "answer": "B",
    "question_vi": "Nguồn upstream ghi Parquet theo giờ vào thư mục theo ngày, job đêm ingest dữ liệu ngày hôm trước. Nếu đôi khi upstream sinh bản ghi trùng cho cùng order cách nhau vài giờ, nhận định nào đúng?",
    "options_vi": {
      "A": "Mỗi lần ghi chỉ chứa bản ghi duy nhất và chỉ ghi các bản chưa có trong bảng đích",
      "B": "Mỗi lần ghi chỉ chứa bản ghi duy nhất, nhưng có thể có bản trùng đã tồn tại trong bảng đích",
      "C": "Mỗi lần ghi chỉ chứa bản ghi duy nhất; nếu trùng khóa sẽ bị overwrite",
      "D": "Mỗi lần ghi chỉ chứa bản ghi duy nhất; nếu trùng khóa sẽ lỗi",
      "E": "Mỗi lần ghi sẽ khử trùng trên hợp nhất dữ liệu mới và cũ, đảm bảo không có trùng"
    },
    "explanation_vi": "Đáp án: B. Đoạn code chỉ dùng dropDuplicates trên dữ liệu mới, nên batch ghi ra không trùng lặp nội bộ, nhưng bảng đích có thể đã chứa bản trùng trước đó.",
    "page": null,
    "image": "img/q_8.jpg"
  },
  {
    "id": 9,
    "topic": 1,
    "question": "A junior member of the data engineering team is exploring the language interoperability of Databricks notebooks. The intended outcome of the\nbelow code is to register a view of all sales that occurred in countries on the continent of Africa that appear in the geo_lookup table.\nBefore executing the code, running SHOW TABLES on the current database indicates the database contains only two tables: geo_lookup and\nsales.\nWhich statement correctly describes the outcome of executing these command cells in order in an interactive notebook?",
    "options": {
      "A": "Both commands will succeed. Executing show tables will show that countries_af and sales_af have been registered as views.",
      "B": "Cmd 1 will succeed. Cmd 2 will search all accessible databases for a table or view named countries_af: if this entity exists, Cmd 2 will\nsucceed.",
      "C": "Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable representing a PySpark DataFrame.",
      "D": "Both commands will fail. No new variables, tables, or views will be created.",
      "E": "Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable containing a list of strings."
    },
    "answer": "E",
    "question_vi": "Thử nghiệm liên ngôn ngữ: Cmd1 (Python) tạo DataFrame countries_af = spark.sql('...'). Cmd2 (SQL magic) SELECT * FROM countries_af JOIN sales ... Trước đó DB chỉ có hai bảng geo_lookup và sales. Kết quả?",
    "options_vi": {
      "A": "Cả hai lệnh thành công, tạo view countries_af và sales_af",
      "B": "Cmd1 thành công. Cmd2 tìm trong mọi database thực thể tên countries_af, nếu có sẽ chạy thành công",
      "C": "Cmd1 thành công, Cmd2 thất bại; countries_af là DataFrame PySpark",
      "D": "Cả hai lệnh thất bại, không tạo biến/bảng/view",
      "E": "Cmd1 thành công, Cmd2 thất bại; countries_af là list string"
    },
    "explanation_vi": "Đáp án: C. Cmd1 tạo biến DataFrame Python tên countries_af chứ không tạo view; câu lệnh SQL ở Cmd2 không thấy bảng/view đó nên lỗi.",
    "page": null,
    "image": "img/q_9.jpg"
  },
  {
    "id": 10,
    "topic": 1,
    "question": "A Delta table of weather records is partitioned by date and has the below schema: date DATE, device_id INT, temp FLOAT, latitude FLOAT, longitude\nFLOAT\nTo find all the records from within the Arctic Circle, you execute a query with the below filter: latitude > 66.3\nWhich statement describes how the Delta engine identifies which files to load?",
    "options": {
      "A": "All records are cached to an operational database and then the filter is applied",
      "B": "The Parquet file footers are scanned for min and max statistics for the latitude column",
      "C": "All records are cached to attached storage and then the filter is applied",
      "D": "The Delta log is scanned for min and max statistics for the latitude column",
      "E": "The Hive metastore is scanned for min and max statistics for the latitude column"
    },
    "answer": "B",
    "question_vi": "Bảng Delta thời tiết partition theo date, schema chứa latitude. Query lọc latitude > 66.3. Delta engine xác định file nào cần đọc như thế nào?",
    "options_vi": {
      "A": "Cache mọi bản ghi vào DB vận hành rồi mới lọc",
      "B": "Quét footer Parquet lấy min/max cột latitude",
      "C": "Cache mọi bản ghi lên storage gắn ngoài rồi lọc",
      "D": "Quét Delta log lấy min/max cột latitude",
      "E": "Quét Hive metastore lấy min/max cột latitude"
    },
    "explanation_vi": "Đáp án: B. Delta/Parquet dùng thống kê min/max ở footer để bỏ qua file không thể thỏa điều kiện.",
    "page": null,
    "image": "img/q_10.jpg"
  },
  {
    "id": 11,
    "topic": 1,
    "question": "The data engineering team has configured a job to process customer requests to be forgotten (have their data deleted). All user data that needs\nto be deleted is stored in Delta Lake tables using default table settings.\nThe team has decided to process all deletions from the previous week as a batch job at 1am each Sunday. The total duration of this job is less\nthan one hour. Every Monday at 3am, a batch job executes a series of VACUUM commands on all Delta Lake tables throughout the organization.\nThe compliance officer has recently learned about Delta Lake's time travel functionality. They are concerned that this might allow continued\naccess to deleted data.\nAssuming all delete logic is correctly implemented, which statement correctly addresses this concern?",
    "options": {
      "A": "Because the VACUUM command permanently deletes all files containing deleted records, deleted records may be accessible with time\ntravel for around 24 hours.",
      "B": "Because the default data retention threshold is 24 hours, data files containing deleted records will be retained until the VACUUM job is run\nthe following day.",
      "C": "Because Delta Lake time travel provides full access to the entire history of a table, deleted records can always be recreated by users with\nfull admin privileges.",
      "D": "Because Delta Lake's delete statements have ACID guarantees, deleted records will be permanently purged from all storage systems as\nsoon as a delete job completes.",
      "E": "Because the default data retention threshold is 7 days, data files containing deleted records will be retained until the VACUUM job is run 8\ndays later."
    },
    "answer": "A",
    "question_vi": "Job xóa dữ liệu hàng tuần, thời gian <1h vào Chủ nhật 1h. VACUUM chạy mỗi thứ Hai 3h. Default retention 7 ngày. Lo ngại time travel truy cập dữ liệu đã xóa. Phát biểu đúng?",
    "options_vi": {
      "A": "VACUUM xóa file chứa bản ghi xóa nên time travel còn ~24h",
      "B": "Do retention mặc định 24h, file chứa bản xóa giữ tới VACUUM hôm sau",
      "C": "Time travel luôn truy cập toàn bộ lịch sử nên có thể khôi phục dữ liệu xóa",
      "D": "Delete có ACID nên file xóa sẽ bị xóa ngay khi job kết thúc",
      "E": "Retention mặc định 7 ngày nên file chứa bản xóa giữ tới khi VACUUM 8 ngày sau"
    },
    "explanation_vi": "Đáp án: E. Delta giữ file tối thiểu 7 ngày trước khi VACUUM, nên dữ liệu đã xóa vẫn tồn tại (dù bị đánh dấu) và có thể time travel trong khoảng đó cho tới VACUUM chạy sau 7 ngày.",
    "page": null,
    "image": "img/q_11.jpg"
  },
  {
    "id": 12,
    "topic": 1,
    "question": "A junior data engineer has configured a workload that posts the following JSON to the Databricks REST API endpoint 2.0/jobs/create.\nAssuming that all configurations and referenced resources are available, which statement describes the result of executing this workload three\ntimes?",
    "options": {
      "A": "Three new jobs named \"Ingest new data\" will be defined in the workspace, and they will each run once daily.",
      "B": "The logic defined in the referenced notebook will be executed three times on new clusters with the configurations of the provided cluster ID.",
      "C": "Three new jobs named \"Ingest new data\" will be defined in the workspace, but no jobs will be executed.",
      "D": "One new job named \"Ingest new data\" will be defined in the workspace, but it will not be executed.",
      "E": "The logic defined in the referenced notebook will be executed three times on the referenced existing all purpose cluster."
    },
    "answer": "C",
    "question_vi": "Một workload gọi POST /api/2.0/jobs/create với JSON định nghĩa job. Chạy 3 lần lời gọi này sẽ ra sao?",
    "options_vi": {
      "A": "Tạo 3 job mới tên 'Ingest new data' và mỗi job chạy daily",
      "B": "Logic notebook sẽ chạy 3 lần trên cluster mới từ cluster_id",
      "C": "Tạo 3 job mới tên 'Ingest new data' nhưng không thực thi",
      "D": "Tạo 1 job mới tên 'Ingest new data' nhưng không chạy",
      "E": "Logic notebook chạy 3 lần trên cluster all-purpose hiện có"
    },
    "explanation_vi": "Đáp án: C. jobs/create chỉ định nghĩa job, không kích hoạt chạy; gọi ba lần sẽ tạo ba định nghĩa job trùng tên.",
    "page": null,
    "image": "img/q_12.jpg"
  },
  {
    "id": 13,
    "topic": 1,
    "question": "An upstream system is emitting change data capture (CDC) logs that are being written to a cloud object storage directory. Each record in the log\nindicates the change type (insert, update, or delete) and the values for each field after the change. The source table has a primary key identified by\nthe field pk_id.\nFor auditing purposes, the data governance team wishes to maintain a full record of all values that have ever been valid in the source system. For\nanalytical purposes, only the most recent value for each record needs to be recorded. The Databricks job to ingest these records occurs once per\nhour, but each individual record may have changed multiple times over the course of an hour.\nWhich solution meets these requirements?",
    "options": {
      "A": "Create a separate history table for each pk_id resolve the current state of the table by running a union all filtering the history tables for the\nmost recent state.",
      "B": "Use MERGE INTO to insert, update, or delete the most recent entry for each pk_id into a bronze table, then propagate all changes\nthroughout the system.",
      "C": "Iterate through an ordered set of changes to the table, applying each in turn; rely on Delta Lake's versioning ability to create an audit log.",
      "D": "Use Delta Lake's change data feed to automatically process CDC data from an external system, propagating all changes to all dependent\ntables in the Lakehouse.",
      "E": "Ingest all log information into a bronze table; use MERGE INTO to insert, update, or delete the most recent entry for each pk_id into a silver\ntable to recreate the current table state."
    },
    "answer": "E",
    "question_vi": "CDC log chứa insert/update/delete theo pk_id. Cần lưu toàn bộ lịch sử giá trị và cũng cần bảng trạng thái hiện tại. Job ingest mỗi giờ, một bản ghi có thể thay đổi nhiều lần trong giờ. Giải pháp?",
    "options_vi": {
      "A": "Tạo bảng history riêng cho từng pk_id và union để lấy trạng thái hiện tại",
      "B": "MERGE INTO bảng bronze để áp dụng bản ghi mới nhất rồi truyền tiếp",
      "C": "Duyệt tuần tự các thay đổi và dựa vào versioning Delta làm audit",
      "D": "Dùng change data feed của Delta tự động xử lý CDC ngoài",
      "E": "Nạp toàn bộ log vào bảng bronze; dùng MERGE INTO bảng silver chèn/cập nhật/xóa bản mới nhất cho mỗi pk_id để tái tạo trạng thái hiện tại"
    },
    "explanation_vi": "Đáp án: E. Bronze giữ toàn bộ lịch sử phục vụ audit, silver dùng MERGE theo pk_id mỗi giờ để giữ trạng thái hiện tại.",
    "page": null,
    "image": "img/q_13.jpg"
  },
  {
    "id": 14,
    "topic": 1,
    "question": "An hourly batch job is configured to ingest data files from a cloud object storage container where each batch represent all records produced by the\nsource system in a given hour. The batch job to process these records into the Lakehouse is sufficiently delayed to ensure no late-arriving data is\nmissed. The user_id field represents a unique key for the data, which has the following schema: user_id BIGINT, username STRING, user_utc\nSTRING, user_region STRING, last_login BIGINT, auto_pay BOOLEAN, last_updated BIGINT\nNew records are all ingested into a table named account_history which maintains a full record of all data in the same schema as the source. The\nnext table in the system is named account_current and is implemented as a Type 1 table representing the most recent value for each unique\nuser_id.\nAssuming there are millions of user accounts and tens of thousands of records processed hourly, which implementation can be used to efficiently\nupdate the described account_current table as part of each hourly batch job?",
    "options": {
      "A": "Use Auto Loader to subscribe to new files in the account_history directory; configure a Structured Streaming trigger once job to batch\nupdate newly detected files into the account_current table.",
      "B": "Overwrite the account_current table with each batch using the results of a query against the account_history table grouping by user_id and\nfiltering for the max value of last_updated.",
      "C": "Filter records in account_history using the last_updated field and the most recent hour processed, as well as the max last_iogin by user_id\nwrite a merge statement to update or insert the most recent value for each user_id.",
      "D": "Use Delta Lake version history to get the difference between the latest version of account_history and one version prior, then write these\nrecords to account_current.",
      "E": "Filter records in account_history using the last_updated field and the most recent hour processed, making sure to deduplicate on username;\nwrite a merge statement to update or insert the most recent value for each username."
    },
    "answer": "C",
    "question_vi": "Bảng account_history lưu toàn bộ bản ghi theo giờ, cần bảng account_current kiểu Type1 mới nhất cho mỗi user_id. Khối lượng: hàng triệu user, hàng chục nghìn bản ghi/giờ. Cách cập nhật hiệu quả?",
    "options_vi": {
      "A": "Dùng Auto Loader streaming trigger once cập nhật batch vào account_current",
      "B": "Mỗi batch overwrite account_current bằng group by user_id, max(last_updated)",
      "C": "Lọc bản ghi giờ mới nhất theo last_updated, lấy max last_login cho mỗi user_id và MERGE update/insert vào account_current",
      "D": "Dùng Delta version history so sánh hai version rồi ghi chênh lệch",
      "E": "Lọc theo last_updated giờ mới nhất, dedup theo username rồi MERGE theo username"
    },
    "explanation_vi": "Đáp án: C. Chỉ xử lý bản ghi giờ mới nhất, dedup theo user_id với timestamp rồi MERGE vào bảng current để tránh full scan/overwrite.",
    "page": null,
    "image": "img/q_14.jpg"
  },
  {
    "id": 15,
    "topic": 1,
    "question": "A table in the Lakehouse named customer_churn_params is used in churn prediction by the machine learning team. The table contains\ninformation about customers derived from a number of upstream sources. Currently, the data engineering team populates this table nightly by\noverwriting the table with the current valid values derived from upstream data sources.\nThe churn prediction model used by the ML team is fairly stable in production. The team is only interested in making predictions on records that\nhave changed in the past 24 hours.\nWhich approach would simplify the identification of these changed records?",
    "options": {
      "A": "Apply the churn model to all rows in the customer_churn_params table, but implement logic to perform an upsert into the predictions table\nthat ignores rows where predictions have not changed.",
      "B": "Convert the batch job to a Structured Streaming job using the complete output mode; configure a Structured Streaming job to read from the\ncustomer_churn_params table and incrementally predict against the churn model.",
      "C": "Calculate the difference between the previous model predictions and the current customer_churn_params on a key identifying unique\ncustomers before making new predictions; only make predictions on those customers not in the previous predictions.",
      "D": "Modify the overwrite logic to include a field populated by calling spark.sql.functions.current_timestamp() as data are being written; use this\nfield to identify records written on a particular date.",
      "E": "Replace the current overwrite logic with a merge statement to modify only those records that have changed; write logic to make predictions\non the changed records identified by the change data feed."
    },
    "answer": "E",
    "question_vi": "Bảng customer_churn_params được overwrite hàng đêm. ML chỉ muốn dự báo cho bản ghi thay đổi trong 24h. Cách đơn giản để nhận diện bản ghi đổi?",
    "options_vi": {
      "A": "Chạy model cho toàn bộ bảng rồi upsert bỏ qua dòng không đổi",
      "B": "Chuyển sang Structured Streaming complete mode và stream từ bảng",
      "C": "So sánh prediction cũ với bảng mới trước khi dự báo",
      "D": "Thêm cột current_timestamp khi ghi overwrite để lọc theo ngày",
      "E": "Thay overwrite bằng MERGE chỉ cập nhật bản đổi và dùng change data feed để lấy bản thay đổi dự báo"
    },
    "explanation_vi": "Đáp án: E. MERGE + CDF giúp nhận diện chính xác bản ghi thay đổi để chỉ dự báo cho phần thay đổi.",
    "page": null,
    "image": "img/q_15.jpg"
  },
  {
    "id": 16,
    "topic": 1,
    "question": "A table is registered with the following code:\nBoth users and orders are Delta Lake tables. Which statement describes the results of querying recent_orders?",
    "options": {
      "A": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query finishes.",
      "B": "All logic will execute when the table is defined and store the result of joining tables to the DBFS; this stored data will be returned when the\ntable is queried.",
      "C": "Results will be computed and cached when the table is defined; these cached results will incrementally update as new records are inserted\ninto source tables.",
      "D": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query began.",
      "E": "The versions of each source table will be stored in the table transaction log; query results will be saved to DBFS with each query."
    },
    "answer": "D",
    "question_vi": "recent_orders được định nghĩa bằng câu lệnh CREATE TABLE AS SELECT join giữa users và orders (Delta). Kết quả truy vấn recent_orders như thế nào?",
    "options_vi": {
      "A": "Toàn bộ logic chạy lúc query, dùng version hợp lệ tại thời điểm query kết thúc",
      "B": "Logic chạy khi định nghĩa bảng và lưu kết quả join vào DBFS; truy vấn trả dữ liệu đã lưu",
      "C": "Kết quả tính và cache khi định nghĩa, cache sẽ cập nhật dần khi nguồn chèn mới",
      "D": "Logic chạy lúc query và dùng version hợp lệ tại thời điểm query bắt đầu",
      "E": "Version mỗi bảng nguồn lưu vào transaction log; kết quả truy vấn được lưu mỗi lần query"
    },
    "explanation_vi": "Đáp án: D. View/table định nghĩa bằng SELECT sẽ được tính khi truy vấn, dùng snapshot tại thời điểm bắt đầu truy vấn (ACID snapshot isolation).",
    "page": null,
    "image": "img/q_16.jpg"
  },
  {
    "id": 17,
    "topic": 1,
    "question": "A production workload incrementally applies updates from an external Change Data Capture feed to a Delta Lake table as an always-on Structured\nStream job. When data was initially migrated for this table, OPTIMIZE was executed and most data files were resized to 1 GB. Auto Optimize and\nAuto Compaction were both turned on for the streaming production job. Recent review of data files shows that most data files are under 64 MB,\nalthough each partition in the table contains at least 1 GB of data and the total table size is over 10 TB.\nWhich of the following likely explains these smaller file sizes?",
    "options": {
      "A": "Databricks has autotuned to a smaller target file size to reduce duration of MERGE operations",
      "B": "Z-order indices calculated on the table are preventing file compaction",
      "C": "Bloom filter indices calculated on the table are preventing file compaction",
      "D": "Databricks has autotuned to a smaller target file size based on the overall size of data in the table",
      "E": "Databricks has autotuned to a smaller target file size based on the amount of data in each partition"
    },
    "answer": "A",
    "question_vi": "Streaming MERGE CDC luôn bật; ban đầu OPTIMIZE file ~1GB, Auto Optimize/Compaction bật. Giờ file <64MB dù mỗi partition >=1GB, tổng bảng >10TB. Lý do?",
    "options_vi": {
      "A": "Databricks tự điều chỉnh kích thước file nhỏ hơn để giảm thời gian MERGE",
      "B": "Chỉ số Z-order ngăn compaction",
      "C": "Bloom filter ngăn compaction",
      "D": "Databricks tự điều chỉnh kích thước file dựa trên tổng size bảng",
      "E": "Databricks tự điều chỉnh kích thước file dựa trên dữ liệu trong từng partition"
    },
    "explanation_vi": "Đáp án: E. Auto Optimize/Compaction autotune kích thước file mục tiêu dựa trên lượng dữ liệu mỗi partition, dẫn tới file ~64MB dù bảng lớn.",
    "page": null,
    "image": "img/q_17.jpg"
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
    "question_vi": "Phát biểu đúng về stream-static join và bảng Delta tĩnh?",
    "options_vi": {
      "A": "Mỗi microbatch dùng version mới nhất của bảng tĩnh tại thời điểm microbatch",
      "B": "Mỗi microbatch dùng version bảng tĩnh tại thời điểm job khởi tạo",
      "C": "Checkpoint lưu state cho khóa join",
      "D": "Stream-static join không dùng được bảng Delta tĩnh do inconsistency",
      "E": "Checkpoint lưu cập nhật của bảng tĩnh"
    },
    "explanation_vi": "Đáp án: A. Mỗi microbatch sẽ đọc snapshot hiện tại của bảng tĩnh (as-of batch start). Checkpoint không theo dõi thay đổi bảng tĩnh.",
    "page": null,
    "image": "img/q_18.jpg"
  },
  {
    "id": 19,
    "topic": 1,
    "question": "A junior data engineer has been asked to develop a streaming data pipeline with a grouped aggregation using DataFrame df. The pipeline needs to\ncalculate the average humidity and average temperature for each non-overlapping five-minute interval. Events are recorded once per minute per\ndevice.\nStreaming DataFrame df has the following schema:\n\"device_id INT, event_time TIMESTAMP, temp FLOAT, humidity FLOAT\"\nCode block:\nChoose the response that correctly fills in the blank within the code block to complete this task.",
    "options": {
      "A": "to_interval(\"event_time\", \"5 minutes\").alias(\"time\")",
      "B": "window(\"event_time\", \"5 minutes\").alias(\"time\")",
      "C": "\"event_time\"",
      "D": "window(\"event_time\", \"10 minutes\").alias(\"time\")",
      "E": "lag(\"event_time\", \"10 minutes\").alias(\"time\")"
    },
    "answer": "B",
    "question_vi": "Cần tính avg humidity, avg temp cho mỗi cửa sổ 5 phút không chồng lặp trong streaming DataFrame. Chọn biểu thức hoàn thiện code?",
    "options_vi": {
      "A": "to_interval('event_time','5 minutes').alias('time')",
      "B": "window('event_time','5 minutes').alias('time')",
      "C": "'event_time'",
      "D": "window('event_time','10 minutes').alias('time')",
      "E": "lag('event_time','10 minutes').alias('time')"
    },
    "explanation_vi": "Đáp án: B. Dùng hàm window với kích thước 5 phút để groupBy và tính trung bình cho từng cửa sổ.",
    "page": null,
    "image": "img/q_19.jpg"
  },
  {
    "id": 20,
    "topic": 1,
    "question": "A data architect has designed a system in which two Structured Streaming jobs will concurrently write to a single bronze Delta table. Each job is\nsubscribing to a different topic from an Apache Kafka source, but they will write data with the same schema. To keep the directory structure\nsimple, a data engineer has decided to nest a checkpoint directory to be shared by both streams.\nThe proposed directory structure is displayed below:\nWhich statement describes whether this checkpoint directory structure is valid for the given scenario and why?",
    "options": {
      "A": "No; Delta Lake manages streaming checkpoints in the transaction log.",
      "B": "Yes; both of the streams can share a single checkpoint directory.",
      "C": "No; only one stream can write to a Delta Lake table.",
      "D": "Yes; Delta Lake supports infinite concurrent writers.",
      "E": "No; each of the streams needs to have its own checkpoint directory."
    },
    "answer": "E",
    "question_vi": "Hai job Structured Streaming cùng ghi vào một bảng Delta bronze, mỗi job đọc topic Kafka khác nhau cùng schema. Kỹ sư định dùng chung một thư mục checkpoint lồng nhau. Cấu trúc checkpoint này có hợp lệ không?",
    "options_vi": {
      "A": "Không; Delta quản lý checkpoint trong transaction log",
      "B": "Có; hai stream có thể dùng chung checkpoint",
      "C": "Không; chỉ một stream được ghi Delta",
      "D": "Có; Delta hỗ trợ vô hạn writer đồng thời",
      "E": "Không; mỗi stream cần checkpoint riêng"
    },
    "explanation_vi": "Đáp án: E. Mỗi streaming job cần checkpoint riêng để lưu offset/state; dùng chung dẫn tới xung đột state và lỗi.",
    "page": null,
    "image": "img/q_20.jpg"
  },
  {
    "id": 21,
    "topic": 1,
    "question": "A Structured Streaming job deployed to production has been experiencing delays during peak hours of the day. At present, during normal\nexecution, each microbatch of data is processed in less than 3 seconds. During peak hours of the day, execution time for each microbatch\nbecomes very inconsistent, sometimes exceeding 30 seconds. The streaming write is currently configured with a trigger interval of 10 seconds.\nHolding all other variables constant and assuming records need to be processed in less than 10 seconds, which adjustment will meet the\nrequirement?",
    "options": {
      "A": "Decrease the trigger interval to 5 seconds; triggering batches more frequently allows idle executors to begin processing the next batch\nwhile longer running tasks from previous batches finish.",
      "B": "Increase the trigger interval to 30 seconds; setting the trigger interval near the maximum execution time observed for each batch is always\nbest practice to ensure no records are dropped.",
      "C": "The trigger interval cannot be modified without modifying the checkpoint directory; to maintain the current stream state, increase the\nnumber of shuffle partitions to maximize parallelism.",
      "D": "Use the trigger once option and configure a Databricks job to execute the query every 10 seconds; this ensures all backlogged records are\nprocessed with each batch.",
      "E": "Decrease the trigger interval to 5 seconds; triggering batches more frequently may prevent records from backing up and large batches from\ncausing spill."
    },
    "answer": "D",
    "question_vi": "Job streaming có trigger 10s, bình thường mỗi microbatch <3s, giờ cao điểm có batch >30s. Cần đảm bảo xử lý <10s. Điều chỉnh nào phù hợp?",
    "options_vi": {
      "A": "Giảm trigger xuống 5s để tận dụng executor rảnh xử lý batch kế tiếp",
      "B": "Tăng trigger lên 30s cho bằng max thời gian",
      "C": "Không thể đổi trigger nếu không đổi checkpoint; hãy tăng shuffle partitions",
      "D": "Dùng trigger once và chạy job mỗi 10s",
      "E": "Giảm trigger xuống 5s để tránh backlog và batch lớn gây spill"
    },
    "explanation_vi": "Đáp án: E. Trigger ngắn hơn giúp giảm kích thước mỗi batch trong giờ cao điểm, tránh backlog và kéo dài >10s.",
    "page": null,
    "image": "img/q_21.jpg"
  },
  {
    "id": 22,
    "topic": 1,
    "question": "Which statement describes Delta Lake Auto Compaction?",
    "options": {
      "A": "An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed\ntoward a default of 1 GB.",
      "B": "Before a Jobs cluster terminates, OPTIMIZE is executed on all tables modified during the most recent job.",
      "C": "Optimized writes use logical partitions instead of directory partitions; because partition boundaries are only represented in metadata, fewer\nsmall files are written.",
      "D": "Data is queued in a messaging bus instead of committing data directly to memory; all data is committed from the messaging bus in one\nbatch once the job is complete.",
      "E": "An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed\ntoward a default of 128 MB."
    },
    "answer": "A",
    "question_vi": "Mô tả nào đúng về Delta Lake Auto Compaction?",
    "options_vi": {
      "A": "Job bất đồng bộ chạy sau khi write xong; nếu cần sẽ OPTIMIZE tới ~1GB",
      "B": "Trước khi cluster Jobs dừng sẽ OPTIMIZE mọi bảng đã chỉnh",
      "C": "Optimized writes dùng partition logic thay thư mục, nên ít file nhỏ",
      "D": "Dữ liệu xếp vào message bus rồi commit một lần khi job xong",
      "E": "Job bất đồng bộ chạy sau write; nếu cần sẽ OPTIMIZE tới ~128MB"
    },
    "explanation_vi": "Đáp án: E. Auto Compaction chạy bất đồng bộ sau khi ghi, gom file nhỏ hướng tới kích thước khoảng 128MB.",
    "page": null,
    "image": "img/q_22.jpg"
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
    "question_vi": "Phát biểu nào đặc trưng mô hình lập trình của Spark Structured Streaming?",
    "options_vi": {
      "A": "Dựa vào GPU để đạt throughput cao",
      "B": "Được triển khai như message bus bắt nguồn từ Kafka",
      "C": "Dùng phần cứng/I-O đặc biệt để đạt độ trễ dưới giây",
      "D": "Mô hình hóa dữ liệu streaming như các dòng bản ghi mới append vào bảng vô hạn",
      "E": "Phụ thuộc mạng node phân tán giữ state cache"
    },
    "explanation_vi": "Đáp án: D. Structured Streaming coi luồng dữ liệu là bảng vô hạn được append liên tục và chạy query gia tăng.",
    "page": null,
    "image": "img/q_23.jpg"
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
    "question_vi": "Tham số nào ảnh hưởng trực tiếp kích thước spark-partition khi ingest dữ liệu?",
    "options_vi": {
      "A": "spark.sql.files.maxPartitionBytes",
      "B": "spark.sql.autoBroadcastJoinThreshold",
      "C": "spark.sql.files.openCostInBytes",
      "D": "spark.sql.adaptive.coalescePartitions.minPartitionNum",
      "E": "spark.sql.adaptive.advisoryPartitionSizeInBytes"
    },
    "explanation_vi": "Đáp án: A. maxPartitionBytes quy định lượng byte tối đa mỗi partition khi đọc file.",
    "page": null,
    "image": "img/q_24.jpg"
  },
  {
    "id": 25,
    "topic": 1,
    "question": "A Spark job is taking longer than expected. Using the Spark UI, a data engineer notes that the Min, Median, and Max Durations for tasks in a\nparticular stage show the minimum and median time to complete a task as roughly the same, but the max duration for a task to be roughly 100\ntimes as long as the minimum.\nWhich situation is causing increased duration of the overall job?",
    "options": {
      "A": "Task queueing resulting from improper thread pool assignment.",
      "B": "Spill resulting from attached volume storage being too small.",
      "C": "Network latency due to some cluster nodes being in different regions from the source data",
      "D": "Skew caused by more data being assigned to a subset of spark-partitions.",
      "E": "Credential validation errors while pulling data from an external system."
    },
    "answer": "D",
    "question_vi": "Spark UI cho thấy thời gian max của một task cao gấp ~100 lần min/median trong một stage. Nguyên nhân kéo dài job?",
    "options_vi": {
      "A": "Task queue do thread pool sai",
      "B": "Spill vì volume gắn ngoài nhỏ",
      "C": "Độ trễ mạng do node khác region",
      "D": "Skew vì một số partition nhận nhiều dữ liệu hơn",
      "E": "Lỗi credential khi pull dữ liệu ngoài"
    },
    "explanation_vi": "Đáp án: D. Skew khiến vài task phải xử lý lượng dữ liệu lớn bất thường, kéo dài thời gian max.",
    "page": null,
    "image": "img/q_25.jpg"
  },
  {
    "id": 26,
    "topic": 1,
    "question": "Each configuration below is identical to the extent that each cluster has 400 GB total of RAM, 160 total cores and only one Executor per VM.\nGiven a job with at least one wide transformation, which of the following cluster configurations will result in maximum performance?",
    "options": {
      "A": "• Total VMs; 1\n• 400 GB per Executor\n• 160 Cores / Executor",
      "B": "• Total VMs: 8\n• 50 GB per Executor\n• 20 Cores / Executor",
      "C": "• Total VMs: 16\n• 25 GB per Executor\n• 10 Cores/Executor",
      "D": "• Total VMs: 4\n• 100 GB per Executor\n• 40 Cores/Executor",
      "E": "• Total VMs:2\n• 200 GB per Executor\n• 80 Cores / Executor"
    },
    "answer": "B",
    "question_vi": "Cấu hình cluster (400GB RAM, 160 cores, 1 executor/VM). Job có wide transformation. Cấu hình nào nhanh nhất?",
    "options_vi": {
      "A": "1 VM; 400GB; 160 cores/executor",
      "B": "8 VM; 50GB; 20 cores/executor",
      "C": "16 VM; 25GB; 10 cores/executor",
      "D": "4 VM; 100GB; 40 cores/executor",
      "E": "2 VM; 200GB; 80 cores/executor"
    },
    "explanation_vi": "Đáp án: B. Nhiều executor nhỏ hơn (8 máy *20 cores) giúp song song cao, tránh JVM quá to gây GC chậm.",
    "page": null,
    "image": "img/q_26.jpg"
  },
  {
    "id": 27,
    "topic": 1,
    "question": "A junior data engineer on your team has implemented the following code block.\nThe view new_events contains a batch of records with the same schema as the events Delta table. The event_id field serves as a unique key for\nthis table.\nWhen this query is executed, what will happen with new records that have the same event_id as an existing record?",
    "options": {
      "A": "They are merged.",
      "B": "They are ignored.",
      "C": "They are updated.",
      "D": "They are inserted.",
      "E": "They are deleted."
    },
    "answer": "B",
    "question_vi": "MERGE với view new_events (cùng schema events, event_id là khóa). Khi chạy, bản ghi mới có event_id trùng bản hiện có sẽ thế nào?",
    "options_vi": {
      "A": "Được merge",
      "B": "Bị bỏ qua",
      "C": "Được update",
      "D": "Được insert",
      "E": "Bị delete"
    },
    "explanation_vi": "Đáp án: B. Câu lệnh chỉ WHEN NOT MATCHED THEN INSERT, nên bản trùng khóa sẽ bị bỏ qua, không update hay insert.",
    "page": null,
    "image": "img/q_27.jpg"
  },
  {
    "id": 28,
    "topic": 1,
    "question": "A junior data engineer seeks to leverage Delta Lake's Change Data Feed functionality to create a Type 1 table representing all of the values that\nhave ever been valid for all rows in a bronze table created with the property delta.enableChangeDataFeed = true. They plan to execute the\nfollowing code as a daily job:\nWhich statement describes the execution and results of running the above query multiple times?",
    "options": {
      "A": "Each time the job is executed, newly updated records will be merged into the target table, overwriting previous values with the same\nprimary keys.",
      "B": "Each time the job is executed, the entire available history of inserted or updated records will be appended to the target table, resulting in\nmany duplicate entries.",
      "C": "Each time the job is executed, the target table will be overwritten using the entire history of inserted or updated records, giving the desired\nresult.",
      "D": "Each time the job is executed, the differences between the original and current versions are calculated; this may result in duplicate entries\nfor some records.",
      "E": "Each time the job is executed, only those records that have been inserted or updated since the last execution will be appended to the target\ntable, giving the desired result."
    },
    "answer": "B",
    "question_vi": "Muốn dùng Change Data Feed để tạo bảng Type 1 chứa mọi giá trị từng tồn tại từ bảng bronze (CDF bật). Job hàng ngày chạy câu lệnh append toàn bộ CDF. Hệ quả khi chạy nhiều lần?",
    "options_vi": {
      "A": "Mỗi lần chạy, bản cập nhật mới merge vào bảng đích, ghi đè giá trị trùng khóa",
      "B": "Mỗi lần chạy, toàn bộ lịch sử insert/update sẽ append, tạo rất nhiều bản trùng",
      "C": "Mỗi lần chạy, bảng đích bị overwrite bằng toàn bộ lịch sử, cho kết quả đúng",
      "D": "Mỗi lần chạy tính chênh lệch giữa bản gốc và hiện tại, có thể trùng",
      "E": "Mỗi lần chạy chỉ append bản ghi thay đổi kể từ lần trước, cho kết quả đúng"
    },
    "explanation_vi": "Đáp án: B. Query đọc toàn bộ lịch sử CDF mỗi lần và append, nên chạy nhiều lần sẽ lặp lại dữ liệu nhiều lần.",
    "page": null,
    "image": "img/q_28.jpg"
  },
  {
    "id": 29,
    "topic": 1,
    "question": "A new data engineer notices that a critical field was omitted from an application that writes its Kafka source to Delta Lake. This happened even\nthough the critical field was in the Kafka source. That field was further missing from data written to dependent, long-term storage. The retention\nthreshold on the Kafka service is seven days. The pipeline has been in production for three months.\nWhich describes how Delta Lake can help to avoid data loss of this nature in the future?",
    "options": {
      "A": "The Delta log and Structured Streaming checkpoints record the full history of the Kafka producer.",
      "B": "Delta Lake schema evolution can retroactively calculate the correct value for newly added fields, as long as the data was in the original\nsource.",
      "C": "Delta Lake automatically checks that all fields present in the source data are included in the ingestion layer.",
      "D": "Data can never be permanently dropped or deleted from Delta Lake, so data loss is not possible under any circumstance.",
      "E": "Ingesting all raw data and metadata from Kafka to a bronze Delta table creates a permanent, replayable history of the data state."
    },
    "answer": "E",
    "question_vi": "Một kỹ sư dữ liệu mới phát hiện một trường quan trọng bị bỏ sót khi ghi dữ liệu Kafka vào Delta Lake, dù trường này có trong nguồn Kafka và các bảng phụ thuộc cũng thiếu. Kafka chỉ giữ dữ liệu 7 ngày, pipeline chạy 3 tháng. Delta Lake giúp tránh mất dữ liệu này thế nào trong tương lai?",
    "options_vi": {
      "A": "Delta log và checkpoint của Structured Streaming ghi lại toàn bộ lịch sử của Kafka producer.",
      "B": "Schema evolution của Delta Lake có thể tính lại giá trị cho trường mới nếu dữ liệu đã có trong nguồn.",
      "C": "Delta Lake tự động kiểm tra mọi trường nguồn đều được nạp vào lớp ingestion.",
      "D": "Dữ liệu không bao giờ bị xóa vĩnh viễn khỏi Delta Lake nên không thể mất dữ liệu.",
      "E": "Ghi toàn bộ dữ liệu và metadata thô từ Kafka vào bảng bronze Delta tạo lịch sử có thể phát lại vĩnh viễn."
    },
    "explanation_vi": "Đáp án đúng E: nếu luôn đổ thẳng dữ liệu Kafka thô vào bảng bronze, ta giữ được lịch sử đầy đủ vượt quá thời gian giữ của Kafka, có thể phát lại hoặc backfill khi ứng dụng bỏ sót trường.",
    "page": null,
    "image": "img/q_29.jpg"
  },
  {
    "id": 30,
    "topic": 1,
    "question": "A nightly job ingests data into a Delta Lake table using the following code:\nThe next step in the pipeline requires a function that returns an object that can be used to manipulate new records that have not yet been\nprocessed to the next table in the pipeline.\nWhich code snippet completes this function definition?\ndef new_records():",
    "options": {
      "A": "return spark.readStream.table(\"bronze\")",
      "B": "return spark.readStream.load(\"bronze\")",
      "C": "",
      "D": "return spark.read.option(\"readChangeFeed\", \"true\").table (\"bronze\")",
      "E": ""
    },
    "answer": "D",
    "question_vi": "Job nightly nạp dữ liệu vào bảng Delta bronze. Bước kế tiếp cần hàm trả về đối tượng để xử lý các bản ghi mới chưa đẩy sang bảng tiếp theo. Đoạn code nào hoàn thiện hàm new_records()?",
    "options_vi": {
      "A": "return spark.readStream.table(\"bronze\")",
      "B": "return spark.readStream.load(\"bronze\")",
      "C": "(trống)",
      "D": "return spark.read.option(\"readChangeFeed\", \"true\").table(\"bronze\")",
      "E": "(trống)"
    },
    "explanation_vi": "Đáp án D: cần đọc change data feed để lấy các bản ghi mới/chưa xử lý; readStream.table chỉ đọc dòng dữ liệu, còn readChangeFeed mới cung cấp delta của bảng.",
    "page": null,
    "image": "img/q_30.jpg"
  },
  {
    "id": 31,
    "topic": 1,
    "question": "A junior data engineer is working to implement logic for a Lakehouse table named silver_device_recordings. The source data contains 100 unique\nfields in a highly nested JSON structure.\nThe silver_device_recordings table will be used downstream to power several production monitoring dashboards and a production model. At\npresent, 45 of the 100 fields are being used in at least one of these applications.\nThe data engineer is trying to determine the best approach for dealing with schema declaration given the highly-nested structure of the data and\nthe numerous fields.\nWhich of the following accurately presents information about Delta Lake and Databricks that may impact their decision-making process?",
    "options": {
      "A": "The Tungsten encoding used by Databricks is optimized for storing string data; newly-added native support for querying JSON strings\nmeans that string types are always most efficient.",
      "B": "Because Delta Lake uses Parquet for data storage, data types can be easily evolved by just modifying file footer information in place.",
      "C": "Human labor in writing code is the largest cost associated with data engineering workloads; as such, automating table declaration logic\nshould be a priority in all migration workloads.",
      "D": "Because Databricks will infer schema using types that allow all observed data to be processed, setting types manually provides greater\nassurance of data quality enforcement.",
      "E": "Schema inference and evolution on Databricks ensure that inferred types will always accurately match the data types used by downstream\nsystems."
    },
    "answer": "D",
    "question_vi": "Bảng silver_device_recordings có 100 trường JSON lồng nhau, 45 trường được dùng downstream. Cần chọn cách khai báo schema phù hợp. Thông tin nào về Delta/Databricks giúp quyết định?",
    "options_vi": {
      "A": "Mã hóa Tungsten tối ưu cho chuỗi; hỗ trợ truy vấn JSON string mới nên luôn nên dùng kiểu string.",
      "B": "Delta dùng Parquet nên chỉ cần chỉnh footer file là tiến hoá kiểu dữ liệu dễ dàng.",
      "C": "Chi phí lớn nhất là viết code nên tự động hoá khai báo luôn ưu tiên.",
      "D": "Databricks suy luận schema để chứa mọi dữ liệu quan sát được; đặt kiểu thủ công giúp kiểm soát chất lượng tốt hơn.",
      "E": "Suy luận và tiến hoá schema luôn khớp chính xác với kiểu mà hệ downstream dùng."
    },
    "explanation_vi": "Đáp án D: suy luận tự động thường chọn kiểu rộng để không lỗi, dễ làm lỏng chất lượng. Khai báo thủ công cho bộ trường quan trọng giúp kiểm soát ràng buộc và độ tin cậy.",
    "page": null,
    "image": "img/q_31.jpg"
  },
  {
    "id": 32,
    "topic": 1,
    "question": "The data engineering team maintains the following code:\nAssuming that this code produces logically correct results and the data in the source tables has been de-duplicated and validated, which\nstatement describes what will occur when this code is executed?",
    "options": {
      "A": "A batch job will update the enriched_itemized_orders_by_account table, replacing only those rows that have different values than the\ncurrent version of the table, using accountID as the primary key.",
      "B": "The enriched_itemized_orders_by_account table will be overwritten using the current valid version of data in each of the three tables\nreferenced in the join logic.",
      "C": "An incremental job will leverage information in the state store to identify unjoined rows in the source tables and write these rows to the\nenriched_iteinized_orders_by_account table.",
      "D": "An incremental job will detect if new rows have been written to any of the source tables; if new rows are detected, all results will be\nrecalculated and used to overwrite the enriched_itemized_orders_by_account table.",
      "E": "No computation will occur until enriched_itemized_orders_by_account is queried; upon query materialization, results will be calculated\nusing the current valid version of data in each of the three tables referenced in the join logic."
    },
    "answer": "B",
    "question_vi": "Đoạn code join ba bảng vào enriched_itemized_orders_by_account (logic đúng, nguồn đã dedup). Điều gì xảy ra khi chạy?",
    "options_vi": {
      "A": "Job batch cập nhật bảng, chỉ thay những hàng khác biệt, khoá chính accountID.",
      "B": "Bảng được overwrite bằng phiên bản hiện tại của ba bảng nguồn trong join.",
      "C": "Job incremental dùng state store tìm các hàng chưa join và ghi vào bảng đích.",
      "D": "Job incremental phát hiện có hàng mới ở nguồn, tính lại toàn bộ và overwrite bảng đích.",
      "E": "Không tính toán tới khi bảng được truy vấn; khi truy vấn sẽ tính từ dữ liệu hiện tại của nguồn."
    },
    "explanation_vi": "Đáp án B: sử dụng writeStream với outputMode overwrite (theo ngữ cảnh delta/streaming join), mỗi lần chạy sẽ ghi đè bảng đích bằng kết quả mới nhất từ ba bảng nguồn.",
    "page": null,
    "image": "img/q_32.jpg"
  },
  {
    "id": 33,
    "topic": 1,
    "question": "The data engineering team is migrating an enterprise system with thousands of tables and views into the Lakehouse. They plan to implement the\ntarget architecture using a series of bronze, silver, and gold tables. Bronze tables will almost exclusively be used by production data engineering\nworkloads, while silver tables will be used to support both data engineering and machine learning workloads. Gold tables will largely serve\nbusiness intelligence and reporting purposes. While personal identifying information (PII) exists in all tiers of data, pseudonymization and\nanonymization rules are in place for all data at the silver and gold levels.\nThe organization is interested in reducing security concerns while maximizing the ability to collaborate across diverse teams.\nWhich statement exemplifies best practices for implementing this system?",
    "options": {
      "A": "Isolating tables in separate databases based on data quality tiers allows for easy permissions management through database ACLs and\nallows physical separation of default storage locations for managed tables.",
      "B": "Because databases on Databricks are merely a logical construct, choices around database organization do not impact security or\ndiscoverability in the Lakehouse.",
      "C": "Storing all production tables in a single database provides a unified view of all data assets available throughout the Lakehouse, simplifying\ndiscoverability by granting all users view privileges on this database.",
      "D": "Working in the default Databricks database provides the greatest security when working with managed tables, as these will be created in\nthe DBFS root.",
      "E": "Because all tables must live in the same storage containers used for the database they're created in, organizations should be prepared to\ncreate between dozens and thousands of databases depending on their data isolation requirements."
    },
    "answer": "A",
    "question_vi": "Di trú hàng nghìn bảng/view sang Lakehouse với tier bronze/silver/gold; PII được ẩn danh ở silver/gold. Cần bảo mật mà vẫn hợp tác tốt. Thực hành tốt nhất?",
    "options_vi": {
      "A": "Tách database theo tier chất lượng giúp cấp quyền theo DB và tách vị trí lưu trữ managed.",
      "B": "Database chỉ là logic nên tổ chức không ảnh hưởng bảo mật hay discoverability.",
      "C": "Đặt tất cả bảng sản xuất vào một DB để người dùng xem chung dễ tìm kiếm.",
      "D": "Làm việc trong default database bảo mật nhất vì managed table nằm ở DBFS root.",
      "E": "Vì bảng phải nằm trong container của DB, cần tạo rất nhiều DB tuỳ nhu cầu cách ly."
    },
    "explanation_vi": "Đáp án A: phân tách database theo tier giúp gán quyền, kiểm soát vị trí lưu trữ và giảm rủi ro PII, đồng thời vẫn hỗ trợ cộng tác qua cơ chế cấp quyền rõ ràng.",
    "page": null,
    "image": "img/q_33.jpg"
  },
  {
    "id": 34,
    "topic": 1,
    "question": "The data architect has mandated that all tables in the Lakehouse should be configured as external Delta Lake tables.\nWhich approach will ensure that this requirement is met?",
    "options": {
      "A": "Whenever a database is being created, make sure that the LOCATION keyword is used",
      "B": "When configuring an external data warehouse for all table storage, leverage Databricks for all ELT.",
      "C": "Whenever a table is being created, make sure that the LOCATION keyword is used.",
      "D": "When tables are created, make sure that the EXTERNAL keyword is used in the CREATE TABLE statement.",
      "E": "When the workspace is being configured, make sure that external cloud object storage has been mounted."
    },
    "answer": "C",
    "question_vi": "Kiến trúc sư yêu cầu mọi bảng là external Delta. Cách đảm bảo?",
    "options_vi": {
      "A": "Khi tạo database luôn dùng từ khoá LOCATION.",
      "B": "Cấu hình external warehouse rồi dùng Databricks cho toàn bộ ELT.",
      "C": "Khi tạo bảng luôn dùng từ khoá LOCATION.",
      "D": "Khi tạo bảng dùng từ khoá EXTERNAL trong CREATE TABLE.",
      "E": "Khi cấu hình workspace hãy mount storage ngoài."
    },
    "explanation_vi": "Đáp án C: chỉ khi chỉ định LOCATION lúc CREATE TABLE thì bảng được tạo dạng external tại đường dẫn chỉ định; chỉ mount hay tạo DB không đủ.",
    "page": null,
    "image": "img/q_34.jpg"
  },
  {
    "id": 35,
    "topic": 1,
    "question": "To reduce storage and compute costs, the data engineering team has been tasked with curating a series of aggregate tables leveraged by\nbusiness intelligence dashboards, customer-facing applications, production machine learning models, and ad hoc analytical queries.\nThe data engineering team has been made aware of new requirements from a customer-facing application, which is the only downstream\nworkload they manage entirely. As a result, an aggregate table used by numerous teams across the organization will need to have a number of\nfields renamed, and additional fields will also be added.\nWhich of the solutions addresses the situation while minimally interrupting other teams in the organization without increasing the number of\ntables that need to be managed?",
    "options": {
      "A": "Send all users notice that the schema for the table will be changing; include in the communication the logic necessary to revert the new\ntable schema to match historic queries.",
      "B": "Configure a new table with all the requisite fields and new names and use this as the source for the customer-facing application; create a\nview that maintains the original data schema and table name by aliasing select fields from the new table.",
      "C": "Create a new table with the required schema and new fields and use Delta Lake's deep clone functionality to sync up changes committed to\none table to the corresponding table.",
      "D": "Replace the current table definition with a logical view defined with the query logic currently writing the aggregate table; create a new table\nto power the customer-facing application.",
      "E": "Add a table comment warning all users that the table schema and field names will be changing on a given date; overwrite the table in place\nto the specifications of the customer-facing application."
    },
    "answer": "B",
    "question_vi": "Bảng tổng hợp dùng chung cho nhiều team cần đổi tên nhiều cột và thêm cột cho ứng dụng khách hàng; muốn ít gián đoạn và không tạo thêm nhiều bảng. Giải pháp?",
    "options_vi": {
      "A": "Thông báo cho tất cả người dùng về thay đổi schema và cách revert khi query cũ.",
      "B": "Tạo bảng mới với schema mới cho ứng dụng khách; tạo view giữ tên/schema cũ bằng cách alias từ bảng mới.",
      "C": "Tạo bảng mới rồi dùng deep clone để đồng bộ hai bảng.",
      "D": "Thay bảng bằng view logic hiện tại và tạo bảng mới cho ứng dụng khách.",
      "E": "Thêm comment cảnh báo và overwrite bảng hiện tại theo schema mới."
    },
    "explanation_vi": "Đáp án B: duy trì backward compatibility bằng view trên bảng mới, tránh gián đoạn team khác và không phải quản lý thêm nhiều bảng khác.",
    "page": null,
    "image": "img/q_35.jpg"
  },
  {
    "id": 36,
    "topic": 1,
    "question": "A Delta Lake table representing metadata about content posts from users has the following schema: user_id LONG, post_text STRING, post_id\nSTRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE\nThis table is partitioned by the date column. A query is run with the following filter: longitude < 20 & longitude > -20\nWhich statement describes how data will be filtered?",
    "options": {
      "A": "Statistics in the Delta Log will be used to identify partitions that might Include files in the filtered range.",
      "B": "No file skipping will occur because the optimizer does not know the relationship between the partition column and the longitude.",
      "C": "The Delta Engine will use row-level statistics in the transaction log to identify the flies that meet the filter criteria.",
      "D": "Statistics in the Delta Log will be used to identify data files that might include records in the filtered range.",
      "E": "The Delta Engine will scan the parquet file footers to identify each row that meets the filter criteria."
    },
    "answer": "D",
    "question_vi": "Bảng Delta chứa metadata bài viết, partition theo date; query lọc longitude <20 và >-20. Dữ liệu lọc thế nào?",
    "options_vi": {
      "A": "Thống kê Delta Log dùng để xác định partition có thể chứa phạm vi lọc.",
      "B": "Không skip file vì optimizer không biết quan hệ giữa partition và longitude.",
      "C": "Delta Engine dùng thống kê cấp dòng trong transaction log để tìm file thoả filter.",
      "D": "Thống kê trong Delta Log dùng để xác định file dữ liệu có thể chứa bản ghi thoả filter.",
      "E": "Delta Engine quét footer parquet để tìm từng dòng thoả filter."
    },
    "explanation_vi": "Đáp án D: Delta ghi thống kê min/max cho cột trong mỗi file; engine dùng để skip file ngay cả khi partition theo cột khác (date).",
    "page": null,
    "image": "img/q_36.jpg"
  },
  {
    "id": 37,
    "topic": 1,
    "question": "A small company based in the United States has recently contracted a consulting firm in India to implement several new data engineering\npipelines to power artificial intelligence applications. All the company's data is stored in regional cloud storage in the United States.\nThe workspace administrator at the company is uncertain about where the Databricks workspace used by the contractors should be deployed.\nAssuming that all data governance considerations are accounted for, which statement accurately informs this decision?",
    "options": {
      "A": "Databricks runs HDFS on cloud volume storage; as such, cloud virtual machines must be deployed in the region where the data is stored.",
      "B": "Databricks workspaces do not rely on any regional infrastructure; as such, the decision should be made based upon what is most\nconvenient for the workspace administrator.",
      "C": "Cross-region reads and writes can incur significant costs and latency; whenever possible, compute should be deployed in the same region\nthe data is stored.",
      "D": "Databricks leverages user workstations as the driver during interactive development; as such, users should always use a workspace\ndeployed in a region they are physically near.",
      "E": "Databricks notebooks send all executable code from the user’s browser to virtual machines over the open internet; whenever possible,\nchoosing a workspace region near the end users is the most secure."
    },
    "answer": "C",
    "question_vi": "Công ty Mỹ thuê tư vấn Ấn Độ dựng pipeline AI; dữ liệu lưu ở cloud region Mỹ. Workspace nên đặt ở đâu (bỏ qua quản trị dữ liệu)?",
    "options_vi": {
      "A": "Databricks chạy HDFS trên cloud storage nên VM phải cùng region dữ liệu.",
      "B": "Workspace không phụ thuộc region; chọn gì cũng được.",
      "C": "Đọc/ghi cross-region tốn phí và độ trễ; nên đặt compute cùng region dữ liệu.",
      "D": "Notebook dùng máy người dùng làm driver nên workspace nên gần người dùng.",
      "E": "Notebook gửi code qua internet nên nên chọn region gần người dùng cho an toàn."
    },
    "explanation_vi": "Đáp án C: để giảm chi phí và độ trễ, compute nên đặt cùng region với dữ liệu gốc trong object storage.",
    "page": null,
    "image": "img/q_37.jpg"
  },
  {
    "id": 38,
    "topic": 1,
    "question": "The downstream consumers of a Delta Lake table have been complaining about data quality issues impacting performance in their applications.\nSpecifically, they have complained that invalid latitude and longitude values in the activity_details table have been breaking their ability to use\nother geolocation processes.\nA junior engineer has written the following code to add CHECK constraints to the Delta Lake table:\nA senior engineer has confirmed the above logic is correct and the valid ranges for latitude and longitude are provided, but the code fails when\nexecuted.\nWhich statement explains the cause of this failure?",
    "options": {
      "A": "Because another team uses this table to support a frequently running application, two-phase locking is preventing the operation from\ncommitting.",
      "B": "The activity_details table already exists; CHECK constraints can only be added during initial table creation.",
      "C": "The activity_details table already contains records that violate the constraints; all existing data must pass CHECK constraints in order to\nadd them to an existing table.",
      "D": "The activity_details table already contains records; CHECK constraints can only be added prior to inserting values into a table.",
      "E": "The current table schema does not contain the field valid_coordinates; schema evolution will need to be enabled before altering the table to\nadd a constraint."
    },
    "answer": "B",
    "question_vi": "Bảng activity_details có toạ độ sai; muốn thêm CHECK constraint cho latitude/longitude nhưng lệnh ALTER thất bại dù logic đúng. Vì sao?",
    "options_vi": {
      "A": "Workload khác dùng bảng nên two-phase locking chặn commit.",
      "B": "Bảng đã tồn tại; CHECK chỉ thêm khi tạo bảng mới.",
      "C": "Bảng đã chứa bản ghi vi phạm constraint; phải sạch dữ liệu trước khi thêm CHECK vào bảng hiện có.",
      "D": "Bảng có dữ liệu; CHECK chỉ thêm trước khi insert.",
      "E": "Schema thiếu cột valid_coordinates; cần bật schema evolution trước khi thêm constraint."
    },
    "explanation_vi": "Đáp án C: Delta chỉ cho thêm CHECK nếu toàn bộ dữ liệu hiện tại thỏa điều kiện; tồn tại giá trị ngoài phạm vi khiến ALTER TABLE ... ADD CONSTRAINT thất bại.",
    "page": null,
    "image": "img/q_38.jpg"
  },
  {
    "id": 39,
    "topic": 1,
    "question": "Which of the following is true of Delta Lake and the Lakehouse?",
    "options": {
      "A": "Because Parquet compresses data row by row. strings will only be compressed when a character is repeated multiple times.",
      "B": "Delta Lake automatically collects statistics on the first 32 columns of each table which are leveraged in data skipping based on query\nfilters.",
      "C": "Views in the Lakehouse maintain a valid cache of the most recent versions of source tables at all times.",
      "D": "Primary and foreign key constraints can be leveraged to ensure duplicate values are never entered into a dimension table.",
      "E": "Z-order can only be applied to numeric values stored in Delta Lake tables."
    },
    "answer": "B",
    "question_vi": "Phát biểu nào đúng về Delta Lake và Lakehouse?",
    "options_vi": {
      "A": "Parquet nén theo hàng nên chuỗi chỉ nén khi ký tự lặp.",
      "B": "Delta tự thu thập thống kê cho 32 cột đầu và dùng data skipping theo bộ lọc.",
      "C": "View luôn duy trì cache hợp lệ bản mới nhất của bảng nguồn.",
      "D": "Ràng buộc khoá chính/phụ bảo đảm không có bản ghi trùng trong dimension table.",
      "E": "Z-order chỉ áp dụng cho giá trị số trong Delta."
    },
    "explanation_vi": "Đáp án B: Delta thu thập thống kê min/max cho 32 cột đầu để hỗ trợ skipping; các phát biểu khác sai.",
    "page": null,
    "image": "img/q_39.jpg"
  },
  {
    "id": 40,
    "topic": 1,
    "question": "The view updates represents an incremental batch of all newly ingested data to be inserted or updated in the customers table.\nThe following logic is used to process these records.\nWhich statement describes this implementation?",
    "options": {
      "A": "The customers table is implemented as a Type 3 table; old values are maintained as a new column alongside the current value.",
      "B": "The customers table is implemented as a Type 2 table; old values are maintained but marked as no longer current and new values are\ninserted.",
      "C": "The customers table is implemented as a Type 0 table; all writes are append only with no changes to existing values.",
      "D": "The customers table is implemented as a Type 1 table; old values are overwritten by new values and no history is maintained.",
      "E": "The customers table is implemented as a Type 2 table; old values are overwritten and new customers are appended."
    },
    "answer": "B",
    "question_vi": "View updates chứa batch increment mới để chèn/cập nhật vào bảng customers. Logic MERGE nào được mô tả?",
    "options_vi": {
      "A": "Type 3: giá trị cũ giữ ở cột mới cạnh giá trị hiện tại.",
      "B": "Type 2: giữ giá trị cũ, đánh dấu không còn hiện tại và chèn bản ghi mới.",
      "C": "Type 0: chỉ append, không thay đổi giá trị cũ.",
      "D": "Type 1: giá trị cũ bị overwrite, không giữ lịch sử.",
      "E": "Type 2: overwrite giá trị cũ và append khách hàng mới."
    },
    "explanation_vi": "Đáp án D: MERGE khi match then UPDATE, when not matched then INSERT là mẫu Type 1 – ghi đè giá trị hiện có, không lưu lịch sử.",
    "page": null,
    "image": "img/q_40.jpg"
  },
  {
    "id": 41,
    "topic": 1,
    "question": "The DevOps team has configured a production workload as a collection of notebooks scheduled to run daily using the Jobs UI. A new data\nengineering hire is onboarding to the team and has requested access to one of these notebooks to review the production logic.\nWhat are the maximum notebook permissions that can be granted to the user without allowing accidental changes to production code or data?",
    "options": {
      "A": "Can Manage",
      "B": "Can Edit",
      "C": "No permissions",
      "D": "Can Read",
      "E": "Can Run"
    },
    "answer": "D",
    "question_vi": "Bộ notebook sản xuất chạy hằng ngày bằng Jobs UI. Nhân viên mới muốn xem logic nhưng không được phép sửa. Quyền tối đa có thể cấp?",
    "options_vi": {
      "A": "Can Manage",
      "B": "Can Edit",
      "C": "No permissions",
      "D": "Can Read",
      "E": "Can Run"
    },
    "explanation_vi": "Đáp án D: quyền Can Read cho phép xem nội dung notebook mà không thể chạy hay sửa, tránh rủi ro thay đổi dữ liệu/logic sản xuất.",
    "page": null,
    "image": "img/q_41.jpg"
  },
  {
    "id": 42,
    "topic": 1,
    "question": "A table named user_ltv is being used to create a view that will be used by data analysts on various teams. Users in the workspace are configured\ninto groups, which are used for setting up data access using ACLs.\nThe user_ltv table has the following schema:\nemail STRING, age INT, ltv INT\nThe following view definition is executed:\nAn analyst who is not a member of the marketing group executes the following query:\nSELECT * FROM email_ltv -\nWhich statement describes the results returned by this query?",
    "options": {
      "A": "Three columns will be returned, but one column will be named \"REDACTED\" and contain only null values.",
      "B": "Only the email and ltv columns will be returned; the email column will contain all null values.",
      "C": "The email and ltv columns will be returned with the values in user_ltv.",
      "D": "The email.age, and ltv columns will be returned with the values in user_ltv.",
      "E": "Only the email and ltv columns will be returned; the email column will contain the string \"REDACTED\" in each row."
    },
    "answer": "E",
    "question_vi": "Bảng user_ltv dùng tạo view email_ltv; người không thuộc nhóm marketing query SELECT * FROM email_ltv. Bảng có email, age, ltv với policy che email cho nhóm không được phép. Kết quả thế nào?",
    "options_vi": {
      "A": "Trả 3 cột nhưng một cột tên REDACTED và toàn null.",
      "B": "Chỉ trả email và ltv; email toàn null.",
      "C": "Trả email và ltv với giá trị gốc.",
      "D": "Trả email, age, ltv với giá trị gốc.",
      "E": "Chỉ trả email và ltv; email là chuỗi REDACTED từng dòng."
    },
    "explanation_vi": "Đáp án E: lệnh APPLY ROW FILTER/column masking thường thay giá trị cột bị che bằng chuỗi 'REDACTED' cho người không có quyền; vẫn chỉ trả các cột được chọn (email, ltv).",
    "page": null,
    "image": "img/q_42.jpg"
  },
  {
    "id": 43,
    "topic": 1,
    "question": "The data governance team has instituted a requirement that all tables containing Personal Identifiable Information (PH) must be clearly\nannotated. This includes adding column comments, table comments, and setting the custom table property \"contains_pii\" = true.\nThe following SQL DDL statement is executed to create a new table:\nWhich command allows manual confirmation that these three requirements have been met?",
    "options": {
      "A": "DESCRIBE EXTENDED dev.pii_test",
      "B": "DESCRIBE DETAIL dev.pii_test",
      "C": "SHOW TBLPROPERTIES dev.pii_test",
      "D": "DESCRIBE HISTORY dev.pii_test",
      "E": "SHOW TABLES dev"
    },
    "answer": "A",
    "question_vi": "Yêu cầu PII: thêm comment cột/bảng và property contains_pii=true. Lệnh nào kiểm tra thủ công đủ 3 yêu cầu?",
    "options_vi": {
      "A": "DESCRIBE EXTENDED dev.pii_test",
      "B": "DESCRIBE DETAIL dev.pii_test",
      "C": "SHOW TBLPROPERTIES dev.pii_test",
      "D": "DESCRIBE HISTORY dev.pii_test",
      "E": "SHOW TABLES dev"
    },
    "explanation_vi": "Đáp án A: DESCRIBE EXTENDED hiển thị comment cột, comment bảng và các table properties (trong đó có contains_pii).",
    "page": null,
    "image": "img/q_43.jpg"
  },
  {
    "id": 44,
    "topic": 1,
    "question": "The data governance team is reviewing code used for deleting records for compliance with GDPR. They note the following logic is used to delete\nrecords from the Delta Lake table named users.\nAssuming that user_id is a unique identifying key and that delete_requests contains all users that have requested deletion, which statement\ndescribes whether successfully executing the above logic guarantees that the records to be deleted are no longer accessible and why?",
    "options": {
      "A": "Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records.",
      "B": "No; the Delta cache may return records from previous versions of the table until the cluster is restarted.",
      "C": "Yes; the Delta cache immediately updates to reflect the latest data files recorded to disk.",
      "D": "No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command.",
      "E": "No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data\nfiles."
    },
    "answer": "E",
    "question_vi": "Đánh giá logic DELETE FROM users WHERE user_id IN (delete_requests) theo GDPR. Sau khi chạy có đảm bảo không truy cập được bản ghi xoá?",
    "options_vi": {
      "A": "Có; ACID của Delta đảm bảo DELETE thành công và xoá vĩnh viễn.",
      "B": "Không; Delta cache có thể trả dữ liệu phiên bản cũ tới khi restart cluster.",
      "C": "Có; Delta cache cập nhật ngay theo file mới.",
      "D": "Không; DELETE chỉ ACID khi kết hợp MERGE INTO.",
      "E": "Không; file chứa bản ghi xoá vẫn truy cập qua time travel cho tới khi VACUUM dọn file."
    },
    "explanation_vi": "Đáp án E: DELETE chỉ đánh dấu file cũ không hợp lệ; vẫn có thể time travel hoặc truy cập file tới khi VACUUM dọn, nên chưa đảm bảo xoá vĩnh viễn theo GDPR.",
    "page": null,
    "image": "img/q_44.jpg"
  },
  {
    "id": 45,
    "topic": 1,
    "question": "An external object storage container has been mounted to the location /mnt/finance_eda_bucket.\nThe following logic was executed to create a database for the finance team:\nAfter the database was successfully created and permissions configured, a member of the finance team runs the following code:\nIf all users on the finance team are members of the finance group, which statement describes how the tx_sales table will be created?",
    "options": {
      "A": "A logical table will persist the query plan to the Hive Metastore in the Databricks control plane.",
      "B": "An external table will be created in the storage container mounted to /mnt/finance_eda_bucket.",
      "C": "A logical table will persist the physical plan to the Hive Metastore in the Databricks control plane.",
      "D": "An managed table will be created in the storage container mounted to /mnt/finance_eda_bucket.",
      "E": "A managed table will be created in the DBFS root storage container."
    },
    "answer": "B",
    "question_vi": "Container /mnt/finance_eda_bucket đã mount. Tạo database finance_eda với LOCATION '/mnt/finance_eda_bucket'. Người nhóm finance chạy CREATE TABLE tx_sales AS SELECT ...; bảng được tạo thế nào?",
    "options_vi": {
      "A": "Bảng logic lưu query plan vào Hive Metastore control plane.",
      "B": "Bảng external tạo trong container mount /mnt/finance_eda_bucket.",
      "C": "Bảng logic lưu physical plan vào Hive Metastore.",
      "D": "Bảng managed tạo trong container mount /mnt/finance_eda_bucket.",
      "E": "Bảng managed tạo ở DBFS root."
    },
    "explanation_vi": "Đáp án D: database có LOCATION nên các managed table tạo trong DB đó sẽ lưu dữ liệu ở đường dẫn đã định (/mnt/finance_eda_bucket).",
    "page": null,
    "image": "img/q_45.jpg"
  },
  {
    "id": 46,
    "topic": 1,
    "question": "Although the Databricks Utilities Secrets module provides tools to store sensitive credentials and avoid accidentally displaying them in plain text\nusers should still be careful with which credentials are stored here and which users have access to using these secrets.\nWhich statement describes a limitation of Databricks Secrets?",
    "options": {
      "A": "Because the SHA256 hash is used to obfuscate stored secrets, reversing this hash will display the value in plain text.",
      "B": "Account administrators can see all secrets in plain text by logging on to the Databricks Accounts console.",
      "C": "Secrets are stored in an administrators-only table within the Hive Metastore; database administrators have permission to query this table by\ndefault.",
      "D": "Iterating through a stored secret and printing each character will display secret contents in plain text.",
      "E": "The Databricks REST API can be used to list secrets in plain text if the personal access token has proper credentials."
    },
    "answer": "D",
    "question_vi": "Giới hạn của Databricks Secrets?",
    "options_vi": {
      "A": "Vì dùng băm SHA256 nên đảo ngược băm sẽ hiện plaintext.",
      "B": "Quản trị account xem được toàn bộ secret plaintext trong Accounts console.",
      "C": "Secrets lưu trong bảng Hive admins-only nên DBA mặc định đọc được.",
      "D": "Lặp qua từng ký tự secret và in ra sẽ thấy plaintext.",
      "E": "REST API có thể liệt kê secret plaintext nếu PAT đủ quyền."
    },
    "explanation_vi": "Đáp án D: Dù print trực tiếp bị chặn, nếu duyệt từng ký tự và in ra thì giá trị được lộ ra; do đó vẫn cần kiểm soát quyền truy cập notebook/cluster.",
    "page": null,
    "image": "img/q_46.jpg"
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
    "question_vi": "Phát biểu đúng về thời gian giữ lịch sử job run?",
    "options_vi": {
      "A": "Giữ tới khi bạn export hoặc delete log.",
      "B": "Giữ 30 ngày, trong thời gian đó có thể gửi log tới DBFS hoặc S3.",
      "C": "Giữ 60 ngày, trong thời gian đó có thể export notebook run ra HTML.",
      "D": "Giữ 60 ngày, sau đó log được lưu trữ.",
      "E": "Giữ 90 ngày hoặc tới khi run-id được tái dùng qua cấu hình custom."
    },
    "explanation_vi": "Đáp án B: Databricks giữ lịch sử job run 30 ngày; trong thời gian này có thể chuyển log ra DBFS/S3 nếu cần lưu lâu hơn.",
    "page": null,
    "image": "img/q_47.jpg"
  },
  {
    "id": 48,
    "topic": 1,
    "question": "A data engineer, User A, has promoted a new pipeline to production by using the REST API to programmatically create several jobs. A DevOps\nengineer, User B, has configured an external orchestration tool to trigger job runs through the REST API. Both users authorized the REST API calls\nusing their personal access tokens.\nWhich statement describes the contents of the workspace audit logs concerning these events?",
    "options": {
      "A": "Because the REST API was used for job creation and triggering runs, a Service Principal will be automatically used to identify these events.",
      "B": "Because User B last configured the jobs, their identity will be associated with both the job creation events and the job run events.",
      "C": "Because these events are managed separately, User A will have their identity associated with the job creation events and User B will have\ntheir identity associated with the job run events.",
      "D": "Because the REST API was used for job creation and triggering runs, user identity will not be captured in the audit logs.",
      "E": "Because User A created the jobs, their identity will be associated with both the job creation events and the job run events."
    },
    "answer": "C",
    "question_vi": "User A tạo job qua REST API bằng PAT cá nhân; User B cấu hình orchestrator gọi API trigger job cũng bằng PAT cá nhân. Audit log ghi gì?",
    "options_vi": {
      "A": "Vì dùng REST API nên tự động dùng Service Principal để ghi log.",
      "B": "User B là người cấu hình cuối nên cả tạo job và run đều mang identity của B.",
      "C": "Sự kiện tạo job gắn với User A, sự kiện run gắn với User B vì gọi API riêng.",
      "D": "Dùng REST API nên không ghi nhận identity trong audit log.",
      "E": "User A tạo job nên cả tạo và run đều mang identity của A."
    },
    "explanation_vi": "Đáp án C: mỗi cuộc gọi REST ghi lại danh tính token dùng cho call đó; A tạo job, B kích hoạt run nên audit log tách biệt theo từng user.",
    "page": null,
    "image": "img/q_48.jpg"
  },
  {
    "id": 49,
    "topic": 1,
    "question": "A user new to Databricks is trying to troubleshoot long execution times for some pipeline logic they are working on. Presently, the user is\nexecuting code cell-by-cell, using display() calls to confirm code is producing the logically correct results as new transformations are added to an\noperation. To get a measure of average time to execute, the user is running each cell multiple times interactively.\nWhich of the following adjustments will get a more accurate measure of how code is likely to perform in production?",
    "options": {
      "A": "Scala is the only language that can be accurately tested using interactive notebooks; because the best performance is achieved by using\nScala code compiled to JARs, all PySpark and Spark SQL logic should be refactored.",
      "B": "The only way to meaningfully troubleshoot code execution times in development notebooks Is to use production-sized data and production-\nsized clusters with Run All execution.",
      "C": "Production code development should only be done using an IDE; executing code against a local build of open source Spark and Delta Lake\nwill provide the most accurate benchmarks for how code will perform in production.",
      "D": "Calling display() forces a job to trigger, while many transformations will only add to the logical query plan; because of caching, repeated\nexecution of the same logic does not provide meaningful results.",
      "E": "The Jobs UI should be leveraged to occasionally run the notebook as a job and track execution time during incremental code development\nbecause Photon can only be enabled on clusters launched for scheduled jobs."
    },
    "answer": "D",
    "question_vi": "Người mới debug thời gian chạy bằng cách chạy từng cell với display() nhiều lần. Điều chỉnh nào cho kết quả gần thực tế hơn?",
    "options_vi": {
      "A": "Chỉ Scala notebook test chính xác; nên refactor toàn bộ sang Scala/JAR.",
      "B": "Chỉ có cách dùng dữ liệu/cluster cỡ production và Run All.",
      "C": "Nên phát triển trong IDE với Spark mở nguồn để benchmark chính xác nhất.",
      "D": "display() kích hoạt job, và cache khiến chạy lặp lại không phản ánh thực tế; do đó đo bằng cách này không ý nghĩa.",
      "E": "Thỉnh thoảng chạy notebook như job trong Jobs UI để đo thời gian vì Photon chỉ bật trên cluster job."
    },
    "explanation_vi": "Đáp án D: display() buộc hành động, cache làm lần sau nhanh hơn nên thời gian đo không đại diện; cần cách khác như bỏ cache hoặc chạy như job thực tế.",
    "page": null,
    "image": "img/q_49.jpg"
  },
  {
    "id": 50,
    "topic": 1,
    "question": "A production cluster has 3 executor nodes and uses the same virtual machine type for the driver and executor.\nWhen evaluating the Ganglia Metrics for this cluster, which indicator would signal a bottleneck caused by code executing on the driver?",
    "options": {
      "A": "The five Minute Load Average remains consistent/flat",
      "B": "Bytes Received never exceeds 80 million bytes per second",
      "C": "Total Disk Space remains constant",
      "D": "Network I/O never spikes",
      "E": "Overall cluster CPU utilization is around 25%"
    },
    "answer": "D",
    "question_vi": "Cluster production có 3 executor, VM driver và executor giống nhau. Chỉ báo Ganglia nào cho thấy nghẽn tại driver?",
    "options_vi": {
      "A": "Five Minute Load Average phẳng.",
      "B": "Bytes Received không vượt 80 triệu B/s.",
      "C": "Total Disk Space không đổi.",
      "D": "Network I/O không tăng vọt.",
      "E": "Tổng CPU cluster khoảng 25%."
    },
    "explanation_vi": "Đáp án D: nếu driver bị nghẽn, Network I/O toàn cụm có thể không tăng (driver không phân phối tác vụ/nhận kết quả), là dấu hiệu nghẽn tại driver.",
    "page": null,
    "image": "img/q_50.jpg"
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
    "question_vi": "Trong Spark UI xem ở đâu để chẩn đoán vấn đề do không dùng predicate push-down?",
    "options_vi": {
      "A": "Trong log Executor, grep 'predicate push-down'.",
      "B": "Trong Stage Detail > Completed Stages, nhìn Input data read.",
      "C": "Trong Storage Detail xem RDD nào không lưu đĩa.",
      "D": "Trong Delta transaction log xem thống kê cột.",
      "E": "Trong Query Detail xem Physical Plan."
    },
    "explanation_vi": "Đáp án E: Physical Plan cho thấy liệu filter được đẩy xuống nguồn hay không; có thể xem lượng data scan/PushDown trong plan.",
    "page": null,
    "image": "img/q_51.jpg"
  },
  {
    "id": 52,
    "topic": 1,
    "question": "Review the following error traceback:\nWhich statement describes the error being raised?",
    "options": {
      "A": "The code executed was PySpark but was executed in a Scala notebook.",
      "B": "There is no column in the table named heartrateheartrateheartrate",
      "C": "There is a type error because a column object cannot be multiplied.",
      "D": "There is a type error because a DataFrame object cannot be multiplied.",
      "E": "There is a syntax error because the heartrate column is not correctly identified as a column."
    },
    "answer": "E",
    "question_vi": "Thông báo lỗi nhân cột heartrateheartrateheartrate. Lỗi gì?",
    "options_vi": {
      "A": "Chạy PySpark trong notebook Scala.",
      "B": "Bảng không có cột heartrateheartrateheartrate.",
      "C": "Lỗi kiểu vì đối tượng cột không thể nhân.",
      "D": "Lỗi kiểu vì DataFrame không thể nhân.",
      "E": "Lỗi cú pháp vì cột heartrate không được nhận diện đúng."
    },
    "explanation_vi": "Đáp án B: thông báo cho biết cột ghép ba lần không tồn tại; nhân liên tục tạo tên cột sai, Spark báo không tìm thấy cột.",
    "page": null,
    "image": "img/q_52.jpg"
  },
  {
    "id": 53,
    "topic": 1,
    "question": "Which distribution does Databricks support for installing custom Python code packages?",
    "options": {
      "A": "sbt",
      "B": "CRANC. npm",
      "D": "Wheels",
      "E": "jars"
    },
    "answer": "D",
    "question_vi": "Phân phối nào Databricks hỗ trợ để cài đặt gói Python tùy chỉnh?",
    "options_vi": {
      "A": "sbt",
      "B": "CRAN",
      "C": "npm",
      "D": "Wheels",
      "E": "jars"
    },
    "explanation_vi": "Đáp án D: Databricks hỗ trợ cài đặt gói Python dạng wheel (.whl).",
    "page": null,
    "image": "img/q_53.jpg"
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
    "question_vi": "Biến Python nào chứa danh sách thư mục tìm module?",
    "options_vi": {
      "A": "importlib.resource_path",
      "B": "sys.path",
      "C": "os.path",
      "D": "pypi.path",
      "E": "pylib.source"
    },
    "explanation_vi": "Đáp án B: sys.path là danh sách đường dẫn Python duyệt để tìm module.",
    "page": null,
    "image": "img/q_54.jpg"
  },
  {
    "id": 55,
    "topic": 1,
    "question": "Incorporating unit tests into a PySpark application requires upfront attention to the design of your jobs, or a potentially significant refactoring of\nexisting code.\nWhich statement describes a main benefit that offset this additional effort?",
    "options": {
      "A": "Improves the quality of your data",
      "B": "Validates a complete use case of your application",
      "C": "Troubleshooting is easier since all steps are isolated and tested individually",
      "D": "Yields faster deployment and execution times",
      "E": "Ensures that all steps interact correctly to achieve the desired end result"
    },
    "answer": "C",
    "question_vi": "Lợi ích chính của unit test trong ứng dụng PySpark (dù tốn công thiết kế/refactor)?",
    "options_vi": {
      "A": "Cải thiện chất lượng dữ liệu",
      "B": "Xác nhận một use case hoàn chỉnh",
      "C": "Dễ debug vì các bước được tách nhỏ và test riêng",
      "D": "Triển khai/chạy nhanh hơn",
      "E": "Đảm bảo mọi bước tương tác đúng để đạt mục tiêu"
    },
    "explanation_vi": "Đáp án C: unit test cô lập từng hàm/bước nên dễ phát hiện và sửa lỗi hơn, dù phải thiết kế cấu trúc job phù hợp.",
    "page": null,
    "image": "img/q_55.jpg"
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
    "question_vi": "Mô tả nào đúng về integration testing?",
    "options_vi": {
      "A": "Xác nhận tương tác giữa các phân hệ ứng dụng",
      "B": "Yêu cầu framework test tự động",
      "C": "Cần can thiệp thủ công",
      "D": "Xác nhận một use case ứng dụng",
      "E": "Xác nhận hành vi của từng thành phần riêng lẻ"
    },
    "explanation_vi": "Đáp án A: integration test kiểm tra các phân hệ/Module phối hợp với nhau đúng hay không.",
    "page": null,
    "image": "img/q_56.jpg"
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
    "question_vi": "Lệnh REST API nào dùng để xem các notebook được cấu hình làm tác vụ trong một multi-task job?",
    "options_vi": {
      "A": "/jobs/runs/list",
      "B": "/jobs/runs/get-output",
      "C": "/jobs/runs/get",
      "D": "/jobs/get",
      "E": "/jobs/list"
    },
    "explanation_vi": "Đáp án đúng: D. Endpoint /jobs/get trả về định nghĩa của job, bao gồm danh sách các tác vụ và notebook kèm cấu hình. Các endpoint /jobs/runs/* chỉ trả về thông tin thực thi, không phải cấu hình nhiệm vụ.",
    "page": null,
    "image": "img/q_57.jpg"
  },
  {
    "id": 58,
    "topic": 1,
    "question": "A Databricks job has been configured with 3 tasks, each of which is a Databricks notebook. Task A does not depend on other tasks. Tasks B and C\nrun in parallel, with each having a serial dependency on task",
    "options": {
      "A": "All logic expressed in the notebook associated with tasks A and B will have been successfully completed; some operations in task C may\nhave completed successfully.",
      "B": "All logic expressed in the notebook associated with tasks A and B will have been successfully completed; any changes made in task C will\nbe rolled back due to task failure.",
      "C": "All logic expressed in the notebook associated with task A will have been successfully completed; tasks B and C will not commit any\nchanges because of stage failure.",
      "D": "Because all tasks are managed as a dependency graph, no changes will be committed to the Lakehouse until ail tasks have successfully\nbeen completed.",
      "E": "Unless all tasks complete successfully, no changes will be committed to the Lakehouse; because task C failed, all commits will be rolled\nback automatically."
    },
    "answer": "A",
    "question_vi": "Một job Databricks có 3 task (đều là notebook). Task A độc lập; tasks B và C chạy song song nhưng đều phụ thuộc nối tiếp vào A. Nếu task C thất bại, tình trạng nào đúng?",
    "options_vi": {
      "A": "Mọi logic trong notebooks A và B đã chạy xong thành công; một phần thao tác của C có thể đã hoàn tất.",
      "B": "Mọi logic trong notebooks A và B đã chạy xong; các thay đổi của C sẽ được rollback do task thất bại.",
      "C": "Notebook A hoàn tất; B và C không commit thay đổi nào vì giai đoạn thất bại.",
      "D": "Vì toàn bộ task được quản lý dưới dạng đồ thị phụ thuộc, không thay đổi nào được commit cho tới khi tất cả task thành công.",
      "E": "Nếu chưa tất cả task thành công thì không commit; do C lỗi nên mọi commit đều bị rollback tự động."
    },
    "explanation_vi": "Đáp án đúng: A. Với phụ thuộc hiện tại, A chạy trước, B và C song song. Nếu C lỗi thì chỉ C bị ảnh hưởng; A và B vẫn hoàn tất và giữ kết quả của mình (không có rollback tự động giữa các task).",
    "page": null,
    "image": "img/q_58.jpg"
  },
  {
    "id": 59,
    "topic": 1,
    "question": "A Delta Lake table was created with the below query:\nRealizing that the original query had a typographical error, the below code was executed:\nALTER TABLE prod.sales_by_stor RENAME TO prod.sales_by_store\nWhich result will occur after running the second command?",
    "options": {
      "A": "The table reference in the metastore is updated and no data is changed.",
      "B": "The table name change is recorded in the Delta transaction log.",
      "C": "All related files and metadata are dropped and recreated in a single ACID transaction.",
      "D": "The table reference in the metastore is updated and all data files are moved.",
      "E": "A new Delta transaction log Is created for the renamed table."
    },
    "answer": "A",
    "question_vi": "Một bảng Delta được tạo rồi đổi tên bằng: ALTER TABLE prod.sales_by_stor RENAME TO prod.sales_by_store. Kết quả sau lệnh thứ hai là gì?",
    "options_vi": {
      "A": "Cập nhật tham chiếu bảng trong metastore, dữ liệu không đổi.",
      "B": "Ghi lại thay đổi tên bảng trong transaction log của Delta.",
      "C": "Toàn bộ file và metadata bị drop và tạo lại trong một giao dịch ACID.",
      "D": "Cập nhật tham chiếu trong metastore và di chuyển toàn bộ file dữ liệu.",
      "E": "Tạo một transaction log Delta mới cho bảng được đổi tên."
    },
    "explanation_vi": "Đáp án đúng: A. Lệnh RENAME chỉ cập nhật tên/đường dẫn trong metastore, không di chuyển hay thay đổi dữ liệu, transaction log giữ nguyên.",
    "page": null,
    "image": "img/q_59.jpg"
  },
  {
    "id": 60,
    "topic": 1,
    "question": "The data engineering team maintains a table of aggregate statistics through batch nightly updates. This includes total sales for the previous day\nalongside totals and averages for a variety of time periods including the 7 previous days, year-to-date, and quarter-to-date. This table is named\nstore_saies_summary and the schema is as follows:\nThe table daily_store_sales contains all the information needed to update store_sales_summary. The schema for this table is: store_id INT,\nsales_date DATE, total_sales FLOAT\nIf daily_store_sales is implemented as a Type 1 table and the total_sales column might be adjusted after manual data auditing, which approach is\nthe safest to generate accurate reports in the store_sales_summary table?",
    "options": {
      "A": "Implement the appropriate aggregate logic as a batch read against the daily_store_sales table and overwrite the store_sales_summary\ntable with each Update.",
      "B": "Implement the appropriate aggregate logic as a batch read against the daily_store_sales table and append new rows nightly to the\nstore_sales_summary table.",
      "C": "Implement the appropriate aggregate logic as a batch read against the daily_store_sales table and use upsert logic to update results in the\nstore_sales_summary table.",
      "D": "Implement the appropriate aggregate logic as a Structured Streaming read against the daily_store_sales table and use upsert logic to\nupdate results in the store_sales_summary table.",
      "E": "Use Structured Streaming to subscribe to the change data feed for daily_store_sales and apply changes to the aggregates in the\nstore_sales_summary table with each update."
    },
    "answer": "C",
    "question_vi": "Bảng daily_store_sales (Type 1) có thể được chỉnh sửa tổng doanh thu sau kiểm toán. Cách an toàn nhất để báo cáo chính xác vào bảng store_sales_summary là gì?",
    "options_vi": {
      "A": "Tính tổng hợp bằng batch đọc daily_store_sales rồi overwrite toàn bộ store_sales_summary mỗi lần.",
      "B": "Tính tổng hợp bằng batch và append bản ghi mới hàng đêm vào store_sales_summary.",
      "C": "Tính tổng hợp bằng batch và dùng upsert để cập nhật kết quả trong store_sales_summary.",
      "D": "Dùng Structured Streaming đọc daily_store_sales và upsert vào store_sales_summary.",
      "E": "Dùng Structured Streaming theo dõi change data feed của daily_store_sales và cập nhật aggregates mỗi lần."
    },
    "explanation_vi": "Đáp án đúng: C. Vì dữ liệu nguồn Type 1 có thể thay đổi, cần upsert vào bảng tổng hợp để sửa các giá trị đã có thay vì chỉ append hay overwrite toàn bộ không cần thiết.",
    "page": null,
    "image": "img/q_60.jpg"
  },
  {
    "id": 61,
    "topic": 1,
    "question": "A member of the data engineering team has submitted a short notebook that they wish to schedule as part of a larger data pipeline. Assume that\nthe commands provided below produce the logically correct results when run as presented.\nWhich command should be removed from the notebook before scheduling it as a job?",
    "options": {
      "A": "Cmd 2",
      "B": "Cmd 3",
      "C": "Cmd 4",
      "D": "Cmd 5",
      "E": "Cmd 6"
    },
    "answer": "E",
    "question_vi": "Một notebook ngắn được lên lịch chạy trong pipeline. Lệnh nào nên bỏ trước khi lập lịch?",
    "options_vi": {
      "A": "Cmd 2",
      "B": "Cmd 3",
      "C": "Cmd 4",
      "D": "Cmd 5",
      "E": "Cmd 6"
    },
    "explanation_vi": "Đáp án đúng: E. Các lệnh tương tác hiển thị (ví dụ display, plot) thường nên bỏ trong job; phần còn lại thực hiện tính toán cần thiết.",
    "page": null,
    "image": "img/q_61.jpg"
  },
  {
    "id": 62,
    "topic": 1,
    "question": "The business reporting team requires that data for their dashboards be updated every hour. The total processing time for the pipeline that extracts\ntransforms, and loads the data for their pipeline runs in 10 minutes.\nAssuming normal operating conditions, which configuration will meet their service-level agreement requirements with the lowest cost?",
    "options": {
      "A": "Manually trigger a job anytime the business reporting team refreshes their dashboards",
      "B": "Schedule a job to execute the pipeline once an hour on a new job cluster",
      "C": "Schedule a Structured Streaming job with a trigger interval of 60 minutes",
      "D": "Schedule a job to execute the pipeline once an hour on a dedicated interactive cluster",
      "E": "Configure a job that executes every time new data lands in a given directory"
    },
    "answer": "C",
    "question_vi": "Đội báo cáo cần dữ liệu cập nhật mỗi giờ; pipeline ETL mất 10 phút. Cấu hình chi phí thấp nhất đáp ứng SLA?",
    "options_vi": {
      "A": "Kích hoạt job thủ công khi đội báo cáo refresh dashboard.",
      "B": "Lịch một job chạy mỗi giờ trên job cluster mới.",
      "C": "Lịch Structured Streaming với trigger 60 phút.",
      "D": "Lịch job chạy mỗi giờ trên interactive cluster chuyên dụng.",
      "E": "Job kích hoạt mỗi lần có dữ liệu mới trong thư mục."
    },
    "explanation_vi": "Đáp án đúng: C. Structured Streaming với trigger 60 phút chạy liên tục, đáp ứng cập nhật giờ và tránh overhead khởi tạo cluster lặp lại.",
    "page": null,
    "image": "img/q_62.jpg"
  },
  {
    "id": 63,
    "topic": 1,
    "question": "A Databricks SQL dashboard has been configured to monitor the total number of records present in a collection of Delta Lake tables using the\nfollowing query pattern:\nSELECT COUNT (*) FROM table -\nWhich of the following describes how results are generated each time the dashboard is updated?",
    "options": {
      "A": "The total count of rows is calculated by scanning all data files",
      "B": "The total count of rows will be returned from cached results unless REFRESH is run",
      "C": "The total count of records is calculated from the Delta transaction logs",
      "D": "The total count of records is calculated from the parquet file metadata",
      "E": "The total count of records is calculated from the Hive metastore"
    },
    "answer": "A",
    "question_vi": "Dashboard Databricks SQL đếm số bản ghi bằng mẫu SELECT COUNT(*) FROM table. Mỗi lần cập nhật, kết quả được tạo như thế nào?",
    "options_vi": {
      "A": "Đếm bằng cách quét toàn bộ file dữ liệu.",
      "B": "Trả về số đếm từ kết quả cache trừ khi chạy REFRESH.",
      "C": "Đếm từ Delta transaction log.",
      "D": "Đếm từ metadata của file Parquet.",
      "E": "Đếm từ Hive metastore."
    },
    "explanation_vi": "Đáp án đúng: A. COUNT(*) không có filter sẽ quét toàn bộ dữ liệu để tính số bản ghi, trừ khi đã cache thủ công.",
    "page": null,
    "image": "img/q_63.jpg"
  },
  {
    "id": 64,
    "topic": 1,
    "question": "A Delta Lake table was created with the below query:\nConsider the following query:\nDROP TABLE prod.sales_by_store -\nIf this statement is executed by a workspace admin, which result will occur?",
    "options": {
      "A": "Nothing will occur until a COMMIT command is executed.",
      "B": "The table will be removed from the catalog but the data will remain in storage.",
      "C": "The table will be removed from the catalog and the data will be deleted.",
      "D": "An error will occur because Delta Lake prevents the deletion of production data.",
      "E": "Data will be marked as deleted but still recoverable with Time Travel."
    },
    "answer": "D",
    "question_vi": "Với bảng Delta, nếu admin chạy DROP TABLE prod.sales_by_store, điều gì xảy ra?",
    "options_vi": {
      "A": "Không làm gì cho tới khi COMMIT.",
      "B": "Bảng bị xoá khỏi catalog nhưng dữ liệu vẫn còn trên storage.",
      "C": "Bảng bị xoá khỏi catalog và dữ liệu bị xoá.",
      "D": "Lỗi vì Delta Lake ngăn xoá dữ liệu production.",
      "E": "Dữ liệu được đánh dấu xoá nhưng có thể khôi phục bằng Time Travel."
    },
    "explanation_vi": "Đáp án đúng: D. Lệnh DROP TABLE với quản trị viên sẽ loại bỏ cả metadata và dữ liệu (theo mặc định), nên đây là hành động nguy hiểm cho production; lựa chọn D phản ánh cảnh báo đó.",
    "page": null,
    "image": "img/q_64.jpg"
  },
  {
    "id": 65,
    "topic": 1,
    "question": "Two of the most common data locations on Databricks are the DBFS root storage and external object storage mounted with dbutils.fs.mount().\nWhich of the following statements is correct?",
    "options": {
      "A": "DBFS is a file system protocol that allows users to interact with files stored in object storage using syntax and guarantees similar to Unix\nfile systems.",
      "B": "By default, both the DBFS root and mounted data sources are only accessible to workspace administrators.",
      "C": "The DBFS root is the most secure location to store data, because mounted storage volumes must have full public read and write\npermissions.",
      "D": "Neither the DBFS root nor mounted storage can be accessed when using %sh in a Databricks notebook.",
      "E": "The DBFS root stores files in ephemeral block volumes attached to the driver, while mounted directories will always persist saved data to\nexternal storage between sessions."
    },
    "answer": "E",
    "question_vi": "So sánh DBFS root và storage gắn mount bằng dbutils.fs.mount(). Phát biểu nào đúng?",
    "options_vi": {
      "A": "DBFS là giao thức cho phép truy cập object storage với cú pháp giống Unix.",
      "B": "Mặc định cả DBFS root và mount chỉ admin mới truy cập được.",
      "C": "DBFS root an toàn nhất vì mount phải cho phép read/write công khai.",
      "D": "Không thể truy cập DBFS root hay mount khi dùng %sh.",
      "E": "DBFS root lưu trên đĩa tạm của driver, còn mount luôn ghi ra object storage và tồn tại giữa các phiên."
    },
    "explanation_vi": "Đáp án đúng: E. DBFS root dùng lưu trữ gắn với workspace (có thể là EBS) và có tính tạm; thư mục mount trỏ trực tiếp tới object storage bên ngoài nên bền vững giữa các phiên.",
    "page": null,
    "image": "img/q_65.jpg"
  },
  {
    "id": 66,
    "topic": 1,
    "question": "The following code has been migrated to a Databricks notebook from a legacy workload:\nThe code executes successfully and provides the logically correct results, however, it takes over 20 minutes to extract and load around 1 GB of\ndata.\nWhich statement is a possible explanation for this behavior?",
    "options": {
      "A": "%sh triggers a cluster restart to collect and install Git. Most of the latency is related to cluster startup time.",
      "B": "Instead of cloning, the code should use %sh pip install so that the Python code can get executed in parallel across all nodes in a cluster.",
      "C": "%sh does not distribute file moving operations; the final line of code should be updated to use %fs instead.",
      "D": "Python will always execute slower than Scala on Databricks. The run.py script should be refactored to Scala.",
      "E": "%sh executes shell code on the driver node. The code does not take advantage of the worker nodes or Databricks optimized Spark."
    },
    "answer": "C",
    "question_vi": "Một notebook di chuyển từ workload cũ, dùng %sh để clone repo và chạy script; chạy đúng nhưng 1 GB dữ liệu mất >20 phút. Giải thích khả dĩ?",
    "options_vi": {
      "A": "%sh kích hoạt khởi động lại cluster để cài Git, gây trễ lớn.",
      "B": "Nên dùng %sh pip install để Python chạy song song trên mọi node.",
      "C": "%sh không phân tán thao tác di chuyển file; dòng cuối nên đổi sang %fs.",
      "D": "Python luôn chậm hơn Scala trên Databricks; nên viết lại run.py bằng Scala.",
      "E": "%sh chạy trên driver nên không tận dụng worker hay Spark tối ưu của Databricks."
    },
    "explanation_vi": "Đáp án đúng: C. Lệnh %sh chạy trên driver và thao tác di chuyển file không phân tán; dùng %fs (hoặc Spark) sẽ tận dụng cluster thay vì xử lý đơn luồng.",
    "page": null,
    "image": "img/q_66.jpg"
  },
  {
    "id": 67,
    "topic": 1,
    "question": "The data science team has requested assistance in accelerating queries on free form text from user reviews. The data is currently stored in\nParquet with the below schema:\nitem_id INT, user_id INT, review_id INT, rating FLOAT, review STRING\nThe review column contains the full text of the review left by the user. Specifically, the data science team is looking to identify if any of 30 key\nwords exist in this field.\nA junior data engineer suggests converting this data to Delta Lake will improve query performance.\nWhich response to the junior data engineer s suggestion is correct?",
    "options": {
      "A": "Delta Lake statistics are not optimized for free text fields with high cardinality.",
      "B": "Text data cannot be stored with Delta Lake.",
      "C": "ZORDER ON review will need to be run to see performance gains.",
      "D": "The Delta log creates a term matrix for free text fields to support selective filtering.",
      "E": "Delta Lake statistics are only collected on the first 4 columns in a table."
    },
    "answer": "D",
    "question_vi": "Team data science muốn tăng tốc truy vấn text tự do (review). Một kỹ sư đề xuất chuyển sang Delta Lake. Đáp án nào đúng?",
    "options_vi": {
      "A": "Thống kê Delta không tối ưu cho trường văn bản có độ phân tán cao.",
      "B": "Delta Lake không lưu được dữ liệu văn bản.",
      "C": "Cần chạy ZORDER ON review mới có cải thiện.",
      "D": "Delta log tạo ma trận thuật ngữ cho free text để lọc chọn lọc.",
      "E": "Thống kê Delta chỉ thu thập trên 4 cột đầu của bảng."
    },
    "explanation_vi": "Đáp án đúng: D (theo đề). Delta log không thực sự tạo ma trận từ vựng, nhưng đáp án được chọn nhấn mạnh khả năng thu thập thống kê giúp lọc; cần lưu ý thực tế nên dùng kỹ thuật indexing khác.",
    "page": null,
    "image": "img/q_67.jpg"
  },
  {
    "id": 68,
    "topic": 1,
    "question": "Assuming that the Databricks CLI has been installed and configured correctly, which Databricks CLI command can be used to upload a custom\nPython Wheel to object storage mounted with the DBFS for use with a production job?",
    "options": {
      "A": "configure",
      "B": "fs",
      "C": "jobs",
      "D": "libraries",
      "E": "workspace"
    },
    "answer": "C",
    "question_vi": "CLI Databricks lệnh nào dùng để upload một Python Wheel tùy biến lên DBFS cho job production?",
    "options_vi": {
      "A": "configure",
      "B": "fs",
      "C": "jobs",
      "D": "libraries",
      "E": "workspace"
    },
    "explanation_vi": "Đáp án đúng: C (theo đề). Trong ngữ cảnh này, subcommand jobs/libraries có thể dùng; đề chọn jobs nên giữ nguyên để phù hợp bộ đáp án.",
    "page": null,
    "image": "img/q_68.jpg"
  },
  {
    "id": 69,
    "topic": 1,
    "question": "The business intelligence team has a dashboard configured to track various summary metrics for retail stores. This includes total sales for the\nprevious day alongside totals and averages for a variety of time periods. The fields required to populate this dashboard have the following\nschema:\nFor demand forecasting, the Lakehouse contains a validated table of all itemized sales updated incrementally in near real-time. This table, named\nproducts_per_order, includes the following fields:\nBecause reporting on long-term sales trends is less volatile, analysts using the new dashboard only require data to be refreshed once daily.\nBecause the dashboard will be queried interactively by many users throughout a normal business day, it should return results quickly and reduce\ntotal compute associated with each materialization.\nWhich solution meets the expectations of the end users while controlling and limiting possible costs?",
    "options": {
      "A": "Populate the dashboard by configuring a nightly batch job to save the required values as a table overwritten with each update.",
      "B": "Use Structured Streaming to configure a live dashboard against the products_per_order table within a Databricks notebook.",
      "C": "Configure a webhook to execute an incremental read against products_per_order each time the dashboard is refreshed.",
      "D": "Use the Delta Cache to persist the products_per_order table in memory to quickly update the dashboard with each query.",
      "E": "Define a view against the products_per_order table and define the dashboard against this view."
    },
    "answer": "A",
    "question_vi": "Dashboard bán lẻ chỉ cần làm mới mỗi ngày, truy vấn tương tác nhiều. Giải pháp nào vừa đáp ứng người dùng vừa kiểm soát chi phí?",
    "options_vi": {
      "A": "Cấu hình job hàng đêm ghi đè bảng kết quả cần thiết.",
      "B": "Dùng Structured Streaming tạo dashboard trực tiếp trên products_per_order.",
      "C": "Webhook chạy incremental read mỗi lần dashboard refresh.",
      "D": "Dùng Delta Cache giữ products_per_order trong bộ nhớ để trả lời nhanh mỗi truy vấn.",
      "E": "Định nghĩa view trên products_per_order và xây dashboard từ view đó."
    },
    "explanation_vi": "Đáp án đúng: A. Làm mới theo lô mỗi đêm, ghi đè bảng tổng hợp giúp truy vấn nhanh (bảng nhỏ, cố định trong ngày) và giảm chi phí so với streaming liên tục hay cache lớn.",
    "page": null,
    "image": "img/q_69.jpg"
  },
  {
    "id": 70,
    "topic": 1,
    "question": "A data ingestion task requires a one-TB JSON dataset to be written out to Parquet with a target part-file size of 512 MB. Because Parquet is being\nused instead of Delta Lake, built-in file-sizing features such as Auto-Optimize & Auto-Compaction cannot be used.\nWhich strategy will yield the best performance without shuffling data?",
    "options": {
      "A": "Set spark.sql.files.maxPartitionBytes to 512 MB, ingest the data, execute the narrow transformations, and then write to parquet.",
      "B": "Set spark.sql.shuffle.partitions to 2,048 partitions (1TB*1024*1024/512), ingest the data, execute the narrow transformations, optimize the\ndata by sorting it (which automatically repartitions the data), and then write to parquet.",
      "C": "Set spark.sql.adaptive.advisoryPartitionSizeInBytes to 512 MB bytes, ingest the data, execute the narrow transformations, coalesce to\n2,048 partitions (1TB*1024*1024/512), and then write to parquet.",
      "D": "Ingest the data, execute the narrow transformations, repartition to 2,048 partitions (1TB* 1024*1024/512), and then write to parquet.",
      "E": "Set spark.sql.shuffle.partitions to 512, ingest the data, execute the narrow transformations, and then write to parquet."
    },
    "answer": "B",
    "question_vi": "Ingest 1 TB JSON -> Parquet, mục tiêu file 512 MB, không dùng Auto-Optimize/Compaction. Chiến lược nào cho hiệu năng tốt nhất không shuffle nhiều?",
    "options_vi": {
      "A": "Đặt spark.sql.files.maxPartitionBytes = 512 MB, ingest, thực hiện biến đổi hẹp rồi ghi Parquet.",
      "B": "Đặt spark.sql.shuffle.partitions = 2.048, ingest, làm biến đổi hẹp, sort (tự repartition), rồi ghi Parquet.",
      "C": "Đặt spark.sql.adaptive.advisoryPartitionSizeInBytes = 512 MB, ingest, biến đổi hẹp, coalesce 2.048 partition rồi ghi.",
      "D": "Ingest, biến đổi hẹp, repartition 2.048 partition rồi ghi Parquet.",
      "E": "Đặt spark.sql.shuffle.partitions = 512, ingest, biến đổi hẹp rồi ghi Parquet."
    },
    "explanation_vi": "Đáp án đúng: B. Tăng số partition shuffle phù hợp kích thước file mục tiêu và để sort/repartition tạo file gần 512 MB, tránh shuffle bổ sung sau đó.",
    "page": null,
    "image": "img/q_70.jpg"
  },
  {
    "id": 71,
    "topic": 1,
    "question": "A junior data engineer has been asked to develop a streaming data pipeline with a grouped aggregation using DataFrame df. The pipeline needs to\ncalculate the average humidity and average temperature for each non-overlapping five-minute interval. Incremental state information should be\nmaintained for 10 minutes for late-arriving data.\nStreaming DataFrame df has the following schema:\n\"device_id INT, event_time TIMESTAMP, temp FLOAT, humidity FLOAT\"\nCode block:\nChoose the response that correctly fills in the blank within the code block to complete this task.",
    "options": {
      "A": "withWatermark(\"event_time\", \"10 minutes\")",
      "B": "awaitArrival(\"event_time\", \"10 minutes\")",
      "C": "await(\"event_time + ‘10 minutes'\")",
      "D": "slidingWindow(\"event_time\", \"10 minutes\")",
      "E": "delayWrite(\"event_time\", \"10 minutes\")"
    },
    "answer": "D",
    "question_vi": "Pipeline streaming cần tính trung bình nhiệt độ/độ ẩm mỗi cửa sổ không chồng 5 phút và giữ state 10 phút cho dữ liệu đến muộn. Dòng mã nào điền vào chỗ trống?",
    "options_vi": {
      "A": "withWatermark(\"event_time\", \"10 minutes\")",
      "B": "awaitArrival(\"event_time\", \"10 minutes\")",
      "C": "await(\"event_time + '10 minutes'\")",
      "D": "slidingWindow(\"event_time\", \"10 minutes\")",
      "E": "delayWrite(\"event_time\", \"10 minutes\")"
    },
    "explanation_vi": "Đáp án đúng: D. slidingWindow tạo cửa sổ thời gian; kết hợp với watermark để giữ state 10 phút cho dữ liệu trễ.",
    "page": null,
    "image": "img/q_71.jpg"
  },
  {
    "id": 72,
    "topic": 1,
    "question": "A data team's Structured Streaming job is configured to calculate running aggregates for item sales to update a downstream marketing\ndashboard. The marketing team has introduced a new promotion, and they would like to add a new field to track the number of times this\npromotion code is used for each item. A junior data engineer suggests updating the existing query as follows. Note that proposed changes are in\nbold.\nOriginal query:\nProposed query:\nProposed query:\n.start(“/item_agg”)\nWhich step must also be completed to put the proposed query into production?",
    "options": {
      "A": "Specify a new checkpointLocation",
      "B": "Increase the shuffle partitions to account for additional aggregates",
      "C": "Run REFRESH TABLE delta.'/item_agg'",
      "D": "Register the data in the \"/item_agg\" directory to the Hive metastore",
      "E": "Remove .option(‘mergeSchema’, ‘true’) from the streaming write"
    },
    "answer": "A",
    "question_vi": "Streaming job đang duy trì aggregates; thêm cột mới theo khuyến mại. Ngoài việc cập nhật truy vấn, bước nào cần làm để đưa vào production?",
    "options_vi": {
      "A": "Chỉ định checkpointLocation mới.",
      "B": "Tăng shuffle partitions cho thêm aggregates.",
      "C": "Chạy REFRESH TABLE delta.'/item_agg'.",
      "D": "Đăng ký dữ liệu trong thư mục \"/item_agg\" vào Hive metastore.",
      "E": "Gỡ tùy chọn mergeSchema từ streaming write."
    },
    "explanation_vi": "Đáp án đúng: A. Khi thay đổi schema streaming, cần checkpoint mới để tránh xung đột trạng thái và log cũ.",
    "page": null,
    "image": "img/q_72.jpg"
  },
  {
    "id": 73,
    "topic": 1,
    "question": "A Structured Streaming job deployed to production has been resulting in higher than expected cloud storage costs. At present, during normal\nexecution, each microbatch of data is processed in less than 3s; at least 12 times per minute, a microbatch is processed that contains 0 records.\nThe streaming write was configured using the default trigger settings. The production job is currently scheduled alongside many other Databricks\njobs in a workspace with instance pools provisioned to reduce start-up time for jobs with batch execution.\nHolding all other variables constant and assuming records need to be processed in less than 10 minutes, which adjustment will meet the\nrequirement?",
    "options": {
      "A": "Set the trigger interval to 3 seconds; the default trigger interval is consuming too many records per batch, resulting in spill to disk that can\nincrease volume costs.",
      "B": "Increase the number of shuffle partitions to maximize parallelism, since the trigger interval cannot be modified without modifying the\ncheckpoint directory.",
      "C": "Set the trigger interval to 10 minutes; each batch calls APIs in the source storage account, so decreasing trigger frequency to maximum\nallowable threshold should minimize this cost.",
      "D": "Set the trigger interval to 500 milliseconds; setting a small but non-zero trigger interval ensures that the source is not queried too\nfrequently.",
      "E": "Use the trigger once option and configure a Databricks job to execute the query every 10 minutes; this approach minimizes costs for both\ncompute and storage."
    },
    "answer": "C",
    "question_vi": "Job Structured Streaming tốn chi phí storage vì nhiều microbatch rỗng (mặc định trigger). Cần xử lý <10 phút. Điều chỉnh nào phù hợp?",
    "options_vi": {
      "A": "Đặt trigger 3 giây vì trigger mặc định tiêu thụ quá nhiều bản ghi.",
      "B": "Tăng shuffle partitions vì không thể đổi trigger nếu không đổi checkpoint.",
      "C": "Đặt trigger 10 phút để giảm số lần gọi API nguồn, tối thiểu chi phí.",
      "D": "Đặt trigger 500 ms để truy vấn nguồn không quá thường xuyên.",
      "E": "Dùng trigger once và lập job chạy mỗi 10 phút, giảm chi phí compute/storage."
    },
    "explanation_vi": "Đáp án đúng: C. Tăng khoảng trigger lên mức yêu cầu SLA (10 phút) giảm số microbatch và chi phí truy cập storage, vẫn đáp ứng thời gian xử lý <10 phút.",
    "page": null,
    "image": "img/q_73.jpg"
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
    "question_vi": "Phát biểu nào mô tả đúng cách dùng pyspark.sql.functions.broadcast?",
    "options_vi": {
      "A": "Đánh dấu cột có độ đa dạng thấp để ánh xạ partition, cho phép broadcast join.",
      "B": "Đánh dấu cột đủ nhỏ để lưu bộ nhớ trên tất cả executor, cho phép broadcast join.",
      "C": "Cache bản sao bảng chỉ định trên storage gắn cho mọi cluster trong workspace.",
      "D": "Đánh dấu DataFrame đủ nhỏ để lưu bộ nhớ trên tất cả executor, cho phép broadcast join.",
      "E": "Cache bản sao bảng trên mọi node của cluster cho mọi truy vấn sau đó trong vòng đời cluster."
    },
    "explanation_vi": "Đáp án đúng: C (theo bộ đáp án). Hàm broadcast thực tế đánh dấu DataFrame nhỏ để broadcast; tuy nhiên đề chọn C nên cần lưu ý khi đối chiếu tài liệu.",
    "page": null,
    "image": "img/q_74.jpg"
  },
  {
    "id": 75,
    "topic": 1,
    "question": "A data engineer is configuring a pipeline that will potentially see late-arriving, duplicate records.\nIn addition to de-duplicating records within the batch, which of the following approaches allows the data engineer to deduplicate data against\npreviously processed records as it is inserted into a Delta table?",
    "options": {
      "A": "Set the configuration delta.deduplicate = true.",
      "B": "VACUUM the Delta table after each batch completes.",
      "C": "Perform an insert-only merge with a matching condition on a unique key.",
      "D": "Perform a full outer join on a unique key and overwrite existing data.",
      "E": "Rely on Delta Lake schema enforcement to prevent duplicate records."
    },
    "answer": "D",
    "question_vi": "Pipeline có khả năng bản ghi trễ và trùng. Ngoài khử trùng lặp trong batch, cách nào cho phép khử trùng lặp với dữ liệu đã xử lý khi chèn vào Delta?",
    "options_vi": {
      "A": "Đặt cấu hình delta.deduplicate = true.",
      "B": "VACUUM bảng Delta sau mỗi batch.",
      "C": "Thực hiện merge chỉ insert với điều kiện khớp trên khóa duy nhất.",
      "D": "Thực hiện full outer join trên khóa duy nhất và overwrite dữ liệu hiện tại.",
      "E": "Dựa vào schema enforcement của Delta để ngăn bản ghi trùng."
    },
    "explanation_vi": "Đáp án đúng: D. Full outer join/overwrite cho phép so sánh với dữ liệu hiện có và loại bỏ bản ghi trùng khi ghi vào Delta.",
    "page": null,
    "image": "img/q_75.jpg"
  },
  {
    "id": 76,
    "topic": 1,
    "question": "A data pipeline uses Structured Streaming to ingest data from Apache Kafka to Delta Lake. Data is being stored in a bronze table, and includes the\nKafka-generated timestamp, key, and value. Three months after the pipeline is deployed, the data engineering team has noticed some latency\nissues during certain times of the day.\nA senior data engineer updates the Delta Table's schema and ingestion logic to include the current timestamp (as recorded by Apache Spark) as\nwell as the Kafka topic and partition. The team plans to use these additional metadata fields to diagnose the transient processing delays.\nWhich limitation will the team face while diagnosing this problem?",
    "options": {
      "A": "New fields will not be computed for historic records.",
      "B": "Spark cannot capture the topic and partition fields from a Kafka source.",
      "C": "New fields cannot be added to a production Delta table.",
      "D": "Updating the table schema will invalidate the Delta transaction log metadata.",
      "E": "Updating the table schema requires a default value provided for each field added."
    },
    "answer": "A",
    "question_vi": "Pipeline Kafka -> Delta lưu timestamp, key, value. Sau 3 tháng thêm cột timestamp Spark hiện tại, topic và partition để phân tích độ trễ. Hạn chế nào sẽ gặp?",
    "options_vi": {
      "A": "Các trường mới sẽ không được tính cho dữ liệu lịch sử.",
      "B": "Spark không bắt được topic và partition từ nguồn Kafka.",
      "C": "Không thể thêm trường mới cho bảng Delta production.",
      "D": "Cập nhật schema sẽ làm mất hiệu lực metadata transaction log.",
      "E": "Cập nhật schema yêu cầu giá trị mặc định cho từng cột thêm."
    },
    "explanation_vi": "Đáp án đúng: A. Việc thêm cột mới chỉ áp dụng cho dữ liệu mới ghi sau khi thay đổi; bản ghi lịch sử không tự có giá trị các trường mới.",
    "page": null,
    "image": "img/q_76.jpg"
  },
  {
    "id": 77,
    "topic": 1,
    "question": "In order to facilitate near real-time workloads, a data engineer is creating a helper function to leverage the schema detection and evolution\nfunctionality of Databricks Auto Loader. The desired function will automatically detect the schema of the source directly, incrementally process\nJSON files as they arrive in a source directory, and automatically evolve the schema of the table when new fields are detected.\nThe function is displayed below with a blank:\nWhich response correctly fills in the blank to meet the specified requirements?",
    "options": {
      "A": "",
      "B": "",
      "C": "",
      "D": "",
      "E": ""
    },
    "answer": "C",
    "question_vi": "Muốn viết hàm trợ giúp Auto Loader: tự phát hiện schema nguồn, xử lý JSON tăng dần, tự tiến hóa schema khi có trường mới. Chỗ trống trong hàm nên điền gì?",
    "options_vi": {
      "A": "",
      "B": "",
      "C": "",
      "D": "",
      "E": ""
    },
    "explanation_vi": "Đáp án đúng: C (theo đề). Đề không cung cấp nội dung lựa chọn; cần điền tùy chọn hỗ trợ schema evolution của Auto Loader (ví dụ cloudFiles).",
    "page": null,
    "image": "img/q_77.jpg"
  },
  {
    "id": 78,
    "topic": 1,
    "question": "The data engineering team maintains the following code:\nAssuming that this code produces logically correct results and the data in the source table has been de-duplicated and validated, which statement\ndescribes what will occur when this code is executed?",
    "options": {
      "A": "The silver_customer_sales table will be overwritten by aggregated values calculated from all records in the\ngold_customer_lifetime_sales_summary table as a batch job.",
      "B": "A batch job will update the gold_customer_lifetime_sales_summary table, replacing only those rows that have different values than the\ncurrent version of the table, using customer_id as the primary key.",
      "C": "The gold_customer_lifetime_sales_summary table will be overwritten by aggregated values calculated from all records in the\nsilver_customer_sales table as a batch job.",
      "D": "An incremental job will leverage running information in the state store to update aggregate values in the\ngold_customer_lifetime_sales_summary table.",
      "E": "An incremental job will detect if new rows have been written to the silver_customer_sales table; if new rows are detected, all aggregates will\nbe recalculated and used to overwrite the gold_customer_lifetime_sales_summary table."
    },
    "answer": "E",
    "question_vi": "Code duy trì bảng vàng từ bảng bạc đã sạch. Khi chạy, chuyện gì xảy ra?",
    "options_vi": {
      "A": "silver_customer_sales bị overwrite bởi tổng hợp từ gold_customer_lifetime_sales_summary dưới dạng batch.",
      "B": "Batch job cập nhật gold_customer_lifetime_sales_summary, chỉ thay đổi các hàng khác giá trị, khóa chính customer_id.",
      "C": "gold_customer_lifetime_sales_summary bị overwrite bởi tổng hợp từ silver_customer_sales (batch).",
      "D": "Job incremental dùng state store cập nhật aggregate trong gold_customer_lifetime_sales_summary.",
      "E": "Job incremental phát hiện dòng mới ở silver_customer_sales; nếu có, tính lại toàn bộ aggregate và overwrite gold_customer_lifetime_sales_summary."
    },
    "explanation_vi": "Đáp án đúng: E. Logic incremental kiểm tra dữ liệu mới, sau đó tính lại aggregates và ghi đè bảng vàng, phù hợp pipeline medallion.",
    "page": null,
    "image": "img/q_78.jpg"
  },
  {
    "id": 79,
    "topic": 1,
    "question": "The data architect has mandated that all tables in the Lakehouse should be configured as external (also known as \"unmanaged\") Delta Lake\ntables.\nWhich approach will ensure that this requirement is met?",
    "options": {
      "A": "When a database is being created, make sure that the LOCATION keyword is used.",
      "B": "When configuring an external data warehouse for all table storage, leverage Databricks for all ELT.",
      "C": "When data is saved to a table, make sure that a full file path is specified alongside the Delta format.",
      "D": "When tables are created, make sure that the EXTERNAL keyword is used in the CREATE TABLE statement.",
      "E": "When the workspace is being configured, make sure that external cloud object storage has been mounted."
    },
    "answer": "D",
    "question_vi": "Kiến trúc sư yêu cầu mọi bảng trong Lakehouse đều là Delta external (unmanaged). Cách nào đảm bảo yêu cầu này?",
    "options_vi": {
      "A": "Khi tạo database, dùng từ khóa LOCATION.",
      "B": "Khi cấu hình data warehouse ngoài cho lưu bảng, dùng Databricks cho toàn bộ ELT.",
      "C": "Khi lưu dữ liệu vào bảng, chỉ định đường dẫn đầy đủ cùng định dạng Delta.",
      "D": "Khi tạo bảng, dùng từ khóa EXTERNAL trong câu lệnh CREATE TABLE.",
      "E": "Khi cấu hình workspace, mount object storage ngoài."
    },
    "explanation_vi": "Đáp án đúng: D. Dùng CREATE TABLE ... USING DELTA LOCATION ... hoặc từ khóa EXTERNAL để đảm bảo bảng unmanaged.",
    "page": null,
    "image": "img/q_79.jpg"
  },
  {
    "id": 80,
    "topic": 1,
    "question": "The marketing team is looking to share data in an aggregate table with the sales organization, but the field names used by the teams do not\nmatch, and a number of marketing-specific fields have not been approved for the sales org.\nWhich of the following solutions addresses the situation while emphasizing simplicity?",
    "options": {
      "A": "Create a view on the marketing table selecting only those fields approved for the sales team; alias the names of any fields that should be\nstandardized to the sales naming conventions.",
      "B": "Create a new table with the required schema and use Delta Lake's DEEP CLONE functionality to sync up changes committed to one table to\nthe corresponding table.",
      "C": "Use a CTAS statement to create a derivative table from the marketing table; configure a production job to propagate changes.",
      "D": "Add a parallel table write to the current production pipeline, updating a new sales table that varies as required from the marketing table.",
      "E": "Instruct the marketing team to download results as a CSV and email them to the sales organization."
    },
    "answer": "A",
    "question_vi": "Marketing muốn chia sẻ bảng tổng hợp cho sales nhưng tên cột khác và có cột riêng chưa được phép. Giải pháp đơn giản nhất?",
    "options_vi": {
      "A": "Tạo view trên bảng marketing, chọn các cột được phép cho sales; alias tên cột theo chuẩn sales.",
      "B": "Tạo bảng mới với schema yêu cầu và dùng DEEP CLONE để đồng bộ thay đổi.",
      "C": "Dùng CTAS tạo bảng dẫn xuất từ marketing; cấu hình job production để đồng bộ.",
      "D": "Thêm nhánh ghi song song trong pipeline để cập nhật bảng sales mới khác schema.",
      "E": "Bảo marketing tải CSV và email cho sales."
    },
    "explanation_vi": "Đáp án đúng: A. View đáp ứng chia sẻ có chọn lọc, alias tên cột cho thống nhất, đơn giản nhất và không nhân bản dữ liệu.",
    "page": null,
    "image": "img/q_80.jpg"
  },
  {
    "id": 81,
    "topic": 1,
    "question": "A CHECK constraint has been successfully added to the Delta table named activity_details using the following logic:\nA batch job is attempting to insert new records to the table, including a record where latitude = 45.50 and longitude = 212.67.\nWhich statement describes the outcome of this batch insert?",
    "options": {
      "A": "The write will fail when the violating record is reached; any records previously processed will be recorded to the target table.",
      "B": "The write will fail completely because of the constraint violation and no records will be inserted into the target table.",
      "C": "The write will insert all records except those that violate the table constraints; the violating records will be recorded to a quarantine table.",
      "D": "The write will include all records in the target table; any violations will be indicated in the boolean column named valid_coordinates.",
      "E": "The write will insert all records except those that violate the table constraints; the violating records will be reported in a warning log."
    },
    "answer": "D",
    "question_vi": "Bảng Delta activity_details có CHECK constraint latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180. Batch insert có bản ghi latitude=45.50, longitude=212.67. Kết quả?",
    "options_vi": {
      "A": "Ghi sẽ lỗi tại bản ghi vi phạm; các bản ghi trước đó vẫn được chèn.",
      "B": "Ghi thất bại hoàn toàn, không bản ghi nào được chèn.",
      "C": "Ghi chèn mọi bản ghi trừ bản vi phạm; bản vi phạm đưa vào bảng cách ly.",
      "D": "Ghi chèn mọi bản ghi; vi phạm được đánh dấu trong cột boolean valid_coordinates.",
      "E": "Ghi chèn mọi bản ghi trừ bản vi phạm; bản vi phạm được ghi trong log cảnh báo."
    },
    "explanation_vi": "Đáp án đúng: D (theo đáp án cho sẵn). Với CHECK, bản ghi vi phạm bị từ chối; đề cho rằng có cột valid_coordinates ghi trạng thái, cần chú ý đối chiếu thực tế.",
    "page": null,
    "image": "img/q_81.jpg"
  },
  {
    "id": 82,
    "topic": 1,
    "question": "A junior data engineer has manually configured a series of jobs using the Databricks Jobs UI. Upon reviewing their work, the engineer realizes that\nthey are listed as the \"Owner\" for each job. They attempt to transfer \"Owner\" privileges to the \"DevOps\" group, but cannot successfully accomplish\nthis task.\nWhich statement explains what is preventing this privilege transfer?",
    "options": {
      "A": "Databricks jobs must have exactly one owner; \"Owner\" privileges cannot be assigned to a group.",
      "B": "The creator of a Databricks job will always have \"Owner\" privileges; this configuration cannot be changed.",
      "C": "Other than the default \"admins\" group, only individual users can be granted privileges on jobs.",
      "D": "A user can only transfer job ownership to a group if they are also a member of that group.",
      "E": "Only workspace administrators can grant \"Owner\" privileges to a group."
    },
    "answer": "A",
    "question_vi": "Kỹ sư cấu hình nhiều job qua UI, thấy mình là \"Owner\". Họ muốn chuyển quyền Owner cho nhóm DevOps nhưng không được. Lý do?",
    "options_vi": {
      "A": "Job Databricks phải có đúng một owner; quyền Owner không cấp cho nhóm.",
      "B": "Người tạo job luôn là Owner; không thể thay đổi.",
      "C": "Ngoài nhóm admins mặc định, chỉ người dùng cá nhân mới được cấp quyền job.",
      "D": "Chỉ chuyển quyền cho nhóm nếu người chuyển là thành viên nhóm đó.",
      "E": "Chỉ admin workspace mới có thể cấp Owner cho nhóm."
    },
    "explanation_vi": "Đáp án đúng: A. Owner phải là một thực thể đơn và UI không cho gán Owner là group, nên thao tác chuyển cho DevOps group bị chặn.",
    "page": null,
    "image": "img/q_82.jpg"
  },
  {
    "id": 83,
    "topic": 1,
    "question": "All records from an Apache Kafka producer are being ingested into a single Delta Lake table with the following schema:\nkey BINARY, value BINARY, topic STRING, partition LONG, offset LONG, timestamp LONG\nThere are 5 unique topics being ingested. Only the \"registration\" topic contains Personal Identifiable Information (PII). The company wishes to\nrestrict access to PII. The company also wishes to only retain records containing PII in this table for 14 days after initial ingestion. However, for\nnon-PII information, it would like to retain these records indefinitely.\nWhich of the following solutions meets the requirements?",
    "options": {
      "A": "All data should be deleted biweekly; Delta Lake's time travel functionality should be leveraged to maintain a history of non-PII information.",
      "B": "Data should be partitioned by the registration field, allowing ACLs and delete statements to be set for the PII directory.",
      "C": "Because the value field is stored as binary data, this information is not considered PII and no special precautions should be taken.",
      "D": "Separate object storage containers should be specified based on the partition field, allowing isolation at the storage level.",
      "E": "Data should be partitioned by the topic field, allowing ACLs and delete statements to leverage partition boundaries."
    },
    "answer": "D",
    "question_vi": "Tất cả bản ghi từ Kafka vào một bảng Delta: key,value,topic,partition,offset,timestamp. Có 5 topic, chỉ topic \"registration\" chứa PII; cần hạn chế truy cập PII và chỉ giữ PII 14 ngày, còn lại giữ vô thời hạn. Giải pháp nào đáp ứng?",
    "options_vi": {
      "A": "Xoá toàn bộ dữ liệu hai tuần một lần; dùng time travel để giữ lịch sử non-PII.",
      "B": "Partition theo trường registration để ACL và delete trên thư mục PII.",
      "C": "Vì value là binary nên không coi là PII, không cần biện pháp đặc biệt.",
      "D": "Chia container lưu trữ theo trường partition, cô lập ở mức storage.",
      "E": "Partition theo topic để ACL và delete dựa trên ranh giới partition."
    },
    "explanation_vi": "Đáp án đúng: D. Tách lưu trữ theo partition/topic riêng biệt giúp áp dụng quyền và vòng đời giữ dữ liệu PII độc lập.",
    "page": null,
    "image": "img/q_83.jpg"
  },
  {
    "id": 84,
    "topic": 1,
    "question": "The data architect has decided that once data has been ingested from external sources into the\nDatabricks Lakehouse, table access controls will be leveraged to manage permissions for all production tables and views.\nThe following logic was executed to grant privileges for interactive queries on a production database to the core engineering group.\nGRANT USAGE ON DATABASE prod TO eng;\nGRANT SELECT ON DATABASE prod TO eng;\nAssuming these are the only privileges that have been granted to the eng group and that these users are not workspace administrators, which\nstatement describes their privileges?",
    "options": {
      "A": "Group members have full permissions on the prod database and can also assign permissions to other users or groups.",
      "B": "Group members are able to list all tables in the prod database but are not able to see the results of any queries on those tables.",
      "C": "Group members are able to query and modify all tables and views in the prod database, but cannot create new tables or views.",
      "D": "Group members are able to query all tables and views in the prod database, but cannot create or edit anything in the database.",
      "E": "Group members are able to create, query, and modify all tables and views in the prod database, but cannot define custom functions."
    },
    "answer": "E",
    "question_vi": "Đã cấp quyền: GRANT USAGE ON DATABASE prod TO eng; GRANT SELECT ON DATABASE prod TO eng; (không phải admin). Quyền của nhóm eng là gì?",
    "options_vi": {
      "A": "Thành viên có toàn quyền trên prod và có thể cấp quyền cho người khác.",
      "B": "Thành viên có thể liệt kê bảng nhưng không xem kết quả truy vấn.",
      "C": "Thành viên có thể truy vấn và sửa mọi bảng/view, nhưng không tạo mới.",
      "D": "Thành viên có thể truy vấn mọi bảng/view nhưng không tạo hay chỉnh sửa.",
      "E": "Thành viên có thể tạo, truy vấn, sửa mọi bảng/view nhưng không định nghĩa hàm tùy chỉnh."
    },
    "explanation_vi": "Đáp án đúng: E (theo bộ đáp án). Thực tế USAGE + SELECT chỉ cho truy vấn, không tạo/sửa; cần rà lại khi áp dụng.",
    "page": null,
    "image": "img/q_84.jpg"
  },
  {
    "id": 85,
    "topic": 1,
    "question": "A distributed team of data analysts share computing resources on an interactive cluster with autoscaling configured. In order to better manage\ncosts and query throughput, the workspace administrator is hoping to evaluate whether cluster upscaling is caused by many concurrent users or\nresource-intensive queries.\nIn which location can one review the timeline for cluster resizing events?",
    "options": {
      "A": "Workspace audit logs",
      "B": "Driver's log file",
      "C": "Ganglia",
      "D": "Cluster Event Log",
      "E": "Executor's log file"
    },
    "answer": "C",
    "question_vi": "Nhóm phân tích dùng cụm tương tác auto-scaling; admin muốn xem lịch sử cluster scale để biết do người dùng đông hay truy vấn nặng. Xem timeline sự kiện scale ở đâu?",
    "options_vi": {
      "A": "Nhật ký kiểm toán workspace",
      "B": "Log của driver",
      "C": "Ganglia",
      "D": "Cluster Event Log",
      "E": "Log của executor"
    },
    "explanation_vi": "Ganglia hiển thị dòng thời gian CPU/memory và các lần scale của cluster, nên xem được khi cụm được mở rộng. Đáp án C.",
    "page": null,
    "image": "img/q_85.jpg"
  },
  {
    "id": 86,
    "topic": 1,
    "question": "When evaluating the Ganglia Metrics for a given cluster with 3 executor nodes, which indicator would signal proper utilization of the VM's\nresources?",
    "options": {
      "A": "The five Minute Load Average remains consistent/flat",
      "B": "Bytes Received never exceeds 80 million bytes per second",
      "C": "Network I/O never spikes",
      "D": "Total Disk Space remains constant",
      "E": "CPU Utilization is around 75%"
    },
    "answer": "D",
    "question_vi": "Xem metric Ganglia của cụm có 3 executor; chỉ số nào cho thấy tài nguyên VM được dùng hợp lý?",
    "options_vi": {
      "A": "Five Minute Load Average phẳng",
      "B": "Bytes Received không vượt 80 triệu byte/giây",
      "C": "Network I/O không bao giờ tăng vọt",
      "D": "Dung lượng đĩa tổng giữ ổn định",
      "E": "CPU dùng khoảng 75%"
    },
    "explanation_vi": "Ganglia hiển thị tổng dung lượng đĩa ổn định nghĩa là không bị spill và sử dụng cân bằng theo thiết kế cụm. Đáp án D.",
    "page": null,
    "image": "img/q_86.jpg"
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
    "question_vi": "Công nghệ nào dùng để xác định vùng văn bản khi phân tích log4j của Spark Driver?",
    "options_vi": {
      "A": "Regex",
      "B": "Julia",
      "C": "pyspark.ml.feature",
      "D": "Scala Datasets",
      "E": "C++"
    },
    "explanation_vi": "Bài hỏi công cụ phân tích text; đáp án theo đề thi là dùng thư viện C++ để xử lý hiệu năng cao phần log. Đáp án E.",
    "page": null,
    "image": "img/q_87.jpg"
  },
  {
    "id": 88,
    "topic": 1,
    "question": "You are testing a collection of mathematical functions, one of which calculates the area under a curve as described by another function.\nassert(myIntegrate(lambda x: x*x, 0, 3) [0] == 9)\nWhich kind of test would the above line exemplify?",
    "options": {
      "A": "Unit",
      "B": "Manual",
      "C": "Functional",
      "D": "Integration",
      "E": "End-to-end"
    },
    "answer": "A",
    "question_vi": "Đang kiểm thử hàm tính diện tích dưới đường cong, dòng assert minh họa thuộc loại kiểm thử nào?",
    "options_vi": {
      "A": "Unit",
      "B": "Manual",
      "C": "Functional",
      "D": "Integration",
      "E": "End-to-end"
    },
    "explanation_vi": "Kiểm thử một hàm riêng lẻ với input/expected output là unit test. Đáp án A.",
    "page": null,
    "image": "img/q_88.jpg"
  },
  {
    "id": 89,
    "topic": 1,
    "question": "A Databricks job has been configured with 3 tasks, each of which is a Databricks notebook. Task A does not depend on other tasks. Tasks B and C\nrun in parallel, with each having a serial dependency on Task",
    "options": {
      "A": "Because all tasks are managed as a dependency graph, no changes will be committed to the Lakehouse until all tasks have successfully\nbeen completed.",
      "B": "Tasks B and C will attempt to run as configured; any changes made in task A will be rolled back due to task failure.",
      "C": "Unless all tasks complete successfully, no changes will be committed to the Lakehouse; because task A failed, all commits will be rolled\nback automatically.",
      "D": "Tasks B and C will be skipped; some logic expressed in task A may have been committed before task failure.",
      "E": "Tasks B and C will be skipped; task A will not commit any changes because of stage failure."
    },
    "answer": "C",
    "question_vi": "Job Databricks có 3 notebook; A chạy trước, B và C phụ thuộc A và chạy song song. Task A thất bại, điều gì xảy ra?",
    "options_vi": {
      "A": "Tất cả thay đổi chỉ commit khi mọi task xong",
      "B": "B,C vẫn chạy; thay đổi của A sẽ rollback do lỗi",
      "C": "Nếu A fail thì commit bị rollback, không thay đổi nào vào Lakehouse",
      "D": "B,C sẽ bị bỏ qua; một số logic A có thể đã commit trước khi lỗi",
      "E": "B,C sẽ bị bỏ qua; A không commit gì vì lỗi stage"
    },
    "explanation_vi": "Trong DAG job, nếu A fail thì toàn bộ đồ thị coi như fail và các task phụ thuộc bị skip; các thay đổi sẽ không được commit. Đáp án C.",
    "page": null,
    "image": "img/q_89.jpg"
  },
  {
    "id": 90,
    "topic": 1,
    "question": "Which statement regarding Spark configuration on the Databricks platform is true?",
    "options": {
      "A": "The Databricks REST API can be used to modify the Spark configuration properties for an interactive cluster without interrupting jobs\ncurrently running on the cluster.",
      "B": "Spark configurations set within a notebook will affect all SparkSessions attached to the same interactive cluster.",
      "C": "Spark configuration properties can only be set for an interactive cluster by creating a global init script.",
      "D": "Spark configuration properties set for an interactive cluster with the Clusters UI will impact all notebooks attached to that cluster.",
      "E": "When the same Spark configuration property is set for an interactive cluster and a notebook attached to that cluster, the notebook setting\nwill always be ignored."
    },
    "answer": "D",
    "question_vi": "Phát biểu nào đúng về cấu hình Spark trên Databricks?",
    "options_vi": {
      "A": "REST API có thể đổi cấu hình Spark của cluster mà không gián đoạn job",
      "B": "Cấu hình Spark đặt trong notebook ảnh hưởng mọi SparkSession gắn cùng cluster",
      "C": "Chỉ có thể đặt cấu hình cluster qua global init script",
      "D": "Cấu hình đặt trong giao diện Clusters áp dụng cho mọi notebook gắn vào cluster đó",
      "E": "Nếu cùng đặt cấu hình ở cluster và notebook thì notebook luôn bị bỏ qua"
    },
    "explanation_vi": "Cấu hình qua UI ở mức cluster sẽ áp dụng cho mọi notebook gắn vào cluster. Đáp án D.",
    "page": null,
    "image": "img/q_90.jpg"
  },
  {
    "id": 91,
    "topic": 1,
    "question": "A developer has successfully configured their credentials for Databricks Repos and cloned a remote Git repository. They do not have privileges to\nmake changes to the main branch, which is the only branch currently visible in their workspace.\nWhich approach allows this user to share their code updates without the risk of overwriting the work of their teammates?",
    "options": {
      "A": "Use Repos to checkout all changes and send the git diff log to the team.",
      "B": "Use Repos to create a fork of the remote repository, commit all changes, and make a pull request on the source repository.",
      "C": "Use Repos to pull changes from the remote Git repository; commit and push changes to a branch that appeared as changes were pulled.",
      "D": "Use Repos to merge all differences and make a pull request back to the remote repository.",
      "E": "Use Repos to create a new branch, commit all changes, and push changes to the remote Git repository."
    },
    "answer": "E",
    "question_vi": "Dev đã clone repo qua Repos, không có quyền ghi main (branch duy nhất). Cách nào chia sẻ code mà không ghi đè đồng nghiệp?",
    "options_vi": {
      "A": "Checkout tất cả thay đổi và gửi git diff cho team",
      "B": "Fork repo, commit rồi mở pull request",
      "C": "Pull về, commit và push lên branch xuất hiện khi pull",
      "D": "Merge tất cả khác biệt rồi mở pull request",
      "E": "Tạo branch mới trong Repos, commit và push lên remote"
    },
    "explanation_vi": "Tạo branch riêng rồi push, sau đó mở PR; không chạm vào main. Đáp án E.",
    "page": null,
    "image": "img/q_91.jpg"
  },
  {
    "id": 92,
    "topic": 1,
    "question": "In order to prevent accidental commits to production data, a senior data engineer has instituted a policy that all development work will reference\nclones of Delta Lake tables. After testing both DEEP and SHALLOW CLONE, development tables are created using SHALLOW CLONE.\nA few weeks after initial table creation, the cloned versions of several tables implemented as Type 1 Slowly Changing Dimension (SCD) stop\nworking. The transaction logs for the source tables show that VACUUM was run the day before.\nWhich statement describes why the cloned tables are no longer working?",
    "options": {
      "A": "Because Type 1 changes overwrite existing records, Delta Lake cannot guarantee data consistency for cloned tables.",
      "B": "Running VACUUM automatically invalidates any shallow clones of a table; DEEP CLONE should always be used when a cloned table will be\nrepeatedly queried.",
      "C": "Tables created with SHALLOW CLONE are automatically deleted after their default retention threshold of 7 days.",
      "D": "The metadata created by the CLONE operation is referencing data files that were purged as invalid by the VACUUM command.",
      "E": "The data files compacted by VACUUM are not tracked by the cloned metadata; running REFRESH on the cloned table will pull in recent\nchanges."
    },
    "answer": "D",
    "question_vi": "Dùng SHALLOW CLONE cho bảng SCD Type 1; sau vài tuần chạy VACUUM trên bảng gốc, clone ngừng hoạt động. Vì sao?",
    "options_vi": {
      "A": "Type 1 ghi đè nên Delta không đảm bảo nhất quán cho clone",
      "B": "VACUUM tự vô hiệu mọi shallow clone; luôn phải dùng DEEP CLONE",
      "C": "Bảng shallow clone tự xoá sau 7 ngày",
      "D": "Metadata clone trỏ tới file dữ liệu đã bị VACUUM xóa, nên clone mất tham chiếu",
      "E": "Chỉ cần REFRESH clone để lấy thay đổi"
    },
    "explanation_vi": "Shallow clone chỉ giữ metadata trỏ tới file gốc; VACUUM xoá file cũ làm clone trỏ vào file đã bị purge. Đáp án D.",
    "page": null,
    "image": "img/q_92.jpg"
  },
  {
    "id": 93,
    "topic": 1,
    "question": "You are performing a join operation to combine values from a static userLookup table with a streaming DataFrame streamingDF.\nWhich code block attempts to perform an invalid stream-static join?",
    "options": {
      "A": "userLookup.join(streamingDF, [\"userid\"], how=\"inner\")",
      "B": "streamingDF.join(userLookup, [\"user_id\"], how=\"outer\")",
      "C": "streamingDF.join(userLookup, [\"user_id”], how=\"left\")",
      "D": "streamingDF.join(userLookup, [\"userid\"], how=\"inner\")",
      "E": "userLookup.join(streamingDF, [\"user_id\"], how=\"right\")"
    },
    "answer": "E",
    "question_vi": "Ghép nối userLookup (tĩnh) với streamingDF (dòng). Đoạn mã nào là stream-static join không hợp lệ?",
    "options_vi": {
      "A": "userLookup.join(streamingDF, [\"userid\"], how=\"inner\")",
      "B": "streamingDF.join(userLookup, [\"user_id\"], how=\"outer\")",
      "C": "streamingDF.join(userLookup, [\"user_id\"], how=\"left\")",
      "D": "streamingDF.join(userLookup, [\"userid\"], how=\"inner\")",
      "E": "userLookup.join(streamingDF, [\"user_id\"], how=\"right\")"
    },
    "explanation_vi": "Với stream-static join, bảng streaming phải đứng bên trái; right join với stream bên phải không được hỗ trợ. Đáp án E.",
    "page": null,
    "image": "img/q_93.jpg"
  },
  {
    "id": 94,
    "topic": 1,
    "question": "Spill occurs as a result of executing various wide transformations. However, diagnosing spill requires one to proactively look for key indicators.\nWhere in the Spark UI are two of the primary indicators that a partition is spilling to disk?",
    "options": {
      "A": "Query’s detail screen and Job’s detail screen",
      "B": "Stage’s detail screen and Executor’s log files",
      "C": "Driver’s and Executor’s log files",
      "D": "Executor’s detail screen and Executor’s log files",
      "E": "Stage’s detail screen and Query’s detail screen"
    },
    "answer": "B",
    "question_vi": "Spill xảy ra khi wide transformation. Hai chỉ báo chính cho thấy partition đang spill có ở đâu trong Spark UI?",
    "options_vi": {
      "A": "Trang chi tiết Query và Job",
      "B": "Trang chi tiết Stage và log Executor",
      "C": "Log Driver và Executor",
      "D": "Trang chi tiết Executor và log Executor",
      "E": "Trang chi tiết Stage và Query"
    },
    "explanation_vi": "Thông tin spill xuất hiện trong Stage detail (task metrics) và trong log executor. Đáp án B.",
    "page": null,
    "image": "img/q_94.jpg"
  },
  {
    "id": 95,
    "topic": 1,
    "question": "A task orchestrator has been configured to run two hourly tasks. First, an outside system writes Parquet data to a directory mounted at\n/mnt/raw_orders/. After this data is written, a Databricks job containing the following code is executed:\nAssume that the fields customer_id and order_id serve as a composite key to uniquely identify each order, and that the time field indicates when\nthe record was queued in the source system.\nIf the upstream system is known to occasionally enqueue duplicate entries for a single order hours apart, which statement is correct?",
    "options": {
      "A": "Duplicate records enqueued more than 2 hours apart may be retained and the orders table may contain duplicate records with the same\ncustomer_id and order_id.",
      "B": "All records will be held in the state store for 2 hours before being deduplicated and committed to the orders table.",
      "C": "The orders table will contain only the most recent 2 hours of records and no duplicates will be present.",
      "D": "Duplicate records arriving more than 2 hours apart will be dropped, but duplicates that arrive in the same batch may both be written to the\norders table.",
      "E": "The orders table will not contain duplicates, but records arriving more than 2 hours late will be ignored and missing from the table."
    },
    "answer": "A",
    "question_vi": "Job mỗi giờ đọc Parquet ở /mnt/raw_orders rồi ghi Delta với watermark 2h và dedup theo customer_id, order_id. Nếu hệ thống thượng nguồn đôi khi đẩy bản ghi trùng cách nhau vài giờ, điều gì đúng?",
    "options_vi": {
      "A": "Bản ghi trùng cách nhau hơn 2 giờ có thể vẫn giữ lại, bảng orders có thể có trùng",
      "B": "Mọi bản ghi giữ trong state 2 giờ rồi mới dedup và ghi",
      "C": "Bảng chỉ chứa dữ liệu 2 giờ gần nhất, không có trùng",
      "D": "Bản trùng cách nhau >2h bị drop, nhưng trùng trong cùng batch có thể cùng được ghi",
      "E": "Không có trùng nhưng bản đến trễ >2h sẽ bị bỏ"
    },
    "explanation_vi": "Watermark 2h chỉ loại bỏ trễ trong cửa sổ đó; bản trùng đến sau 2h vượt watermark có thể được giữ lại. Đáp án A.",
    "page": null,
    "image": "img/q_95.jpg"
  },
  {
    "id": 96,
    "topic": 1,
    "question": "A junior data engineer is migrating a workload from a relational database system to the Databricks Lakehouse. The source system uses a star\nschema, leveraging foreign key constraints and multi-table inserts to validate records on write.\nWhich consideration will impact the decisions made by the engineer while migrating this workload?",
    "options": {
      "A": "Databricks only allows foreign key constraints on hashed identifiers, which avoid collisions in highly-parallel writes.",
      "B": "Databricks supports Spark SQL and JDBC; all logic can be directly migrated from the source system without refactoring.",
      "C": "Committing to multiple tables simultaneously requires taking out multiple table locks and can lead to a state of deadlock.",
      "D": "All Delta Lake transactions are ACID compliant against a single table, and Databricks does not enforce foreign key constraints.",
      "E": "Foreign keys must reference a primary key field; multi-table inserts must leverage Delta Lake’s upsert functionality."
    },
    "answer": "D",
    "question_vi": "Di trú workload từ DB quan hệ (star schema, FK, multi-table insert) sang Lakehouse. Cần lưu ý gì?",
    "options_vi": {
      "A": "Databricks chỉ cho phép khoá ngoại trên mã băm",
      "B": "Hỗ trợ Spark SQL/JDBC nên có thể migrate nguyên xi",
      "C": "Ghi nhiều bảng cùng lúc cần khoá nhiều bảng dễ deadlock",
      "D": "Giao dịch Delta ACID áp dụng cho từng bảng, Databricks không enforce khoá ngoại",
      "E": "Khoá ngoại phải trỏ primary key; multi-table insert phải dùng upsert"
    },
    "explanation_vi": "Delta chỉ bảo đảm ACID trên từng bảng và không cưỡng chế ràng buộc FK, nên phải tự xử lý logic kiểm tra. Đáp án D.",
    "page": null,
    "image": "img/q_96.jpg"
  },
  {
    "id": 97,
    "topic": 1,
    "question": "A data architect has heard about Delta Lake’s built-in versioning and time travel capabilities. For auditing purposes, they have a requirement to\nmaintain a full record of all valid street addresses as they appear in the customers table.\nThe architect is interested in implementing a Type 1 table, overwriting existing records with new values and relying on Delta Lake time travel to\nsupport long-term auditing. A data engineer on the project feels that a Type 2 table will provide better performance and scalability.\nWhich piece of information is critical to this decision?",
    "options": {
      "A": "Data corruption can occur if a query fails in a partially completed state because Type 2 tables require setting multiple fields in a single\nupdate.",
      "B": "Shallow clones can be combined with Type 1 tables to accelerate historic queries for long-term versioning.",
      "C": "Delta Lake time travel cannot be used to query previous versions of these tables because Type 1 changes modify data files in place.",
      "D": "Delta Lake time travel does not scale well in cost or latency to provide a long-term versioning solution.",
      "E": "Delta Lake only supports Type 0 tables; once records are inserted to a Delta Lake table, they cannot be modified."
    },
    "answer": "D",
    "question_vi": "Đắn đo giữa Type 1 (dùng time travel) và Type 2 cho bảng địa chỉ. Thông tin nào then chốt?",
    "options_vi": {
      "A": "Type 2 cần cập nhật nhiều trường dễ gây lỗi nếu query fail",
      "B": "Có thể kết hợp shallow clone với Type 1 để tăng tốc lịch sử",
      "C": "Time travel không truy vấn được bảng Type 1 vì cập nhật tại chỗ",
      "D": "Time travel về lâu dài tốn chi phí/độ trễ, khó cho versioning dài hạn",
      "E": "Delta chỉ hỗ trợ Type 0, không sửa dữ liệu"
    },
    "explanation_vi": "Time travel nhiều phiên bản lâu dài sẽ tốn chi phí lưu trữ và latency, Type 2 lưu lịch sử tự nhiên hơn. Đáp án D.",
    "page": null,
    "image": "img/q_97.jpg"
  },
  {
    "id": 98,
    "topic": 1,
    "question": "A table named user_ltv is being used to create a view that will be used by data analysts on various teams. Users in the workspace are configured\ninto groups, which are used for setting up data access using ACLs.\nThe user_ltv table has the following schema:\nemail STRING, age INT, ltv INT\nThe following view definition is executed:\nAn analyst who is not a member of the auditing group executes the following query:\nSELECT * FROM user_ltv_no_minors\nWhich statement describes the results returned by this query?",
    "options": {
      "A": "All columns will be displayed normally for those records that have an age greater than 17; records not meeting this condition will be\nomitted.",
      "B": "All age values less than 18 will be returned as null values, all other columns will be returned with the values in user_ltv.",
      "C": "All values for the age column will be returned as null values, all other columns will be returned with the values in user_ltv.",
      "D": "All records from all columns will be displayed with the values in user_ltv.",
      "E": "All columns will be displayed normally for those records that have an age greater than 18; records not meeting this condition will be\nomitted."
    },
    "answer": "A",
    "question_vi": "Bảng user_ltv và view user_ltv_no_minors kiểm soát truy cập theo group auditing. Người không thuộc auditing truy vấn view, kết quả thế nào?",
    "options_vi": {
      "A": "Chỉ hiển thị các bản ghi age > 17, các bản khác bị loại",
      "B": "Các tuổi <18 trả về null, cột khác giữ nguyên",
      "C": "Toàn bộ cột age trả về null, cột khác giữ nguyên",
      "D": "Hiển thị toàn bộ bản ghi như bảng gốc",
      "E": "Chỉ hiển thị bản ghi age > 18"
    },
    "explanation_vi": "View lọc bỏ bản ghi trẻ vị thành niên; người không có quyền thấy dữ liệu bị lọc. Đáp án A.",
    "page": null,
    "image": "img/q_98.jpg"
  },
  {
    "id": 99,
    "topic": 1,
    "question": "The data governance team is reviewing code used for deleting records for compliance with GDPR. The following logic has been implemented to\npropagate delete requests from the user_lookup table to the user_aggregates table.\nAssuming that user_id is a unique identifying key and that all users that have requested deletion have been removed from the user_lookup table,\nwhich statement describes whether successfully executing the above logic guarantees that the records to be deleted from the user_aggregates\ntable are no longer accessible and why?",
    "options": {
      "A": "No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command.",
      "B": "No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data\nfiles.",
      "C": "Yes; the change data feed uses foreign keys to ensure delete consistency throughout the Lakehouse.",
      "D": "Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records.",
      "E": "No; the change data feed only tracks inserts and updates, not deleted records."
    },
    "answer": "B",
    "question_vi": "Logic xoá theo GDPR: DELETE từ user_aggregates với user_id không còn trong user_lookup. Điều này có đảm bảo dữ liệu không còn truy cập được không?",
    "options_vi": {
      "A": "Không; DELETE chỉ ACID khi đi cùng MERGE",
      "B": "Không; file chứa bản ghi xoá vẫn truy cập bằng time travel cho tới khi VACUUM dọn",
      "C": "Có; change data feed dùng FK đảm bảo nhất quán xoá",
      "D": "Có; ACID Delta đảm bảo xoá vĩnh viễn",
      "E": "Không; change data feed chỉ theo dõi insert/update"
    },
    "explanation_vi": "DELETE chỉ đánh dấu file cũ, vẫn có thể time travel tới khi VACUUM loại bỏ. Đáp án B.",
    "page": null,
    "image": "img/q_99.jpg"
  },
  {
    "id": 100,
    "topic": 1,
    "question": "The data engineering team has been tasked with configuring connections to an external database that does not have a supported native\nconnector with Databricks. The external database already has data security configured by group membership. These groups map directly to user\ngroups already created in Databricks that represent various teams within the company.\nA new login credential has been created for each group in the external database. The Databricks Utilities Secrets module will be used to make\nthese credentials available to Databricks users.\nAssuming that all the credentials are configured correctly on the external database and group membership is properly configured on Databricks,\nwhich statement describes how teams can be granted the minimum necessary access to using these credentials?",
    "options": {
      "A": "\"Manage\" permissions should be set on a secret key mapped to those credentials that will be used by a given team.",
      "B": "\"Read\" permissions should be set on a secret key mapped to those credentials that will be used by a given team.",
      "C": "\"Read\" permissions should be set on a secret scope containing only those credentials that will be used by a given team.",
      "D": "\"Manage\" permissions should be set on a secret scope containing only those credentials that will be used by a given team.\nNo additional configuration is necessary as long as all users are configured as administrators in the workspace where secrets have been\nadded."
    },
    "answer": "B",
    "question_vi": "Cấu hình kết nối DB ngoài qua Secrets cho từng nhóm. Cách cấp tối thiểu cần thiết?",
    "options_vi": {
      "A": "Cấp Manage cho từng secret key",
      "B": "Cấp Read cho secret key chứa credential của nhóm",
      "C": "Cấp Read cho secret scope chứa các credential của nhóm",
      "D": "Cấp Manage cho secret scope chứa credential",
      "E": "Không cần cấu hình thêm nếu mọi người là admin"
    },
    "explanation_vi": "Cho phép nhóm chỉ đọc đúng secret key họ dùng là tối thiểu cần thiết. Đáp án B.",
    "page": null,
    "image": "img/q_100.jpg"
  },
  {
    "id": 101,
    "topic": 1,
    "question": "Which indicators would you look for in the Spark UI’s Storage tab to signal that a cached table is not performing optimally? Assume you are using\nSpark’s MEMORY_ONLY storage level.",
    "options": {
      "A": "Size on Disk is < Size in Memory",
      "B": "The RDD Block Name includes the “*” annotation signaling a failure to cache",
      "C": "Size on Disk is > 0",
      "D": "The number of Cached Partitions > the number of Spark Partitions",
      "E": "On Heap Memory Usage is within 75% of Off Heap Memory Usage"
    },
    "answer": "C",
    "question_vi": "Trong Spark UI tab Storage (MEMORY_ONLY), dấu hiệu nào cho thấy cache không tối ưu?",
    "options_vi": {
      "A": "Size on Disk < Size in Memory",
      "B": "RDD Block Name có ký hiệu *",
      "C": "Size on Disk > 0",
      "D": "Số Cached Partitions > số Spark Partitions",
      "E": "On-heap ~75% Off-heap"
    },
    "explanation_vi": "Nếu Size on Disk > 0 nghĩa là dữ liệu bị spill hoặc không cache đủ bộ nhớ, hiệu năng không tối ưu. Đáp án C.",
    "page": null,
    "image": "img/q_101.jpg"
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
    "question_vi": "Dòng đầu tiên của notebook Python Databricks khi mở bằng text editor là gì?",
    "options_vi": {
      "A": "%python",
      "B": "// Databricks notebook source",
      "C": "# Databricks notebook source",
      "D": "-- Databricks notebook source",
      "E": "# MAGIC %python"
    },
    "explanation_vi": "Notebook được lưu dạng nguồn với dòng mở đầu comment '# Databricks notebook source'. Đáp án C.",
    "page": null,
    "image": "img/q_102.jpg"
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
    "question_vi": "Lợi ích chính của end-to-end test?",
    "options_vi": {
      "A": "Dễ tự động hóa bộ test",
      "B": "Chỉ ra lỗi ở khối xây dựng nhỏ",
      "C": "Bao phủ mọi nhánh mã",
      "D": "Mô phỏng sát cách dùng thực tế",
      "E": "Đảm bảo mã tối ưu cho quy trình"
    },
    "explanation_vi": "End-to-end mô phỏng luồng dùng thực, giúp kiểm thử hành vi toàn hệ thống. Đáp án D.",
    "page": null,
    "image": "img/q_103.jpg"
  },
  {
    "id": 104,
    "topic": 1,
    "question": "The Databricks CLI is used to trigger a run of an existing job by passing the job_id parameter. The response that the job run request has been\nsubmitted successfully includes a field run_id.\nWhich statement describes what the number alongside this field represents?",
    "options": {
      "A": "The job_id and number of times the job has been run are concatenated and returned.",
      "B": "The total number of jobs that have been run in the workspace.",
      "C": "The number of times the job definition has been run in this workspace.",
      "D": "The job_id is returned in this field.",
      "E": "The globally unique ID of the newly triggered run."
    },
    "answer": "E",
    "question_vi": "Khi gọi Databricks CLI trigger job run, phản hồi có run_id. Số này nghĩa là gì?",
    "options_vi": {
      "A": "job_id ghép số lần chạy",
      "B": "Tổng số job đã chạy trong workspace",
      "C": "Số lần job này đã chạy",
      "D": "Chính là job_id",
      "E": "ID toàn cục của lần chạy mới"
    },
    "explanation_vi": "run_id là định danh duy nhất cho lần chạy vừa được tạo. Đáp án E.",
    "page": null,
    "image": "img/q_104.jpg"
  },
  {
    "id": 105,
    "topic": 1,
    "question": "The data science team has created and logged a production model using MLflow. The model accepts a list of column names and returns a new\ncolumn of type DOUBLE.\nThe following code correctly imports the production model, loads the customers table containing the customer_id key column into a DataFrame,\nand defines the feature columns needed for the model.\nWhich code block will output a DataFrame with the schema \"customer_id LONG, predictions DOUBLE\"?",
    "options": {
      "A": "df.map(lambda x:model(x[columns])).select(\"customer_id, predictions\")",
      "B": "df.select(\"customer_id\", model(*columns).alias(\"predictions\"))",
      "C": "model.predict(df, columns)",
      "D": "df.select(\"customer_id\", pandas_udf(model, columns).alias(\"predictions\"))",
      "E": "df.apply(model, columns).select(\"customer_id, predictions\")"
    },
    "answer": "D",
    "question_vi": "Đã load model MLflow nhận danh sách cột và trả về DOUBLE; cần DataFrame schema customer_id LONG, predictions DOUBLE. Đoạn mã nào đúng?",
    "options_vi": {
      "A": "df.map(lambda x:model(x[columns])).select(\"customer_id, predictions\")",
      "B": "df.select(\"customer_id\", model(*columns).alias(\"predictions\"))",
      "C": "model.predict(df, columns)",
      "D": "df.select(\"customer_id\", pandas_udf(model, columns).alias(\"predictions\"))",
      "E": "df.apply(model, columns).select(\"customer_id, predictions\")"
    },
    "explanation_vi": "Cách phù hợp là dùng pandas_udf áp dụng model rồi chọn cột id cùng dự đoán. Đáp án D.",
    "page": null,
    "image": "img/q_105.jpg"
  },
  {
    "id": 106,
    "topic": 1,
    "question": "A nightly batch job is configured to ingest all data files from a cloud object storage container where records are stored in a nested directory\nstructure YYYY/MM/DD. The data for each date represents all records that were processed by the source system on that date, noting that some\nrecords may be delayed as they await moderator approval. Each entry represents a user review of a product and has the following schema:\nuser_id STRING, review_id BIGINT, product_id BIGINT, review_timestamp TIMESTAMP, review_text STRING\nThe ingestion job is configured to append all data for the previous date to a target table reviews_raw with an identical schema to the source\nsystem. The next step in the pipeline is a batch write to propagate all new records inserted into reviews_raw to a table where data is fully\ndeduplicated, validated, and enriched.\nWhich solution minimizes the compute costs to propagate this batch of data?",
    "options": {
      "A": "Perform a batch read on the reviews_raw table and perform an insert-only merge using the natural composite key user_id, review_id,\nproduct_id, review_timestamp.",
      "B": "Configure a Structured Streaming read against the reviews_raw table using the trigger once execution mode to process new records as a\nbatch job.",
      "C": "Use Delta Lake version history to get the difference between the latest version of reviews_raw and one version prior, then write these\nrecords to the next table.",
      "D": "Filter all records in the reviews_raw table based on the review_timestamp; batch append those records produced in the last 48 hours.",
      "E": "Reprocess all records in reviews_raw and overwrite the next table in the pipeline."
    },
    "answer": "C",
    "question_vi": "Job hàng đêm ingest dữ liệu theo thư mục ngày vào reviews_raw; cần truyền tiếp bản ghi mới sang bảng đã chuẩn hoá với chi phí thấp nhất. Giải pháp?",
    "options_vi": {
      "A": "Batch đọc reviews_raw và merge insert-only theo khóa tự nhiên",
      "B": "Dùng Structured Streaming trigger once để xử lý như batch",
      "C": "Dùng lịch sử Delta lấy chênh lệch giữa phiên bản mới nhất và trước đó rồi ghi tiếp",
      "D": "Lọc theo review_timestamp 48h gần nhất rồi append",
      "E": "Xử lý lại toàn bộ reviews_raw và overwrite"
    },
    "explanation_vi": "Lấy diff giữa hai phiên bản Delta để chỉ xử lý bản ghi mới, tiết kiệm compute. Đáp án C.",
    "page": null,
    "image": "img/q_106.jpg"
  },
  {
    "id": 107,
    "topic": 1,
    "question": "Which statement describes Delta Lake optimized writes?",
    "options": {
      "A": "Before a Jobs cluster terminates, OPTIMIZE is executed on all tables modified during the most recent job.",
      "B": "An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed\ntoward a default of 1 GB.",
      "C": "Data is queued in a messaging bus instead of committing data directly to memory; all data is committed from the messaging bus in one\nbatch once the job is complete.",
      "D": "Optimized writes use logical partitions instead of directory partitions; because partition boundaries are only represented in metadata, fewer\nsmall files are written.",
      "E": "A shuffle occurs prior to writing to try to group similar data together resulting in fewer files instead of each executor writing multiple files\nbased on directory partitions."
    },
    "answer": "E",
    "question_vi": "Phát biểu nào mô tả optimized writes của Delta Lake?",
    "options_vi": {
      "A": "Trước khi Jobs cluster tắt, chạy OPTIMIZE cho mọi bảng",
      "B": "Job bất đồng bộ chạy sau khi ghi để compact về ~1GB",
      "C": "Hàng đợi message gom dữ liệu rồi commit một lần",
      "D": "Dùng partition logic trong metadata thay cho thư mục",
      "E": "Shuffle trước khi ghi để nhóm dữ liệu giống nhau, giảm số file"
    },
    "explanation_vi": "Optimized writes shuffle dữ liệu theo partition để mỗi executor ghi ít file hơn, giảm file nhỏ. Đáp án E.",
    "page": null,
    "image": "img/q_107.jpg"
  },
  {
    "id": 108,
    "topic": 1,
    "question": "Which statement describes the default execution mode for Databricks Auto Loader?",
    "options": {
      "A": "Cloud vendor-specific queue storage and notification services are configured to track newly arriving files; the target table is materialized by\ndirectly querying all valid files in the source directory.",
      "B": "New files are identified by listing the input directory; the target table is materialized by directly querying all valid files in the source directory.",
      "C": "Webhooks trigger a Databricks job to run anytime new data arrives in a source directory; new data are automatically merged into target\ntables using rules inferred from the data.",
      "D": "New files are identified by listing the input directory; new files are incrementally and idempotently loaded into the target Delta Lake table.",
      "E": "Cloud vendor-specific queue storage and notification services are configured to track newly arriving files; new files are incrementally and\nidempotently loaded into the target Delta Lake table."
    },
    "answer": "D",
    "question_vi": "Chế độ mặc định của Databricks Auto Loader?",
    "options_vi": {
      "A": "Dùng queue/notification, truy vấn trực tiếp tất cả file hợp lệ",
      "B": "Liệt kê thư mục nguồn, truy vấn trực tiếp tất cả file hợp lệ",
      "C": "Webhook kích hoạt job và merge dữ liệu tự động",
      "D": "Liệt kê thư mục nguồn; nạp file mới gia tăng và idempotent vào Delta",
      "E": "Dùng queue/notification; nạp file mới gia tăng và idempotent"
    },
    "explanation_vi": "Mặc định Auto Loader liệt kê thư mục để phát hiện file mới và tải gia tăng vào Delta. Đáp án D.",
    "page": null,
    "image": "img/q_108.jpg"
  },
  {
    "id": 109,
    "topic": 1,
    "question": "A Delta Lake table representing metadata about content posts from users has the following schema:\nuser_id LONG, post_text STRING, post_id STRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE\nBased on the above schema, which column is a good candidate for partitioning the Delta Table?",
    "options": {
      "A": "post_time",
      "B": "latitude",
      "C": "post_id",
      "D": "user_id",
      "E": "date"
    },
    "answer": "E",
    "question_vi": "Bảng Delta chứa metadata bài viết (user_id, post_text, post_id, longitude, latitude, post_time, date). Cột nào nên partition?",
    "options_vi": {
      "A": "post_time",
      "B": "latitude",
      "C": "post_id",
      "D": "user_id",
      "E": "date"
    },
    "explanation_vi": "Partition theo trường ngày (date) giúp phân vùng thời gian hợp lý và kích thước vừa. Đáp án E.",
    "page": null,
    "image": "img/q_109.jpg"
  },
  {
    "id": 110,
    "topic": 1,
    "question": "A large company seeks to implement a near real-time solution involving hundreds of pipelines with parallel updates of many tables with extremely\nhigh volume and high velocity data.\nWhich of the following solutions would you implement to achieve this requirement?",
    "options": {
      "A": "Use Databricks High Concurrency clusters, which leverage optimized cloud storage connections to maximize data throughput.",
      "B": "Partition ingestion tables by a small time duration to allow for many data files to be written in parallel.",
      "C": "Configure Databricks to save all data to attached SSD volumes instead of object storage, increasing file I/O significantly.",
      "D": "Isolate Delta Lake tables in their own storage containers to avoid API limits imposed by cloud vendors.",
      "E": "Store all tables in a single database to ensure that the Databricks Catalyst Metastore can load balance overall throughput."
    },
    "answer": "B",
    "question_vi": "Hàng trăm pipeline cập nhật song song, dữ liệu rất lớn và nhanh. Giải pháp?",
    "options_vi": {
      "A": "Dùng High Concurrency cluster tối ưu kết nối lưu trữ",
      "B": "Partition bảng ingest theo lát thời gian nhỏ để ghi song song nhiều file",
      "C": "Lưu vào SSD gắn thay vì object storage",
      "D": "Tách Delta table sang container riêng để tránh giới hạn API",
      "E": "Lưu tất cả bảng trong một database để Catalyst load balance"
    },
    "explanation_vi": "Chia nhỏ partition theo thời gian giúp ghi song song nhiều file, đáp ứng throughput cao. Đáp án B.",
    "page": null,
    "image": "img/q_110.jpg"
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
    "question_vi": "Cách cài gói Python phạm vi notebook cho tất cả node trong cluster đang chạy?",
    "options_vi": {
      "A": "Chạy source env/bin/activate trong setup script",
      "B": "Dùng %b trong ô notebook",
      "C": "Dùng %pip install trong ô notebook",
      "D": "Dùng %sh pip install trong ô notebook",
      "E": "Cài qua UI thư viện PyPI"
    },
    "explanation_vi": "Chạy %sh pip install trong notebook sẽ cài đặt lên tất cả node của cluster cho phạm vi notebook. Đáp án D.",
    "page": null,
    "image": "img/q_111.jpg"
  },
  {
    "id": 112,
    "topic": 1,
    "question": "Each configuration below is identical to the extent that each cluster has 400 GB total of RAM 160 total cores and only one Executor per VM.\nGiven an extremely long-running job for which completion must be guaranteed, which cluster configuration will be able to guarantee completion of\nthe job in light of one or more VM failures?",
    "options": {
      "A": "• Total VMs: 8\n• 50 GB per Executor\n• 20 Cores / Executor",
      "B": "• Total VMs: 16\n• 25 GB per Executor\n• 10 Cores / Executor",
      "C": "• Total VMs: 1\n• 400 GB per Executor\n• 160 Cores/Executor",
      "D": "• Total VMs: 4\n• 100 GB per Executor\n• 40 Cores / Executor",
      "E": "• Total VMs: 2\n• 200 GB per Executor\n• 80 Cores / Executor"
    },
    "answer": "D",
    "question_vi": "4 cấu hình cluster, mỗi cấu hình tổng 400 GB RAM và 160 core, 1 executor/VM. Job rất dài cần đảm bảo hoàn tất khi một hoặc nhiều VM hỏng; cấu hình nào đáp ứng?",
    "options_vi": {
      "A": "8 VM, 50 GB, 20 core mỗi executor",
      "B": "16 VM, 25 GB, 10 core",
      "C": "1 VM, 400 GB, 160 core",
      "D": "4 VM, 100 GB, 40 core",
      "E": "2 VM, 200 GB, 80 core"
    },
    "explanation_vi": "Có nhiều VM để dự phòng lỗi; 4 VM vẫn chạy được nếu mất 1-2, hơn cấu hình 1 hoặc 2 VM. Đáp án D.",
    "page": null,
    "image": "img/q_112.jpg"
  },
  {
    "id": 113,
    "topic": 1,
    "question": "A Delta Lake table in the Lakehouse named customer_churn_params is used in churn prediction by the machine learning team. The table contains\ninformation about customers derived from a number of upstream sources. Currently, the data engineering team populates this table nightly by\noverwriting the table with the current valid values derived from upstream data sources.\nImmediately after each update succeeds, the data engineering team would like to determine the difference between the new version and the\nprevious version of the table.\nGiven the current implementation, which method can be used?",
    "options": {
      "A": "Execute a query to calculate the difference between the new version and the previous version using Delta Lake’s built-in versioning and lime\ntravel functionality.",
      "B": "Parse the Delta Lake transaction log to identify all newly written data files.",
      "C": "Parse the Spark event logs to identify those rows that were updated, inserted, or deleted.",
      "D": "Execute DESCRIBE HISTORY customer_churn_params to obtain the full operation metrics for the update, including a log of all records that\nhave been added or modified.",
      "E": "Use Delta Lake’s change data feed to identify those records that have been updated, inserted, or deleted."
    },
    "answer": "E",
    "question_vi": "Bảng Delta Lake customer_churn_params được dùng cho mô hình dự đoán rời bỏ khách hàng. Mỗi đêm bảng được ghi đè toàn bộ bằng giá trị hợp lệ mới từ upstream. Ngay sau mỗi lần cập nhật, team muốn biết những khác biệt giữa phiên bản mới và phiên bản trước.",
    "options_vi": {
      "A": "Chạy truy vấn so sánh hai phiên bản bằng tính năng phiên bản và time travel của Delta Lake.",
      "B": "Phân tích transaction log của Delta Lake để tìm các file dữ liệu mới ghi.",
      "C": "Phân tích Spark event logs để tìm các dòng được cập nhật, chèn hoặc xóa.",
      "D": "Chạy DESCRIBE HISTORY customer_churn_params để lấy đầy đủ số liệu thao tác, gồm log mọi bản ghi đã thêm hoặc sửa.",
      "E": "Dùng Change Data Feed của Delta Lake để nhận ra các bản ghi đã cập nhật, chèn hoặc xóa."
    },
    "explanation_vi": "Vì bảng đang bị ghi đè hoàn toàn, cách đơn giản nhất để lấy phần thay đổi giữa hai phiên bản là dùng Change Data Feed (CDF) của Delta để lấy ra các bản ghi insert/update/delete kể từ phiên bản trước. Time travel hay HISTORY không cung cấp chênh lệch dòng chi tiết.",
    "page": null,
    "image": "img/q_113.jpg"
  },
  {
    "id": 114,
    "topic": 1,
    "question": "A data team’s Structured Streaming job is configured to calculate running aggregates for item sales to update a downstream marketing\ndashboard. The marketing team has introduced a new promotion, and they would like to add a new field to track the number of times this\npromotion code is used for each item. A junior data engineer suggests updating the existing query as follows. Note that proposed changes are in\nbold.\nOriginal query:\nProposed query:\nWhich step must also be completed to put the proposed query into production?",
    "options": {
      "A": "Specify a new checkpointLocation",
      "B": "Remove .option('mergeSchema', 'true') from the streaming write",
      "C": "Increase the shuffle partitions to account for additional aggregates",
      "D": "Run REFRESH TABLE delta.‛/item_agg‛"
    },
    "answer": "A",
    "question_vi": "Job Structured Streaming tính số liệu cộng dồn bán hàng. Cần thêm trường đếm số lần dùng mã khuyến mãi và cập nhật truy vấn. Để triển khai bản truy vấn mới, bước nào còn phải làm thêm?",
    "options_vi": {
      "A": "Chỉ định checkpointLocation mới",
      "B": "Bỏ .option('mergeSchema', 'true') khỏi streaming write",
      "C": "Tăng số shuffle partitions để phục vụ thêm phép gộp",
      "D": "Chạy REFRESH TABLE delta.'/item_agg'"
    },
    "explanation_vi": "Khi thay đổi luồng ghi (schema/logic) cần dùng checkpoint mới để tránh đọc trạng thái cũ không tương thích. Nếu giữ checkpoint cũ, streaming state có thể hỏng. Vì thế phải đặt checkpointLocation mới trước khi đưa vào production.",
    "page": null,
    "image": "img/q_114.jpg"
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
    "question_vi": "Khi dùng CLI hoặc REST API lấy kết quả từ job nhiều task, mô tả nào đúng về cấu trúc phản hồi?",
    "options_vi": {
      "A": "Mỗi lần chạy job có job_id duy nhất; mọi task trong job có job_id duy nhất",
      "B": "Mỗi lần chạy job có job_id duy nhất; mọi task trong job có task_id duy nhất",
      "C": "Mỗi lần chạy job có orchestration_id duy nhất; mọi task có run_id duy nhất",
      "D": "Mỗi lần chạy job có run_id duy nhất; mọi task trong job có task_id duy nhất",
      "E": "Mỗi lần chạy job có run_id duy nhất; mọi task cũng có run_id duy nhất"
    },
    "explanation_vi": "Một lần chạy job có run_id riêng; bên trong, mỗi task có task_id riêng trong payload. run_id không thay cho từng task. Vì vậy mô tả đúng là run_id cho job và task_id cho từng task.",
    "page": null,
    "image": "img/q_115.jpg"
  },
  {
    "id": 116,
    "topic": 1,
    "question": "The data engineering team is configuring environments for development, testing, and production before beginning migration on a new data\npipeline. The team requires extensive testing on both the code and data resulting from code execution, and the team wants to develop and test\nagainst data as similar to production data as possible.\nA junior data engineer suggests that production data can be mounted to the development and testing environments, allowing pre-production code\nto execute against production data. Because all users have admin privileges in the development environment, the junior data engineer has offered\nto configure permissions and mount this data for the team.\nWhich statement captures best practices for this situation?",
    "options": {
      "A": "All development, testing, and production code and data should exist in a single, unified workspace; creating separate environments for\ntesting and development complicates administrative overhead.",
      "B": "In environments where interactive code will be executed, production data should only be accessible with read permissions; creating\nisolated databases for each environment further reduces risks.",
      "C": "As long as code in the development environment declares USE dev_db at the top of each notebook, there is no possibility of inadvertently\ncommitting changes back to production data sources.",
      "D": "Because Delta Lake versions all data and supports time travel, it is not possible for user error or malicious actors to permanently delete\nproduction data; as such, it is generally safe to mount production data anywhere.",
      "E": "Because access to production data will always be verified using passthrough credentials, it is safe to mount data to any Databricks\ndevelopment environment."
    },
    "answer": "B",
    "question_vi": "Đang cấu hình môi trường dev/test/prod cho pipeline mới. Muốn test trên dữ liệu gần giống production. Một kỹ sư junior đề xuất mount dữ liệu production vào dev/test và cấu hình quyền. Thực hành tốt nhất là gì?",
    "options_vi": {
      "A": "Để code và dữ liệu dev/test/prod chung một workspace; tách môi trường làm tăng quản trị.",
      "B": "Ở môi trường interactive, dữ liệu production chỉ nên cấp quyền đọc; tách database riêng cho từng môi trường để giảm rủi ro.",
      "C": "Chỉ cần USE dev_db ở đầu notebook thì không thể ghi nhầm lên production.",
      "D": "Vì Delta version và time travel, không thể xóa nhầm vĩnh viễn nên có thể mount ở bất kỳ đâu.",
      "E": "Vì luôn xác thực bằng passthrough, có thể mount data vào bất kỳ môi trường dev nào."
    },
    "explanation_vi": "Production data trong môi trường interactive cần khóa ghi để tránh rủi ro. Mỗi môi trường nên có database/đường mount riêng biệt. Do đó chọn phương án chỉ cho phép read và tách database giữa các môi trường.",
    "page": null,
    "image": "img/q_116.jpg"
  },
  {
    "id": 117,
    "topic": 1,
    "question": "A data engineer, User A, has promoted a pipeline to production by using the REST API to programmatically create several jobs. A DevOps engineer,\nUser B, has configured an external orchestration tool to trigger job runs through the REST API. Both users authorized the REST API calls using their\npersonal access tokens.\nA workspace admin, User C, inherits responsibility for managing this pipeline. User C uses the Databricks Jobs UI to take \"Owner\" privileges of\neach job. Jobs continue to be triggered using the credentials and tooling configured by User B.\nAn application has been configured to collect and parse run information returned by the REST API. Which statement describes the value returned\nin the creator_user_name field?",
    "options": {
      "A": "Once User C takes \"Owner\" privileges, their email address will appear in this field; prior to this, User A’s email address will appear in this\nfield.",
      "B": "User B’s email address will always appear in this field, as their credentials are always used to trigger the run.",
      "C": "User A’s email address will always appear in this field, as they still own the underlying notebooks.",
      "D": "Once User C takes \"Owner\" privileges, their email address will appear in this field; prior to this, User B’s email address will appear in this\nfield.",
      "E": "User C will only ever appear in this field if they manually trigger the job, otherwise it will indicate User B."
    },
    "answer": "C",
    "question_vi": "User A tạo job qua REST API; User B (DevOps) trigger chạy job qua REST bằng token cá nhân. Admin User C giành quyền Owner trong UI nhưng job vẫn được kích bởi công cụ của User B. Trường creator_user_name trong phản hồi REST sẽ là gì?",
    "options_vi": {
      "A": "Sau khi User C làm Owner, email của C hiện; trước đó là email A.",
      "B": "Luôn là email của User B vì dùng credential của B để trigger.",
      "C": "Luôn là email của User A vì họ vẫn sở hữu notebook gốc.",
      "D": "Sau khi C làm Owner, trường này là email C; trước đó là email B.",
      "E": "Chỉ hiện User C nếu họ tự chạy job; nếu không sẽ là User B."
    },
    "explanation_vi": "creator_user_name phản ánh người tạo run gốc (owner của job/notebook), không phải người trigger. Ownership của C không thay đổi trường này; token trigger không thay đổi creator. Vì notebook thuộc A, giá trị sẽ là A.",
    "page": null,
    "image": "img/q_117.jpg"
  },
  {
    "id": 118,
    "topic": 1,
    "question": "A member of the data engineering team has submitted a short notebook that they wish to schedule as part of a larger data pipeline. Assume that\nthe commands provided below produce the logically correct results when run as presented.\nWhich command should be removed from the notebook before scheduling it as a job?",
    "options": {
      "A": "Cmd 2",
      "B": "Cmd 3",
      "C": "Cmd 4",
      "D": "Cmd 5"
    },
    "answer": "D",
    "question_vi": "Một notebook ngắn muốn lên lịch thành job. Lệnh nào nên bỏ trước khi lập lịch (giả sử logic đúng)?",
    "options_vi": {
      "A": "Cmd 2",
      "B": "Cmd 3",
      "C": "Cmd 4",
      "D": "Cmd 5"
    },
    "explanation_vi": "Trong job, các lệnh hiển thị (ví dụ display/plot ở cuối – thường là Cmd 5) không cần thiết và có thể gây lỗi khi chạy headless. Do đó bỏ Cmd 5 trước khi schedule.",
    "page": null,
    "image": "img/q_118.jpg"
  },
  {
    "id": 119,
    "topic": 1,
    "question": "Which statement regarding Spark configuration on the Databricks platform is true?",
    "options": {
      "A": "The Databricks REST API can be used to modify the Spark configuration properties for an interactive cluster without interrupting jobs\ncurrently running on the cluster.",
      "B": "Spark configurations set within a notebook will affect all SparkSessions attached to the same interactive cluster.",
      "C": "When the same Spark configuration property is set for an interactive cluster and a notebook attached to that cluster, the notebook setting\nwill always be ignored.",
      "D": "Spark configuration properties set for an interactive cluster with the Clusters UI will impact all notebooks attached to that cluster."
    },
    "answer": "D",
    "question_vi": "Phát biểu nào về cấu hình Spark trên Databricks là đúng?",
    "options_vi": {
      "A": "REST API có thể chỉnh cấu hình Spark của interactive cluster mà không gián đoạn job đang chạy.",
      "B": "Cấu hình Spark set trong notebook sẽ ảnh hưởng tất cả SparkSession gắn vào cùng interactive cluster.",
      "C": "Nếu cấu hình cùng khóa ở cluster và notebook, thiết lập notebook luôn bị bỏ qua.",
      "D": "Cấu hình Spark đặt trong Clusters UI cho interactive cluster sẽ áp dụng cho mọi notebook gắn vào cluster đó."
    },
    "explanation_vi": "Cấu hình đặt ở cấp cluster (qua UI) là mặc định cho mọi notebook gắn vào cluster đó. Các thiết lập trong notebook chỉ ảnh hưởng session của notebook. Vì vậy phát biểu đúng là phương án D.",
    "page": null,
    "image": "img/q_119.jpg"
  },
  {
    "id": 120,
    "topic": 1,
    "question": "The business reporting team requires that data for their dashboards be updated every hour. The total processing time for the pipeline that\nextracts, transforms, and loads the data for their pipeline runs in 10 minutes.\nAssuming normal operating conditions, which configuration will meet their service-level agreement requirements with the lowest cost?",
    "options": {
      "A": "Configure a job that executes every time new data lands in a given directory",
      "B": "Schedule a job to execute the pipeline once an hour on a new job cluster",
      "C": "Schedule a Structured Streaming job with a trigger interval of 60 minutes",
      "D": "Schedule a job to execute the pipeline once an hour on a dedicated interactive cluster"
    },
    "answer": "B",
    "question_vi": "Dashboard cần cập nhật dữ liệu mỗi giờ; pipeline ETL mất 10 phút. Cấu hình nào đáp ứng SLA với chi phí thấp nhất?",
    "options_vi": {
      "A": "Chạy job mỗi khi có file mới tới thư mục",
      "B": "Lên lịch job chạy mỗi giờ trên job cluster mới",
      "C": "Dùng Structured Streaming với trigger 60 phút",
      "D": "Lên lịch job mỗi giờ trên interactive cluster chuyên dụng"
    },
    "explanation_vi": "Job cluster tạo khi cần và tắt sau khi xong giúp tiết kiệm chi phí so với cluster thường trực. Lịch chạy mỗi giờ đáp ứng SLA 10 phút xử lý/60 phút yêu cầu. Do đó chọn job cluster theo lịch (B).",
    "page": null,
    "image": "img/q_120.jpg"
  },
  {
    "id": 121,
    "topic": 1,
    "question": "A Databricks SQL dashboard has been configured to monitor the total number of records present in a collection of Delta Lake tables using the\nfollowing query pattern:\nSELECT COUNT (*) FROM table -\nWhich of the following describes how results are generated each time the dashboard is updated?",
    "options": {
      "A": "The total count of rows is calculated by scanning all data files",
      "B": "The total count of rows will be returned from cached results unless REFRESH is run",
      "C": "The total count of records is calculated from the Delta transaction logs",
      "D": "The total count of records is calculated from the parquet file metadata"
    },
    "answer": "A",
    "question_vi": "Dashboard SQL đếm số bản ghi từ các bảng Delta bằng mẫu SELECT COUNT(*). Kết quả được tạo thế nào mỗi lần làm mới?",
    "options_vi": {
      "A": "Đếm tổng số hàng bằng cách quét tất cả file dữ liệu",
      "B": "Trả về kết quả cache trừ khi chạy REFRESH",
      "C": "Đếm từ transaction log của Delta",
      "D": "Đếm từ metadata file Parquet"
    },
    "explanation_vi": "COUNT(*) trên Delta/Parquet sẽ scan toàn bộ file (hoặc dùng thống kê nếu có, nhưng mặc định phải scan). Không tự dùng log hay cache. Vì vậy mô tả đúng là quét file dữ liệu.",
    "page": null,
    "image": "img/q_121.jpg"
  },
  {
    "id": 122,
    "topic": 1,
    "question": "A Delta Lake table was created with the below query:\nConsider the following query:\nDROP TABLE prod.sales_by_store -\nIf this statement is executed by a workspace admin, which result will occur?",
    "options": {
      "A": "Data will be marked as deleted but still recoverable with Time Travel.",
      "B": "The table will be removed from the catalog but the data will remain in storage.",
      "C": "The table will be removed from the catalog and the data will be deleted.",
      "D": "An error will occur because Delta Lake prevents the deletion of production data."
    },
    "answer": "B",
    "question_vi": "Bảng Delta tạo bằng lệnh cho sẵn. Nếu admin chạy DROP TABLE prod.sales_by_store thì kết quả?",
    "options_vi": {
      "A": "Dữ liệu được đánh dấu xóa nhưng vẫn khôi phục bằng Time Travel",
      "B": "Bảng bị xóa khỏi catalog nhưng dữ liệu còn trong storage",
      "C": "Bảng bị xóa khỏi catalog và dữ liệu cũng bị xóa",
      "D": "Lỗi vì Delta ngăn xóa dữ liệu production"
    },
    "explanation_vi": "DROP TABLE trong Delta chỉ gỡ đăng ký khỏi metastore; dữ liệu dưới DBFS/Cloud vẫn còn cho tới khi chạy VACUUM hoặc xóa thủ công. Do đó phương án B.",
    "page": null,
    "image": "img/q_122.jpg"
  },
  {
    "id": 123,
    "topic": 1,
    "question": "A developer has successfully configured their credentials for Databricks Repos and cloned a remote Git repository. They do not have privileges to\nmake changes to the main branch, which is the only branch currently visible in their workspace.\nWhich approach allows this user to share their code updates without the risk of overwriting the work of their teammates?",
    "options": {
      "A": "Use Repos to create a new branch, commit all changes, and push changes to the remote Git repository.",
      "B": "Use Repos to create a fork of the remote repository, commit all changes, and make a pull request on the source repository.",
      "C": "Use Repos to pull changes from the remote Git repository; commit and push changes to a branch that appeared as changes were pulled.",
      "D": "Use Repos to merge all differences and make a pull request back to the remote repository."
    },
    "answer": "A",
    "question_vi": "Dev đã clone repo nhưng không có quyền push main. Cách nào chia sẻ code mà không ghi đè đồng đội?",
    "options_vi": {
      "A": "Tạo branch mới trong Repos, commit và push branch lên remote.",
      "B": "Fork repo bằng Repos rồi pull request vào nguồn.",
      "C": "Pull từ remote; commit và push vào branch xuất hiện khi pull.",
      "D": "Merge tất cả khác biệt rồi pull request về remote."
    },
    "explanation_vi": "Thực hành chuẩn là tạo branch riêng, commit/push lên remote, sau đó tạo PR. Cách này không chạm vào main của team. Do đó chọn A.",
    "page": null,
    "image": "img/q_123.jpg"
  },
  {
    "id": 124,
    "topic": 1,
    "question": "The security team is exploring whether or not the Databricks secrets module can be leveraged for connecting to an external database.\nAfter testing the code with all Python variables being defined with strings, they upload the password to the secrets module and configure the\ncorrect permissions for the currently active user. They then modify their code to the following (leaving all other variables unchanged).\nWhich statement describes what will happen when the above code is executed?",
    "options": {
      "A": "The connection to the external table will succeed; the string \"REDACTED\" will be printed.",
      "B": "An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the encoded\npassword will be saved to DBFS.",
      "C": "An interactive input box will appear in the notebook; if the right password is provided, the connection will succeed and the password will be\nprinted in plain text.",
      "D": "The connection to the external table will succeed; the string value of password will be printed in plain text."
    },
    "answer": "A",
    "question_vi": "Team bảo mật thử dùng secrets để kết nối DB ngoài. Sau khi lưu mật khẩu vào secrets và chạy code với dbutils.secrets.get(...), chuyện gì xảy ra?",
    "options_vi": {
      "A": "Kết nối thành công; chuỗi \"REDACTED\" được in ra.",
      "B": "Hiện hộp nhập; nhập đúng thì kết nối thành công và mật khẩu được lưu lên DBFS đã mã hóa.",
      "C": "Hiện hộp nhập; nhập đúng thì kết nối thành công và mật khẩu in ra dạng plain text.",
      "D": "Kết nối thành công; giá trị password được in plain text."
    },
    "explanation_vi": "dbutils.secrets.get trả về giá trị bí mật nhưng khi print sẽ hiển thị \"REDACTED\" để tránh lộ. Kết nối vẫn dùng giá trị thực nên thành công. Vì vậy phương án A.",
    "page": null,
    "image": "img/q_124.jpg"
  },
  {
    "id": 125,
    "topic": 1,
    "question": "The data science team has created and logged a production model using MLflow. The model accepts a list of column names and returns a new\ncolumn of type DOUBLE.\nThe following code correctly imports the production model, loads the customers table containing the customer_id key column into a DataFrame,\nand defines the feature columns needed for the model.\nWhich code block will output a DataFrame with the schema \"customer_id LONG, predictions DOUBLE\"?",
    "options": {
      "A": "df.map(lambda x:model(x[columns])).select(\"customer_id, predictions\")",
      "B": "df.select(\"customer_id\",\nmodel(*columns).alias(\"predictions\"))",
      "C": "model.predict(df, columns)",
      "D": "df.apply(model, columns).select(\"customer_id, predictions\")"
    },
    "answer": "B",
    "question_vi": "Model MLflow nhận danh sách cột và trả về cột DOUBLE. Code đã tải model và DataFrame customers. Khối code nào trả về DataFrame schema \"customer_id LONG, predictions DOUBLE\"?",
    "options_vi": {
      "A": "df.map(lambda x:model(x[columns])).select(\"customer_id, predictions\")",
      "B": "df.select(\"customer_id\",\nmodel(*columns).alias(\"predictions\"))",
      "C": "model.predict(df, columns)",
      "D": "df.apply(model, columns).select(\"customer_id, predictions\")"
    },
    "explanation_vi": "Cần tạo cột dự đoán bằng cách gọi UDF/model trên các cột rồi chọn cùng customer_id. Option B dùng select với customer_id và model(*columns).alias(\"predictions\"), đúng định dạng mong muốn.",
    "page": null,
    "image": "img/q_125.jpg"
  },
  {
    "id": 126,
    "topic": 1,
    "question": "A junior member of the data engineering team is exploring the language interoperability of Databricks notebooks. The intended outcome of the\nbelow code is to register a view of all sales that occurred in countries on the continent of Africa that appear in the geo_lookup table.\nBefore executing the code, running SHOW TABLES on the current database indicates the database contains only two tables: geo_lookup and\nsales.\nWhat will be the outcome of executing these command cells m order m an interactive notebook?",
    "options": {
      "A": "Both commands will succeed. Executing SHOW TABLES will show that countries_af and sales_af have been registered as views.",
      "B": "Cmd 1 will succeed. Cmd 2 will search all accessible databases for a table or view named countries_af: if this entity exists, Cmd 2 will\nsucceed.",
      "C": "Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable representing a PySpark DataFrame.",
      "D": "Cmd 1 will succeed and Cmd 2 will fail. countries_af will be a Python variable containing a list of strings."
    },
    "answer": "D",
    "question_vi": "Thử tương tác đa ngôn ngữ notebook. Cmd 1 tạo countries_af bằng Spark SQL; Cmd 2 cố đăng ký sales_af bằng Python. Kết quả thế nào?",
    "options_vi": {
      "A": "Cả hai lệnh thành công; SHOW TABLES thấy countries_af và sales_af view.",
      "B": "Cmd1 thành công; Cmd2 sẽ tìm ở mọi database một bảng/view tên countries_af, nếu có thì thành công.",
      "C": "Cmd1 thành công, Cmd2 thất bại; countries_af là biến PySpark DataFrame.",
      "D": "Cmd1 thành công, Cmd2 thất bại; countries_af là biến Python chứa danh sách chuỗi."
    },
    "explanation_vi": "SQL cell tạo view countries_af; trong Python cell, countries_af là DataFrame chứ không phải tên bảng, nên spark.table('countries_af') không tồn tại -> lỗi. Đáp án tương ứng C/D? Ở đề, kết quả đúng là D vì countries_af trong Python được coi là list string? Thực tế kết quả đúng theo đề: Cmd1 succeed, Cmd2 fail, countries_af là biến Python list (collect()). Do đó chọn D.",
    "page": null,
    "image": "img/q_126.jpg"
  },
  {
    "id": 127,
    "topic": 1,
    "question": "The data science team has requested assistance in accelerating queries on free-form text from user reviews. The data is currently stored in\nParquet with the below schema:\nitem_id INT, user_id INT, review_id INT, rating FLOAT, review STRING\nThe review column contains the full text of the review left by the user. Specifically, the data science team is looking to identify if any of 30 key\nwords exist in this field.\nA junior data engineer suggests converting this data to Delta Lake will improve query performance.\nWhich response to the junior data engineer’s suggestion is correct?",
    "options": {
      "A": "Delta Lake statistics are not optimized for free text fields with high cardinality.",
      "B": "Delta Lake statistics are only collected on the first 4 columns in a table.",
      "C": "ZORDER ON review will need to be run to see performance gains.",
      "D": "The Delta log creates a term matrix for free text fields to support selective filtering."
    },
    "answer": "A",
    "question_vi": "Team khoa học dữ liệu muốn tăng tốc truy vấn free-text trong cột review (chuỗi dài, nhiều từ). Junior đề xuất chuyển sang Delta để nhanh hơn. Phản hồi đúng?",
    "options_vi": {
      "A": "Thống kê Delta không tối ưu cho trường văn bản tự do có độ phân biệt cao.",
      "B": "Thống kê Delta chỉ thu thập trên 4 cột đầu.",
      "C": "Cần chạy ZORDER ON review mới có cải thiện.",
      "D": "Delta log tạo ma trận thuật ngữ cho trường text để lọc chọn lọc."
    },
    "explanation_vi": "Delta stats hữu ích với cột phân bố có thể cắt lọc; với văn bản tự do, cardinality rất cao nên không giúp nhiều. Chuyển sang Delta không tự tối ưu. Vì vậy câu A.",
    "page": null,
    "image": "img/q_127.jpg"
  },
  {
    "id": 128,
    "topic": 1,
    "question": "The data engineering team has configured a job to process customer requests to be forgotten (have their data deleted). All user data that needs\nto be deleted is stored in Delta Lake tables using default table settings.\nThe team has decided to process all deletions from the previous week as a batch job at 1am each Sunday. The total duration of this job is less\nthan one hour. Every Monday at 3am, a batch job executes a series of VACUUM commands on all Delta Lake tables throughout the organization.\nThe compliance officer has recently learned about Delta Lake's time travel functionality. They are concerned that this might allow continued\naccess to deleted data.\nAssuming all delete logic is correctly implemented, which statement correctly addresses this concern?",
    "options": {
      "A": "Because the VACUUM command permanently deletes all files containing deleted records, deleted records may be accessible with time\ntravel for around 24 hours.",
      "B": "Because the default data retention threshold is 24 hours, data files containing deleted records will be retained until the VACUUM job is run\nthe following day.",
      "C": "Because the default data retention threshold is 7 days, data files containing deleted records will be retained until the VACUUM job is run 8\ndays later.",
      "D": "Because Delta Lake's delete statements have ACID guarantees, deleted records will be permanently purged from all storage systems as\nsoon as a delete job completes."
    },
    "answer": "C",
    "question_vi": "Job xóa dữ liệu khách hàng hàng tuần (chạy Chủ nhật 1h), bảng Delta mặc định. VACUUM chạy mỗi thứ Hai 3h. Officer lo time travel còn truy cập được dữ liệu đã xóa.",
    "options_vi": {
      "A": "VACUUM xóa file nên dữ liệu chỉ truy cập qua time travel khoảng 24h.",
      "B": "Vì ngưỡng giữ dữ liệu mặc định 24h, file chứa bản ghi xóa giữ đến VACUUM hôm sau.",
      "C": "Vì mặc định giữ 7 ngày, file chứa bản ghi xóa sẽ được giữ tới khi VACUUM sau 8 ngày.",
      "D": "DELETE của Delta có ACID nên dữ liệu bị xóa ngay khỏi mọi hệ thống lưu trữ."
    },
    "explanation_vi": "Delta mặc định giữ file 7 ngày trước khi VACUUM có thể dọn. VACUUM chạy thứ Hai (≈1 ngày) không vượt ngưỡng nên không xóa được; cần 7 ngày. Do đó dữ liệu xóa vẫn tồn tại ~7-8 ngày. Đáp án C.",
    "page": null,
    "image": "img/q_128.jpg"
  },
  {
    "id": 129,
    "topic": 1,
    "question": "Assuming that the Databricks CLI has been installed and configured correctly, which Databricks CLI command can be used to upload a custom\nPython Wheel to object storage mounted with the DBFS for use with a production job?",
    "options": {
      "A": "configure",
      "B": "fs",
      "C": "workspace",
      "D": "libraries"
    },
    "answer": "B",
    "question_vi": "CLI Databricks đã cấu hình; lệnh nào dùng để upload Wheel tùy chỉnh lên object storage mount với DBFS cho job?",
    "options_vi": {
      "A": "configure",
      "B": "fs",
      "C": "workspace",
      "D": "libraries"
    },
    "explanation_vi": "Tải file lên DBFS dùng nhóm lệnh `fs` (hoặc `dbfs`). Đây là subcommand thích hợp để copy wheel vào storage. Vì vậy chọn B.",
    "page": null,
    "image": "img/q_129.jpg"
  },
  {
    "id": 130,
    "topic": 1,
    "question": "The following table consists of items found in user carts within an e-commerce website.\nThe following MERGE statement is used to update this table using an updates view, with schema evolution enabled on this table.\nHow would the following update be handled?",
    "options": {
      "A": "The update throws an error because changes to existing columns in the target schema are not supported.",
      "B": "The new nested Field is added to the target schema, and dynamically read as NULL for existing unmatched records.",
      "C": "The update is moved to a separate \"rescued\" column because it is missing a column expected in the target schema.",
      "D": "The new nested field is added to the target schema, and files underlying existing records are updated to include NULL values for the new\nfield."
    },
    "answer": "B",
    "question_vi": "Bảng cart items; MERGE với schema evolution bật, thêm field lồng mới trong bản cập nhật. Xử lý ra sao?",
    "options_vi": {
      "A": "Lỗi vì không hỗ trợ đổi schema cột hiện hữu.",
      "B": "Field lồng mới được thêm vào schema, các bản ghi cũ đọc ra NULL nếu không có giá trị khớp.",
      "C": "Bản ghi cập nhật bị đưa vào cột \"rescued\" vì thiếu cột mong đợi.",
      "D": "Field mới thêm vào schema và file cũ được cập nhật để thêm giá trị NULL."
    },
    "explanation_vi": "Schema evolution thêm cột mới, bản ghi cũ vẫn giữ nguyên file (không rewrite), đọc ra NULL. Vì vậy phương án B đúng nhất.",
    "page": null,
    "image": "img/q_130.jpg"
  },
  {
    "id": 131,
    "topic": 1,
    "question": "An upstream system is emitting change data capture (CDC) logs that are being written to a cloud object storage directory. Each record in the log\nindicates the change type (insert, update, or delete) and the values for each field after the change. The source table has a primary key identified by\nthe field pk_id.\nFor auditing purposes, the data governance team wishes to maintain a full record of all values that have ever been valid in the source system. For\nanalytical purposes, only the most recent value for each record needs to be recorded. The Databricks job to ingest these records occurs once per\nhour, but each individual record may have changed multiple times over the course of an hour.\nWhich solution meets these requirements?",
    "options": {
      "A": "Iterate through an ordered set of changes to the table, applying each in turn to create the current state of the table, (insert, update, delete),\ntimestamp of change, and the values.",
      "B": "Use merge into to insert, update, or delete the most recent entry for each pk_id into a table, then propagate all changes throughout the\nsystem.",
      "C": "Deduplicate records in each batch by pk_id and overwrite the target table.",
      "D": "Use Delta Lake’s change data feed to automatically process CDC data from an external system, propagating all changes to all dependent\ntables in the Lakehouse."
    },
    "answer": "A",
    "question_vi": "Nguồn CDC log ghi loại thay đổi và giá trị sau thay đổi, khóa chính pk_id. Cần lưu lịch sử đầy đủ và trạng thái hiện tại. Job chạy mỗi giờ, một pk có thể đổi nhiều lần trong giờ.",
    "options_vi": {
      "A": "Duyệt tập thay đổi theo thứ tự thời gian, áp dụng từng thay đổi để tạo trạng thái hiện tại và lưu loại thay đổi, timestamp, giá trị.",
      "B": "Dùng MERGE để chèn/cập nhật/xóa bản ghi pk_id mới nhất rồi truyền toàn bộ thay đổi.",
      "C": "Khử trùng lặp từng batch theo pk_id và overwrite bảng đích.",
      "D": "Dùng Change Data Feed của Delta để tự động xử lý CDC từ hệ thống ngoài và lan truyền mọi thay đổi."
    },
    "explanation_vi": "Để giữ đầy đủ lịch sử và trạng thái hiện tại, cần áp dụng tuần tự từng thay đổi (theo thời gian) và ghi lại loại thay đổi, timestamp và giá trị. Như vậy vừa có lịch sử, vừa có bản mới nhất. Đó là phương án A.",
    "page": null,
    "image": "img/q_131.jpg"
  },
  {
    "id": 132,
    "topic": 1,
    "question": "An hourly batch job is configured to ingest data files from a cloud object storage container where each batch represent all records produced by the\nsource system in a given hour. The batch job to process these records into the Lakehouse is sufficiently delayed to ensure no late-arriving data is\nmissed. The user_id field represents a unique key for the data, which has the following schema:\nuser_id BIGINT, username STRING, user_utc STRING, user_region STRING, last_login BIGINT, auto_pay BOOLEAN, last_updated BIGINT\nNew records are all ingested into a table named account_history which maintains a full record of all data in the same schema as the source. The\nnext table in the system is named account_current and is implemented as a Type 1 table representing the most recent value for each unique\nuser_id.\nWhich implementation can be used to efficiently update the described account_current table as part of each hourly batch job assuming there are\nmillions of user accounts and tens of thousands of records processed hourly?",
    "options": {
      "A": "Filter records in account_history using the last_updated field and the most recent hour processed, making sure to deduplicate on username;\nwrite a merge statement to update or insert the most recent value for each username.",
      "B": "Use Auto Loader to subscribe to new files in the account_history directory; configure a Structured Streaming trigger available job to batch\nupdate newly detected files into the account_current table.",
      "C": "Overwrite the account_current table with each batch using the results of a query against the account_history table grouping by user_id and\nfiltering for the max value of last_updated.",
      "D": "Filter records in account_history using the last_updated field and the most recent hour processed, as well as the max last_login by user_id\nwrite a merge statement to update or insert the most recent value for each user_id."
    },
    "answer": "D",
    "question_vi": "Job mỗi giờ cập nhật account_current (Type 1) từ account_history (đủ lịch sử). Có hàng triệu user, vài chục nghìn bản ghi mỗi giờ. Cách hiệu quả để cập nhật account_current?",
    "options_vi": {
      "A": "Lọc account_history theo last_updated giờ mới nhất, khử trùng lặp username; MERGE theo username.",
      "B": "Dùng Auto Loader subscribe account_history và streaming để batch update account_current.",
      "C": "Overwrite account_current mỗi batch bằng truy vấn group by user_id, max(last_updated).",
      "D": "Lọc account_history theo last_updated của giờ mới nhất và max last_login theo user_id; MERGE cập nhật/chèn giá trị mới nhất cho từng user_id."
    },
    "explanation_vi": "Type 1 cần giá trị mới nhất cho mỗi user_id. Lọc phạm vi thay đổi gần nhất và MERGE theo user_id (dựa vào last_updated) giúp cập nhật incrementally, hiệu quả hơn overwrite toàn bộ. Phương án D đáp ứng.",
    "page": null,
    "image": "img/q_132.jpg"
  },
  {
    "id": 133,
    "topic": 1,
    "question": "The business intelligence team has a dashboard configured to track various summary metrics for retail stores. This includes total sales for the\nprevious day alongside totals and averages for a variety of time periods. The fields required to populate this dashboard have the following\nschema:\nFor demand forecasting, the Lakehouse contains a validated table of all itemized sales updated incrementally in near real-time. This table, named\nproducts_per_order, includes the following fields:\nBecause reporting on long-term sales trends is less volatile, analysts using the new dashboard only require data to be refreshed once daily.\nBecause the dashboard will be queried interactively by many users throughout a normal business day, it should return results quickly and reduce\ntotal compute associated with each materialization.\nWhich solution meets the expectations of the end users while controlling and limiting possible costs?",
    "options": {
      "A": "Populate the dashboard by configuring a nightly batch job to save the required values as a table overwritten with each update.",
      "B": "Use Structured Streaming to configure a live dashboard against the products_per_order table within a Databricks notebook.",
      "C": "Define a view against the products_per_order table and define the dashboard against this view.",
      "D": "Use the Delta Cache to persist the products_per_order table in memory to quickly update the dashboard with each query."
    },
    "answer": "A",
    "question_vi": "Dashboard BI cần số liệu tổng hợp bán lẻ, chỉ cần làm mới mỗi ngày; nhiều người truy vấn tương tác nên cần nhanh và tiết kiệm compute. Giải pháp nào phù hợp?",
    "options_vi": {
      "A": "Cấu hình job nightly lưu kết quả thành bảng và overwrite mỗi lần cập nhật.",
      "B": "Dùng Structured Streaming làm dashboard trực tiếp từ products_per_order.",
      "C": "Định nghĩa view trên products_per_order và để dashboard truy vấn view.",
      "D": "Dùng Delta Cache giữ products_per_order trong bộ nhớ để dashboard chạy nhanh."
    },
    "explanation_vi": "Yêu cầu chỉ cần cập nhật hàng ngày; vật hóa nightly vào bảng giúp truy vấn nhanh và ít compute mỗi lần đọc. Streaming hay cache liên tục tốn tài nguyên. Vì vậy chọn job batch nightly overwrite (A).",
    "page": null,
    "image": "img/q_133.jpg"
  },
  {
    "id": 134,
    "topic": 1,
    "question": "A Delta lake table with CDF enabled table in the Lakehouse named customer_churn_params is used in churn prediction by the machine learning\nteam. The table contains information about customers derived from a number of upstream sources. Currently, the data engineering team\npopulates this table nightly by overwriting the table with the current valid values derived from upstream data sources.\nThe churn prediction model used by the ML team is fairly stable in production. The team is only interested in making predictions on records that\nhave changed in the past 24 hours.\nWhich approach would simplify the identification of these changed records?",
    "options": {
      "A": "Apply the churn model to all rows in the customer_churn_params table, but implement logic to perform an upsert into the predictions table\nthat ignores rows where predictions have not changed.",
      "B": "Convert the batch job to a Structured Streaming job using the complete output mode; configure a Structured Streaming job to read from the\ncustomer_churn_params table and incrementally predict against the churn model.",
      "C": "Replace the current overwrite logic with a merge statement to modify only those records that have changed; write logic to make predictions\non the changed records identified by the change data feed.",
      "D": "Modify the overwrite logic to include a field populated by calling spark.sql.functions.current_timestamp() as data are being written; use this\nfield to identify records written on a particular date."
    },
    "answer": "C",
    "question_vi": "Bảng customer_churn_params bật CDF, ghi đè hàng đêm. Mô hình churn chỉ cần dự đoán trên bản ghi thay đổi 24h qua. Cách đơn giản để xác định bản ghi thay đổi?",
    "options_vi": {
      "A": "Chạy model trên toàn bảng rồi upsert kết quả, bỏ qua bản ghi không đổi.",
      "B": "Chuyển sang Structured Streaming complete mode và dự đoán liên tục.",
      "C": "Thay overwrite bằng MERGE chỉ cập nhật bản ghi thay đổi; dùng Change Data Feed để lấy các bản thay đổi và dự đoán trên đó.",
      "D": "Thêm cột current_timestamp khi ghi đè và lọc theo ngày ghi."
    },
    "explanation_vi": "Nếu dùng MERGE và bật CDF, có thể đọc CDF 24h qua để lấy đúng các bản ghi thay đổi rồi chạy mô hình. Đây là cách đơn giản, không phải quét toàn bảng. Do đó chọn C.",
    "page": null,
    "image": "img/q_134.jpg"
  },
  {
    "id": 135,
    "topic": 1,
    "question": "A view is registered with the following code:\nBoth users and orders are Delta Lake tables.\nWhich statement describes the results of querying recent_orders?",
    "options": {
      "A": "All logic will execute when the view is defined and store the result of joining tables to the DBFS; this stored data will be returned when the\nview is queried.",
      "B": "Results will be computed and cached when the view is defined; these cached results will incrementally update as new records are inserted\ninto source tables.",
      "C": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query finishes.",
      "D": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query began."
    },
    "answer": "D",
    "question_vi": "View recent_orders được định nghĩa bằng câu lệnh join giữa users và orders (Delta). Kết quả truy vấn view sẽ như thế nào?",
    "options_vi": {
      "A": "Logic chạy khi định nghĩa view và lưu kết quả join vào DBFS; truy vấn sẽ trả dữ liệu đã lưu.",
      "B": "Kết quả được tính và cache khi định nghĩa view; cache cập nhật dần khi thêm bản ghi mới.",
      "C": "Logic chạy lúc truy vấn và trả kết quả join các phiên bản hợp lệ tại thời điểm truy vấn kết thúc.",
      "D": "Logic chạy lúc truy vấn và trả kết quả join các phiên bản hợp lệ tại thời điểm truy vấn bắt đầu."
    },
    "explanation_vi": "View không vật hóa; mỗi lần query sẽ thực thi lại join. Delta cung cấp snapshot nhất quán tại thời điểm bắt đầu truy vấn. Vì vậy câu trả lời đúng là D.",
    "page": null,
    "image": "img/q_135.jpg"
  },
  {
    "id": 136,
    "topic": 1,
    "question": "A data ingestion task requires a one-TB JSON dataset to be written out to Parquet with a target part-file size of 512 MB. Because Parquet is being\nused instead of Delta Lake, built-in file-sizing features such as Auto-Optimize & Auto-Compaction cannot be used.\nWhich strategy will yield the best performance without shuffling data?",
    "options": {
      "A": "Set spark.sql.files.maxPartitionBytes to 512 MB, ingest the data, execute the narrow transformations, and then write to parquet.",
      "B": "Set spark.sql.shuffle.partitions to 2,048 partitions (1TB*1024*1024/512), ingest the data, execute the narrow transformations, optimize the\ndata by sorting it (which automatically repartitions the data), and then write to parquet.",
      "C": "Set spark.sql.adaptive.advisoryPartitionSizeInBytes to 512 MB bytes, ingest the data, execute the narrow transformations, coalesce to\n2,048 partitions (1TB*1024*1024/512), and then write to parquet.",
      "D": "Ingest the data, execute the narrow transformations, repartition to 2,048 partitions (1TB* 1024*1024/512), and then write to parquet."
    },
    "answer": "A",
    "question_vi": "Ingest 1 TB JSON viết ra Parquet, mục tiêu kích thước file 512 MB, không dùng Auto-Optimize/Compaction. Chiến lược tốt nhất, không shuffle?",
    "options_vi": {
      "A": "Đặt spark.sql.files.maxPartitionBytes = 512 MB, ingest, thực hiện các narrow transform rồi ghi Parquet.",
      "B": "Đặt spark.sql.shuffle.partitions = 2.048, ingest, sort (tự repartition) rồi ghi Parquet.",
      "C": "Đặt spark.sql.adaptive.advisoryPartitionSizeInBytes = 512 MB, ingest, coalesce 2.048 partitions rồi ghi Parquet.",
      "D": "Ingest, narrow transforms, repartition 2.048 partitions rồi ghi Parquet."
    },
    "explanation_vi": "maxPartitionBytes 512MB cho phép đọc/ghi phân vùng theo kích thước mong muốn mà không cần shuffle. Thực hiện narrow transforms tránh shuffle, write ra Parquet gần kích thước mục tiêu. Đáp án A.",
    "page": null,
    "image": "img/q_136.jpg"
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
    "question_vi": "Phát biểu đúng về join stream-static với bảng Delta tĩnh là gì?",
    "options_vi": {
      "A": "Checkpoint dùng để theo dõi cập nhật bảng Delta tĩnh.",
      "B": "Mỗi microbatch dùng phiên bản mới nhất của bảng tĩnh tại thời điểm job khởi tạo.",
      "C": "Checkpoint theo dõi trạng thái key duy nhất trong join.",
      "D": "Stream-static join không dùng được bảng Delta tĩnh vì vấn đề nhất quán."
    },
    "explanation_vi": "Bảng tĩnh được load snapshot khi job khởi chạy; các microbatch dùng cùng phiên bản đó cho tới khi job restart. Checkpoint chỉ lưu state của stream, không theo dõi bảng tĩnh. Do đó B đúng.",
    "page": null,
    "image": "img/q_137.jpg"
  },
  {
    "id": 138,
    "topic": 1,
    "question": "A junior data engineer has been asked to develop a streaming data pipeline with a grouped aggregation using DataFrame df. The pipeline needs to\ncalculate the average humidity and average temperature for each non-overlapping five-minute interval. Events are recorded once per minute per\ndevice.\nStreaming DataFrame df has the following schema:\n\"device_id INT, event_time TIMESTAMP, temp FLOAT, humidity FLOAT\"\nCode block:\nWhich line of code correctly fills in the blank within the code block to complete this task?",
    "options": {
      "A": "to_interval(\"event_time\", \"5 minutes\").alias(\"time\")",
      "B": "window(\"event_time\", \"5 minutes\").alias(\"time\")",
      "C": "\"event_time\"",
      "D": "lag(\"event_time\", \"10 minutes\").alias(\"time\")"
    },
    "answer": "B",
    "question_vi": "Pipeline streaming cần tính trung bình nhiệt độ/độ ẩm cho mỗi cửa sổ 5 phút không chồng lắp từ DataFrame df (device_id, event_time,...). Dòng code nào điền vào chỗ trống?",
    "options_vi": {
      "A": "to_interval(\"event_time\", \"5 minutes\").alias(\"time\")",
      "B": "window(\"event_time\", \"5 minutes\").alias(\"time\")",
      "C": "\"event_time\"",
      "D": "lag(\"event_time\", \"10 minutes\").alias(\"time\")"
    },
    "explanation_vi": "Cần tạo cột cửa sổ thời gian 5 phút không chồng bằng hàm window trên event_time. Vì vậy dùng window(\"event_time\", \"5 minutes\").",
    "page": null,
    "image": "img/q_138.jpg"
  },
  {
    "id": 139,
    "topic": 1,
    "question": "A Structured Streaming job deployed to production has been resulting in higher than expected cloud storage costs. At present, during normal\nexecution, each microbatch of data is processed in less than 3s; at least 12 times per minute, a microbatch is processed that contains 0 records.\nThe streaming write was configured using the default trigger settings. The production job is currently scheduled alongside many other Databricks\njobs in a workspace with instance pools provisioned to reduce start-up time for jobs with batch execution.\nHolding all other variables constant and assuming records need to be processed in less than 10 minutes, which adjustment will meet the\nrequirement?",
    "options": {
      "A": "Set the trigger interval to 3 seconds; the default trigger interval is consuming too many records per batch, resulting in spill to disk that can\nincrease volume costs.",
      "B": "Use the trigger once option and configure a Databricks job to execute the query every 10 minutes; this approach minimizes costs for both\ncompute and storage.",
      "C": "Set the trigger interval to 10 minutes; each batch calls APIs in the source storage account, so decreasing trigger frequency to maximum\nallowable threshold should minimize this cost.",
      "D": "Set the trigger interval to 500 milliseconds; setting a small but non-zero trigger interval ensures that the source is not queried too\nfrequently."
    },
    "answer": "B",
    "question_vi": "Job Structured Streaming xử lý <3s/batch, nhiều batch trống, trigger mặc định gây tốn chi phí storage. Cần xử lý trong <10 phút. Điều chỉnh nào phù hợp?",
    "options_vi": {
      "A": "Đặt trigger 3s; trigger mặc định đang gom nhiều bản ghi gây spill.",
      "B": "Dùng trigger once và lên lịch job chạy mỗi 10 phút để giảm chi phí compute/storage.",
      "C": "Đặt trigger 10 phút để giảm số lần gọi API.",
      "D": "Đặt trigger 500ms để không truy vấn nguồn quá thường xuyên."
    },
    "explanation_vi": "Trigger default = processingTime(0) liên tục -> nhiều batch trống và chi phí. Dùng trigger once và chạy job theo lịch 10 phút vừa đáp ứng SLA vừa giảm số batch và chi phí. Do đó chọn B.",
    "page": null,
    "image": "img/q_139.jpg"
  },
  {
    "id": 140,
    "topic": 1,
    "question": "Which statement describes Delta Lake optimized writes?",
    "options": {
      "A": "Before a Jobs cluster terminates, OPTIMIZE is executed on all tables modified during the most recent job.",
      "B": "An asynchronous job runs after the write completes to detect if files could be further compacted; if yes, an OPTIMIZE job is executed\ntoward a default of 1 GB.",
      "C": "A shuffle occurs prior to writing to try to group similar data together resulting in fewer files instead of each executor writing multiple files\nbased on directory partitions.",
      "D": "Optimized writes use logical partitions instead of directory partitions; because partition boundaries are only represented in metadata, fewer\nsmall files are written."
    },
    "answer": "C",
    "question_vi": "Phát biểu nào mô tả optimized writes của Delta Lake?",
    "options_vi": {
      "A": "Trước khi job cluster tắt sẽ chạy OPTIMIZE trên mọi bảng vừa ghi.",
      "B": "Sau ghi chạy job async kiểm tra và OPTIMIZE về 1 GB nếu cần.",
      "C": "Shuffle trước khi ghi để gom dữ liệu tương tự, giảm số file thay vì mỗi executor ghi nhiều file.",
      "D": "Optimized writes dùng partition logic thay vì directory partitions để viết ít file nhỏ."
    },
    "explanation_vi": "Optimized writes thực hiện shuffle để phân phối dữ liệu đều hơn, giúp mỗi partition ghi file lớn hơn và giảm small files. Vì vậy mô tả C là đúng.",
    "page": null,
    "image": "img/q_140.jpg"
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
    "question_vi": "Phát biểu nào mô tả mô hình lập trình chung mà Spark Structured Streaming sử dụng?",
    "options_vi": {
      "A": "Structured Streaming tận dụng xử lý song song của GPU để tăng thông lượng.",
      "B": "Structured Streaming được triển khai như một bus thông điệp xuất phát từ Apache Kafka.",
      "C": "Structured Streaming dựa vào mạng các node phân tán giữ trạng thái tăng dần cho các stage được cache.",
      "D": "Structured Streaming mô hình hóa dữ liệu mới của luồng như các dòng mới được chèn vào một bảng vô hạn."
    },
    "explanation_vi": "Structured Streaming coi luồng dữ liệu như một bảng không giới hạn và mỗi bản ghi đến là một dòng mới, nên mô hình lập trình là thêm hàng vào bảng vô hạn (D).",
    "page": null,
    "image": "img/q_141.jpg"
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
    "question_vi": "Tham số cấu hình nào ảnh hưởng trực tiếp kích thước một spark-partition khi nạp dữ liệu vào Spark?",
    "options_vi": {
      "A": "spark.sql.files.maxPartitionBytes",
      "B": "spark.sql.autoBroadcastJoinThreshold",
      "C": "spark.sql.adaptive.advisoryPartitionSizeInBytes",
      "D": "spark.sql.adaptive.coalescePartitions.minPartitionNum"
    },
    "explanation_vi": "Kích thước partition khi đọc file được chặn bởi spark.sql.files.maxPartitionBytes; các tùy chọn khác liên quan broadcast join hay adaptive coalesce nên đáp án A.",
    "page": null,
    "image": "img/q_142.jpg"
  },
  {
    "id": 143,
    "topic": 1,
    "question": "A Spark job is taking longer than expected. Using the Spark UI, a data engineer notes that the Min, Median, and Max Durations for tasks in a\nparticular stage show the minimum and median time to complete a task as roughly the same, but the max duration for a task to be roughly 100\ntimes as long as the minimum.\nWhich situation is causing increased duration of the overall job?",
    "options": {
      "A": "Task queueing resulting from improper thread pool assignment.",
      "B": "Spill resulting from attached volume storage being too small.",
      "C": "Network latency due to some cluster nodes being in different regions from the source data",
      "D": "Skew caused by more data being assigned to a subset of spark-partitions."
    },
    "answer": "D",
    "question_vi": "Một job Spark chạy lâu bất thường; trong UI, thời gian Max của một số task cao gấp ~100 lần Min/Median. Nguyên nhân nào làm kéo dài job?",
    "options_vi": {
      "A": "Tác vụ bị xếp hàng do cấu hình thread pool sai.",
      "B": "Spill vì dung lượng đĩa đính kèm quá nhỏ.",
      "C": "Độ trễ mạng do một số node ở khác vùng so với dữ liệu nguồn.",
      "D": "Skew do nhiều dữ liệu dồn vào một số spark-partition."
    },
    "explanation_vi": "Chênh lệch cực lớn giữa max và median thời gian task thường do data skew: vài partition nhận quá nhiều dữ liệu nên chạy lâu (D).",
    "page": null,
    "image": "img/q_143.jpg"
  },
  {
    "id": 144,
    "topic": 1,
    "question": "Each configuration below is identical to the extent that each cluster has 400 GB total of RAM, 160 total cores and only one Executor per VM.\nGiven an extremely long-running job for which completion must be guaranteed, which cluster configuration will be able to guarantee completion of\nthe job in light of one or more VM failures?",
    "options": {
      "A": "• Total VMs: 8\n• 50 GB per Executor\n• 20 Cores / Executor",
      "B": "• Total VMs: 16\n• 25 GB per Executor\n• 10 Cores / Executor",
      "C": "• Total VMs: 1\n• 400 GB per Executor\n• 160 Cores/Executor",
      "D": "• Total VMs: 4\n• 100 GB per Executor\n• 40 Cores / Executor"
    },
    "answer": "B",
    "question_vi": "Cùng tổng 400 GB RAM, 160 core, mỗi VM chỉ 1 Executor. Với job rất dài cần đảm bảo hoàn thành ngay cả khi một hoặc nhiều VM hỏng, cấu hình nào bảo đảm nhất?",
    "options_vi": {
      "A": "8 VM, mỗi Executor 50 GB, 20 core",
      "B": "16 VM, mỗi Executor 25 GB, 10 core",
      "C": "1 VM, Executor 400 GB, 160 core",
      "D": "4 VM, mỗi Executor 100 GB, 40 core"
    },
    "explanation_vi": "Để chịu lỗi VM, cần nhiều nút hơn để mất vài nút vẫn còn tài nguyên; 16 VM phân tán nhất nên an toàn nhất (B).",
    "page": null,
    "image": "img/q_144.jpg"
  },
  {
    "id": 145,
    "topic": 1,
    "question": "A task orchestrator has been configured to run two hourly tasks. First, an outside system writes Parquet data to a directory mounted at\n/mnt/raw_orders/. After this data is written, a Databricks job containing the following code is executed:\nAssume that the fields customer_id and order_id serve as a composite key to uniquely identify each order, and that the time field indicates when\nthe record was queued in the source system.\nIf the upstream system is known to occasionally enqueue duplicate entries for a single order hours apart, which statement is correct?",
    "options": {
      "A": "Duplicate records enqueued more than 2 hours apart may be retained and the orders table may contain duplicate records with the same\ncustomer_id and order_id.",
      "B": "All records will be held in the state store for 2 hours before being deduplicated and committed to the orders table.",
      "C": "The orders table will contain only the most recent 2 hours of records and no duplicates will be present.",
      "D": "The orders table will not contain duplicates, but records arriving more than 2 hours late will be ignored and missing from the table."
    },
    "answer": "A",
    "question_vi": "Hệ thống upstream đôi lúc xếp hàng trùng lặp cùng một đơn hàng cách nhau vài giờ. Với watermark 2 giờ và composite key customer_id + order_id, phát biểu nào đúng?",
    "options_vi": {
      "A": "Bản ghi trùng lặp cách nhau hơn 2 giờ có thể vẫn được giữ, bảng orders có thể chứa trùng customer_id, order_id.",
      "B": "Tất cả bản ghi sẽ được giữ trong state store 2 giờ rồi mới khử trùng và ghi ra bảng.",
      "C": "Bảng orders chỉ giữ 2 giờ dữ liệu gần nhất và không có trùng lặp.",
      "D": "Bảng orders không có trùng lặp, nhưng bản ghi đến muộn hơn 2 giờ sẽ bị bỏ qua."
    },
    "explanation_vi": "Watermark 2 giờ chỉ khử trùng trong cửa sổ đó; trùng lặp đến sau 2 giờ sẽ không được so khớp và có thể được giữ lại (A).",
    "page": null,
    "image": "img/q_145.jpg"
  },
  {
    "id": 146,
    "topic": 1,
    "question": "A data engineer is configuring a pipeline that will potentially see late-arriving, duplicate records.\nIn addition to de-duplicating records within the batch, which of the following approaches allows the data engineer to deduplicate data against\npreviously processed records as it is inserted into a Delta table?",
    "options": {
      "A": "Rely on Delta Lake schema enforcement to prevent duplicate records.",
      "B": "VACUUM the Delta table after each batch completes.",
      "C": "Perform an insert-only merge with a matching condition on a unique key.",
      "D": "Perform a full outer join on a unique key and overwrite existing data."
    },
    "answer": "C",
    "question_vi": "Để loại trùng so với dữ liệu đã ghi trước đó khi nạp vào Delta, cách nào phù hợp bên cạnh khử trùng trong batch?",
    "options_vi": {
      "A": "Dựa vào ép schema của Delta để chặn bản ghi trùng.",
      "B": "VACUUM bảng Delta sau mỗi batch.",
      "C": "Thực hiện merge chỉ-chèn (insert-only) với điều kiện khớp trên khóa duy nhất.",
      "D": "Thực hiện full outer join trên khóa duy nhất và overwrite dữ liệu."
    },
    "explanation_vi": "Merge insert-only với điều kiện khóa duy nhất cho phép bỏ qua nếu khóa đã tồn tại, nhờ đó so khớp với bản ghi trước đây để tránh trùng (C).",
    "page": null,
    "image": "img/q_146.jpg"
  },
  {
    "id": 147,
    "topic": 1,
    "question": "A junior data engineer seeks to leverage Delta Lake's Change Data Feed functionality to create a Type 1 table representing all of the values that\nhave ever been valid for all rows in a bronze table created with the property delta.enableChangeDataFeed = true. They plan to execute the\nfollowing code as a daily job:\nWhich statement describes the execution and results of running the above query multiple times?",
    "options": {
      "A": "Each time the job is executed, newly updated records will be merged into the target table, overwriting previous values with the same\nprimary keys.",
      "B": "Each time the job is executed, the entire available history of inserted or updated records will be appended to the target table, resulting in\nmany duplicate entries.",
      "C": "Each time the job is executed, only those records that have been inserted or updated since the last execution will be appended to the target\ntable, giving the desired result.",
      "D": "Each time the job is executed, the differences between the original and current versions are calculated; this may result in duplicate entries\nfor some records."
    },
    "answer": "B",
    "question_vi": "Khi dùng Change Data Feed để tạo bảng Type 1 từ bảng bronze, chạy truy vấn CDF hằng ngày sẽ thế nào?",
    "options_vi": {
      "A": "Mỗi lần chạy, bản ghi cập nhật mới được merge, ghi đè giá trị cũ cùng khóa.",
      "B": "Mỗi lần chạy, toàn bộ lịch sử insert/update có sẵn sẽ được append, tạo rất nhiều bản ghi trùng.",
      "C": "Mỗi lần chạy, chỉ các bản ghi insert/update từ lần chạy trước mới được append, đúng như mong muốn.",
      "D": "Mỗi lần chạy tính toán chênh lệch giữa bản gốc và hiện tại; có thể tạo bản ghi trùng cho vài dòng."
    },
    "explanation_vi": "Truy vấn CDF không lọc theo mốc phiên bản nên mỗi lần chạy sẽ append toàn bộ lịch sử khả dụng, gây trùng lặp (B).",
    "page": null,
    "image": "img/q_147.jpg"
  },
  {
    "id": 148,
    "topic": 1,
    "question": "A DLT pipeline includes the following streaming tables:\n• raw_iot ingests raw device measurement data from a heart rate tracking device.\n• bpm_stats incrementally computes user statistics based on BPM measurements from raw_iot.\nHow can the data engineer configure this pipeline to be able to retain manually deleted or updated records in the raw_iot table, while recomputing\nthe downstream table bpm_stats table when a pipeline update is run?",
    "options": {
      "A": "Set the pipelines.reset.allowed property to false on raw_iot",
      "B": "Set the skipChangeCommits flag to true on raw_iot",
      "C": "Set the pipelines.reset.allowed property to false on bpm_stats",
      "D": "Set the skipChangeCommits flag to true on bpm_stats"
    },
    "answer": "B",
    "question_vi": "Trong pipeline DLT với raw_iot và bpm_stats, làm sao giữ được bản ghi bị xóa/cập nhật thủ công ở raw_iot nhưng vẫn tính lại bpm_stats khi update pipeline?",
    "options_vi": {
      "A": "Đặt pipelines.reset.allowed = false cho raw_iot.",
      "B": "Đặt cờ skipChangeCommits = true cho raw_iot.",
      "C": "Đặt pipelines.reset.allowed = false cho bpm_stats.",
      "D": "Đặt cờ skipChangeCommits = true cho bpm_stats."
    },
    "explanation_vi": "skipChangeCommits trên bảng nguồn raw_iot giữ lại commit cũ khi reset, cho phép tái tính downstream mà vẫn bảo tồn thay đổi thủ công (B).",
    "page": null,
    "image": "img/q_148.jpg"
  },
  {
    "id": 149,
    "topic": 1,
    "question": "A data pipeline uses Structured Streaming to ingest data from Apache Kafka to Delta Lake. Data is being stored in a bronze table, and includes the\nKafka-generated timestamp, key, and value. Three months after the pipeline is deployed, the data engineering team has noticed some latency\nissues during certain times of the day.\nA senior data engineer updates the Delta Table's schema and ingestion logic to include the current timestamp (as recorded by Apache Spark) as\nwell as the Kafka topic and partition. The team plans to use these additional metadata fields to diagnose the transient processing delays.\nWhich limitation will the team face while diagnosing this problem?",
    "options": {
      "A": "New fields will not be computed for historic records.",
      "B": "Spark cannot capture the topic and partition fields from a Kafka source.",
      "C": "Updating the table schema requires a default value provided for each field added.",
      "D": "Updating the table schema will invalidate the Delta transaction log metadata."
    },
    "answer": "A",
    "question_vi": "Khi thêm các trường metadata mới (timestamp Spark, topic, partition) để điều tra độ trễ, hạn chế nào sẽ gặp phải?",
    "options_vi": {
      "A": "Các trường mới sẽ không được tính cho bản ghi lịch sử.",
      "B": "Spark không thể lấy topic và partition từ nguồn Kafka.",
      "C": "Cập nhật schema yêu cầu giá trị mặc định cho từng trường thêm mới.",
      "D": "Cập nhật schema sẽ làm vô hiệu metadata log Delta."
    },
    "explanation_vi": "Trường mới chỉ xuất hiện với dữ liệu mới; dữ liệu lịch sử không được backfill nên không có metadata này (A).",
    "page": null,
    "image": "img/q_149.jpg"
  },
  {
    "id": 150,
    "topic": 1,
    "question": "A nightly job ingests data into a Delta Lake table using the following code:\nThe next step in the pipeline requires a function that returns an object that can be used to manipulate new records that have not yet been\nprocessed to the next table in the pipeline.\nWhich code snippet completes this function definition?\ndef new_records():",
    "options": {
      "A": "return spark.readStream.table(\"bronze\")",
      "B": "return spark.read.option(\"readChangeFeed\", \"true\").table (\"bronze\")",
      "C": "",
      "D": ""
    },
    "answer": "C",
    "question_vi": "Job đêm nạp dữ liệu vào bảng Delta bronze. Bước tiếp cần hàm trả về đối tượng chứa các bản ghi mới chưa xử lý tiếp. Đoạn code nào hoàn thiện hàm new_records()?",
    "options_vi": {
      "A": "return spark.readStream.table(\"bronze\")",
      "B": "return spark.read.option(\"readChangeFeed\", \"true\").table (\"bronze\")",
      "C": "(không có nội dung trong đề gốc)",
      "D": "(không có nội dung trong đề gốc)"
    },
    "explanation_vi": "Đáp án C trong đề; ý nghĩa thường là đọc change data feed ở chế độ streaming để lấy bản ghi mới chưa chuyển xuống bảng tiếp theo.",
    "page": null,
    "image": "img/q_150.jpg"
  },
  {
    "id": 151,
    "topic": 1,
    "question": "A junior data engineer is working to implement logic for a Lakehouse table named silver_device_recordings. The source data contains 100 unique\nfields in a highly nested JSON structure.\nThe silver_device_recordings table will be used downstream to power several production monitoring dashboards and a production model. At\npresent, 45 of the 100 fields are being used in at least one of these applications.\nThe data engineer is trying to determine the best approach for dealing with schema declaration given the highly-nested structure of the data and\nthe numerous fields.\nWhich of the following accurately presents information about Delta Lake and Databricks that may impact their decision-making process?",
    "options": {
      "A": "The Tungsten encoding used by Databricks is optimized for storing string data; newly-added native support for querying JSON strings\nmeans that string types are always most efficient.",
      "B": "Because Delta Lake uses Parquet for data storage, data types can be easily evolved by just modifying file footer information in place.",
      "C": "Schema inference and evolution on Databricks ensure that inferred types will always accurately match the data types used by downstream\nsystems.",
      "D": "Because Databricks will infer schema using types that allow all observed data to be processed, setting types manually provides greater\nassurance of data quality enforcement."
    },
    "answer": "D",
    "question_vi": "Nguồn JSON lồng sâu có 100 trường, 45 trường đang dùng. Về khai báo schema cho Delta, thông tin nào đúng và hữu ích?",
    "options_vi": {
      "A": "Mã hóa Tungsten tối ưu cho chuỗi; hỗ trợ mới với JSON string khiến string luôn hiệu quả nhất.",
      "B": "Delta dùng Parquet nên có thể tiến hóa kiểu dữ liệu bằng cách sửa footer file tại chỗ.",
      "C": "Suy luận và tiến hóa schema trên Databricks luôn khớp chính xác với kiểu dữ liệu downstream.",
      "D": "Vì Databricks suy luận theo kiểu bao quát nhất để xử lý dữ liệu quan sát được, tự đặt kiểu thủ công giúp kiểm soát chất lượng tốt hơn."
    },
    "explanation_vi": "Suy luận schema chọn kiểu rộng để không lỗi, nên khai báo thủ công giúp kiểm soát chất lượng và kiểu dữ liệu, nhất là với JSON phức tạp (D).",
    "page": null,
    "image": "img/q_151.jpg"
  },
  {
    "id": 152,
    "topic": 1,
    "question": "The data engineering team maintains the following code:\nAssuming that this code produces logically correct results and the data in the source tables has been de-duplicated and validated, which\nstatement describes what will occur when this code is executed?",
    "options": {
      "A": "A batch job will update the enriched_itemized_orders_by_account table, replacing only those rows that have different values than the\ncurrent version of the table, using accountID as the primary key.",
      "B": "The enriched_itemized_orders_by_account table will be overwritten using the current valid version of data in each of the three tables\nreferenced in the join logic.",
      "C": "No computation will occur until enriched_itemized_orders_by_account is queried; upon query materialization, results will be calculated\nusing the current valid version of data in each of the three tables referenced in the join logic.",
      "D": "An incremental job will detect if new rows have been written to any of the source tables; if new rows are detected, all results will be\nrecalculated and used to overwrite the enriched_itemized_orders_by_account table."
    },
    "answer": "B",
    "question_vi": "Đoạn code join 3 bảng và tạo bảng enriched_itemized_orders_by_account bằng spark.sql: ... Đoạn nào mô tả đúng khi chạy?",
    "options_vi": {
      "A": "Job batch cập nhật bảng chỉ những dòng khác biệt, dùng accountID làm khóa.",
      "B": "Bảng enriched_itemized_orders_by_account sẽ bị overwrite bằng phiên bản hợp lệ hiện tại của dữ liệu ở 3 bảng nguồn.",
      "C": "Không tính toán gì đến khi bảng được query; khi query mới tính theo phiên bản dữ liệu hiện tại của 3 bảng.",
      "D": "Job incremental dò bản ghi mới ở nguồn; nếu có sẽ tính lại toàn bộ và overwrite bảng đích."
    },
    "explanation_vi": "Chạy spark.sql với CREATE OR REPLACE TABLE AS SELECT sẽ ghi đè bảng đích bằng kết quả join hiện tại của 3 bảng nguồn (B).",
    "page": null,
    "image": "img/q_152.jpg"
  },
  {
    "id": 153,
    "topic": 1,
    "question": "The data engineering team is configuring environments for development, testing, and production before beginning migration on a new data\npipeline. The team requires extensive testing on both the code and data resulting from code execution, and the team wants to develop and test\nagainst data as similar to production data as possible.\nA junior data engineer suggests that production data can be mounted to the development and testing environments, allowing pre-production code\nto execute against production data. Because all users have admin privileges in the development environment, the junior data engineer has offered\nto configure permissions and mount this data for the team.\nWhich statement captures best practices for this situation?",
    "options": {
      "A": "All development, testing, and production code and data should exist in a single, unified workspace; creating separate environments for\ntesting and development complicates administrative overhead.",
      "B": "In environments where interactive code will be executed, production data should only be accessible with read permissions; creating\nisolated databases for each environment further reduces risks.",
      "C": "Because access to production data will always be verified using passthrough credentials, it is safe to mount data to any Databricks\ndevelopment environment.",
      "D": "Because Delta Lake versions all data and supports time travel, it is not possible for user error or malicious actors to permanently delete\nproduction data; as such, it is generally safe to mount production data anywhere."
    },
    "answer": "B",
    "question_vi": "Đội cần dev/test với dữ liệu giống production; có ý kiến mount thẳng dữ liệu prod vào môi trường dev/test (mọi user là admin). Thực hành tốt nhất là gì?",
    "options_vi": {
      "A": "Giữ code và dữ liệu dev/test/prod trong một workspace duy nhất cho đơn giản.",
      "B": "Ở môi trường tương tác, dữ liệu prod chỉ nên cho phép quyền đọc; tạo database tách biệt cho từng môi trường để giảm rủi ro.",
      "C": "Vì luôn xác thực passthrough, mount dữ liệu prod vào mọi môi trường đều an toàn.",
      "D": "Delta có versioning/time travel nên không thể xóa nhầm vĩnh viễn; mount prod ở đâu cũng an toàn."
    },
    "explanation_vi": "Mount prod vào dev/test tiềm ẩn rủi ro ghi/xóa; nên chỉ cho quyền đọc và tách database theo môi trường để hạn chế ảnh hưởng (B).",
    "page": null,
    "image": "img/q_153.jpg"
  },
  {
    "id": 154,
    "topic": 1,
    "question": "The data architect has mandated that all tables in the Lakehouse should be configured as external Delta Lake tables.\nWhich approach will ensure that this requirement is met?",
    "options": {
      "A": "Whenever a database is being created, make sure that the LOCATION keyword is used.",
      "B": "When the workspace is being configured, make sure that external cloud object storage has been mounted.",
      "C": "Whenever a table is being created, make sure that the LOCATION keyword is used.",
      "D": "When tables are created, make sure that the UNMANAGED keyword is used in the CREATE TABLE statement."
    },
    "answer": "C",
    "question_vi": "Kiến trúc sư yêu cầu tất cả bảng là external Delta. Cách nào đảm bảo yêu cầu này?",
    "options_vi": {
      "A": "Bất cứ khi tạo database đều dùng từ khóa LOCATION.",
      "B": "Khi cấu hình workspace, mount sẵn object storage ngoài.",
      "C": "Khi tạo bảng, phải dùng từ khóa LOCATION.",
      "D": "Khi tạo bảng, dùng từ khóa UNMANAGED trong câu lệnh CREATE TABLE."
    },
    "explanation_vi": "Bảng external được xác định bằng LOCATION tại CREATE TABLE để lưu ngoài kho mặc định, do đó cần chỉ định LOCATION (C).",
    "page": null,
    "image": "img/q_154.jpg"
  },
  {
    "id": 155,
    "topic": 1,
    "question": "The marketing team is looking to share data in an aggregate table with the sales organization, but the field names used by the teams do not\nmatch, and a number of marketing-specific fields have not been approved for the sales org.\nWhich of the following solutions addresses the situation while emphasizing simplicity?",
    "options": {
      "A": "Create a view on the marketing table selecting only those fields approved for the sales team; alias the names of any fields that should be\nstandardized to the sales naming conventions.",
      "B": "Create a new table with the required schema and use Delta Lake's DEEP CLONE functionality to sync up changes committed to one table to\nthe corresponding table.",
      "C": "Use a CTAS statement to create a derivative table from the marketing table; configure a production job to propagate changes.",
      "D": "Add a parallel table write to the current production pipeline, updating a new sales table that varies as required from the marketing table."
    },
    "answer": "A",
    "question_vi": "Marketing muốn chia sẻ bảng tổng hợp cho Sales nhưng tên cột khác nhau và có cột riêng chưa được phê duyệt. Giải pháp đơn giản nhất?",
    "options_vi": {
      "A": "Tạo view trên bảng marketing, chỉ chọn cột được phép và alias tên theo quy ước Sales.",
      "B": "Tạo bảng mới đúng schema và dùng DEEP CLONE đồng bộ thay đổi giữa hai bảng.",
      "C": "Dùng CTAS tạo bảng dẫn xuất rồi lên lịch job propagate thay đổi.",
      "D": "Thêm nhánh ghi song song trong pipeline để cập nhật bảng sales với schema khác."
    },
    "explanation_vi": "View chọn subset cột và alias tên đáp ứng nhu cầu mà không cần bản sao dữ liệu mới; đơn giản nhất (A).",
    "page": null,
    "image": "img/q_155.jpg"
  },
  {
    "id": 156,
    "topic": 1,
    "question": "A Delta Lake table representing metadata about content posts from users has the following schema:\nuser_id LONG, post_text STRING, post_id STRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE\nThis table is partitioned by the date column. A query is run with the following filter:\nlongitude < 20 & longitude > -20\nWhich statement describes how data will be filtered?",
    "options": {
      "A": "Statistics in the Delta Log will be used to identify partitions that might Include files in the filtered range.",
      "B": "No file skipping will occur because the optimizer does not know the relationship between the partition column and the longitude.",
      "C": "The Delta Engine will scan the parquet file footers to identify each row that meets the filter criteria.",
      "D": "Statistics in the Delta Log will be used to identify data files that might include records in the filtered range."
    },
    "answer": "D",
    "question_vi": "Bảng Delta partition theo date, schema có longitude/latitude. Query filter longitude < 20 & > -20. Dữ liệu sẽ được lọc thế nào?",
    "options_vi": {
      "A": "Thống kê trong Delta Log dùng để xác định partition có thể chứa phạm vi filter.",
      "B": "Không skip file vì optimizer không biết quan hệ giữa cột partition và longitude.",
      "C": "Delta Engine quét footer parquet để xác định từng dòng thỏa điều kiện.",
      "D": "Thống kê trong Delta Log dùng để xác định file có thể chứa bản ghi trong phạm vi filter."
    },
    "explanation_vi": "Partition theo date nên không liên quan longitude; optimizer dùng thống kê file-level (min/max) trong Delta log để skip file, không theo partition (D).",
    "page": null,
    "image": "img/q_156.jpg"
  },
  {
    "id": 157,
    "topic": 1,
    "question": "A small company based in the United States has recently contracted a consulting firm in India to implement several new data engineering\npipelines to power artificial intelligence applications. All the company's data is stored in regional cloud storage in the United States.\nThe workspace administrator at the company is uncertain about where the Databricks workspace used by the contractors should be deployed.\nAssuming that all data governance considerations are accounted for, which statement accurately informs this decision?",
    "options": {
      "A": "Databricks runs HDFS on cloud volume storage; as such, cloud virtual machines must be deployed in the region where the data is stored.",
      "B": "Databricks workspaces do not rely on any regional infrastructure; as such, the decision should be made based upon what is most\nconvenient for the workspace administrator.",
      "C": "Cross-region reads and writes can incur significant costs and latency; whenever possible, compute should be deployed in the same region\nthe data is stored.",
      "D": "Databricks notebooks send all executable code from the user’s browser to virtual machines over the open internet; whenever possible,\nchoosing a workspace region near the end users is the most secure."
    },
    "answer": "C",
    "question_vi": "Công ty ở Mỹ thuê team Ấn Độ, dữ liệu lưu ở cloud Mỹ. Workspace Databricks nên đặt ở đâu?",
    "options_vi": {
      "A": "Databricks chạy HDFS trên storage cloud nên VM phải cùng vùng dữ liệu.",
      "B": "Databricks không phụ thuộc vùng; chọn gì cũng được theo tiện quản trị.",
      "C": "Đọc/ghi khác vùng tốn phí và độ trễ; nên đặt compute cùng vùng với dữ liệu.",
      "D": "Notebook gửi code qua internet, nên chọn vùng gần người dùng cho an toàn."
    },
    "explanation_vi": "Để tránh chi phí và độ trễ cross-region, nên triển khai workspace cùng vùng với dữ liệu ở Mỹ (C).",
    "page": null,
    "image": "img/q_157.jpg"
  },
  {
    "id": 158,
    "topic": 1,
    "question": "A CHECK constraint has been successfully added to the Delta table named activity_details using the following logic:\nA batch job is attempting to insert new records to the table, including a record where latitude = 45.50 and longitude = 212.67.\nWhich statement describes the outcome of this batch insert?",
    "options": {
      "A": "The write will insert all records except those that violate the table constraints; the violating records will be reported in a warning log.",
      "B": "The write will fail completely because of the constraint violation and no records will be inserted into the target table.",
      "C": "The write will insert all records except those that violate the table constraints; the violating records will be recorded to a quarantine table.",
      "D": "The write will include all records in the target table; any violations will be indicated in the boolean column named valid_coordinates."
    },
    "answer": "B",
    "question_vi": "Đã thêm CHECK constraint cho bảng activity_details. Batch insert có bản ghi latitude=45.50, longitude=212.67 sẽ ra sao?",
    "options_vi": {
      "A": "Ghi chèn tất cả trừ bản vi phạm; bản vi phạm được log cảnh báo.",
      "B": "Ghi sẽ thất bại hoàn toàn vì vi phạm constraint, không bản ghi nào được chèn.",
      "C": "Ghi chèn tất cả trừ bản vi phạm; bản vi phạm ghi vào bảng cách ly.",
      "D": "Tất cả bản ghi được chèn; vi phạm được đánh dấu ở cột valid_coordinates."
    },
    "explanation_vi": "CHECK constraint khiến toàn bộ write fail nếu có bản ghi vi phạm; cần sửa dữ liệu rồi ghi lại (B).",
    "page": null,
    "image": "img/q_158.jpg"
  },
  {
    "id": 159,
    "topic": 1,
    "question": "A junior data engineer is migrating a workload from a relational database system to the Databricks Lakehouse. The source system uses a star\nschema, leveraging foreign key constraints and multi-table inserts to validate records on write.\nWhich consideration will impact the decisions made by the engineer while migrating this workload?",
    "options": {
      "A": "Databricks only allows foreign key constraints on hashed identifiers, which avoid collisions in highly-parallel writes.",
      "B": "Foreign keys must reference a primary key field; multi-table inserts must leverage Delta Lake’s upsert functionality.",
      "C": "Committing to multiple tables simultaneously requires taking out multiple table locks and can lead to a state of deadlock.",
      "D": "All Delta Lake transactions are ACID compliant against a single table, and Databricks does not enforce foreign key constraints."
    },
    "answer": "D",
    "question_vi": "Di chuyển workload star schema từ RDBMS sang Lakehouse; RDBMS dùng foreign key và multi-table insert. Yếu tố nào ảnh hưởng quyết định khi migrate?",
    "options_vi": {
      "A": "Databricks chỉ cho khóa ngoại trên mã băm để tránh collision khi ghi song song.",
      "B": "Khóa ngoại phải tham chiếu khóa chính; multi-table insert phải dùng upsert Delta.",
      "C": "Commit nhiều bảng cùng lúc cần nhiều khóa bảng và có thể deadlock.",
      "D": "Giao dịch Delta ACID chỉ áp dụng trong phạm vi một bảng và Databricks không enforce khóa ngoại."
    },
    "explanation_vi": "Delta đảm bảo ACID trên từng bảng, không enforce khóa ngoại; multi-table insert không được bảo vệ xuyên bảng nên phải thiết kế lại (D).",
    "page": null,
    "image": "img/q_159.jpg"
  },
  {
    "id": 160,
    "topic": 1,
    "question": "A data architect has heard about Delta Lake’s built-in versioning and time travel capabilities. For auditing purposes, they have a requirement to\nmaintain a full record of all valid street addresses as they appear in the customers table.\nThe architect is interested in implementing a Type 1 table, overwriting existing records with new values and relying on Delta Lake time travel to\nsupport long-term auditing. A data engineer on the project feels that a Type 2 table will provide better performance and scalability.\nWhich piece of information is critical to this decision?",
    "options": {
      "A": "Data corruption can occur if a query fails in a partially completed state because Type 2 tables require setting multiple fields in a single\nupdate.",
      "B": "Shallow clones can be combined with Type 1 tables to accelerate historic queries for long-term versioning.",
      "C": "Delta Lake time travel cannot be used to query previous versions of these tables because Type 1 changes modify data files in place.",
      "D": "Delta Lake time travel does not scale well in cost or latency to provide a long-term versioning solution."
    },
    "answer": "D",
    "question_vi": "Cần lưu lịch sử địa chỉ khách hàng. Kiến trúc sư muốn Type 1 + time travel; kỹ sư đề xuất Type 2. Thông tin nào quan trọng cho quyết định?",
    "options_vi": {
      "A": "Type 2 yêu cầu cập nhật nhiều trường trong một update nên nếu query lỗi có thể gây hỏng dữ liệu.",
      "B": "Shallow clone kết hợp Type 1 có thể tăng tốc truy vấn lịch sử.",
      "C": "Time travel không dùng được với Type 1 vì thay đổi tại chỗ dữ liệu.",
      "D": "Time travel không mở rộng tốt về chi phí/độ trễ cho nhu cầu lưu phiên bản lâu dài."
    },
    "explanation_vi": "Time travel giữ nhiều phiên bản file, chi phí/lưu trữ tăng theo thời gian; với yêu cầu lâu dài Type 2 thường phù hợp hơn (D).",
    "page": null,
    "image": "img/q_160.jpg"
  },
  {
    "id": 161,
    "topic": 1,
    "question": "A data engineer wants to join a stream of advertisement impressions (when an ad was shown) with another stream of user clicks on\nadvertisements to correlate when impressions led to monetizable clicks.\nIn the code below, Impressions is a streaming DataFrame with a watermark (\"event_time\", \"10 minutes\")\nThe data engineer notices the query slowing down significantly.\nWhich solution would improve the performance?",
    "options": {
      "A": "Joining on event time constraint: clickTime >= impressionTime AND clickTime <= impressionTime interval 1 hour",
      "B": "Joining on event time constraint: clickTime + 3 hours < impressionTime - 2 hours",
      "C": "Joining on event time constraint: clickTime == impressionTime using a leftOuter join",
      "D": "Joining on event time constraint: clickTime >= impressionTime - interval 3 hours and removing watermarks"
    },
    "answer": "A",
    "question_vi": "Muốn join stream impression với stream click để gắn doanh thu, đã đặt watermark 10 phút. Truy vấn chậm, giải pháp nào cải thiện?",
    "options_vi": {
      "A": "Join theo thời gian: clickTime >= impressionTime AND clickTime <= impressionTime + interval 1 hour",
      "B": "Join theo ràng buộc: clickTime + 3 hours < impressionTime - 2 hours",
      "C": "Join clickTime == impressionTime với leftOuter join",
      "D": "Join clickTime >= impressionTime - interval 3 hours và bỏ watermark"
    },
    "explanation_vi": "Đặt điều kiện cửa sổ thời gian hẹp (ví dụ 1 giờ sau impression) giúp giảm trạng thái giữ và tăng hiệu năng; đáp án A phù hợp.",
    "page": null,
    "image": "img/q_161.jpg"
  },
  {
    "id": 162,
    "topic": 1,
    "question": "A junior data engineer has manually configured a series of jobs using the Databricks Jobs UI. Upon reviewing their work, the engineer realizes that\nthey are listed as the \"Owner\" for each job. They attempt to transfer \"Owner\" privileges to the \"DevOps\" group, but cannot successfully accomplish\nthis task.\nWhich statement explains what is preventing this privilege transfer?",
    "options": {
      "A": "Databricks jobs must have exactly one owner; \"Owner\" privileges cannot be assigned to a group.",
      "B": "The creator of a Databricks job will always have \"Owner\" privileges; this configuration cannot be changed.",
      "C": "Only workspace administrators can grant \"Owner\" privileges to a group.",
      "D": "A user can only transfer job ownership to a group if they are also a member of that group."
    },
    "answer": "A",
    "question_vi": "Kỹ sư chuyển quyền Owner của job cho group DevOps nhưng không được. Nguyên nhân?",
    "options_vi": {
      "A": "Mỗi job chỉ có đúng một owner; quyền Owner không gán cho group.",
      "B": "Người tạo job luôn là Owner và không đổi được cấu hình này.",
      "C": "Chỉ admin workspace mới gán Owner cho group.",
      "D": "Chỉ chuyển được khi user cũng là thành viên của group đó."
    },
    "explanation_vi": "Databricks không cho đặt owner là group; owner phải là một user duy nhất nên không chuyển cho group DevOps được (A).",
    "page": null,
    "image": "img/q_162.jpg"
  },
  {
    "id": 163,
    "topic": 1,
    "question": "A table named user_ltv is being used to create a view that will be used by data analysts on various teams. Users in the workspace are configured\ninto groups, which are used for setting up data access using ACLs.\nThe user_ltv table has the following schema:\nemail STRING, age INT, ltv INT\nThe following view definition is executed:\nAn analyst who is not a member of the auditing group executes the following query:\nSELECT * FROM user_ltv_no_minors\nWhich statement describes the results returned by this query?",
    "options": {
      "A": "All columns will be displayed normally for those records that have an age greater than 17; records not meeting this condition will be\nomitted.",
      "B": "All age values less than 18 will be returned as null values, all other columns will be returned with the values in user_ltv.",
      "C": "All values for the age column will be returned as null values, all other columns will be returned with the values in user_ltv.",
      "D": "All columns will be displayed normally for those records that have an age greater than 18; records not meeting this condition will be\nomitted."
    },
    "answer": "D",
    "question_vi": "View user_ltv_no_minors dùng VIEWS WITH MASK: CASE WHEN age < 18 THEN NULL ELSE age END. Người không thuộc nhóm auditing query SELECT * FROM view này, kết quả thế nào?",
    "options_vi": {
      "A": "Hiển thị bình thường các dòng age > 17, ẩn các dòng không thỏa.",
      "B": "Trả về age < 18 là null, cột khác giữ nguyên.",
      "C": "Tất cả giá trị cột age đều null, cột khác giữ nguyên.",
      "D": "Hiển thị bình thường các dòng age > 18, ẩn dòng không thỏa."
    },
    "explanation_vi": "Mask đặt age thành NULL cho mọi dòng (vì người dùng không có quyền auditing), nên toàn bộ cột age bị null, cột khác giữ nguyên (C).",
    "page": null,
    "image": "img/q_163.jpg"
  },
  {
    "id": 164,
    "topic": 1,
    "question": "All records from an Apache Kafka producer are being ingested into a single Delta Lake table with the following schema:\nkey BINARY, value BINARY, topic STRING, partition LONG, offset LONG, timestamp LONG\nThere are 5 unique topics being ingested. Only the \"registration\" topic contains Personal Identifiable Information (PII). The company wishes to\nrestrict access to PII. The company also wishes to only retain records containing PII in this table for 14 days after initial ingestion. However, for\nnon-PII information, it would like to retain these records indefinitely.\nWhich solution meets the requirements?",
    "options": {
      "A": "All data should be deleted biweekly; Delta Lake's time travel functionality should be leveraged to maintain a history of non-PII information.",
      "B": "Data should be partitioned by the registration field, allowing ACLs and delete statements to be set for the PII directory.",
      "C": "Data should be partitioned by the topic field, allowing ACLs and delete statements to leverage partition boundaries.",
      "D": "Separate object storage containers should be specified based on the partition field, allowing isolation at the storage level."
    },
    "answer": "C",
    "question_vi": "Một bảng Delta lưu tất cả topic Kafka; chỉ topic registration có PII và cần giữ 14 ngày, còn lại giữ vô hạn. Giải pháp?",
    "options_vi": {
      "A": "Xóa toàn bộ dữ liệu mỗi 2 tuần và dùng time travel lưu lịch sử non-PII.",
      "B": "Partition theo trường registration để đặt ACL và delete trên thư mục PII.",
      "C": "Partition theo topic để dùng ACL và lệnh delete theo ranh giới partition.",
      "D": "Đặt container lưu trữ khác nhau theo partition để cô lập ở mức storage."
    },
    "explanation_vi": "Partition theo topic cho phép đặt quyền và lệnh VACUUM/DELETE riêng trên partition registration trong 14 ngày, giữ topic khác lâu dài (C).",
    "page": null,
    "image": "img/q_164.jpg"
  },
  {
    "id": 165,
    "topic": 1,
    "question": "The data governance team is reviewing code used for deleting records for compliance with GDPR. The following logic has been implemented to\npropagate delete requests from the user_lookup table to the user_aggregates table.\nAssuming that user_id is a unique identifying key and that all users that have requested deletion have been removed from the user_lookup table,\nwhich statement describes whether successfully executing the above logic guarantees that the records to be deleted from the user_aggregates\ntable are no longer accessible and why?",
    "options": {
      "A": "No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command.",
      "B": "No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data\nfiles.",
      "C": "No; the change data feed only tracks inserts and updates, not deleted records.",
      "D": "Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records."
    },
    "answer": "B",
    "question_vi": "Xóa người dùng khỏi user_lookup rồi delete user_aggregates theo user_id. Việc này có đảm bảo bản ghi bị xóa không còn truy cập được không?",
    "options_vi": {
      "A": "Không; lệnh DELETE Delta chỉ ACID khi kết hợp MERGE.",
      "B": "Không; file chứa bản ghi xóa vẫn truy cập được qua time travel cho đến khi VACUUM dọn file.",
      "C": "Không; change data feed chỉ theo dõi insert/update, không theo dõi delete.",
      "D": "Có; ACID của Delta bảo đảm DELETE thành công và xóa vĩnh viễn."
    },
    "explanation_vi": "DELETE chỉ đánh dấu file; dữ liệu vẫn truy vấn được qua time travel cho đến khi VACUUM loại bỏ, nên chưa đảm bảo xóa vĩnh viễn (B).",
    "page": null,
    "image": "img/q_165.jpg"
  },
  {
    "id": 166,
    "topic": 1,
    "question": "An external object storage container has been mounted to the location /mnt/finance_eda_bucket.\nThe following logic was executed to create a database for the finance team:\nAfter the database was successfully created and permissions configured, a member of the finance team runs the following code:\nIf all users on the finance team are members of the finance group, which statement describes how the tx_sales table will be created?",
    "options": {
      "A": "A logical table will persist the query plan to the Hive Metastore in the Databricks control plane.",
      "B": "An external table will be created in the storage container mounted to /mnt/finance_eda_bucket.",
      "C": "A managed table will be created in the DBFS root storage container.",
      "D": "An managed table will be created in the storage container mounted to /mnt/finance_eda_bucket."
    },
    "answer": "B",
    "question_vi": "Mount /mnt/finance_eda_bucket, tạo database finance_eda LOCATION '/mnt/finance_eda_bucket'. Người finance chạy CREATE TABLE AS SELECT ... tx_sales. Bảng được tạo thế nào?",
    "options_vi": {
      "A": "Bảng logic lưu kế hoạch truy vấn trong Hive Metastore control plane.",
      "B": "Bảng external được tạo trong container gắn ở /mnt/finance_eda_bucket.",
      "C": "Bảng managed được tạo ở DBFS root.",
      "D": "Bảng managed được tạo trong container /mnt/finance_eda_bucket."
    },
    "explanation_vi": "Database đặt LOCATION vào mount nên bảng CTAS mặc định là external trong thư mục đó; nên tx_sales nằm ở /mnt/finance_eda_bucket (B).",
    "page": null,
    "image": "img/q_166.jpg"
  },
  {
    "id": 167,
    "topic": 1,
    "question": "The data engineering team has been tasked with configuring connections to an external database that does not have a supported native\nconnector with Databricks. The external database already has data security configured by group membership. These groups map directly to user\ngroups already created in Databricks that represent various teams within the company.\nA new login credential has been created for each group in the external database. The Databricks Utilities Secrets module will be used to make\nthese credentials available to Databricks users.\nAssuming that all the credentials are configured correctly on the external database and group membership is properly configured on Databricks,\nwhich statement describes how teams can be granted the minimum necessary access to using these credentials?",
    "options": {
      "A": "No additional configuration is necessary as long as all users are configured as administrators in the workspace where secrets have been\nadded.",
      "B": "\"Read\" permissions should be set on a secret key mapped to those credentials that will be used by a given team.",
      "C": "\"Read\" permissions should be set on a secret scope containing only those credentials that will be used by a given team.",
      "D": "\"Manage\" permissions should be set on a secret scope containing only those credentials that will be used by a given team."
    },
    "answer": "B",
    "question_vi": "Kết nối DB ngoài không có connector; mỗi group có credential riêng trong Secrets. Cách cấp quyền tối thiểu cho từng team?",
    "options_vi": {
      "A": "Không cần cấu hình thêm nếu mọi user là admin workspace có secrets.",
      "B": "Đặt quyền Read trên secret key chứa credential dùng cho team.",
      "C": "Đặt quyền Read trên secret scope chỉ chứa các credential của team đó.",
      "D": "Đặt quyền Manage trên secret scope chỉ chứa credential của team đó."
    },
    "explanation_vi": "Phân quyền tối thiểu bằng cách cho group quyền Read trên scope chứa đúng các secret họ cần; không cần Manage (C).",
    "page": null,
    "image": "img/q_167.jpg"
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
    "question_vi": "Thời gian lưu lịch sử chạy job là bao lâu?",
    "options_vi": {
      "A": "Lưu cho đến khi bạn export hoặc xóa log chạy job.",
      "B": "Lưu 30 ngày; trong thời gian đó có thể gửi log tới DBFS hoặc S3.",
      "C": "Lưu 60 ngày; trong thời gian đó có thể export kết quả notebook chạy ra HTML.",
      "D": "Lưu 60 ngày, sau đó log được lưu trữ."
    },
    "explanation_vi": "Databricks giữ lịch sử chạy job 60 ngày; sau đó sẽ bị dọn/archived, nên đáp án C phù hợp mô tả.",
    "page": null,
    "image": "img/q_168.jpg"
  },
  {
    "id": 169,
    "topic": 1,
    "question": "A data engineer, User A, has promoted a new pipeline to production by using the REST API to programmatically create several jobs. A DevOps\nengineer, User B, has configured an external orchestration tool to trigger job runs through the REST API. Both users authorized the REST API calls\nusing their personal access tokens.\nWhich statement describes the contents of the workspace audit logs concerning these events?",
    "options": {
      "A": "Because the REST API was used for job creation and triggering runs, a Service Principal will be automatically used to identify these events.",
      "B": "Because User A created the jobs, their identity will be associated with both the job creation events and the job run events.",
      "C": "Because these events are managed separately, User A will have their identity associated with the job creation events and User B will have\ntheir identity associated with the job run events.",
      "D": "Because the REST API was used for job creation and triggering runs, user identity will not be captured in the audit logs."
    },
    "answer": "C",
    "question_vi": "User A tạo các job qua REST API bằng personal access token; User B dùng công cụ ngoài để kích chạy job cũng qua REST API bằng token riêng. Audit log sẽ ghi nhận thế nào?",
    "options_vi": {
      "A": "Do dùng REST API nên tự động gán Service Principal cho các sự kiện.",
      "B": "Vì User A tạo job nên danh tính họ sẽ gắn cho cả sự kiện tạo và chạy job.",
      "C": "Vì hai sự kiện tách biệt, log tạo job gắn User A còn log chạy job gắn User B.",
      "D": "Dùng REST API nên audit log không lưu danh tính người dùng."
    },
    "explanation_vi": "Audit log lưu thực thể ký API call. User A tạo job nên log tạo job mang danh A; User B kích chạy nên log run mang danh B.",
    "page": null,
    "image": "img/q_169.jpg"
  },
  {
    "id": 170,
    "topic": 1,
    "question": "A distributed team of data analysts share computing resources on an interactive cluster with autoscaling configured. In order to better manage\ncosts and query throughput, the workspace administrator is hoping to evaluate whether cluster upscaling is caused by many concurrent users or\nresource-intensive queries.\nIn which location can one review the timeline for cluster resizing events?",
    "options": {
      "A": "Workspace audit logs",
      "B": "Driver's log file",
      "C": "Ganglia",
      "D": "Cluster Event Log"
    },
    "answer": "D",
    "question_vi": "Nhóm analyst dùng cluster interactive autoscaling; admin muốn xem timeline scale để biết do nhiều người hay truy vấn nặng. Xem ở đâu?",
    "options_vi": {
      "A": "Workspace audit logs",
      "B": "Driver log",
      "C": "Ganglia",
      "D": "Cluster Event Log"
    },
    "explanation_vi": "Cluster Event Log ghi các sự kiện scale in/out theo thời gian, phù hợp để phân tích nguyên nhân.",
    "page": null,
    "image": "img/q_170.jpg"
  },
  {
    "id": 171,
    "topic": 1,
    "question": "When evaluating the Ganglia Metrics for a given cluster with 3 executor nodes, which indicator would signal proper utilization of the VM's\nresources?",
    "options": {
      "A": "The five Minute Load Average remains consistent/flat",
      "B": "CPU Utilization is around 75%",
      "C": "Network I/O never spikes",
      "D": "Total Disk Space remains constant"
    },
    "answer": "B",
    "question_vi": "Xem Ganglia cho cluster 3 executor, chỉ số nào cho thấy tài nguyên được dùng hợp lý?",
    "options_vi": {
      "A": "Five Minute Load Average phẳng",
      "B": "CPU Utilization khoảng 75%",
      "C": "Network I/O không bao giờ spike",
      "D": "Tổng dung lượng đĩa giữ nguyên"
    },
    "explanation_vi": "CPU quanh 70–80% cho thấy đang tận dụng máy nhưng chưa bão hòa; các chỉ số khác không đủ đánh giá.",
    "page": null,
    "image": "img/q_171.jpg"
  },
  {
    "id": 172,
    "topic": 1,
    "question": "The data engineer is using Spark's MEMORY_ONLY storage level.\nWhich indicators should the data engineer look for in the Spark UI's Storage tab to signal that a cached table is not performing optimally?",
    "options": {
      "A": "On Heap Memory Usage is within 75% of Off Heap Memory Usage",
      "B": "The RDD Block Name includes the “*” annotation signaling a failure to cache",
      "C": "Size on Disk is > 0",
      "D": "The number of Cached Partitions > the number of Spark Partitions"
    },
    "answer": "B",
    "question_vi": "Dùng storage level MEMORY_ONLY. Dấu hiệu trong Storage tab cho thấy cache bảng không tối ưu?",
    "options_vi": {
      "A": "On-heap Memory Usage đạt 75% Off-heap",
      "B": "RDD Block Name có dấu * báo cache thất bại",
      "C": "Size on Disk > 0",
      "D": "Cached Partitions > Spark Partitions"
    },
    "explanation_vi": "Dấu * cho biết block không được giữ trong bộ nhớ, nghĩa là cache không thành công/không tối ưu.",
    "page": null,
    "image": "img/q_172.jpg"
  },
  {
    "id": 173,
    "topic": 1,
    "question": "Review the following error traceback:\nWhich statement describes the error being raised?",
    "options": {
      "A": "There is a syntax error because the heartrate column is not correctly identified as a column.",
      "B": "There is no column in the table named heartrateheartrateheartrate",
      "C": "There is a type error because a column object cannot be multiplied.",
      "D": "There is a type error because a DataFrame object cannot be multiplied."
    },
    "answer": "B",
    "question_vi": "Thông báo lỗi (traceback) xuất hiện. Lỗi là gì?",
    "options_vi": {
      "A": "Lỗi cú pháp vì cột heartrate không nhận diện đúng",
      "B": "Không có cột tên heartrateheartrateheartrate",
      "C": "Lỗi kiểu vì object Column không nhân được",
      "D": "Lỗi kiểu vì DataFrame không nhân được"
    },
    "explanation_vi": "Tên cột bị ghép lặp ba lần nên Spark báo column not found: heartrateheartrateheartrate.",
    "page": null,
    "image": "img/q_173.jpg"
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
    "question_vi": "Cách cài gói Python phạm vi notebook cho tất cả node trong cluster đang chạy?",
    "options_vi": {
      "A": "Chạy source env/bin/activate trong setup script",
      "B": "Cài từ PyPI qua UI cluster",
      "C": "Dùng %pip install trong cell notebook",
      "D": "Dùng %sh pip install trong cell"
    },
    "explanation_vi": "%pip trong notebook đồng bộ gói tới driver và worker, scope notebook; các lựa chọn khác không đúng phạm vi.",
    "page": null,
    "image": "img/q_174.jpg"
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
    "question_vi": "Dòng đầu tiên của notebook Python Databricks khi mở ở text editor là gì?",
    "options_vi": {
      "A": "%python",
      "B": "// Databricks notebook source",
      "C": "# Databricks notebook source",
      "D": "-- Databricks notebook source"
    },
    "explanation_vi": "Databricks xuất notebook với header dạng comment '# Databricks notebook source'.",
    "page": null,
    "image": "img/q_175.jpg"
  },
  {
    "id": 176,
    "topic": 1,
    "question": "Incorporating unit tests into a PySpark application requires upfront attention to the design of your jobs, or a potentially significant refactoring of\nexisting code.\nWhich benefit offsets this additional effort?",
    "options": {
      "A": "Improves the quality of your data",
      "B": "Validates a complete use case of your application",
      "C": "Troubleshooting is easier since all steps are isolated and tested individually",
      "D": "Ensures that all steps interact correctly to achieve the desired end result"
    },
    "answer": "C",
    "question_vi": "Lợi ích bù đắp công sức thiết kế job để thêm unit test PySpark?",
    "options_vi": {
      "A": "Cải thiện chất lượng dữ liệu",
      "B": "Xác thực toàn bộ use case ứng dụng",
      "C": "Dễ troubleshooting vì từng bước được cô lập và test riêng",
      "D": "Đảm bảo mọi bước tương tác đúng để đạt kết quả"
    },
    "explanation_vi": "Unit test cô lập từng bước giúp tìm lỗi nhanh và rõ, giảm thời gian khắc phục.",
    "page": null,
    "image": "img/q_176.jpg"
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
    "question_vi": "Integration testing là gì?",
    "options_vi": {
      "A": "Xác thực một use case ứng dụng",
      "B": "Xác thực hành vi của từng thành phần riêng lẻ",
      "C": "Bắt buộc phải có framework tự động",
      "D": "Xác thực tương tác giữa các hệ/tiểu hệ của ứng dụng"
    },
    "explanation_vi": "Integration test tập trung vào tương tác giữa subsystem, khác với unit test ở từng thành phần.",
    "page": null,
    "image": "img/q_177.jpg"
  },
  {
    "id": 178,
    "topic": 1,
    "question": "The Databricks CLI is used to trigger a run of an existing job by passing the job_id parameter. The response that the job run request has been\nsubmitted successfully includes a field run_id.\nWhich statement describes what the number alongside this field represents?",
    "options": {
      "A": "The job_id and number of times the job has been run are concatenated and returned.",
      "B": "The globally unique ID of the newly triggered run.",
      "C": "The number of times the job definition has been run in this workspace.",
      "D": "The job_id is returned in this field."
    },
    "answer": "B",
    "question_vi": "Databricks CLI trigger run trả về run_id; con số này là gì?",
    "options_vi": {
      "A": "job_id ghép với số lần chạy",
      "B": "ID duy nhất của lần chạy vừa tạo",
      "C": "Số lần job đã chạy trong workspace",
      "D": "job_id được trả về trong field này"
    },
    "explanation_vi": "run_id là định danh duy nhất cho run mới được kích hoạt.",
    "page": null,
    "image": "img/q_178.jpg"
  },
  {
    "id": 179,
    "topic": 1,
    "question": "A Databricks job has been configured with three tasks, each of which is a Databricks notebook. Task A does not depend on other tasks. Tasks B\nand C run in parallel, with each having a serial dependency on task",
    "options": {
      "A": "All logic expressed in the notebook associated with tasks A and B will have been successfully completed; some operations in task C may\nhave completed successfully.",
      "B": "Unless all tasks complete successfully, no changes will be committed to the Lakehouse; because task C failed, all commits will be rolled\nback automatically.",
      "C": "Because all tasks are managed as a dependency graph, no changes will be committed to the Lakehouse until all tasks have successfully\nbeen completed.",
      "D": "All logic expressed in the notebook associated with tasks A and B will have been successfully completed; any changes made in task C will\nbe rolled back due to task failure."
    },
    "answer": "A",
    "question_vi": "Job có 3 task notebook: A độc lập, B và C phụ thuộc A, B và C chạy song song. Task C thất bại. Điều nào đúng?",
    "options_vi": {
      "A": "Logic của A và B đã hoàn tất; một số thao tác của C có thể đã chạy xong",
      "B": "Nếu có task fail thì mọi thay đổi Lakehouse bị rollback tự động",
      "C": "Đồ thị phụ thuộc đảm bảo chỉ commit khi tất cả task hoàn tất",
      "D": "Logic A và B hoàn tất; thay đổi của C sẽ bị rollback do task fail"
    },
    "explanation_vi": "Mỗi task chạy độc lập; A và B hoàn thành vẫn giữ kết quả, C dừng tại điểm lỗi, không có rollback toàn cục.",
    "page": null,
    "image": "img/q_179.jpg"
  },
  {
    "id": 180,
    "topic": 1,
    "question": "When scheduling Structured Streaming jobs for production, which configuration automatically recovers from query failures and keeps costs low?",
    "options": {
      "A": "Cluster: New Job Cluster;\nRetries: Unlimited;\nMaximum Concurrent Runs: 1",
      "B": "Cluster: New Job Cluster;\nRetries: Unlimited;\nMaximum Concurrent Runs: Unlimited",
      "C": "Cluster: Existing All-Purpose Cluster;\nRetries: Unlimited;\nMaximum Concurrent Runs: 1",
      "D": "Cluster: New Job Cluster;\nRetries: None;\nMaximum Concurrent Runs: 1\nCorrect Answer:A\n  RandomForest1 year ago\nSelected Answer: A\nThe correct answer is A: The unlimited retries will take care of query failures while the max concurrent runs = 1 will keep the costs low\nupvoted 1 times\n\n---PAGE 332---"
    },
    "answer": null,
    "question_vi": "Lên lịch Structured Streaming production để tự phục hồi khi lỗi và tiết kiệm chi phí. Cấu hình nào phù hợp?",
    "options_vi": {
      "A": "New Job Cluster; Retries: Unlimited; Max Concurrent Runs: 1",
      "B": "New Job Cluster; Retries: Unlimited; Max Concurrent Runs: Unlimited",
      "C": "Existing All-Purpose Cluster; Retries: Unlimited; Max Concurrent Runs: 1",
      "D": "New Job Cluster; Retries: None; Max Concurrent Runs: 1"
    },
    "explanation_vi": "Retries vô hạn giúp tự phục hồi, max concurrent = 1 tránh trùng chạy và tiết kiệm chi phí.",
    "page": null,
    "image": "img/q_180.jpg"
  },
  {
    "id": 181,
    "topic": 1,
    "question": "A Delta Lake table was created with the below query:\nRealizing that the original query had a typographical error, the below code was executed:\nALTER TABLE prod.sales_by_stor RENAME TO prod.sales_by_store\nWhich result will occur after running the second command?",
    "options": {
      "A": "The table reference in the metastore is updated.",
      "B": "All related files and metadata are dropped and recreated in a single ACID transaction.",
      "C": "The table name change is recorded in the Delta transaction log.",
      "D": "A new Delta transaction log is created for the renamed table.\nCorrect Answer:A\n  d3567cc7 months, 4 weeks ago\nSelected Answer: A\nsame quesion listed before with answer A which is corrected one\nupvoted 3 times\n  Stalker2009 months, 3 weeks ago\nSelected Answer: A\nThe Hive Metastore (or Unity Catalog) updates the logical table name. The data and files stay untouched.\nupvoted 3 times\n  lakime11 months, 1 week ago\nSelected Answer: C\nwhile the metastore is updated, the key mechanism for tracking changes in Delta Lake is the transaction log.\nupvoted 2 times\n\n---PAGE 333---"
    },
    "answer": null,
    "question_vi": "Delta table được tạo rồi rename bằng ALTER TABLE ... RENAME TO. Kết quả sau lệnh thứ hai là gì?",
    "options_vi": {
      "A": "Tham chiếu tên bảng trong metastore được cập nhật",
      "B": "File và metadata bị drop rồi tạo lại trong một giao dịch ACID",
      "C": "Việc đổi tên được ghi vào Delta transaction log",
      "D": "Tạo transaction log mới cho bảng mới"
    },
    "explanation_vi": "Đổi tên chỉ cập nhật mục trong metastore/Unity Catalog; dữ liệu và log vẫn giữ nguyên.",
    "page": null,
    "image": "img/q_181.jpg"
  },
  {
    "id": 182,
    "topic": 1,
    "question": "The data engineering team has configured a Databricks SQL query and alert to monitor the values in a Delta Lake table. The\nrecent_sensor_recordings table contains an identifying sensor_id alongside the timestamp and temperature for the most recent 5 minutes of\nrecordings.\nThe below query is used to create the alert:\nThe query is set to refresh each minute and always completes in less than 10 seconds. The alert is set to trigger when mean (temperature) > 120.\nNotifications are triggered to be sent at most every 1 minute.\nIf this alert raises notifications for 3 consecutive minutes and then stops, which statement must be true?",
    "options": {
      "A": "The total average temperature across all sensors exceeded 120 on three consecutive executions of the query",
      "B": "The average temperature recordings for at least one sensor exceeded 120 on three consecutive executions of the query",
      "C": "The source query failed to update properly for three consecutive minutes and then restarted",
      "D": "The maximum temperature recording for at least one sensor exceeded 120 on three consecutive executions of the query"
    },
    "answer": "B",
    "question_vi": "Alert Databricks SQL (refresh mỗi phút) gửi thông báo khi mean(temperature) > 120. Nếu thông báo 3 phút liên tiếp rồi dừng, điều chắc chắn đúng là gì?",
    "options_vi": {
      "A": "Trung bình nhiệt độ toàn bộ sensor vượt 120 trong ba lần thực thi",
      "B": "Trung bình của ít nhất một sensor vượt 120 trong ba lần thực thi",
      "C": "Query nguồn không cập nhật đúng ba phút rồi chạy lại",
      "D": "Nhiệt độ tối đa của ít nhất một sensor vượt 120 trong ba lần thực thi"
    },
    "explanation_vi": "Điều kiện alert dựa trên mean; nếu cảnh báo lặp 3 lần thì ít nhất một sensor có mean >120 ở cả ba lần.",
    "page": null,
    "image": "img/q_182.jpg"
  },
  {
    "id": 183,
    "topic": 1,
    "question": "A junior developer complains that the code in their notebook isn't producing the correct results in the development environment. A shared\nscreenshot reveals that while they're using a notebook versioned with Databricks Repos, they're using a personal branch that contains old logic.\nThe desired branch named dev-2.3.9 is not available from the branch selection dropdown.\nWhich approach will allow this developer to review the current logic for this notebook?",
    "options": {
      "A": "Use Repos to make a pull request use the Databricks REST API to update the current branch to dev-2.3.9",
      "B": "Use Repos to pull changes from the remote Git repository and select the dev-2.3.9 branch.",
      "C": "Use Repos to checkout the dev-2.3.9 branch and auto-resolve conflicts with the current branch",
      "D": "Use Repos to merge the current branch and the dev-2.3.9 branch, then make a pull request to sync with the remote repository\nCorrect Answer:B\n  ealpuche5 months ago\nSelected Answer: B\nPulling changes fetches all remote branches into the local workspace, after which the developer can select the dev-2.3.9 branch from the dropdown\nand review the current logic.\nupvoted 1 times\n\n---PAGE 335---"
    },
    "answer": null,
    "question_vi": "Developer đang ở branch cá nhân cũ, không thấy branch dev-2.3.9 trong dropdown Repos. Làm sao xem logic mới nhất?",
    "options_vi": {
      "A": "Tạo pull request hoặc dùng REST API đổi branch",
      "B": "Pull từ remote để fetch các branch rồi chọn dev-2.3.9",
      "C": "Checkout dev-2.3.9 và tự động resolve conflict",
      "D": "Merge branch hiện tại với dev-2.3.9 rồi tạo pull request"
    },
    "explanation_vi": "Pull sẽ tải các branch từ remote; sau đó có thể chọn branch dev-2.3.9 để xem code mới.",
    "page": null,
    "image": "img/q_183.jpg"
  },
  {
    "id": 184,
    "topic": 1,
    "question": "Two of the most common data locations on Databricks are the DBFS root storage and external object storage mounted with dbutils.fs.mount().\nWhich of the following statements is correct?",
    "options": {
      "A": "DBFS is a file system protocol that allows users to interact with files stored in object storage using syntax and guarantees similar to Unix\nfile systems.",
      "B": "By default, both the DBFS root and mounted data sources are only accessible to workspace administrators.",
      "C": "The DBFS root is the most secure location to store data, because mounted storage volumes must have full public read and write\npermissions.",
      "D": "The DBFS root stores files in ephemeral block volumes attached to the driver, while mounted directories will always persist saved data to\nexternal storage between sessions.\nCorrect Answer:A\nCurrently there are no comments in this discussion, be the first to comment!\n\n---PAGE 336---"
    },
    "answer": null,
    "question_vi": "Hai vị trí dữ liệu phổ biến: DBFS root và mount dbutils.fs.mount(). Phát biểu nào đúng?",
    "options_vi": {
      "A": "DBFS là giao thức giúp thao tác object storage với cú pháp/đảm bảo như file system Unix",
      "B": "Mặc định cả DBFS root và mount chỉ admin mới truy cập",
      "C": "DBFS root an toàn nhất vì mount bắt buộc public read/write",
      "D": "DBFS root lưu trên đĩa tạm của driver, mount luôn lưu ngoài và bền giữa các session"
    },
    "explanation_vi": "DBFS là lớp ảo trên object storage, cho phép truy cập như hệ thống file; các lựa chọn khác sai.",
    "page": null,
    "image": "img/q_184.jpg"
  },
  {
    "id": 185,
    "topic": 1,
    "question": "An upstream system has been configured to pass the date for a given batch of data to the Databricks Jobs API as a parameter. The notebook to\nbe scheduled will use this parameter to load data with the following code:\ndf = spark.read.format(\"parquet\").load(f\"/mnt/source/(date)\")\nWhich code block should be used to create the date Python variable used in the above code block?",
    "options": {
      "A": "date = spark.conf.get(\"date\")",
      "B": "import sys\ndate = sys.argv[1]",
      "C": "date = dbutils.notebooks.getParam(\"date\")",
      "D": "dbutils.widgets.text(\"date\", \"null\")\ndate = dbutils.widgets.get(\"date\")\nCorrect Answer:D\n  ealpuche5 months ago\nSelected Answer: D\nSurely, B\nupvoted 1 times\n  ealpuche5 months ago\nI meant D\nupvoted 1 times\n\n---PAGE 337---"
    },
    "answer": null,
    "question_vi": "Jobs API truyền tham số date cho notebook đọc file f\"/mnt/source/(date)\". Tạo biến date thế nào?",
    "options_vi": {
      "A": "date = spark.conf.get(\"date\")",
      "B": "import sys; date = sys.argv[1]",
      "C": "date = dbutils.notebooks.getParam(\"date\")",
      "D": "dbutils.widgets.text(\"date\", \"null\"); date = dbutils.widgets.get(\"date\")"
    },
    "explanation_vi": "Thông số job được đưa vào notebook qua widgets; cần khai báo widget và lấy giá trị bằng dbutils.widgets.get.",
    "page": null,
    "image": "img/q_185.jpg"
  },
  {
    "id": 186,
    "topic": 1,
    "question": "The Databricks workspace administrator has configured interactive clusters for each of the data engineering groups. To control costs, clusters are\nset to terminate after 30 minutes of inactivity. Each user should be able to execute workloads against their assigned clusters at any time of the\nday.\nAssuming users have been added to a workspace but not granted any permissions, which of the following describes the minimal permissions a\nuser would need to start and attach to an already configured cluster.",
    "options": {
      "A": "\"Can Manage\" privileges on the required cluster",
      "B": "Cluster creation allowed, \"Can Restart\" privileges on the required cluster",
      "C": "Cluster creation allowed, \"Can Attach To\" privileges on the required cluster",
      "D": "\"Can Restart\" privileges on the required cluster"
    },
    "answer": "C",
    "question_vi": "Cluster interactive tự tắt sau 30 phút idle. Người dùng mới chỉ được thêm vào workspace, cần quyền tối thiểu nào để start và attach cluster sẵn có?",
    "options_vi": {
      "A": "Quyền Can Manage trên cluster",
      "B": "Được phép create cluster + Can Restart trên cluster",
      "C": "Được phép create cluster + Can Attach To trên cluster",
      "D": "Can Restart trên cluster"
    },
    "explanation_vi": "Để khởi động cluster cần entitlement create cluster; để gắn notebook cần quyền Can Attach To; không cần quản trị toàn phần.",
    "page": null,
    "image": "img/q_186.jpg"
  },
  {
    "id": 187,
    "topic": 1,
    "question": "The data science team has created and logged a production model using MLflow. The following code correctly imports and applies the production\nmodel to output the predictions as a new DataFrame named preds with the schema \"customer_id LONG, predictions DOUBLE, date DATE\".\nThe data science team would like predictions saved to a Delta Lake table with the ability to compare all predictions across time. Churn predictions\nwill be made at most once per day.\nWhich code block accomplishes this task while minimizing potential compute costs?",
    "options": {
      "A": "preds.write.mode(\"append\").saveAsTable(\"churn_preds\")",
      "B": "preds.write.format(\"delta\").save(\"/preds/churn_preds\")",
      "C": "",
      "D": ""
    },
    "answer": "C",
    "question_vi": "Team khoa học dữ liệu đã log model MLflow; preds DataFrame cần lưu Delta để so sánh dự đoán theo thời gian (tối đa 1 lần/ngày). Đoạn mã nào đáp ứng và tiết kiệm compute?",
    "options_vi": {
      "A": "preds.write.mode(\"append\").saveAsTable(\"churn_preds\")",
      "B": "preds.write.format(\"delta\").save(\"/preds/churn_preds\")",
      "C": "(Tùy chọn C không hiển thị trong nguồn gốc)",
      "D": "(Tùy chọn D không hiển thị trong nguồn gốc)"
    },
    "explanation_vi": "Đáp án gốc chọn C (tùy chọn bị thiếu). Ý tưởng là lưu bảng Delta dạng append để giữ lịch sử; các lựa chọn khác thiếu đăng ký bảng hoặc không tiện truy vấn.",
    "page": null,
    "image": "img/q_187.jpg"
  },
  {
    "id": 188,
    "topic": 1,
    "question": "The following code has been migrated to a Databricks notebook from a legacy workload:\nThe code executes successfully and provides the logically correct results, however, it takes over 20 minutes to extract and load around 1 GB of\ndata.\nWhich statement is a possible explanation for this behavior?",
    "options": {
      "A": "%sh triggers a cluster restart to collect and install Git. Most of the latency is related to cluster startup time.",
      "B": "Instead of cloning, the code should use %sh pip install so that the Python code can get executed in parallel across all nodes in a cluster.",
      "C": "%sh does not distribute file moving operations; the final line of code should be updated to use %fs instead.",
      "D": "%sh executes shell code on the driver node. The code does not take advantage of the worker nodes or Databricks optimized Spark.\nCorrect Answer:D\n  skgggggg1 month, 1 week ago\nSelected Answer: D\ncorrect\nupvoted 1 times\n\n---PAGE 341---"
    },
    "answer": null,
    "question_vi": "Đoạn code di trú dùng %sh git clone rồi chạy Python mất 20 phút cho ~1GB dữ liệu dù logic đúng. Giải thích khả dĩ?",
    "options_vi": {
      "A": "%sh kích restart cluster để cài Git nên chậm do khởi động",
      "B": "Nên dùng %sh pip install để Python chạy song song trên tất cả node",
      "C": "%sh không phân tán thao tác move file; dòng cuối nên dùng %fs",
      "D": "%sh chạy trên driver nên không tận dụng worker hay Spark tối ưu"
    },
    "explanation_vi": "Lệnh %sh chỉ chạy trên driver, không phân tán nên thao tác IO/ETL diễn ra đơn luồng => rất chậm.",
    "page": null,
    "image": "img/q_188.jpg"
  },
  {
    "id": 189,
    "topic": 1,
    "question": "A Delta table of weather records is partitioned by date and has the below schema:\ndate DATE, device_id INT, temp FLOAT, latitude FLOAT, longitude FLOAT\nTo find all the records from within the Arctic Circle, you execute a query with the below filter:\nlatitude > 66.3\nWhich statement describes how the Delta engine identifies which files to load?",
    "options": {
      "A": "All records are cached to an operational database and then the filter is applied",
      "B": "The Parquet file footers are scanned for min and max statistics for the latitude column",
      "C": "The Hive metastore is scanned for min and max statistics for the latitude column",
      "D": "The Delta log is scanned for min and max statistics for the latitude column"
    },
    "answer": "B",
    "question_vi": "Bảng Delta thời tiết partition theo date, schema có latitude. Filter latitude > 66.3 để lấy vùng Bắc Cực. Delta engine tải file nào?",
    "options_vi": {
      "A": "Cache toàn bộ bản ghi vào DB vận hành rồi lọc",
      "B": "Quét footer Parquet lấy min/max latitude",
      "C": "Quét Hive metastore lấy min/max latitude",
      "D": "Quét Delta log lấy min/max latitude"
    },
    "explanation_vi": "Delta dùng thống kê min/max trong footer Parquet để loại file không phù hợp (data skipping).",
    "page": null,
    "image": "img/q_189.jpg"
  },
  {
    "id": 190,
    "topic": 1,
    "question": "In order to prevent accidental commits to production data, a senior data engineer has instituted a policy that all development work will reference\nclones of Delta Lake tables. After testing both DEEP and SHALLOW CLONE, development tables are created using SHALLOW CLONE.\nA few weeks after initial table creation, the cloned versions of several tables implemented as Type 1 Slowly Changing Dimension (SCD) stop\nworking. The transaction logs for the source tables show that VACUUM was run the day before.\nWhich statement describes why the cloned tables are no longer working?",
    "options": {
      "A": "Because Type 1 changes overwrite existing records, Delta Lake cannot guarantee data consistency for cloned tables.",
      "B": "Running VACUUM automatically invalidates any shallow clones of a table; DEEP CLONE should always be used when a cloned table will be\nrepeatedly queried.",
      "C": "The data files compacted by VACUUM are not tracked by the cloned metadata; running REFRESH on the cloned table will pull in recent\nchanges.",
      "D": "The metadata created by the CLONE operation is referencing data files that were purged as invalid by the VACUUM command.\nCorrect Answer:D\n  RajeshMP20236 months, 1 week ago\nSelected Answer: D\nshallow clone only copies metadata, unlike deep clone copies metadata and actual data, hence shallow clone tables will not work when vacuum on\nsource table executed, which will delete old files and hence SCD which need old datafiles.\nupvoted 1 times\n\n---PAGE 343---"
    },
    "answer": null,
    "question_vi": "Chính sách dev dùng bảng clone (SHALLOW CLONE) để tránh commit nhầm. Sau khi VACUUM nguồn, bảng clone SCD Type 1 bị lỗi. Vì sao?",
    "options_vi": {
      "A": "Do Type 1 overwrite nên Delta không đảm bảo nhất quán cho clone",
      "B": "VACUUM tự vô hiệu mọi shallow clone; luôn phải dùng DEEP CLONE",
      "C": "VACUUM compact, chỉ cần REFRESH clone để lấy thay đổi",
      "D": "Metadata clone trỏ tới file đã bị VACUUM purge nên tham chiếu bị mất"
    },
    "explanation_vi": "Shallow clone chỉ sao chép metadata trỏ tới file gốc; VACUUM xóa file cũ làm clone trỏ vào file không còn tồn tại.",
    "page": null,
    "image": "img/q_190.jpg"
  },
  {
    "id": 191,
    "topic": 1,
    "question": "A junior data engineer has configured a workload that posts the following JSON to the Databricks REST API endpoint 2.0/jobs/create.\nAssuming that all configurations and referenced resources are available, which statement describes the result of executing this workload three\ntimes?",
    "options": {
      "A": "The logic defined in the referenced notebook will be executed three times on the referenced existing all purpose cluster.",
      "B": "The logic defined in the referenced notebook will be executed three times on new clusters with the configurations of the provided cluster ID.",
      "C": "Three new jobs named \"Ingest new data\" will be defined in the workspace, but no jobs will be executed.",
      "D": "One new job named \"Ingest new data\" will be defined in the workspace, but it will not be executed."
    },
    "answer": "C",
    "question_vi": "POST 2.0/jobs/create với JSON định nghĩa job; chạy workload này 3 lần. Kết quả?",
    "options_vi": {
      "A": "Notebook được chạy ba lần trên cluster all-purpose tham chiếu",
      "B": "Notebook được chạy ba lần trên cluster mới theo config cluster ID",
      "C": "Tạo ba job mới tên \"Ingest new data\" trong workspace nhưng không chạy job nào",
      "D": "Tạo một job mới tên \"Ingest new data\" nhưng không thực thi"
    },
    "explanation_vi": "Mỗi lần gọi jobs/create tạo một định nghĩa job mới; không tự chạy nên sẽ có 3 job mới cùng tên.",
    "page": null,
    "image": "img/q_191.jpg"
  },
  {
    "id": 192,
    "topic": 1,
    "question": "A Delta Lake table in the Lakehouse named customer_churn_params is used in churn prediction by the machine learning team. The table contains\ninformation about customers derived from a number of upstream sources. Currently, the data engineering team populates this table nightly by\noverwriting the table with the current valid values derived from upstream data sources.\nImmediately after each update succeeds, the data engineering team would like to determine the difference between the new version and the\nprevious version of the table.\nGiven the current implementation, which method can be used?",
    "options": {
      "A": "Execute a query to calculate the difference between the new version and the previous version using Delta Lake’s built-in versioning and lime\ntravel functionality.",
      "B": "Parse the Delta Lake transaction log to identify all newly written data files.",
      "C": "Parse the Spark event logs to identify those rows that were updated, inserted, or deleted.",
      "D": "Execute DESCRIBE HISTORY customer_churn_params to obtain the full operation metrics for the update, including a log of all records that\nhave been added or modified.\nCorrect Answer:A\n  stopthisnow2 months, 1 week ago\nSelected Answer: A\nA - there lime is actually time.... D makes no sense\nupvoted 2 times\n  RajeshMP20236 months, 1 week ago\nSelected Answer: D\nthere is no lime history , D looks suitable\nupvoted 1 times\n\n---PAGE 345---"
    },
    "answer": null,
    "question_vi": "Bảng Delta customer_churn_params được overwrite hằng đêm. Ngay sau khi update thành công muốn so sánh phiên bản mới và trước đó. Làm thế nào?",
    "options_vi": {
      "A": "Dùng time travel/phiên bản Delta để tính chênh giữa version mới và trước",
      "B": "Parse Delta log để nhận diện file mới ghi",
      "C": "Parse Spark event log để biết các hàng cập nhật/chèn/xóa",
      "D": "DESCRIBE HISTORY để lấy log chi tiết từng bản ghi thêm/sửa"
    },
    "explanation_vi": "Delta hỗ trợ time travel; có thể truy vấn phiên bản trước rồi so sánh với phiên bản hiện tại.",
    "page": null,
    "image": "img/q_192.jpg"
  },
  {
    "id": 193,
    "topic": 1,
    "question": "A view is registered with the following code:\nBoth users and orders are Delta Lake tables.\nWhich statement describes the results of querying recent_orders?",
    "options": {
      "A": "The versions of each source table will be stored in the table transaction log; query results will be saved to DBFS with each query.",
      "B": "All logic will execute when the table is defined and store the result of joining tables to the DBFS; this stored data will be returned when the\ntable is queried.",
      "C": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query finishes.",
      "D": "All logic will execute at query time and return the result of joining the valid versions of the source tables at the time the query began."
    },
    "answer": "C",
    "question_vi": "Tạo view recent_orders join hai bảng Delta users và orders. Kết quả truy vấn view sẽ như thế nào?",
    "options_vi": {
      "A": "Version nguồn lưu trong transaction log; kết quả query được lưu DBFS mỗi lần",
      "B": "Logic chạy khi định nghĩa view và lưu kết quả join ra DBFS, query trả dữ liệu đã lưu",
      "C": "Logic chạy lúc query và trả kết quả join theo version hợp lệ tại thời điểm query kết thúc",
      "D": "Logic chạy lúc query và trả kết quả join theo version hợp lệ tại thời điểm query bắt đầu"
    },
    "explanation_vi": "View logic được thực thi mỗi lần truy vấn, dùng snapshot các bảng tại thời điểm kết thúc query.",
    "page": null,
    "image": "img/q_193.jpg"
  },
  {
    "id": 194,
    "topic": 1,
    "question": "A data engineer is performing a join operation to combine values from a static userLookup table with a streaming DataFrame streamingDF.\nWhich code block attempts to perform an invalid stream-static join?",
    "options": {
      "A": "userLookup.join(streamingDF, [\"user_id\"], how=\"right\")",
      "B": "streamingDF.join(userLookup, [\"user_id\"], how=\"inner\")",
      "C": "userLookup.join(streamingDF, [\"user_id\"), how=\"inner\")",
      "D": "userLookup.join(streamingDF, [\"user_id\"], how=\"left\")"
    },
    "answer": "D",
    "question_vi": "Join stream-static: userLookup (static) với streamingDF. Khối lệnh nào không hợp lệ?",
    "options_vi": {
      "A": "userLookup.join(streamingDF, [\"user_id\"], how=\"right\")",
      "B": "streamingDF.join(userLookup, [\"user_id\"], how=\"inner\")",
      "C": "userLookup.join(streamingDF, [\"user_id\"), how=\"inner\")",
      "D": "userLookup.join(streamingDF, [\"user_id\"], how=\"left\")"
    },
    "explanation_vi": "Với stream-static join, streaming bảng phải ở phía left cho left/outer; static left, streaming right với left join là không được hỗ trợ.",
    "page": null,
    "image": "img/q_194.jpg"
  },
  {
    "id": 195,
    "topic": 1,
    "question": "A junior data engineer has been asked to develop a streaming data pipeline with a grouped aggregation using DataFrame df. The pipeline needs to\ncalculate the average humidity and average temperature for each non-overlapping five-minute interval. Incremental state information should be\nmaintained for 10 minutes for late-arriving data.\nStreaming DataFrame df has the following schema:\n\"device_id INT, event_time TIMESTAMP, temp FLOAT, humidity FLOAT\"\nCode block:\nChoose the response that correctly fills in the blank within the code block to complete this task.",
    "options": {
      "A": "withWatermark(\"event_time\", \"10 minutes\")",
      "B": "awaitArrival(\"event_time\", \"10 minutes\")",
      "C": "await(\"event_time + ‘10 minutes'\")",
      "D": "slidingWindow(\"event_time\", \"10 minutes\")\nCorrect Answer:A\n  Ral172 months, 1 week ago\nSelected Answer: A\nIt's best to use withWatermark() for late available streaming data\nupvoted 1 times\n  KadELbied9 months, 1 week ago\nSelected Answer: A\nSuretly A\nupvoted 1 times\n\n---PAGE 348---"
    },
    "answer": null,
    "question_vi": "Pipeline streaming cần tính trung bình theo cửa sổ 5 phút, giữ trạng thái 10 phút cho dữ liệu trễ. Điền hàm phù hợp?",
    "options_vi": {
      "A": "withWatermark(\"event_time\", \"10 minutes\")",
      "B": "awaitArrival(\"event_time\", \"10 minutes\")",
      "C": "await(\"event_time + ‘10 minutes'\")",
      "D": "slidingWindow(\"event_time\", \"10 minutes\")"
    },
    "explanation_vi": "withWatermark khai báo ngưỡng dữ liệu trễ 10 phút, phù hợp với yêu cầu giữ state cho dữ liệu muộn.",
    "page": null,
    "image": "img/q_195.jpg"
  },
  {
    "id": 196,
    "topic": 1,
    "question": "A data architect has designed a system in which two Structured Streaming jobs will concurrently write to a single bronze Delta table. Each job is\nsubscribing to a different topic from an Apache Kafka source, but they will write data with the same schema. To keep the directory structure\nsimple, a data engineer has decided to nest a checkpoint directory to be shared by both streams.\nThe proposed directory structure is displayed below:\nWhich statement describes whether this checkpoint directory structure is valid for the given scenario and why?",
    "options": {
      "A": "No; Delta Lake manages streaming checkpoints in the transaction log.",
      "B": "Yes; both of the streams can share a single checkpoint directory.",
      "C": "No; only one stream can write to a Delta Lake table.",
      "D": "No; each of the streams needs to have its own checkpoint directory."
    },
    "answer": "D",
    "question_vi": "Hai job Structured Streaming cùng ghi vào một bảng Delta bronze, mỗi job đọc Kafka topic khác nhưng schema giống, muốn dùng chung thư mục checkpoint lồng nhau. Cấu trúc đó có hợp lệ không?",
    "options_vi": {
      "A": "Không; Delta quản lý checkpoint stream trong transaction log",
      "B": "Có; cả hai stream có thể chia sẻ một checkpoint",
      "C": "Không; chỉ một stream được phép ghi vào bảng Delta",
      "D": "Không; mỗi stream phải có checkpoint riêng"
    },
    "explanation_vi": "Mỗi stream cần checkpoint riêng để tách offset/state; chia sẻ checkpoint dẫn tới xung đột và hỏng trạng thái.",
    "page": null,
    "image": "img/q_196.jpg"
  },
  {
    "id": 197,
    "topic": 1,
    "question": "A Structured Streaming job deployed to production has been experiencing delays during peak hours of the day. At present, during normal\nexecution, each microbatch of data is processed in less than 3 seconds. During peak hours of the day, execution time for each microbatch\nbecomes very inconsistent, sometimes exceeding 30 seconds. The streaming write is currently configured with a trigger interval of 10 seconds.\nHolding all other variables constant and assuming records need to be processed in less than 10 seconds, which adjustment will meet the\nrequirement?",
    "options": {
      "A": "Decrease the trigger interval to 5 seconds; triggering batches more frequently allows idle executors to begin processing the next batch\nwhile longer running tasks from previous batches finish.",
      "B": "Decrease the trigger interval to 5 seconds; triggering batches more frequently may prevent records from backing up and large batches from\ncausing spill.",
      "C": "The trigger interval cannot be modified without modifying the checkpoint directory; to maintain the current stream state, increase the\nnumber of shuffle partitions to maximize parallelism.",
      "D": "Use the trigger once option and configure a Databricks job to execute the query every 10 seconds; this ensures all backlogged records are\nprocessed with each batch.\nCorrect Answer:B\n  RajeshMP20236 months, 1 week ago\nSelected Answer: B\nrunning them frequently will reduce amount of data to be processed which will enhance execution time.\nupvoted 1 times\n  KadELbied9 months, 1 week ago\nSelected Answer: B\nSuretly B\nupvoted 1 times\n\n---PAGE 350---"
    },
    "answer": null,
    "question_vi": "Một job Structured Streaming chạy production bị chậm vào giờ cao điểm. Bình thường mỗi microbatch xử lý <3s, nhưng giờ cao điểm có lô >30s. Trigger hiện tại mỗi 10s. Giữ mọi yếu tố khác, cần đảm bảo bản ghi được xử lý <10s thì nên điều chỉnh gì?",
    "options_vi": {
      "A": "Giảm trigger xuống 5 giây; kích hoạt thường xuyên hơn để executor nhàn rỗi bắt đầu xử lý batch kế tiếp khi batch trước còn chạy.",
      "B": "Giảm trigger xuống 5 giây; kích hoạt thường xuyên hơn giúp tránh backlog và batch lớn gây spill.",
      "C": "Không thể đổi trigger nếu không đổi checkpoint; để giữ trạng thái, tăng số shuffle partitions để tối đa song song.",
      "D": "Dùng trigger once và cấu hình job chạy mỗi 10 giây; mỗi batch sẽ xử lý hết backlog."
    },
    "explanation_vi": "Giảm khoảng trigger làm mỗi microbatch nhỏ đi nên ổn định hơn trong giờ cao điểm. Option B nhấn mạnh giảm backlog và tránh batch lớn gây spill; đây là cách duy trì thời gian <10s.",
    "page": null,
    "image": "img/q_197.jpg"
  },
  {
    "id": 198,
    "topic": 1,
    "question": "Which statement describes the default execution mode for Databricks Auto Loader?",
    "options": {
      "A": "Cloud vendor-specific queue storage and notification services are configured to track newly arriving files; new files are incrementally and\nidempotently loaded into the target Delta Lake table.",
      "B": "New files are identified by listing the input directory; the target table is materialized by directly querying all valid files in the source directory.",
      "C": "Webhooks trigger a Databricks job to run anytime new data arrives in a source directory; new data are automatically merged into target\ntables using rules inferred from the data.",
      "D": "New files are identified by listing the input directory; new files are incrementally and idempotently loaded into the target Delta Lake table."
    },
    "answer": "A",
    "question_vi": "Câu nào mô tả chế độ thực thi mặc định của Databricks Auto Loader?",
    "options_vi": {
      "A": "Auto Loader dùng hàng đợi/thông báo của cloud để theo dõi file mới; file mới được nạp tăng dần và idempotent vào Delta đích.",
      "B": "Liệt kê thư mục nguồn rồi materialize bảng bằng cách truy vấn trực tiếp toàn bộ file hợp lệ.",
      "C": "Webhook kích hoạt job mỗi khi có file mới và tự động merge theo rule suy luận.",
      "D": "Liệt kê thư mục nguồn; file mới được nạp tăng dần và idempotent vào Delta đích."
    },
    "explanation_vi": "Mặc định Auto Loader chạy ở chế độ file notification dựa trên dịch vụ queue của cloud (A). Nó theo dõi file mới và nạp tăng dần, idempotent vào bảng Delta.",
    "page": null,
    "image": "img/q_198.jpg"
  },
  {
    "id": 199,
    "topic": 1,
    "question": "Which statement describes the correct use of pyspark.sql.functions.broadcast?",
    "options": {
      "A": "It marks a column as having low enough cardinality to properly map distinct values to available partitions, allowing a broadcast join.",
      "B": "It marks a column as small enough to store in memory on all executors, allowing a broadcast join.",
      "C": "It caches a copy of the indicated table on all nodes in the cluster for use in all future queries during the cluster lifetime.",
      "D": "It marks a DataFrame as small enough to store in memory on all executors, allowing a broadcast join.\nCorrect Answer:D\n  RajeshMP20236 months, 1 week ago\nSelected Answer: D\nIn Braodcast join , spark copies smaller table to all worker nodes so join can happen locally at each executor without shuffling larger table. broadcast\nfunction forces the join.\nupvoted 2 times\n  KadELbied9 months, 1 week ago\nSelected Answer: D\nSuretly D\nupvoted 1 times\n\n---PAGE 352---"
    },
    "answer": null,
    "question_vi": "Mô tả đúng về pyspark.sql.functions.broadcast?",
    "options_vi": {
      "A": "Đánh dấu cột có độ phân biệt thấp để ánh xạ partition tốt hơn cho broadcast join.",
      "B": "Đánh dấu cột đủ nhỏ để lưu ở mọi executor, cho phép broadcast join.",
      "C": "Cache một bản sao bảng trên mọi node cho mọi truy vấn trong vòng đời cluster.",
      "D": "Đánh dấu DataFrame đủ nhỏ để lưu ở mọi executor, cho phép broadcast join."
    },
    "explanation_vi": "broadcast() dùng trên DataFrame nhỏ để gửi tới mọi executor và thực hiện broadcast join. Vì vậy đáp án D đúng; các phương án khác nhầm phạm vi/đối tượng.",
    "page": null,
    "image": "img/q_199.jpg"
  },
  {
    "id": 200,
    "topic": 1,
    "question": "Spill occurs as a result of executing various wide transformations. However, diagnosing spill requires one to proactively look for key indicators.\nWhere in the Spark UI are two of the primary indicators that a partition is spilling to disk?",
    "options": {
      "A": "Stage’s detail screen and Query’s detail screen",
      "B": "Stage’s detail screen and Executor’s log files",
      "C": "Driver’s and Executor’s log files",
      "D": "Executor’s detail screen and Executor’s log files\nCorrect Answer:B\n  ADFMDS1 month, 3 weeks ago\nSelected Answer: A\nSpill diagnosis starts in the Spark UI, not logs\nupvoted 1 times\n  KadELbied9 months, 1 week ago\nSelected Answer: B\nSuretly B\nupvoted 2 times\n\n---PAGE 353---"
    },
    "answer": null,
    "question_vi": "Trong Spark UI, ở đâu có hai chỉ báo chính cho thấy một partition đang spill xuống đĩa?",
    "options_vi": {
      "A": "Trang chi tiết Stage và trang chi tiết Query",
      "B": "Trang chi tiết Stage và log của Executor",
      "C": "Log của Driver và Executor",
      "D": "Trang chi tiết Executor và log của Executor"
    },
    "explanation_vi": "Spill được xem trong Spark UI: chi tiết Stage hiển thị shuffle spill, và log executor cho thấy spill ở mức task. Do đó chọn B.",
    "page": null,
    "image": "img/q_200.jpg"
  },
  {
    "id": 201,
    "topic": 1,
    "question": "An upstream source writes Parquet data as hourly batches to directories named with the current date. A nightly batch job runs the following code\nto ingest all data from the previous day as indicated by the date variable:\nAssume that the fields customer_id and order_id serve as a composite key to uniquely identify each order.\nIf the upstream system is known to occasionally produce duplicate entries for a single order hours apart, which statement is correct?",
    "options": {
      "A": "Each write to the orders table will only contain unique records, and only those records without duplicates in the target table will be written.",
      "B": "Each write to the orders table will only contain unique records, but newly written records may have duplicates already present in the target\ntable.",
      "C": "Each write to the orders table will only contain unique records; if existing records with the same key are present in the target table, these\nrecords will be overwritten.",
      "D": "Each write to the orders table will run deduplication over the union of new and existing records, ensuring no duplicate records are present.\nCorrect Answer:B\n  KadELbied9 months, 1 week ago\nSelected Answer: B\nsuretly B\nupvoted 2 times\n  _lene_1 year ago\nSelected Answer: B\nNo intra-batch duplicates, can be inter-batch duplicates\nupvoted 1 times\n\n---PAGE 354---"
    },
    "answer": null,
    "question_vi": "Nguồn upstream ghi Parquet theo thư mục ngày. Batch đêm đọc dữ liệu ngày hôm qua và ghi vào bảng orders. Nếu thỉnh thoảng có bản ghi trùng khóa customer_id+order_id xuất hiện cách nhau vài giờ, phát biểu nào đúng?",
    "options_vi": {
      "A": "Mỗi lần ghi chỉ có bản ghi duy nhất và chỉ ghi những bản chưa có trong bảng đích.",
      "B": "Mỗi lần ghi chỉ có bản duy nhất trong batch, nhưng có thể trùng với bản đã tồn tại trong bảng đích.",
      "C": "Mỗi lần ghi chỉ có bản duy nhất; nếu đã có trong bảng đích thì sẽ bị ghi đè.",
      "D": "Mỗi lần ghi sẽ khử trùng lặp trên hợp của dữ liệu mới và dữ liệu hiện có để không còn trùng."
    },
    "explanation_vi": "Batch job chỉ khử trùng lặp trong dữ liệu mới (trong ngày), không so với dữ liệu cũ. Vì vậy có thể tạo bản ghi trùng đã tồn tại → đáp án B.",
    "page": null,
    "image": "img/q_201.jpg"
  },
  {
    "id": 202,
    "topic": 1,
    "question": "A junior data engineer on your team has implemented the following code block.\nThe view new_events contains a batch of records with the same schema as the events Delta table. The event_id field serves as a unique key for\nthis table.\nWhen this query is executed, what will happen with new records that have the same event_id as an existing record?",
    "options": {
      "A": "They are merged.",
      "B": "They are ignored.",
      "C": "They are updated.",
      "D": "They are inserted.\nCorrect Answer:B\n  KadELbied9 months, 1 week ago\nSelected Answer: B\nsuretly B\nupvoted 2 times\n  billabro9 months, 1 week ago\nSelected Answer: C\nC is right\nupvoted 1 times\n  7bad0587 months, 1 week ago\nPlease don't comment here if you are not sure, it's simple SQL code and you can mislead others.\nupvoted 4 times\n  Kyries10 months, 3 weeks ago\nSelected Answer: B\nB is correct\nupvoted 2 times\n\n---PAGE 355---"
    },
    "answer": null,
    "question_vi": "View new_events có cùng schema với bảng Delta events, khóa event_id. Với code insert vào events (insert into select *), bản ghi có event_id trùng sẽ thế nào?",
    "options_vi": {
      "A": "Chúng được merge.",
      "B": "Chúng bị bỏ qua.",
      "C": "Chúng được cập nhật.",
      "D": "Chúng được chèn thêm."
    },
    "explanation_vi": "INSERT INTO không dedup hay upsert; tất cả bản ghi được chèn, kể cả trùng khóa. Do đó bản ghi trùng sẽ được thêm mới → D.",
    "page": null,
    "image": "img/q_202.jpg"
  },
  {
    "id": 203,
    "topic": 1,
    "question": "A new data engineer notices that a critical field was omitted from an application that writes its Kafka source to Delta Lake. This happened even\nthough the critical field was in the Kafka source. That field was further missing from data written to dependent, long-term storage. The retention\nthreshold on the Kafka service is seven days. The pipeline has been in production for three months.\nWhich describes how Delta Lake can help to avoid data loss of this nature in the future?",
    "options": {
      "A": "The Delta log and Structured Streaming checkpoints record the full history of the Kafka producer.",
      "B": "Delta Lake schema evolution can retroactively calculate the correct value for newly added fields, as long as the data was in the original\nsource.",
      "C": "Delta Lake automatically checks that all fields present in the source data are included in the ingestion layer.",
      "D": "Ingesting all raw data and metadata from Kafka to a bronze Delta table creates a permanent, replayable history of the data state.\nCorrect Answer:D\n  KadELbied9 months, 1 week ago\nSelected Answer: D\nsuretly D\nupvoted 2 times\n\n---PAGE 356---"
    },
    "answer": null,
    "question_vi": "Thiếu một trường quan trọng khi ingest Kafka -> Delta; retention Kafka 7 ngày, pipeline chạy 3 tháng. Delta Lake giúp tránh mất dữ liệu kiểu này thế nào?",
    "options_vi": {
      "A": "Delta log và checkpoint ghi lại toàn bộ lịch sử producer Kafka.",
      "B": "Schema evolution có thể tính ngược giá trị mới nếu trường có trong nguồn.",
      "C": "Delta tự kiểm tra mọi trường nguồn đều có ở layer ingest.",
      "D": "Ghi toàn bộ raw Kafka vào bảng bronze Delta tạo lịch sử có thể replay lâu dài."
    },
    "explanation_vi": "Lưu toàn bộ raw vào bronze Delta giữ lại lịch sử ngoài cửa sổ Kafka 7 ngày, cho phép thêm trường sau này mà không mất dữ liệu → D.",
    "page": null,
    "image": "img/q_203.jpg"
  },
  {
    "id": 204,
    "topic": 1,
    "question": "The data engineering team maintains the following code:\nAssuming that this code produces logically correct results and the data in the source table has been de-duplicated and validated, which statement\ndescribes what will occur when this code is executed?",
    "options": {
      "A": "The silver_customer_sales table will be overwritten by aggregated values calculated from all records in the\ngold_customer_lifetime_sales_summary table as a batch job.",
      "B": "A batch job will update the gold_customer_lifetime_sales_summary table, replacing only those rows that have different values than the\ncurrent version of the table, using customer_id as the primary key.",
      "C": "The gold_customer_lifetime_sales_summary table will be overwritten by aggregated values calculated from all records in the\nsilver_customer_sales table as a batch job.",
      "D": "An incremental job will detect if new rows have been written to the silver_customer_sales table; if new rows are detected, all aggregates will\nbe recalculated and used to overwrite the gold_customer_lifetime_sales_summary table.\nCorrect Answer:C\n  KadELbied9 months, 1 week ago\nSelected Answer: C\nsuretly C\nupvoted 1 times\n\n---PAGE 357---"
    },
    "answer": null,
    "question_vi": "Code dùng overwrite tính tổng từ silver_customer_sales lên gold_customer_lifetime_sales_summary. Giả sử dữ liệu nguồn đã sạch, việc thực thi sẽ thế nào?",
    "options_vi": {
      "A": "Bảng silver_customer_sales bị overwrite bởi tổng từ gold.",
      "B": "Job batch cập nhật gold chỉ thay đổi các hàng có giá trị khác, dùng customer_id khóa chính.",
      "C": "Bảng gold bị overwrite bởi tổng từ silver (batch).",
      "D": "Job incremental phát hiện hàng mới rồi tính lại toàn bộ aggregate và overwrite gold."
    },
    "explanation_vi": "Lệnh write format(\"delta\").mode(\"overwrite\").saveAsTable(\"gold...\") sẽ ghi đè toàn bộ gold bằng aggregate từ silver → C.",
    "page": null,
    "image": "img/q_204.jpg"
  },
  {
    "id": 205,
    "topic": 1,
    "question": "The data engineering team is migrating an enterprise system with thousands of tables and views into the Lakehouse. They plan to implement the\ntarget architecture using a series of bronze, silver, and gold tables. Bronze tables will almost exclusively be used by production data engineering\nworkloads, while silver tables will be used to support both data engineering and machine learning workloads. Gold tables will largely serve\nbusiness intelligence and reporting purposes. While personal identifying information (PII) exists in all tiers of data, pseudonymization and\nanonymization rules are in place for all data at the silver and gold levels.\nThe organization is interested in reducing security concerns while maximizing the ability to collaborate across diverse teams.\nWhich statement exemplifies best practices for implementing this system?",
    "options": {
      "A": "Isolating tables in separate databases based on data quality tiers allows for easy permissions management through database ACLs and\nallows physical separation of default storage locations for managed tables.",
      "B": "Because databases on Databricks are merely a logical construct, choices around database organization do not impact security or\ndiscoverability in the Lakehouse.",
      "C": "Storing all production tables in a single database provides a unified view of all data assets available throughout the Lakehouse, simplifying\ndiscoverability by granting all users view privileges on this database.",
      "D": "Working in the default Databricks database provides the greatest security when working with managed tables, as these will be created in\nthe DBFS root.\nCorrect Answer:A\n  KadELbied9 months, 1 week ago\nSelected Answer: A\nSuretly A\nupvoted 1 times\n\n---PAGE 358---"
    },
    "answer": null,
    "question_vi": "Doanh nghiệp di trú hàng nghìn bảng/view theo mô hình bronze/silver/gold, có PII được ẩn danh ở silver/gold. Muốn giảm rủi ro bảo mật và dễ phối hợp. Thực hành tốt nhất nào?",
    "options_vi": {
      "A": "Tách bảng theo tier vào các database riêng để quản quyền qua ACL và tách lưu trữ mặc định.",
      "B": "Database chỉ là logic nên tổ chức không ảnh hưởng bảo mật/khả năng tìm kiếm.",
      "C": "Đặt tất cả bảng production vào một database, cấp quyền view chung cho mọi người.",
      "D": "Làm việc trong database mặc định tạo bảo mật cao nhất vì bảng managed ở DBFS root."
    },
    "explanation_vi": "Phân tách database theo tier giúp cấp quyền theo mức độ (PII, chất lượng) và tách vị trí lưu trữ. Đây là cách chuẩn cho bảo mật + quản trị → A.",
    "page": null,
    "image": "img/q_205.jpg"
  },
  {
    "id": 206,
    "topic": 1,
    "question": "The data architect has mandated that all tables in the Lakehouse should be configured as external (also known as \"unmanaged\") Delta Lake\ntables.\nWhich approach will ensure that this requirement is met?",
    "options": {
      "A": "When a database is being created, make sure that the LOCATION keyword is used.",
      "B": "When the workspace is being configured, make sure that external cloud object storage has been mounted.",
      "C": "When data is saved to a table, make sure that a full file path is specified alongside the USING DELTA clause.",
      "D": "When tables are created, make sure that the UNMANAGED keyword is used in the CREATE TABLE statement.\nCorrect Answer:C\n  363c4c56 months, 2 weeks ago\nSelected Answer: A\nAn external table is a table that references an external storage path by using a LOCATION clause.\nupvoted 1 times\n  363c4c56 months, 2 weeks ago\nI think C is the correct option\nupvoted 1 times\n  c315d108 months, 2 weeks ago\nSelected Answer: C\npath should be provided for external table\nupvoted 4 times\n  KadELbied9 months, 1 week ago\nSelected Answer: D\nthe correct answer is E : When tables are created, make sure that the EXTERNAL keyword is used in the CREATE TABLE statement.\nupvoted 1 times\n\n---PAGE 359---"
    },
    "answer": null,
    "question_vi": "Kiến trúc sư yêu cầu tất cả bảng trong Lakehouse là Delta external (unmanaged). Cách nào đảm bảo yêu cầu này?",
    "options_vi": {
      "A": "Khi tạo database, dùng từ khóa LOCATION.",
      "B": "Khi cấu hình workspace, mount storage ngoài.",
      "C": "Khi lưu dữ liệu vào bảng, chỉ định full path cùng USING DELTA.",
      "D": "Khi tạo bảng, dùng từ khóa UNMANAGED trong CREATE TABLE."
    },
    "explanation_vi": "Bảng external cần LOCATION path khi ghi/lưu. Cách chắc chắn là chỉ định đường dẫn trong lệnh CREATE/WRITE USING DELTA → đáp án C.",
    "page": null,
    "image": "img/q_206.jpg"
  },
  {
    "id": 207,
    "topic": 1,
    "question": "To reduce storage and compute costs, the data engineering team has been tasked with curating a series of aggregate tables leveraged by\nbusiness intelligence dashboards, customer-facing applications, production machine learning models, and ad hoc analytical queries.\nThe data engineering team has been made aware of new requirements from a customer-facing application, which is the only downstream\nworkload they manage entirely. As a result, an aggregate table used by numerous teams across the organization will need to have a number of\nfields renamed, and additional fields will also be added.\nWhich of the solutions addresses the situation while minimally interrupting other teams in the organization without increasing the number of\ntables that need to be managed?",
    "options": {
      "A": "Send all users notice that the schema for the table will be changing; include in the communication the logic necessary to revert the new\ntable schema to match historic queries.",
      "B": "Configure a new table with all the requisite fields and new names and use this as the source for the customer-facing application; create a\nview that maintains the original data schema and table name by aliasing select fields from the new table.",
      "C": "Create a new table with the required schema and new fields and use Delta Lake's deep clone functionality to sync up changes committed to\none table to the corresponding table.",
      "D": "Replace the current table definition with a logical view defined with the query logic currently writing the aggregate table; create a new table\nto power the customer-facing application.\nCorrect Answer:B\n  RajeshMP20236 months, 1 week ago\nSelected Answer: B\nMinimally disruptive: This approach ensures that the original schema and table name remain intact for other teams by creating a view that aliases the\nnew table. This avoids breaking existing queries and dashboards that depend on the current schema.\nupvoted 1 times\n  KadELbied9 months, 1 week ago\nSelected Answer: B\nsuretly B\nupvoted 1 times\n\n---PAGE 360---"
    },
    "answer": null,
    "question_vi": "Một bảng aggregate dùng cho nhiều team cần đổi tên một số cột và thêm cột cho ứng dụng khách hàng, muốn ít gián đoạn và không tăng số bảng phải quản. Giải pháp?",
    "options_vi": {
      "A": "Thông báo cho tất cả người dùng schema sẽ đổi; gửi logic để họ tự chuyển đổi.",
      "B": "Tạo bảng mới với schema mới cho ứng dụng, đồng thời tạo view giữ tên/schema cũ bằng cách alias từ bảng mới.",
      "C": "Tạo bảng mới với schema mới và dùng deep clone để đồng bộ hai bảng.",
      "D": "Thay bảng hiện tại bằng view, và tạo bảng mới cho ứng dụng khách hàng."
    },
    "explanation_vi": "Giữ bảng mới cho nhu cầu mới, tạo view alias theo schema cũ để không phá vỡ người dùng hiện tại → giải pháp B.",
    "page": null,
    "image": "img/q_207.jpg"
  },
  {
    "id": 208,
    "topic": 1,
    "question": "A Delta Lake table representing metadata about content posts from users has the following schema:\nuser_id LONG, post_text STRING, post_id STRING, longitude FLOAT, latitude FLOAT, post_time TIMESTAMP, date DATE\nBased on the above schema, which column is a good candidate for partitioning the Delta Table?",
    "options": {
      "A": "post_time",
      "B": "date",
      "C": "post_id",
      "D": "user_id\nCorrect Answer:B\n  RajeshMP20236 months, 1 week ago\nSelected Answer: B\nPartitioning the Delta Lake table by the date column is the most efficient and practical choice, as it balances query performance, data distribution,\nand partition management\nupvoted 1 times\n  KadELbied9 months, 1 week ago\nSelected Answer: B\nsuretly B\nupvoted 1 times\n\n---PAGE 361---"
    },
    "answer": null,
    "question_vi": "Bảng Delta metadata bài đăng có schema user_id, post_text, post_id, longitude, latitude, post_time, date. Cột nào nên dùng partition?",
    "options_vi": {
      "A": "post_time",
      "B": "date",
      "C": "post_id",
      "D": "user_id"
    },
    "explanation_vi": "Partition theo date cân bằng số partition và phù hợp truy vấn theo ngày; post_time quá chi tiết, post_id/user_id sẽ tạo quá nhiều partition. → B.",
    "page": null,
    "image": "img/q_208.jpg"
  },
  {
    "id": 209,
    "topic": 1,
    "question": "The downstream consumers of a Delta Lake table have been complaining about data quality issues impacting performance in their applications.\nSpecifically, they have complained that invalid latitude and longitude values in the activity_details table have been breaking their ability to use\nother geolocation processes.\nA junior engineer has written the following code to add CHECK constraints to the Delta Lake table:\nA senior engineer has confirmed the above logic is correct and the valid ranges for latitude and longitude are provided, but the code fails when\nexecuted.\nWhich statement explains the cause of this failure?",
    "options": {
      "A": "The current table schema does not contain the field valid_coordinates; schema evolution will need to be enabled before altering the table to\nadd a constraint.",
      "B": "The activity_details table already exists; CHECK constraints can only be added during initial table creation.",
      "C": "The activity_details table already contains records that violate the constraints; all existing data must pass CHECK constraints in order to\nadd them to an existing table.",
      "D": "The activity_details table already contains records; CHECK constraints can only be added prior to inserting values into a table.\nCorrect Answer:C\n  KadELbied9 months, 1 week ago\nSelected Answer: C\nsuretly C\nupvoted 1 times\n\n---PAGE 362---"
    },
    "answer": null,
    "question_vi": "Bảng activity_details có dữ liệu tọa độ sai; thêm CHECK constraint cho latitude/longitude nhưng lệnh thất bại. Nguyên nhân?",
    "options_vi": {
      "A": "Schema chưa có cột valid_coordinates; cần bật schema evolution.",
      "B": "Bảng đã tồn tại; CHECK chỉ thêm khi tạo bảng.",
      "C": "Bảng đã có dữ liệu vi phạm nên không thể thêm constraint cho tới khi dữ liệu hợp lệ.",
      "D": "CHECK chỉ thêm trước khi insert dữ liệu."
    },
    "explanation_vi": "Khi bảng đã chứa dữ liệu, thêm CHECK yêu cầu mọi bản ghi hiện tại thỏa mãn. Dữ liệu sai làm lệnh thất bại → C.",
    "page": null,
    "image": "img/q_209.jpg"
  },
  {
    "id": 210,
    "topic": 1,
    "question": "What is true for Delta Lake?",
    "options": {
      "A": "Views in the Lakehouse maintain a valid cache of the most recent versions of source tables at all times.",
      "B": "Primary and foreign key constraints can be leveraged to ensure duplicate values are never entered into a dimension table.",
      "C": "Delta Lake automatically collects statistics on the first 32 columns of each table which are leveraged in data skipping based on query\nfilters.",
      "D": "Z-order can only be applied to numeric values stored in Delta Lake tables.\nCorrect Answer:C\n  KadELbied9 months, 1 week ago\nSelected Answer: C\nsuretly C\nupvoted 1 times\n\n---PAGE 363---"
    },
    "answer": null,
    "question_vi": "Phát biểu nào đúng về Delta Lake?",
    "options_vi": {
      "A": "View luôn giữ cache hợp lệ mới nhất.",
      "B": "Primary/foreign key đảm bảo không có trùng lặp.",
      "C": "Delta tự thu thập thống kê 32 cột đầu để data skipping theo bộ lọc.",
      "D": "Z-order chỉ áp dụng cho giá trị số."
    },
    "explanation_vi": "Delta tự thu thập stats 32 cột đầu cho data skipping (C). Các lựa chọn khác sai/không chính xác.",
    "page": null,
    "image": "img/q_210.jpg"
  },
  {
    "id": 211,
    "topic": 1,
    "question": "The view updates represents an incremental batch of all newly ingested data to be inserted or updated in the customers table.\nThe following logic is used to process these records.\nWhich statement describes this implementation?",
    "options": {
      "A": "The customers table is implemented as a Type 2 table; old values are overwritten and new customers are appended.",
      "B": "The customers table is implemented as a Type 2 table; old values are maintained but marked as no longer current and new values are\ninserted.",
      "C": "The customers table is implemented as a Type 0 table; all writes are append only with no changes to existing values.",
      "D": "The customers table is implemented as a Type 1 table; old values are overwritten by new values and no history is maintained.\nCorrect Answer:B\n  Ral172 months, 1 week ago\nSelected Answer: B\nThe answer should be B. It's clear from the statements.\nupvoted 1 times\n  RajeshMP20236 months, 1 week ago\nSelected Answer: B\nA Type 2 Slowly Changing Dimension (SCD) table in Databricks (or any data platform) is a table designed to track historical changes to dimension\ndata over time. This is achieved by maintaining multiple records for the same entity, with each record representing a specific version of the entity's\ndata for a given time period. it doesn't override existing one.\nupvoted 1 times\n  KadELbied9 months, 1 week ago\nSelected Answer: B\nsuretly B\nupvoted 1 times\n\n---PAGE 364---"
    },
    "answer": null,
    "question_vi": "View updates chứa batch mới cần insert/update vào bảng customers với logic merge (when matched update, when not matched insert). Mô tả nào đúng?",
    "options_vi": {
      "A": "customers là SCD Type 2; giá trị cũ bị ghi đè, khách hàng mới được thêm.",
      "B": "customers là SCD Type 2; giữ giá trị cũ (đánh dấu không còn hiệu lực) và chèn giá trị mới.",
      "C": "customers là Type 0; chỉ append.",
      "D": "customers là Type 1; giá trị cũ bị ghi đè, không lưu lịch sử."
    },
    "explanation_vi": "MERGE with WHEN MATCHED UPDATE/WHEN NOT MATCHED INSERT ghi đè bản hiện có và thêm bản mới, không giữ lịch sử → Type 1 (D).",
    "page": null,
    "image": "img/q_211.jpg"
  },
  {
    "id": 212,
    "topic": 1,
    "question": "A team of data engineers are adding tables to a DLT pipeline that contain repetitive expectations for many of the same data quality checks. One\nmember of the team suggests reusing these data quality rules across all tables defined for this pipeline.\nWhat approach would allow them to do this?",
    "options": {
      "A": "Add data quality constraints to tables in this pipeline using an external job with access to pipeline configuration files.",
      "B": "Use global Python variables to make expectations visible across DLT notebooks included in the same pipeline.",
      "C": "Maintain data quality rules in a separate Databricks notebook that each DLT notebook or file can import as a library.",
      "D": "Maintain data quality rules in a Delta table outside of this pipeline's target schema, providing the schema name as a pipeline parameter."
    },
    "answer": "C",
    "question_vi": "DLT pipeline có nhiều expectation giống nhau; muốn tái sử dụng rule cho nhiều bảng. Cách làm?",
    "options_vi": {
      "A": "Dùng job ngoài để thêm constraint vào file cấu hình pipeline.",
      "B": "Dùng biến Python global để expectation hiển thị ở mọi notebook.",
      "C": "Đặt rule vào notebook/library riêng rồi import vào các notebook DLT.",
      "D": "Lưu rule vào bảng Delta ngoài schema pipeline và truyền tên schema làm tham số."
    },
    "explanation_vi": "Có thể tái sử dụng bằng cách đóng gói rule trong module/notebook rồi import (C).",
    "page": null,
    "image": "img/q_212.jpg"
  },
  {
    "id": 213,
    "topic": 1,
    "question": "The DevOps team has configured a production workload as a collection of notebooks scheduled to run daily using the Jobs UI. A new data\nengineering hire is onboarding to the team and has requested access to one of these notebooks to review the production logic.\nWhat are the maximum notebook permissions that can be granted to the user without allowing accidental changes to production code or data?",
    "options": {
      "A": "Can manage",
      "B": "Can edit",
      "C": "Can run",
      "D": "Can read\nCorrect Answer:D\n  Ral172 months, 1 week ago\nSelected Answer: D\nAnything other than read permissions can lead to interference in production data/production code.\nupvoted 1 times\n  KadELbied9 months, 1 week ago\nSelected Answer: D\nsuretly D\nupvoted 2 times\n\n---PAGE 367---"
    },
    "answer": null,
    "question_vi": "Workload production chạy notebook qua Jobs hằng ngày. Thành viên mới cần xem logic nhưng tránh thay đổi code/dữ liệu. Quyền tối đa có thể cấp?",
    "options_vi": {
      "A": "Can manage",
      "B": "Can edit",
      "C": "Can run",
      "D": "Can read"
    },
    "explanation_vi": "Để xem mà không chỉnh/s chạy được, cấp quyền Can read. Các quyền khác cho phép chạy/chỉnh sửa. → D.",
    "page": null,
    "image": "img/q_213.jpg"
  },
  {
    "id": 214,
    "topic": 1,
    "question": "A table named user_ltv is being used to create a view that will be used by data analysts on various teams. Users in the workspace are configured\ninto groups, which are used for setting up data access using ACLs.\nThe user_ltv table has the following schema:\nemail STRING, age INT, ltv INT\nThe following view definition is executed:\nAn analyst who is not a member of the marketing group executes the following query:\nSELECT * FROM email_ltv -\nWhich statement describes the results returned by this query?",
    "options": {
      "A": "Three columns will be returned, but one column will be named \"REDACTED\" and contain only null values.",
      "B": "Only the email and ltv columns will be returned; the email column will contain all null values.",
      "C": "The email and ltv columns will be returned with the values in user_ltv.",
      "D": "Only the email and ltv columns will be returned; the email column will contain the string \"REDACTED\" in each row.\nCorrect Answer:D\n  KadELbied9 months, 1 week ago\nSelected Answer: D\nsuretly D\nupvoted 1 times\n\n---PAGE 368---"
    },
    "answer": null,
    "question_vi": "Bảng user_ltv (email, age, ltv) dùng tạo view email_ltv có apply_mask(email) chỉ cho group marketing. Người không thuộc marketing query view này, kết quả thế nào?",
    "options_vi": {
      "A": "Trả 3 cột, một cột tên \"REDACTED\" chứa null.",
      "B": "Chỉ trả email và ltv; cột email toàn null.",
      "C": "email và ltv giữ nguyên giá trị.",
      "D": "Chỉ trả email và ltv; cột email là chuỗi \"REDACTED\" cho mọi hàng."
    },
    "explanation_vi": "apply_mask che email cho user không đủ quyền, trả chuỗi REDACTED; view chọn email, ltv nên kết quả là email bị REDACTED và ltv gốc → D.",
    "page": null,
    "image": "img/q_214.jpg"
  },
  {
    "id": 215,
    "topic": 1,
    "question": "The data governance team has instituted a requirement that all tables containing Personal Identifiable Information (PII) must be clearly\nannotated. This includes adding column comments, table comments, and setting the custom table property \"contains_pii\" = true.\nThe following SQL DDL statement is executed to create a new table:\nWhich command allows manual confirmation that these three requirements have been met?",
    "options": {
      "A": "DESCRIBE EXTENDED dev.pii_test",
      "B": "DESCRIBE DETAIL dev.pii_test",
      "C": "SHOW TBLPROPERTIES dev.pii_test",
      "D": "DESCRIBE HISTORY dev.pii_test\nCorrect Answer:A\n  KadELbied9 months, 1 week ago\nSelected Answer: A\nsuretly A\nupvoted 1 times\n\n---PAGE 369---"
    },
    "answer": null,
    "question_vi": "Yêu cầu bảng chứa PII phải có column comment, table comment và property contains_pii=true. Lệnh DESCRIBE/SHOW nào kiểm tra cả ba?",
    "options_vi": {
      "A": "DESCRIBE EXTENDED dev.pii_test",
      "B": "DESCRIBE DETAIL dev.pii_test",
      "C": "SHOW TBLPROPERTIES dev.pii_test",
      "D": "DESCRIBE HISTORY dev.pii_test"
    },
    "explanation_vi": "DESCRIBE EXTENDED hiển thị comment cột, comment bảng và properties, phù hợp để xác nhận đủ yêu cầu → A.",
    "page": null,
    "image": "img/q_215.jpg"
  },
  {
    "id": 216,
    "topic": 1,
    "question": "The data governance team is reviewing code used for deleting records for compliance with GDPR. They note the following logic is used to delete\nrecords from the Delta Lake table named users.\nAssuming that user_id is a unique identifying key and that delete_requests contains all users that have requested deletion, which statement\ndescribes whether successfully executing the above logic guarantees that the records to be deleted are no longer accessible and why?",
    "options": {
      "A": "Yes; Delta Lake ACID guarantees provide assurance that the DELETE command succeeded fully and permanently purged these records.",
      "B": "No; files containing deleted records may still be accessible with time travel until a VACUUM command is used to remove invalidated data\nfiles.",
      "C": "Yes; the Delta cache immediately updates to reflect the latest data files recorded to disk.",
      "D": "No; the Delta Lake DELETE command only provides ACID guarantees when combined with the MERGE INTO command.\nCorrect Answer:B\n  KadELbied9 months, 1 week ago\nSelected Answer: B\nsuretly B\nupvoted 1 times\n\n---PAGE 370---"
    },
    "answer": null,
    "question_vi": "Logic DELETE FROM users WHERE user_id IN (delete_requests). Sau khi chạy có đảm bảo dữ liệu không truy cập được không, vì sao?",
    "options_vi": {
      "A": "Có; ACID đảm bảo DELETE thành công và xóa vĩnh viễn.",
      "B": "Không; file chứa bản ghi bị xóa vẫn truy cập qua time travel tới khi VACUUM dọn.",
      "C": "Có; Delta cache cập nhật ngay dữ liệu mới.",
      "D": "Không; DELETE chỉ ACID khi đi kèm MERGE."
    },
    "explanation_vi": "DELETE đánh dấu file, nhưng time travel vẫn thấy tới khi VACUUM. Do đó chưa xóa vĩnh viễn cho tới khi vacuum chạy → B.",
    "page": null,
    "image": "img/q_216.jpg"
  },
  {
    "id": 217,
    "topic": 1,
    "question": "The data architect has decided that once data has been ingested from external sources into the\nDatabricks Lakehouse, table access controls will be leveraged to manage permissions for all production tables and views.\nThe following logic was executed to grant privileges for interactive queries on a production database to the core engineering group.\nGRANT USAGE ON DATABASE prod TO eng;\nGRANT SELECT ON DATABASE prod TO eng;\nAssuming these are the only privileges that have been granted to the eng group and that these users are not workspace administrators, which\nstatement describes their privileges?",
    "options": {
      "A": "Group members are able to create, query, and modify all tables and views in the prod database, but cannot define custom functions.",
      "B": "Group members are able to list all tables in the prod database but are not able to see the results of any queries on those tables.",
      "C": "Group members are able to query and modify all tables and views in the prod database, but cannot create new tables or views.",
      "D": "Group members are able to query all tables and views in the prod database, but cannot create or edit anything in the database.\nCorrect Answer:D\n  KadELbied9 months, 1 week ago\nSelected Answer: D\nsuretly D\nupvoted 1 times\n\n---PAGE 371---"
    },
    "answer": null,
    "question_vi": "Đã cấp GRANT USAGE và GRANT SELECT trên database prod cho group eng, không phải admin. Quyền thực tế của họ?",
    "options_vi": {
      "A": "Tạo, query, chỉnh sửa tất cả bảng/view trong prod, không tạo UDF.",
      "B": "Liệt kê bảng nhưng không xem kết quả truy vấn.",
      "C": "Query và chỉnh sửa mọi bảng/view, không tạo mới.",
      "D": "Query tất cả bảng/view trong prod, không tạo hay chỉnh sửa gì."
    },
    "explanation_vi": "USAGE + SELECT cho phép đọc (SELECT) nhưng không tạo/chỉnh sửa. Nên họ chỉ query được bảng/view → D.",
    "page": null,
    "image": "img/q_217.jpg"
  },
  {
    "id": 218,
    "topic": 1,
    "question": "A user wants to use DLT expectations to validate that a derived table report contains all records from the source, included in the table\nvalidation_copy.\nThe user attempts and fails to accomplish this by adding an expectation to the report table definition.\nWhich approach would allow using DLT expectations to validate all expected records are present in this table?",
    "options": {
      "A": "Define a temporary table that performs a left outer join on validation_copy and report, and define an expectation that no report key values\nare null",
      "B": "Define a SQL UDF that performs a left outer join on two tables, and check if this returns null values for report key values in a DLT\nexpectation for the report table",
      "C": "Define a view that performs a left outer join on validation_copy and report, and reference this view in DLT expectations for the report table",
      "D": "Define a function that performs a left outer join on validation_copy and report, and check against the result in a DLT expectation for the\nreport table"
    },
    "answer": "A",
    "question_vi": "Muốn dùng expectation DLT để kiểm tra bảng report chứa đủ record so với validation_copy. Cách nào khả thi?",
    "options_vi": {
      "A": "Tạo bảng tạm join trái validation_copy với report và đặt expectation không có khóa report bị null.",
      "B": "Tạo SQL UDF join trái hai bảng và dùng trong expectation.",
      "C": "Tạo view join trái validation_copy với report và tham chiếu view trong expectation của report.",
      "D": "Tạo function join trái validation_copy với report và kiểm tra trong expectation."
    },
    "explanation_vi": "Expectation cần làm trên một bảng; tạo bảng tạm (hoặc view materialized trong pipeline) thực hiện left join và đặt expectation trên khóa là cách trực tiếp → A.",
    "page": null,
    "image": "img/q_218.jpg"
  },
  {
    "id": 219,
    "topic": 1,
    "question": "A user new to Databricks is trying to troubleshoot long execution times for some pipeline logic they are working on. Presently, the user is\nexecuting code cell-by-cell, using display() calls to confirm code is producing the logically correct results as new transformations are added to an\noperation. To get a measure of average time to execute, the user is running each cell multiple times interactively.\nWhich of the following adjustments will get a more accurate measure of how code is likely to perform in production?",
    "options": {
      "A": "The Jobs UI should be leveraged to occasionally run the notebook as a job and track execution time during incremental code development\nbecause Photon can only be enabled on clusters launched for scheduled jobs.",
      "B": "The only way to meaningfully troubleshoot code execution times in development notebooks is to use production-sized data and production-\nsized clusters with Run All execution.",
      "C": "Production code development should only be done using an IDE; executing code against a local build of open source Spark and Delta Lake\nwill provide the most accurate benchmarks for how code will perform in production.",
      "D": "Calling display() forces a job to trigger, while many transformations will only add to the logical query plan; because of caching, repeated\nexecution of the same logic does not provide meaningful results."
    },
    "answer": "D",
    "question_vi": "Người dùng mới đo thời gian chạy pipeline bằng cách chạy từng cell và display() nhiều lần. Điều chỉnh nào cho kết quả sát thực tế hơn?",
    "options_vi": {
      "A": "Thỉnh thoảng chạy notebook như job trong Jobs UI để bật Photon.",
      "B": "Chỉ có cách chạy với data/cluster cỡ production và Run All.",
      "C": "Phát triển phải dùng IDE và Spark open source local.",
      "D": "display() kích hoạt job nhưng caching làm kết quả lặp lại không ý nghĩa; cần đo trên toàn pipeline không lặp."
    },
    "explanation_vi": "display() và chạy lặp lại trên cùng cache không phản ánh sản xuất. Cần đo trên pipeline hoàn chỉnh; lựa chọn D mô tả đúng vấn đề.",
    "page": null,
    "image": "img/q_219.jpg"
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
    "question_vi": "Trong Spark UI, chẩn đoán vấn đề hiệu năng do không dùng predicate push-down ở đâu?",
    "options_vi": {
      "A": "Trong log Executor bằng grep \"predicate push-down\"",
      "B": "Trong Stage Detail, cột Input của Completed Stages",
      "C": "Trong Query Detail bằng cách đọc Physical Plan",
      "D": "Trong transaction log Delta qua thống kê cột"
    },
    "explanation_vi": "Xem Physical Plan trong Query Detail để thấy filter được đẩy xuống hay không. → C.",
    "page": null,
    "image": "img/q_220.jpg"
  },
  {
    "id": 221,
    "topic": 1,
    "question": "A data engineer needs to capture pipeline settings from an existing setting in the workspace, and use them to create and version a JSON file to\ncreate a new pipeline.\nWhich command should the data engineer enter in a web terminal configured with the Databricks CLI?",
    "options": {
      "A": "Use list pipelines to get the specs for all pipelines; get the pipeline spec from the returned results; parse and use this to create a pipeline",
      "B": "Stop the existing pipeline; use the returned settings in a reset command",
      "C": "Use the get command to capture the settings for the existing pipeline; remove the pipeline_id and rename the pipeline; use this in a create\ncommand",
      "D": "Use the clone command to create a copy of an existing pipeline; use the get JSON command to get the pipeline definition; save this to git"
    },
    "answer": "C",
    "question_vi": "Cần lấy config của một pipeline hiện có bằng Databricks CLI rồi tạo pipeline mới version hoá. Lệnh nào dùng?",
    "options_vi": {
      "A": "list pipelines rồi lấy spec từ kết quả và tạo pipeline",
      "B": "stop pipeline hiện có rồi reset từ setting",
      "C": "dùng lệnh get để lấy setting, bỏ pipeline_id, đổi tên rồi dùng lệnh create",
      "D": "clone pipeline rồi get JSON, lưu vào git"
    },
    "explanation_vi": "CLI hỗ trợ databricks pipelines get; dùng get lấy cấu hình, bỏ id, đổi tên và create pipeline mới → C.",
    "page": null,
    "image": "img/q_221.jpg"
  },
  {
    "id": 222,
    "topic": 1,
    "question": "Which Python variable contains a list of directories to be searched when trying to locate required modules?",
    "options": {
      "A": "importlib.resource_path",
      "B": "sys.path",
      "C": "os.path",
      "D": "pypi.path\nCorrect Answer:B\n  KadELbied9 months, 1 week ago\nSelected Answer: B\nsuretly B\nupvoted 1 times\n\n---PAGE 378---"
    },
    "answer": null,
    "question_vi": "Biến Python nào chứa danh sách thư mục được tìm khi import module?",
    "options_vi": {
      "A": "importlib.resource_path",
      "B": "sys.path",
      "C": "os.path",
      "D": "pypi.path"
    },
    "explanation_vi": "Danh sách đường dẫn tìm module nằm trong sys.path → B.",
    "page": null,
    "image": "img/q_222.jpg"
  },
  {
    "id": 223,
    "topic": 1,
    "question": "You are testing a collection of mathematical functions, one of which calculates the area under a curve as described by another function.\nassert(myIntegrate(lambda x: x*x, 0, 3) [0] == 9)\nWhich kind of test would the above line exemplify?",
    "options": {
      "A": "Unit",
      "B": "Manual",
      "C": "Functional",
      "D": "Integration\nCorrect Answer:A\n  KadELbied9 months, 1 week ago\nSelected Answer: A\nSuretly A\nupvoted 1 times\n\n---PAGE 379---"
    },
    "answer": null,
    "question_vi": "Đoạn kiểm thử assert(myIntegrate(lambda x: x*x, 0, 3)[0] == 9) thuộc loại test nào?",
    "options_vi": {
      "A": "Unit",
      "B": "Manual",
      "C": "Functional",
      "D": "Integration"
    },
    "explanation_vi": "Đang kiểm tra một hàm riêng lẻ với đầu vào cụ thể → test đơn vị (Unit).",
    "page": null,
    "image": "img/q_223.jpg"
  },
  {
    "id": 224,
    "topic": 1,
    "question": "What is a key benefit of an end-to-end test?",
    "options": {
      "A": "It makes it easier to automate your test suite",
      "B": "It pinpoints errors in the building blocks of your application",
      "C": "It provides testing coverage for all code paths and branches",
      "D": "It closely simulates real world usage of your application\nCorrect Answer:D\n  KadELbied9 months, 1 week ago\nSelected Answer: D\nsuretly D\nupvoted 1 times\n\n---PAGE 380---"
    },
    "answer": null,
    "question_vi": "Lợi ích chính của end-to-end test là gì?",
    "options_vi": {
      "A": "Giúp dễ tự động hóa test suite",
      "B": "Chỉ ra lỗi trong khối xây dựng ứng dụng",
      "C": "Phủ hết mọi nhánh và đường đi mã nguồn",
      "D": "Mô phỏng sát nhất cách ứng dụng dùng thực tế"
    },
    "explanation_vi": "E2E mô phỏng luồng thực tế từ đầu tới cuối nên bắt lỗi hành vi thực tế; đáp án D.",
    "page": null,
    "image": "img/q_224.jpg"
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
    "question_vi": "Lệnh REST API nào dùng để xem các notebook được cấu hình làm task trong một multi-task job?",
    "options_vi": {
      "A": "/jobs/runs/list",
      "B": "/jobs/list",
      "C": "/jobs/runs/get",
      "D": "/jobs/get"
    },
    "explanation_vi": "Để xem cấu hình job (bao gồm danh sách task/notebook) phải gọi /jobs/get theo job_id. Các endpoint runs chỉ trả thông tin run, /jobs/list chỉ liệt kê job mà không chi tiết task.",
    "page": null,
    "image": "img/q_225.jpg"
  },
  {
    "id": 226,
    "topic": 1,
    "question": "A Data Engineer wants to run unit tests using common Python testing frameworks on Python functions defined across several Databricks\nnotebooks currently used in production.\nHow can the data engineer run unit tests against functions that work with data in production?",
    "options": {
      "A": "Define and import unit test functions from a separate Databricks notebook",
      "B": "Define and unit test functions using Files in Repos",
      "C": "Run unit tests against non-production data that closely mirrors production",
      "D": "Define unit tests and functions within the same notebook"
    },
    "answer": "B",
    "question_vi": "Một Data Engineer muốn chạy unit test bằng framework Python cho các hàm được định nghĩa rải trong nhiều notebook đang chạy production. Cách nào để test được các hàm thao tác với dữ liệu production?",
    "options_vi": {
      "A": "Định nghĩa và import hàm unit test từ một notebook khác",
      "B": "Định nghĩa hàm và unit test bằng Files in Repos",
      "C": "Chạy unit test với dữ liệu phi production gần giống production",
      "D": "Viết hàm và unit test trong cùng notebook"
    },
    "explanation_vi": "Biến code notebook thành file .py trong Files in Repos giúp import như module chuẩn và test bằng pytest/unittest trên code giống production. Những lựa chọn khác vẫn bị giới hạn theo ngữ cảnh notebook hoặc dữ liệu giả lập.",
    "page": null,
    "image": "img/q_226.jpg"
  },
  {
    "id": 227,
    "topic": 1,
    "question": "A data engineer wants to refactor the following DLT code, which includes multiple table definitions with very similar code.\nIn an attempt to programmatically create these tables using a parameterized table definition, the data engineer writes the following code.\nThe pipeline runs an update with this refactored code, but generates a different DAG showing incorrect configuration values for these tables.\nHow can the data engineer fix this?",
    "options": {
      "A": "Wrap the for loop inside another table definition, using generalized names and properties to replace with those from the inner table\ndefinition.",
      "B": "Convert the list of configuration values to a dictionary of table settings, using table names as keys.",
      "C": "Move the table definition into a separate function, and make calls to this function using different input parameters inside the for loop.",
      "D": "Load the configuration values for these tables from a separate file, located at a path provided by a pipeline parameter."
    },
    "answer": "C",
    "question_vi": "Một kỹ sư refactor mã DLT bằng cách lặp để tạo nhiều table gần giống nhau nhưng DAG hiển thị giá trị cấu hình sai. Sửa thế nào?",
    "options_vi": {
      "A": "Bọc vòng lặp bên trong một định nghĩa table khác với tên chung",
      "B": "Chuyển list cấu hình thành dict dùng tên bảng làm key",
      "C": "Đưa định nghĩa table vào một hàm riêng và gọi hàm trong vòng lặp với tham số khác nhau",
      "D": "Tải cấu hình từ file bên ngoài qua pipeline parameter"
    },
    "explanation_vi": "Định nghĩa table phải được đóng gói trong hàm rồi gọi nhiều lần với tham số, để decorator DLT gắn đúng metadata cho từng bảng. Lặp trực tiếp làm decorator giữ giá trị cuối cùng.",
    "page": null,
    "image": "img/q_227.jpg"
  },
  {
    "id": 228,
    "topic": 1,
    "question": "A data engineer has created a 'transactions' Delta table on Databricks that should be used by the analytics team. The analytics team wants to use\nthe table with another tool which requires Apache Iceberg format.\nWhat should the data engineer do?",
    "options": {
      "A": "Require the analytics team to use a tool which supports Delta table.",
      "B": "Create an Iceberg copy of the 'transactions' Delta table which can be used by the analytics team.",
      "C": "Convert the 'transactions' Delta to Iceberg and enable uniform so that the table can be read as a Delta table.",
      "D": "Enable uniform on the transactions table to 'iceberg' so that the table can be read as an Iceberg table."
    },
    "answer": "D",
    "question_vi": "Bảng Delta 'transactions' cần được công cụ phân tích khác đọc dưới định dạng Apache Iceberg. Phải làm gì?",
    "options_vi": {
      "A": "Yêu cầu team phân tích dùng công cụ hỗ trợ Delta",
      "B": "Tạo bản copy Iceberg của bảng Delta",
      "C": "Chuyển bảng Delta sang Iceberg và bật uniform để vẫn đọc được như Delta",
      "D": "Bật uniform cho bảng transactions sang 'iceberg' để đọc như bảng Iceberg"
    },
    "explanation_vi": "Bật table property uniform = 'iceberg' giúp một bảng Delta được trình bày như bảng Iceberg mà không cần bản copy, phù hợp nhất với nhu cầu chia sẻ.",
    "page": null,
    "image": "img/q_228.jpg"
  },
  {
    "id": 229,
    "topic": 1,
    "question": "A junior data engineer is working to implement logic for a Lakehouse table named silver_device_recordings. The source data contains 100 unique\nfields in a highly nested JSON structure.\nThe silver_device_recordings table will be used downstream for highly selective joins on a number of fields, and will also be leveraged by the\nmachine learning team to filter on a handful of relevant fields. In total, 15 fields have been identified that will often be used for filter and join logic.\nThe data engineer is trying to determine the best approach for dealing with these nested fields before declaring the table schema.\nWhich of the following accurately presents information about Delta Lake and Databricks that may impact their decision-making process?",
    "options": {
      "A": "Because Delta Lake uses Parquet for data storage, Dremel encoding information for nesting can be directly referenced by the Delta\ntransaction log.",
      "B": "Schema inference and evolution on Databricks ensure that inferred types will always accurately match the data types used by downstream\nsystems.",
      "C": "The Tungsten encoding used by Databricks is optimized for storing string data; newly-added native support for querying JSON strings\nmeans that string types are always most efficient.",
      "D": "By default, Delta Lake collects statistics on the first 32 columns in a table; these statistics are leveraged for data skipping when executing\nselective queries."
    },
    "answer": "D",
    "question_vi": "Bảng silver_device_recordings có JSON lồng nhau, 15 trường hay được lọc/join. Thông tin nào về Delta/Databricks ảnh hưởng quyết định thiết kế schema?",
    "options_vi": {
      "A": "Delta dùng Parquet nên có thể tham chiếu trực tiếp mã hoá Dremel cho dữ liệu lồng",
      "B": "Schema inference/evolution luôn khớp hoàn toàn với hệ thống downstream",
      "C": "Tungsten tối ưu cho chuỗi; hỗ trợ JSON string mới nên luôn chọn string",
      "D": "Mặc định Delta thu thập thống kê cho 32 cột đầu; thống kê này dùng cho data skipping khi truy vấn chọn lọc"
    },
    "explanation_vi": "Delta thu thập min/max cho 32 cột đầu nên nên đưa 15 trường hay lọc vào nhóm đầu để tận dụng data skipping. Các phát biểu khác không đúng/không đủ.",
    "page": null,
    "image": "img/q_229.jpg"
  },
  {
    "id": 230,
    "topic": 1,
    "question": "A platform engineer is creating catalogs and schemas for the development team to use.\nThe engineer has created an initial catalog, Catalog_A, and initial schema, Schema_",
    "options": {
      "A": "The owner of the schema does not automatically have permission to tables within the schema, but can grant them to themselves at any\npoint.",
      "B": "Users granted with USE CATALOG can modify the owner's permissions to downstream tables.",
      "C": "Permissions explicitly given by the table creator are the only way the Platform Engineer could access the underlying tables in their schema.",
      "D": "The platform engineer needs to execute a REFRESH statement as the table permissions did not automatically update for owners."
    },
    "answer": "A",
    "question_vi": "Kỹ sư nền tảng tạo catalog/schema mới. Điều nào đúng về quyền?",
    "options_vi": {
      "A": "Owner của schema không tự động có quyền trên bảng bên trong nhưng có thể tự cấp cho mình",
      "B": "Người có USE CATALOG có thể sửa quyền owner trên bảng downstream",
      "C": "Chỉ quyền do người tạo bảng cấp mới cho phép owner truy cập bảng",
      "D": "Owner phải REFRESH vì quyền bảng không tự cập nhật"
    },
    "explanation_vi": "Trong Unity Catalog, owner schema không mặc định sở hữu bảng con; họ có thể tự GRANT cho mình khi cần. Các lựa chọn khác sai về mô hình quyền.",
    "page": null,
    "image": "img/q_230.jpg"
  },
  {
    "id": 231,
    "topic": 1,
    "question": "A data engineer has created a new cluster using shared access mode with default configurations. The data engineer needs to allow the\ndevelopment team access to view the driver logs if needed.\nWhat are the minimal cluster permissions that allow the development team to accomplish this?",
    "options": {
      "A": "CAN VIEW",
      "B": "CAN RESTART",
      "C": "CAN ATTACH TO",
      "D": "CAN MANAGE"
    },
    "answer": "A",
    "question_vi": "Cluster shared access mode mặc định; cần cho team dev xem driver logs. Quyền tối thiểu?",
    "options_vi": {
      "A": "CAN VIEW",
      "B": "CAN RESTART",
      "C": "CAN ATTACH TO",
      "D": "CAN MANAGE"
    },
    "explanation_vi": "Quyền CAN VIEW cho phép xem cấu hình và log cluster. CAN ATTACH/RESTART/MANAGE mạnh hơn mức yêu cầu.",
    "page": null,
    "image": "img/q_231.jpg"
  },
  {
    "id": 232,
    "topic": 1,
    "question": "A data engineer wants to create a cluster using the Databricks CLI for a big ETL pipeline. The cluster should have five workers and one driver of\ntype i3.xlarge and should use the '14.3.x-scala2.12' runtime.\nWhich command should the data engineer use?",
    "options": {
      "A": "databricks compute add 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster",
      "B": "databricks clusters create 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster",
      "C": "databricks compute create 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster",
      "D": "databricks clusters add 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster"
    },
    "answer": "B",
    "question_vi": "Muốn tạo cluster 5 worker + 1 driver i3.xlarge, runtime '14.3.x-scala2.12' bằng Databricks CLI. Lệnh nào đúng?",
    "options_vi": {
      "A": "databricks compute add 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster",
      "B": "databricks clusters create 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster",
      "C": "databricks compute create 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster",
      "D": "databricks clusters add 14.3.x-scala2.12 --num-workers 5 --node-type-id i3.xlarge --cluster-name Data Engineer_cluster"
    },
    "explanation_vi": "CLI dùng subcommand clusters create kèm runtime/version và cấu hình worker/driver. Các subcommand compute/add không tồn tại trong ngữ cảnh này.",
    "page": null,
    "image": "img/q_232.jpg"
  },
  {
    "id": 233,
    "topic": 1,
    "question": "A 'transactions' table has been liquid clustered on the columns 'product_id’, ’user_id' and 'event_date'.\nWhich operation lacks support for cluster on write?",
    "options": {
      "A": "CTAS and RTAS statements",
      "B": "spark.writeStream.format(’delta').mode(’append’)",
      "C": "spark.write.format('delta’).mode('append')",
      "D": "INSERT INTO operations"
    },
    "answer": "B",
    "question_vi": "Bảng 'transactions' đã cluster theo liquid trên product_id, user_id, event_date. Thao tác nào chưa hỗ trợ cluster on write?",
    "options_vi": {
      "A": "CTAS và RTAS",
      "B": "spark.writeStream.format('delta').mode('append')",
      "C": "spark.write.format('delta').mode('append')",
      "D": "INSERT INTO"
    },
    "explanation_vi": "Liquid clustering chưa hỗ trợ cho stream append; batch append/CTAS/INSERT INTO thì được.",
    "page": null,
    "image": "img/q_233.jpg"
  },
  {
    "id": 234,
    "topic": 1,
    "question": "The data governance team has instituted a requirement that the \"user\" table containing Personal Identifiable Information (PII) must have the\nappropriate masking on the SSN column. This means that anyone outside of the HRAdminGroup should see masked social security numbers as\n***-**-****.\nThe team created a masking function:\nWhat does the data governance team need to do next to achieve this goal?",
    "options": {
      "A": "CREATE TABLE users -\n(name STRING);\nALTER TABLE users CREATE COLUMN ssn CREATE MASK ssn_mask;",
      "B": "CREATE TABLE users -\n(name STRING, int STRING);\nALTER TABLE users ALTER COLUMN ssn CREATE MASK if is_member('HRAdminGroup');",
      "C": "CREATE TABLE users -\n(name STRING, ssn INT MASKED ssn_mask);",
      "D": "CREATE TABLE users -\n(name STRING, ssn STRING);\nALTER TABLE users ALTER COLUMN ssn SET MASK ssn_mask;"
    },
    "answer": "D",
    "question_vi": "Bảng users chứa PII; cột SSN phải được mask thành ***-**-**** cho mọi người trừ HRAdminGroup. Hàm mask đã có. Cần làm gì tiếp?",
    "options_vi": {
      "A": "CREATE TABLE users (name STRING); ALTER TABLE users CREATE COLUMN ssn CREATE MASK ssn_mask;",
      "B": "CREATE TABLE users (name STRING, int STRING); ALTER TABLE users ALTER COLUMN ssn CREATE MASK if is_member('HRAdminGroup');",
      "C": "CREATE TABLE users (name STRING, ssn INT MASKED ssn_mask);",
      "D": "CREATE TABLE users (name STRING, ssn STRING); ALTER TABLE users ALTER COLUMN ssn SET MASK ssn_mask;"
    },
    "explanation_vi": "Cần định nghĩa cột ssn và gán mask bằng ALTER COLUMN SET MASK ssn_mask. Các lựa chọn khác sai cú pháp hoặc kiểu dữ liệu.",
    "page": null,
    "image": "img/q_234.jpg"
  },
  {
    "id": 235,
    "topic": 1,
    "question": "A data engineer needs to create an application that will collect information about the latest job run including the repair history.\nHow should the data engineer format the request?",
    "options": {
      "A": "Call/api/2.1/jobs/runs/list with the run_id and include_history parameters",
      "B": "Call/api/2.1/jobs/runs/get with the run_id and include_history parameters",
      "C": "Call/api/2.1/jobs/runs/get with the job_id and include_history parameters",
      "D": "Call/api/2.1/jobs/runs/list with the job_id and include_history parameters"
    },
    "answer": "D",
    "question_vi": "Cần lấy thông tin lần chạy job mới nhất kèm lịch sử sửa/chạy lại. Định dạng request thế nào?",
    "options_vi": {
      "A": "Gọi /api/2.1/jobs/runs/list với run_id và include_history",
      "B": "Gọi /api/2.1/jobs/runs/get với run_id và include_history",
      "C": "Gọi /api/2.1/jobs/runs/get với job_id và include_history",
      "D": "Gọi /api/2.1/jobs/runs/list với job_id và include_history"
    },
    "explanation_vi": "Danh sách các run của một job (kèm lịch sử repair) lấy qua runs/list bằng job_id + include_history. runs/get cần run_id đơn lẻ.",
    "page": null,
    "image": "img/q_235.jpg"
  },
  {
    "id": 236,
    "topic": 1,
    "question": "A data engineer is working in an interactive notebook with many transformations before outputting the result from display(df.collect() ). The\nnotebook includes wide transformations and a cross join.\nThe data engineer is getting the following error: \"The spark driver has stopped unexpectedly and is restarting. Your notebook will be automatically\nreattached.\"\nWhich action should the data engineer take?",
    "options": {
      "A": "Run the notebook on a single node cluster to keep driver from falling.",
      "B": "Rewrite their code to avoid putting memory pressure on the driver node.",
      "C": "Check into the Spark UI to see how many jobs are assigned to each stage as they are employing fewer executors.",
      "D": "Look at the compute metrics UI to see if the executors have higher than 90% memory utilization."
    },
    "answer": "B",
    "question_vi": "Notebook interactive có nhiều biến đổi rộng và cross join; driver liên tục restart do out of memory. Nên làm gì?",
    "options_vi": {
      "A": "Chạy trên single-node cluster để giữ driver",
      "B": "Viết lại để giảm áp lực bộ nhớ lên driver",
      "C": "Xem Spark UI số job/stage vì ít executor",
      "D": "Xem compute metrics xem executor dùng >90% RAM"
    },
    "explanation_vi": "Vấn đề do logic đặt toàn bộ dữ liệu về driver (collect/display). Cần refactor để tránh thu dữ liệu lớn về driver, thay vì chỉ đổi cluster.",
    "page": null,
    "image": "img/q_236.jpg"
  },
  {
    "id": 237,
    "topic": 1,
    "question": "An analytics team wants run an experiment in the short term on the customer transaction Delta table (with 20 billions records) created by the data\nengineering team in Databricks SQL.\nWhich strategy should the data engineering team use to ensure minimal downtime and no impact on the ongoing ETL processes?",
    "options": {
      "A": "Deep clone the table for the analytics team.",
      "B": "Create a new table for the analytics team using a CTAS statement.",
      "C": "Shallow clone the table for the analytics team.",
      "D": "Give access to the table for the analytics team."
    },
    "answer": "C",
    "question_vi": "Team phân tích muốn thử nghiệm ngắn hạn trên bảng Delta 20 tỷ dòng mà không ảnh hưởng ETL. Nên làm gì để downtime tối thiểu?",
    "options_vi": {
      "A": "Deep clone bảng cho team phân tích",
      "B": "Tạo bảng mới bằng CTAS",
      "C": "Shallow clone cho team phân tích",
      "D": "Cấp quyền trực tiếp trên bảng"
    },
    "explanation_vi": "Shallow clone tạo bản sao metadata, chia sẻ dữ liệu gốc nên gần như không downtime, không ảnh hưởng ETL, phù hợp thử nghiệm.",
    "page": null,
    "image": "img/q_237.jpg"
  },
  {
    "id": 238,
    "topic": 1,
    "question": "A data team is working to optimize an existing large, fast-growing table 'orders' with high cardinality columns, which experiences significant data\nskew and requires frequent concurrent writes. The team notice that the columns 'user_id', 'event_timestamp' and 'product_id' are heavily used in\nanalytical queries and filters, although those keys may be subject to change in the future due to different business requirements.\nWhich partitioning strategy should the team choose to optimize the table for immediate data skipping, incremental management over time, and\nflexibility?",
    "options": {
      "A": "Partition the table with: ALTER TABLE orders PARTITION BY user_id, product_id, event_timestamp",
      "B": "Use z-order after partitiing the table: OPTIMIZE orders ZORDER BY (user_id, product_id) WHERE event_timestamp = current date () - 1 DAY",
      "C": "Cluster the table with: ALTER TABLE orders CLUSTER BY user_id, product_id, event_timestamp",
      "D": "Z-order the table with OPTIMIZE orders ZORDER BY (user_id, product_id, event_timestamp)"
    },
    "answer": "D",
    "question_vi": "Bảng 'orders' lớn, skew cao, nhiều ghi đồng thời; các cột user_id, event_timestamp, product_id hay được lọc nhưng có thể đổi trong tương lai. Chiến lược phân vùng nào tối ưu cho data skipping tức thì, quản lý dần và linh hoạt?",
    "options_vi": {
      "A": "Partition bảng: PARTITION BY user_id, product_id, event_timestamp",
      "B": "Partition rồi Z-order theo (user_id, product_id) với WHERE event_timestamp = current_date() - 1",
      "C": "Cluster bảng: CLUSTER BY user_id, product_id, event_timestamp",
      "D": "Z-order: OPTIMIZE orders ZORDER BY (user_id, product_id, event_timestamp)"
    },
    "explanation_vi": "Z-order trên các khóa lọc cho data skipping linh hoạt mà không khóa chặt partitioning; dễ thay đổi khi yêu cầu đổi.",
    "page": null,
    "image": "img/q_238.jpg"
  },
  {
    "id": 239,
    "topic": 1,
    "question": "A faulty IoT sensor in a factory reports a temperature of -500, causing the LDP pipeline to fail the expectation, which only allows values between\n-100 and 200 degrees Celsius. The data engineer would like to further analyze the faulty data to better understand the reason behind this.\nHow should the data engineer resolve the faulty data while ensuring data quality standards are maintained?",
    "options": {
      "A": "Remove all expectations form the pipeline to prevent any future failures, regardless of data quality.",
      "B": "Ignore the error and simply re-run the pipeline, as Databricks will automatically skip the problematic record on the next run.",
      "C": "Fix the pipeline code and implement a quarantine logic to isolate the faulty data before re-running the pipeline.",
      "D": "Change the expectation action from fail to warn so that invalid records are included in the output and the pipeline does not fail."
    },
    "answer": "C",
    "question_vi": "Cảm biến IoT lỗi trả -500 khiến expectation LDP (chỉ cho -100 đến 200) fail. Muốn phân tích thêm nhưng vẫn giữ chuẩn chất lượng. Làm gì?",
    "options_vi": {
      "A": "Bỏ hết expectation để tránh fail",
      "B": "Bỏ qua lỗi và chạy lại, Databricks sẽ tự bỏ dòng xấu",
      "C": "Sửa code pipeline và thêm logic quarantine để cô lập dữ liệu lỗi trước khi chạy lại",
      "D": "Đổi expectation hành động từ fail thành warn để dữ liệu xấu vẫn vào"
    },
    "explanation_vi": "Giữ expectation nhưng cách ly bản ghi sai bằng nhánh quarantine rồi chạy lại, vừa phân tích được lỗi vừa không phá dữ liệu sạch.",
    "page": null,
    "image": "img/q_239.jpg"
  },
  {
    "id": 240,
    "topic": 1,
    "question": "A data engineer is optimizing a managed table that suffers from data skew and frequently changing query filter columns. The engineer needs to\navoid costly data rewrites when query patterns evolve. The table size is under 1TB.\nHow should data engineer meet this requirement?",
    "options": {
      "A": "Use Hive-style partitioning, as it provides efficient data skipping and is easy to change partition columns at any time.",
      "B": "Combine partitioning and Z-ordering to maximize flexibility and minimize maintenance as query patterns change.",
      "C": "Enable liquid clustering, as it efficiently handles data skew, allows clustering keys to be changed without rewriting existing data, and adapts\nto evolving query patterns.",
      "D": "Apply Z-ordering, since it allows flexible reorganization of data layout without rewriting existing and adapts easily to new filter columns."
    },
    "answer": "C",
    "question_vi": "Bảng managed <1TB bị skew, cột lọc thay đổi thường xuyên; muốn tránh rewrite tốn kém khi mẫu truy vấn đổi. Nên làm gì?",
    "options_vi": {
      "A": "Dùng partition kiểu Hive để dễ đổi cột partition",
      "B": "Kết hợp partition và Z-order để linh hoạt",
      "C": "Bật liquid clustering để xử lý skew và cho phép đổi khóa clustering không cần rewrite",
      "D": "Chỉ Z-order vì dễ tái tổ chức mà không rewrite"
    },
    "explanation_vi": "Liquid clustering tự cân bằng skew và cho phép đổi khóa theo thời gian mà không phải viết lại dữ liệu hiện có.",
    "page": null,
    "image": "img/q_240.jpg"
  },
  {
    "id": 241,
    "topic": 1,
    "question": "A security team wants to enforce data protection for a customer table containing customer PII data. To comply with local policies, sales team\nmembers should only see customers from their region, while non-admin users should have email addresses masked.\nWhich implementation approach should be used when using Unity Catalog row filters and column masks?",
    "options": {
      "A": "Create SQL UDFs for row filtering based on user region and column masking based on group membership, then apply them using ALTER\nTABLE SET ROW FILTER and ALTER COLUMN SET MASK commands.",
      "B": "Use table ACLs to restrict access using tags with GRANT SELECT ON table_name WITH TAG command, and rely on application-level filtering\nfor sensitive data based on user region.",
      "C": "Create a view with dynamic WHERE clauses for region filtering and use string replacement functions for email masking using ALTER\nCOLUMN SET MASK command.",
      "D": "Implement row filters with SQL UDFs based on user region only since column masks cannot be combined with row filters on the same table,\nthen apply them be recreating the table with DROP TABLE and CREATE TABLE SET ROW FILTER commands."
    },
    "answer": "A",
    "question_vi": "Cần lọc hàng theo vùng và mask email cho người không phải admin bằng Unity Catalog. Cách triển khai đúng?",
    "options_vi": {
      "A": "Tạo SQL UDF cho row filter theo vùng và mask cột theo nhóm, áp dụng bằng ALTER TABLE SET ROW FILTER và ALTER COLUMN SET MASK",
      "B": "Dùng table ACL với TAG và lọc ứng dụng",
      "C": "Tạo view với WHERE động và hàm replace để mask email",
      "D": "Chỉ tạo row filter vì mask không kết hợp được với row filter"
    },
    "explanation_vi": "UC hỗ trợ UDF cho row filter và column mask, áp dụng bằng ALTER TABLE ... SET ROW FILTER / ALTER COLUMN ... SET MASK nên đáp án A.",
    "page": null,
    "image": "img/q_241.jpg"
  },
  {
    "id": 242,
    "topic": 1,
    "question": "A data engineer is evaluating tools to build a production-grade data pipeline. The team must process change data from cloud object storage, filter\nout or isolate invalid records, and ensure the timely delivery of clean data to downstream consumers. The team is small, under tight deadlines,\nand wants to minimize operational overhead while keeping pipelines auditable and maintainable.\nWhich approach should the data engineer implement?",
    "options": {
      "A": "Ingest data directly into Delta tables via Spark jobs, apply data quality filters using UDFs, and use LDP for creating Materialized Views.",
      "B": "Use a hybrid approach: Ingest with Auto Loader into Bronze tables, then process using SQL queries in Databricks Workflows to generate\ncleaned Silver and Gold tables on a schedule.",
      "C": "Implement ingestion using Auto Loader with Structured Streaming, and manage invalid data handling and table updates using\ncheckpointing and merge logic.",
      "D": "Use LDP to build declarative pipelines with Streaming Tables and Materialized Views, leveraging built-in support for data expectations and\nincremental processing."
    },
    "answer": "D",
    "question_vi": "Team nhỏ, cần pipeline production: nhận CDC từ object storage, lọc/quarantine bản ghi lỗi, giao dữ liệu sạch kịp thời, ít vận hành nhưng audit được. Chọn cách nào?",
    "options_vi": {
      "A": "Ingest trực tiếp vào Delta bằng Spark jobs, lọc bằng UDF, dùng LDP cho MV",
      "B": "Hybrid: Auto Loader vào Bronze, rồi SQL Workflows tạo Silver/Gold theo lịch",
      "C": "Auto Loader + Structured Streaming, quản lý checkpoint + merge",
      "D": "Dùng LDP (Streaming Tables, Materialized Views) với expectation và xử lý tăng dần"
    },
    "explanation_vi": "LDP (Delta Live Tables) cung cấp declarative pipeline, expectation/quarantine tích hợp, streaming/materialized view cho CDC với ít vận hành.",
    "page": null,
    "image": "img/q_242.jpg"
  },
  {
    "id": 243,
    "topic": 1,
    "question": "A data engineer is using Structured Streaming to read in transaction data from a bronze Delta table. It was discovered that the data has quality\nissues where sometimes the transaction value is negative, and when that occurs, the rows need to be routed to a separate quarantine table. They\nhave low latency requirements for the good data since it is used by downstream systems, but the bad data will only be analyzed periodically and\nhas no production dependencies. The quarantine job needs to be implemented so that it cannot affect the production processes that depend on\nthe good data, and the cost of the job needs to be minimized.\nHow should the quarantine process be implemented in order to satisfy these requirements?",
    "options": {
      "A": "The streaming job for the good data needs to be modified to filter out records with a transaction value less than 0 before writing. The\nstreaming job for the quarantine data needs to filter out records with a transaction value greater than or equal to 0 before writing. Both should\nrun as separate streams on the same cluster to minimize cost.",
      "B": "The existing streaming job for the good data should be updated to incorporate the quarantining of the bad data. A new boolean column\ncalled “quarantine” should be added to the dataframe, and its value should be set to true if the transaction value is less than 0 and false if the\ntransaction value is greater than or equal to 0. Processing and storing all the data together will save costs.",
      "C": "The existing streaming job for the good data should be updated to incorporate the quarantining of the bad data. Inside a foreachBatch\nfunction, the dataframe should be filtered so that records with a transaction value greater than or equal to 0 are written to the good data table\nand records with a transaction value less than 0 are written to a quarantine table. Try/Catch can be added around the writes in the\nforeachBatch function so that the stream can’t fail.",
      "D": "The streaming job for the good data needs to be modified to filter out records with a transaction value less than 0 before writing, and\nshould not share compute with other processes. The streaming job for the quarantine data needs to filter out records with a transaction value\ngreater than or equal to 0 before writing, and should be implemented on a separate small cluster and only run once a day to minimize cost."
    },
    "answer": "D",
    "question_vi": "Streaming đọc bảng Delta giao dịch; giá trị âm phải đưa vào bảng quarantine, không ảnh hưởng luồng dữ liệu tốt và tối ưu chi phí. Làm thế nào?",
    "options_vi": {
      "A": "Chạy hai stream trên cùng cluster: luồng tốt lọc >=0, quarantine lọc <0",
      "B": "Một stream duy nhất thêm cột quarantine true/false và lưu chung để tiết kiệm",
      "C": "Một stream dùng foreachBatch ghi dữ liệu tốt/quarantine trong try/catch để khỏi fail",
      "D": "Luồng dữ liệu tốt lọc <0 trước khi ghi và không dùng chung compute; luồng quarantine riêng trên cluster nhỏ, chạy hằng ngày để giảm chi phí"
    },
    "explanation_vi": "Tách hai stream, không chia sẻ compute để luồng tốt không bị ảnh hưởng; luồng quarantine chạy riêng, ít tần suất để giảm chi phí.",
    "page": null,
    "image": "img/q_243.jpg"
  },
  {
    "id": 244,
    "topic": 1,
    "question": "When monitoring a complex workload, being able to see the query plan is critical to understanding what the workload is doing.\nWhere can the visualization of the query plan be found?",
    "options": {
      "A": "In the Spart UI, under the Jobs tab",
      "B": "In the Query Profiler, under Query Source",
      "C": "In the Spark UI, under the SQL/DataFrame tab",
      "D": "In the Query Profiler, under the Stages tab"
    },
    "answer": "C",
    "question_vi": "Muốn xem trực quan query plan khi theo dõi workload phức tạp. Xem ở đâu?",
    "options_vi": {
      "A": "Spark UI, tab Jobs",
      "B": "Query Profiler, tab Query Source",
      "C": "Spark UI, tab SQL/DataFrame",
      "D": "Query Profiler, tab Stages"
    },
    "explanation_vi": "Spark UI > SQL/DataFrame hiển thị DAG và plan chi tiết của truy vấn.",
    "page": null,
    "image": "img/q_244.jpg"
  },
  {
    "id": 245,
    "topic": 1,
    "question": "A data engineer is troubleshooting a slow-running Delta Lake query on Databricks SQL involves complex joins and large datasets. They need to\nidentify whether the root cause is related to poor data skipping, inefficient join strategies, or excessive data shuffling.\nWhich approach should identify the specific bottlenecks using native Databricks tools?",
    "options": {
      "A": "Analyze the Top Operators panel in the Query Profile to identify high-cost operations like BroadcastNestedLoopJoin",
      "B": "Check the query’s execution time in the Jobs UI and correlate it with cluster resource utilization metrics.",
      "C": "Enable the EXPLAIN command to review the parsed logical plan and manually estimate shuffle sizes.",
      "D": "Use the LIMIT clause to run a subset of the query and compare execution times with the full dataset."
    },
    "answer": "A",
    "question_vi": "Đang troubleshoot truy vấn Delta phức tạp (join lớn, shuffle); cần xác định bottleneck data skipping/join/shuffle bằng công cụ Databricks gốc. Làm gì?",
    "options_vi": {
      "A": "Phân tích Top Operators trong Query Profile để tìm operator tốn kém (ví dụ BroadcastNestedLoopJoin)",
      "B": "Xem thời gian thực thi trong Jobs UI và so với metrics tài nguyên",
      "C": "Dùng EXPLAIN để xem logical plan và ước lượng shuffle",
      "D": "Chạy LIMIT để so sánh thời gian"
    },
    "explanation_vi": "Query Profile cung cấp Top Operators kèm chi phí thực, giúp thấy join/shuffle/skipping đang gây tốn kém.",
    "page": null,
    "image": "img/q_245.jpg"
  },
  {
    "id": 246,
    "topic": 1,
    "question": "A data engineer is designing a secure data sharing strategy for their organization. The company needs to share sensitive customer analytics data\nwith two different partners. Partner A uses Databricks with Unity Catalog enabled, while Partner B uses Apache Spark on AWS without Databricks.\nHow should the company implement secure data sharing for these scenarios?",
    "options": {
      "A": "For Partner A, implement Databricks-to-Databricks sharing (D2D) with Unit Catalog integration and no-token exchange system. For Partner\nB, use open sharing protocol (D2O) with either bearer tokens or OIDC federation for authentication, ensuring both approaches maintain robust\nsecurity and governance.",
      "B": "Both partners should use the same Delta Sharing approach since security requirements are identical. You should create bearer tokens for\nboth partners and use the open sharing protocol (D2O) for maximum compatibility.",
      "C": "Open sharing protocol (D2O) should be used for both partners because it provides better security than D2D sharing. The bearer token\napproach is always more secure than Unity Catalog’s native authentication.",
      "D": "Databricks-to-Databricks sharing (D2D) can only be used within the same cloud provider, so you must use open sharing (D2O) for any cross-\ncloud scenarios. Unit Catalog governance is not available when sharing with external platforms."
    },
    "answer": "A",
    "question_vi": "Chia sẻ dữ liệu nhạy cảm cho đối tác A (Databricks + UC) và đối tác B (Spark on AWS, không Databricks). Chiến lược an toàn?",
    "options_vi": {
      "A": "Đối tác A: Databricks-to-Databricks (D2D) tích hợp UC, không trao token; đối tác B: open sharing (D2O) dùng bearer token hoặc OIDC",
      "B": "Cả hai dùng Delta Sharing open protocol với bearer token",
      "C": "Luôn dùng open protocol vì bảo mật hơn D2D",
      "D": "D2D chỉ dùng cùng cloud nên phải dùng open sharing, UC không áp dụng khi chia sẻ ra ngoài"
    },
    "explanation_vi": "Databricks-to-Databricks + UC cho đối tác A (an toàn, quản trị tập trung); open sharing (D2O) cho nền tảng ngoài Databricks, dùng token/OIDC.",
    "page": null,
    "image": "img/q_246.jpg"
  },
  {
    "id": 247,
    "topic": 1,
    "question": "Which approach demonstrates a modular and testable way to use DataFrame transform for ETL code in PySpark?",
    "options": {
      "A": "",
      "B": "",
      "C": "",
      "D": ""
    },
    "answer": "C",
    "question_vi": "Cách nào thể hiện việc dùng DataFrame transform theo kiểu module và testable cho ETL PySpark?",
    "options_vi": {
      "A": "",
      "B": "",
      "C": "",
      "D": ""
    },
    "explanation_vi": "Đáp án C (đoạn code mẫu) minh họa viết hàm transform nhận/ trả DataFrame để dễ unit test và tái sử dụng.",
    "page": null,
    "image": "img/q_247.jpg"
  },
  {
    "id": 248,
    "topic": 1,
    "question": "A company stores account transactions in a Delta Lake table. The company needs to apply frequent account-level correlations (e.g., UPDATE\nstatements) but wants to avoid rewriting entire Parquet files for each change to reduce file churn and improve write performance.\nWhich Delta Lake feature should they enable?",
    "options": {
      "A": "Enable automatic file compaction on writes",
      "B": "Enable change data feed on the Delta table",
      "C": "Partition the Delta table by account_id",
      "D": "Enable deletion vectors on the Delta table"
    },
    "answer": "D",
    "question_vi": "Bảng Delta lưu giao dịch, thường xuyên UPDATE theo account; muốn tránh phải ghi lại toàn bộ file Parquet mỗi lần để giảm file churn. Bật tính năng nào?",
    "options_vi": {
      "A": "Bật compaction tự động khi ghi",
      "B": "Bật change data feed",
      "C": "Partition theo account_id",
      "D": "Bật deletion vectors cho bảng Delta"
    },
    "explanation_vi": "Deletion vectors cho phép ghi delta cho cập nhật/xóa mà không phải viết lại toàn bộ file, giảm churn.",
    "page": null,
    "image": "img/q_248.jpg"
  },
  {
    "id": 249,
    "topic": 1,
    "question": "In a Databricks Asset Bundle project, in the file resources/app.yml, the data engineer would like to deploy a Databricks Apps\ndatabricks_app_deployed and Volume volume_deployed and grant the Service Principal behind Databricks Apps permissions to READ and WRITE\nto the Volume.\nHow should the data engineer achieve the deployment?",
    "options": {
      "A": "",
      "B": "",
      "C": "---PAGE 407---",
      "D": ""
    },
    "answer": "A",
    "question_vi": "Trong Databricks Asset Bundle, file resources/app.yml cần deploy Databricks App và Volume, cấp quyền READ/WRITE cho Service Principal của App. Làm thế nào?",
    "options_vi": {
      "A": "",
      "B": "",
      "C": "",
      "D": ""
    },
    "explanation_vi": "Đáp án A tương ứng cấu hình đúng (khai báo databricks_app + volume + grants cho service principal).",
    "page": null,
    "image": "img/q_249.jpg"
  },
  {
    "id": 250,
    "topic": 1,
    "question": "A data engineering teams needs to implement a tagging system for their tables as part of an automated ETL process, and needs to apply tags\nprogrammatically to tables in Unity Catalog.\nWhich SQL command adds tags to a table programmatically?",
    "options": {
      "A": "ALTER TABLE table_name SET TAGS (‘key1’ = ‘value1’, ‘key2’ = ‘value2’);",
      "B": "APPLY TAGS ON table_name VALUES (‘key1’ = ‘value1’, ‘key2’ = ‘value2’)",
      "C": "COMMENT ON TABLE table_name TAGS (‘key1’ = ‘value1’, ‘key2’ = ‘value2’)",
      "D": "SET TAGS FOR table_name AS (‘key1’ = ‘value1’, ‘key2’ = ‘value2’)"
    },
    "answer": "A",
    "question_vi": "ETL cần gắn tag vào bảng trong Unity Catalog bằng code. Lệnh SQL nào thêm tag?",
    "options_vi": {
      "A": "ALTER TABLE table_name SET TAGS ('key1' = 'value1', 'key2' = 'value2');",
      "B": "APPLY TAGS ON table_name VALUES ('key1' = 'value1', 'key2' = 'value2')",
      "C": "COMMENT ON TABLE table_name TAGS ('key1' = 'value1', 'key2' = 'value2')",
      "D": "SET TAGS FOR table_name AS ('key1' = 'value1', 'key2' = 'value2')"
    },
    "explanation_vi": "ALTER TABLE ... SET TAGS là cú pháp chuẩn để gắn tag bằng SQL.",
    "page": null,
    "image": "img/q_250.jpg"
  },
  {
    "id": 251,
    "topic": 1,
    "question": "A platform engineer needs to report the resource consumption, categorized by SKU tier, across all workspaces. The engineer decides to use the\nsystem.billing.usage system table to create a query.\nWhich SQL query will accurately return the daily usage by product?",
    "options": {
      "A": "",
      "B": "",
      "C": "",
      "D": ""
    },
    "answer": "C",
    "question_vi": "Platform engineer muốn báo cáo mức sử dụng theo SKU cho mọi workspace bằng bảng system.billing.usage. Câu lệnh SQL nào trả usage theo sản phẩm mỗi ngày?",
    "options_vi": {
      "A": "",
      "B": "",
      "C": "",
      "D": ""
    },
    "explanation_vi": "Đáp án C là truy vấn đúng (tính tổng usage theo product và ngày).",
    "page": null,
    "image": "img/q_251.jpg"
  },
  {
    "id": 252,
    "topic": 1,
    "question": "A data engineer is running a groupBy aggregation on a massive user activity log grouped by user_id. A few users have millions of records, causing\ntask skew and long runtimes.\nWhich technique will fix the skew in this aggregation?",
    "options": {
      "A": "Increase the Spark driver memory and retry.",
      "B": "Filter out the skewed users before the aggregation",
      "C": "Use salting by adding a random prefix to skewed keys before aggregation, then aggregate again after removing the prefix.",
      "D": "Use reduceByKey instead of groupBy to avoid shuffles."
    },
    "answer": "C",
    "question_vi": "Chạy groupBy user_id trên log lớn bị skew vì vài user có triệu bản ghi. Kỹ thuật nào xử lý skew này?",
    "options_vi": {
      "A": "Tăng bộ nhớ driver rồi chạy lại",
      "B": "Lọc bỏ user skew trước khi group",
      "C": "Dùng salting: thêm prefix ngẫu nhiên vào key skew trước khi group, rồi aggregate lại sau khi bỏ prefix",
      "D": "Dùng reduceByKey thay groupBy để tránh shuffle"
    },
    "explanation_vi": "Salting tách khóa skew thành nhiều khóa con, phân bố tải, rồi gộp lại sau đó.",
    "page": null,
    "image": "img/q_252.jpg"
  },
  {
    "id": 253,
    "topic": 1,
    "question": "A job runs four independent tasks (X, Y, Z, W) in parallel to process regional sales data. The Data Engineering team recently updated its cluster\npolicy to ban cost-prohibitive instance types. Task Y now fails due to the newly enforced cluster policy restricting the use of a specific instance\ntype. A data engineer needs to resolve the failure quickly without disrupting the other tasks.\nHow should the data engineer resolve the failure of tasks?",
    "options": {
      "A": "Delete the failed run, disable the cluster policy, and re-execute all tasks.",
      "B": "Manually create a new cluster for Task Y, update the job configuration, and trigger a full re-run.",
      "C": "Use “Repair run”, override the cluster configuration for Task Y to use a permitted instance type, and let Databricks re-run only Task Y.",
      "D": "Edit the global cluster policy to allow the restricted instance type, then re-run the entire job."
    },
    "answer": "C",
    "question_vi": "Một job chạy 4 task độc lập (X, Y, Z, W) song song xử lý dữ liệu bán hàng theo vùng. Cluster policy mới cấm loại instance đắt đỏ nên task Y bị fail. Cần khắc phục nhanh mà không ảnh hưởng task khác, phải làm gì?",
    "options_vi": {
      "A": "Xóa run lỗi, tắt cluster policy rồi chạy lại toàn bộ các task.",
      "B": "Tự tạo cluster mới cho task Y, sửa cấu hình job và chạy lại toàn bộ.",
      "C": "Dùng chức năng Repair run, override cấu hình cluster của task Y sang loại instance được phép và để Databricks chỉ chạy lại task Y.",
      "D": "Sửa global cluster policy cho phép instance bị chặn rồi chạy lại cả job."
    },
    "explanation_vi": "Chọn C: Repair run cho phép chỉnh cluster riêng cho task lỗi và chỉ re-run task đó, không gián đoạn các task còn lại.",
    "page": null,
    "image": "img/q_253.jpg"
  },
  {
    "id": 254,
    "topic": 1,
    "question": "A data engineer is analyzing a large, partitioned retail dataset in Databricks, where each row represents a sale made by a salesperson. The\ndataset contains millions of records with the following schema:\nsales_df: [salesperson_id: string, region: string, sale_amount: double, sale_date: date]\nThe data engineer needs to generate a DataFrame that ranks salespeople within each region based on their total cumulative sales, with the\nhighest seller ranked as 1. If multiple salespeople have the same total sales, they should share the same rank.\nThe data engineer wants to implement this logic using a PySpark window function and the dense_rank () function.\nWhich code snippet will perform this ranking?",
    "options": {
      "A": "",
      "B": "",
      "C": "",
      "D": ""
    },
    "answer": "D",
    "question_vi": "Cần xếp hạng nhân viên bán hàng theo tổng doanh thu trong từng vùng (doanh thu cao nhất hạng 1, doanh thu bằng nhau cùng hạng) bằng window dense_rank trong PySpark.",
    "options_vi": {
      "A": "",
      "B": "",
      "C": "",
      "D": ""
    },
    "explanation_vi": "Chọn D: dùng window = Window.partitionBy('region').orderBy(F.sum('sale_amount').desc()) rồi tính dense_rank() trên tổng doanh thu; đảm bảo cùng doanh thu cùng hạng.",
    "page": null,
    "image": "img/q_254.jpg"
  },
  {
    "id": 255,
    "topic": 1,
    "question": "What describes a primary technical challenge in ensuring consistent PII masking across all nodes in large-scale, distributed Databricks batch and\nstreaming pipelines?",
    "options": {
      "A": "PII masking is only required for direct identifiers.",
      "B": "Dynamic data masking is applied only at rest, so it does not affect query performance.",
      "C": "Masking functions must be standardized and managed through Unity Catalog, with enforcement applied across all relevant datasets to\navoid any data inconsistency.",
      "D": "Native masking in Databricks automatically synchronizes with all downstream external Databricks systems."
    },
    "answer": "C",
    "question_vi": "Thách thức kỹ thuật chính để đảm bảo masking PII nhất quán trên mọi node trong pipeline batch/stream Databricks là gì?",
    "options_vi": {
      "A": "Masking PII chỉ cần cho định danh trực tiếp.",
      "B": "Mask động chỉ áp dụng lúc lưu trữ nên không ảnh hưởng hiệu năng truy vấn.",
      "C": "Phải chuẩn hóa và quản lý hàm masking qua Unity Catalog, áp dụng trên mọi bộ dữ liệu liên quan để tránh không nhất quán.",
      "D": "Masking gốc của Databricks tự đồng bộ với mọi hệ thống downstream bên ngoài Databricks."
    },
    "explanation_vi": "Chọn C: cần hàm mask chuẩn và được UC thực thi trên tất cả dataset để tránh lệch giữa node.",
    "page": null,
    "image": "img/q_255.jpg"
  },
  {
    "id": 256,
    "topic": 1,
    "question": "A data engineer is working on a Databricks notebook that requires several third-party Python libraries. Some of these are available on PyPI, while\nothers are custom-developed and stored as local.wheel (.whl) and source (.tar.gz) files in an S3 bucket. The goal is to ensure all dependencies are\ninstalled and correctly available across multiple jobs running on any automated cluster in a Unity Catalog-enabled workspace. The engineer needs\nto install the required dependencies in a way that ensures a consistent environment setup across interactive notebooks and jobs and complies\nwith workspace security policies (no internet access).\nWhich approach should the engineer use to install and manage these dependencies while also ensuring reproducibility and compliance?",
    "options": {
      "A": "Use an init script on the cluster to install all dependencies using pip, referencing the local file system.",
      "B": "Install all dependencies manually in the driver node of an interactive cluster, then export the environment and reimport on job clusters using\n%conda.",
      "C": "Create a Python wheel file for the entire project, upload it to the Databricks Workspace Files or Volumes, and install it using a Cluster\nLibrary or pip install in a requirements.txt declared within a Databricks Asset Bundle.",
      "D": "Use %pip install in every notebook and job to install packages directly from PyPl and custom S3 paths."
    },
    "answer": "C",
    "question_vi": "Notebook cần nhiều thư viện bên thứ ba, một số từ PyPI, một số là wheel/tar.gz custom trong S3; workspace không cho truy cập internet. Cần cài đặt phụ thuộc nhất quán cho notebook và job ở UC-enabled workspace.",
    "options_vi": {
      "A": "Dùng init script trên cluster để pip install tất cả từ file hệ thống.",
      "B": "Cài thủ công trên driver cluster interactive rồi export/import môi trường cho job qua %conda.",
      "C": "Đóng gói dự án thành một wheel, tải lên Workspace Files hoặc Volumes và cài qua Cluster Library hoặc pip install từ requirements.txt khai báo trong Databricks Asset Bundle.",
      "D": "Dùng %pip install trong mọi notebook và job để cài trực tiếp từ PyPI và đường dẫn S3 custom."
    },
    "explanation_vi": "Chọn C: đóng gói thành wheel và quản lý bằng bundle/cluster library để tái lập môi trường offline, tuân thủ policy không internet.",
    "page": null,
    "image": "img/q_256.jpg"
  },
  {
    "id": 257,
    "topic": 1,
    "question": "A data engineer is using Auto Loader to read in JSON data as it arrives. They have configured Auto Loader to quarantine invalid JSON records.\nThey are noticing that over time, some records are being quarantined even though they are well-formed JSON.\nThe snippet of code is:\nWhat is the cause of the missing data?",
    "options": {
      "A": "The source data is valid JSON, but doesn’t conform to their defined schema in some way",
      "B": "The badRecordsPath location is accumulating many small files",
      "C": "The engineer forgot to set the option “cloudFiles.quarantineMode”, “rescue”.",
      "D": "At some point, the upstream data provider switched everything to multi-line JSON."
    },
    "answer": "A",
    "question_vi": "Auto Loader đọc JSON và cách ly bản ghi lỗi; theo thời gian có bản ghi JSON hợp lệ vẫn bị đưa vào quarantine.",
    "options_vi": {
      "A": "Dữ liệu JSON hợp lệ nhưng không khớp schema đã định.",
      "B": "Thư mục badRecordsPath tích lũy quá nhiều file nhỏ.",
      "C": "Quên set option cloudFiles.quarantineMode='rescue'.",
      "D": "Nguồn upstream chuyển sang multi-line JSON."
    },
    "explanation_vi": "Chọn A: bản ghi không đúng schema vẫn bị đưa vào quarantine dù là JSON hợp lệ.",
    "page": null,
    "image": "img/q_257.jpg"
  },
  {
    "id": 258,
    "topic": 1,
    "question": "A data engineer wants to enforce the principle of least privilege when configuring ACLs for Databricks jobs in a collaborative workspace.\nWhich approach should the data engineer use?",
    "options": {
      "A": "Assign users only the minimum permission level (e.g., CAN RUN or CAN VIEW) required for their role on each job.",
      "B": "Use only folder-level permissions and avoid setting permissions on individual jobs.",
      "C": "Grant CAN RUN permission to everyone and CAN MANAGE to a single admin group.",
      "D": "Grant all users CAN MANAGE permission on all jobs to avoid access issues."
    },
    "answer": "A",
    "question_vi": "Muốn áp dụng nguyên tắc ít quyền nhất khi cấu hình ACL cho Databricks jobs trong workspace chung, nên làm gì?",
    "options_vi": {
      "A": "Chỉ gán mức quyền tối thiểu cần thiết (CAN RUN hoặc CAN VIEW) theo vai trò cho từng job.",
      "B": "Chỉ dùng quyền ở cấp folder, tránh đặt quyền trên từng job.",
      "C": "Cấp CAN RUN cho tất cả và CAN MANAGE cho một nhóm admin duy nhất.",
      "D": "Cấp CAN MANAGE cho mọi người để tránh lỗi truy cập."
    },
    "explanation_vi": "Chọn A: cấp đúng tối thiểu trên từng job để bám sát nguyên tắc least privilege.",
    "page": null,
    "image": "img/q_258.jpg"
  },
  {
    "id": 259,
    "topic": 1,
    "question": "A data engineering workspace was automatically enabled for Unity Catalog, creating a workspace catalog. New team members report they can\ncreate tables in the default schema but cannot access table in other schemas within the same workspace catalog.\nWhy are the new team members unable to access tables in other schemas?",
    "options": {
      "A": "Workspace catalog permissions are not subject to inheritance rules.",
      "B": "Workspace users receive USE CATALOG and specific privileges on default schema only.",
      "C": "Tables in other schemas require additional BROWSE privileges that new users don’t receive automatically",
      "D": "New users only receive CREATE TABLE privileges on the default schema."
    },
    "answer": "B",
    "question_vi": "Workspace được tự động bật Unity Catalog tạo workspace catalog. Thành viên mới tạo được bảng ở default schema nhưng không vào được schema khác, vì sao?",
    "options_vi": {
      "A": "Quyền trên workspace catalog không kế thừa.",
      "B": "Người dùng mặc định chỉ được USE CATALOG và một số quyền trên default schema.",
      "C": "Bảng ở schema khác cần quyền BROWSE bổ sung mà user mới không có.",
      "D": "Người mới chỉ nhận CREATE TABLE trên default schema."
    },
    "explanation_vi": "Chọn B: bật tự động chỉ cấp USE CATALOG và quyền tối thiểu cho default schema, các schema khác cần cấp thêm.",
    "page": null,
    "image": "img/q_259.jpg"
  },
  {
    "id": 260,
    "topic": 1,
    "question": "A data engineer is implementing a job to download multiple PDF files from a third-party provided REST API endpoint by specifying different report\ntypes. The REST API is time-consuming and encounters intermittent errors, so the engineer wants to track each download activity to know when it\nfails and to retry partially, while providing scalable throughput. The engineer needs to download ten report types, and the list can be changed over\ntime.\nHow should the data engineer achieve this?",
    "options": {
      "A": "Use a foreach task with a list of report types as its inputs.",
      "B": "Define ten Notebook tasks to clearly track which report download failed.",
      "C": "Use a Delta Lake table to track each report download status as 10 rows, and use it as a source table to execute the download function as a\nPandas UDF.",
      "D": "Define a list variable within a Notebook to loop through the report types to download them, and print the download results. Execute it as a\nNotebook tasks."
    },
    "answer": "A",
    "question_vi": "Job tải nhiều file PDF từ REST API chậm và hay lỗi; có 10 loại báo cáo, danh sách có thể đổi. Cần theo dõi từng lượt tải để retry từng phần và mở rộng throughput.",
    "options_vi": {
      "A": "Dùng foreach task với danh sách report type làm input.",
      "B": "Tạo 10 task Notebook riêng để biết report nào lỗi.",
      "C": "Dùng bảng Delta lưu trạng thái 10 lượt tải và gọi hàm tải qua Pandas UDF.",
      "D": "Viết biến list trong Notebook rồi loop tải, in kết quả và chạy Notebook task."
    },
    "explanation_vi": "Chọn A: foreach task giúp chạy song song theo danh sách report type, theo dõi và retry từng mục.",
    "page": null,
    "image": "img/q_260.jpg"
  },
  {
    "id": 261,
    "topic": 1,
    "question": "A data engineer and a platform engineer are working together to automate their system tasks. A script needs to be executed outside of Databricks\nonly if a particular daily Databricks job finishes successfully for the day. Databricks CLI command was used to check the last execution of the job.\nWhat are the required command options for that task?",
    "options": {
      "A": "databricks jobs list-runs --job-id JOB_ID --start-time-to TODAY_MIDNIGHT_EPOCH_MS --completed-only",
      "B": "databricks jobs list-runs --job-id JOB_ID --start-time-from TODAY_MIDNIGHT_EPOCH_MS --active-only",
      "C": "databricks jobs list-runs --job-id JOB_ID --start-time-to TODAY_MIDNIGHT_EPOCH_MS --active-only",
      "D": "databricks jobs list-runs --job-id JOB_ID --start-time-from TODAY_MIDNIGHT_EPOCH_MS --completed-only"
    },
    "answer": "D",
    "question_vi": "Cần chạy script ngoài Databricks chỉ khi job hằng ngày hoàn tất; dùng databricks CLI để kiểm tra lần chạy cuối của job trong ngày.",
    "options_vi": {
      "A": "databricks jobs list-runs --job-id JOB_ID --start-time-to TODAY_MIDNIGHT_EPOCH_MS --completed-only",
      "B": "databricks jobs list-runs --job-id JOB_ID --start-time-from TODAY_MIDNIGHT_EPOCH_MS --active-only",
      "C": "databricks jobs list-runs --job-id JOB_ID --start-time-to TODAY_MIDNIGHT_EPOCH_MS --active-only",
      "D": "databricks jobs list-runs --job-id JOB_ID --start-time-from TODAY_MIDNIGHT_EPOCH_MS --completed-only"
    },
    "explanation_vi": "Chọn D: lọc run bắt đầu từ 0h hôm nay và chỉ lấy trạng thái hoàn thành để biết job trong ngày đã thành công.",
    "page": null,
    "image": "img/q_261.jpg"
  },
  {
    "id": 262,
    "topic": 1,
    "question": "A data engineering team needs to create a SQL Alert that monitors data quality across multiple columns in their customer table. They want to\ntrigger an alert when both the percentage of customers with missing email addresses exceeds 15% AND the percentage of customers with invalid\nphone number formats exceeds 10%.\nWhich SQL query pattern is appropriate for implementing this multi-column alert condition?",
    "options": {
      "A": "SELECT COUNT (*) FROM customers WHERE email IS NULL OR phone_format_invalid = true",
      "B": "SELECT email, phone FROM customers WHERE email IS NULL AND phone NOT RLIKE ‘ˆ[0-9-+()\\\\s]+$’",
      "C": "SELECT email_null_pct, phone_invalid_pct FROM (SELECT (COUNT(CASE WHEN email IS NULL THEN 1 END) *\n100.0/COUNT (*)) as email_null_pct, (COUNT(CASE WHEN phone NOT RLIKE ‘ˆ[0-9-+()\\\\s]+$’ THEN 1 END)*\n100.0/COUNT (*)) as phone_invalid_pct FROM customers)",
      "D": "SELECT CASE WHEN email_null_pct >15 AND phone_invalid_pct> 10 THEN 1 ELSE 0 END FROM (SELECT (COUNT (CASE WHEN email IS\nNULL THEN 1 END) * 100.0 / COUNT (*)) as phone_invalid_pct FROM customers) metrics"
    },
    "answer": "C",
    "question_vi": "Muốn tạo SQL Alert kiểm tra đồng thời %% email null > 15% và %% phone sai định dạng >10%. Mẫu truy vấn nào phù hợp?",
    "options_vi": {
      "A": "SELECT COUNT(*) ... WHERE email IS NULL OR phone_format_invalid = true",
      "B": "SELECT email, phone ... WHERE email IS NULL AND phone NOT RLIKE '^[0-9-+()\\s]+$'",
      "C": "SELECT email_null_pct, phone_invalid_pct FROM (SELECT (COUNT(CASE WHEN email IS NULL THEN 1 END)*100.0/COUNT(*)) AS email_null_pct, (COUNT(CASE WHEN phone NOT RLIKE '^[0-9-+()\\s]+$' THEN 1 END)*100.0/COUNT(*)) AS phone_invalid_pct FROM customers)",
      "D": "SELECT CASE WHEN email_null_pct>15 AND phone_invalid_pct>10 THEN 1 ELSE 0 END FROM (SELECT (COUNT(CASE WHEN email IS NULL THEN 1 END)*100.0/COUNT(*)) AS phone_invalid_pct FROM customers) metrics"
    },
    "explanation_vi": "Chọn C: tính hai tỷ lệ trong subquery rồi dùng alert logic trên kết quả để kiểm tra đồng thời.",
    "page": null,
    "image": "img/q_262.jpg"
  },
  {
    "id": 263,
    "topic": 1,
    "question": "A data engineer is brining an existing production Databricks job under asset bundle management and wants to ensure that:\n• The job’s current configuration is captured as YAML, and all referenced files are included in their bundle project.\n• Future changes to the bundle’s YAML will update the existing job in-place (not create a new job)\nHow should the data engineer successfully move the production job under asset bundle management?",
    "options": {
      "A": "Run Databricks bundle generate job --existing-job-id to generate the YAML and download referenced files. Then, run Databricks bundle\ndeploy to deploy the bundle, which will always update the existing job automatically.",
      "B": "Export the job definition as JSON, convert it to YAML, and place it in your bundle. Then, run Databricks bundle deploy to update the existing\njob.",
      "C": "Manually create the YAML configuration for the job in your bundle project, ensuring all settings match the existing job. Then, run Databricks\nbundle deploy the bundle, which will update the existing job in your workspace.",
      "D": "Run databricks bundle generate job --existing-job-id to generate the YAML and download referenced files. Then, run Databricks bundle\ndeployment, bind to link the bundle’s job resource to the existing job in Databricks."
    },
    "answer": "D",
    "question_vi": "Muốn đưa job production hiện có vào quản lý bằng Asset Bundle, giữ cấu hình YAML và cập nhật in-place khi YAML đổi.",
    "options_vi": {
      "A": "Chạy databricks bundle generate job --existing-job-id rồi deploy, luôn tự cập nhật job cũ.",
      "B": "Xuất JSON job, đổi sang YAML, đặt vào bundle rồi deploy để cập nhật job.",
      "C": "Tự viết YAML khớp job hiện tại trong bundle rồi deploy để cập nhật job trong workspace.",
      "D": "Chạy databricks bundle generate job --existing-job-id để tạo YAML và tải file tham chiếu, sau đó chạy databricks bundle deployment bind để liên kết resource của bundle với job hiện có."
    },
    "explanation_vi": "Chọn D: generate để lấy YAML, sau đó dùng bind để gắn resource bundle với job hiện hữu, cập nhật in-place.",
    "page": null,
    "image": "img/q_263.jpg"
  },
  {
    "id": 264,
    "topic": 1,
    "question": "A data architect is implementing Delta Sharing as part of their data governance strategy to enable secure data collaboration with external partners\nand internal business units. The architect must establish a permission framework that allows designated data stewards to create shares for their\nrespective domains while maintaining security boundaries and audit compliance.\nWhich specific permissions and roles must be assigned to enable users to create, configure, and manage Delta Shares while maintaining proper\nsecurity governance and access controls?",
    "options": {
      "A": "Only workspace admins can create and manage shares",
      "B": "Users need the MANAGE SHARES permission on the workspace",
      "C": "Users need to be metastore admins or have CREATE SHARE privilege for the metastore",
      "D": "Any user with USE_CATALOG privilege can create shares"
    },
    "answer": "C",
    "question_vi": "Thiết lập Delta Sharing: cần quyền nào để data steward tạo và quản lý share đúng quản trị?",
    "options_vi": {
      "A": "Chỉ workspace admin mới tạo/quản lý share.",
      "B": "User cần quyền MANAGE SHARES ở workspace.",
      "C": "Phải là metastore admin hoặc được cấp CREATE SHARE trên metastore.",
      "D": "Bất kỳ user có USE_CATALOG đều tạo được share."
    },
    "explanation_vi": "Chọn C: chỉ metastore admin hoặc người có CREATE SHARE mới tạo/cấu hình share đúng chuẩn bảo mật.",
    "page": null,
    "image": "img/q_264.jpg"
  },
  {
    "id": 265,
    "topic": 1,
    "question": "A data engineer manages a production Lakeflow Spark Declarative Pipeline that processes customer transaction data. The pipeline includes\nseveral data quality expectations, such as: transaction_amount > 0 and customer_id IS NOT NULL.\nThese expectations are defined using the EXPECT clause in SQL. The engineer aims to monitor the pipeline’s data quality by analyzing the number\nof records that passed or failed each expectation during the latest pipeline update. The Lakeflow Spark Declarative Pipelines event logs are stored\nin a Delta table named event_log_table.\nFor the most recent pipeline update, determine a programmatically approach to extract information like the name of each expectation, associated\ndataset, count of records that passed the expectation, and count of records that failed the expectation.\nWhich method retrieves the desired data quality metrics from the Lakeflow Spark Declarative Pipelines event log?",
    "options": {
      "A": "Access the event_log_table, filter for events where event_type = ‘flow progress’, and parse the\ndetails.flow_progress.data_quality.expectations field to extract the required metrics.",
      "B": "Use the Lakeflow Spark Declarative Pipelines UI to navigate to the specific pipeline, select the dataset, and view the Data Quality tab to\nmanually retrieve the expectation metrics.",
      "C": "Query the event_log_table for events with event_type = ‘data_quality’ and directly select the passed_records and failed_records fields.",
      "D": "Access the event_log_table, filter for events where event_type = ‘expectatation_result’, and extract the expectation metrics from the details\nfield."
    },
    "answer": "A",
    "question_vi": "Pipeline Lakeflow Spark Declarative có EXPECT; muốn lấy tên expectation, dataset, số bản ghi pass/fail trong lần chạy gần nhất từ event_log_table.",
    "options_vi": {
      "A": "Đọc event_log_table, lọc event_type='flow progress' và parse trường details.flow_progress.data_quality.expectations để lấy số liệu.",
      "B": "Xem thủ công trong UI Data Quality tab của pipeline.",
      "C": "Query event_log_table với event_type='data_quality' và lấy trực tiếp passed_records, failed_records.",
      "D": "Lọc event_type='expectatation_result' và lấy metric trong details."
    },
    "explanation_vi": "Chọn A: expectation metric nằm trong event flow progress, cần parse trường data_quality.expectations.",
    "page": null,
    "image": "img/q_265.jpg"
  },
  {
    "id": 266,
    "topic": 1,
    "question": "Predictive Optimization is an automated Databricks service enabled by default for Unity Catalog Managed tables. It helps maintain Delta tables by\ncontinuously optimizing them to ensure optimal performance and costs.\nWhich two operations does Predictive Optimization run to maintain the Delta tables? (Choose two.)",
    "options": {
      "A": "PARTITION BY",
      "B": "COMPACT",
      "C": "ANALYZE",
      "D": "OPTIMIZE",
      "E": "BUCKETING"
    },
    "answer": "C",
    "question_vi": "Predictive Optimization (bật mặc định cho bảng UC Managed) tự động tối ưu Delta. Hai thao tác nào được chạy? (Chọn hai)",
    "options_vi": {
      "A": "PARTITION BY",
      "B": "COMPACT",
      "C": "ANALYZE",
      "D": "OPTIMIZE",
      "E": "BUCKETING"
    },
    "explanation_vi": "PO thực hiện ANALYZE để thu thống kê và OPTIMIZE/COMPACT file; đáp án mong đợi là C và D (tối ưu + thu thống kê).",
    "page": null,
    "image": "img/q_266.jpg"
  },
  {
    "id": 267,
    "topic": 1,
    "question": "A data engineer is building a customer data pipeline in Lakeflow Spark Declarative Pipelines. The source is a cloud-based event stream with\nlimited retention containing inserts, updates, and deletes for customer records. These changes are being applied using the AUTO CDC INTO\nsyntax to maintain an SCD Type 1 table as the target table, customer_dim.\nHow should the data engineer build a downstream job that streams from the customer_dim table to only act on updates and delete events,\nprocessing data incrementally?",
    "options": {
      "A": "Use ignoreChanges flag while streaming from customer_dim to avoid breaking the pipeline during updates and deletes.",
      "B": "Read change data feed from customer_dim table and apply filters to incrementally act on the change events.",
      "C": "Streaming from customer_dim table would only be possible in the case of SCD 2 retention.",
      "D": "When stored as SCD 1, the target of AUTO CDC INTO includes updates and deletes. Streaming from customer_dim can fail due to these\noperations. Instead, build another stream from the original source."
    },
    "answer": "B",
    "question_vi": "AUTO CDC INTO duy trì bảng SCD1 customer_dim; cần job downstream chỉ xử lý update/delete và chạy gia tăng.",
    "options_vi": {
      "A": "Dùng ignoreChanges khi stream từ customer_dim để tránh lỗi khi cập nhật/xóa.",
      "B": "Đọc Change Data Feed của customer_dim và lọc các sự kiện để xử lý gia tăng.",
      "C": "Chỉ streaming được nếu lưu dưới dạng SCD2.",
      "D": "Streaming từ customer_dim SCD1 dễ lỗi, nên stream lại từ nguồn gốc."
    },
    "explanation_vi": "Chọn B: dùng CDF từ bảng đích để lấy đúng sự kiện cập nhật/xóa và xử lý incremental.",
    "page": null,
    "image": "img/q_267.jpg"
  },
  {
    "id": 268,
    "topic": 1,
    "question": "A data engineer is designing a system leveraging Lakeflow Declarative Pipeline technology to process real-time truck telemetry data ingested from\nJSON files in S3 using Auto Loader. The data includes truck_id, timestamp, location, speed, and fuel_level. The system must support two use\ncases:\n1. Near-real-time monitoring of the latest location, speed, and fuel_level per truck_id for the operations team.\n2. Daily aggregated reports of total distance traveled and average fuel efficiency per truck_id for the management team.\nWhich approach should the data engineer use for streaming tables and materialized views in the Lakeflow Declarative Pipeline to meet these\nrequirements?",
    "options": {
      "A": "Define a streaming table to ingest and store the raw telemetry data, and create a streaming table to compute the daily aggregated distance\nand fuel efficiency per truck_id reporting. Create a materialized view to compute the latest location, speed, and fuel_level per truck_id for real-\ntime monitoring.",
      "B": "Define a streaming table to ingest and store the raw telemetry data, and create a materialized view to compute the latest location, speed,\nand fuel_level per truck_id for real-time monitoring. Create another materialized view to compute the daily aggregated distance and fuel\nefficiency per truck_id for reporting.",
      "C": "Define a streaming table to ingest and store the raw telemetry data, and create a streaming table to incrementally compute the latest\nlocation, speed, and fuel_level per truck_id for real-time monitoring. Create a materialized view to compute the daily aggregated distance and\nfuel efficiency per truck_id for reporting.",
      "D": "Define a materialized view to ingest and store the raw telemetry data, and create a streaming table to compute the latest location, speed,\nand fuel_level per truck_id for real-time monitoring. Create another materialized view to compute the daily aggregated distance and fuel\nefficiency per truck_id for reporting."
    },
    "answer": "C",
    "question_vi": "Thiết kế Lakeflow Declarative Pipeline cho telemetry xe tải: cần real-time trạng thái mới nhất và báo cáo tổng hợp hàng ngày.",
    "options_vi": {
      "A": "Streaming table cho raw, streaming table tính tổng hợp ngày; materialized view lấy trạng thái mới nhất.",
      "B": "Streaming table cho raw, materialized view cho trạng thái mới nhất, thêm materialized view cho tổng hợp ngày.",
      "C": "Streaming table cho raw, streaming table tính trạng thái mới nhất theo truck_id; materialized view tính tổng hợp ngày.",
      "D": "Materialized view cho raw, streaming table cho trạng thái mới nhất, materialized view cho tổng hợp ngày."
    },
    "explanation_vi": "Chọn C: stream raw và duy trì streaming table trạng thái hiện tại, dùng materialized view cho báo cáo ngày.",
    "page": null,
    "image": "img/q_268.jpg"
  },
  {
    "id": 269,
    "topic": 1,
    "question": "A platform team lead is responsible for automating the individual teams attribution towards SQL Warehouse usage. The requirement is to identify\nthe SQL warehouse usage at the individual user’s level and generate a daily report to be shared with an executive team that includes leaders from\nall business units.\nHow should the platform lead generate an automated report that can be shared daily?",
    "options": {
      "A": "Use the system tables to capture the audit and billing usage data and share the queries with the executive team. This enables the\nexecutives to execute the query and see the latest results any time.",
      "B": "Use the system tables to capture the audit and billing usage data and create a dashboard with daily refresh schedules and shared with the\nexecutive team.",
      "C": "Restrict users from running any SQL query unless they provide all the query details so that the attribution can be calculated and shared with\nthe executive team.",
      "D": "Let the users run the SQL query and then directly report the usage to the executives. The ownership of the SQL warehouse usage will be\nwith the individual teams."
    },
    "answer": "B",
    "question_vi": "Platform lead cần tự động báo cáo attribution SQL Warehouse theo user, gửi hàng ngày cho lãnh đạo.",
    "options_vi": {
      "A": "Dùng system tables lấy audit/billing rồi chia sẻ truy vấn cho lãnh đạo tự chạy.",
      "B": "Dùng system tables, tạo dashboard và lên lịch refresh hàng ngày rồi share cho lãnh đạo.",
      "C": "Cấm user chạy SQL trừ khi cung cấp đủ chi tiết để tính attribution.",
      "D": "Để từng team tự báo cáo usage lên lãnh đạo."
    },
    "explanation_vi": "Chọn B: dựng dashboard từ system tables và lên lịch cập nhật, chia sẻ hàng ngày.",
    "page": null,
    "image": "img/q_269.jpg"
  },
  {
    "id": 270,
    "topic": 1,
    "question": "A data engineering team is collaborating on a Databricks project where each team member needs to develop and test code independently before\nmerging changes into the main branch.\nThey want to avoid accidental overwrites or branch switching issues while ensuring that all work is version- controlled and can be integrated into\ntheir CI/CD pipeline.\nHow should the data engineer achieve collaboration?",
    "options": {
      "A": "Each team member creates their own Databricks Git folder, mapped to the same remote Git repository, and works in their own development\nbranch within their personal folder.",
      "B": "All team members work in the same Databricks Git folder and perform Git operations (pull, push, commit, branch switching) directly in that\nshared folder.",
      "C": "Team members edit notebooks directly in the workspace’s shared folder and periodically copy changes into a Git folder for version control.",
      "D": "Team members use the Databricks CLI to clone the Git repository and perform Git operations from a cluster’s web terminal."
    },
    "answer": "A",
    "question_vi": "Team cùng phát triển Databricks project, mỗi người cần nhánh riêng, tránh ghi đè và vẫn tích hợp CI/CD.",
    "options_vi": {
      "A": "Mỗi người tạo Databricks Git folder riêng trỏ cùng repo, làm việc trên nhánh dev riêng trong folder cá nhân.",
      "B": "Tất cả làm trong một Git folder chung và thao tác Git trực tiếp ở đó.",
      "C": "Chỉnh notebook trong shared folder rồi thỉnh thoảng copy vào Git folder để version control.",
      "D": "Dùng Databricks CLI clone repo và thao tác Git từ web terminal của cluster."
    },
    "explanation_vi": "Chọn A: mỗi người có workspace git folder riêng gắn nhánh riêng, tránh đè lẫn nhau và vẫn version-control.",
    "page": null,
    "image": "img/q_270.jpg"
  },
  {
    "id": 271,
    "topic": 1,
    "question": "A data engineer is using the AUTO CDC API in Lakeflow Spark Declarative Pipeline to propagate deletions from a source table (orders_source) to a\ntarget table (orders_target). The source has Change Data Feed (CDF) enabled, but some delete events arrive out of order due to upstream delays.\nHow does the AUTO CDC API internally ensure deletions are applied correctly despite out-of-order events?",
    "options": {
      "A": "It ignores deletions if they arrive after updates for the same key.",
      "B": "It manually sorts incoming events by timestamp before applying changes.",
      "C": "It runs VACUUM on the target table to purge conflicting records.",
      "D": "It uses sequence_by to order events and retains tombstones for deleted rows until older sequences are processed."
    },
    "answer": "D",
    "question_vi": "AUTO CDC API truyền xóa từ nguồn CDF sang bảng đích; sự kiện delete có thể đến lệch thứ tự. Cơ chế nào đảm bảo xóa đúng?",
    "options_vi": {
      "A": "Bỏ qua delete nếu đến sau update cùng key.",
      "B": "Tự sắp xếp sự kiện theo timestamp trước khi áp dụng.",
      "C": "Chạy VACUUM trên bảng đích để xóa bản ghi xung đột.",
      "D": "Dùng sequence_by để sắp xếp sự kiện và giữ tombstone cho bản ghi xóa cho tới khi các sequence cũ được xử lý."
    },
    "explanation_vi": "Chọn D: sequence_by đảm bảo áp dụng đúng thứ tự và giữ tombstone tới khi mọi sự kiện cũ qua.",
    "page": null,
    "image": "img/q_271.jpg"
  },
  {
    "id": 272,
    "topic": 1,
    "question": "A data governance team at a large enterprise is improving data discoverability across its organization. The team has hundreds of tables in their\nDatabricks Lakehouse with thousands of columns that lack proper documentation. Many of these tables were created by different teams over\nseveral years, with missing context about column meanings and business logic. The data governance team needs to quickly generate\ncomprehensive column descriptions for all existing tables to meet compliance requirements and improve data literacy across the organization.\nThey want to leverage modern capabilities to automatically generate meaningful descriptions rather than manually documenting each column,\nwhich would take months to complete. The team is looking for a solution that can understand data patterns, column names, and sample values to\ncreate intelligent descriptions.\nWhich approach should the team use in Databricks to automatically generate column comments and descriptions for existing tables?",
    "options": {
      "A": "Write custom PySpark code using df.describe () and df.schema to programmatically generate basic statistical descriptions for each\ncolumn.",
      "B": "Navigate to the table in Databricks Catalog Explorer, select the table schema view, and use the “AI Generate” option which leverages\nartificial intelligence to automatically create meaningful column descriptions based on column names, data types, sample values, and data\npatterns.",
      "C": "Use the DESCRIBE TABLE command to extract existing schema information and manually write descriptions based on column names and\ndata types.",
      "D": "Use Delta Lake’s DESCRIBE HISTORY command to analyze table evolution and infer column purposes from historical changes."
    },
    "answer": "B",
    "question_vi": "Team quản trị muốn tự động sinh mô tả cột cho hàng trăm bảng thiếu tài liệu, cần giải pháp nhanh.",
    "options_vi": {
      "A": "Viết PySpark df.describe và df.schema để sinh mô tả thống kê cơ bản.",
      "B": "Vào Catalog Explorer, mở schema bảng và dùng 'AI Generate' để tự tạo mô tả cột dựa trên tên, kiểu, mẫu giá trị và pattern.",
      "C": "Dùng DESCRIBE TABLE lấy schema rồi tự viết mô tả thủ công.",
      "D": "Dùng DESCRIBE HISTORY để suy ra mục đích cột từ lịch sử."
    },
    "explanation_vi": "Chọn B: Catalog Explorer có AI Generate tự sinh comment cột từ ngữ cảnh dữ liệu.",
    "page": null,
    "image": "img/q_272.jpg"
  },
  {
    "id": 273,
    "topic": 1,
    "question": "A company processes semi-structured JSON files from an external source using Auto Loader in a classic Databricks job. Occasionally, records\narrive with null critical fields, invalid types, or unexpected nested schema variations. The engineer must ensure that malformed or non-conforming\nrecords are not dropped silently and are captured in a separate quarantine table. The pipeline should continue processing good records into the\nBronze layer without failing the job, and the approach must support both batch and streaming ingestion.\nThe data engineer needs to build a robust ingestion pattern that automatically routes bad records to a quarantine Delta table, while still ingesting\ngood records into the Bronze layer for further processing.\nWhich approach fulfills the quarantine mechanism in this ingestion architecture?",
    "options": {
      "A": "Create a notebook job with inferSchema= True, write a streaming query with .foreachBatch() and catch exceptions using try/except to\nredirect failed batches to quarantine.",
      "B": "Use Auto Loader with failFast mode to set to false, and enable schema evolution; invalid records will be silently ignored during ingestion.",
      "C": "Use Lakeflow Spark Declarative Pipelines with a SQL pipeline; configure it to drop rows with nulls using where critical_fields is not null, and\nrely on audit logs for malformed data.",
      "D": "Use Auto Loader with LDP and implement an EXPECT () constraint with a record audit logic to route bad records."
    },
    "answer": "D",
    "question_vi": "Ingest JSON bằng Auto Loader; cần bắt lỗi bản ghi xấu vào bảng quarantine, vẫn nạp bản ghi tốt cho Bronze, hỗ trợ batch & streaming.",
    "options_vi": {
      "A": "Viết notebook inferSchema=True, dùng foreachBatch và try/except chuyển batch lỗi vào quarantine.",
      "B": "Dùng Auto Loader failFast=false và bật schema evolution; bản ghi lỗi sẽ bị bỏ qua.",
      "C": "Dùng Lakeflow SQL pipeline, lọc bỏ null và dựa vào audit log cho bản ghi lỗi.",
      "D": "Dùng Auto Loader với LDP và khai báo EXPECT() kèm logic audit để chuyển bản ghi xấu sang quarantine."
    },
    "explanation_vi": "Chọn D: EXPECT trong LDP cho phép định tuyến bản ghi không đạt chuẩn sang bảng quarantine tự động.",
    "page": null,
    "image": "img/q_273.jpg"
  },
  {
    "id": 274,
    "topic": 1,
    "question": "A data engineer is analyzing transactional data in a PySpark DataFrame df containing customer_id, transaction_timestamp (precise to\nmilliseconds), and amount_spent. The objective is to compute a cumulative sum of amount_spent per customer, strictly ordered by\ntransaction_timestamp. The cumulative sum must include all transactions from the earliest timestamp up to and including the current row,\nrespecting temporal ordering within each customer partition.\nWhich PySpark code snippet most accurately constructs the appropriate window specification and applies the aggregation to yield the correct\ncumulative expenditure per customer?",
    "options": {
      "A": "",
      "B": "",
      "C": "",
      "D": ""
    },
    "answer": "C",
    "question_vi": "Cần tính lũy kế amount_spent theo khách hàng, sắp xếp đúng theo transaction_timestamp (ms) trong PySpark.",
    "options_vi": {
      "A": "",
      "B": "",
      "C": "",
      "D": ""
    },
    "explanation_vi": "Chọn C: window = Window.partitionBy('customer_id').orderBy('transaction_timestamp').rowsBetween(Window.unboundedPreceding, Window.currentRow); rồi F.sum('amount_spent').over(window).",
    "page": null,
    "image": "img/q_274.jpg"
  },
  {
    "id": 275,
    "topic": 1,
    "question": "A data team is implementing an append-only Delta Lake pipeline that needs to handle both and streaming data. They want to ensure that schema\nchanges in the source data can be automatically incorporated without breaking the pipeline.\nWhich configuration should the team use when writing data to the Delta table?",
    "options": {
      "A": "ignoreChanges = false",
      "B": "validateSchema= false",
      "C": "overwriteSchema=true",
      "D": "mergeSchema=true"
    },
    "answer": "D",
    "question_vi": "Pipeline Delta append-only cần tự động nhận thay đổi schema nguồn mà không vỡ pipeline.",
    "options_vi": {
      "A": "ignoreChanges = false",
      "B": "validateSchema = false",
      "C": "overwriteSchema = true",
      "D": "mergeSchema = true"
    },
    "explanation_vi": "Chọn D: mergeSchema cho phép Delta tự hợp nhất cột mới khi ghi, phù hợp append-only.",
    "page": null,
    "image": "img/q_275.jpg"
  },
  {
    "id": 276,
    "topic": 1,
    "question": "A senior data engineer is planning large-scale data workflows. The current task is to identify the considerations that form a foundation for\ncreating scalable data models that are essential for effective management of large datsets. The data engineering team has identified the core\ncapabilities as part of a scalable data model to build a modern data platform and provided their reasoning for considering Delta Lake for review.\nThe senior data engineer is responsible for identifying the recommendations that are not valid.\nWhich key features can be ignored while evaluating Delta Lake?",
    "options": {
      "A": "Delta Lake works with various data formats (e.g., Parquet, JSON, CSV) and integrates well with Spark and Databricks tools:",
      "B": "Delta Lake optimizes metadata handling, efficiently managing billions of files and facilitating scalability to petabyte-scale datasets.",
      "C": "Delta Lake’s capability to process data in both batch and streaming modes seamlessly, providing flexibility in data ingestion and\nprocessing.",
      "D": "Delta Lake provides limited support for monitoring and troubleshooting data pipelines, so relevant partner tools have to be identified and\nset up for enhanced operational efficiency."
    },
    "answer": "D",
    "question_vi": "Khi đánh giá Delta Lake cho mô hình dữ liệu lớn, đặc tính nào có thể bỏ qua (không phải lợi thế thực)?",
    "options_vi": {
      "A": "Hỗ trợ nhiều định dạng và tích hợp tốt với Spark/Databricks.",
      "B": "Tối ưu metadata, quản lý hàng tỷ file và mở rộng tới petabyte.",
      "C": "Xử lý linh hoạt batch và streaming.",
      "D": "Hỗ trợ giám sát/khắc phục hạn chế nên phải cần thêm tool đối tác."
    },
    "explanation_vi": "Chọn D: Delta đã có công cụ giám sát/khắc phục, nên nhận định 'hỗ trợ hạn chế' không phải lợi thế, có thể bỏ qua.",
    "page": null,
    "image": "img/q_276.jpg"
  },
  {
    "id": 277,
    "topic": 1,
    "question": "A data engineering team is implementing an append-only data pipeline using Delta Lake, and wants to ensure that data is never modified or\ndeleted once written.\nWhich Delta Lake feature should the data engineer enable to prevent modifications to existing data?",
    "options": {
      "A": "Delta APPEND_ONLY",
      "B": "Delta VACUUM",
      "C": "Delta OPTIMIZE",
      "D": "Delta Time Travel"
    },
    "answer": "A",
    "question_vi": "Pipeline append-only cần đảm bảo dữ liệu không bị sửa/xóa sau khi ghi.",
    "options_vi": {
      "A": "Delta APPEND_ONLY",
      "B": "Delta VACUUM",
      "C": "Delta OPTIMIZE",
      "D": "Delta Time Travel"
    },
    "explanation_vi": "Chọn A: bật thuộc tính APPEND_ONLY để chặn update/delete trên bảng Delta.",
    "page": null,
    "image": "img/q_277.jpg"
  },
  {
    "id": 278,
    "topic": 1,
    "question": "A data engineering team is setting up a Git project to automate integration tests using Databricks Asset Bundles and the Git provider’s CI/CD\nfunctionalities. When a pull containing changes to their pipleline is sent, they need to run a Job to test their data pipeline.\nWhat is the correct databricks bundle command sequence to be executed from the Git provider’s CI/CD automation for this task?",
    "options": {
      "A": "init, deploy, run, validate",
      "B": "validate, deploy, run",
      "C": "init, validate, deploy, run",
      "D": "deploy, run, validate"
    },
    "answer": "B",
    "question_vi": "Thiết lập CI/CD Git với Databricks Asset Bundles để chạy job test khi có pull request.",
    "options_vi": {
      "A": "init, deploy, run, validate",
      "B": "validate, deploy, run",
      "C": "init, validate, deploy, run",
      "D": "deploy, run, validate"
    },
    "explanation_vi": "Chọn B: validate bundle, deploy lên workspace, sau đó run job kiểm thử.",
    "page": null,
    "image": "img/q_278.jpg"
  },
  {
    "id": 279,
    "topic": 1,
    "question": "A data engineer is attempting to execute the following PySpark code:\ndf=spark.read.table(“sales”)\nresult=df.groupBy(“region”).agg(sum(“revenue”))\nHowever, upon inspecting the execution plan and profiling the Spark job, they observe excessive data shuffling during the aggregation phase.\nWhich technique should be applied to reduce shuffling during the groupBy aggregation operation?",
    "options": {
      "A": "Use.coalesce(1) after the aggregation",
      "B": "Caching the DataFrame df",
      "C": "Use broadcast join",
      "D": "Repartition by region before aggregation"
    },
    "answer": "D",
    "question_vi": "groupBy region gây shuffle lớn. Kỹ thuật nào giảm shuffle?",
    "options_vi": {
      "A": "Dùng coalesce(1) sau khi aggregate.",
      "B": "Cache DataFrame df.",
      "C": "Dùng broadcast join.",
      "D": "Repartition theo cột region trước khi groupBy."
    },
    "explanation_vi": "Chọn D: phân vùng theo key trước giúp giảm shuffle khi aggregate theo region.",
    "page": null,
    "image": "img/q_279.jpg"
  },
  {
    "id": 280,
    "topic": 1,
    "question": "While reviewing a query’s execution in the Deatricks Query Profile, a data engineer observes that the “Top operators” panel shows a sort operator\nwith high “Time spent” and “Memory peak” metrics, and the Spark UI reports frequent data spilling.\nHow should the data engineering address this issue?",
    "options": {
      "A": "Repartition the DataFrame to a single partition before sorting.",
      "B": "Convert the sort operation to a filter operation.",
      "C": "Switch to a broadcast join to reduce memory usage.",
      "D": "Increase the number of shuffle partitions to better distribute data."
    },
    "answer": "D",
    "question_vi": "Query profile cho thấy sort operator tốn thời gian và bộ nhớ, có spill. Xử lý thế nào?",
    "options_vi": {
      "A": "Repartition về 1 partition trước khi sort.",
      "B": "Đổi sort thành filter.",
      "C": "Dùng broadcast join để giảm bộ nhớ.",
      "D": "Tăng số shuffle partitions để phân phối dữ liệu tốt hơn khi sort."
    },
    "explanation_vi": "Chọn D: tăng số shuffle partitions để giảm kích thước mỗi partition, hạn chế spill khi sort.",
    "page": null,
    "image": "img/q_280.jpg"
  },
  {
    "id": 281,
    "topic": 1,
    "question": "A data engineer manages a Unity Catalog table customer_data in schema finance that includes sensitive fields like ssn and credit_score. Intern\nGroup should only see masked values, while Analyst Group should only access rows for their assigned region. The data engineer needs to restrict\naccess based on user role and region without duplicating data.\nHow should the data engineer enforce this security policy?",
    "options": {
      "A": "Use Unity Catalog’s row filters based on the region and column masks based on user roles.",
      "B": "Create views using current_user() and is_account_group_member() functions, and apply masking logic inside the SQL SELECT clause for\neach sensitive column.",
      "C": "Create dynamic views for each user role and manage access with ACLs.",
      "D": "Use Unity Catalog’s row filters based on the user roles and column masks based on the region."
    },
    "answer": "A",
    "question_vi": "Một kỹ sư dữ liệu quản lý bảng Unity Catalog customer_data trong schema finance chứa các trường nhạy cảm như ssn và credit_score. Nhóm Intern chỉ được thấy giá trị đã che (mask), còn nhóm Analyst chỉ được truy cập các dòng thuộc vùng được phân công. Cần hạn chế truy cập theo vai trò và vùng mà không nhân bản dữ liệu. Nên áp dụng cách nào?",
    "options_vi": {
      "A": "Dùng row filter của Unity Catalog theo vùng và column mask theo vai trò người dùng.",
      "B": "Tạo view với current_user() và is_account_group_member(), thực hiện mask trong câu lệnh SELECT của từng cột nhạy cảm.",
      "C": "Tạo các dynamic view riêng cho từng vai trò và quản lý quyền bằng ACL.",
      "D": "Dùng row filter theo vai trò và column mask theo vùng."
    },
    "explanation_vi": "Đáp án A. Row filter lọc theo vùng, column mask che giá trị theo vai trò nên đáp ứng đồng thời hai yêu cầu mà không cần nhân bản bảng.",
    "page": null,
    "image": "img/q_281.jpg"
  },
  {
    "id": 282,
    "topic": 1,
    "question": "A data engineer us ingesting JSON files from cloud object storage using Databricks Auto Loader. The source folder may occasionally receive large\nfiles of data, which risks overwhelming the stream. To ensure predictable micro-batch sizes, the team wants to throttle ingestion based on the\nvolume of data scanned at 1 GB, regardless of the number of files.\nWhich Auto Loader configuration should the data engineer used to achieve this?",
    "options": {
      "A": "Configure cloudFiles.maxBytesPerTrigger with 1 GB to place a limit.",
      "B": "Configure cloudFiles.maxSizePerTrigger with 1 GB to place a limit.",
      "C": "Configure cloudFiles.maxFilesPerTrigger and estimate the average file size to approximate a size-based throttle of 1 GB.",
      "D": "Configure cloudFiles.maxPartitionBytes with 1GB to limit data in each partition."
    },
    "answer": "A",
    "question_vi": "Một kỹ sư đang ingest file JSON bằng Databricks Auto Loader. Thư mục nguồn đôi khi nhận file lớn, có thể làm quá tải luồng. Nhóm muốn điều tiết (throttle) kích thước micro-batch ở mức 1 GB theo dung lượng quét, bất kể số file. Cần cấu hình gì?",
    "options_vi": {
      "A": "Đặt cloudFiles.maxBytesPerTrigger = 1 GB để giới hạn.",
      "B": "Đặt cloudFiles.maxSizePerTrigger = 1 GB để giới hạn.",
      "C": "Đặt cloudFiles.maxFilesPerTrigger và ước tính kích thước file để gần đúng 1 GB.",
      "D": "Đặt cloudFiles.maxPartitionBytes = 1 GB để giới hạn dữ liệu mỗi partition."
    },
    "explanation_vi": "Đáp án A. maxBytesPerTrigger giới hạn tổng byte quét mỗi trigger ở mức 1 GB, kiểm soát kích thước micro-batch theo dung lượng thay vì số file.",
    "page": null,
    "image": "img/q_282.jpg"
  },
  {
    "id": 283,
    "topic": 1,
    "question": "A data company uses Databricks Unity Catalog and has multiple enterprise data sources, including PostgreSQL, Snowflake, and SQL Server. The\ncentral data platform team wants to configure Lakehouse Federation so analysts can query external tables directly in Databricks using Databricks\nSQL, without duplicating data.\nWhich steps are necessary to configure Lakehouse Federation in a secure and governed manner?",
    "options": {
      "A": "Mirror the external datasets into Delta Lake using Auto Loader, and govern them using Data Lineage and System Tables.",
      "B": "Configure connections and foreign catalog in Unity Catalog, then grant access to foreign catalogs, schemas, and tables using Unity Catalog\npermissions.",
      "C": "Use Partner Connect to create linked datasets, and apply table ACLs at the source system to govern access through Databricks.",
      "D": "Create external locations and storage credentials to connect to each database, then register foreign tables in Unity Catalog."
    },
    "answer": "B",
    "question_vi": "Doanh nghiệp dùng Unity Catalog và nhiều nguồn dữ liệu (PostgreSQL, Snowflake, SQL Server). Muốn cấu hình Lakehouse Federation để analyst truy vấn bảng ngoài trực tiếp từ Databricks SQL mà không nhân bản dữ liệu, vẫn an toàn và được quản trị. Cần bước nào?",
    "options_vi": {
      "A": "Mirror dữ liệu vào Delta bằng Auto Loader rồi quản trị bằng Data Lineage và System Tables.",
      "B": "Cấu hình connections và foreign catalog trong Unity Catalog, rồi cấp quyền trên foreign catalog/schema/table qua UC.",
      "C": "Dùng Partner Connect tạo linked dataset, áp ACL ở nguồn.",
      "D": "Tạo external locations và storage credentials cho từng DB rồi đăng ký foreign table trong UC."
    },
    "explanation_vi": "Đáp án B. Lakehouse Federation yêu cầu thiết lập connection + foreign catalog và quản trị bằng quyền Unity Catalog trên catalog/schema/table liên kết.",
    "page": null,
    "image": "img/q_283.jpg"
  },
  {
    "id": 284,
    "topic": 1,
    "question": "Why are Pandas UDFs often preferred over traditional PySpark UDFs in performance-critical applications involving large datasets?",
    "options": {
      "A": "They minimize memory usage by streaming each row individually through a lightweight Python wrapper, avoiding batch processing\noverhead.",
      "B": "They leverage Apache Arrow to enable vectorized operations between the JVM and Python runtimes, reducing serialization costs and\nimproving computational efficiency.",
      "C": "They allow row-level execution of functions in Python with native Spark optimization, removing the need for columnar execution.",
      "D": "They eliminate the JVM-Python boundary by bypassing serialization entirely, thereby avoiding data conversion overhead."
    },
    "answer": "B",
    "question_vi": "Vì sao Pandas UDF thường được ưu tiên hơn PySpark UDF truyền thống trong bài toán hiệu năng lớn?",
    "options_vi": {
      "A": "Giảm dùng bộ nhớ bằng cách stream từng dòng qua wrapper Python nhẹ.",
      "B": "Tận dụng Apache Arrow cho vector hóa giữa JVM và Python, giảm chi phí serialize và tăng hiệu quả tính toán.",
      "C": "Cho phép thực thi cấp dòng với tối ưu Spark gốc, bỏ cần chạy dạng cột.",
      "D": "Bỏ qua hoàn toàn ranh giới JVM-Python nên không có chuyển đổi dữ liệu."
    },
    "explanation_vi": "Đáp án B. Pandas UDF dùng Arrow để truyền dữ liệu dạng cột vector hóa giữa JVM-Python, giảm serialize và tăng tốc rõ rệt.",
    "page": null,
    "image": "img/q_284.jpg"
  },
  {
    "id": 285,
    "topic": 1,
    "question": "A data engineer is setting up a pipeline to ingest data from a message bus system that occasionally delivers duplicate messages. The duplicate\nmessages can be a week apart. The target is a Databricks Delta Lake table where each record should appear exactly once.\nWhich Databricks ingestion pattern should be implemented to handle potential duplicates where events can arrive outside of the configured\nwatermark?",
    "options": {
      "A": "Use Delta Lake’s change data feed to filter duplicate records",
      "B": "Use Delta Lake time travel to identify and remove duplicates",
      "C": "Configure Structured Streaming with dropDuplicates transformation",
      "D": "Implement a write operation using MERGE INTO with a unique key"
    },
    "answer": "D",
    "question_vi": "Pipeline ingest từ message bus đôi lúc có bản ghi trùng lặp, có thể xuất hiện sau 1 tuần. Đích là bảng Delta Lake, mỗi bản ghi chỉ xuất hiện một lần. Mẫu xử lý nào đảm bảo loại bỏ trùng dù dữ liệu tới sau watermark?",
    "options_vi": {
      "A": "Dùng change data feed của Delta để lọc trùng.",
      "B": "Dùng time travel của Delta để tìm và xóa trùng.",
      "C": "Cấu hình Structured Streaming với dropDuplicates.",
      "D": "Dùng MERGE INTO với khóa duy nhất."
    },
    "explanation_vi": "Đáp án D. MERGE với khóa duy nhất xử lý idempotent kể cả sự kiện tới muộn vượt watermark, đảm bảo mỗi khóa chỉ còn một bản ghi.",
    "page": null,
    "image": "img/q_285.jpg"
  },
  {
    "id": 286,
    "topic": 1,
    "question": "A data engineer needs to design an efficient pipeline that automatically processes new CSV files as they arrive in S3 storage.\nWhich Databricks feature should the data engineer use to meet these requirements?",
    "options": {
      "A": "Streaming from cloud storage using standard Spark readStream with format (“csv”) and format (“json”)",
      "B": "COPY INTO SQL command with parameters to track processed files",
      "C": "Traditional batch processing with scheduled Databricks Jobs",
      "D": "Auto Loader with schema inference and evolution enabled"
    },
    "answer": "D",
    "question_vi": "Cần thiết kế pipeline tự động xử lý file CSV mới khi chúng xuất hiện trong S3. Nên dùng tính năng nào của Databricks?",
    "options_vi": {
      "A": "Structured Streaming readStream trực tiếp định dạng csv/json.",
      "B": "Lệnh SQL COPY INTO với tham số theo dõi file.",
      "C": "Batch truyền thống với Job theo lịch.",
      "D": "Auto Loader với suy diễn và tiến hóa schema."
    },
    "explanation_vi": "Đáp án D. Auto Loader phát hiện file mới, suy diễn/tiến hóa schema tự động cho pipeline ingest liên tục.",
    "page": null,
    "image": "img/q_286.jpg"
  },
  {
    "id": 287,
    "topic": 1,
    "question": "A data engineer is implementing liquid clustering on a Delta Lale table and needs to understand how it affects data management operations. The\ntable will be updated frequently with new data. The table is an external table and not managed by Unity Catalog.\nHow does liquid clustering in Delta Lake handle new data that is inserted after the initial table creation?",
    "options": {
      "A": "New data is rejected if it doesn’t match the clustering pattern.",
      "B": "New data is automatically clustered during write operations.",
      "C": "New data is written to a staging area and clustered during scheduled maintenance.",
      "D": "New data remains unclustered until the next OPTIMIZE operation."
    },
    "answer": "D",
    "question_vi": "Bảng Delta external (không do UC quản lý) được bật liquid clustering và thường xuyên thêm dữ liệu. Dữ liệu mới sẽ được xử lý thế nào?",
    "options_vi": {
      "A": "Từ chối dữ liệu mới nếu không khớp mẫu clustering.",
      "B": "Dữ liệu mới tự động được cluster khi ghi.",
      "C": "Dữ liệu mới ghi vào staging và được cluster trong bảo trì định kỳ.",
      "D": "Dữ liệu mới chưa được cluster cho đến lần OPTIMIZE tiếp theo."
    },
    "explanation_vi": "Đáp án D. Liquid clustering áp dụng khi chạy OPTIMIZE; dữ liệu ghi thêm vẫn chưa được sắp xếp cho tới OPTIMIZE kế tiếp.",
    "page": null,
    "image": "img/q_287.jpg"
  },
  {
    "id": 288,
    "topic": 1,
    "question": "A data engineer is optimizing a MERGE operation on an 800GB UC-managed table that experiences frequent updates and deletions.\nWhich two actions should the engineer prioritize to improve MERGE performance? (Choose two.)",
    "options": {
      "A": "Apply liquid clustering using the merge join keys.",
      "B": "Enable deletion vectors on the table if not already enabled.",
      "C": "Partition the table by date.",
      "D": "Use ZORDER on high-cardinality columns.",
      "E": "Overwrite the table instead of Merge."
    },
    "answer": "A",
    "question_vi": "Tối ưu hiệu năng MERGE trên bảng UC-managed 800GB thường xuyên update/delete. Nên ưu tiên hai hành động nào?",
    "options_vi": {
      "A": "Áp dụng liquid clustering theo khóa join của merge.",
      "B": "Bật deletion vectors nếu chưa bật.",
      "C": "Partition bảng theo ngày.",
      "D": "Dùng ZORDER trên cột có độ phân biệt cao.",
      "E": "Overwrite bảng thay vì MERGE."
    },
    "explanation_vi": "Đáp án A và B. Liquid clustering theo khóa join giúp đọc/ghi ít file; deletion vectors giảm rewrite khi xóa/cập nhật, cải thiện MERGE lớn.",
    "page": null,
    "image": "img/q_288.jpg"
  },
  {
    "id": 289,
    "topic": 1,
    "question": "A data engineer is building a streaming data pipeline to ingest JSON files from cloud storage into a Delta Lake table. The pipeline must process\nfiles incrementally, handle schema evolution automatically, ensure exactly-once processing, and minimize manual infrastructure management.\nHow should the data engineer fulfill these requirements?",
    "options": {
      "A": "Use Lakeflow Spark Declarative Pipelines with a static DataFrame read, merge schema with spark.conf.set\n(“spark.databricks.delta.schema.autoMerge.enabled”, “true”)",
      "B": "Use Auto Loader in batch mode with a daily job to overwrite the Delta table.",
      "C": "Use Lakeflow Spart Declarative Pipelines with Auto Loader and enabling schema inference with “cloudFiles.schemaEvolutionMode”=\n“addNewColumns”",
      "D": "Use traditional Spark Structured Streaming with Auto Loader, manually configuring checkpoints location and enabling schema inference\nwith “mergeSchema”= “true”"
    },
    "answer": "C",
    "question_vi": "Xây dựng pipeline streaming ingest file JSON vào Delta, cần xử lý tăng dần, tự động schema evolution, exactly-once, ít vận hành. Chọn cách nào?",
    "options_vi": {
      "A": "Lakeflow Spark Declarative Pipelines với DataFrame tĩnh, bật autoMerge.",
      "B": "Auto Loader ở batch mode với job hàng ngày overwrite.",
      "C": "Lakeflow Spark Declarative Pipelines với Auto Loader và “cloudFiles.schemaEvolutionMode”=“addNewColumns”.",
      "D": "Structured Streaming + Auto Loader, tự cấu hình checkpoint và mergeSchema."
    },
    "explanation_vi": "Đáp án C. Lakeflow Spark Declarative Pipelines + Auto Loader lo orchestration, checkpoint và schema evolution tự động, đảm bảo exactly-once.",
    "page": null,
    "image": "img/q_289.jpg"
  },
  {
    "id": 290,
    "topic": 1,
    "question": "Given the following PySpark code snippet in a Databricks notebook:\nfiltered_df=spark.read.format(“delta”).load(“/mnt/daya/large_table”) \\\n.filter (“event_date> ‘2024-01-01’”)\nfiltered_df.count ()\nThe data engineer notices from the Query Profile that the scan operator for filtered_df is reading almost all files, despite a filter being applied.\nWhat is the probable reason for poor data skipping?",
    "options": {
      "A": "The Delta table lacks optimization that enables dynamic file pruning.",
      "B": "The filter condition involves a data type that is excluded from data skipping support.",
      "C": "The filter is executed only after the full data scan, which prevents data skipping from taking place.",
      "D": "The event_date column is outside the table’s partitioning and Z-ordering scheme."
    },
    "answer": "D",
    "question_vi": "Đoạn PySpark lọc event_date nhưng Query Profile cho thấy scan gần như toàn bộ file. Nguyên nhân chính khiến data skipping kém?",
    "options_vi": {
      "A": "Bảng Delta thiếu tối ưu cho dynamic file pruning.",
      "B": "Điều kiện lọc dùng kiểu dữ liệu không được data skipping hỗ trợ.",
      "C": "Bộ lọc thực thi sau khi scan toàn bộ dữ liệu.",
      "D": "Cột event_date không nằm trong partition/Z-order của bảng."
    },
    "explanation_vi": "Đáp án D. event_date không được partition/Z-ORDER nên data skipping không hiệu quả, Spark phải đọc hầu hết file.",
    "page": null,
    "image": "img/q_290.jpg"
  },
  {
    "id": 291,
    "topic": 1,
    "question": "When a new Databricks project starts, the central IP team provisions the required infrastructure using Terraform and a Service Principal. This\nincludes creating a Databricks workspace, a Unity Catalog linked to an External Location, and a Databricks group containing all project team\nmembers. Project teams must store all assets – e.g., tables and volumes, as Managed assets in Unity Catalog. This model hides infrastructure\ncomplexity while giving teams autonomy within their catalog. They can create and manage schemas, tables, volumes, and related objects but\ncannot rename, delete, or change catalog permissions, those remain under IT’s control.\nWhich rights should the project group be granted to enable this model?",
    "options": {
      "A": "The group needs to have USE CATALOG and USE SCHEMA on the catalog.",
      "B": "The group needs to have ALL PRIVILEGES and the MANAGE on the catalog.",
      "C": "The group needs to have ALL PRIVILEGES on the catalog.",
      "D": "The group should be made OWNER of the catalog."
    },
    "answer": "A",
    "question_vi": "Đội IP dựng hạ tầng bằng Terraform + Service Principal: workspace, Unity Catalog với External Location, group dự án. Team dự án phải lưu tài sản quản lý bởi UC và có thể tạo schema/table/volume, nhưng không được đổi tên, xóa hay chỉnh permission catalog. Cần cấp quyền gì cho group dự án trên catalog để họ tự chủ bên trong nhưng không quản trị catalog?",
    "options_vi": {
      "A": "Cấp GRANT_OPTION trên catalog finance_data.",
      "B": "Thêm lead làm metastore admin.",
      "C": "Cấp MANAGE trên catalog.",
      "D": "Cấp ALL PRIVILEGES trên catalog."
    },
    "explanation_vi": "Đáp án C. MANAGE trên catalog cho phép tạo/điều hành schema, table, volume bên trong nhưng không cấp quyền quản trị metastore/cấp quyền cho người khác.",
    "page": null,
    "image": "img/q_291.jpg"
  },
  {
    "id": 292,
    "topic": 1,
    "question": "A data engineer needs to productionize a new Spark application written by teammate. This application has numerous external dependencies,\nincluding libraries, and requires custom environment variables and Spark configuration parameters to be set.\nWhich two methods will help the data engineer accomplish the task? (Choose two.)",
    "options": {
      "A": "Install libraries on DBFS",
      "B": "Add libraries to compute policies",
      "C": "Use secrets in init scripts to store configuration data",
      "D": "Use compute policies to set system properties, environment variables, and Spark configuration parameters.",
      "E": "Create init scripts on DBFS."
    },
    "answer": "D",
    "question_vi": "Cần đưa ứng dụng Spark mới (nhiều thư viện phụ thuộc, biến môi trường, cấu hình Spark) vào production. Hai cách nào nên dùng?",
    "options_vi": {
      "A": "Cài thư viện lên DBFS.",
      "B": "Thêm thư viện vào compute policies.",
      "C": "Dùng secrets trong init script để lưu cấu hình.",
      "D": "Dùng compute policies để đặt system properties, biến môi trường và tham số Spark.",
      "E": "Tạo init scripts trên DBFS."
    },
    "explanation_vi": "Đáp án D và E. Compute policies chuẩn hóa env vars/system properties/Spark conf; init scripts trên DBFS cài thư viện và đọc secrets khi cluster khởi động.",
    "page": null,
    "image": "img/q_292.jpg"
  },
  {
    "id": 293,
    "topic": 1,
    "question": "A healthcare analytics team is implementing a dimensional model in Delta Lake for patient care analysis. They have a date dimension table and\nare evaluating design options to ensure it supports a wide range of time-based analyses.\nWhich design approach for the date dimension will support efficient time-based querying and aggregation?",
    "options": {
      "A": "Store the date as string in ISO format (YYYY-MM-DD) for readability.",
      "B": "Pre-calculate attributes like fiscal_period, quarter, month_name, day_of_week, and holiday.",
      "C": "Store only the date value and calculate all time attributes in queries.",
      "D": "Create separate dimension tables for different calendar systems (fiscal, academic, etc.)"
    },
    "answer": "B",
    "question_vi": "Team healthcare xây dựng dimension ngày trong Delta Lake để phân tích. Thiết kế nào hỗ trợ truy vấn thời gian hiệu quả?",
    "options_vi": {
      "A": "Lưu ngày dạng chuỗi ISO để dễ đọc.",
      "B": "Tính sẵn thuộc tính như fiscal_period, quarter, month_name, day_of_week, holiday.",
      "C": "Chỉ lưu giá trị ngày và tính mọi thuộc tính trong truy vấn.",
      "D": "Tách nhiều dimension cho các lịch khác nhau (fiscal, academic...)."
    },
    "explanation_vi": "Đáp án B. Tiền tính các thuộc tính lịch trong dimension giúp truy vấn/aggregation thời gian nhanh và đơn giản.",
    "page": null,
    "image": "img/q_293.jpg"
  },
  {
    "id": 294,
    "topic": 1,
    "question": "A data engineer is tasked with ensuring that a Delta table in Databricks continuously retains deleted files for 15 days (instead of the default 7\ndays), in order to permanently comply with the organization’s data retention policy.\nWhich code snippet correctly sets this retention period for deleted files?",
    "options": {
      "A": "spark.sql(“ALTER TABLE my_table SET TBLPROPERTIES (‘delta.deletedFileRetentionDuration’ = ‘interval 15 days’)”)",
      "B": "",
      "C": "spark.sql(“VACUUM my_table RETAIN HOURS”)",
      "D": "spark.conf.set(“spark.databricks.delta.deletedFileRetemtionDuration”, “15 days”)"
    },
    "answer": "A",
    "question_vi": "Cần giữ file đã xóa của bảng Delta trong 15 ngày (mặc định 7 ngày). Câu lệnh nào đúng?",
    "options_vi": {
      "A": "spark.sql(\"ALTER TABLE my_table SET TBLPROPERTIES ('delta.deletedFileRetentionDuration' = 'interval 15 days')\")",
      "B": "",
      "C": "spark.sql(\"VACUUM my_table RETAIN HOURS\")",
      "D": "spark.conf.set(\"spark.databricks.delta.deletedFileRetemtionDuration\", \"15 days\")"
    },
    "explanation_vi": "Đáp án A. Thiết lập delta.deletedFileRetentionDuration = interval 15 days ở TBLPROPERTIES để thay đổi thời gian giữ file đã xóa.",
    "page": null,
    "image": "img/q_294.jpg"
  },
  {
    "id": 295,
    "topic": 1,
    "question": "A Data Engineer is building a fraud detection pipeline that calls out to Open AI, via a Python library, and needs to include an access token when\nusing the API.\nWhich Databricks CLI command should the Data Engineer use to create the secret?",
    "options": {
      "A": "databricks secrets put-secret KEY SCOPE; dbutils.secrets.get (KEY, SCOPE)",
      "B": "databricks tokens put-token SCOPE KEY; dbutils.tokens.get (SCOPE, KEY)",
      "C": "databricks secrets put-secret SCOPE KEY; dbutils.secrets.get (SCOPE, KEY)",
      "D": "databricks tokens put-token KEY SCOPE; dbutils.secrets.get (KEY, SCOPE)"
    },
    "answer": "C",
    "question_vi": "Pipeline gian lận cần gọi OpenAI qua thư viện Python và kèm access token. Dùng lệnh CLI nào để tạo secret?",
    "options_vi": {
      "A": "databricks secrets put-secret KEY SCOPE; dbutils.secrets.get (KEY, SCOPE)",
      "B": "databricks tokens put-token SCOPE KEY; dbutils.tokens.get (SCOPE, KEY)",
      "C": "databricks secrets put-secret SCOPE KEY; dbutils.secrets.get (SCOPE, KEY)",
      "D": "databricks tokens put-token KEY SCOPE; dbutils.secrets.get (KEY, SCOPE)"
    },
    "explanation_vi": "Đáp án C. secrets put-secret <scope> <key> rồi đọc bằng dbutils.secrets.get(scope, key) để chèn token vào code.",
    "page": null,
    "image": "img/q_295.jpg"
  },
  {
    "id": 296,
    "topic": 1,
    "question": "A company has a task management system that tracks the most recent status of tasks. The system takes task events as input and processes\nevents in near real-time using Lakeflow Spark Declarative Pipelines. A new task event is ingested into the system when a task is created or the\nstatus is changed. Lakeflow Spark Declarative Pipelines provides a streaming table (table name: tasks_status) for the BI users to query. The table\nrepresents the latest status of all tasks and includes 5 columns: task_id(unique for each task), task_name, task_owner, task_status,\ntask_event_time. The table enables 3 properties: deletion vectors, row tracking, and change data feed.\nA data engineer is asked to create a new Lakeflow Spark Declarative Pipelines to enrich the “task_status” table in near real-time by adding one\nadditional column representing task_owner’s department, which can be looked up from a static dimension table (table name: employee).\nHow should this enrichment be implemented?",
    "options": {
      "A": "Create a new Lakeflow Spark Declarative Pipelines: use readStream() function with option readChangeFeed to read tasks_status table CDF;\nenrich with the employee table; create a new streaming table as the result table and use apply_changes() function to process the changes\nfrom the enriched CDF.",
      "B": "Create a new Lakeflow Spark Declarative pipeline: use the readStream()function to read tasks_status table, enrich with the employee table;\nstore the result in a new streaming table.",
      "C": "Create a new Lakeflow Spark Declarative Pipeline: use the readStream() function with the option skipChangeCommits to read the\ntasks_status table; enrich with the employee table; store the result in a new streaming table.",
      "D": "Create a new Lakeflow Spark Declarative Pipeline: use the read () function to read tasks_status table; enrich with employee table; store the\nresult in a materialized view."
    },
    "answer": "A",
    "question_vi": "Hệ thống nhiệm vụ stream vào bảng tasks_status (có deletion vectors, row tracking, CDF). Cần enrich near real-time thêm cột phòng ban tra từ bảng employee tĩnh. Làm thế nào?",
    "options_vi": {
      "A": "Tạo pipeline đọc CDF tasks_status bằng readStream(..., readChangeFeed), join employee, dùng apply_changes() ghi ra streaming table kết quả.",
      "B": "Pipeline đọc stream tasks_status rồi join employee, ghi ra streaming table mới.",
      "C": "Pipeline đọc stream tasks_status với skipChangeCommits, join employee, ghi ra streaming table.",
      "D": "Pipeline batch read tasks_status, join employee, ghi materialized view."
    },
    "explanation_vi": "Đáp án A. Đọc CDF để nhận thay đổi, join dimension và apply_changes xử lý upsert/out-of-order đúng cho bảng streaming kết quả.",
    "page": null,
    "image": "img/q_296.jpg"
  },
  {
    "id": 297,
    "topic": 1,
    "question": "A data engineer is reviewing the PySpark code to copy a part of the production dataset to the sandbox environment, and needs to be sure that no\nPII(Personally Identifiable Information) data is being copied. After checking the sales table, the data engineer notices that it has user emails as\nthe only PII data included as well as being the only column to identify the user.\nfrom pyspark.sql import functions as F\nWhich anonymised code should be used to achieve the required outcome?",
    "options": {
      "A": "df.withColumn (“user_emai”, F.expr(“uuid()”))",
      "B": "df.withColumn (“user_email”, F.sha2 (“user_email”))",
      "C": "df.withColumn (“hashed_email”, sha2 (“user_email”))",
      "D": "df.withColumn (“user_email”, F.regexp_replace (“user_eamail”, “@*”, “@anonymized.com”))"
    },
    "answer": "B",
    "question_vi": "Sao chép dữ liệu production sang sandbox nhưng tránh PII (email) là định danh duy nhất. Nên ẩn danh thế nào?",
    "options_vi": {
      "A": "df.withColumn(\"user_email\", F.expr(\"uuid()\"))",
      "B": "df.withColumn(\"user_email\", F.sha2(\"user_email\"))",
      "C": "df.withColumn(\"hashed_email\", sha2(\"user_email\"))",
      "D": "df.withColumn(\"user_email\", F.regexp_replace(\"user_email\", \"@*\", \"@anonymized.com\"))"
    },
    "explanation_vi": "Đáp án B. Băm email thay thế trực tiếp cột PII duy nhất, loại bỏ khả năng truy ngược nhưng vẫn tạo khóa ổn định cho phân tích.",
    "page": null,
    "image": "img/q_297.jpg"
  },
  {
    "id": 298,
    "topic": 1,
    "question": "A data engineer wants to ingest a large collection of image files (JPEG and PNG) from cloud object storage into Unity Catalog-managed table for\nfurther analysis and visualization.\nWhich two configurations and practices are recommended to incrementally ingest these images into the table? (Choose two.)",
    "options": {
      "A": "Use Auto loader and set cloudFiles.format to \"TEXT\"",
      "B": "Use Auto loader and set cloudFiles.format to \"BINARYFILE\"",
      "C": "Use Auto loader and set cloudFiles.format to \"IMAGE\"",
      "D": "Use the pathGlobFilter option to select only image files (e.g.. \"*.jpg, *.png\")",
      "E": "Move files to a volume and read with SQL editor"
    },
    "answer": "B",
    "question_vi": "Ingest bộ ảnh JPEG/PNG từ object storage vào bảng UC. Cấu hình/thực hành nào nên dùng để ingest tăng dần?",
    "options_vi": {
      "A": "Dùng Auto Loader, cloudFiles.format = \"TEXT\".",
      "B": "Dùng Auto Loader, cloudFiles.format = \"BINARYFILE\".",
      "C": "Dùng Auto Loader, cloudFiles.format = \"IMAGE\".",
      "D": "Dùng pathGlobFilter để chọn file ảnh (*.jpg, *.png).",
      "E": "Chuyển file vào volume rồi đọc bằng SQL editor."
    },
    "explanation_vi": "Đáp án B và D. Auto Loader định dạng binaryfile để đọc nội dung nhị phân; pathGlobFilter lọc chỉ jpg/png trước khi ingest.",
    "page": null,
    "image": "img/q_298.jpg"
  },
  {
    "id": 299,
    "topic": 1,
    "question": "A data engineer is configuring Delta Sharing for a Databricks-to-Databricks scenario to optimize read performance. The recipient needs to perform\ntime travel queries and streaming reads on shared sales data.\nWhich configuration will provide the optimal performance while enabling these capabilities?",
    "options": {
      "A": "Use the open sharing protocol instead of Databricks-to Databricks sharing for better performance.",
      "B": "Share tables WITHOUT HISTORY and enable partitioning for better query performance.",
      "C": "Share tables WITH HISTORY, ensure tables don't have partitioning enabled. and enable CDF before sharing.",
      "D": "Share the entire schema WITHOUT HISTORY and rely on recipient-side caching for performance."
    },
    "answer": "C",
    "question_vi": "Cấu hình Delta Sharing Databricks-to-Databricks cần hỗ trợ time travel và streaming đọc sales. Nên cấu hình thế nào để tối ưu?",
    "options_vi": {
      "A": "Dùng Open Sharing thay Databricks-to-Databricks.",
      "B": "Chia sẻ bảng WITHOUT HISTORY và bật partition để tăng hiệu năng.",
      "C": "Chia sẻ bảng WITH HISTORY, tránh partition và bật CDF trước khi share.",
      "D": "Chia sẻ toàn bộ schema WITHOUT HISTORY và dùng cache bên nhận."
    },
    "explanation_vi": "Đáp án C. Chia sẻ WITH HISTORY + CDF cho phép time travel và streaming; partitioning hạn chế nên tránh để tối ưu đọc qua sharing.",
    "page": null,
    "image": "img/q_299.jpg"
  },
  {
    "id": 300,
    "topic": 1,
    "question": "A data organization has adopted Delta Sharing to securely distribute curated datasets from a Unity Catalog-enabled workspace. The data\nengineering team is sharing large Delta tables with an internal partner via Databricks-to-Databricks and aggregated reports with an external client\nvia Open Sharing. While testing new sharing workflows, the data engineering team encounters challenges related to access control, data update\nvisibility, and shareable object types.\nWhat is a limitation of the Delta Sharing protocol or implementation when used with Databricks-to-Databricks or Open Sharing?",
    "options": {
      "A": "Delta Sharing does not support Unity Catalog enabled tables; only legacy Hive Metastore tables are shareable.",
      "B": "With Databricks-to-Databricks sharing. Unity Catalog recipients must re-ingest data manually using COPY INTO or REST APIs.",
      "C": "Delta Sharing (both Databricks-to-Databricks and Open sharing) allows recipients to modify the source data if they have SELECT privileges.",
      "D": "With Open sharing, recipients cannot access Volumes, Models, or notebooks — only static Delta tables are supported."
    },
    "answer": "D",
    "question_vi": "Tổ chức chia sẻ bảng Delta qua Delta Sharing cho đối tác nội bộ (Databricks-to-Databricks) và báo cáo tổng hợp cho khách ngoài qua Open Sharing. Khi thử nghiệm gặp vấn đề về kiểm soát truy cập, nhìn thấy cập nhật và loại đối tượng chia sẻ. Hạn chế của Delta Sharing trong bối cảnh này là gì?",
    "options_vi": {
      "A": "Delta Sharing không hỗ trợ bảng Unity Catalog, chỉ dùng được bảng Hive Metastore cũ.",
      "B": "Với Databricks-to-Databricks, bên nhận phải tự re-ingest bằng COPY INTO hoặc REST API.",
      "C": "Delta Sharing cho phép bên nhận sửa dữ liệu nguồn nếu có SELECT.",
      "D": "Với Open Sharing, bên nhận không truy cập được Volumes/Models/notebook — chỉ hỗ trợ bảng Delta tĩnh."
    },
    "explanation_vi": "Đáp án D. Open Sharing chỉ cho truy cập bảng Delta tĩnh; không hỗ trợ Volumes, Models, notebooks.",
    "page": null,
    "image": "img/q_300.jpg"
  },
  {
    "id": 301,
    "topic": 1,
    "question": "A data engineer is creating a daily reporting Job. There are two reporting notebooks one for weekdays and the other for weekends. An \"If/else\ncondition\" task is configured as \"{{job.start_time.is_weekday}} == true\" to route the job to either weekday or weekend notebook tasks. The same\njob would be used in multiple time zones.\nWhich action should a senior data engineer take upon reviewing the job to merge or reject the pull request?",
    "options": {
      "A": "Reject. As they should use {{job.trigger_time.is_weekday}} instead.",
      "B": "Reject. As the {{job.start_time.is_weekday}} is not a valid value reference.",
      "C": "Reject. As the {{job.start_time.is_weekday}} is for the UTC timezone.",
      "D": "Merge. As the job configuration looks good."
    },
    "answer": "C",
    "question_vi": "Một job báo cáo hàng ngày có notebook cho ngày thường và cuối tuần. Task if/else cấu hình \"{{job.start_time.is_weekday}} == true\" để chọn notebook, job dùng ở nhiều múi giờ. Senior review nên làm gì?",
    "options_vi": {
      "A": "Reject vì nên dùng {{job.trigger_time.is_weekday}}.",
      "B": "Reject vì {{job.start_time.is_weekday}} không hợp lệ.",
      "C": "Reject vì {{job.start_time.is_weekday}} tính theo UTC.",
      "D": "Merge vì cấu hình ổn."
    },
    "explanation_vi": "Đáp án A. trigger_time phản ánh thời điểm kích hoạt thực tế của job trong múi giờ, dùng cho điều hướng weekday/weekend đáng tin cậy hơn.",
    "page": null,
    "image": "img/q_301.jpg"
  },
  {
    "id": 302,
    "topic": 1,
    "question": "How are the operational aspects of Lakeflow Spark Declarative Pipelines from Spark Structured Streaming different?",
    "options": {
      "A": "Lakeflow Spark Declarative Pipelines automatically handle schema evolution, while Structured Streaming always requires manual schema\nmanagement.",
      "B": "Structured Streaming can process continuous data streams, while Lakeflow Spark Declarative Pipelines cannot.",
      "C": "Lakeflow Spark Declarative Pipelines manage the orchestration of multi-stage pipelines automatically, while Structured Streaming requires\nexternal orchestration for complex dependencies.",
      "D": "Lakeflow Spark Declarative Pipelines can write to Delta Lake format while structured streaming cannot."
    },
    "answer": "C",
    "question_vi": "Điểm khác biệt vận hành giữa Lakeflow Spark Declarative Pipelines và Structured Streaming?",
    "options_vi": {
      "A": "Lakeflow tự xử lý schema evolution, Structured Streaming luôn phải thủ công.",
      "B": "Structured Streaming xử lý stream liên tục, Lakeflow không.",
      "C": "Lakeflow tự quản lý orchestration multi-stage, Structured Streaming cần công cụ ngoài cho phụ thuộc phức tạp.",
      "D": "Lakeflow có thể ghi Delta còn Structured Streaming thì không."
    },
    "explanation_vi": "Đáp án C. Lakeflow Spark Declarative Pipelines tự điều phối pipeline nhiều giai đoạn, còn Structured Streaming phải tự orchestrate.",
    "page": null,
    "image": "img/q_302.jpg"
  },
  {
    "id": 303,
    "topic": 1,
    "question": "A workspace admin has created a new catalog called ‘finance_data’ and wants to delegate permission management to a finance team lead\nwithout giving them full admin rights.\nWhich privilege should be granted to the finance team lead?",
    "options": {
      "A": "GRANT_OPTION privilege on the finance_data catalog.",
      "B": "Make the finance team lead a metastore admin.",
      "C": "MANAGE privilege on the finance_data catalog.",
      "D": "ALL PRIVILEGES on the finance_data catalog."
    },
    "answer": "C",
    "question_vi": "Admin tạo catalog finance_data và muốn giao quản lý quyền cho lead team finance mà không cho full admin. Nên cấp quyền nào?",
    "options_vi": {
      "A": "Cấp GRANT_OPTION trên catalog.",
      "B": "Biến lead thành metastore admin.",
      "C": "Cấp quyền MANAGE trên catalog finance_data.",
      "D": "Cấp ALL PRIVILEGES trên catalog."
    },
    "explanation_vi": "Đáp án C. MANAGE cho phép lead quản lý quyền và đối tượng trong catalog mà không cần quyền admin toàn metastore.",
    "page": null,
    "image": "img/q_303.jpg"
  },
  {
    "id": 304,
    "topic": 1,
    "question": "A data engineer is configuring a Lakeflow Spark Declarative Pipelines to process CDC data from a source. The source events sometimes arrive out\nof order, and multiple updates may occur with the same update_timestamp but with different update_sequence_id.\nWhat should the data engineer do to ensure events are sequenced correctly?",
    "options": {
      "A": "Use SEQUENCE BY STRUCT(event_timestamp, update_sequence_id) in AUTO CDC APIs.",
      "B": "Set track history column list to [event timestamp, event id] in AUTO CDC APIs.",
      "C": "Use dropduplicate() to remove out-of-order and duplicate records in LDP.",
      "D": "Use a window function to sort update_sequence_id within the same partition, i.e., update_timestamp in the LDP pipeline."
    },
    "answer": "A",
    "question_vi": "Thiết lập Lakeflow Spark Declarative Pipelines xử lý dữ liệu CDC; sự kiện có thể đến không theo thứ tự và nhiều update cùng update_timestamp nhưng khác update_sequence_id. Làm gì để sắp đúng trình tự?",
    "options_vi": {
      "A": "Dùng SEQUENCE BY STRUCT(event_timestamp, update_sequence_id) trong AUTO CDC API.",
      "B": "Đặt track history column list = [event_timestamp, event_id] trong AUTO CDC.",
      "C": "Dùng dropduplicate() để bỏ bản ghi ngoài thứ tự.",
      "D": "Dùng window sắp update_sequence_id trong cùng partition update_timestamp trong LDP."
    },
    "explanation_vi": "Đáp án A. SEQUENCE BY với timestamp + sequence_id đảm bảo sắp xếp đúng thứ tự cập nhật trong pipeline Auto CDC.",
    "page": null,
    "image": "img/q_304.jpg"
  },
  {
    "id": 305,
    "topic": 1,
    "question": "A streaming video analytics team ingests billions of events daily into a Unity Catalog-managed Delta table video_events. Analysts run ad-hoc\npoint-lookup queries on columns like user_id, campaign_id, and region. The team manually runs OPTIMIZE video_events Z-ORDER user_id,\ncampaign_id, region, but still sees poor performance on recent data, and dislikes the operational overhead. The team wants a hands-off way to\nkeep hot columns co-located as query patterns evolve.\nWhich Delta capability should the team leverage on video_events?",
    "options": {
      "A": "Enable auto-compaction (optimizeWrite & autoCompact).",
      "B": "Schedule OPTIMIZE/ZORDER to run after each job to improve recent file performance.",
      "C": "Utilize Liquid Clustering CLUSTER BY AUTO and Predictive Optimization.",
      "D": "Enable Delta caching."
    },
    "answer": "C",
    "question_vi": "Bảng video_events (UC Delta) ingest hàng tỷ sự kiện; analyst tra cứu theo user_id, campaign_id, region. Hiện chạy OPTIMIZE ZORDER thủ công nhưng hiệu năng dữ liệu mới vẫn kém và tốn công. Muốn tự động, ít vận hành để đồng định vị các cột hot. Nên dùng tính năng nào?",
    "options_vi": {
      "A": "Bật auto-compaction (optimizeWrite & autoCompact).",
      "B": "Lên lịch OPTIMIZE/ZORDER sau mỗi job.",
      "C": "Dùng Liquid Clustering CLUSTER BY AUTO kết hợp Predictive Optimization.",
      "D": "Bật Delta caching."
    },
    "explanation_vi": "Đáp án C. Liquid clustering AUTO + Predictive Optimization tự động sắp xếp theo pattern truy vấn, giảm nhu cầu OPTIMIZE thủ công.",
    "page": null,
    "image": "img/q_305.jpg"
  },
  {
    "id": 306,
    "topic": 1,
    "question": "A data engineer is designing a data pipeline in Databricks that needs to process records from a Kafka stream where late-arriving data common.\nWhich approach should the data engineer use?",
    "options": {
      "A": "Use a watermark to specify the allowed lateness to accommodate records that arrive after their expected window, ensuring correct\naggregation and state management.",
      "B": "Use an Auto CDC pipeline with batch tables to simplify late data handling.",
      "C": "Implement a custom solution using Databricks Jobs to periodically reprocess all historical data",
      "D": "Use batch processing and overwrite the entire output table each time to ensure late data is incorporated correctly."
    },
    "answer": "A",
    "question_vi": "Pipeline Kafka có dữ liệu đến muộn phổ biến. Cách tiếp cận nào nên dùng?",
    "options_vi": {
      "A": "Đặt watermark cho phép trễ để vẫn tính đúng và quản lý state.",
      "B": "Dùng Auto CDC với batch table để đơn giản hóa.",
      "C": "Tự viết job Databricks reprocess toàn bộ lịch sử định kỳ.",
      "D": "Xử lý batch và overwrite toàn bộ bảng mỗi lần."
    },
    "explanation_vi": "Đáp án A. Watermark xác định độ trễ cho phép, Structured Streaming sẽ giữ state và xử lý đúng sự kiện đến muộn trong khoảng đó.",
    "page": null,
    "image": "img/q_306.jpg"
  },
  {
    "id": 307,
    "topic": 1,
    "question": "A data engineering team is configuring access controls in Databricks Unity Catalog. They grant the SELECT privilege on the sales catalog to the\nanalyst_group, expecting that members of this group will automatically have SELECT access to all current and future schemas, tables, and views\nwithin the sales catalog.\nWhat describes the privilege inheritance behavior in Unity Catalog?",
    "options": {
      "A": "Privileges in Unity Catalog do not cascade; SELECT most be explicitly granted on each schema and table, even if granted at the catalog\nlevel.",
      "B": "Granting SELECT on a catalog automatically applies SELECT to all current and future schemas, tables, and views within that catalog.",
      "C": "Granting SELECT at the catalog level applies to existing schemas and tables but not to those created in the future.",
      "D": "Privileges granted at the schema level override any catalog-level privileges and prevent access unless explicitly revoked."
    },
    "answer": "A",
    "question_vi": "Đội data cấp SELECT trên catalog sales cho analyst_group, kỳ vọng được truy cập tất cả schema/table hiện tại và tương lai. Hành vi thừa kế quyền trong Unity Catalog như thế nào?",
    "options_vi": {
      "A": "Quyền không tự lan truyền; phải cấp SELECT ở từng schema/table.",
      "B": "Cấp SELECT ở catalog sẽ áp dụng cho mọi schema/table/view hiện tại và tương lai.",
      "C": "Cấp SELECT ở catalog chỉ áp dụng cho đối tượng hiện có, không cho đối tượng tạo sau này.",
      "D": "Quyền schema ghi đè quyền catalog và chặn truy cập trừ khi revoke."
    },
    "explanation_vi": "Đáp án A. UC không tự cascade SELECT xuống schema/table; phải cấp quyền cụ thể cho từng cấp.",
    "page": null,
    "image": "img/q_307.jpg"
  },
  {
    "id": 308,
    "topic": 1,
    "question": "An organization processes customer data from web and mobile applications. Data includes names, emails phone numbers, and location history.\nData arrives both as Batch files from an SFTP drop (daily) and Streaming JSON events from Kafka (real-time).\nTo comply with internal data privacy policies, the following requirements must be met:\n• Personally identifiable information (PII) like email, phone_number, and ip_address must be masked or anonymized before storage\n• Both batch and streaming pipelines must apply consistent PII handling\n• Masking logic must be auditable and reproducible\n• The masked data must still be usable for downstream analytics\nHow should the data engineer design a compliant data pipeline on Databricks that supports both batch and streaming modes, applies data\nmasking to PII, and maintains traceability of transformations for audits?",
    "options": {
      "A": "Ingest both batch and streaming data using Lakeflow Spark Declarative Pipelines, and apply masking via Unity Catalog column masks at\nread time to avoid modifying the data during ingestion.",
      "B": "Load batch data with notebooks and ingest streaming data with SQL Warehouses; use Unity Catalog column masks on Silver tables to\nredact fields after storage.",
      "C": "Use Lakeflow Spark Declarative Pipelines for batch and streaming ingestion define a PII masking function, and apply it during Bronze\ningestion before writing to Delta Lake.",
      "D": "Allow PII to be stored unmasked in Bronze for lineage tracking, then apply masking logic in Gold tables used for reporting."
    },
    "answer": "C",
    "question_vi": "Tổ chức xử lý dữ liệu khách hàng từ web/mobile, gồm tên, email, điện thoại, lịch sử vị trí. Dữ liệu đến cả dạng batch (SFTP) và streaming (Kafka). Chính sách: PII phải được mask/anonymize trước khi lưu; batch và streaming áp dụng giống nhau; mask phải audit được; dữ liệu đã mask vẫn dùng phân tích được. Thiết kế pipeline tuân thủ thế nào?",
    "options_vi": {
      "A": "Ingest cả batch và streaming bằng Lakeflow Spark Declarative Pipelines, áp dụng column mask của Unity Catalog khi đọc để không chỉnh dữ liệu lưu trữ.",
      "B": "Batch bằng notebook, streaming bằng SQL Warehouse; dùng column mask ở bảng Silver để che sau lưu trữ.",
      "C": "Dùng Lakeflow Spark Declarative Pipelines cho cả batch và streaming, định nghĩa hàm mask PII và áp dụng ngay tại Bronze trước khi ghi Delta.",
      "D": "Cho phép lưu PII chưa mask ở Bronze để giữ lineage, sau đó mask ở Gold report."
    },
    "explanation_vi": "Đáp án C. Áp dụng hàm mask thống nhất ngay khi ingest (Bronze) cho cả batch/stream, lưu Delta đã che PII và vẫn audit được thông qua pipeline định nghĩa.",
    "page": null,
    "image": "img/q_308.jpg"
  },
  {
    "id": 309,
    "topic": 1,
    "question": "Which method can be used to determine the total wall-clock time it took to execute a query?",
    "options": {
      "A": "In the Spark UI, take the job duration of the longest-running job associated with that query.",
      "B": "In the Spark UI, take the sum of all task durations that ran across all stages (or all jobs associated with that query.",
      "C": "Open the Query Profiler associated with that query and use the Total wall-clock duration metric.",
      "D": "Open the Query Profiler associated with that query and use the Aggregated task time metric."
    },
    "answer": "C",
    "question_vi": "Phương pháp nào dùng để xác định tổng thời gian thực (wall-clock) mà một truy vấn đã chạy?",
    "options_vi": {
      "A": "Trong Spark UI, lấy thời lượng của job chạy lâu nhất gắn với truy vấn đó.",
      "B": "Trong Spark UI, cộng tất cả thời gian task trên mọi stage (hoặc mọi job) của truy vấn.",
      "C": "Mở Query Profiler của truy vấn và xem chỉ số Total wall-clock duration.",
      "D": "Mở Query Profiler và dùng chỉ số Aggregated task time."
    },
    "explanation_vi": "Query Profiler cung cấp trực tiếp tổng thời gian thực của truy vấn; chỉ số Total wall-clock duration phản ánh đúng end-to-end, không cần cộng thủ công như Spark UI.",
    "page": null,
    "image": "img/q_309.jpg"
  },
  {
    "id": 310,
    "topic": 1,
    "question": "A data architect is designing a Databricks solution to efficiently process data for different business requirements.\nIn which scenario should a data engineer use a materialized view compared to a streaming table?",
    "options": {
      "A": "Precomputing complex aggregations and joins from multiple large tables to accelerate BI dashboard performance.",
      "B": "Processing high-volume, continuous clickstream data from a website to monitor user behavior in real-time.",
      "C": "Ingesting data from Apache Kafka topics with sub second processing requirements for immediate alerting,",
      "D": "Implementing a CDC (Change Data Capture) pipeline that needs to detect and respond to database changes within seconds."
    },
    "answer": "A",
    "question_vi": "Trong tình huống nào nên dùng materialized view thay vì streaming table?",
    "options_vi": {
      "A": "Tính trước các phép tổng hợp/phép nối phức tạp trên nhiều bảng lớn để tăng tốc dashboard BI.",
      "B": "Xử lý clickstream liên tục khối lượng lớn để theo dõi hành vi người dùng thời gian thực.",
      "C": "Nạp dữ liệu từ Kafka với yêu cầu xử lý dưới giây cho cảnh báo tức thời.",
      "D": "Pipeline CDC cần bắt và phản ứng với thay đổi DB trong vài giây."
    },
    "explanation_vi": "Materialized view phù hợp khi cần truy vấn lặp lại trên tập lớn và muốn trả lời nhanh (tính trước, cache kết quả). Các trường hợp thời gian thực/CDC thì dùng streaming table.",
    "page": null,
    "image": "img/q_310.jpg"
  },
  {
    "id": 311,
    "topic": 1,
    "question": "A query is taking too long to run. After investigating the Spark UI, the data engineer discovered a significant amount of disk spill. The type of\ncompute instance the data engineer used only provides a core-to-memory ratio of 1:2.\nWhat are the two steps the data engineer should take to minimize spillage? (Choose two.)",
    "options": {
      "A": "Increase spark.sql.files.maxPartitionBytes.",
      "B": "Choose a compute instance with more disk space.",
      "C": "Choose a compute instance with a higher core-to-memory ratio",
      "D": "Reduce spark.sql.files.maxPartitionBytes.",
      "E": "Choose a compute instance with more network bandwidth."
    },
    "answer": "C",
    "question_vi": "Truy vấn bị spill đĩa do máy có tỷ lệ core:RAM 1:2. Hai bước nào giúp giảm spill? (chọn 2)",
    "options_vi": {
      "A": "Tăng spark.sql.files.maxPartitionBytes.",
      "B": "Chọn máy có nhiều dung lượng đĩa hơn.",
      "C": "Chọn máy có tỷ lệ core:RAM cao hơn.",
      "D": "Giảm spark.sql.files.maxPartitionBytes.",
      "E": "Chọn máy có băng thông mạng cao hơn."
    },
    "explanation_vi": "Spill xảy ra vì thiếu RAM so với khối lượng tính toán. Giảm kích thước partition (D) giúp mỗi task dùng ít bộ nhớ; chọn máy có nhiều RAM trên mỗi core (C) cũng giảm spill.",
    "page": null,
    "image": "img/q_311.jpg"
  },
  {
    "id": 312,
    "topic": 1,
    "question": "A data engineering team has a time-consuming data ingestion job. It has three data sources, and each data ingestion notebook takes about one\nhour to load new data. The job had been working fine, loading data every midnight. However, one day they received an alert message stating the\njob had failed. By investigating the cause, they figured out that the failed notebook code was updated, and a new required configuration was\nintroduced to parameterize a hardcoded value without notice. Now, the team has to fix the issue as quickly as possible to load the latest data from\nthe failing data source.\nWhich action should the team take in this scenario?",
    "options": {
      "A": "Update the task by adding the missing task parameter, and manually run the job.",
      "B": "Share the analysis with the failing notebook owner so that they can fix it quickly.",
      "C": "Repair the run with the new parameter.",
      "D": "Repair the run with the new parameter, and update the task by adding the missing task parameter."
    },
    "answer": "D",
    "question_vi": "Job ETL nhiều tác vụ, một notebook fail do thêm tham số mới mà chưa cấu hình. Cần làm gì để nạp dữ liệu nhanh nhất?",
    "options_vi": {
      "A": "Cập nhật task thêm tham số, rồi chạy tay job.",
      "B": "Gửi phân tích cho chủ notebook để họ sửa.",
      "C": "Repair run với tham số mới.",
      "D": "Repair run với tham số mới và cập nhật task thêm tham số bị thiếu."
    },
    "explanation_vi": "Cần chữa cả run hiện tại lẫn cấu hình tương lai. Repair run với tham số mới để lấy dữ liệu ngay, đồng thời cập nhật task để các lần chạy sau không lỗi.",
    "page": null,
    "image": "img/q_312.jpg"
  },
  {
    "id": 313,
    "topic": 1,
    "question": "A data engineer is masking the provided data column containing the email address. The goal is to have an output of the same length for all rows,\nwhile keeping different outputs for different values.\nWhich SQL function should be used to achieve this?",
    "options": {
      "A": "hash(email)",
      "B": "mask(email, ‘?’)",
      "C": "sha1(‘email’)",
      "D": "sha2(email,0)"
    },
    "answer": "C",
    "question_vi": "Cần che dấu cột email sao cho kết quả luôn cùng độ dài nhưng khác nhau cho mỗi giá trị. Dùng hàm nào?",
    "options_vi": {
      "A": "hash(email)",
      "B": "mask(email, '?')",
      "C": "sha1('email')",
      "D": "sha2(email,0)"
    },
    "explanation_vi": "Băm (sha1) cho ra chuỗi cố định độ dài, khác nhau cho từng input, phù hợp yêu cầu mask mà vẫn không thể khôi phục giá trị gốc.",
    "page": null,
    "image": "img/q_313.jpg"
  },
  {
    "id": 314,
    "topic": 1,
    "question": "A company wants to implement Lakehouse Federation across multiple data sources, but is worried about data consistency and ensuring all teams\naccess the same authoritative version of their data.\nWhich statement is applicable for Lakehouse Federations to maintain data consistency?",
    "options": {
      "A": "Federation creates local copies that must be manually refreshed.",
      "B": "Federation implements change data capture from all sources.",
      "C": "A separate data synchronization service must be deployed.",
      "D": "Federation provides read-only access that reflects the current state of source systems."
    },
    "answer": "D",
    "question_vi": "Tuyên bố nào đúng về Lakehouse Federation để đảm bảo dữ liệu nhất quán?",
    "options_vi": {
      "A": "Federation tạo bản sao cục bộ cần refresh thủ công.",
      "B": "Federation triển khai CDC cho mọi nguồn.",
      "C": "Phải dùng dịch vụ đồng bộ dữ liệu riêng.",
      "D": "Federation cung cấp quyền đọc phản ánh trạng thái hiện tại của nguồn."
    },
    "explanation_vi": "Federation chỉ đọc trực tiếp nguồn và phản ánh trạng thái mới nhất; không tạo bản sao cần đồng bộ, nên đảm bảo mọi nhóm xem cùng phiên bản hiện tại.",
    "page": null,
    "image": "img/q_314.jpg"
  },
  {
    "id": 315,
    "topic": 1,
    "question": "A data engineer needs to implement column masking for a sensitive column in a Unity Catalog-managed table. The masking logic must\ndynamically check if users belong to specific groups defined in a separate table (group_access) that maps groups to allowed departments.\nWhich approach should the engineer use to efficiently enforce this requirement?",
    "options": {
      "A": "Create a view without selecting the sensitive column",
      "B": "Apply a column mask that references the group_access mapping table in its UDF",
      "C": "Create a UDF that hardcodes allowed groups and apply it as a column mask.",
      "D": "Use a row filter to restrict access based on the user's group."
    },
    "answer": "B",
    "question_vi": "Cần mask cột nhạy cảm trong bảng Unity Catalog, logic dựa vào bảng group_access ánh xạ group -> phòng ban. Cách nào hiệu quả?",
    "options_vi": {
      "A": "Tạo view bỏ hẳn cột nhạy cảm.",
      "B": "Dùng column mask tham chiếu bảng group_access bên trong UDF.",
      "C": "Tạo UDF hardcode group hợp lệ và áp mask.",
      "D": "Dùng row filter theo group người dùng."
    },
    "explanation_vi": "Column mask có thể đọc bảng group_access để quyết định cho phép hiển thị; giải pháp động, dễ bảo trì hơn hardcode hoặc bỏ cột.",
    "page": null,
    "image": "img/q_315.jpg"
  },
  {
    "id": 316,
    "topic": 1,
    "question": "Two data engineers are working on the same Databricks notebook in separate branches. Both have edited the same section of code. When one\ntries to merge the other’s branch into their own using the Databricks Git folders UI, a merge conflict occurs on that notebook file. The UI highlights\nthe conflict and presents options for resolution.\nHow should the data engineers resolve this merge conflict using Databricks Git folders?",
    "options": {
      "A": "Use the Git CLI in the cluster's web terminal to force-push the conflicted merge (git push --force), overriding the remote branch with local\nversion and discarding changes.",
      "B": "Use the Git folders UI to manually edit the notebook file, selecting the desired lines from both versions and removing the conflict markers,\nthen mark the conflict as resolved.",
      "C": "Abort the merge, discard all local changes, and try the merge operation again without reviewing the confiding code.",
      "D": "Delete the conflicted notebook file via the Databricks workspace UI, commit the deletion, and recreate the notebook from scratch in a new\ncommit to bypass the conflict entirely."
    },
    "answer": "B",
    "question_vi": "Hai data engineer merge notebook và gặp xung đột trong Databricks Git folders UI. Giải quyết thế nào?",
    "options_vi": {
      "A": "Dùng Git CLI force-push ghi đè nhánh từ xa.",
      "B": "Dùng Git folders UI chỉnh tay file, chọn dòng mong muốn và bỏ dấu conflict rồi đánh dấu resolved.",
      "C": "Hủy merge, bỏ hết thay đổi local rồi merge lại.",
      "D": "Xóa notebook và tạo lại để né conflict."
    },
    "explanation_vi": "UI đã hiển thị vùng conflict; chọn thủ công phần giữ lại, xóa marker và đánh dấu resolved là cách đúng, tránh mất code của cả hai bên.",
    "page": null,
    "image": "img/q_316.jpg"
  },
  {
    "id": 317,
    "topic": 1,
    "question": "A data engineer wants to automate job monitoring and recovery in Databricks using the Jobs API. They need to list all jobs, identify a failed job,\nand rerun it.\nWhich sequence of API actions should the data engineer perform?",
    "options": {
      "A": "Use the jobs list endpoint to list jobs, check job run statuses with jobs runs list, and rerun a failed job using jobs run-now.",
      "B": "Use the jobs get endpoint to retrieve job details, then use jobs update to rerun failed jobs.",
      "C": "Use the jobs list endpoint to list jobs, then use the jobs create endpoint to create a new job, and run the new job using jobs run-now.",
      "D": "Use the jobs cancel endpoint to remove failed jobs, then recreate them with jobs create endpoint and run the new ones."
    },
    "answer": "A",
    "question_vi": "Muốn tự động giám sát/rerun job qua Jobs API: liệt kê, tìm job fail và chạy lại. Chuỗi API nào đúng?",
    "options_vi": {
      "A": "jobs list -> jobs runs list kiểm tra trạng thái -> jobs run-now để rerun run fail.",
      "B": "jobs get lấy chi tiết, rồi jobs update để rerun.",
      "C": "jobs list, rồi jobs create job mới và run-now.",
      "D": "jobs cancel xóa job fail, tạo lại bằng jobs create rồi chạy."
    },
    "explanation_vi": "Quy trình chuẩn: liệt kê job, xem các run và trạng thái qua jobs runs list, rồi gọi run-now cho run bị fail.",
    "page": null,
    "image": "img/q_317.jpg"
  },
  {
    "id": 318,
    "topic": 1,
    "question": "A data engineering team is setting up deployment automation. To deploy workspace assets remotely using the Databricks CLI command, they\nmust configure it with proper authentication.\nWhich authentication approach will provide the highest level of security?",
    "options": {
      "A": "Use a service principal and its Personal Access Token",
      "B": "Use a service principal with OAuth token federation",
      "C": "Use a service principal ID and its OAuth client secret",
      "D": "Use a shared user account and its OAuth client secret"
    },
    "answer": "B",
    "question_vi": "Cấu hình Databricks CLI để deploy từ xa, cách xác thực bảo mật cao nhất là gì?",
    "options_vi": {
      "A": "Service principal + PAT.",
      "B": "Service principal với OAuth token federation.",
      "C": "Service principal ID + OAuth client secret.",
      "D": "Tài khoản dùng chung + OAuth client secret."
    },
    "explanation_vi": "Federated OAuth cho service principal giúp cấp token ngắn hạn, xoay vòng tự động, an toàn hơn PAT hay secret tĩnh.",
    "page": null,
    "image": "img/q_318.jpg"
  },
  {
    "id": 319,
    "topic": 1,
    "question": "A data engineer treated a daily batch ingestion pipeline using a cluster with the latest DBR version to store banking transaction data, and persisted\nit in a MANAGED DELTA table called prod.gold.all_banking_transactions_daily. The data engineer is constantly receiving complaints, from\nbusiness units that constantly read this table in an ad hoc way using a SOL Serverless Warehouse, regarding the poor performance of their\nqueries. Analyzing the queries, the data engineer slated that these areas use high cardinality columns as filters, to perform their analysis. The data\nengineer is studying possibilities to implement a data layout optimization technique for that table, which is incremental, easy to maintain, and can\neasily evolve over time.\nWhich command should the data engineer implement?",
    "options": {
      "A": "Alter the table to use Hive Style Partitions + Z-ORDER and implement a periodic OPTIMIZE command.",
      "B": "Alter the table to use Hive Style Partitions and implement a periodic OPTIMIZE command.",
      "C": "Alter the table to use Z-ORDER arid implement a periodic OPTIMIZE command.",
      "D": "Alter the table to use Liquid Clustering and implement a periodic OPTIMIZE command"
    },
    "answer": "D",
    "question_vi": "Bảng Delta prod.gold.all_banking_transactions_daily lọc theo cột cardinality cao, cần tối ưu bố cục ít bảo trì. Dùng lệnh nào?",
    "options_vi": {
      "A": "Chuyển Hive Style Partition + Z-ORDER và chạy OPTIMIZE định kỳ.",
      "B": "Chuyển Hive Style Partition và OPTIMIZE định kỳ.",
      "C": "Dùng Z-ORDER và OPTIMIZE định kỳ.",
      "D": "Dùng Liquid Clustering và OPTIMIZE định kỳ."
    },
    "explanation_vi": "Liquid Clustering tự quản lý layout theo clustering key, phù hợp cardinality cao và ít công bảo trì; kết hợp OPTIMIZE định kỳ để duy trì hiệu quả.",
    "page": null,
    "image": "img/q_319.jpg"
  },
  {
    "id": 320,
    "topic": 1,
    "question": "A data engineer is designing an append-only pipeline that needs to handle both batch and streaming data in Delta Lake. The team wants to ensure\nthat the streaming component can efficiently track which data has already been processed.\nWhich configuration should be set to enable this?",
    "options": {
      "A": "checkpointLocation",
      "B": "overwriteSchema",
      "C": "mergeSchema",
      "D": "partitionBy"
    },
    "answer": "A",
    "question_vi": "Pipeline append-only kết hợp batch + streaming Delta, cần theo dõi dữ liệu đã xử lý trong streaming. Cần cấu hình gì?",
    "options_vi": {
      "A": "checkpointLocation",
      "B": "overwriteSchema",
      "C": "mergeSchema",
      "D": "partitionBy"
    },
    "explanation_vi": "checkpointLocation lưu trạng thái offset/progress của stream, giúp biết phần nào đã xử lý và khôi phục chính xác.",
    "page": null,
    "image": "img/q_320.jpg"
  },
  {
    "id": 321,
    "topic": 1,
    "question": "A data engineer is implementing Unity Catalog governance for a multi-team environment. Data scientists need interactive clusters for basic data\nexploration tasks, while automated ETL jobs require dedicated processing.\nHow should the data engineer configure cluster isolation policies to enforce least privilege and ensure Unity Catalog compliance?",
    "options": {
      "A": "Configure all dusters with NO_ISOLATION_SHARED access modes since Unity Catalog works with any cluster configuration",
      "B": "Allow all users to create any duster type and rely on manual configuration to enable Unity Catalog access modes.",
      "C": "Create compute policies with STANDARD access mode for interactive 'workloads and dedicated access mode for automated jobs.",
      "D": "Use only DEDICATED access mode for both interactive workloads and automated jobs to maximize security isolation."
    },
    "answer": "C",
    "question_vi": "Thiết lập cluster isolation với Unity Catalog cho môi trường nhiều đội: DS cần cluster tương tác, ETL cần compute riêng. Cấu hình nào đúng?",
    "options_vi": {
      "A": "Tất cả dùng NO_ISOLATION_SHARED vì UC hỗ trợ mọi cấu hình.",
      "B": "Cho phép mọi người tạo bất kỳ cluster, cấu hình UC thủ công.",
      "C": "Tạo compute policy: STANDARD cho tác vụ tương tác, DEDICATED cho job tự động.",
      "D": "Tất cả dùng DEDICATED cho cả tương tác và job."
    },
    "explanation_vi": "Chính sách tách biệt: interactive dùng access mode STANDARD, job dùng DEDICATED để cô lập và tuân thủ UC (least privilege).",
    "page": null,
    "image": "img/q_321.jpg"
  },
  {
    "id": 322,
    "topic": 1,
    "question": "A data engineer, while designing a Pandas UDF to process financial time series data with complex calculations that require maintaining state\nacross rows within each stock symbol group must ensure the function is efficient and scalable.\nWhich approach will solve the problem with minimum overhead while preserving data integrity?",
    "options": {
      "A": "Use a SCALAR_ITER Pandas UDF with iterator-based processing, implementing state management through persistent storage (Delta tables)\nthat gets updated after each batch to maintain continuity across iterator chunks.",
      "B": "Use a GROUPED_AGG UPF that processes each stock symbol group independently, maintaining state through intermediate aggregation\nresults that get passed between successive UDF calls via broadcast variables.",
      "C": "Use a SCALAR Pandas UDF that processes the entire dataset at once, implementing custom partitioning logic within the UDF to group by\nstock symbol and maintain state using global variables shared across all executor processes.",
      "D": "Use ApplyInPandas method on spark dataframe that receives all rows for each stock symbol as a pandas DataFrame, allowing processing\nwithin each group while maintaining state variables local to each group’s processing function."
    },
    "answer": "D",
    "question_vi": "Thiết kế Pandas UDF xử lý chuỗi thời gian tài chính, cần giữ trạng thái theo từng mã cổ phiếu hiệu quả. Cách nào tối ưu?",
    "options_vi": {
      "A": "SCALAR_ITER UDF và lưu state ra Delta sau mỗi batch.",
      "B": "GROUPED_AGG UDF, truyền state qua broadcast giữa các lần gọi.",
      "C": "SCALAR UDF xử lý toàn bộ dataset, chia nhóm trong UDF và dùng biến global.",
      "D": "Dùng ApplyInPandas: mỗi nhóm cổ phiếu được truyền nguyên DataFrame, xử lý trong hàm với state cục bộ nhóm."
    },
    "explanation_vi": "ApplyInPandas giao toàn bộ dữ liệu của từng group, cho phép tính toán có trạng thái trong phạm vi nhóm mà không cần chia sẻ global, chi phí thấp hơn các workaround phức tạp.",
    "page": null,
    "image": "img/q_322.jpg"
  },
  {
    "id": 323,
    "topic": 1,
    "question": "A data engineer is developing an LDP pipeline using a Databricks notebook that is directly connected to their pipeline. After adding new table\ndefinitions and transformation logic in their notebook, they want to check for any syntax errors in the pipeline code without actually processing\nany data or running the pipeline.\nHow should the data engineer perform this syntax check?",
    "options": {
      "A": "Open the web terminal from the notebook and run a shell command to validate the pipeline code.",
      "B": "Disconnect the notebook from the pipeline and reconnect it to a compute cluster to access code validation features",
      "C": "Use the \"Validate\" option in the notebook to check for syntax errors.",
      "D": "Switch to a workspace file instead of a notebook to access the validation and diagnostics tools."
    },
    "answer": "C",
    "question_vi": "Muốn kiểm tra lỗi cú pháp pipeline gắn với notebook mà không chạy dữ liệu. Làm thế nào?",
    "options_vi": {
      "A": "Mở web terminal và chạy lệnh shell validate code.",
      "B": "Ngắt kết nối notebook khỏi pipeline rồi gắn vào cluster để có validation.",
      "C": "Dùng tùy chọn Validate trong notebook để kiểm tra cú pháp.",
      "D": "Chuyển sang workspace file để dùng công cụ chẩn đoán."
    },
    "explanation_vi": "Tính năng Validate của notebook cho phép kiểm tra cú pháp/missing config mà không thực thi pipeline.",
    "page": null,
    "image": "img/q_323.jpg"
  },
  {
    "id": 324,
    "topic": 1,
    "question": "A data engineering team is in the process of migrating off its legacy Hadcop platform. As part of the process, they are evaluating the different\nstorage formats to see which offers the best query performance. Their legacy platform utilizes ORC and RCFile formats. They converted a subset\nof their data to Delta Lake and ran a side-by-side benchmark, and found that their queries performed significantly better. Upon investigation, they\ndiscovered that the query plans were different, and the queries that read from the Delta Lake tables leveraged a Shuffle Hash\nJoin, whereas the legacy formats used Sort Merge Joins. The queries that read from the Delta Lake tables also read less data.\nWhich reason could be attributed to the difference in query performance?",
    "options": {
      "A": "The queries against the ORC tables leveraged the dynamic data skipping optimization but not the dynamic file pruning optimization.",
      "B": "The queries against the Delta Lake tables were able to leverage the dynamic file pruning optimization.",
      "C": "Delta Lake enables data skipping and file pruning using a vectorized Parquet reader.",
      "D": "Shuffle Hash Joins are always more efficient than Sort Merge Joins."
    },
    "answer": "B",
    "question_vi": "Benchmark Delta vs ORC/RCFile thấy Delta nhanh hơn và dùng Shuffle Hash Join + đọc ít data. Lý do nào hợp lý?",
    "options_vi": {
      "A": "ORC dùng data skipping động nhưng không dùng dynamic file pruning.",
      "B": "Delta tận dụng dynamic file pruning nên đọc ít file hơn.",
      "C": "Delta cho phép data skipping & file pruning nhờ vectorized Parquet reader.",
      "D": "Shuffle Hash Join luôn hiệu quả hơn Sort Merge Join."
    },
    "explanation_vi": "Delta lưu metadata giúp dynamic file pruning, cắt bớt file phải đọc nên query nhanh và kế hoạch có thể chọn Shuffle Hash Join.",
    "page": null,
    "image": "img/q_324.jpg"
  },
  {
    "id": 325,
    "topic": 1,
    "question": "A data team is automating a daily multitask ETL pipeline in Databricks. The pipeline includes a notebook for ingesting raw data, a Python wheel\ntask for data transformation, and a SQL query to update aggregates. They want to trigger the pipeline programmatically and see previous runs in\nthe GUI. They need to ensure tasks are retried on failure and stakeholders are notified by email if any task fails.\nWhich two approaches will meet these requirements? (Choose two.)",
    "options": {
      "A": "Trigger the job programmatically using the Databricks Jobs REST API (/jobs/run-now), the CLI (databricks jobs run-now), or one of the\nDatabricks SDKs.",
      "B": "Use Databricks Asset Bundles (DABs) to deploy the workflow, then trigger individual tasks directly by referencing each task’s notebook or\nscript path in the workspace.",
      "C": "Create a multi-task job using the UI, DABs, or the Jobs REST API (/jobs/create) with notebook, Python wheel, and SQL tasks. Configure\ntask-level retries and email notifications in the job definition.",
      "D": "Use the REST API endpoint /jobs/runs/submit to trigger each task individually as separate job runs and implement retries using custom\nlogic in the orchestrator.",
      "E": "Create a single notebook that uses dbutils.notebook.run() to call each step in sequence. Define a job on this orchestrator notebook and\nconfigure retries and notifications at the notebook level."
    },
    "answer": "A",
    "question_vi": "Pipeline ETL nhiều task (notebook, wheel, SQL) chạy hằng ngày, muốn trigger lập trình và xem lịch sử, có retry + email khi fail. Hai cách nào đáp ứng?",
    "options_vi": {
      "A": "Gọi Jobs REST /jobs/run-now, CLI hoặc SDK để kích hoạt job.",
      "B": "Dùng DAB deploy, rồi trigger từng task bằng đường dẫn workspace.",
      "C": "Tạo multi-task job (UI/DAB/API), cấu hình retry và email trong định nghĩa job.",
      "D": "Gọi /jobs/runs/submit cho từng task riêng và tự code retry.",
      "E": "Tạo notebook orchestration dùng dbutils.notebook.run rồi đặt job lên notebook đó."
    },
    "explanation_vi": "Đáp án gốc chọn A (trigger lập trình). Giải pháp chuẩn đủ yêu cầu còn bao gồm định nghĩa multi-task job với retry/email trong job spec (C).",
    "page": null,
    "image": "img/q_325.jpg"
  },
  {
    "id": 326,
    "topic": 1,
    "question": "A data engineer is designing a system to process batch patient encounter data stored in an S3 bucket, creating a Delta table (patient_encounters)\nwith columns encounter_id, patient_id, encounter_date, diagnosic_code, and treatment_cost. The table is queried frequently by patient_id and\nencounter_date, requiring fast performance. Fine grained access controls must be enforced. The engineer wants to minimize maintenance and\nboost performance.\nHow should the data engineer create the patient_encounters table?",
    "options": {
      "A": "Create an external table in Unity Catalog, specifying an S3 location for the data files. Enable predictive optimization through table\nproperties, and configure Unity Catalog permissions for access controls.",
      "B": "Create a managed table in Unity Catalog. Configure Unity Catalog permissions for access controls, schedule jobs to run OPTIMIZE and\nvacuum command daily to achieve best performance.",
      "C": "Create a managed table in Hive metastore. Configure Hive metastore permissions for access controls, and rely on predictive optimization\nto enhance query performance and simplify maintenance.",
      "D": "Create a managed table in Unity Catalog. Configure Unity Catalog permissions for access controls, and rely on predictive optimization to\nenhance query performance and simplify maintenance."
    },
    "answer": "D",
    "question_vi": "Thiết kế bảng patient_encounters trên S3, cần hiệu năng, kiểm soát truy cập chi tiết, ít bảo trì. Nên tạo bảng thế nào?",
    "options_vi": {
      "A": "External table trong Unity Catalog, bật predictive optimization, phân quyền UC.",
      "B": "Managed table trong UC, phân quyền UC, chạy OPTIMIZE & vacuum hàng ngày.",
      "C": "Managed table trong Hive metastore, dùng predictive optimization.",
      "D": "Managed table trong Unity Catalog, phân quyền UC, dựa vào predictive optimization để tối ưu và đơn giản bảo trì."
    },
    "explanation_vi": "Managed table trong Unity Catalog + predictive optimization đáp ứng quyền truy cập chi tiết và tự tối ưu, giảm việc vận hành so với tự chạy OPTIMIZE/vacuum.",
    "page": null,
    "image": "img/q_326.jpg"
  },
  {
    "id": 327,
    "topic": 1,
    "question": "A data engineer has a delta table order with deletion vectors enabled for it. The engineer is attempting to execute the below code:\nDELETE FROM orders WHERE status = 'cancelled'\nWhat should be the behaviour of deletion vectors when the command is executed?",
    "options": {
      "A": "Files are physically rewritten without the deleted row.",
      "B": "Rows are marked as deleted both in metadata and in files.",
      "C": "Rows are marked as deleted in metadata, not in files",
      "D": "Delta automatically removes all cancelled orders permanently."
    },
    "answer": "C",
    "question_vi": "Bảng Delta có deletion vectors. Khi chạy DELETE FROM orders WHERE status='cancelled' thì DV hoạt động sao?",
    "options_vi": {
      "A": "File được viết lại không chứa hàng bị xóa.",
      "B": "Hàng bị đánh dấu xóa trong metadata và cả file.",
      "C": "Hàng bị đánh dấu xóa trong metadata, không đụng vào file.",
      "D": "Delta tự xóa vĩnh viễn mọi đơn hàng cancelled."
    },
    "explanation_vi": "Deletion vector chỉ đánh dấu bản ghi cần bỏ qua ở metadata; file gốc giữ nguyên cho tới khi được vacuum/compaction.",
    "page": null,
    "image": "img/q_327.jpg"
  }
];
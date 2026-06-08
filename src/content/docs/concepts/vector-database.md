---
title: "Cơ sở dữ liệu Vector (Vector Database)"
category: "GenAI / Data Engineering"
difficulty: "Intermediate"
tags: ["vector-database", "genai", "embedding", "rag", "similarity-search"]
readingTime: "12 mins"
lastUpdated: 2026-06-08
seoTitle: "Cơ sở dữ liệu Vector (Vector Database) là gì? Giải thích chi tiết"
metaDescription: "Tìm hiểu kiến trúc Cơ sở dữ liệu Vector, embeddings, thuật toán tìm kiếm tương đồng (ANN, HNSW) và ứng dụng trong xây dựng hệ thống RAG cho GenAI."
---

# Cơ sở dữ liệu Vector - Vector Database

## Summary

**Cơ sở dữ liệu Vector (Vector Database / Vector Store)** là một hệ thống lưu trữ và truy vấn chuyên biệt được thiết kế để xử lý dữ liệu dưới dạng vector đa chiều (vector embeddings). Khác với các hệ quản trị cơ sở dữ liệu truyền thống tìm kiếm dựa trên khớp chuỗi chính xác (exact keyword match), Vector Database cho phép tìm kiếm dữ liệu dựa trên **sự tương đồng về mặt ngữ nghĩa (semantic similarity)**, làm cho nó trở thành xương sống của các ứng dụng AI tạo sinh (GenAI), hệ thống khuyến nghị (recommendation systems) và kiến trúc RAG.

---

## Definition

Một **Vector Database** là một loại cơ sở dữ liệu được sinh ra để lưu trữ các **Embeddings** — các mảng số thực dài đại diện cho các đặc trưng (features) và ngữ nghĩa của văn bản, hình ảnh, âm thanh hoặc dữ liệu phi cấu trúc khác. 

Thay vì sử dụng các câu lệnh SQL truyền thống với toán tử `=`, `LIKE` để tìm dữ liệu, cơ sở dữ liệu vector sử dụng các phép toán tính toán khoảng cách trong không gian toán học (như Cosine Similarity, L2 Distance/Euclidean, hoặc Dot Product) kết hợp với các thuật toán lập chỉ mục lân cận gần nhất gần đúng (Approximate Nearest Neighbor - ANN) để truy xuất dữ liệu một cách nhanh chóng với độ trễ tính bằng mili-giây, ngay cả trên quy mô hàng tỷ vector.

---

## Why it exists

Với sự bùng nổ của Deep Learning và Mô hình Ngôn ngữ Lớn (LLMs), phần lớn dữ liệu được sinh ra và xử lý là dữ liệu phi cấu trúc.
1. **Giới hạn của CSDL Relational / Text Search**: Cơ sở dữ liệu quan hệ (PostgreSQL, MySQL) hay cỗ máy tìm kiếm văn bản (Elasticsearch với BM25) rất xuất sắc trong việc tìm từ khóa chính xác. Tuy nhiên, chúng không hiểu được ngữ nghĩa. Ví dụ: tìm kiếm "chó con" sẽ không bao giờ trả về "cún yêu" nếu không có từ điển đồng nghĩa (synonyms) được định nghĩa sẵn thủ công.
2. **Khó khăn trong tính toán khoảng cách vector quy mô lớn**: Để tìm vector giống nhất với một truy vấn trong 1 triệu vector, cách đơn giản nhất là tính khoảng cách với toàn bộ 1 triệu vector đó (k-Nearest Neighbors - KNN). Phương pháp brute-force này quá chậm `O(N)` và không thể scale.
3. **Quản lý Vòng đời dữ liệu (Data Lifecycle)**: Các thư viện tìm kiếm vector in-memory (như FAISS) rất nhanh nhưng không có tính chất của một database thực thụ (ACID, CRUD, persistent storage, distributed clustering, role-based access).

Vector Database ra đời để giải quyết các rào cản trên, cung cấp một hệ thống vừa có khả năng tìm kiếm ngữ nghĩa siêu tốc (thông qua ANN), vừa đảm bảo các tiêu chuẩn quản trị dữ liệu ở cấp độ doanh nghiệp (enterprise-grade).

---

## Core idea

Nguyên lý cốt lõi của Vector Database xoay quanh 3 khái niệm:
* **Embeddings**: Quá trình chuyển đổi dữ liệu (văn bản, hình ảnh) thành các vector số học thông qua một mô hình Neural Network (ví dụ: `text-embedding-3-small` của OpenAI). Các đối tượng có ý nghĩa tương đồng sẽ nằm gần nhau trong không gian vector.
* **Vector Indexing (Lập chỉ mục)**: Sử dụng các cấu trúc dữ liệu đồ thị hoặc cây để tạo "bản đồ" cho không gian vector, phổ biến nhất là thuật toán **HNSW** (Hierarchical Navigable Small World) hoặc **IVF** (Inverted File Index). Indexing đánh đổi một lượng nhỏ độ chính xác (accuracy) để lấy tốc độ truy vấn (speed).
* **Distance Metrics (Đo lường khoảng cách)**: Các hàm toán học xác định độ gần gũi giữa hai vector:
  * *Cosine Similarity*: Đo góc giữa hai vector (phổ biến nhất cho NLP).
  * *L2 (Euclidean Distance)*: Khoảng cách đường thẳng trực tiếp.
  * *Dot Product*: Tích vô hướng, tính cả độ lớn và góc.

---

## How it works

Luồng xử lý (Data Flow) trong một hệ thống ứng dụng Vector Database gồm hai quá trình chính:

**1. Giai đoạn Ingestion (Ghi dữ liệu):**
1. Ứng dụng đọc dữ liệu phi cấu trúc (ví dụ: các tài liệu PDF).
2. Dữ liệu được chia nhỏ thành các đoạn (Chunking).
3. Các đoạn văn bản được gửi qua một Embedding Model (như BERT, OpenAI Embeddings) để biến thành các ma trận số thực đa chiều.
4. Các vector này cùng với siêu dữ liệu (metadata như ID tài liệu, thời gian, tác giả) được lưu vào Vector Database. Quá trình Indexing được kích hoạt để tổ chức lại dữ liệu tối ưu cho tìm kiếm.

**2. Giai đoạn Query (Truy vấn / Tìm kiếm):**
1. Người dùng nhập câu hỏi (Query).
2. Câu hỏi này phải được mã hóa thành vector bằng **cùng một Embedding Model** đã dùng ở bước Ingestion.
3. Vector truy vấn được gửi đến Vector Database.
4. Vector DB sử dụng thuật toán ANN quét qua index và trả về top K vector gần nhất kèm theo metadata hoặc văn bản gốc.

---

## Practical example

Xét hệ thống hỏi đáp (RAG) về sổ tay nhân viên nội bộ:

**Bước 1: Lưu trữ dữ liệu**
* Đoạn văn: *"Nhân viên được nghỉ phép năm 12 ngày có lương."*
* Qua Embedding Model sinh ra vector 1536 chiều: `[0.12, -0.05, 0.88, ...]`
* Lưu vào Vector DB (như Pinecone, Milvus hoặc Qdrant) với metadata `{"department": "HR", "doc_type": "policy"}`.

**Bước 2: Tìm kiếm ngữ nghĩa**
* Câu hỏi người dùng: *"Tôi có bao nhiêu ngày nghỉ ốm và nghỉ phép?"*
* Câu hỏi được chuyển thành vector: `[0.10, -0.04, 0.85, ...]`
* Vector DB tính toán Cosine Similarity và thấy khoảng cách góc rất nhỏ (độ tương đồng cao, ví dụ `0.92`), dù câu hỏi không chứa chính xác cụm từ "có lương" hay "nhân viên".
* Vector DB trả về đoạn văn bản gốc ở Bước 1.

---

## Best practices

* **Lọc trước/Lọc sau (Metadata Filtering)**: Vector DB rất giỏi tìm kiếm tương đồng, nhưng sẽ kém hiệu quả nếu tìm kiếm kết hợp điều kiện chính xác (ví dụ: tìm văn bản giống câu X *nhưng* chỉ trong năm 2023). Hãy sử dụng Vector DB hỗ trợ tốt tính năng Hybrid Search kết hợp metadata filtering ở cấp độ Index (Pre-filtering) để tăng độ chính xác.
* **Chuẩn hóa Vectors (Normalization)**: Nếu dùng Cosine Similarity, hãy chuẩn hóa các vector về độ dài 1 (L2 normalization) trước khi đưa vào CSDL. Khi đó tính Cosine Similarity sẽ tương đương với Dot Product, vốn tính toán bằng phần cứng tối ưu và nhanh hơn.
* **Chọn đúng Embedding Model**: Chất lượng của kết quả tìm kiếm Vector Database phụ thuộc 90% vào Embedding Model. Vector DB chỉ đo khoảng cách, nếu mô hình tạo ra các vector tồi, kết quả sẽ tồi ("Garbage in, garbage out"). Đừng đổi mô hình embedding sau khi đã lưu trữ mà không re-index lại toàn bộ dữ liệu.
* **Quản lý Chunk Size**: Văn bản quá dài sẽ làm loãng (dilute) ý nghĩa của vector. Chia nhỏ văn bản (chunking) theo câu hoặc đoạn ngắn là bắt buộc.

---

## Common mistakes

* **Sử dụng FAISS/Chroma in-memory cho Production**: Sử dụng các thư viện chạy cục bộ trong bộ nhớ cho hệ thống yêu cầu tính sẵn sàng cao (High Availability), thay vì dùng các Vector DB thực thụ (managed services hoặc distributed clusters).
* **Quên lưu Metadata**: Chỉ lưu vector mà quên lưu lại văn bản gốc hoặc các ID tham chiếu. Khi truy vấn ra vector tương đồng, hệ thống không biết đoạn văn bản đó là gì để hiển thị cho người dùng.
* **Nhầm lẫn Exact Search và ANN**: Cố gắng dùng Vector DB để đếm số lượng bản ghi (Count) hoặc gom nhóm (Group By) chính xác - những tác vụ thuộc về cơ sở dữ liệu quan hệ truyền thống.

---

## Trade-offs

### Ưu điểm
* **Hiểu ngữ nghĩa (Semantic Understanding)**: Tìm kiếm dựa trên ý nghĩa, vượt qua rào cản về từ vựng, lỗi chính tả hay cách diễn đạt.
* **Tốc độ cực nhanh trên quy mô cực lớn**: Lập chỉ mục ANN (như HNSW) cho phép tìm kiếm trong thời gian sub-millisecond trên kho dữ liệu hàng trăm triệu vector.
* **Đa phương tiện (Multimodal)**: Cùng một không gian vector có thể biểu diễn cả hình ảnh và văn bản (ví dụ mô hình CLIP), cho phép tìm hình ảnh bằng văn bản.

### Nhược điểm
* **Tiêu tốn bộ nhớ RAM/Memory**: Hầu hết các thuật toán Indexing Vector (đặc biệt HNSW) yêu cầu lưu trữ index hoàn toàn trên RAM để đảm bảo tốc độ. Điều này khiến chi phí hạ tầng (infrastructure cost) rất đắt đỏ so với việc lưu trữ đĩa thông thường.
* **Black box (Hộp đen)**: Rất khó giải thích (explainability) tại sao văn bản A lại được cho là giống văn bản B vì không gian vector đa chiều nằm ngoài khả năng trực quan của con người.
* **Khó cập nhật (Update/Delete)**: Trong các cấu trúc đồ thị (như HNSW), việc xóa hoặc cập nhật một vector có thể yêu cầu tái cấu trúc lại một phần lớn đồ thị, gây tốn tài nguyên xử lý (write penalty).

---

## When to use

* Xây dựng kiến trúc RAG (Retrieval-Augmented Generation) cho LLMs.
* Xây dựng hệ thống khuyến nghị (Recommendation Engines) dưa trên nội dung hoặc hành vi người dùng (đã được embedding hóa).
* Xây dựng công cụ tìm kiếm nội bộ công ty (Enterprise Search) yêu cầu hiểu biết ngữ cảnh phức tạp.
* Ứng dụng nhận diện, tìm kiếm hình ảnh (Image/Video similarity search).

## When not to use

* Bài toán chỉ cần tìm kiếm từ khóa chính xác tuyệt đối (SKU sản phẩm, mã số chứng minh nhân dân, email). Trong trường hợp này PostgreSQL hoặc Elasticsearch cơ bản là đủ.
* Ứng dụng thiên về xử lý giao dịch tài chính (OLTP), yêu cầu tính toán logic kế toán hoặc aggregation phức tạp.

---

## Related concepts

* [RAG (Retrieval-Augmented Generation)](/concepts/rag)
* [Hybrid Search](/concepts/hybrid-search)
* [Large Language Model (LLM)](/concepts/llm)

---

## Interview questions

### 1. Sự khác biệt giữa KNN và ANN trong cơ sở dữ liệu vector là gì? Tại sao các Vector DB lại ưu tiên ANN?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết nền tảng về thuật toán đằng sau hệ thống tìm kiếm vector.
* **Gợi ý trả lời (Strong Answer)**: 
  * KNN (k-Nearest Neighbors) tính toán khoảng cách từ vector truy vấn đến *tất cả* các vector trong tập dữ liệu để tìm ra K kết quả gần nhất. Độ phức tạp là `O(N)`, chậm và không khả thi khi N > 1 triệu.
  * ANN (Approximate Nearest Neighbor) sử dụng các cấu trúc dữ liệu như đồ thị (HNSW) hoặc phân cụm (IVF) để khoanh vùng và chỉ tìm kiếm trong một phạm vi hẹp các vector có khả năng cao là gần nhất. Độ phức tạp giảm xuống mức logarit. 
  * *Lý do chọn ANN*: Trong thực tế doanh nghiệp, tốc độ và khả năng mở rộng (scalability) quan trọng hơn độ chính xác tuyệt đối 100%. Đánh đổi 1-2% độ chính xác để lấy tốc độ nhanh hơn hàng nghìn lần là một trade-off bắt buộc.
* **Lỗi cần tránh (Weak Answer)**: Không nhắc tới việc ANN là thuật toán "gần đúng" (Approximate) và sự đánh đổi giữa Recall/Accuracy và Speed.

### 2. Thuật toán HNSW (Hierarchical Navigable Small World) hoạt động như thế nào ở mức cơ bản?
* **Người phỏng vấn muốn kiểm tra**: Kiến thức sâu về cấu trúc index phổ biến nhất của Vector DB hiện nay.
* **Gợi ý trả lời (Strong Answer)**: HNSW kết hợp hai ý tưởng: cấu trúc lớp (như Skip-list) và đồ thị thế giới nhỏ (Navigable Small World). Các vector được tổ chức thành nhiều layer đồ thị phân tầng. Ở layer cao nhất, đồ thị có rất ít điểm (nodes) và các điểm cách xa nhau. Các layer thấp dần có mật độ điểm dày đặc hơn. Khi truy vấn, thuật toán đi từ layer trên cùng, nhảy nhanh đến khu vực gần vector đích, sau đó dần dần đi xuống các layer dưới để tinh chỉnh và tìm ra vector gần nhất một cách cực kỳ hiệu quả mà không phải quét toàn bộ mặt phẳng.

### 3. Bạn sẽ xử lý vấn đề Pre-filtering vs Post-filtering kết hợp Metadata trong Vector DB như thế nào?
* **Người phỏng vấn muốn kiểm tra**: Kinh nghiệm giải quyết bài toán Hybrid search và các điểm nghẽn (bottleneck) phổ biến trong thực tế.
* **Gợi ý trả lời (Strong Answer)**:
  * *Post-filtering*: Tìm top K vector bằng ANN trước, sau đó lọc metadata. Vấn đề là nếu điều kiện metadata quá khắt khe, top K có thể bị loại bỏ hết (trả về 0 kết quả).
  * *Pre-filtering*: Lọc metadata trước, sau đó tìm ANN trên tập con. Vấn đề là tập con bị thay đổi liên tục khiến đồ thị ANN ban đầu không còn tối ưu, dẫn đến độ chính xác kém.
  * *Giải pháp thực tế*: Các Vector DB hiện đại (như Milvus, Qdrant) sử dụng **Single-stage filtering** (lọc trực tiếp trong quá trình duyệt đồ thị HNSW) hoặc có cơ chế tự động cân bằng giữa Pre/Post filter dựa trên bộ tối ưu hóa truy vấn (Query Optimizer) và Cardinality Estimation của metadata.
* **Lỗi cần tránh**: Trả lời ngây ngô rằng chỉ cần dùng lệnh WHERE trong SQL là xong.

---

## References

1. **"Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs"** - Malkov, Yashunin (2018) (Paper gốc về HNSW).
2. **Pinecone Learn** (Tài liệu học thuật xuất sắc từ Pinecone về Vector Databases và ANN).
3. **Milvus Documentation** - System Architecture (Tài liệu chi tiết về kiến trúc phân tán của một Vector Database cấp doanh nghiệp).

---

## English summary

A **Vector Database** is a specialized database system engineered to store, index, and query high-dimensional vector representations (embeddings) of unstructured data such as text, images, or audio. Unlike traditional relational databases that rely on exact keyword matching, vector databases utilize **Approximate Nearest Neighbor (ANN)** algorithms (like HNSW or IVF) and distance metrics (Cosine Similarity, L2) to perform rapid **semantic similarity searches**. This capability allows systems to find conceptually related information even if the exact terminology differs, making vector databases a foundational infrastructure component for Retrieval-Augmented Generation (RAG) applications, large language models (LLMs), and modern recommendation engines.

---
title: "Tái sắp xếp kết quả - Reranking"
difficulty: "Intermediate"
tags: ["reranking", "retrieval", "rag", "search-engine", "hybrid-search"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Reranking là gì? Tối ưu hóa hệ thống Search và RAG với Two-stage Retrieval"
metaDescription: "Khám phá chi tiết về Reranking (Tái sắp xếp kết quả): Quy trình Two-stage Retrieval, Cross-Encoder, Reciprocal Rank Fusion (RRF), LLM Reranker và cách áp dụng vào RAG."
description: "Khi xây dựng các hệ thống tìm kiếm thông tin lớn hoặc các ứng dụng RAG (Retrieval-Augmented Generation), việc lấy được những kết quả chính xác nhất là một thách thức lớn. Reranking chính là chìa khóa giải quyết vấn đề này với các phương pháp từ Machine Learning đến Deep Learning."
---

Reranking (Tái sắp xếp kết quả) là bước sàng lọc thứ hai vô cùng quan trọng trong các hệ thống tìm kiếm hiện đại và đường ống Retrieval-Augmented Generation (RAG). Thay vì tin tưởng hoàn toàn vào thuật toán tìm kiếm ban đầu (thường ưu tiên tốc độ xử lý trên tập dữ liệu lớn bằng cách đánh đổi độ chính xác tuyệt đối), hệ thống Reranking sẽ cẩn thận chấm điểm lại top các kết quả tiềm năng nhất bằng một mô hình Machine Learning đắt đỏ và tinh vi hơn. Mục tiêu tối thượng của Reranking là đẩy các kết quả phù hợp nhất lên vị trí top đầu, tối ưu hóa độ chính xác (Precision) và cải thiện mạnh mẽ trải nghiệm người dùng.

## Kiến trúc Two-Stage Retrieval (Truy xuất hai giai đoạn)



Trong thực tế, kho dữ liệu của một doanh nghiệp có thể lên tới hàng triệu hoặc hàng tỷ tài liệu. Việc áp dụng ngay một mô hình AI phức tạp để so sánh câu truy vấn (Query) với từng tài liệu trong cơ sở dữ liệu khổng lồ là bất khả thi về mặt toán học cũng như thời gian xử lý (Latency). Do đó, kiến trúc **Two-Stage Retrieval** ra đời như một chuẩn mực công nghiệp.

```mermaid
graph TD
    A["User Query"] --> B["Stage 1: Initial Retrieval"]
    subgraph stage1 ["Giai đoạn 1: Ưu tiên Tốc độ và Recall"]
    B -->|Vector Search / BM25| C["("Document Database 1M+ Docs")"]
    C -->|Top 100 Docs| D["Candidate Set"]
    end
    
    D --> E["Stage 2: Reranking"]
    subgraph stage2 ["Giai đoạn 2: Ưu tiên Độ chính xác"]
    E -->|Cross-Encoder / LTR / RRF| F["Scoring & Sorting"]
    end
    
    F -->|Top 5-10 Docs| G["Final Results / LLM Context"]
```

1. **Stage 1 - Retrieval (Truy xuất ban đầu):** Nhiệm vụ của bước này là rà soát nhanh kho dữ liệu trong thời gian phần nghìn giây để lấy ra một tập hợp các ứng viên (Candidate Set). Hệ thống thường dùng **Bi-Encoder** (Vector Search bằng Cosine Similarity) hoặc **BM25** (Lexical/Keyword Search) kết hợp với các chỉ mục Approximate Nearest Neighbor (ANN) như HNSW hay FAISS. Vì ưu tiên tốc độ, bước này đánh giá độc lập từng tài liệu với câu truy vấn, do đó thường mắc lỗi bỏ qua sự tương tác từ vựng phức tạp, cấu trúc ngữ pháp sâu xa hoặc các từ phủ định.
2. **Stage 2 - Reranking (Tái sắp xếp):** Đầu vào của bước này chỉ là một tập hợp nhỏ các tài liệu xuất sắc nhất từ Stage 1 (thường từ 50 đến 150 tài liệu). Do số lượng ít, ta có đủ thời gian và ngân sách tài nguyên GPU/CPU để áp dụng các mô hình tính toán nặng (như **Cross-Encoder** hoặc **Learning to Rank**), đánh giá trực tiếp mối quan hệ ngữ nghĩa chi tiết của từng cặp `(Query, Document)`, qua đó loại bỏ các kết quả "trông có vẻ giống nhưng thực chất không liên quan" (False Positives).

---

## Phân tích sâu các phương pháp Reranking phổ biến

Hệ sinh thái Reranking rất đa dạng, bao gồm các thuật toán dựa trên heuristics toán học, các mô hình học máy truyền thống cho đến các mô hình ngôn ngữ học sâu khổng lồ.

### 1. Cross-Encoder (Deep Learning Reranking)

Trái ngược với Bi-Encoder (embed câu hỏi và tài liệu hoàn toàn độc lập thành hai vector rồi mới tính toán khoảng cách), mô hình **Cross-Encoder** ghép chung câu truy vấn và tài liệu thành một chuỗi văn bản duy nhất: `[CLS] Query [SEP] Document [SEP]`. Sau đó, toàn bộ chuỗi này được đưa qua kiến trúc mạng Transformer (ví dụ: BERT, RoBERTa, DeBERTa).

Cơ chế **Self-Attention** đặc trưng của Transformer cho phép mỗi từ (token) trong câu truy vấn "chú ý" (attend) và tương tác trực tiếp với từng từ trong tài liệu ở nhiều tầng mạng (layers) khác nhau. Điều này giúp mô hình nắm bắt được ngữ cảnh cực kỳ sâu sắc, ví dụ như từ đồng nghĩa, cấu trúc câu phức tạp, sự tương quan đại từ, hoặc cách diễn đạt phủ định.

* **Ưu điểm:** Cung cấp độ chính xác (Accuracy/Precision) cao nhất trong các phương pháp, giải quyết triệt để các hạn chế về đối sánh ngữ nghĩa mà Vector Search gặp phải.
* **Nhược điểm:** Tốc độ suy luận (Inference) rất chậm và tốn nhiều tài nguyên GPU. Thời gian tính toán tăng tuyến tính $O(N)$ theo số lượng tài liệu cần Rerank. Không thể lưu trữ trước (pre-compute) các Embeddings giống như Bi-Encoder.
* **Mô hình phổ biến:** `BAAI/bge-reranker-v2-m3` (Hỗ trợ đa ngôn ngữ bao gồm Tiếng Việt), `cross-encoder/ms-marco-MiniLM-L-6-v2`.

**Ví dụ Code với thư viện `sentence-transformers`:**

```python
from sentence_transformers import CrossEncoder

# Khởi tạo mô hình Cross-Encoder đã được pre-trained trên tập dữ liệu MS MARCO
model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

query = "Làm thế nào để gia hạn hộ chiếu?"
documents = [
    "Bài viết này hướng dẫn chi tiết các bước nộp hồ sơ xin cấp mới hộ chiếu cho trẻ em.",
    "Bạn có thể gia hạn hộ chiếu trực tuyến thông qua cổng dịch vụ công quốc gia với 5 bước đơn giản sau đây.",
    "Hộ chiếu là giấy tờ thuộc quyền sở hữu của Nhà nước, do cơ quan có thẩm quyền của Việt Nam cấp cho công dân."
]

# Tạo các cặp (Query, Document) để chuẩn bị đầu vào cho Transformer
pairs = [[query, doc] for doc in documents]

# Tính điểm liên quan (Relevance Scores) bằng cách forward pass qua mạng neural
scores = model.predict(pairs)

# Kết hợp điểm số và in kết quả từ cao xuống thấp
ranked_docs = sorted(zip(scores, documents), reverse=True)
print(f"Query: {query}\n" + "-"*40)
for score, doc in ranked_docs:
    print(f"Score: {score:.4f} | Document: {doc}")
```

### 2. Reciprocal Rank Fusion (RRF)

**Reciprocal Rank Fusion (RRF)** là một thuật toán chấm điểm không yêu cầu bất kỳ mô hình Machine Learning bổ sung nào. Thuật toán này tỏa sáng rực rỡ trong các kiến trúc **Hybrid Search**, nơi bạn cần dung hòa kết quả từ nhiều engine truy xuất khác nhau (thường là kết hợp giữa thuật toán Sparse như BM25 để tìm chính xác từ khóa và Dense/Vector Search để tìm ý nghĩa tương đồng).

Công thức toán học của RRF gán một điểm số mới cho từng tài liệu dựa trên vị trí (rank) của nó ở từng danh sách kết quả ban đầu:

$$ RRF\_Score(d) = \sum_{r \in R} \frac{1}{k + rank_r(d)} $$

Trong đó:
- $d$ là tài liệu đang xét.
- $R$ là tập hợp các danh sách kết quả (ví dụ: Danh sách từ BM25, Danh sách từ Semantic Search).
- $rank_r(d)$ là thứ hạng (vị trí 1, 2, 3...) của tài liệu $d$ trong danh sách $r$. Nếu tài liệu không xuất hiện, rank được coi là dương vô cùng (nghĩa là cộng thêm 0 điểm).
- $k$ là một hằng số làm mượt (smoothing constant), nghiên cứu gốc đề xuất $k = 60$ là giá trị tối ưu nhất. Nó giúp giảm bớt sự thống trị tuyệt đối của các tài liệu vô tình giữ top 1 ở một danh sách nhưng hoàn toàn vắng mặt (chất lượng kém) ở danh sách khác.

* **Ưu điểm:** Tính toán cực kỳ nhanh, độ trễ gần như bằng không. Rất dễ triển khai trực tiếp bằng SQL hoặc các query trên database (Elasticsearch, PostgreSQL `pgvector`, Azure AI Search đều hỗ trợ RRF built-in). Thực nghiệm cho thấy RRF mang lại kết quả xếp hạng rất ổn định và vượt trội hơn so với việc cố gắng chuẩn hóa (normalize) khoảng cách điểm số thô.
* **Nhược điểm:** Mất đi thông tin về khoảng cách tuyệt đối. Hệ thống không biết được tài liệu top 1 tốt hơn tài liệu top 2 bao nhiêu, mà chỉ biết là nó đứng trước.

### 3. Machine Learning truyền thống: Learning to Rank (LTR)

Trong các nền tảng thương mại điện tử lớn hoặc Search Engine (như Google, Bing), Reranking thường được giải quyết bằng bài toán **Learning to Rank (LTR)** thông qua các thuật toán Tree-based như **XGBoost, LightGBM, hoặc CatBoost**.

Phương pháp này trích xuất hàng loạt các "Đặc trưng" (Features) khác nhau để làm đầu vào cho mô hình:
- **Features văn bản:** Điểm BM25, TF-IDF, Cosine Similarity, Jaccard Similarity.
- **Features tài liệu:** Độ dài văn bản, PageRank, độ tươi mới (Recency/Ngày đăng bài), số lượng đánh giá (Review count), uy tín tác giả.
- **Features tương tác người dùng (Clickstream data):** Tỷ lệ Click-through rate (CTR), thời gian xem trang (Dwell time), tỷ lệ thoát (Bounce rate).

* **Ưu điểm:** Khả năng kết hợp dữ liệu hành vi người dùng cực kỳ mạnh mẽ. Rất phù hợp với bài toán E-commerce (ví dụ tìm sản phẩm trên Tiki, Shopee) vì có thể tối ưu hóa cho tỷ lệ chuyển đổi (Conversion Rate).
* **Nhược điểm:** Phức tạp trong việc thiết kế và quản lý Pipeline dữ liệu (Feature Engineering). Cần thu thập dữ liệu nhãn tay (Human-labeled data) hoặc logs hệ thống rất lớn.

### 4. LLM as a Reranker (Sử dụng LLM để xếp hạng)

Sự bùng nổ của các Mô hình Ngôn ngữ Lớn (LLM) đa năng như GPT-4, Claude 3.5, hoặc Gemini mang lại một hướng đi mới: Trực tiếp yêu cầu LLM chấm điểm độ liên quan bằng văn bản thuần túy. Bằng việc thiết kế các kỹ thuật Prompt Engineering, chúng ta biến LLM thành một chuyên gia đánh giá nội dung.

Có hai kỹ thuật chính:
- **Point-wise LLM Scoring:** Cung cấp cho LLM câu truy vấn và 1 tài liệu duy nhất, yêu cầu LLM phân tích và trả về một điểm số từ 1 đến 10 kèm theo lý do chấm điểm (Chain of Thought).
- **List-wise LLM Ranking (Ví dụ: RankGPT):** Cung cấp cho LLM câu truy vấn và toàn bộ danh sách 20 tài liệu cùng lúc. Yêu cầu mô hình suy luận và trả về thứ tự xếp hạng lý tưởng (ví dụ output: `[Doc 4, Doc 1, Doc 15, Doc 3...]`).

* **Ưu điểm:** Độ tùy biến không giới hạn. Bạn có thể chèn thêm các quy tắc kinh doanh (Business Rules) phức tạp vào Prompt (ví dụ: "Luôn ưu tiên các bài báo y khoa xuất bản sau năm 2023", "Phạt điểm nặng các tài liệu vi phạm chính sách nội dung"). Khả năng giải thích (Explainability) rất rõ ràng do LLM có thể trả lời tại sao tài liệu này đáng xếp thứ nhất.
* **Nhược điểm:** Chi phí Token API cực kỳ lớn khi chạy ở quy mô Production. Độ trễ (Latency) có thể lên tới vài giây, gây ảnh hưởng đến trải nghiệm người dùng theo thời gian thực. Bị ràng buộc nghiêm ngặt bởi giới hạn Context Window.

### 5. API Rerankers Thương mại (Cohere, Jina)

Nhiều công ty AI hiện nay đã đóng gói các mô hình Reranking phức tạp thành dịch vụ API trả phí. Các mô hình này được huấn luyện chuyên biệt trên tập dữ liệu khổng lồ đa ngôn ngữ và được tinh chỉnh để tối ưu hóa thời gian xử lý.

**Ví dụ thực tế tích hợp Cohere Rerank API:**

```python
import cohere

# Khởi tạo client Cohere
co = cohere.Client('YOUR_API_KEY')

query = "Chính sách bảo hành sản phẩm điện tử tại cửa hàng"
docs = [
    "Tất cả sản phẩm điện tử, bao gồm điện thoại và laptop, được bảo hành chính hãng 12 tháng kể từ ngày xuất hóa đơn.",
    "Khách hàng mua quần áo và phụ kiện thời trang được hỗ trợ đổi size trong vòng 7 ngày nếu còn nguyên tem mác.",
    "Để yêu cầu bảo hành đồ điện tử, khách hàng vui lòng mang theo thiết bị và hóa đơn mua hàng đến trung tâm dịch vụ khách hàng."
]

# Gọi API Rerank của Cohere
results = co.rerank(
    model="rerank-multilingual-v3.0", # Sử dụng mô hình đa ngôn ngữ v3.0, hỗ trợ tiếng Việt rất tốt
    query=query,
    documents=docs,
    top_n=2 # Chỉ yêu cầu trả về 2 kết quả tốt nhất
)

print(f"Query: {query}\n")
for hit in results.results:
    print(f"Rank {hit.index} - Score: {hit.relevance_score:.4f}")
    print(f"Text: {docs[hit.index]}")
    print("-" * 50)
```

---

## Ứng dụng và Lợi ích Cốt lõi trong Kiến trúc RAG

Trong các hệ thống **Retrieval-Augmented Generation (RAG)** hiện đại, Reranking không chỉ là một tính năng "có thì tốt" (nice-to-have), mà là một lớp phòng ngự (gatekeeper) cực kỳ quan trọng trước khi ngữ cảnh được nạp vào phần Generation của LLM.

1. **Khắc phục triệt để hiện tượng "Lost in the Middle" (Lạc lối giữa dòng):**
   Các nghiên cứu hàn lâm (như bài báo của Liu et al., 2023) đã chứng minh rằng các LLM gặp khó khăn nghiêm trọng trong việc chú ý và trích xuất thông tin nằm ở đoạn giữa của một Prompt quá dài (U-shaped performance curve). LLM thường chỉ xử lý tốt phần mở đầu và phần kết thúc. Việc nhồi nhét ngây thơ 20 tài liệu thô vào Prompt sẽ làm suy giảm năng lực suy luận của mô hình. Reranking giúp hệ thống chắt lọc vô cùng gắt gao và chỉ giữ lại 3 đến 5 tài liệu "tinh túy" và sát sườn nhất.

2. **Tiết kiệm Chi phí API & Mở rộng Context Window hiệu quả:**
   Việc giảm số lượng tài liệu đầu vào nhờ Reranking sẽ làm giảm đáng kể lượng Token Context. Với các dự án RAG thương mại sử dụng API tính phí theo Token (như OpenAI GPT-4o, Anthropic Claude 3.5), điều này đồng nghĩa với việc cắt giảm 60-80% chi phí vận hành cho mỗi truy vấn, đồng thời giảm thiểu độ trễ trả lời (Time-to-first-token).

3. **Giảm thiểu Hallucination (Ảo giác AI / Bịa đặt thông tin):**
   Chất lượng văn bản sinh ra của RAG phụ thuộc trực tiếp vào chất lượng nền tảng kiến thức được cung cấp (Nguyên lý "Garbage in, garbage out"). Bằng cách loại trừ hiệu quả các tài liệu nhiễu (noise) chứa thông tin sai lệch, lỗi thời hoặc không liên quan qua lớp lưới Reranking, mô hình sinh văn bản bị ép buộc phải neo vào những cơ sở dữ liệu chất lượng cao, từ đó tỷ lệ bịa đặt câu trả lời được kiểm soát một cách đáng kinh ngạc.

---

## Các Chỉ số Đánh giá (Evaluation Metrics) cho Reranking

Để đánh giá khoa học và định lượng hiệu năng của hệ thống Reranking, các Kỹ sư AI thường sử dụng các chỉ số phổ biến trong lĩnh vực Information Retrieval:

- **MRR (Mean Reciprocal Rank):** Tập trung đo lường vị trí của tài liệu *liên quan đầu tiên* xuất hiện trong danh sách. Nếu tài liệu chuẩn xác xuất hiện ở vị trí số 1, điểm là 1. Nếu nó nằm ở vị trí số 2, điểm là 1/2. MRR đặc biệt hữu ích trong các hệ thống Q&A chỉ cần trả về một câu trả lời duy nhất đúng.
- **NDCG (Normalized Discounted Cumulative Gain):** Đo lường chất lượng tổng thể của toàn bộ danh sách xếp hạng. Điểm số NDCG sẽ thưởng rất mạnh cho các tài liệu phù hợp (highly relevant) nếu chúng nằm chễm chệ ở các vị trí đầu, và bắt đầu trừ hao (discount) theo thang logarit đối với các vị trí phía dưới danh sách. NDCG còn cho phép đánh giá theo đa mức độ (Ví dụ: 3 - Rất quan trọng, 2 - Hơi liên quan, 0 - Không liên quan).
- **MAP (Mean Average Precision):** Tính điểm trung bình của độ chính xác tại các vị trí có tài liệu liên quan được trả về. MAP là một thước đo tuyệt vời cho các câu truy vấn phức tạp đòi hỏi nhiều tài liệu liên quan kết hợp lại (Recall-oriented tasks).

## Best Practices (Thực hành tốt nhất khi triển khai)

Khi đưa hệ thống Reranking vào môi trường thực tế (Production), bạn cần cân nhắc kỹ các yếu tố sau:

1. **Kiểm soát quy mô Candidate Size (Top K của Stage 1):**
   Đừng chuyển tiếp quá nhiều tài liệu từ hệ thống Retrieval ban đầu sang Reranker. Mức tối ưu thường dao động từ `Top 50` đến `Top 200` tài liệu. Nếu bạn vô tình đưa 1000 tài liệu vào một Cross-Encoder nặng, hệ thống của bạn sẽ ngốn cạn bộ nhớ GPU và gây ra timeout cho người dùng trước khi kịp trả về kết quả.
   
2. **Triển khai Caching thông minh (Semantic Caching):**
   Reranking rất đắt đỏ. Đối với các câu hỏi thường gặp (FAQs) hoặc những truy vấn có ý nghĩa tương tự nhau, hãy sử dụng các giải pháp như Redis hoặc GPTCache để lưu trữ tạm kết quả đã được sắp xếp, bỏ qua hoàn toàn quy trình xử lý của mô hình cho những lần gọi tiếp theo.

3. **Chiến lược Truncation (Cắt xén văn bản):**
   Các mô hình học sâu Cross-Encoder thường bị giới hạn phần cứng ở đầu vào tối đa là 512 token (do tính chất Quadratic Complexity của Self-Attention). Nếu tài liệu của bạn là các báo cáo dài hàng ngàn trang, bạn buộc phải chia nhỏ tài liệu thành các đoạn (chunks), áp dụng Reranking lên từng đoạn, sau đó dùng hàm gộp (`Max Score` hoặc `Average Score`) để tính điểm tổng cho toàn bộ văn bản gốc.

4. **Kết hợp sức mạnh (Ensemble):**
   Trong một số kiến trúc cao cấp, bạn có thể chạy RRF để kết hợp BM25 và Vector Search ở Stage 1, lấy ra 100 kết quả xuất sắc, rồi lại tiếp tục nhúng 100 kết quả này vào Cross-Encoder để chắt lọc lấy 5 tài liệu cuối cùng cho Prompt của RAG. Đây là chuỗi Pipeline tuy dài nhưng cho ra chất lượng không thể đánh bại.

---

## Tài Liệu Tham Khảo

* [Cohere: Rerank - State of the art Search - Nâng tầm độ chính xác tìm kiếm](https://cohere.com/rerank)
* [Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods (Cormack et al., 2009) - Nghiên cứu nền tảng về RRF](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)
* [BGE Reranker - BAAI FlagEmbedding - Kho lưu trữ mã nguồn mở phổ biến](https://github.com/FlagOpen/FlagEmbedding)
* [Improving RAG with Cross-Encoder Reranking - Tài liệu từ thư viện Sentence Transformers (SBERT)](https://www.sbert.net/examples/applications/cross-encoder/README.html)
* [Lost in the Middle: How Language Models Use Long Contexts (Liu et al., 2023) - Hiện tượng rơi rụng ngữ cảnh ở giữa văn bản dài của LLM](https://arxiv.org/abs/2307.03172)

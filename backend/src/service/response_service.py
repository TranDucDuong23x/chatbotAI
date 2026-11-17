import asyncio
import json
from pathlib import Path

from langchain_community.vectorstores import chroma
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_classic.chains.retrieval_qa.base import RetrievalQA
from langchain_core.documents import Document
import redis
from langchain_core.prompts import ChatPromptTemplate

r = redis.Redis(host="localhost", port=6379, decode_responses=True)
embeddings = OllamaEmbeddings(model="nomic-embed-text")
src_dir = Path(__file__).resolve().parents[1]
data_path = src_dir / "datas" / "data_final.json"
db_path = src_dir / "chatbotDB.db"

with data_path.open(encoding="utf-8") as data_file:
    data = json.load(data_file)

documents = [
    Document(
        page_content=item["noi_dung"],
        metadata={key: value for key, value in item.items() if key != "noi_dung"},
    )
    for item in data
]
document_ids = [item["chunk_id"] for item in data]

if not db_path.exists():
    vector_store = chroma.Chroma.from_documents(
        documents,
        embeddings,
        ids=document_ids,
        persist_directory=str(db_path),
    )
else:
    vector_store = chroma.Chroma(
        persist_directory=str(db_path),
        embedding_function=embeddings,
    )
    existing_ids = set(vector_store.get(ids=document_ids)["ids"])
    new_documents = [
        document
        for document, document_id in zip(documents, document_ids)
        if document_id not in existing_ids
    ]
    new_ids = [
        document_id
        for document_id in document_ids
        if document_id not in existing_ids
    ]
    if new_documents:
        vector_store.add_documents(new_documents, ids=new_ids)

LLM = OllamaLLM(model="llama3.2", temperature=0)
doc_count = vector_store._collection.count()
print(f"--> Tổng số đoạn văn bản trong Database: {doc_count}")

QA_PROMPT = ChatPromptTemplate([
    (
        "system", """Bạn là một bộ máy trích xuất thông tin tự động, KHÔNG PHẢI trợ lý tư vấn.

Nhiệm vụ của bạn: Trả lời câu hỏi duy nhất dựa trên nội dung trong [Ngữ cảnh].

Quy tắc nghiêm ngặt:
1. Bắt buộc CHỈ dùng thông tin có sẵn trong [Ngữ cảnh].
2. KHÔNG ĐƯỢC nhắc đến, phân tích hoặc trả lời dựa trên bất kỳ chi tiết riêng nào trong câu hỏi (như tên trường, ngành học, môn học, nhu cầu cá nhân) nếu chi tiết đó không có trong [Ngữ cảnh].
3. Nếu [Ngữ cảnh] không chứa thông tin trả lời, trả lời duy nhất: "Không có dữ liệu"."""
    ),
    (
        "human", "Ngữ cảnh:\n{context}\n\nCâu hỏi: {question}\n\nTrả lời:"
    )
])


qa_chain = RetrievalQA.from_chain_type(llm=LLM,retriever=vector_store.as_retriever(search_kwargs={"k":3}),chain_type_kwargs={"prompt":QA_PROMPT})

def ask_question(text_origin:str) -> None:
    global response
    query = text_origin
    response = qa_chain.invoke(query)
    print(response["result"])
async def get_ai_stream():
    for word in response["result"]:
        yield f"data: {word} \n\n"
        await asyncio.sleep(0.03)
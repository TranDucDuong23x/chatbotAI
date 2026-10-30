import pandas as pd
import asyncio
from langchain_community.document_loaders import DataFrameLoader
from langchain_community.vectorstores import chroma
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_classic.chains.retrieval_qa.base import RetrievalQA
import redis
import os
from langchain_core.prompts import ChatPromptTemplate
r=redis.Redis(host="localhost",port=6379,decode_responses=True)
embeddings= OllamaEmbeddings(model="nomic-embed-text")
if not os.path.exists("./chatbotDB.db"):
    df=pd.read_excel("./data.xlsx")
    df["full_text"] = df["Câu hỏi"].astype(str) + "\nĐáp: " + df["Câu trả lời"].astype(str)
    loader = DataFrameLoader(df,page_content_column="full_text")
    documents=loader.load()
    vector_store = chroma.Chroma.from_documents(documents,embeddings,persist_directory="./chatbotDB.db")
else:
    vector_store=chroma.Chroma(persist_directory="./chatbotDB.db",embedding_function=embeddings)
LLM=OllamaLLM(model="llama3.2",temperature=0)
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
import pandas as pd
import asyncio
from langchain_community.document_loaders import DataFrameLoader
from langchain_community.vectorstores import chroma
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_classic.chains.retrieval_qa.base import RetrievalQA

df=pd.read_excel("D:/chatbotAI/backend/src/tonghop.xlsx")
df["full_text"] = df["Câu hỏi"].astype(str) + "\nĐáp: " + df["Câu trả lời"].astype(str)

loader = DataFrameLoader(df,page_content_column="full_text")
documents=loader.load()
embeddings= OllamaEmbeddings(model="nomic-embed-text")
vector_store = chroma.Chroma.from_documents(documents,embeddings)

LLM=OllamaLLM(model="llama3.2")

qa_chain = RetrievalQA.from_chain_type(llm=LLM,retriever=vector_store.as_retriever(search_kwargs={"k":4}))

query="Ryzen 5 7600 và i5-14400F hiện tại chênh lệch như thế nào?"
response = qa_chain.invoke(query)
print(response["result"])

async def get_ai_stream():
    message="Xin chào! Tôi là AI Assistant. Tôi có thể giúp gì cho bạn hôm nay?"
    for word in response["result"]:
        yield f"data: {word} \n\n"
        await asyncio.sleep(0.3)


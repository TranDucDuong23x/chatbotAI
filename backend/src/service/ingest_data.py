import json
import os
from langchain_community.vectorstores import chroma
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document

def nap_du_lieu_vao_chroma():
    embeddings = OllamaEmbeddings(model="nomic-embed-text")

    # 1. ĐỌC FILE DATA GỐC
    data_path = os.path.join(os.path.dirname(__file__), "..", "datas", "data_final.json")
    with open(data_path, encoding="utf-8") as data_file:
        data = json.load(data_file)

    # 2. TẠO DOCUMENTS CHO CHROMADB VÀ LƯU METADATA
    documents = [
        Document(
            page_content=item["noi_dung"],
            metadata={key: value for key, value in item.items() if key != "noi_dung"},
        )
        for item in data
    ]

    document_ids = [item["chunk_id"] for item in data]

    # 3. NẠP DỮ LIỆU VÀO CHROMADB
    if not os.path.exists("./chatbotDB.db"):
        vector_store = chroma.Chroma.from_documents(
            documents,
            embeddings,
            ids=document_ids,
            persist_directory="./chatbotDB.db",
        )
        print("Tạo mới Database thành công.")
    else:
        vector_store = chroma.Chroma(persist_directory="./chatbotDB.db", embedding_function=embeddings)
        existing_ids = set(vector_store.get(ids=document_ids)["ids"])
        
        new_documents = [
            document for document, document_id in zip(documents, document_ids) if document_id not in existing_ids
        ]
        new_ids = [
            document_id for document_id in document_ids if document_id not in existing_ids
        ]
        
        if new_documents:
            vector_store.add_documents(new_documents, ids=new_ids)
            print(f"Đã cập nhật thêm {len(new_ids)} bản ghi mới.")
        else:
            print("Không có dữ liệu mới để cập nhật.")

    doc_count = vector_store._collection.count()
    print(f"--> Tổng số đoạn văn bản trong Database: {doc_count}")

if __name__ == "__main__":
    nap_du_lieu_vao_chroma()
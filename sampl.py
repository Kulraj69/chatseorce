# main.py
import os
import tempfile
import streamlit as st
from dotenv import load_dotenv

# Azure & LangChain imports
from langchain_openai import AzureChatOpenAI
from langchain_openai import AzureOpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_astradb import AstraDBVectorStore
from langchain_core.documents import Document

# PDF loader & text splitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# ────────────────────────────────────────────────────────────────
# 1) Page & ENV setup
st.set_page_config(page_title="RAG Q&A Assistant", layout="wide")
load_dotenv()

# Required env vars
ENDPOINT_URL        = os.getenv("ENDPOINT_URL")
EMBEDDING_ENDPOINT  = os.getenv("EMBEDDING_ENDPOINT")
EMBEDDING_KEY       = os.getenv("EMBEDDING_KEY")
EMBEDDING_DEPLOYMENT= os.getenv("EMBEDDING_DEPLOYMENT")
DEPLOYMENT_NAME     = os.getenv("DEPLOYMENT_NAME")
AZURE_OPENAI_KEY    = os.getenv("AZURE_OPENAI_API_KEY")
ASTRA_TOKEN         = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
ASTRA_ENDPOINT      = os.getenv("ASTRA_DB_API_ENDPOINT")
ASTRA_KEYSPACE      = os.getenv("ASTRA_DB_KEYSPACE")

missing = [k for k,v in {
    "ENDPOINT_URL": ENDPOINT_URL,
    "EMBEDDING_ENDPOINT": EMBEDDING_ENDPOINT,
    "EMBEDDING_KEY": EMBEDDING_KEY,
    "EMBEDDING_DEPLOYMENT": EMBEDDING_DEPLOYMENT,
    "DEPLOYMENT_NAME": DEPLOYMENT_NAME,
    "AZURE_OPENAI_API_KEY": AZURE_OPENAI_KEY,
    "ASTRA_DB_APPLICATION_TOKEN": ASTRA_TOKEN,
    "ASTRA_DB_API_ENDPOINT": ASTRA_ENDPOINT,
    "ASTRA_DB_KEYSPACE": ASTRA_KEYSPACE
}.items() if not v]
if missing:
    st.error(f"Missing env vars → {', '.join(missing)}")
    st.stop()

# Track which files we've already ingested this session
if "ingested_files" not in st.session_state:
    st.session_state.ingested_files = []

# ────────────────────────────────────────────────────────────────
# 2) Initialize & cache RAG components
@st.cache_resource
def init_rag():
    embeddings = AzureOpenAIEmbeddings(
        deployment=EMBEDDING_DEPLOYMENT,
        model="text-embedding-3-large",
        azure_endpoint=EMBEDDING_ENDPOINT,
        api_key=EMBEDDING_KEY,
        api_version="2023-05-15"
    )
    llm = AzureChatOpenAI(
        deployment_name=DEPLOYMENT_NAME,
        model_name="gpt-4",
        azure_endpoint=ENDPOINT_URL,
        api_key=AZURE_OPENAI_KEY,
        api_version="2023-05-15"
    )
    vectorstore = AstraDBVectorStore(
        embedding=embeddings,
        collection_name="rag_demo",
        token=ASTRA_TOKEN,
        api_endpoint=ASTRA_ENDPOINT,
        namespace=ASTRA_KEYSPACE
    )
    return embeddings, llm, vectorstore

embeddings, llm, vectorstore = init_rag()

# ────────────────────────────────────────────────────────────────
# 3) Sidebar: PDF upload & one‑time ingestion
st.sidebar.header("📄 Ingest PDF (once)")
pdf_file = st.sidebar.file_uploader("Upload a PDF", type=["pdf"])

if pdf_file:
    fname = pdf_file.name
    if fname in st.session_state.ingested_files:
        st.sidebar.info(f"✔️ “{fname}” already ingested this session.")
    else:
        with st.spinner(f"Ingesting “{fname}”…"):
            # write to temp file
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                tmp.write(pdf_file.read())
                tmp_path = tmp.name

            # load & split
            loader    = PyPDFLoader(tmp_path)
            raw_docs  = loader.load()
            splitter  = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            split_docs = splitter.split_documents(raw_docs)

            # convert & index
            docs = [
                Document(page_content=d.page_content, metadata=d.metadata or {})
                for d in split_docs
            ]
            vectorstore.add_documents(docs)

        st.sidebar.success(f"✅ Ingested “{fname}”!")
        st.session_state.ingested_files.append(fname)

# ────────────────────────────────────────────────────────────────
# 4) Build retriever & RAG chain
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

prompt_template = """Answer the question based only on the following context:

Context:
{context}

Question: {question}

Answer:"""
prompt = ChatPromptTemplate.from_template(prompt_template)

def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# ────────────────────────────────────────────────────────────────
# 5) Main chat UI
st.title("🤖 RAG Q&A Assistant")
st.markdown("Upload one or more PDFs via the sidebar (they'll be indexed only once), then ask questions.")

if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# replay history
for msg in st.session_state.chat_history:
    st.chat_message(msg["role"]).write(msg["content"])

# new user query
if user_q := st.chat_input("Ask a question…"):
    st.chat_message("user").write(user_q)
    st.session_state.chat_history.append({"role": "user", "content": user_q})

    with st.chat_message("assistant"), st.spinner("Thinking…"):
        try:
            answer = rag_chain.invoke(user_q)
        except Exception as e:
            answer = f"Error: {e}"
        st.write(answer)
        st.session_state.chat_history.append({"role": "assistant", "content": answer})

# clear chat button
if st.button("🔄 Clear Chat"):
    st.session_state.chat_history = []
    st.experimental_rerun()

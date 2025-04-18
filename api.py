# api.py
import os
import tempfile
from typing import List

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain & Azure imports
from langchain_openai import AzureChatOpenAI
from langchain_openai import AzureOpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_astradb import AstraDBVectorStore
from langchain_core.documents import Document

# PDF loader & splitter
from langchain.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# ────────────────────────────────────────────────────────────────
# 1) Load ENV
load_dotenv()

ENDPOINT_URL        = os.getenv("ENDPOINT_URL")
EMBEDDING_ENDPOINT  = os.getenv("EMBEDDING_ENDPOINT")
EMBEDDING_KEY       = os.getenv("EMBEDDING_KEY")
EMBEDDING_DEPLOYMENT= os.getenv("EMBEDDING_DEPLOYMENT")
DEPLOYMENT_NAME     = os.getenv("DEPLOYMENT_NAME")
AZURE_OPENAI_KEY    = os.getenv("AZURE_OPENAI_API_KEY")
ASTRA_TOKEN         = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
ASTRA_ENDPOINT      = os.getenv("ASTRA_DB_API_ENDPOINT")
ASTRA_KEYSPACE      = os.getenv("ASTRA_DB_KEYSPACE")

required = {
    "ENDPOINT_URL": ENDPOINT_URL,
    "EMBEDDING_ENDPOINT": EMBEDDING_ENDPOINT,
    "EMBEDDING_KEY": EMBEDDING_KEY,
    "EMBEDDING_DEPLOYMENT": EMBEDDING_DEPLOYMENT,
    "DEPLOYMENT_NAME": DEPLOYMENT_NAME,
    "AZURE_OPENAI_API_KEY": AZURE_OPENAI_KEY,
    "ASTRA_DB_APPLICATION_TOKEN": ASTRA_TOKEN,
    "ASTRA_DB_API_ENDPOINT": ASTRA_ENDPOINT,
    "ASTRA_DB_KEYSPACE": ASTRA_KEYSPACE,
}
missing = [k for k,v in required.items() if not v]
if missing:
    raise RuntimeError(f"Missing env vars: {', '.join(missing)}")

# ────────────────────────────────────────────────────────────────
# 2) FastAPI app & globals
app = FastAPI(title="RAG Q&A API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# keep track of which files have been ingested this run
ingested_files = set()

# placeholders for RAG components
embeddings: AzureOpenAIEmbeddings
llm: AzureChatOpenAI
vectorstore: AstraDBVectorStore
rag_chain: RunnablePassthrough

# ────────────────────────────────────────────────────────────────
# 3) Startup: initialize RAG
@app.on_event("startup")
def startup_event():
    global embeddings, llm, vectorstore, rag_chain

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

    # build the retriever + RAG chain once
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    prompt = ChatPromptTemplate.from_template(
        """Answer based only on the following context:

        Context:
        {context}

        Question: {question}

        Answer:"""
    )
    def _format(docs: List[Document]) -> str:
        return "\n\n".join(d.page_content for d in docs)

    rag_chain = (
        {"context": retriever | _format, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

# ────────────────────────────────────────────────────────────────
# 4) PDF ingestion endpoint
@app.post("/ingest_pdf", summary="Ingest a PDF into the vector store")
async def ingest_pdf(file: UploadFile = File(...)):
    fname = file.filename
    if fname in ingested_files:
        return {"status": "skipped", "message": f"‘{fname}’ already ingested."}

    # write to temp file
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(await file.read())
        path = tmp.name

    # load & split
    loader = PyPDFLoader(path)
    raw_docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = splitter.split_documents(raw_docs)

    # convert & index
    vectorstore.add_documents([
        Document(page_content=d.page_content, metadata=d.metadata or {})
        for d in docs
    ])

    ingested_files.add(fname)
    return {"status": "success", "message": f"Ingested ‘{fname}’", "chunks_indexed": len(docs)}

# ────────────────────────────────────────────────────────────────
# 5) Query endpoint
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str

@app.post("/query", response_model=QueryResponse, summary="Ask a question of the RAG chain")
async def query_rag(req: QueryRequest):
    try:
        answer = rag_chain.invoke(req.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return QueryResponse(answer=answer)

# ────────────────────────────────────────────────────────────────
# 6) Health check
@app.get("/health", summary="Health check")
def health():
    return {"status": "ok"}

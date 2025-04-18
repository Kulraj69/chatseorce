import streamlit as st
import os
from dotenv import load_dotenv
from langchain_openai import AzureOpenAIEmbeddings, AzureChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_astradb import AstraDBVectorStore
from langchain_core.documents import Document

# Load environment variables
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="RAG Q&A Assistant",
    page_icon="🤖",
    layout="wide"
)

# Add custom CSS
st.markdown("""
    <style>
    .stApp {
        max-width: 1200px;
        margin: 0 auto;
    }
    .st-emotion-cache-1v0mbdj {
        width: 100%;
    }
    </style>
    """, unsafe_allow_html=True)

# Initialize session state for chat history
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

@st.cache_resource
def initialize_rag():
    """Initialize RAG components with caching"""
    # Initialize Azure OpenAI embeddings
    embeddings = AzureOpenAIEmbeddings(
        deployment=os.getenv("EMBEDDING_DEPLOYMENT"),
        model="text-embedding-3-large",
        azure_endpoint=os.getenv("EMBEDDING_ENDPOINT"),
        api_key=os.getenv("EMBEDDING_KEY"),
        api_version="2023-05-15"
    )

    # Initialize Azure OpenAI GPT-4
    llm = AzureChatOpenAI(
        deployment_name=os.getenv("DEPLOYMENT_NAME"),
        model_name="gpt-4",
        azure_endpoint=os.getenv("ENDPOINT_URL"),
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version="2023-05-15"
    )

    # Initialize AstraDB vector store
    vectorstore = AstraDBVectorStore(
        embedding=embeddings,
        collection_name="rag_demo",
        token=os.getenv("ASTRA_DB_APPLICATION_TOKEN"),
        api_endpoint=os.getenv("ASTRA_DB_API_ENDPOINT"),
        namespace=os.getenv("ASTRA_DB_KEYSPACE")
    )

    return embeddings, llm, vectorstore

def initialize_documents(vectorstore):
    """Initialize and add documents to the vector store"""
    documents = [
        Document(
            page_content="Artificial Intelligence (AI) is the simulation of human intelligence by machines. "
                         "It includes machine learning, deep learning, and neural networks as key components.",
            metadata={"source": "AI_basics", "topic": "artificial intelligence"}
        ),
        Document(
            page_content="Machine Learning is a subset of AI that enables systems to learn and improve from experience "
                         "without being explicitly programmed.",
            metadata={"source": "ML_basics", "topic": "machine learning"}
        ),
        Document(
            page_content="Deep Learning is part of machine learning based on artificial neural networks. "
                         "It's particularly good at processing unstructured data like images and text.",
            metadata={"source": "DL_basics", "topic": "deep learning"}
        )
    ]
    vectorstore.add_documents(documents)
    return vectorstore

def create_rag_chain(retriever, llm):
    """Create the RAG chain"""
    template = """Answer the question based only on the following context:

    Context: {context}

    Question: {question}

    Answer: """

    prompt = ChatPromptTemplate.from_template(template)

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return rag_chain

def main():
    # Title and description
    st.title("🤖 RAG Q&A Assistant")
    st.markdown("""
    This is a Retrieval-Augmented Generation (RAG) application that uses Azure OpenAI's GPT-4 
    and embeddings to answer questions based on a knowledge base about AI, ML, and Deep Learning.
    """)

    # Initialize RAG components
    embeddings, llm, vectorstore = initialize_rag()
    
    # Initialize documents (only needed once)
    if 'documents_initialized' not in st.session_state:
        initialize_documents(vectorstore)
        st.session_state.documents_initialized = True

    # Create retriever
    retriever = vectorstore.as_retriever(search_kwargs={"k": 2})
    
    # Create RAG chain
    rag_chain = create_rag_chain(retriever, llm)

    # Chat interface
    st.markdown("### Chat Interface")
    
    # Display chat history
    for message in st.session_state.chat_history:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Chat input
    if query := st.chat_input("Ask a question about AI, ML, or Deep Learning"):
        # Display user message
        with st.chat_message("user"):
            st.markdown(query)
        
        # Add user message to chat history
        st.session_state.chat_history.append({"role": "user", "content": query})

        # Get response
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                try:
                    response = rag_chain.invoke(query)
                    st.markdown(response)
                    # Add assistant response to chat history
                    st.session_state.chat_history.append({"role": "assistant", "content": response})
                except Exception as e:
                    error_message = f"Error: {str(e)}"
                    st.error(error_message)
                    st.session_state.chat_history.append({"role": "assistant", "content": error_message})

    # Add a clear chat button
    if st.button("Clear Chat"):
        st.session_state.chat_history = []
        st.rerun()

if __name__ == "__main__":
    main() 
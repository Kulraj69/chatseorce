# RAG Web Chat

A Retrieval-Augmented Generation (RAG) chatbot powered by Azure OpenAI and DataStax Astra DB.

## Prerequisites

- Azure OpenAI API access
- DataStax Astra DB account

## Setup

1. Clone this repository
2. Install the dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file based on the `.env.template`:
   ```
   cp .env.template .env
   ```
4. Fill in your Azure OpenAI and Astra DB credentials in the `.env` file

## Running the Application

Start the Streamlit app:
```
streamlit run main.py
```

## Usage

1. Enter a website URL to ingest content (with https://)
2. Once ingestion is complete, you can ask questions about the content
3. The RAG system will retrieve relevant information and provide answers based on the ingested content

## Technologies Used

- Streamlit: Web interface
- LangChain: RAG orchestration
- Azure OpenAI: Embeddings and chat completions
- DataStax Astra DB: Vector database 

-----

# 🚀 AI-Powered RAG Todo Application

A next-generation productivity tool that fuses a standard Todo application with **Retrieval-Augmented Generation (RAG)**. This application doesn't just store your tasks; it understands them, summarizes them, improves your grammar, and allows you to chat with your data using state-of-the-art LLMs.

This repository contains the **Frontend (React + Vite)** and the **BFF (Backend-for-Frontend)** API logic running on Node.js. It communicates with a separate Python-based microservice for vector embedding operations.

> **🔗 Related Repository:**
> The Embedding Service (Python/FastAPI) logic can be found here: [**FastAPI Embedding Service Repo**](https://github.com/Vedantroy475/Fastapi-Embedding-Service-for-AI-Powered-Todo.git)
-----

## 📖 Table of Contents

- [✨ Key Features](#-key-features)
- [🏗️ Architecture & Technology Stack](#️-architecture--technology-stack)
  - [Gen AI & Model Orchestration](#gen-ai--model-orchestration)
  - [The RAG Pipeline](#the-rag-pipeline-retrieval-augmented-generation)
  - [Database & Vector Storage](#database--vector-storage)
  - [Backend & Security](#backend--security)
  - [Cloud & Deployment](#cloud--deployment)
- [🧩 DFD Level-0 Diagram](#-dfd-level-0-diagram)
- [🔍 System Architecture & DFD Level-1](#-system-architecture--dfd-level-1)
- [📂 Project Structure & Key Files](#-project-structure--key-files)
- [🛠️ Installation & Setup](#️-installation--setup)
- [🔐 Environment Variables](#-environment-variables)
- [🐳 Docker Build & Deployment](#-docker-build--deployment)
- [📄 Disclaimer](#-disclaimer)
- [📬 Contact](#-contact)
-----

## 🧩 DFD Level-0 Diagram

The following **Level-0 Data Flow Diagram (DFD)** illustrates how information moves through the system.  
It shows the interaction between:

- **End Users**  
- **The iTask Todo App (RAG Productivity Engine)**  
- **External AI Provider (OpenRouter API)**  

This diagram helps visualize:
- How user inputs (todos, voice input, credentials) enter the system  
- How RAG performs retrieval and context injection  
- How the app sends prompts to OpenRouter  
- How AI responses return to the user  

### ▶️ DFD Level-0

![DFD Level- 0](<docs/DFD Level- 0.png>)

-----

## 🔍 System Architecture & DFD Level-1

While Level-0 shows the high-level context, **DFD Level-1** breaks down the system into specific technical processes and illustrates the communication between the two separate repositories.

### ▶️ DFD Level-1 Diagram

![DFD Level-1](<docs/DFD Level- 1.png>)

### The Microservices Architecture

The application relies on a separation of concerns between application logic (Node.js) and computational AI tasks (Python).

#### 1. The Two Repositories

**Repo A (Blue Area): The Application Monorepo**
This is the primary deployment on Cloud Run. It hosts the React Frontend (served statically) and the Node.js/Express Backend-for-Frontend (BFF).
* **Process 1.0 (Frontend):** Handles user inputs, including real-time voice capture via the Web Speech API, and renders UI updates.
* **Process 2.0 (API Gateway):** The entry point for all `/api` requests. It handles JWT authentication via secure HTTP-only cookies before routing requests.
* **Process 3.0 (Core Logic):** Manages standard CRUD operations for todos, interacting directly with the textual data in CockroachDB (D2).
* **Process 4.0 (GenAI Orchestrator):** The complex brain of the operation. It is responsible for constructing prompts, managing the multi-model fallback strategy (e.g., trying GLM-4.5, then Mistral), and coordinating RAG.

**Repo B (Green Area): The Python Embedding Microservice**
A separate, lightweight FastAPI deployment dedicated to vector mathematics.
* **Process 5.0 (Vector Service):** It loads the `sentence-transformers/all-MiniLM-L6-v2` model into memory. It provides endpoints (`/embed`, `/search`) for the Node.js backend to call. It is the only process that interacts with the `pgvector` data in CockroachDB (D3).

#### 2. Key Technical Workflows

**The "Write" Path (Creating a Todo):**
When a user creates a task, a dual-write operation occurs to ensure data consistency for future retrieval.
1.  The Node.js backend (**Process 3.0**) first saves the raw text to the `todos` table (**D2**).
2.  Crucially, it immediately makes an **Inter-Repo HTTP Post request** to the Python service (**Process 5.0**) containing the new text and ID.
3.  The Python service generates the 384-dimensional vector and upserts it into the `embeddings` table (**D3**) using `pgvector`.

**The "Read" Path (RAG Chat):**
When a user asks the AI a question:
1.  The request hits the GenAI Orchestrator (**Process 4.0**).
2.  Before calling the LLM, Process 4.0 makes an **Inter-Repo HTTP request** to the Python service's `/search` endpoint with the user's query.
3.  The Python service (**Process 5.0**) embeds the query on-the-fly and performs a **Cosine Similarity Search** against the database (**D3**).
4.  It returns the Top-K most relevant textual snippets back to the Node.js orchestrator (**Process 4.0**).
5.  The orchestrator assembles the final system prompt (including retrieved context) and sends it to the External AI provider (OpenRouter).

## ✨ Key Features

This is not a typical CRUD application. It leverages Generative AI to enhance personal productivity through four core features:



### 1\. ✍️ Grammar & Style Improvement

Ensure your tasks are clear and professional.

  - **Function:** The "Magic Wand" button analyzes your todo text.
  - **Tech:** It prompts the AI to polish the grammar and phrasing, then automatically updates the task in the database with the improved version—no manual editing required.

<video controls src="docs/Demo Video For Grammar Improve.mp4" title="Demo Video for Grammar Improvement using AI"></video>

### 2\. 🧠 AI-Powered Summarization

Don't get bogged down by long, detailed task descriptions.

  - **Function:** One-click summarization for verbose todos (automatically triggers for tasks \> 50 chars).
  - **Tech:** Sends the specific todo context to the LLM, which returns a concise, markdown-formatted summary displayed in an accordion view directly under the task.

  <video controls src="docs/Demo Video for AI Summarize.mp4" title="Demo Video for AI Based Summarization of Todo"></video>

### 3\. 💬 RAG-Based AI Chat Interface

The crown jewel of the application. You can converse with an AI Assistant that has "long-term memory" of your specific tasks.

  - **Context-Aware:** Unlike standard ChatGPT, this assistant pulls *your* relevant todos into its context window.
  - **Example Queries:** *"Do I have any deadlines related to the project?", "Summarize my shopping list,"* or *"What tasks are pending regarding the backend?"*

<video controls src="docs/Demo Video for RAG Based AI Chat Interface.mp4" title="Demo Video for RAG-Based AI Chat Interface"></video>

### 4\. 🗣️ Voice-to-Text Integration

Seamlessly capture ideas without typing. The app utilizes the **Web Speech API** (via `react-speech-recognition`) to provide real-time speech-to-text transcription.

  - **Usage:** Available in both the main Todo Input field and the AI Chat interface.
  - **UX:** Features visual feedback for listening states and handles permission management gracefully.

<video controls src="docs/Demo Video for Voice to Text Feature.mp4" title="Demo Video for Voice to Text Functionality"></video>
-----

## 🏗️ Architecture & Technology Stack

This project implements a **Microservices Architecture** deployed on **Google Cloud Platform**.

### Gen AI & Model Orchestration

We utilize a robust **Multi-Model Fallback Strategy** via OpenRouter to ensure high availability and bypass free-tier rate limits.

  * **Primary Model:** `glm-4.5` (General Language Model) for high-quality reasoning.
  * **Fallback Chain:** If the primary model hits a rate limit (HTTP 429) or fails, the backend automatically retries with the following sequence:
    1.  `alibaba/tongyi-deepresearch-30b-a3b`
    2.  `meituan/longcat-flash-chat`
    3.  `mistralai/mistral-small-3.2-24b-instruct`
    4.  `microsoft/mai-ds-r1`

### The RAG Pipeline (Retrieval-Augmented Generation)

To make the AI aware of user data without training a custom model, we use RAG:

1.  **Embedding (Python Service):** When a Todo is created/updated in this repo, a request is sent to a separate Python microservice running **FastAPI**.
2.  **Vectorization:** The Python service uses **Sentence Transformers** (specifically `all-MiniLM-L6-v2`) to convert text into vector embeddings.
3.  **Storage:** These vectors are stored in **CockroachDB** using `pgvector`.
4.  **Retrieval:** When you chat with the AI, your prompt is embedded, and a **Cosine Similarity Search** retrieves the top 5 most relevant todos.
5.  **Generation:** These retrieved todos are appended to the system prompt, allowing the LLM to answer accurately based on your data.

### Database & Vector Storage

  * **CockroachDB Serverless:** A distributed SQL database chosen for its resilience and PostgreSQL compatibility.
  * **pgvector:** Used for storing high-dimensional vectors and performing similarity searches (`<=>` operator).
  * **psycopg2:** The adapter used by the Python service to interact with the DB.

### Backend & Security

  * **Node.js & Express:** Handles API routing (`/api/*`), business logic, and serves the React frontend.
  * **@google-cloud/functions-framework:** The application is wrapped in the Functions Framework, allowing it to run as a portable container that behaves like a serverless function.
  * **Authentication:** Custom implementation using `bcryptjs` for password hashing and `jsonwebtoken` (JWT) stored in HTTP-only secure cookies.

### Cloud & Deployment

  * **Containerization:** The app is Dockerized (Multi-stage build) to optimize image size.
  * **Registry:** Images are pushed to **Google Artifact Registry** via the `gcloud` SDK CLI.
  * **Compute:** Deployed on **Google Cloud Run**, providing auto-scaling serverless execution.

-----

## 🛠️ Installation & Setup

### Prerequisites

  * Node.js v20+
  * A CockroachDB Serverless Cluster URL
  * An OpenRouter API Key
  * (Optional) The Python Embedding Service running locally or deployed

### 1\. Clone the Repository

```bash
git clone https://github.com/yourusername/todo-react-app.git
cd todo-react-app
```

### 2\. Install Dependencies

```bash
npm install
```

## 📂 Project Structure & Key Files

<details>
<summary><strong>Click to expand the codebase tour</strong></summary>

### 🟢 Backend API (Node.js/Express)
Located in `/api`, this layer acts as the Backend-For-Frontend (BFF) and is wrapped by the Google Cloud Functions Framework.

#### **Core Infrastructure**
* **`api/index.js`**: The application entry point. It initializes Express, mounts all handlers under the `/api` route, serves the static React build (SPA) with fallback routing, and exports the app for Cloud Run via `@google-cloud/functions-framework`.
* **`api/_db.js`**: **(Database Singleton)** Manages the connection pool to CockroachDB Serverless. It handles schema initialization (creating `users` and `todos` tables) and enforces a **24-hour TTL (Time-To-Live)** policy on tasks to manage free-tier limits.
* **`api/_auth.js`**: Authentication middleware helper. Parses secure HTTP-only cookies to extract and verify JWT tokens using `process.env.JWT_SECRET`.
* **`api/_embed.js`**: **(Inter-Service Communication)** A utility layer that wraps HTTP `fetch` calls to the external Python Microservice. It handles logic for generating embeddings (`/embed`), searching vectors (`/search`), and deleting data (`/delete`).

#### **AI & RAG Logic**
* **`api/aiChat.js`**: **(The RAG Orchestrator)** The brain of the AI features. It authenticates the user, calls the Python service to retrieve relevant context (Top-K search), and manages the **Multi-Model Fallback Strategy** (attempting models like `glm-4.5 (Z.ai)`, `qwen3--30b-a3b (Qwen)`, `nemotron-nano-9b-v2 (NVIDIA)`,`mistral-small (Mistral)`, `mai-ds-r1 (Microsoft)`) via OpenRouter to ensure reliability.

#### **Task Management (CRUD)**
* **`api/addTodo.js`**: Creates new tasks. Enforces a strict **limit of 10 todos** per user. Performs a "Dual-Write" operation: persists text to CockroachDB and asynchronously triggers vectorization in the Python service.
* **`api/updateTodo.js`**: Modifies task text or completion status. Contains logic to **automatically re-embed** the todo if the text content changes, keeping the vector store in sync.
* **`api/deleteTodo.js`**: Removes a specific task. Executes a SQL delete and triggers a "best-effort" vector deletion in the embedding microservice.
* **`api/getTodos.js`**: Retrieves the authenticated user's task list, ordered by creation date (`DESC`).

#### **User Authentication**
* **`api/signup.js`**: Registers new users. Hashes passwords using `bcrypt` (10 salt rounds) and initializes the user record.
* **`api/login.js`**: Verifies credentials. Upon success, issues a secure, **HTTP-only, SameSite=Lax** JWT cookie valid for 1 day.
* **`api/logout.js`**: Terminates the session by clearing the authentication cookie.
* **`api/change-password.js`**: Securely updates credentials. Verifies the current password and hashes the new one (12 salt rounds) before updating the database.
* **`api/delete-account.js`**: **(Cleanup Handler)** Permanently deletes the user record (cascading to todos) and signals the Python service to purge all associated vector embeddings.

### 🔵 Frontend (React + Vite)
Located in `/src`, the frontend is built with **React 19** and styled using **Tailwind CSS**. It utilizes a component-based architecture with a strong emphasis on **Separation of Concerns** (SoC) by moving business logic into custom hooks.

#### **1. Core Application Architecture**
* **`src/App.jsx`**: The application entry point. It orchestrates the **Authentication State** (loading user data via `/api/me`), handles the global **Disclaimer Modal** logic (using `sessionStorage`), and defines the Routing table.
* **`src/components/Layout.jsx`**: Implements a responsive shell with a collapsible sidebar. It handles navigation state and adapts the UI for mobile vs. desktop views using `lucide-react` icons.
* **`src/components/ProtectedRoute.jsx`**: A Higher-Order Component (HOC) wrapper that guards private routes. It redirects unauthenticated users to `/login` while preserving the intended destination for a better UX.

#### **2. Custom Hooks (Business Logic Layer)**
Instead of cluttering components with API calls, logic is abstracted into reusable hooks:
* **`src/components/useTodoOperations.js`**:
    * **Optimistic Updates:** For deletions and checkbox toggles, the UI updates *immediately* for perceived speed, then rolls back if the server request fails.
    * **Pessimistic Updates:** For creating/updating text, it waits for server confirmation to ensure data integrity.
    * **State Management:** Centralized control of `todos`, `loading`, and `editingId`.
* **`src/components/useAIOperations.jsx`**:
    * Encapsulates the complex async flows for **Summarization** and **Grammar Improvement**.
    * Manages loading states for specific buttons (preventing double-clicks) and handles the display logic for AI summaries.

#### **3. Feature-Rich Components**
* **`src/components/SpeechRecognitionHandler.jsx`**:
    * A robust wrapper around `react-speech-recognition`.
    * **Advanced Logic:** It actively queries `navigator.permissions` to manage microphone access states (`granted`, `denied`, `prompt`).
    * **Resource Management:** Manages the `MediaStream` lifecycle to ensure audio tracks are stopped correctly when components unmount.
* **`src/components/PasswordInput.jsx` & `Validator.jsx`**:
    * Includes a visual **Password Strength Meter** that calculates entropy (length, symbols, numbers) in real-time using regex patterns.
* **`src/components/SummaryAccordion.jsx`**:
    * Uses `react-markdown` to render AI-generated summaries safely.
    * Features smooth CSS transitions for expanding/collapsing content.

#### **4. Pages & Views**
* **`src/pages/HomePage.jsx`**: The dashboard. Connects the UI components (`TodoSection`) with the logic hooks (`useTodoOperations`, `useAIOperations`).
* **`src/pages/AiAssistantPage.jsx`**:
    * A full RAG-chat interface.
    * **Auto-Scroll & Resize:** Contains `useRef` logic to auto-scroll to the newest message and auto-expand the textarea height based on content.
    * **Multi-Modal Input:** Users can type or use voice commands to chat with their data.
* **`src/pages/SettingsPage.jsx`**: Allows users to change passwords or perform a "Danger Zone" account deletion (which triggers a cascade delete of vectors in the backend).

### 🐍 Embedding Microservice (Python/FastAPI)
*Located in the secondary repository.*

> **🔗 Link:** [FastAPI Embedding Service Repo](https://github.com/Vedantroy475/Fastapi-Embedding-Service-for-AI-Powered-Todo.git)

* **`embedding_service_bin.py`**: The standalone vector service.
    * Loads `sentence-transformers/all-MiniLM-L6-v2`.
    * Exposes `/embed` and `/search` endpoints.
    * Directly interacts with the `pgvector` extension in CockroachDB to perform Cosine Similarity searches.

</details>

### 3\. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=verify-full

# Authentication
JWT_SECRET=your_super_secret_random_string

# AI Configuration
OPENROUTER_API_KEY=sk-or-v1-...

# Connection to the Python Embedding Service (Second Repo)
# If running locally, usually http://localhost:8000
# If deployed, use the Cloud Run URL of the python service
EMBED_SERVICE_URL=https://your-embedding-service-url.run.app
EMBED_API_KEY=your_embedding_service_api_key
```

### 4\. Run Locally

You can run the development server (Vite) and the API server concurrently.

```bash
# Start the Vite Frontend
npm run dev

# In a separate terminal, start the API Server
npm run start

# Note: You may need to adjust vite.config.js proxy target if ports differ
node api/index.js
```

*Alternatively, use the build command to simulate production:*

```bash
npm run build
npm run start
```

-----

## 🐳 Docker Build & Deployment

This project is designed for **Google Cloud Run**.

### 🔐 Production Security (CockroachDB SSL)

To ensure secure interaction with CockroachDB in a serverless environment, the CA Certificate must be handled securely using **Google Cloud Secret Manager**.

1.  **Create the Secret:** Upload your `root.crt` file to Secret Manager.
    ```bash
    gcloud secrets create cockroachdb-ca-cert --data-file=root.crt
    ```
2.  **Deploy with Secret Reference:** The deployment command below mounts this secret as an environment variable (e.g., `CC_CERT`) so the application can verify the database connection.

### Deployment Steps

**1. Build the image:**

```bash
docker build -t gcr.io/your-project-id/todo-app .
```

**2. Push to Artifact Registry:**

```bash
docker push gcr.io/your-project-id/todo-app
```

**3. Deploy to Cloud Run:**

*Note the `--set-secrets` flag which securely injects the CA certificate.*

```bash
gcloud run deploy todo-app \
  --image gcr.io/your-project-id/todo-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=...,JWT_SECRET=..." \
  --set-secrets="CC_CERT=cockroachdb-ca-cert:latest"
```

-----

## 📄 Disclaimer

*This application is a demonstration of advanced Gen AI, RAG implementation and Web Development skills. It utilizes a free tier database with TTL (Time To Live) configured, meaning data may be deleted automatically after 24 hours. Please do not store sensitive personal information.*

-----

## 📬 Contact

If you have questions about the architecture or would like to discuss potential opportunities, feel free to reach out:

  - **Email:** [vedantroy3@gmail.com](mailto:vedantroy3@gmail.com)
  - **LinkedIn:** [Vedant Roy](https://www.linkedin.com/in/vedant-roy-b58117227/)
  - **GitHub:** [Vedantroy475](https://github.com/Vedantroy475)
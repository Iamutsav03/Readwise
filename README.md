# 📖 ReadWise

> **Transform PDFs into an intelligent reading and knowledge workspace.**

ReadWise is a modern, full-stack PDF reading and learning platform designed to turn static documents into an interactive knowledge workspace.

Instead of switching between a PDF reader, dictionary, notes app, search engine, and AI assistant, ReadWise brings these capabilities together in a single reading experience.

Built for **students, developers, researchers, and lifelong learners**, ReadWise combines a smooth PDF reader with highlighting, annotations, search, vocabulary tools, AI assistance, and persistent knowledge management.

---

## ✨ Features

### 📄 PDF Library

* Upload and manage PDF documents
* Persistent document library
* Recent documents
* Delete documents
* Fast document switching
* Persistent document data

### 📚 Advanced PDF Reader

* Smooth PDF rendering with PDF.js
* Previous / Next page navigation
* Jump to specific pages
* Fit-to-screen
* Fit-to-width
* Zoom controls
* Reading progress tracking
* Remember last reading position
* Swipe navigation
* Focus mode
* Reading settings
* Keyboard shortcuts
* Smooth page transitions

### 🔍 Full-Text Search

* Automatic PDF text extraction
* Search across document content
* Page-level search results
* Match counts
* Context snippets
* Jump directly to matching pages
* MongoDB-backed document text indexing

### ✨ Highlights

* Multi-color highlights
* Persistent highlights
* Highlight manager
* Highlight navigation
* Page-linked highlights
* Highlight positioning directly over PDF text
* Undo / Redo support

### 📝 Notes & Annotations

* Margin notes
* Rich-text notes
* Color-coded notes
* Auto-save
* Resizable notes
* Draggable notes
* Page-linked annotations
* Persistent MongoDB storage
* Notes management through the reader sidebar

### 🔖 Reading & Productivity Tools

* Bookmarks
* Reading session continuity
* Quick document navigation
* Keyboard shortcuts
* Reader toolbar
* Reader sidebar
* Focus mode
* Distraction-free Reading Mode

### 📖 Reading Mode

Read extracted document content separately from the PDF canvas using a clean, semantic reading interface.

* Structured text rendering
* Paragraph and heading-based content
* Independent reading experience
* Reading settings
* Highlight support

### 🤖 AI-Assisted Reading

ReadWise integrates AI directly into the reading workflow instead of treating it as a separate chatbot.

* Select text and ask for an explanation
* Quick Explain
* Deep Explain
* AI Chat
* Context-aware explanations
* PDF-aware AI responses
* AI selection toolbar
* Streaming AI responses
* Backend-controlled AI usage limits

### 📚 Vocabulary & Learning

* Dictionary definitions
* Save unfamiliar words
* Vocabulary management
* Vocabulary review workflow
* Flashcard-oriented learning

### 👤 Guest & User Accounts

ReadWise supports a guest-first experience so users can try the application before creating an account.

* Guest sessions using UUIDs
* JWT-based authentication
* Usage limits for guest users
* Account registration
* Guest-to-user data migration
* Persistent user data

Users can start reading without immediately creating an account and migrate their existing documents and activity when they register.

---

## ⚙️ Technical Highlights

ReadWise follows a **decoupled React + Node.js architecture** with clear separation between UI state, server state, PDF rendering, and backend business logic.

### Frontend

* React SPA
* React PDF / PDF.js
* Context API
* React Query
* Axios
* Feature-based architecture
* Component-based reader architecture

### Backend

* Node.js
* Express.js
* REST APIs
* Authentication middleware
* Guest authentication middleware
* Controller / Service separation
* PDF processing services
* AI orchestration

### Database

* MongoDB
* Mongoose
* Persistent PDFs, highlights, notes, vocabulary, and user data
* MongoDB text indexing
* Dictionary caching

### PDF Processing

* PDF.js
* React PDF
* Multer
* PDF text extraction
* Canvas-based rendering
* Asynchronous PDF text layer
* Custom highlight positioning

### AI Architecture

AI requests are handled through the backend rather than directly from the browser.

This allows ReadWise to:

* Keep LLM credentials server-side
* Inject relevant PDF context into AI prompts
* Enforce usage limits
* Control AI costs
* Centralize AI orchestration

---

## 🏗️ Reader Architecture

The reader is intentionally split into independent rendering and interaction layers rather than being implemented as one large component.

```text
ReaderLayout
├── ReaderToolbar
├── ReaderSidebar
└── ReaderContent
    ├── PDFViewer
    │   ├── PDFCanvasLayer
    │   └── PDFHighlightLayer
    └── ReadingMode
```

`ReaderLayout` acts as the primary state owner, while specialized components isolate PDF rendering, gestures, highlights, notes, and reading-mode behavior.

The PDF viewer also uses a page-stack approach for smoother page transitions and keeps rendering-heavy state inside the PDF subsystem to reduce unnecessary React re-renders.

---

## 🔄 How ReadWise Works

```text
PDF Upload
    ↓
Backend Processing
    ↓
PDF Text Extraction
    ↓
MongoDB
    ↓
ReadWise Reader
    ↓
┌─────────────────────────────┐
│ Read / Search / Highlight   │
│ Notes / Vocabulary / AI     │
└─────────────────────────────┘
```

When a user selects content for an AI operation, the request is sent to the backend where relevant document context can be retrieved before communicating with the external LLM service.

---

## 🎯 Vision

Traditional PDF readers primarily focus on displaying documents.

ReadWise aims to turn the PDF itself into an **interactive learning and knowledge workspace** where users can:

* **Read**
* **Search**
* **Highlight**
* **Annotate**
* **Understand**
* **Save knowledge**
* **Learn**
* **Revisit information**

without constantly leaving the document.

---

## 🚧 Roadmap

The project is actively evolving toward a more complete AI-powered knowledge platform.

Planned capabilities include:

* AI-generated document summaries
* Chapter summaries
* Semantic search
* Cross-document search
* Flashcard generation
* Quiz generation
* Revision mode
* Smart highlights
* Knowledge graphs
* Document collections
* Tagging and workspace organization
* Export notes and highlights

---

## 🛠️ Tech Stack

| Layer          | Technologies             |
| -------------- | ------------------------ |
| Frontend       | React, JavaScript, CSS   |
| PDF Rendering  | React PDF, PDF.js        |
| State          | Context API, React Query |
| HTTP           | Axios                    |
| Backend        | Node.js, Express.js      |
| Database       | MongoDB, Mongoose        |
| File Upload    | Multer                   |
| AI             | External LLM API         |
| Authentication | JWT + Guest UUID         |

---

## 📌 Current Status

**Active Development**

ReadWise has evolved from a basic PDF reader into a full-stack reading and knowledge workspace with persistent document data, search, annotations, vocabulary tools, AI-assisted reading, guest authentication, and a layered PDF rendering architecture.

More features and architectural improvements are currently being developed.

---

## 📜 License

MIT License

---

<p align="center">
  Built with ❤️ for readers, learners, developers, and knowledge workers.
</p>

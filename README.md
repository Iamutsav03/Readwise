# 📖 ReadWise

> Transform PDFs into an intelligent reading and knowledge workspace.

ReadWise is a modern PDF reading platform built with React, Node.js, Express, and MongoDB. It helps users read, search, annotate, bookmark, and organize information from PDFs in a clean and distraction-free environment.

Designed for students, developers, researchers, and lifelong learners, ReadWise combines the simplicity of a PDF reader with the power of a knowledge management tool.

---

## ✨ Features

### 📄 PDF Management

* Upload PDFs
* Recent documents panel
* Delete documents
* Persistent document library
* Fast document switching

### 📚 PDF Reading Experience

* Smooth PDF rendering
* Previous / Next page navigation
* Jump to page
* Fit-to-screen mode
* Fit-to-width mode
* Zoom controls
* Reading progress tracking
* Remember last reading position

### 🔍 Full-Text Search

* Automatic text extraction during upload
* MongoDB-powered indexing
* Search entire PDFs instantly
* Match count per page
* Context snippets
* Jump directly to search results

### ✨ Highlight System

* Multi-color highlighting
* Persistent highlights
* Highlight manager
* Highlight navigation
* Undo / Redo support

### 📝 Notes System

* Margin notes
* Rich text editing
* Color-coded notes
* Auto-save
* Resizable notes
* Draggable notes
* Page-linked annotations
* Persistent MongoDB storage

### 🔖 Productivity Tools

* Bookmarks
* Keyboard shortcuts
* Reading session continuity
* Quick document navigation

---

## 🚀 Upcoming Features

### 🤖 AI-Powered Reading

* PDF Chat
* Ask questions about documents
* AI-generated summaries
* Chapter summaries
* Concept explanations
* Semantic search

### 🧠 Learning Tools

* Flashcard generation
* Quiz generation
* Revision mode
* Smart highlights
* Knowledge graph

### 📂 Knowledge Management

* Cross-document search
* Document collections
* Tagging system
* Workspace organization
* Export notes and highlights

---

## 🛠 Tech Stack

### Frontend

* React
* React PDF
* JavaScript
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### PDF Processing

* PDF.js
* Multer

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/readwise.git
cd readwise
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🌐 Environment Variables

Backend:

```env
PORT=5000
MONGO_URI=
```

Frontend:

```env
REACT_APP_API_BASE_URL=your_api_url
```

---

## 🎯 Vision

Most PDF readers focus only on displaying documents.

ReadWise aims to become a complete learning and knowledge platform where users can:

* Read
* Search
* Highlight
* Annotate
* Summarize
* Learn
* Revisit knowledge

all from a single workspace.

---

## 📌 Current Status

Active development.

Recently completed:

* PDF Search Engine
* Highlight Manager
* Keyboard Shortcuts
* Bookmarks
* Reading Progress Tracking
* MongoDB Text Indexing

Currently building:

* Advanced Notes System

Next:

* AI Summaries
* PDF Chat
* Flashcards
* Semantic Search

---

## 📜 License

MIT License

---

Built with ❤️ for readers, learners, developers, and knowledge workers.

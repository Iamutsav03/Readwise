# 📖 ReadWise – AI Reading Platform (MERN Stack)

A beginner-friendly MERN stack foundation for an AI-powered PDF reading platform.

---

## 📁 Project Structure

```
readwise/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   └── pdfController.js      # Upload, list, view logic
│   ├── middleware/
│   │   └── upload.js             # Multer file upload config
│   ├── models/
│   │   └── PDF.js                # Mongoose PDF schema
│   ├── routes/
│   │   ├── testRoutes.js         # GET /api/test
│   │   └── pdfRoutes.js          # PDF CRUD routes
│   ├── uploads/                  # Uploaded PDFs stored here
│   ├── .env                      # Environment variables (don't commit)
│   ├── .env.example              # Template for .env
│   ├── server.js                 # Express app entry point
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Top navigation bar
    │   │   ├── PDFUpload.jsx     # File picker + upload button
    │   │   ├── PDFViewer.jsx     # iframe-based PDF viewer
    │   │   └── PDFHistory.jsx    # List of past uploads
    │   ├── pages/
    │   │   └── Home.jsx          # Main page layout
    │   ├── utils/
    │   │   └── api.js            # All axios API calls
    │   ├── App.js
    │   ├── index.js
    │   └── index.css             # Tailwind CSS imports
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) (local) **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- npm (comes with Node.js)

---

## 🚀 Setup & Installation

### Step 1 — Clone or download this project

```bash
# If using git:
git clone <your-repo-url>
cd readwise
```

---

### Step 2 — Set up the Backend

```bash
# Navigate into the backend folder
cd backend

# Install all dependencies
npm install

# The .env file is already created for you.
# If you want to use MongoDB Atlas, open .env and update MONGO_URI:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/readwise

# Create the uploads folder (if it doesn't exist)
mkdir -p uploads

# Start the backend server (with auto-reload via nodemon)
npm run dev
```

✅ You should see:
```
🚀 Server running on http://localhost:5000
✅ MongoDB Connected: localhost
```

---

### Step 3 — Set up the Frontend

Open a **new terminal window**:

```bash
# Navigate into the frontend folder
cd frontend

# Install all dependencies (this may take a minute)
npm install

# Start the React development server
npm start
```

✅ Your browser should automatically open: `http://localhost:3000`

---

## 🧪 Test the API

Once the backend is running, test it in your browser or with curl:

```
GET http://localhost:5000/api/test
```

Expected response:
```json
{
  "success": true,
  "message": "✅ ReadWise API is running!",
  "timestamp": "..."
}
```

---

## 📡 API Endpoints

| Method | Endpoint                       | Description                  |
|--------|--------------------------------|------------------------------|
| GET    | `/api/test`                    | Health check                 |
| POST   | `/api/pdfs/upload`             | Upload a PDF file            |
| GET    | `/api/pdfs`                    | Get all uploaded PDFs        |
| GET    | `/api/pdfs/view/:filename`     | Serve a PDF for the browser  |

---

## 🔧 Environment Variables (backend/.env)

| Variable    | Description                        | Default                                    |
|-------------|------------------------------------|--------------------------------------------|
| `PORT`      | Port the Express server runs on    | `5000`                                     |
| `MONGO_URI` | MongoDB connection string          | `mongodb://localhost:27017/readwise`        |

---

## 🛠️ Technologies Used

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React, Tailwind CSS, Axios |
| Backend   | Node.js, Express          |
| Database  | MongoDB, Mongoose         |
| File Upload | Multer                  |
| Dev Tool  | Nodemon                   |

---

## 🔮 Future Extensions (Ideas)

- AI summarization using Claude API or OpenAI
- Highlight and annotation system
- User authentication (JWT)
- Cloud storage for PDFs (AWS S3 / Cloudinary)
- Full-text search across uploaded PDFs
- Reading progress tracking

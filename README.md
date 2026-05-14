# 📄 PDF Toolkit — Web-Based PDF Merger Prototype

Modern PDF merging tool built with vanilla JavaScript, PDF.js, and PDF-Lib.

Designed with a clean modular architecture, drag-and-drop workflows, live PDF previews, and client-side PDF processing.

---

## 👨‍💻 Project Details

Project Name: PDF Toolkit

Repository: pdf-toolkit

Developed By: Nikhil Chaudhary

Tech Stack: HTML5 • CSS3 • JavaScript • PDF.js • PDF-Lib

Project Type: Frontend Web Prototype

Year: 2026

---

## ✨ Features

- Merge multiple PDFs directly in the browser

- Drag & drop PDF uploads

- Live PDF preview system

- Inline preview panel + modal preview

- PDF page navigation

- Drag-to-reorder PDF sequence

- Move Up / Move Down controls

- Download merged PDF instantly

- Rename merged PDF before download

- Upload validation and duplicate prevention

- Toast notifications and loading states

- Responsive modern UI

- Fully client-side processing (no backend required)

---

## 🛠 Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling & Responsive Layout |
| Vanilla JavaScript | Application Logic |
| PDF.js | PDF Rendering & Preview |
| PDF-Lib | PDF Merging |
| SVG Icons | UI Icons |

---

## ▶️ How to Run

1. Download or clone the repository

2. Open the project folder

3. Run using any local server

Example using VS Code Live Server:

Right Click index.html → Open with Live Server

4. Open in browser

---

## 📂 Project Structure

pdf-toolkit/

├── index.html

├── style.css

├── script.js

│

├── assets/

│   ├── icons/

│   ├── screenshots/

│   └── previews/

│

└── README.md

---

## 🧠 Core Architecture Overview

The application follows a modular frontend architecture using centralized state management and event-driven UI updates.

Global State

│

├── File Upload System

│   ├── Drag & Drop Upload

│   ├── File Validation

│   └── Duplicate Detection

│

├── PDF Preview System

│   ├── Modal Preview

│   ├── Inline Preview

│   ├── Page Navigation

│   └── Thumbnail Rendering

│

├── File Management System

│   ├── Reordering

│   ├── Removal

│   └── Sorting

│

├── Merge Engine

│   ├── PDF-Lib Integration

│   └── Sequential PDF Merging

│

├── Download Manager

│   ├── Blob Generation

│   └── Dynamic File Naming

│

└── UI Feedback System

    ├── Toast Notifications

    ├── Loading Spinner

    └── Upload Progress

---

## 🎯 Key Functionalities

### 📤 Upload System

Supports:

- Multiple PDF uploads

- Drag-and-drop interaction

- File input browsing

- Duplicate file prevention

- File size validation

- Invalid PDF detection

---

### 👀 Preview System

Built using PDF.js rendering.

Features:

- First-page thumbnail generation

- Modal PDF preview

- Inline preview panel

- Previous / Next page navigation

- Dynamic page indicators

- Canvas-based rendering

---

### 🔀 PDF Reordering

Users can:

- Drag & reorder files

- Move files up/down manually

- Rearrange merge sequence visually

The final merge order follows the visible file order.

---

### ⚡ Merge Engine

Built using PDF-Lib.

Process:

1. Creates new PDF document

2. Loads uploaded PDFs

3. Copies all pages sequentially

4. Combines pages into final document

5. Generates downloadable merged PDF

Everything runs locally in the browser.

No server uploads required.

---

### 📥 Download System

Features:

- Auto-generated file names

- Custom file name input

- Blob-based PDF download

- Instant browser download

---

## 🧩 Design Patterns & Practices

### State-Based Architecture

A centralized state object manages:

- Uploaded files

- Current preview index

- Current page

- Merged PDF output

- Drag state

Benefits:

- Predictable UI updates

- Easier debugging

- Cleaner state flow

---

### Modular Function Design

Each feature is isolated into dedicated systems.

Examples:

- Upload handling

- Merge handling

- Preview rendering

- Toast notifications

- File ordering

Benefits:

- Easier maintenance

- Better scalability

- Cleaner code organization

---

### Event-Driven UI

The application heavily relies on:

- DOM event listeners

- Dynamic UI rendering

- User interaction callbacks

Examples:

- Drag events

- File selection events

- Button click events

- Keyboard shortcuts

---

### Defensive Programming

The project includes extensive validation checks.

Examples:

- Invalid PDF handling

- Missing file detection

- Safe page navigation

- Duplicate prevention

- Corrupted file protection

Benefits:

- Improved stability

- Better user experience

- Safer runtime execution

---

## 🔒 Client-Side Processing

All PDF operations happen locally in the browser.

Benefits:

- No backend required

- Faster performance

- Better privacy

- No file uploads to servers

---

## 🎨 UI/UX Features

- Responsive layout

- Clean modern interface

- Accessible buttons and labels

- SVG icon system

- Smooth interaction feedback

- Inline + modal preview experience

- Toast-based notifications

- Loading indicators

---

## 📦 External Libraries

| Library | Purpose |
|----------|---------|
| PDF.js | PDF rendering & previews |
| PDF-Lib | PDF merging & generation |

CDN-based integration used for lightweight setup.

---

## 🚀 Possible Future Improvements

| Feature | Description |
|----------|-------------|
| PDF Compression | Reduce output file size |
| Page Rotation | Rotate selected pages |
| Page Deletion | Remove pages before merge |
| Dark Mode | Theme switching |
| Cloud Storage | Google Drive / Dropbox integration |
| Split PDF | Extract specific pages |
| Password Protection | Secure exported PDFs |
| OCR Support | Searchable scanned PDFs |

---

## 📚 Key Learnings

This prototype helped improve understanding of:

- Client-side PDF processing

- Browser-based file handling

- Canvas rendering workflows

- Drag-and-drop interfaces

- State management patterns

- Modular JavaScript architecture

- Blob downloads

- Defensive frontend programming

- Dynamic DOM rendering

- PDF.js integration

- PDF-Lib integration

---

## 📝 Development Summary

| Phase | Description |
|--------|-------------|
| Phase 1 | HTML structure and responsive layout |
| Phase 2 | File upload system |
| Phase 3 | PDF validation and thumbnail generation |
| Phase 4 | Modal and inline preview systems |
| Phase 5 | Drag-and-drop reordering |
| Phase 6 | PDF merge engine |
| Phase 7 | Download workflow |
| Phase 8 | Toast notifications and loading states |
| Phase 9 | Defensive error handling |
| Phase 10 | UI polishing and optimization |

---

## 📄 License

This project is created as a frontend prototype for learning, architecture practice, and portfolio demonstration purposes.

---

## 🙌 Author

Nikhil Chaudhary

Frontend & Unity Developer

2026

# 📜 Famous Quotes (Wisdom Vault)

A lightweight and responsive web application and RESTful API for browsing, searching, and discovering famous quotes across multiple categories and authors. Built with **Python / Flask** and **Vanilla JavaScript**.

---

## ✨ Features

- 🎲 **Random Quote Generator**: Get a new random quote instantly with smooth UI transitions.
- 🏷️ **Category & Author Filtering**: Browse quotes categorized by *Wisdom, Motivation, Tech, Philosophy, Life*, and more.
- 🔍 **Real-Time Search**: Live keyword search matching quotes and author names with built-in debouncing.
- 📋 **Copy to Clipboard**: Quick one-click copy button with toast feedback.
- ⚡ **RESTful API**: Clean JSON endpoints for quotes, search queries, categories, and authors.
- 🧪 **Automated Test Suite**: Full test coverage with `pytest`.

---

## 🛠️ Tech Stack

- **Backend**: Python 3, Flask
- **Frontend**: HTML5, Modern CSS (Responsive Grid & Flexbox), Vanilla JavaScript (ES6+)
- **Testing**: pytest
- **Data Source**: JSON-backed local storage (`data/quotes.json`)

---

## 📁 Project Structure

```text
├── app.py                 # Flask server, routes, and REST API endpoints
├── data/
│   └── quotes.json        # Quotes dataset (JSON)
├── static/
│   ├── css/
│   │   └── style.css      # UI styling, responsive layout, animations
│   └── js/
│       └── app.js         # Frontend JavaScript (AJAX fetch, DOM rendering)
├── templates/
│   └── index.html         # Main web page template
├── tests/
│   └── test_api.py        # Automated test suite
├── pytest.ini             # Pytest configuration
├── requirements.txt       # Project dependencies
└── .gitignore             # Git ignore rules
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+ installed on your system.

### 1. Clone the Repository

```bash
git clone git@github.com:A1MaHaiD/handroid-famous-quotes.git
cd handroid-famous-quotes
```

### 2. Set Up Virtual Environment

```bash
# Create a virtual environment
python3 -m venv .venv

# Activate the virtual environment
# On Linux / macOS:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

Open your browser and navigate to:
👉 **`http://localhost:5000`**

---

## 📡 API Reference

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/quotes` | Get all quotes | None |
| `GET` | `/api/quotes/random` | Get a random quote | `category` *(optional)*, `author` *(optional)* |
| `GET` | `/api/quotes/search` | Search quotes | `q` *(keyword)*, `category`, `author` |
| `GET` | `/api/quotes/export/csv` | Export quotes as CSV file | `q`, `category`, `author` |
| `GET` | `/api/categories` | List all unique categories & counts | None |
| `GET` | `/api/authors` | List all unique authors & counts | None |

### Example API Request

```bash
# Fetch a random motivational quote
curl http://localhost:5000/api/quotes/random?category=Motivation
```

**Response (`200 OK`):**
```json
{
  "id": 1,
  "quote": "The only way to do great work is to love what you do.",
  "author": "Steve Jobs",
  "category": "Motivation",
  "tags": ["work", "passion", "success"]
}
```

---

## 🧪 Running Tests

Run the test suite with `pytest`:

```bash
pytest
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

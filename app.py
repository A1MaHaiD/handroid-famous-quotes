import json
import os
import random
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Path to the quotes data file
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'quotes.json')

def load_quotes():
    """Load quotes from the JSON data file."""
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/')
def index():
    """Serve the main application page."""
    return render_template('index.html')

@app.route('/api/quotes', methods=['GET'])
def get_all_quotes():
    """Return all quotes."""
    quotes = load_quotes()
    return jsonify({
        'total': len(quotes),
        'quotes': quotes
    })

@app.route('/api/quotes/random', methods=['GET'])
def get_random_quote():
    """Return a single random quote, optionally filtered by category or author."""
    quotes = load_quotes()
    category = request.args.get('category', '').strip().lower()
    author = request.args.get('author', '').strip().lower()

    filtered = quotes
    if category:
        filtered = [q for q in filtered if q.get('category', '').lower() == category]
    if author:
        filtered = [q for q in filtered if author in q.get('author', '').lower()]

    if not filtered:
        return jsonify({
            'error': 'No quotes found matching the specified criteria'
        }), 404

    return jsonify(random.choice(filtered))

@app.route('/api/quotes/search', methods=['GET'])
def search_quotes():
    """
    Search quotes by text keyword, author, or category.
    Query params:
        - q: Search string matching quote text or author
        - author: Exact or substring match for author name
        - category: Exact match for category
    """
    quotes = load_quotes()
    query = request.args.get('q', '').strip().lower()
    author = request.args.get('author', '').strip().lower()
    category = request.args.get('category', '').strip().lower()

    results = quotes

    if category:
        results = [q for q in results if q.get('category', '').lower() == category]

    if author:
        results = [q for q in results if author in q.get('author', '').lower()]

    if query:
        results = [
            q for q in results
            if query in q.get('quote', '').lower() or query in q.get('author', '').lower()
        ]

    return jsonify({
        'count': len(results),
        'results': results
    })

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Return all unique categories with quote counts."""
    quotes = load_quotes()
    categories_map = {}
    for q in quotes:
        cat = q.get('category', 'General')
        categories_map[cat] = categories_map.get(cat, 0) + 1
    
    sorted_categories = sorted([
        {'name': cat, 'count': count}
        for cat, count in categories_map.items()
    ], key=lambda x: x['name'])

    return jsonify(sorted_categories)

@app.route('/api/authors', methods=['GET'])
def get_authors():
    """Return all unique authors sorted alphabetically."""
    quotes = load_quotes()
    authors_map = {}
    for q in quotes:
        author = q.get('author', 'Unknown')
        authors_map[author] = authors_map.get(author, 0) + 1

    sorted_authors = sorted([
        {'name': author, 'count': count}
        for author, count in authors_map.items()
    ], key=lambda x: x['name'])

    return jsonify(sorted_authors)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

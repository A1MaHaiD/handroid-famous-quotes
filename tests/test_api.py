import json
import os
import pytest
from app import app, DATA_FILE, load_quotes

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_quotes_file_integrity():
    """Verify that quotes.json contains exactly 100 valid quotes."""
    assert os.path.exists(DATA_FILE), "quotes.json must exist"
    quotes = load_quotes()
    assert len(quotes) == 100, f"Expected 100 quotes, found {len(quotes)}"
    
    ids = set()
    for item in quotes:
        assert 'id' in item and isinstance(item['id'], int)
        assert 'quote' in item and len(item['quote'].strip()) > 0
        assert 'author' in item and len(item['author'].strip()) > 0
        assert 'category' in item and len(item['category'].strip()) > 0
        assert item['id'] not in ids, f"Duplicate ID found: {item['id']}"
        ids.add(item['id'])

def test_index_page(client):
    """Verify home page loads correctly."""
    response = client.get('/')
    assert response.status_code == 200
    assert b'Wisdom Vault' in response.data

def test_get_all_quotes(client):
    """Verify GET /api/quotes returns 100 quotes."""
    response = client.get('/api/quotes')
    assert response.status_code == 200
    data = response.get_json()
    assert data['total'] == 100
    assert len(data['quotes']) == 100

def test_get_random_quote(client):
    """Verify GET /api/quotes/random returns a single valid quote."""
    response = client.get('/api/quotes/random')
    assert response.status_code == 200
    data = response.get_json()
    assert 'quote' in data
    assert 'author' in data
    assert 'category' in data

def test_get_random_quote_filtered(client):
    """Verify random quote with category filter."""
    response = client.get('/api/quotes/random?category=Science')
    assert response.status_code == 200
    data = response.get_json()
    assert data['category'].lower() == 'science'

def test_search_by_keyword(client):
    """Verify search by keyword."""
    response = client.get('/api/quotes/search?q=Einstein')
    assert response.status_code == 200
    data = response.get_json()
    assert data['count'] > 0
    for res in data['results']:
        assert 'einstein' in res['author'].lower() or 'einstein' in res['quote'].lower()

def test_search_by_author(client):
    """Verify search by author."""
    response = client.get('/api/quotes/search?author=Steve Jobs')
    assert response.status_code == 200
    data = response.get_json()
    assert data['count'] >= 3
    for res in data['results']:
        assert 'steve jobs' in res['author'].lower()

def test_search_by_category(client):
    """Verify search by category."""
    response = client.get('/api/quotes/search?category=Philosophy')
    assert response.status_code == 200
    data = response.get_json()
    assert data['count'] > 0
    for res in data['results']:
        assert res['category'].lower() == 'philosophy'

def test_categories_endpoint(client):
    """Verify GET /api/categories returns populated list."""
    response = client.get('/api/categories')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) > 0
    cat_names = [c['name'] for c in data]
    assert 'Philosophy' in cat_names
    assert 'Inspiration' in cat_names

def test_authors_endpoint(client):
    """Verify GET /api/authors returns populated list."""
    response = client.get('/api/authors')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) > 0
    author_names = [a['name'] for a in data]
    assert 'Albert Einstein' in author_names

def test_export_quotes_csv_all(client):
    """Verify CSV export for all quotes."""
    response = client.get('/api/quotes/export/csv')
    assert response.status_code == 200
    assert response.mimetype == 'text/csv'
    assert 'attachment; filename="quotes.csv"' in response.headers.get('Content-Disposition', '')
    csv_text = response.data.decode('utf-8')
    lines = csv_text.strip().splitlines()
    assert len(lines) == 101  # 1 header + 100 quotes
    assert lines[0] == 'ID,Quote,Author,Category,Tags'

def test_export_quotes_csv_filtered(client):
    """Verify CSV export with filters."""
    response = client.get('/api/quotes/export/csv?category=Science&author=Einstein')
    assert response.status_code == 200
    csv_text = response.data.decode('utf-8')
    lines = csv_text.strip().splitlines()
    assert len(lines) > 1  # Header + at least one match
    for line in lines[1:]:
        assert 'Einstein' in line


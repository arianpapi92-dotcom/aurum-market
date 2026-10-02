import csv
import time
from datetime import datetime
from pathlib import Path
import requests
from bs4 import BeautifulSoup

URL = 'https://www.tgju.org/'
BASE_DIR = Path(__file__).resolve().parent.parent
CSV_FILE = BASE_DIR / 'market_prices.csv'
MARKETS = {
    'gold18': 'geram18',
    'gold24': 'geram24',
    'full_coin': 'sekee',
    'half_coin': 'nim',
    'quarter_coin': 'rob',
}
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136.0.0.0 Safari/537.36'}

def clean_price(value):
    return int(value.replace(',', '').replace('٬', '').strip())

def fetch_prices():
    response = requests.get(URL, headers=HEADERS, timeout=20)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    prices = {}
    for key, slug in MARKETS.items():
        price = None
        # There can be several elements with the same market slug. Prefer one carrying data-price.
        for element in soup.find_all(attrs={'data-market-row': slug}):
            price = element.get('data-price')
            if not price:
                p = element.find(attrs={'data-market-name': 'p'})
                if p:
                    price = p.get_text(strip=True)
            if price:
                break
        prices[key] = clean_price(price) if price else None
    return prices

def save_row(prices):
    exists = CSV_FILE.exists()
    with CSV_FILE.open('a', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        if not exists or CSV_FILE.stat().st_size == 0:
            writer.writerow(['timestamp','gold18','gold24','full_coin','half_coin','quarter_coin'])
        writer.writerow([
            datetime.now().isoformat(timespec='seconds'),
            prices['gold18'], prices['gold24'], prices['full_coin'],
            prices['half_coin'], prices['quarter_coin']
        ])

def run_forever(interval=60):
    print('AURUM collector started — interval: 60 seconds')
    while True:
        try:
            prices = fetch_prices()
            save_row(prices)
            print('Saved', datetime.now().strftime('%H:%M:%S'), prices)
        except Exception as exc:
            print('Collector error:', exc)
        time.sleep(interval)

if __name__ == '__main__':
    run_forever()

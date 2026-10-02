import csv
from pathlib import Path
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render

CSV_FILE = Path(settings.BASE_DIR) / 'market_prices.csv'

def _read_history():
    if not CSV_FILE.exists():
        return []
    with CSV_FILE.open('r', encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))

def index(request):
    return render(request, 'market/index.html')

def history(request):
    return JsonResponse(_read_history(), safe=False)

def latest(request):
    rows = _read_history()
    return JsonResponse(rows[-1] if rows else {})

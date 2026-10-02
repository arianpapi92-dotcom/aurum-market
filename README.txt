AURUM MARKET PRO — Django Dashboard

1) Extract the project.
2) Open PowerShell in this folder.
3) Install dependencies:
   python -m pip install -r requirements.txt

Terminal 1 (collect prices every 60 seconds):
   python -m market.collector

Terminal 2 (Django):
   python manage.py runserver

Open:
   http://127.0.0.1:8000/

The dashboard uses Chart.js and Google Fonts from CDN, so internet access is needed for those UI resources.

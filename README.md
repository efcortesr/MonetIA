```powershell
1) Backend Django — apps/api
En c:\Users\Emman\MonetIA\apps\api corre esto tal cual:

```powershell
python -m venv .venv
```
Luego actívalo así (nota el .\ al inicio):

```powershell
.\.venv\Scripts\Activate.ps1
```
    
```powershell
pip install -r requirements.txt
```
    
```powershell
cd src
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

```
2) Frontend Next.js — apps/web
En otra terminal, en c:\Users\Emman\MonetIA\apps\web:
```

```powershell
npm install
```

```powershell
npm run dev
```

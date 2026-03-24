# MonetIA - Guía de Configuración Local

Bienvenido al proyecto **MonetIA**. Aquí están las instrucciones paso a paso para que cualquier miembro del equipo pueda configurar y correr el proyecto en su máquina local, incluyendo la última actualización del motor de Inteligencia Artificial (Gemini).

---

## 1. Backend Django — `apps/api`

Abre una terminal y navega hasta la carpeta del backend:
```powershell
cd apps/api
```

### Paso 1: Crear y activar el entorno virtual
Si es la primera vez que clonas el proyecto, crea el entorno virtual:
```powershell
python -m venv .venv
```
Luego actívalo (en Windows PowerShell):
```powershell
.\.venv\Scripts\Activate.ps1
```

### Paso 2: Instalar Dependencias (¡NUEVO!)
Se han agregado nuevas dependencias (como `google-generativeai`). **Es obligatorio reinstalar los requerimientos** para que el código no falle:
```powershell
pip install -r requirements.txt
```

### Paso 3: Configurar Variables de Entorno (API Keys)
Debes crear tu propio archivo oculto `.env` local para que funcione la IA.
1. Entra a la carpeta de código:
   ```powershell
   cd src
   ```
2. Si no tienes un `.env`, cópialo del ejemplo:
   ```powershell
   copy .env.example .env
   ```
3. **¡IMPORTANTE!** Abre el archivo `.env` en tu editor e inserta la siguiente clave para activar las recomendaciones inteligentes. Si no pones esta clave, la app no se romperá, pero usará el sistema matemático de respaldo (Fallback) en lugar de la inteligencia artificial:
   ```env
   GEMINI_API_KEY=tu_clave_de_gemini_aqui
   ```
   *(Pídele la clave a tu líder técnico o genera una gratuita en Google AI Studio).*

### Paso 4: Migrar la Base de Datos (¡NUEVO!)
Se crearon nuevas tablas en la base de datos para guardar las recomendaciones (`Recommendation model`). **Debes aplicar estas migraciones** antes de prender el servidor:
```powershell
python manage.py migrate
```

### Paso 5: Correr el servidor
Finalmente, levanta el backend:
```powershell
python manage.py runserver
```
*(El backend quedará corriendo en `http://127.0.0.1:8000/`)*

---

## 2. Frontend Next.js — `apps/web`

Abre **otra terminal nueva** y navega hasta la carpeta del frontend:
```powershell
cd apps/web
```

### Paso 1: Instalar dependencias
```powershell
npm install
```

### Paso 2: Levantar el entorno de desarrollo
```powershell
npm run dev
```

*(El frontend estará disponible en `http://localhost:3000/`)*

---

### Resumen rápido para cuando haces un `git pull`

Cada vez que descargues actualizaciones de la rama principal (`main` o la rama del desarrollador), por favor recuerda correr estos dos comandos en el backend por si alguien agregó código o librerías nuevas:

```powershell
# En apps/api
pip install -r requirements.txt

# En apps/api/src
python manage.py migrate
```

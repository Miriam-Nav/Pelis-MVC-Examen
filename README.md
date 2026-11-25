# Aplicació Movies amb patró MVC

Aplicació web i API REST per a gestionar una col·lecció de pel·lícules (CRUD) desenvolupada amb Node.js 24, Express 5, Mongoose 9, MongoDB i Nunjucks, estructurada seguint el patró Model-Vista-Controlador (MVC).

## Requisits previs

- Node.js 24 LTS i npm
- MongoDB (local o mitjançant Docker)

## Instal·lació i execució

1. **Instal·lar les dependències:**
   ```bash
   npm install
   ```

2. **Configurar les variables d'entorn:**
   Crea un fitxer `.env` en l'arrel del projecte a partir de `.env.example`:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/movies
   PORT=3000
   ```

3. **Arrancar MongoDB (amb Docker Compose):**
   ```bash
   docker compose up -d
   ```

4. **Iniciar el servidor:**
   ```bash
   node app.js
   ```

5. **Accedir a l'aplicació:**
   - Interfície web: `http://localhost:3000/movies`
   - API JSON: `http://localhost:3000/api/movies`

## Estructura del projecte

- **`models/`**: Conté l'esquema i el model de Mongoose (`movie.js`), encarregat de definir l'estructura de les pel·lícules, les validacions i la comunicació amb MongoDB.
- **`controllers/`**: Conté la lògica de les operacions CRUD (`movies.js`) tant per a l'API com per a la interfície web. Coordina les peticions, consulta el model i decidix la resposta (JSON, vista HTML o redirecció).
- **`routes/`**: Defineix les rutes de l'aplicació i les associa amb les funcions del controlador, sense realitzar consultes directes a la base de dades:
  - `movies-api.js`: Rutes de l'API REST (`/api/movies`).
  - `movies-web.js`: Rutes de la interfície web (`/movies`).
- **`views/`**: Plantilles Nunjucks (`.njk`) que generen les pàgines HTML (plantilla base, llistat, detall, formulari de creació/edició i pàgina d'error) a partir de les dades rebudes del controlador.
- **`public/`**: Fitxers estàtics accessibles directament des del navegador, com els fulls d'estil (`css/app.css`).
- **`app.js`**: Punt d'entrada de l'aplicació. Configura Express, Nunjucks, els middlewares, la connexió a MongoDB, el registre de rutes i la gestió global d'errors.
# Pelis-MVC: aplicación Node.js + MongoDB con Docker

Aplicación web (Express + Nunjucks) que hace un CRUD de películas sobre MongoDB.

Las imágenes están publicadas en GitHub Container Registry:
- `ghcr.io/miriam-nav/pelis-app:1.0`: la aplicación
- `ghcr.io/miriam-nav/pelis-mongo:1.0`: MongoDB 7.0 con los datos iniciales

## Requisitos
Solo Docker (con Docker Compose). No hace falta instalar Node.js ni MongoDB.

## Puesta en marcha

```bash
git clone [https://github.com/Miriam-Nav/Pelis-MVC-Examen.git](https://github.com/Miriam-Nav/Pelis-MVC-Examen.git)
cd Pelis-MVC-Examen
cp .env.example .env
# (Opcional) edita .env para poner tu propia contraseña
docker compose pull
docker compose up -d
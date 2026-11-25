FROM mongo:7.0
LABEL org.opencontainers.image.source=https://github.com/Miriam-Nav/Pelis-MVC-Examen
COPY movies.json 01-importar-movies.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/01-importar-movies.sh
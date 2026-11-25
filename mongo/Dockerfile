FROM mongo:7.0
COPY movies.json 01-importar-movies.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/01-importar-movies.sh
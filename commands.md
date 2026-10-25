docker run -d \
  --name db \
  -e MARIADB_ROOT_PASSWORD="sick" \
  -e MARIADB_DATABASE=testdb \
  -v db-data:/var/lib/mysql \
  -v "$(pwd)/db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro" \
  mariadb:11.4


docker network create meinNetz

docker network connect meinNetz db

docker run -d \
  --name app \
  --network meinNetz \
  -e MARIADB_HOST=db \
  -e MARIADB_PASSWORD="sick" \
  -p 3000:3000 \
  backend

docker run -d \
  --name frontend \
  --network meinNetz \
  -p 8080:80 \
  frontend


zum deleten des networks
docker network rm meinNetz
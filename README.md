# 3D ViralHuman Interactome Web Server
Source code for the Django Web Server, data is not included. The running server site is: https://3d-viralhuman.yulab.org


Build and run servers:
With `docker-compose` or `docker compose` command
Setup `docker-compose.yml` and `Dockerfile` (also with `.env` and `requirements.txt`, see these file under BASEDIR)
Build images. Go to BASEDIR, run
`docker-compose build` (or `docker compose build` if `docker-compose` does not exist)
Run containers. After building the image, run
`docker-compose up` (or `docker compose up`). Use `-d` to run the container in the background
With `docker` and manually link web server and database server (if both `docker-compose` and `docker compose` do not work)
Build web image
`docker build -t vh3d .`
Create an image and container for the database (if port 5432 is not available, change the first 5432 to another one and change .env accordingly)
`docker run -d --name db -e POSTGRES_DB=postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e TZ=UTC -p 5432:5432 postgres`
Run web container with the link to database container (8888 is the host port, 8020 is the internal port)
`docker run -t -d --name web --link [database_container_id]:db -v $BASEDIR:$BASEDIR -p 8888:8020 -e DJANGO_DB_HOST=db -e DJANGO_DB_PORT=5432 -e DJANGO_DB_NAME=postgres -e DJANGO_DB_USER=postgres -e DJANGO_DB_PASSWORD=postgres [web_image_id]`

Post-setup:
Make migrations after running the containers
Log in to the server bash shell:
`docker exec -it [web_container_id] bash
Make migrations:
`python manage.py makemigrations`
`python manage.py migrate`
Update database (inside the server bash)
`python manage.py update_Protein`
`python manage.py update_SingleModel`
`python manage.py update_DockedModel`
`python manage.py update_Interface`
`python manage.py update_InterfaceSimilarity`

Access the webserver:
Locally (development):
[server ip]:[host port] (for example, if I run the containers on cbsuhy02, then the address of the webserver is `cbsuhy02.biohpc.cornell.edu:8888`)
Publicly (production):
Contact BioHPC for help
Make sure the webserver is running smoothly on r9host
Send them the domain name you prefer (e.g. 3d-viralhost.yulab.org), host port, web container name/id

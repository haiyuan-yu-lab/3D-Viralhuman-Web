# 3D ViralHuman Interactome Web Server
Source code for the Django Web Server, data is not included. The running server site is https://3d-viralhuman.yulab.org.

## Build and run servers:
1. With `docker-compose` or `docker compose` command
    - Setup `docker-compose.yml` and `Dockerfile` (also with `.env` and `requirements.txt`, see these file under BASEDIR)
    - Build images. Go to BASEDIR, run
      - `docker-compose build` (or `docker compose build` if `docker-compose` does not exist)
    - Run containers. After building the image, run
      - `docker-compose up` (or `docker compose up`). Use `-d` to run the container in the background
2. With `docker` and manually link the web server and database server (if both `docker-compose` and `docker compose` do not work)
    - Build web image
      - `docker build -t vh3d .`
    - Create an image and container for the database (if port 5432 is not available, change the first 5432 to another one and change .env accordingly)
      - `docker run -d --name db -e POSTGRES_DB=postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e TZ=UTC -p 5432:5432 postgres`
    - Run web container with the link to database container (8888 is the host port, 8020 is the internal port)
      - `docker run -t -d --name web --link [database_container_id]:db -v $BASEDIR:$BASEDIR -p 8888:8020 -e DJANGO_DB_HOST=db -e DJANGO_DB_PORT=5432 -e DJANGO_DB_NAME=postgres -e DJANGO_DB_USER=postgres -e DJANGO_DB_PASSWORD=postgres [web_image_id]`

## Post-setup:
1. Make migrations after running the containers
    - Log in to the server bash shell:
      - `docker exec -it [web_container_id] bash
    - Make migrations:
      - `python manage.py makemigrations`
      - `python manage.py migrate`
2. Update database (inside the server bash)
    - `python manage.py update_Protein`
    - `python manage.py update_SingleModel`
    - `python manage.py update_DockedModel`
    - `python manage.py update_Interface`
    - `python manage.py update_InterfaceSimilarity`

## Access the webserver:
1. Locally (development):
    - [server ip]:[host port] (for example, if I run the containers on the server with address `xxx.xxx.xxx`, then the address of the webserver is `xxx.xxx.xxx:8888`)
2. Publicly (production):
    - Make sure the webserver is running smoothly on your server
    - Contact the server owner/technician to set up the proxy to the public domain
  
## Contact
Please contact ll863@cornell.edu if you have any questions.

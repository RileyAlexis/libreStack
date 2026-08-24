# <img src="client/public/libreStackLogoTitle.svg" height="100">

Self-hosted server for DRM free epubs with an offline capable Progressive Web App front end. Librestack hosts your ebooks on your hardware with no tracking, ads or stores. Think JellyFin but for books.

![ipad image showing book covers](/docsSite/static/img/screen_ipad_01.png)
![ipad view of an intro page of Pride and Prejudice](/docsSite/static/img/screen_ipad_book01.png)
![ipad view of Alice and Wonderland in dark mode](/docsSite/static/img/screen_ipad_darkMode.png)
![ipad view of Little Women with Spine showing](/docsSite/static/img/Screenshot%202026-08-03%20at%2010.44.43 AM.png)
![ipad view of book description dialog](/docsSite/static/img/screen_ipad_description.png)
![ipad view of book metadata dialog](/docsSite/static/img/screen_ipad_metadata.png)

## Getting Started

Prerequisites:

- Web Server with domain name or Dynamic DNS and ssh access (instructions are for Debian/Ubuntu with Nginx)
- Certbot[https://certbot.eff.org] to set up SSL certificates for https

Install from Source

```
git clone https://github.com/RileyAlexis/libreStack
```

Install Docker Compose[https://docs.docker.com/compose/install/linux/]

```
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

Build image from source

```
docker compose build
```

Start the Application

```
docker compose up -d
```

Nginx

Create LibreStack Nginx config in /etc/nginx/sites-enabled:

```
server {
    listen 443 ssl;
    server_name [domain or IP];

    ssl_certificate /etc/letsencrypt/live/[domain or IP]/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/[domain or IP]/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

	proxy_buffering on;
	proxy_buffer_size 128k;
	proxy_buffers 4 256k;
	proxy_busy_buffers_size 256k;
    }
}

server {
    listen 80;
    server_name [domain or IP];
    return 301 https://$server_name$request_uri;
}

```

First an admin user must be created. The email address is only used to add to the headers of the [Open Library API](https://openlibrary.org/developers/api) requests since adding an email increases the rate
limit from 1 to 3 requests per second.

## Create your first library.

The path must be the full disk path and LibreStack must have read permissions for that folder. The folder can be mounted from a NAS or other external storage. Write access is optional but without write
access LibreStack will be unable to add or delete books from your library (books can still be added manually to the folder and the library scan will pick them up).

## Add Books to Library

Books can be uploaded through the app: Manage -> Upload Book. Currently LibreStack only recognizes epub files and cannot parse .cbz files. If LibreStack does not have write access to the library folder upload will fail. Books can be manually added to the folder or subfolders within the library and the scan will pick them up: Library -> Scan Library. Malformed ebooks may not be picked up by the scan. For specifics on which books fail check the server logs `docker compose logs app -f` or the Parsing Errors dialog in the Server Settings screen in the app.

## Mobile App

LibreStack is a Progressive Web App and can be installed directly from the web browser.

- Android - Press Install App button and follow prompts
- iOS - Click Share icon -> More -> Add to Home Screen. Ensure Open as Web App is checked. Click Add

Librestack is offline capable but books are not automatically downloaded. Click the download icon at the bottom right of each book in order to save for offline reading. The app uses IndexDB to store books for offline reading and some devices (Apple)
may agressively limit the space available for use. Recommend only storing a small number of books in the offline storage and clearing books that are completed (click the book menu -> Remove Download).

## Book Metadata

LibreStack connects to both Open Library and Wikidata in order to download metadata for each book. Availablilty of data for a given book is spotty. Librestack will attempt to place books into a series and order if data is available. This can also be set manually on the Edit Metadata screen.

## Tech

Librestack uses Dotnet 10 on the back end with a Postgres 17 database and a React 19 front end. Simple API documentation is available via Swagger at http://localhost:[server_port]/swagger/.

## Limitations

Librestack currently is only compatible with DRM free epub formats and depends on epub-ts[https://likecoin.github.io/epub.ts/] for front end rendering and VersOne[https://os.vers.one/EpubReader/] for parsing Epubs on the server. Librestack
does not have the capability to read .CBZ, .MOBI or any formats utilizing DRM. It does not support audio books. In case of parsing errors Librestack will attempt minimal repair of the offending file but its capabilities are limited. For more extensive repair or conversion of ebooks Calibre[https://calibre-ebook.com/download] is recommended.

## License

This project is open source under the MIT License. The logo and name are copyrighted by RileyAlexis and may not be reused or distributed.

## Feature Roadmap

- Implement user manager
- Implement ability to share books between local users
- Plan to implement ability to share libraries/books between server instances/remote users

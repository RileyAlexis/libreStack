# <img src="client/public/libreStack.svg" width="100"> Libre Stack

Self-hosted server for DRM free epubs with an offline capable Progressive Web App front end. Librestack hosts your ebooks on your hardware with no tracking, ads or stores. Think JellyFin but for books.

![ipad image showing book covers](/docsSite/static/img/screen_ipad_01.png)
![ipad view of an intro page of Pride and Prejudice](/docsSite/static/img/screen_ipad_book01.png)
![ipad view of Alice and Wonderland in dark mode](/docsSite/static/img/screen_ipad_darkMode.png)
![ipad view of Little Women with Spine showing](/docsSite/static/img/Screenshot%202026-08-03%20at%2010.44.43 AM.png)

## Getting Started

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

First an admin user must be created. The email address is only used to add to the headers of the [Open Library API](https://openlibrary.org/developers/api) requests since adding an email increases the rate
limit from 1 to 3 requests per second.

## Create your first library.

The path must be the full disk path and LibreStack must have read permissions for that folder. The folder can be mounted from a NAS or other external storage. Write access is optional but without write
access LibreStack will be unable to add or delete books from your library (books can still be added manually to the folder and the library scan will pick them up).

## Add Books to Library

Books can be uploaded through the app: Manage -> Upload Book. Currently LibreStack only recognizes epub files and cannot parse .cbz files. If LibreStack does not have write access to the library folder upload will fail. Books can be manually added to the folder or subfolders within the library and the scan will pick them up: Library -> Scan Library. Malformed ebooks may not be picked up by the scan. For specifics on which books fail check the server logs `docker compose logs app -f`.

## Mobile App

LibreStack is a Progressive Web App and can be installed directly from the web browser.

- Android - Press Install App button and follow prompts
- iOS - Click Share icon -> More -> Add to Home Screen. Ensure Open as Web App is checked. Click Add

Librestack is offline capable but books are not automatically downloaded. Click the download icon at the bottom right of each book in order to save for offline reading.

## Book Metadata

LibreStack connects to both Open Library and Wikidata in order to download metadata for each book. Availablilty of data for a given book is spotty. Librestack will attempt to place books into a series and order if data is available. This can also be set manually on the Edit Metadata screen.

## Tech

Librestack uses Dotnet 10 on the back end with a Postgres 17 database and a React 19 front end. Simple API documentation is available via Swagger at http://localhost:[server_port]/swagger/.

## Feature Roadmap

- Implement Bookmarking
- Implement category tagging
- Implement collections
- Implement in reader dictionary or web search lookup
- Implement ability to share books between libraries
- Plan to implement ability to share libraries/books between server instances

# Soko Backend (FastAPI + PostgreSQL)

This is the backend for the **Soko project**, built with **FastAPI**, **SQLAlchemy/SQLModel**, and **PostgreSQL**, containerized with Docker.


## Features

* FastAPI backend (async API framework)
* PostgreSQL database with persistence
* SQLAlchemy/SQLModel ORM
* Income logging, receipts, savings nudges, and fraud alerts
* Auto-reload in development with Uvicorn


## Prerequisites

Make sure you have installed:

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/)

Check versions:

```bash
docker --version
docker compose version
```


## Installation & Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/Annfelicty/soko.git
   cd soko/backend
   ```

2. **Configure environment variables**
   Create a `.env` file in the `backend/` directory with:

   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=tajiri
   DATABASE_URL=postgresql://postgres:postgres@db:5432/tajiri
   ```

3. **Build and start the containers**

   ```bash
   docker-compose up --build
   ```

4. **Access the backend**

   * FastAPI runs at: [http://localhost:5000](http://localhost:5000)
   * Interactive API docs: [http://localhost:5000/docs](http://localhost:5000/docs)



## Project Structure

```
backend/
├── app/
│   ├── main.py             # Entry point
│   ├── database.py         # DB connection
│   ├── models.py           # SQLModel models
│   ├── crud.py             # CRUD operations
│   ├── schemas.py          # Pydantic schemas
│   ├── routers/            # API endpoints
│   │   ├── savings_router.py
│   │   ├── transactions_router.py
│   │   └── sms_router.py
│   └── utils/              # Helpers (fraud detection, receipts, SMS parsing)
│
├── docker-compose.yml      # Services (backend + db)
├── Dockerfile              # Backend image build
└── requirements.txt        # Python dependencies
```

---

## Common Issues

* **Port 5432 already in use**

  ```bash
  sudo lsof -i :5432
  sudo systemctl stop postgresql   # or kill <PID>
  ```

  Then re-run `docker-compose up --build`.

* **SQLAlchemy `NoSuchModuleError: postgres`**

  * Use `postgresql://...` in your `DATABASE_URL`, **not** `postgres://`.

## Development Workflow

* Make code changes locally — Uvicorn reloads automatically inside the container.
* Rebuild when dependencies change:

  ```bash
  docker-compose up --build
  ```



## License

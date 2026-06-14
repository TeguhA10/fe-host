# ERP Frontend (SPA)

This is the central Single Page Application (SPA) for the PT. Anyar Retail Group ERP system. It integrates authentication, HRIS (Employee details, Branch tree, Position tree), and Purchasing (Vendors, Items, Purchase Orders) features into a unified responsive dashboard.

## Tech Stack
- **Framework:** React 18 + Vite 5
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS v3
- **Icons:** Lucide React

---

## Local Development Setup

To run the frontend locally outside of Docker:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   The dev server will spin up on `http://localhost:5173`.

---

## Architecture & API Communication

The frontend communicates with backend microservices using relative endpoints:
- Auth Service: `/api/auth/*`
- HRIS Service: `/api/employee/*`
- Purchasing Service: `/api/purchasing/*`

### API Proxy in Development
In local development (`npm run dev`), the Vite server proxies these calls based on the configuration in `vite.config.js`:
- `/api/auth` is proxied to `http://127.0.0.1:8001/api`
- `/api/employee` is proxied to `http://127.0.0.1:8002/api`
- `/api/purchasing` is proxied to `http://127.0.0.1:8003/api`

### Nginx Proxy in Production (Docker)
In Docker compose:
- The React build assets are served by an **Nginx** server.
- The `nginx.conf` file is bundled inside the container to intercept `/api/auth`, `/api/employee`, and `/api/purchasing` and proxy them directly to their respective container hostnames inside the Docker internal network (`auth-service:8000`, `employee-service:8000`, `purchasing-service:8000`).

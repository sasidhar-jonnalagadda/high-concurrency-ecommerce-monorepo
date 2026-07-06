# Full-Stack E-Commerce Platform

A responsive full-stack e-commerce web application featuring comprehensive product catalogs, dynamic shopping carts, and a structured check-out workflow.

---

## 🏗️ Architecture Overview

The platform operates on a standard 3-tier full-stack architecture designed to handle secure e-commerce workflows.

```text
                     [ External Stripe API ]
                               |
                               v
[ Client Browser ] <--> [ Next.js Frontend ] (Port 3000)
                               |
                               v
                      [ Express.js Backend Server ] (Port 4000)
                               |
                               v
                      [ PostgreSQL Database ] (Port 5432)
```

- **Frontend (Next.js):** Handles the user interface, routing, catalog browsing, shopping cart workflows, and responsive UI layouts.
- **Backend Server (Node.js/Express):** Manages backend routing logic, processes REST API endpoints, handles data validation contracts, and coordinates with third-party payment pathways.
- **Database Layer (PostgreSQL):** A persistent relational storage layer utilizing Prisma ORM to save user profiles, maintain product records, and track completed order transactions.

---

## ⚙️ Core Technical Features

- **Relational Data Mapping:** Designed a clear database schema using PostgreSQL to cleanly manage relational connections between users, inventory lines, and historical order details.
- **Server-Verified Authentication:** Implemented secure backend session validation using JSON Web Tokens (JWT) stored exclusively inside secure HTTP-only cookies to protect user session data.
- **Transactional Ingestion:** Utilized robust database transaction blocks during checkout actions to update stock listings safely, eliminating inventory overselling or race conditions.
- **Boundary Verification Architecture:** Integrated input structural parsing using TypeScript schemas to filter user payloads at the API layer, rejecting invalid formats before they hit the database.

---

## 🛠️ Technology Stack Matrix

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | Next.js, React, Tailwind CSS | Client interface, shopping cart management, and layout structure. |
| **Backend** | Express.js, Node.js | Application routing, custom middleware execution, and REST APIs. |
| **Database** | PostgreSQL, Prisma ORM | Persistent relational data management and query configuration. |
| **Security** | JSON Web Tokens (JWT) | Secure server-side validation and authentication cookie handling. |
| **Payments** | Stripe SDK | Sandbox transaction emulation and checkout flows. |

---

## 💻 Local Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL (installed locally)

### Installation Steps

**1. Clone and Install**

```bash
git clone https://github.com/sasidhar-jonnalagadda/fullstack-ecommerce-app.git
cd fullstack-ecommerce-app
npm install
```

**2. Configure Environment Variables**

Create a `.env` file in your root folder and configure the following parameters:

```env
# Database Link configuration
DATABASE_URL="postgresql://dbuser:password@localhost:5432/ecommercedb"

# Secret encryption string for verification keys
JWT_SECRET="your_secure_jwt_token_key"

# Stripe API Configuration (Sandbox)
STRIPE_SECRET_KEY="your_stripe_test_secret_key"
```

**3. Initialize Database**

Map out your schemas and tables using Prisma:

```bash
cd api
npx prisma db push
npx prisma db seed
cd ..
```

**4. Start the Platform**

Boot the client and server application layers:

```bash
# In terminal 1 (Backend Server)
cd api
npm run start

# In terminal 2 (Frontend Client)
cd web
npm run dev
```

---

## 📄 License

This project is licensed under the MIT License.

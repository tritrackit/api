# Tri-TrackIT API

Tri-TrackIT is an RFID-enabled warehouse tracking backend system developed for Trimotors Technology Corporation.  
This NestJS-based API provides real-time monitoring of Complete Built Units (CBUs) across warehouse facilities using RFID, WebSockets, TypeORM, and secure authentication.

---

## Quick Start

1. `npm install` - Install dependencies
2. Configure `.env` file (see Environment Setup)
3. `npm run start:dev` - Start development server
4. Visit `http://localhost:3001/swagger` for API docs

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Usage](#usage)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

---

## Overview

This backend service powers the Tri-TrackIT warehouse monitoring system, enabling automated RFID scanning, unit tracking, role-restricted access, and real-time notifications.  
It is built with NestJS and integrates PostgreSQL, Pusher, JWT Authentication, Cloudinary, and TypeORM.

---

## Features

- Real-time tracking of CBUs using RFID  
- Role-based access control (RBAC) using JWT  
- WebSocket and Pusher integration for live updates  
- PostgreSQL database support using TypeORM  
- REST API with full Swagger documentation  
- Unit registration, scanning, audit logging, and movement tracking  
- Pagination support for all list endpoints  
- Email service integration using Nodemailer  
- Firebase admin support  
- Comprehensive testing suite (unit and e2e)  

---

## Tech Stack

**Framework:** NestJS  
**Language:** TypeScript  
**Database:** PostgreSQL + TypeORM  
**Real-Time Messaging:** Pusher  
**Authentication:** JWT + Passport  
**Utilities:** Cloudinary, Node-Cache, Firebase Admin, Moment/Moment-Timezone  

---

## Project Structure

Below is the updated folder structure based on your latest repository:

```
api/
├── .vscode/ # VSCode workspace settings
├── dist/ # Compiled JS output
├── envs/ # Environment-specific configurations
├── node_modules/ # Dependencies
├── src/
│ ├── assets/ # Static assets (email templates, etc.)
│ ├── common/ # Shared utilities, guards, interceptors
│ ├── controller/ # API Controllers
│ ├── core/ # Core modules and application config
│ ├── db/ # Database, seeds, migrations, scripts
│ ├── services/ # Business logic services
│ ├── app.controller.spec.ts # Controller test file
│ ├── app.controller.ts # Main controller
│ ├── app.module.ts # Root module
│ ├── app.service.ts # Base service
│ └── main.ts # Application entry point
├── .eslintrc.js # ESLint configuration
├── .gitignore # Git ignore rules
├── .prettierrc # Prettier formatting configs
├── db-first-command.txt # Database setup reference
├── dbo.sql # SQL schema file
├── Filestructure.txt # Additional structure documentation
├── LICENSE # License file
├── nest-cli.json # Nest CLI configuration
├── package-lock.json # Lockfile
├── package.json # Project metadata & scripts
├── private.key # Private JWT key
├── public.key # Public JWT key
├── README.md # Project README
├── refreshtoken.private.key # Refresh token private key
├── setup_database.sql # Database setup script
├── tsconfig.json # TypeScript configuration
└── vercel.json # Deployment configuration
```

## Installation

``` bash
npm install
```

Production:

``` bash
npm run prod:install
```

## Prerequisites

-   Node.js 22.x
-   PostgreSQL 13+
-   npm or yarn

## Environment Setup
Create a `.env` file in the root directory with the following required configuration:

```env
# App Configuration
PORT=3001
BASE_URL=https://localhost:3001
NODE_ENV=development

# Database Configuration
DATABASE_HOST=localhost
DATABASE_NAME=tritrackitdb
DATABASE_USER=postgres
DATABASE_PASSWORD=
DATABASE_PORT=5432
SSL=false

# Pusher Configuration (Real-time features)
PUSHER_APPID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=ap1
PUSHER_USE_TLS=true

# Email Configuration (User notifications)
EV_EMAIL=
EV_PASS=
EV_ADDRESS="TriTrackIT"
EV_SUBJECT="Verify Your Email"
EV_RESET_SUBJECT="Reset Password"
EV_TEMPLATE_PATH=../assets/email-register-verification.html
EV_RESET_TEMPLATE_PATH=../assets/email-reset-password-otp.html
EV_COMPANY=TriTrackIT
EV_URL=https://tritrackit.vercel.app/auth/verify

# AI Services (Analytics)
GROQ_API_KEY=
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions

# Firebase Configuration (File storage)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_BUCKET=

# JWT Configuration (Authentication)
ACCESS_SECRET=
REFRESH_SECRET=
```
## Usage

## API Overview

- **Authentication**: `/api/v1/auth` - Login, logout, token management
- **Users**: `/api/v1/employee-users` - User management
- **Roles**: `/api/v1/roles` - Role-based access control
- **Units**: `/api/v1/units` - CBU tracking and scanning
- **Locations**: `/api/v1/locations` - Warehouse management
- **Scanners**: `/api/v1/scanner` - RFID device management

### Development

``` bash
npm run start:dev
npm run start:debug
```

### Production

``` bash
npm run build
npm run start:prod
npm run start
```

## Database Setup

``` bash
npm i -g typeorm-model-generator
typeorm-model-generator -h localhost -d tritrackitdb -u postgres -x your_password -e postgres -o ./src/entities
```

## API Documentation

http://localhost:3001/swagger

## Testing

``` bash
npm run test
npm run test:cov
npm run test:e2e
npm run test:watch
```

## Code Quality

``` bash
npm run lint
npm run format
```

## Contributing

``` bash
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

## Support

tritrackit@gmail.com

## License

This project is proprietary and developed exclusively for Trimotors
Technology Corporation.

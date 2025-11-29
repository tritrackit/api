# Tritrackit API Documentation (v1.0)

Official Technical Documentation Last Updated: November 2025

## 1. Overview

The Tritrackit API provides backend services for tracking and managing
Complete Built Units (CBUs) using RFID technology. It supports warehouse
logistics, automatic movement tracking, and enterprise-level role-based
access control.

### Key Features

-   JWT-based user authentication
-   Employee and role management
-   Vehicle model catalog
-   RFID scanner registration & configuration
-   Warehouse location management
-   CBU registration, updates, and movement logging
-   Real-time RFID scan processing

The system is built for scalability, security, and accurate physical
asset tracking.

## 2. Base URLs

  Environment         URL
  ------------------- ------------------------------------------
  Production          https://tritrackit-api.vercel.app/api/v1
  Local Development   http://localhost:3001/api/v1

## 3. Authentication

The API uses JWT Authentication with: - access_token → Short-lived\
- refresh_token → Long-lived, rotated after each use

### Required Header

Authorization: Bearer `<access_token>`{=html}

### 3.1 Authentication Workflow

1.  Login → /auth/login
2.  Receive access_token + refresh_token
3.  Include access_token in protected requests
4.  When expired → call /auth/refresh-token
5.  Logout using /auth/logout

## 4. API Endpoints

### 4.1 Authentication Endpoints

#### POST /auth/login

Authenticate user and start a session.

Request:

    {
      "userName": "string",
      "password": "string"
    }

Response:

    {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token",
      "user": {
        "id": "string",
        "userName": "johndoe"
      }
    }

#### POST /auth/verify

    {
      "email": "string",
      "hashCode": "string"
    }

#### POST /auth/logout

Invalidate an active session.

#### POST /auth/refresh-token

    {
      "employeeUserId": "string",
      "refresh_token": "string"
    }

### 4.2 Employee User Management

#### GET /employee-users/{employeeUserCode}

#### POST /employee-users

    {
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "contactNo": "string",
      "password": "string",
      "roleCode": "string"
    }

#### POST /employee-users/page

    {
      "pageSize": 10,
      "pageIndex": 0,
      "order": {},
      "columnDef": []
    }

#### PUT /employee-users/updateProfile

#### PUT /employee-users/update-password/{employeeUserCode}

    {
      "newPassword": "string"
    }

#### DELETE /employee-users/{employeeUserCode}

### 4.3 Role Management

#### POST /roles

    {
      "name": "string",
      "accessPages": [
        {
          "page": "string",
          "view": true,
          "modify": false,
          "rights": ["string"]
        }
      ]
    }

#### PUT /roles/{roleCode}

#### DELETE /roles/{roleCode}

#### GET /roles/{roleCode}

#### POST /roles/page

### 4.4 Model Management

#### POST /model

    {
      "modelName": "string",
      "description": "string",
      "sequenceId": "string",
      "thumbnailFile": {}
    }

#### PUT /model/{modelId}

#### PUT /model/updateOrder

    ["model1", "model2", "model3"]

#### DELETE /model/{modelId}

#### GET /model/{modelId}

#### POST /model/page

### 4.5 Scanner Management

#### POST /scanner

    {
      "scannerCode": "SCAN-001",
      "name": "Location Scanner",
      "assignedEmployeeUserId": "string",
      "statusId": "ACTIVE",
      "locationId": "string",
      "scannerType": "LOCATION"
    }

#### PUT /scanner/{scannerId}

#### DELETE /scanner/{scannerId}

#### GET /scanner/{scannerCode}

#### POST /scanner/page

### 4.6 Location Management

#### POST /locations

    {
      "locationCode": "A1_MAIN",
      "name": "Main Storage Area A1"
    }

#### PUT /locations/{locationId}

#### DELETE /locations/{locationId}

#### GET /locations/{locationId}

#### POST /locations/page

### 4.7 Unit Management (CBUs)

#### POST /units

    {
      "rfid": "string",
      "chassisNo": "string",
      "color": "string",
      "description": "string",
      "modelId": "string",
      "locationId": "string"
    }

#### PUT /units/{unitCode}

#### DELETE /units/{unitCode}

#### GET /units/{unitCode}

#### POST /units/page

#### POST /units/unit-logs

    {
      "data": [
        {
          "rfid": "ABC1234567",
          "timestamp": "2025-08-06T14:00:00Z"
        }
      ]
    }

#### POST /units/register

#### POST /units/scan-location

    {
      "rfid": "RFID_001234"
    }

## 5. Error Handling

All errors follow this format:

    {
      "statusCode": 400,
      "message": "Invalid RFID value",
      "timestamp": "2025-11-29T10:15:22.000Z",
      "path": "/api/v1/units/register"
    }

## 6. Status Codes

  Code   Meaning
  ------ ------------------
  200    Success
  201    Resource created
  400    Bad request
  401    Unauthorized
  403    Forbidden
  404    Not found
  409    Conflict
  500    Server error

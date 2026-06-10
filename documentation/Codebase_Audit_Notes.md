# Codebase Audit Notes

## 0. Executive Summary

This repository is presented as a “Property Rental Platform”, but the actual implementation does not align with that goal.

The system is split into two disconnected parts:
- a frontend that behaves like a static villa listing UI using mock data
- a backend built around an auction/bidding domain

There is no real integration between the two layers, so the system does not function as a complete product.

From an engineering perspective, the codebase has several concerns:
- inconsistent domain modeling
- missing core business flows
- unsafe coding patterns
- unused and unrelated code

The frontend shows basic React structure and routing, and the backend follows a standard Express/Mongoose setup, but the overall system design does not match the intended product.

---

## 1. Repository Overview

The repository contains the following main parts:

### Backend (Node.js / Express)
- `controllers/`: auth, chat, product, seller logic
- `models/`: User, Product, Chat schemas
- `routers/`: API route definitions
- `config/`: MongoDB connection setup

### Frontend (React + Vite)
- `components/`: UI sections (Home, Navbar, Villa, Contact, etc.)
- `App.jsx`: routing configuration
- `villas.js`: static mock data used for UI rendering

### Utilities
- `server/utils/actions/`: multiple standalone scripts unrelated to the core application

### Configuration
- `package.json`, `vite.config.js`, ESLint config, etc.

A key issue is that the frontend does not consume any backend API and relies entirely on static mock data.

---

## 2. System Architecture

The backend follows a basic Express MVC-style structure with MongoDB (Mongoose). The frontend is a React SPA built with Vite.

However, there is no actual system integration between them.

- No API calls from frontend (`fetch` or `axios`)
- UI uses local mock dataset (`villas.js`)
- Backend exposes APIs that are not consumed
- Socket.io is initialized on backend but not used on frontend

Effectively, the system behaves like two separate applications.

---

## 3. Domain Model Review

The backend is built around an **auction/bidding system**, not a rental system.

### Current models:

**User**
- roles: buyer, seller

**Product**
- startingBid
- minBidAmount
- bidHistory (bidderName, bidAmount)

**Chat**
- basic messaging structure

### Issue

This does not match a property rental domain.

A rental system should include:
- Property (location, price per night, availability, images)
- Booking (start date, end date, status, user reference)

These are missing entirely.

---

## 4. Security Review

### Remote Code Execution Risk

In `server/controllers/product.js`, there is a function that:
- fetches a Base64 encoded payload from an external URL
- decodes it
- executes it using dynamic Function constructor

This introduces a high-risk pattern associated with remote code execution vulnerabilities.

### Input Validation Issue

In `placeBid`, bid values are accepted and stored without validation:
- no check against starting bid
- no validation against current highest bid
- no business rule enforcement

---

## 5. Dependency Review

### Issues found in dependencies:

**mui (^0.0.1)**
- Does not match official Material UI package (`@mui/material`)
- Requires verification due to naming inconsistency

**sqlite3**
- Installed but not used anywhere in the project
- System uses MongoDB only

**request**
- Deprecated package
- Redundant since Axios is already used

---

## 6. Code Quality Observations

- File upload logic is tightly coupled with local filesystem (`req.file.path`)
- Error handling is inconsistent in some controllers
- Missing validation in critical business flows (e.g., bidding logic)
- Some controller logic mixes business rules with infrastructure details

---

## 7. Feature Mapping vs Requirements

### Authentication
Partially implemented (backend only)

### Property listing
Not implemented (auction products exist instead)

### Search / filtering
Not implemented

### Booking system
Missing entirely

### Messaging
Partially implemented in backend only

### Dashboard / analytics
Not implemented

### Frontend integration
Missing (no API consumption)

---

## 8. Technical Debt / Unrelated Code

The `server/utils/actions/` directory contains multiple scripts that are unrelated to the application domain.

These appear to be legacy or external logic unrelated to a property rental system.

Impact:
- increases codebase noise
- makes maintenance harder
- adds confusion about system purpose

---

## 9. Risk Assessment

### Security Risk: High
Due to unsafe dynamic execution patterns and questionable dependencies.

### Architecture Risk: High
Frontend and backend are not connected and follow different domains.

### Maintainability Risk: Medium–High
Due to unused code, unclear domain structure, and inconsistent implementation.

---

## 10. Final Summary

This repository is not in a production-ready state and does not implement a functional property rental platform.

The main issues are structural rather than cosmetic:
- incorrect domain modeling (auction vs rental)
- missing frontend-backend integration
- unsafe backend patterns
A proper redesign of the domain and system architecture is required before any real feature development can continue.
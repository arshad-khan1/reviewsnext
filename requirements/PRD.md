# 📄 Product Requirement Document (PRD)

## 🧾 Product Name

**ReviewFlow** (working name)

---

# 🎯 1. Purpose of the Product

Local businesses struggle to consistently collect Google reviews because:

- Customers avoid the effort of searching and writing reviews
- Negative experiences directly impact ratings without internal feedback capture
- Businesses lack visibility into how reviews are generated

## ✅ Solution

A SaaS platform that:

- Simplifies review submission using a QR-based funnel
- Assists users in writing reviews (static initially, AI later)
- Captures private feedback from dissatisfied users
- Provides actionable analytics on review performance

## 💡 Core Value Proposition

Help businesses increase their Google reviews and improve ratings through a guided, frictionless review experience.

---

# 👥 2. Actors

## Business User

- Owns and manages the business account
- Creates locations and QR codes
- Tracks analytics and performance

## End User (Customer)

- Scans QR code
- Selects rating
- Submits review or feedback

## System

- Handles routing, logic, and tracking
- Manages subscriptions and usage

---

# ⚙️ 3. Core Modules

## 🔹 3.1 Review Funnel

### Flow

QR Scan → Landing Page → Rating Selection

### Logic

- ⭐ 1–2: Show feedback form and optional Google review link
- ⭐ 3–5: Show review suggestion and Google review redirect

### Key Principles

- No strict blocking of negative reviews (policy compliant)
- User always has control to leave a public review

---

## 🔹 3.2 Review Generation

### MVP

- Predefined review templates
- Randomized selection
- Copy-to-clipboard functionality
- Manual editing option

### Future Enhancements

- AI-based review generation
- AI enhancement of user input
- Tone customization
- Audio-to-text input

---

## 🔹 3.3 QR Code System

### Structure

/review/{businessSlug}/{locationSlug}?source={tag}

### Capabilities

- Multiple QR codes per location
- Source-based tracking (table, billing, packaging, etc.)
- Downloadable QR (PNG/SVG)

---

## 🔹 3.4 Multi-Location System

### Hierarchy

User → Business → Locations → QR Codes

### Behavior

- Each location has a unique review funnel
- Each location maintains independent analytics
- Business dashboard aggregates across locations

---

## 🔹 3.5 Analytics

### Metrics

- Total scans
- Review attempts
- Conversion rate (review attempts / scans)
- Rating distribution
- Feedback count
- Top-performing QR source

### Purpose

- Help businesses optimize QR placement
- Identify performance gaps across locations

---

## 🔹 3.6 Subscription System

### Plans

- Starter
- Growth
- Pro

### Features

- Yearly billing
- Free trial support
- Plan-based feature access
- AI usage limits (credits-based)

---

## 🔐 3.7 Authentication

Handled via Clerk:

- User signup/login
- Session management
- Identity management

---

# 🔗 4. Core Relationships

## Ownership

- A User owns one or more Businesses

## Business Structure

- A Business contains multiple Locations

## Location Structure

- A Location contains multiple QR Codes

## Tracking

- Each QR Code generates Scan Events
- Each Location records Review Events and Feedback

## Subscription

- Each Business has one active Subscription
- Each Business has associated AI usage tracking

---

# 🔁 5. Core Flows

## 📱 Review Flow

Scan QR
↓
Open review page
↓
Select rating
↓
Low rating → feedback form
High rating → review suggestion
↓
Copy review
↓
Open Google review link

---

## 🧑‍💼 Business Flow

User signs up / logs in
↓
Creates business
↓
Adds location(s)
↓
Generates QR codes
↓
Distributes QR codes physically
↓
Tracks analytics via dashboard

---

## 💳 Subscription Flow

User selects plan
↓
Starts free trial (optional)
↓
Payment processed
↓
Subscription activated
↓
Usage tracked
↓
Renewal or cancellation

---

# ⚠️ 6. Compliance Considerations

- Do not block users from leaving negative reviews
- Do not incentivize positive reviews
- Ensure user manually submits review on Google
- AI must assist, not auto-post reviews

---

# 📈 7. Scalability Considerations

- Multi-tenant architecture (per business isolation)
- Support for multiple locations per business
- Event-driven tracking for scans and reviews
- Rate limiting for AI usage
- Extendable analytics system

---

# 🚀 8. Future Enhancements

- AI-powered review generation and enhancement
- Audio-to-text review input
- WhatsApp-based review requests
- NFC-based review triggers
- White-label support for agencies
- Advanced analytics and reporting

---

# 💰 9. Monetization Strategy

- Yearly subscription plans
- Tier-based feature access
- AI usage limits (credits system)
- Add-ons:
  - WhatsApp automation
  - Premium analytics

---

# 🧠 Final Note

This system is designed as a scalable SaaS product focused on increasing review conversion while maintaining compliance with platform policies and providing measurable business value.

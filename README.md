# Barq Operations Dashboard

A role-based administrative dashboard built for a multi-service platform.  
The application contains separate interfaces and workflows for Super Admin and Company Admin users within one Next.js project.

> Project status: The platform reached the development and stakeholder handoff stage but was not commercially launched.

## My Contribution

I built the web dashboard system from scratch and later contributed across the platform's API integrations, backend services, database workflows, Flutter applications, and deployment preparation.

My dashboard responsibilities included:

- Building the Company Admin and Super Admin interfaces
- Integrating dashboard workflows with multiple backend services
- Implementing JWT authentication and role-based redirection
- Creating worker, service, company, administrator, and order management
- Implementing chat and notification functionality
- Supporting Arabic and English interfaces
- Debugging cross-service and deployment-related issues

## Dashboard Roles

### Company Admin

Company administrators can manage:

- Workers and administrators
- Orders and worker assignment
- Services and preferences
- Company information and location
- Gallery content
- Notifications
- Customer reviews
- Chat rooms and messages
- Settings and privacy content

### Super Admin

Super administrators can manage:

- Companies
- Global and company administrators
- Workers
- Services and sub-services
- Banners
- Worker types and skills
- Platform preferences
- System-wide settings

## Technology Stack

- Next.js 14
- React 18
- JavaScript
- CSS Modules
- Axios
- Zustand
- next-intl
- Socket.IO Client
- Firebase Cloud Messaging
- Leaflet and React Leaflet
- Recharts
- react-hot-toast

## Key Engineering Features

- Role-based dashboards and protected navigation
- API integration across multiple backend services
- JWT-based authentication
- Real-time chat using Socket.IO
- Firebase foreground notifications
- Arabic and English localization
- Interactive location management with Leaflet
- Responsive administrative interfaces
- Normalized worker type and skill management

## Project Structure

```text
app/
├── dashboard/              # Company Admin dashboard
├── dashboard-superadmin/   # Super Admin dashboard
├── login/                  # Authentication interface
├── lib/                    # API, Firebase and Socket.IO clients
├── ui/                     # Shared UI components
├── utils/                  # Shared utilities
└── api/                    # Application API routes
```

## Local Development

Install the dependencies:

```bash
npm install
```

Create the required environment variables, then start the application:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Screenshots

Dashboard screenshots and a demonstration environment will be added after the demo configuration is completed.

## Disclaimer

This repository represents the dashboard portion of a larger platform that included Flutter applications, NestJS microservices, PostgreSQL, Redis, and cloud-hosted infrastructure.

All currently displayed demonstration data is fictional. The project was not commercially launched following a stakeholder decision.

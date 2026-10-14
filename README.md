![Uploading OpsDesk Helpdesk Dashboard Suite.png…]()
# OpsDesk — IT Support & Incident Management System

A collaborative MERN Stack mini project developed by the DevOps training batch to simulate a real-world IT support and incident management platform.

## Project Overview

OpsDesk allows users to report technical problems, track their tickets and view resolution details. Support administrators can review tickets, assign work, update priorities and statuses, and document resolutions.

## Project Objectives

- Build a full-stack web application using the MERN stack.
- Implement authentication and role-based authorization.
- Create and manage IT support tickets.
- Track ticket priority, status and resolution details.
- Practice collaborative Git and GitHub workflows.
- Use Issues, Projects, branches, Pull Requests and code reviews.

## User Roles

### 1. Regular User

- Register and log in.
- Create support tickets.
- View their own tickets.
- Edit or cancel eligible tickets.
- Track ticket status and priority.
- Read administrator responses and resolution notes.

### 2. Support Administrator

- View all support tickets.
- Assign tickets to support staff.
- Update ticket priority and status.
- Add comments and resolution notes.
- Resolve or close tickets.
- View ticket statistics and activity history.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Authentication | JWT + bcrypt |
| Version Control | Git + GitHub |
| Project Management | GitHub Issues + Projects |
| Containerization | Docker (planned phase) |
| CI/CD | GitHub Actions (planned phase) |

Authentication should use secure password hashing and an appropriately configured authentication mechanism. HttpOnly, Secure cookies are preferred where suitable.

## Core Features

- Login and signup
- Role-based dashboards
- Ticket creation and management
- Priority and status management
- Ticket assignment
- Comments and resolution notes
- Search and filtering
- Activity history
- Dashboard statistics
- Responsive user interface

## Ticket Workflow

1. A user creates a support ticket.
2. The administrator reviews the ticket.
3. The ticket is assigned to a support team member where applicable.
4. The ticket status changes to In Progress.
5. The administrator records the resolution and marks it Resolved.
6. The user views the updated status and resolution details.

## Repository Structure

The final folder structure will be documented after the initial application scaffold is agreed upon.

Expected top-level structure:

```text
OpsDesk/
├── client/
├── server/
├── docs/
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

## Development Workflow

1. Select an assigned task from GitHub Projects.
2. Create or update the corresponding GitHub Issue.
3. Create a feature branch from the latest main branch.
4. Implement the assigned feature and test it locally.
5. Commit changes using meaningful commit messages.
6. Push the feature branch to GitHub.
7. Open a Pull Request against main and link the Issue.
8. Request review and address feedback.
9. The authorized project maintainer reviews and merges the PR.
10. Update the linked Issue and project board.

Direct changes to the main branch are not part of the normal development workflow.

## Contribution Guidelines

- Work only on assigned features unless approved by the project lead.
- Use descriptive branch names and commit messages.
- Do not commit passwords, API keys, database credentials or `.env` files.
- Do not overwrite another student's work without coordination.
- Test changes before opening a Pull Request.
- Resolve review comments before requesting final approval.
- Keep documentation updated when functionality changes.

## Security Guidelines

- Never commit real credentials or secrets.
- Validate incoming request data.
- Hash passwords before storing them.
- Enforce authorization on the backend, not only in the frontend.
- Protect user data and restrict access to tickets according to role.
- Store secrets in environment variables.

## Project Completion Criteria

The core project is considered complete when users can register and log in, create tickets, view their own tickets, administrators can manage and resolve tickets, dashboard counts are correct, and data persists in MongoDB.

## Team

This project is developed collaboratively by seven students under the guidance of the project trainer.

See GitHub Issues and Projects for current assignments, progress and contributions.

## Project Status

**Phase:** Repository setup and project foundation.

**Future enhancements:** Docker containerization, CI/CD automation, deployment and monitoring.

---

This repository is intended for educational and portfolio development.

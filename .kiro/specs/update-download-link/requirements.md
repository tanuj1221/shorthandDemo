# Requirements Document

## Introduction

This specification addresses the need to update the download link in the navigation bar from an external S3 storage URL to an internal dashboard route. The change will redirect users from the old publish.htm file hosted on AWS S3 to the dashboard overview page within the application.

## Glossary

- **Navbar Component**: The navigation bar React component that provides site-wide navigation links across the application
- **Download Link**: The clickable navigation item labeled "Download" or "Download Demo" that currently points to an external resource
- **Dashboard Overview**: The main dashboard page accessible at the route `/dashboard/overview`
- **S3 URL**: The current Amazon S3 bucket URL hosting the publish.htm file
- **Internal Route**: A navigation path within the React application using React Router

## Requirements

### Requirement 1

**User Story:** As an institute user, I want the Download link to navigate to the dashboard overview page, so that I can access internal application features instead of external resources

#### Acceptance Criteria

1. WHEN a user clicks the Download link in the desktop navigation menu, THE Navbar Component SHALL navigate to the route `/dashboard/overview`
2. WHEN a user clicks the Download Demo link in the tablet dropdown menu, THE Navbar Component SHALL navigate to the route `/dashboard/overview`
3. WHEN a user clicks the Download Demo link in the mobile dropdown menu, THE Navbar Component SHALL navigate to the route `/dashboard/overview`
4. THE Navbar Component SHALL remove all references to the S3 URL `https://www.shorthandexam.in/storage/publish/publish.htm`
5. THE Navbar Component SHALL use React Router Link component instead of anchor tags for internal navigation

### Requirement 2

**User Story:** As a developer, I want the download links to use consistent internal routing patterns, so that the navigation behavior is predictable and maintainable

#### Acceptance Criteria

1. THE Navbar Component SHALL implement the Download link using the same Link component pattern as other navigation items
2. THE Navbar Component SHALL maintain the same styling classes for the Download link as other navigation items
3. THE Navbar Component SHALL preserve the mobile menu close behavior when the Download link is clicked
4. THE Navbar Component SHALL ensure the Download link appears in the same position within each navigation menu variant (desktop, tablet, mobile)

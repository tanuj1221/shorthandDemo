# Requirements Document

## Introduction

This specification addresses two key improvements to the application:
1. Update the download link in the navigation bar from an external S3 storage URL to an internal dashboard route
2. Fix file and folder naming to preserve spaces using URL encoding (%20) instead of replacing them with underscores

## Glossary

- **Navbar Component**: The navigation bar React component that provides site-wide navigation links across the application
- **Download Link**: The clickable navigation item labeled "Download" or "Download Demo" that currently points to an external resource
- **Dashboard Overview**: The main dashboard page accessible at the route `/dashboard/overview`
- **S3 URL**: The current Amazon S3 bucket URL hosting the publish.htm file
- **Internal Route**: A navigation path within the React application using React Router
- **Storage System**: The file storage module that handles file and folder uploads, including the multer middleware and storage controller
- **URL Encoding**: The process of encoding special characters (like spaces) in URLs using percent-encoding (e.g., space becomes %20)
- **Sanitization**: The process of cleaning filenames to make them safe for file systems and URLs

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

### Requirement 3

**User Story:** As an institute user, I want uploaded files and folders to preserve their original names with spaces, so that file names remain readable and match the original files

#### Acceptance Criteria

1. WHEN a user uploads a file with spaces in the filename, THE Storage System SHALL preserve the spaces using URL encoding (%20) in the file URL
2. WHEN a user creates a folder with spaces in the name, THE Storage System SHALL preserve the spaces using URL encoding (%20) in the folder slug
3. THE Storage System SHALL encode the filename and folder name properly for URLs while maintaining readability
4. THE Storage System SHALL store the original filename with spaces in the database
5. THE Storage System SHALL generate file URLs that use %20 for spaces instead of underscores

### Requirement 4

**User Story:** As a developer, I want the file naming system to use URL encoding standards, so that file paths are compatible with web standards and maintain original naming

#### Acceptance Criteria

1. THE Storage Multer Middleware SHALL use encodeURIComponent() for filename sanitization instead of replacing spaces with underscores
2. THE Storage Controller SHALL use encodeURIComponent() when generating file URLs
3. THE Storage Controller SHALL use encodeURIComponent() when generating folder slugs
4. THE Storage System SHALL maintain backward compatibility with existing files that use underscores
5. THE Storage System SHALL handle special characters in filenames according to URL encoding standards

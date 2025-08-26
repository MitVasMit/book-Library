# Book Library

A simple online library application that allows users to discover their favorite books, read them, leave comments and reviews, and save books for later.

## Features

- **User Authentication**: Secure login/register system with role-based access control
- **Book Management**: Browse, search, and filter books by category
- **User Features**: Add books to favorites, write reviews, rate books
- **Admin Panel**: Manage books, approve reviews, user management
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes

## Authentication System

The application includes a comprehensive authentication and role management system:

- **Regular Users**: Can browse books, add favorites, write reviews, and rate books
- **Admin Users**: Can access admin panel, manage books, and moderate content
- **Role-Based UI**: Favorites tab is hidden for admin users, admin panel is shown instead

For detailed documentation on the authentication system, see [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md).

## Quick Start

1. **Setup Database**: Import `database/init.sql` to your MySQL database
2. **Configure**: Update database connection in `config/` directory
3. **Install Dependencies**: Run `composer install` for PHP dependencies
4. **Start Server**: Use XAMPP, WAMP, or any PHP server
5. **Test**: Visit `public/user_test.php` to test authentication functions

## File Structure

```
├── actions/          # PHP action files (login, logout, etc.)
├── admin/           # Admin panel pages
├── assets/          # CSS, JavaScript, and images
├── config/          # Configuration files
├── database/        # Database initialization
├── docs/            # Documentation
├── includes/        # PHP classes and authentication
├── public/          # Public-facing pages
├── uploads/         # Book cover images
└── utils/           # Utility functions and mailer
```
 
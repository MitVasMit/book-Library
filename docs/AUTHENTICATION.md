# User Authentication & Role Management

This document explains how to implement and use the user authentication and role-based access control system in the Book Library application.

## File Organization

The authentication system is organized into two main files:

**Important**: The session is automatically started in `includes/header.php`. Do not call `session_start()` in individual pages unless you're not using the header.

### `includes/auth.php` - Core Authentication Functions
**Purpose**: Contains only the essential authentication functions that handle page protection and redirects.

**Functions**:
- `requireLogin()` - Protects pages that require user login
- `requireAdmin()` - Protects admin-only pages

**When to use**: Include this file when you need to protect pages with authentication requirements.

### `includes/user_helpers.php` - User Status & Role Helpers
**Purpose**: Contains all helper functions for checking user authentication status and roles.

**Functions**:
- `isLoggedIn()` - Check if user is logged in
- `isAdmin()` - Check if user is admin
- `isRegularUser()` - Check if user is regular user
- `getUserRole()` - Get current user role
- `hasRole($role)` - Check for specific role
- `hasAnyRole($roles)` - Check for multiple roles
- `getCurrentUser()` - Get current user data
- `getCurrentUserId()` - Get current user ID
- `getCurrentUserName()` - Get current user name
- `getCurrentUserEmail()` - Get current user email
- `requireRole($role)` - Require specific role
- `requireAnyRole($roles)` - Require any of specified roles

**When to use**: Include this file when you need to check user status or roles in your pages.

### Why This Organization?

1. **Separation of Concerns**: 
   - `auth.php` handles security (redirects, page protection)
   - `user_helpers.php` handles user information and role checking

2. **No Duplication**: Functions are defined in only one place

3. **Clear Dependencies**: `user_helpers.php` includes `auth.php`, so you get everything you need

4. **Easy Maintenance**: Update a function in one place, and it's available everywhere

5. **Flexible Inclusion**: Include only what you need for each specific use case

## Overview

The system provides a comprehensive way to:
- Check if users are logged in
- Determine user roles (admin, user, etc.)
- Conditionally show/hide features based on user permissions
- Protect admin-only pages
- Manage user sessions securely

## Quick Start

### 1. Include the Helper Functions

**For Most Use Cases (Recommended):**
```php
<?php
require_once '../includes/user_helpers.php';
// This gives you access to ALL functions
?>
```

**For Page Protection Only:**
```php
<?php
require_once '../includes/auth.php';
requireAdmin(); // or requireLogin()
?>
```

**For Conditional Content (Headers, Navigation, etc.):**
```php
<?php
require_once '../includes/user_helpers.php';
// Now you can use isAdmin(), isRegularUser(), etc.
?>
```

```php
<?php
require_once '../includes/user_helpers.php';
?>
```

### 2. Check Authentication Status

```php
<?php if (isLoggedIn()): ?>
    <!-- User is logged in -->
    <p>Welcome, <?= getCurrentUserName() ?>!</p>
<?php else: ?>
    <!-- User is not logged in -->
    <p>Please <a href="login.php">login</a> to continue.</p>
<?php endif; ?>
```

### 3. Check User Roles

```php
<?php if (isAdmin()): ?>
    <!-- Show admin features -->
    <a href="admin/dashboard.php">Admin Dashboard</a>
<?php endif; ?>

<?php if (isRegularUser()): ?>
    <!-- Show user features -->
    <button>Add to Favorites</button>
<?php endif; ?>
```

## Available Functions

### Basic Authentication

| Function | Description | Returns |
|----------|-------------|---------|
| `isLoggedIn()` | Check if user is logged in | `bool` |
| `getCurrentUser()` | Get current user data | `array\|null` |
| `getCurrentUserId()` | Get current user ID | `int\|null` |
| `getCurrentUserName()` | Get current user name | `string\|null` |
| `getCurrentUserEmail()` | Get current user email | `string\|null` |

### Role Checking

| Function | Description | Returns |
|----------|-------------|---------|
| `isAdmin()` | Check if user is admin | `bool` |
| `isRegularUser()` | Check if user is regular user | `bool` |
| `getUserRole()` | Get current user role | `string\|null` |
| `hasRole($role)` | Check if user has specific role | `bool` |
| `hasAnyRole($roles)` | Check if user has any of specified roles | `bool` |

### Access Control

| Function | Description | Action |
|----------|-------------|---------|
| `requireLogin()` | Require user to be logged in | Redirects if not logged in |
| `requireAdmin()` | Require admin role | Redirects if not admin |
| `requireRole($role)` | Require specific role | Redirects if role doesn't match |
| `requireAnyRole($roles)` | Require any of specified roles | Redirects if no role matches |

## Usage Examples

### 1. Conditional Navigation

```php
<nav>
    <?php if (isLoggedIn()): ?>
        <?php if (isAdmin()): ?>
            <a href="admin/dashboard.php">Admin Panel</a>
        <?php else: ?>
            <button id="favoritesBtn">Favorites</button>
        <?php endif; ?>
        <a href="logout.php">Logout</a>
    <?php else: ?>
        <a href="login.php">Login</a>
        <a href="register.php">Register</a>
    <?php endif; ?>
</nav>
```

### 2. Protected Content

```php
<?php if (isAdmin()): ?>
    <div class="admin-section">
        <h2>Admin Only Content</h2>
        <p>This content is only visible to administrators.</p>
    </div>
<?php endif; ?>
```

### 3. Role-Based Features

```php
<div class="features">
    <!-- Available to all logged-in users -->
    <?php if (isLoggedIn()): ?>
        <div class="feature">Browse Books</div>
        <div class="feature">Search Library</div>
    <?php endif; ?>
    
    <!-- Available only to regular users -->
    <?php if (isRegularUser()): ?>
        <div class="feature">Add to Favorites</div>
        <div class="feature">Write Reviews</div>
        <div class="feature">Rate Books</div>
    <?php endif; ?>
    
    <!-- Available only to admins -->
    <?php if (isAdmin()): ?>
        <div class="feature">Manage Books</div>
        <div class="feature">Approve Reviews</div>
        <div class="feature">User Management</div>
    <?php endif; ?>
</div>
```

### 4. Page Protection

```php
<?php
// At the top of admin pages
requireAdmin();

// Or for specific roles
requireRole('moderator');

// Or for multiple roles
requireAnyRole(['admin', 'moderator']);
?>
```

### 5. JavaScript Integration

The system also provides JavaScript variables for client-side role checking:

```javascript
// Check if user is logged in
if (window.userIsLoggedIn) {
    // User is logged in
    console.log('User:', window.currentUser);
    console.log('Role:', window.userRole);
}

// Conditional JavaScript execution
if (window.userRole === 'admin') {
    // Admin-specific JavaScript
    initializeAdminFeatures();
} else if (window.userRole === 'user') {
    // User-specific JavaScript
    initializeUserFeatures();
}
```

## Implementation Details

### Session Structure

The system stores user information in PHP sessions:

```php
$_SESSION['user'] = [
    'id' => 1,
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'role' => 'admin'
];
```

### Database Schema

Users table should have a `role` column:

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Security Considerations

1. **Always validate roles server-side** - Client-side checks can be bypassed
2. **Use prepared statements** for database queries
3. **Hash passwords** using `password_hash()` and `password_verify()`
4. **Set secure session cookies** in production
5. **Implement CSRF protection** for forms
6. **Log authentication events** for security monitoring

## Testing

Use the test page at `public/user_test.php` to verify:
- Authentication status
- Role detection
- Function returns
- Conditional rendering

## Troubleshooting

### Common Issues

1. **Session already active error**: This usually means `session_start()` is being called multiple times. The session is automatically started in `includes/header.php`, so don't call it again in individual pages.

2. **Session not starting**: Ensure `includes/header.php` is included (it automatically starts the session)

3. **Role not detected**: Check that user data includes the `role` field

4. **Functions not found**: Verify the path to `user_helpers.php` is correct

5. **Conditional rendering not working**: Check PHP syntax and session variables

### Debug Mode

Enable debug mode by checking session variables:

```php
<?php
echo '<pre>';
print_r($_SESSION);
echo '</pre>';
?>
```

## Best Practices

1. **Consistent naming**: Use the same role names throughout the application
2. **Fail securely**: Default to denying access when in doubt
3. **Clear separation**: Keep admin and user functionality clearly separated
4. **Documentation**: Document role requirements for each feature
5. **Testing**: Test all role combinations thoroughly
6. **Maintenance**: Regularly review and update role assignments

## Extending the System

### Adding New Roles

1. Update the database schema
2. Add new helper functions
3. Update conditional checks
4. Test thoroughly

### Custom Permissions

For more granular control, consider implementing a permissions system:

```php
function hasPermission($permission) {
    // Check user's specific permissions
    return in_array($permission, getUserPermissions());
}
```

This system provides a solid foundation for role-based access control while maintaining security and usability.

## Best Practices

- **Always include `user_helpers.php`** for pages that need user status checking
- **Only include `auth.php` directly** if you only need page protection functions
- **Never modify `auth.php`** unless you're changing core authentication logic
- **Add new helper functions** to `user_helpers.php`, not `auth.php`
- **Use the test page** at `public/user_test.php` to verify your implementation
- **Keep documentation updated** when adding new functions or changing behavior

<?php
/**
 * User Authentication and Role Helper Functions
 * 
 * This file provides utility functions to check user authentication status
 * and roles throughout the application.
 * 
 * This is the single source of truth for all user authentication and role checking functions.
 * 
 * FILE ORGANIZATION:
 * - auth.php: Contains only core authentication functions (requireLogin, requireAdmin)
 * - user_helpers.php: Contains all helper functions for checking user status and roles
 */

require_once __DIR__ . '/auth.php';

/**
 * Check if a user is currently logged in
 * @return bool
 */
function isLoggedIn()
{
    return isset($_SESSION['user']);
}

/**
 * Get the current logged-in user data
 * @return array|null
 */
function getCurrentUser()
{
    return $_SESSION['user'] ?? null;
}

/**
 * Get the current user's ID
 * @return int|null
 */
function getCurrentUserId()
{
    return $_SESSION['user']['id'] ?? null;
}

/**
 * Get the current user's name
 * @return string|null
 */
function getCurrentUserName()
{
    return $_SESSION['user']['name'] ?? null;
}

/**
 * Get the current user's email
 * @return string|null
 */
function getCurrentUserEmail()
{
    return $_SESSION['user']['email'] ?? null;
}

/**
 * Check if the current user has a specific role
 * @param string $role
 * @return bool
 */
function hasRole($role)
{
    return isset($_SESSION['user']) && $_SESSION['user']['role'] === $role;
}

/**
 * Check if the current user is an admin
 * @return bool
 */
function isAdmin()
{
    return isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin';
}

/**
 * Check if the current user is a regular user (not admin)
 * @return bool
 */
function isRegularUser()
{
    return isset($_SESSION['user']) && $_SESSION['user']['role'] === 'user';
}

/**
 * Get the current user's role
 * @return string|null
 */
function getUserRole()
{
    return $_SESSION['user']['role'] ?? null;
}

/**
 * Check if the current user has any of the specified roles
 * @param array $roles
 * @return bool
 */
function hasAnyRole($roles)
{
    if (!isset($_SESSION['user'])) {
        return false;
    }
    
    return in_array($_SESSION['user']['role'], $roles);
}

/**
 * Redirect user if they don't have the required role
 * @param string $role
 * @param string $redirectUrl
 */
function requireRole($role, $redirectUrl = '../public/index.php')
{
    if (!hasRole($role)) {
        $_SESSION['errors']['auth'] = "You don't have permission to view that page.";
        header('Location: ' . $redirectUrl);
        exit;
    }
}

/**
 * Redirect user if they don't have any of the required roles
 * @param array $roles
 * @param string $redirectUrl
 */
function requireAnyRole($roles, $redirectUrl = '../public/index.php')
{
    if (!hasAnyRole($roles)) {
        $_SESSION['errors']['auth'] = "You don't have permission to view that page.";
        header('Location: ' . $redirectUrl);
        exit;
    }
}

/**
 * Example usage in other files:
 * 
 * // Check if user is logged in
 * if (isLoggedIn()) {
 *     // User is logged in
 * }
 * 
 * // Check if user is admin
 * if (isAdmin()) {
 *     // Show admin features
 * }
 * 
 * // Check if user is regular user
 * if (isRegularUser()) {
 *     // Show user features like favorites
 * }
 * 
 * // Check for specific role
 * if (hasRole('moderator')) {
 *     // Show moderator features
 * }
 * 
 * // Check for multiple roles
 * if (hasAnyRole(['admin', 'moderator'])) {
 *     // Show admin or moderator features
 * }
 * 
 * // Require specific role (redirects if not met)
 * requireRole('admin', '../admin/dashboard.php');
 */
?>

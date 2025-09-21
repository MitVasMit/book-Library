<?php

/**
 * CSRF Protection Class
 * 
 * This class provides Cross-Site Request Forgery (CSRF) protection by:
 * 1. Generating unique, unpredictable tokens
 * 2. Storing tokens in session
 * 3. Validating tokens on form submission
 * 4. Regenerating tokens after each use
 * 
 * How it works:
 * - When user visits a form page, we generate a CSRF token
 * - Token is stored in session and included in form as hidden field
 * - When form is submitted, we validate the token matches session
 * - After validation, we generate a new token for next form
 */

class CSRF
{
    /**
     * Generate a new CSRF token
     * 
     * @return string The generated CSRF token
     */
    public static function generateToken()
    {
        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Generate cryptographically secure random token
        // bin2hex(random_bytes(32)) creates a 64-character hex string
        $token = bin2hex(random_bytes(32));

        // Store token in session
        $_SESSION['csrf_token'] = $token;

        // Also store timestamp for token expiration (optional security enhancement)
        $_SESSION['csrf_token_time'] = time();

        return $token;
    }

    /**
     * Get the current CSRF token from session
     * 
     * @return string|null The current CSRF token or null if not set
     */
    public static function getToken()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        return $_SESSION['csrf_token'] ?? null;
    }

    /**
     * Validate CSRF token
     * 
     * @param string $token The token to validate
     * @param int $maxAge Maximum age of token in seconds (default: 1 hour)
     * @return bool True if token is valid, false otherwise
     */
    public static function validateToken($token, $maxAge = 3600)
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Check if token exists in session
        if (!isset($_SESSION['csrf_token'])) {
            return false;
        }

        // Check if token matches
        if (!hash_equals($_SESSION['csrf_token'], $token)) {
            return false;
        }

        // Check if token has expired (optional security enhancement)
        if (isset($_SESSION['csrf_token_time'])) {
            if ((time() - $_SESSION['csrf_token_time']) > $maxAge) {
                // Token expired, remove it
                unset($_SESSION['csrf_token']);
                unset($_SESSION['csrf_token_time']);
                return false;
            }
        }

        return true;
    }

    /**
     * Regenerate CSRF token after successful validation
     * This prevents token reuse and enhances security
     * 
     * @return string The new CSRF token
     */
    public static function regenerateToken()
    {
        // Generate new token
        return self::generateToken();
    }

    /**
     * Generate CSRF token HTML input field
     * 
     * @return string HTML input field with CSRF token
     */
    public static function getTokenField()
    {
        $token = self::getToken();
        if (!$token) {
            $token = self::generateToken();
        }

        return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
    }

    /**
     * Validate CSRF token from POST data
     * 
     * @param int $maxAge Maximum age of token in seconds
     * @return bool True if token is valid, false otherwise
     */
    public static function validatePostToken($maxAge = 1800)
    {
        $token = $_POST['csrf_token'] ?? '';
        return self::validateToken($token, $maxAge);
    }

    /**
     * Validate CSRF token from GET data (for AJAX requests)
     * 
     * @param int $maxAge Maximum age of token in seconds
     * @return bool True if token is valid, false otherwise
     */
    public static function validateGetToken($maxAge = 3600)
    {
        $token = $_GET['csrf_token'] ?? '';
        return self::validateToken($token, $maxAge);
    }

    /**
     * Clear CSRF token from session
     * Useful for logout or security cleanup
     */
    public static function clearToken()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        unset($_SESSION['csrf_token']);
        unset($_SESSION['csrf_token_time']);
    }
}

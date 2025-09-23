<?php

class CSRF
{
    /**
     * Generate a new CSRF token
     * 
     * @return string 
     */
    public static function generateToken()
    {
        // Session must be started before calling this method
        if (session_status() !== PHP_SESSION_ACTIVE) {
            throw new Exception('Session must be started before generating CSRF token');
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
     * @return string|null
     */
    public static function getToken()
    {
        // Session must be started before calling this method
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return null;
        }

        return $_SESSION['csrf_token'] ?? null;
    }

    /**
     * Validate CSRF token
     * 
     * @param string 
     * @param int 
     * @return bool 
     */
    public static function validateToken($token, $maxAge = 3600)
    {
        // Session must be started before calling this method
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return false;
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
     * @return string 
     */
    public static function getTokenField()
    {
        $token = self::getToken();
        if (!$token) {
            // If no token exists and session is not active, return empty field
            // This should not happen if SecureSession::start() is called first
            return '<input type="hidden" name="csrf_token" value="">';
        }

        return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
    }

    /**
     * Validate CSRF token from POST data
     * 
     * @param int 
     * @return bool 
     */
    public static function validatePostToken($maxAge = 1800)
    {
        $token = $_POST['csrf_token'] ?? '';
        return self::validateToken($token, $maxAge);
    }

    /**
     * Validate CSRF token from GET data (for AJAX requests)
     * 
     * @param int
     * @return bool 
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
        // Session must be started before calling this method
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return;
        }

        unset($_SESSION['csrf_token']);
        unset($_SESSION['csrf_token_time']);
    }
}

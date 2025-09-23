<?php

class SecureSession
{
    /**
     * Session timeout in seconds (30 minutes)
     */
    const SESSION_TIMEOUT = 60; // 30 minutes
    
    /**
     * Session regeneration interval in seconds (15 minutes)
     */
    const REGENERATE_INTERVAL = 120; // 15 minutes
    
    /**
     * Start a secure session with all security settings
     * 
     * @param bool 
     * @return bool 
     */
    public static function start($regenerateId = false)
    {
        // If session is already started, destroy it and recreate with secure settings
        if (session_status() === PHP_SESSION_ACTIVE) {
            // Store current session data
            $sessionData = $_SESSION;
            
            // Destroy current session
            session_destroy();
            
            // Configure session security settings
            self::configureSessionSecurity();
            
            // Start new secure session
            if (!session_start()) {
                return false;
            }
            
            // Restore session data
            $_SESSION = $sessionData;
        } else {
            // Configure session security settings
            self::configureSessionSecurity();
            
            // Start the session
            if (!session_start()) {
                return false;
            }
        }
        
        // Regenerate session ID if requested
        if ($regenerateId) {
            self::regenerate();
        }
        
        // Generate CSRF token if it doesn't exist
        if (!isset($_SESSION['csrf_token'])) {
            require_once __DIR__ . '/csrf.php';
            CSRF::generateToken();
        }
        
        // Check for session timeout
        self::checkTimeout();
        
        // Check if we need to regenerate session ID
        self::checkRegeneration();
        
        return true;
    }
    
    /**
     * Configure all session security settings
     * This is called before session_start()
     */
    private static function configureSessionSecurity()
    {
        // Set session cookie parameters for security
        $cookieParams = [
            'lifetime' => self::SESSION_TIMEOUT,           
            'path' => '/',                                 
            'domain' => '',                                
            'secure' => self::isHttps(),                   
            'httponly' => true,                           
            'samesite' => 'Strict'                         
        ];
        
        // Apply the cookie parameters
        session_set_cookie_params($cookieParams);
        
        // Set additional session security options
        ini_set('session.use_strict_mode', 1);             
        ini_set('session.use_only_cookies', 1);            
        ini_set('session.cookie_secure', self::isHttps() ? 1 : 0); 
        ini_set('session.cookie_httponly', 1);            
        ini_set('session.cookie_samesite', 'Strict');     
        ini_set('session.gc_maxlifetime', self::SESSION_TIMEOUT);  
        ini_set('session.gc_probability', 1);             
        ini_set('session.gc_divisor', 100);              
    }
    
    /**
     * Check if we're running over HTTPS
     * 
     * @return bool
     */
    private static function isHttps()
    {
        // Check if HTTPS is enabled
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            return true;
        }
        
        // Check for proxy headers (common in load balancers)
        if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
            return true;
        }
        
        // Check for forwarded SSL
        if (isset($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] === 'on') {
            return true;
        }
        
        return false;
    }
    
    /**
     * Regenerate session ID while preserving session data
     * This prevents session fixation attacks
     * 
     * @return bool 
     */
    public static function regenerate()
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return false;
        }
        
        // Store current session data
        $sessionData = $_SESSION;
        
        // Regenerate session ID
        if (!session_regenerate_id(true)) {
            return false;
        }
        
        // Restore session data
        $_SESSION = $sessionData;
        
        // Update regeneration timestamp
        $_SESSION['_last_regeneration'] = time();
        
        return true;
    }
    
    /**
     * Check if session has timed out
     * If timeout, destroy session and redirect to login
     */
    private static function checkTimeout()
    {
        // Check if user is logged in
        if (!isset($_SESSION['user'])) {
            return;
        }
        
        // Check if last activity is set
        if (!isset($_SESSION['_last_activity'])) {
            $_SESSION['_last_activity'] = time();
            return;
        }
        
    // Check if session has timed out
    $inactiveTime = time() - $_SESSION['_last_activity'];
    if ($inactiveTime > self::SESSION_TIMEOUT) {
        // Store timeout message in a way that persists after session destruction
        $timeoutMessage = 'Your session has expired due to inactivity. Please log in again.';
        
        // Log the timeout for debugging
        error_log("Session timeout detected. Inactive time: {$inactiveTime} seconds, Timeout: " . self::SESSION_TIMEOUT . " seconds");
        
        // Session has timed out
        self::destroy();
        
        // Check if this is an AJAX request
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            // AJAX request - return JSON response
            header('Content-Type: application/json');
            http_response_code(401);
            echo json_encode(['error' => 'Session expired', 'redirect' => '/book-Library/public/login.php?timeout=1']);
            exit;
        } else {
            // Regular request - redirect with timeout parameter
            header('Location: /book-Library/public/login.php?timeout=1');
            exit;
        }
    }
        
        // Update last activity time
        $_SESSION['_last_activity'] = time();
    }
    
    /**
     * Check if we need to regenerate session ID
     * Regenerate every 15 minutes for additional security
     */
    private static function checkRegeneration()
    {
        // Only regenerate if user is logged in
        if (!isset($_SESSION['user'])) {
            return;
        }
        
        // Check if regeneration is needed
        $lastRegeneration = $_SESSION['_last_regeneration'] ?? 0;
        $timeSinceRegeneration = time() - $lastRegeneration;
        
        if ($timeSinceRegeneration > self::REGENERATE_INTERVAL) {
            self::regenerate();
        }
    }
    
    /**
     * Destroy the current session
     * Clears all session data and removes the session cookie
     */
    public static function destroy()
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            // Clear all session data
            $_SESSION = [];
            
            // Destroy the session
            session_destroy();
            
            // Remove the session cookie
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(
                    session_name(),
                    '',
                    time() - 42000,
                    $params["path"],
                    $params["domain"],
                    $params["secure"],
                    $params["httponly"]
                );
            }
        }
    }
    
    /**
     * Check if user is logged in and session is valid
     * 
     * @return bool 
     */
    public static function isLoggedIn()
    {
        return isset($_SESSION['user']) && !empty($_SESSION['user']);
    }
    
    /**
     * Get the current user data
     * 
     * @return array|null 
     */
    public static function getCurrentUser()
    {
        return $_SESSION['user'] ?? null;
    }
    
    /**
     * Get session timeout remaining time in seconds
     * 
     * @return int 
     */
    public static function getTimeoutRemaining()
    {
        if (!isset($_SESSION['_last_activity'])) {
            return self::SESSION_TIMEOUT;
        }
        
        $elapsed = time() - $_SESSION['_last_activity'];
        $remaining = self::SESSION_TIMEOUT - $elapsed;
        
        return max(0, $remaining);
    }
    
    /**
     * Extend session timeout by updating last activity
     * Useful for AJAX requests to keep session alive
     */
    public static function extendTimeout()
    {
        if (self::isLoggedIn()) {
            $_SESSION['_last_activity'] = time();
        }
    }
}

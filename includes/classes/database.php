<?php
abstract class DB
{
    protected $instance;

    public function __construct()
    {
        try {
            // Get database credentials from environment variables
            $host = $_ENV['DB_HOST'] ?? 'localhost';
            $dbname = $_ENV['DB_NAME'] ?? 'book_library';
            $username = $_ENV['DB_USER'] ?? 'root';
            $password = $_ENV['DB_PASSWORD'] ?? '';
            $charset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';
            
            // Create DSN (Data Source Name)
            $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";
            
            $this->instance = new PDO(
                $dsn,
                $username,
                $password,
                [
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            // Log the error for debugging (don't expose sensitive info to users)
            error_log('Database connection error: ' . $e->getMessage());
            echo 'Database connection error.';
            die();
        }
    }

    public function getConnection()
    {
        return $this->instance;
    }
}

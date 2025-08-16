<?php
abstract class DB
{
    protected $instance;

    public function __construct()
    {
        try {
            $this->instance = new PDO(
                'mysql:host=localhost;dbname=book_library;charset=utf8mb4',
                'root',
                '',
                [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
            );
        } catch (PDOException $e) {
            echo 'Database connection error.';
            die();
        }
    }

    public function getConnection()
    {
        return $this->instance;
    }
}

<?php

class Favorite extends DB
{
    public function __construct()
    {
        parent::__construct();
    }

    public function addFavorite($userId, $bookId)
    {
        try {
            $sql = "INSERT INTO favorites (user_id, book_id) VALUES (:user_id, :book_id)";
            $stmt = $this->instance->prepare($sql);
            return $stmt->execute([
                'user_id' => $userId,
                'book_id' => $bookId
            ]);
        } catch (PDOException $e) {
            // If it's a duplicate key error, the book is already favorited
            if ($e->getCode() == 23000) {
                return true;
            }
            return false;
        }
    }

    public function removeFavorite($userId, $bookId)
    {
        $sql = "DELETE FROM favorites WHERE user_id = :user_id AND book_id = :book_id";
        $stmt = $this->instance->prepare($sql);
        return $stmt->execute([
            'user_id' => $userId,
            'book_id' => $bookId
        ]);
    }

    public function isFavorited($userId, $bookId)
    {
        $sql = "SELECT 1 FROM favorites WHERE user_id = :user_id AND book_id = :book_id LIMIT 1";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute([
            'user_id' => $userId,
            'book_id' => $bookId
        ]);
        return (bool) $stmt->fetch();
    }

    public function getUserFavorites($userId)
    {
        $sql = "SELECT f.book_id as id, b.title, b.author, b.cover_image, b.rating, c.name as category_name 
                FROM favorites f 
                JOIN books b ON f.book_id = b.id 
                JOIN categories c ON b.category_id = c.id 
                WHERE f.user_id = :user_id AND b.deleted = 0 
                ORDER BY f.created_at DESC";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBookFavoriteCount($bookId)
    {
        $sql = "SELECT COUNT(*) as count FROM favorites WHERE book_id = :book_id";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute(['book_id' => $bookId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return intval($result['count']);
    }

    public function getFavoriteCount($userId)
    {
        $sql = "SELECT COUNT(*) as count FROM favorites f 
                JOIN books b ON f.book_id = b.id 
                WHERE f.user_id = :user_id AND b.deleted = 0";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) $result['count'];
    }

    public function getAllUserFavorites()
    {
        $sql = "SELECT f.*, u.name as user_name, u.email, b.title, b.author, b.cover_image, c.name as category_name 
                FROM favorites f 
                JOIN users u ON f.user_id = u.id 
                JOIN books b ON f.book_id = b.id 
                JOIN categories c ON b.category_id = c.id 
                WHERE b.deleted = 0 
                ORDER BY f.created_at DESC";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFavoritesByUser($userId)
    {
        $sql = "SELECT f.*, b.title, b.author, b.cover_image, b.rating, c.name as category_name 
                FROM favorites f 
                JOIN books b ON f.book_id = b.id 
                JOIN categories c ON b.category_id = c.id 
                WHERE f.user_id = :user_id AND b.deleted = 0 
                ORDER BY f.created_at DESC";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

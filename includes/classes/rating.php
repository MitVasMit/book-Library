<?php

class Rating extends DB
{
    public function saveRating($userId, $bookKey, $bookTitle, $bookAuthor, $rating)
    {
        $sql = "INSERT INTO openlibrary_ratings (user_id, book_key, book_title, book_author, rating) 
                VALUES (:user_id, :book_key, :book_title, :book_author, :rating)
                ON DUPLICATE KEY UPDATE rating = :rating, updated_at = CURRENT_TIMESTAMP";
        
        $stmt = $this->instance->prepare($sql);
        return $stmt->execute([
            'user_id' => $userId,
            'book_key' => $bookKey,
            'book_title' => $bookTitle,
            'book_author' => $bookAuthor,
            'rating' => $rating
        ]);
    }

    public function getUserRating($userId, $bookKey)
    {
        $sql = "SELECT rating FROM openlibrary_ratings WHERE user_id = :user_id AND book_key = :book_key";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute(['user_id' => $userId, 'book_key' => $bookKey]);
        $result = $stmt->fetch();
        return $result ? $result['rating'] : null;
    }

    public function getAverageRating($bookKey)
    {
        $sql = "SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings 
                FROM openlibrary_ratings WHERE book_key = :book_key";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute(['book_key' => $bookKey]);
        $result = $stmt->fetch();
        return [
            'average' => $result['avg_rating'] ? round($result['avg_rating'], 1) : 0,
            'total' => $result['total_ratings'] ? (int)$result['total_ratings'] : 0
        ];
    }

    public function getBookRatings($bookKey)
    {
        $sql = "SELECT r.rating, r.created_at, u.name as user_name 
                FROM openlibrary_ratings r 
                JOIN users u ON r.user_id = u.id 
                WHERE r.book_key = :book_key 
                ORDER BY r.created_at DESC 
                LIMIT 10";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute(['book_key' => $bookKey]);
        return $stmt->fetchAll();
    }
} 
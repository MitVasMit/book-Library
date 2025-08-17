<?php

class Rating extends DB
{
    public function createRating($userId, $bookId, $rating)
    {
        // Check if user already rated this book
        $existingRating = $this->getUserRating($userId, $bookId);
        
        if ($existingRating) {
            // Update existing rating
            $sql = "UPDATE ratings SET rating = :rating, updated_at = NOW() WHERE user_id = :user_id AND book_id = :book_id";
            $stmt = $this->instance->prepare($sql);
            return $stmt->execute([
                'rating' => $rating,
                'user_id' => $userId,
                'book_id' => $bookId
            ]);
        } else {
            // Create new rating
            $sql = "INSERT INTO ratings (user_id, book_id, rating) VALUES (:user_id, :book_id, :rating)";
            $stmt = $this->instance->prepare($sql);
            return $stmt->execute([
                'user_id' => $userId,
                'book_id' => $bookId,
                'rating' => $rating
            ]);
        }
    }

    public function getUserRating($userId, $bookId)
    {
        $sql = "SELECT rating FROM ratings WHERE user_id = :user_id AND book_id = :book_id";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute([
            'user_id' => $userId,
            'book_id' => $bookId
        ]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $result['rating'] : null;
    }

    public function getBookRating($bookId)
    {
        $sql = "SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE book_id = :book_id";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute(['book_id' => $bookId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'average_rating' => round($result['average_rating'], 1) ?: 0,
            'total_ratings' => (int)$result['total_ratings']
        ];
    }

    public function getBookRatingWithUser($bookId, $userId = null)
    {
        $bookRating = $this->getBookRating($bookId);
        $userRating = null;
        
        if ($userId) {
            $userRating = $this->getUserRating($userId, $bookId);
        }
        
        return [
            'average_rating' => $bookRating['average_rating'],
            'total_ratings' => $bookRating['total_ratings'],
            'user_rating' => $userRating
        ];
    }
} 
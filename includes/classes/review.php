<?php

class Review extends DB
{
    public function createReview($userId, $bookId, $rating, $comment)
    {
        $sql = "INSERT INTO reviews (user_id, book_id, rating, comment, approved, status) 
                VALUES (:user_id, :book_id, :rating, :comment, FALSE, 'pending')";
        
        $stmt = $this->instance->prepare($sql);
        return $stmt->execute([
            'user_id' => $userId,
            'book_id' => $bookId,
            'rating' => $rating,
            'comment' => $comment
        ]);
    }

    public function getPendingReviews()
    {
        $sql = "SELECT r.*, u.name as user_name, b.title as book_title, b.author as book_author 
                FROM reviews r 
                JOIN users u ON r.user_id = u.id 
                JOIN books b ON r.book_id = b.id 
                WHERE r.approved = FALSE AND r.status = 'pending' 
                ORDER BY r.created_at DESC";
        
        $stmt = $this->instance->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function approveReview($reviewId)
    {
        $sql = "UPDATE reviews SET approved = TRUE, status = 'approved' WHERE id = :id";
        $stmt = $this->instance->prepare($sql);
        return $stmt->execute(['id' => $reviewId]);
    }

    public function rejectReview($reviewId)
    {
        // Instead of deleting, mark as rejected
        $sql = "UPDATE reviews SET approved = FALSE, status = 'rejected' WHERE id = :id";
        $stmt = $this->instance->prepare($sql);
        return $stmt->execute(['id' => $reviewId]);
    }

    public function getApprovedReviews($bookId = null)
    {
        if ($bookId) {
            $sql = "SELECT r.*, u.name as user_name 
                    FROM reviews r 
                    JOIN users u ON r.user_id = u.id 
                    WHERE r.book_id = :book_id AND r.approved = TRUE 
                    ORDER BY r.created_at DESC";
            
            $stmt = $this->instance->prepare($sql);
            $stmt->execute(['book_id' => $bookId]);
        } else {
            $sql = "SELECT r.*, u.name as user_name, b.title as book_title, b.author as book_author 
                    FROM reviews r 
                    JOIN users u ON r.user_id = u.id 
                    JOIN books b ON r.book_id = b.id 
                    WHERE r.approved = TRUE 
                    ORDER BY r.created_at DESC";
            
            $stmt = $this->instance->prepare($sql);
            $stmt->execute();
        }
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRejectedReviews()
    {
        $sql = "SELECT r.*, u.name as user_name, b.title as book_title, b.author as book_author 
                FROM reviews r 
                JOIN users u ON r.user_id = u.id 
                JOIN books b ON r.book_id = b.id 
                WHERE r.approved = FALSE AND r.status = 'rejected' 
                ORDER BY r.created_at DESC";
        
        $stmt = $this->instance->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUserReview($userId, $bookId)
    {
        $sql = "SELECT * FROM reviews WHERE user_id = :user_id AND book_id = :book_id";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute([
            'user_id' => $userId,
            'book_id' => $bookId
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateReview($reviewId, $rating, $comment)
    {
        $sql = "UPDATE reviews SET rating = :rating, comment = :comment, approved = FALSE, status = 'pending' WHERE id = :id";
        $stmt = $this->instance->prepare($sql);
        return $stmt->execute([
            'id' => $reviewId,
            'rating' => $rating,
            'comment' => $comment
        ]);
    }

    public function getAllReviews()
    {
        $sql = "SELECT COUNT(*) as total FROM reviews";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'];
    }
}

<?php

class PrivateComment extends DB
{

    /**
     * Add a private comment for a user and book
     */
    public function addComment($userId, $bookId, $comment) {
        try {
            $stmt = $this->instance->prepare("
                INSERT INTO private_comments (user_id, book_id, comment) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE comment = ?, updated_at = CURRENT_TIMESTAMP
            ");
            
            $result = $stmt->execute([$userId, $bookId, $comment, $comment]);
            
            if (!$result) {
                error_log("Failed to execute private comment insert/update for user $userId, book $bookId");
                return false;
            }
            
            return true;
        } catch (PDOException $e) {
            error_log("Error adding private comment: " . $e->getMessage());
            error_log("SQL State: " . $e->getCode());
            error_log("User ID: $userId, Book ID: $bookId");
            return false;
        }
    }

    /**
     * Get private comment for a specific user and book
     */
    public function getUserComment($userId, $bookId) {
        try {
            $stmt = $this->instance->prepare("
                SELECT * FROM private_comments 
                WHERE user_id = ? AND book_id = ?
            ");
            $stmt->execute([$userId, $bookId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting user comment: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all private comments for admin dashboard
     */
    public function getAllComments() {
        try {
            $stmt = $this->instance->prepare("
                SELECT pc.*, u.name as user_name, u.email, b.title as book_title, b.author as book_author
                FROM private_comments pc
                JOIN users u ON pc.user_id = u.id
                JOIN books b ON pc.book_id = b.id
                ORDER BY pc.created_at DESC
            ");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting all comments: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get private comments count for admin dashboard
     */
    public function getCommentsCount() {
        try {
            $stmt = $this->instance->prepare("SELECT COUNT(*) FROM private_comments");
            $stmt->execute();
            return $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("Error getting comments count: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get private comments by user for admin dashboard
     */
    public function getCommentsByUser($userId) {
        try {
            $stmt = $this->instance->prepare("
                SELECT pc.*, b.title as book_title, b.author as book_author
                FROM private_comments pc
                JOIN books b ON pc.book_id = b.id
                WHERE pc.user_id = ?
                ORDER BY pc.created_at DESC
            ");
            $stmt->execute([$userId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting user comments: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Delete a private comment
     */
    public function deleteComment($commentId, $userId) {
        try {
            $stmt = $this->instance->prepare("
                DELETE FROM private_comments 
                WHERE id = ? AND user_id = ?
            ");
            return $stmt->execute([$commentId, $userId]);
        } catch (PDOException $e) {
            error_log("Error deleting comment: " . $e->getMessage());
            return false;
        }
    }
}

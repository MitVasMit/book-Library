<?php

class Book extends DB
{
    public function searchBooks(string $query): array
    {
        // split query into words for more precise matching
        $queryWords = explode(' ', trim($query));
        $queryWords = array_filter($queryWords, function($word) { return strlen($word) > 0; });
        
        if (empty($queryWords)) {
            return [];
        }
        
        // build a more precise search query
        $conditions = [];
        $params = [];
        
        foreach ($queryWords as $index => $word) {
            $paramName = "word" . $index;
            $conditions[] = "(title LIKE :{$paramName} OR author LIKE :{$paramName})";
            $params[$paramName] = $word . '%';
        }
        
        $sql = "SELECT title, author, cover_image, rating FROM books WHERE (" . implode(' OR ', $conditions) . ") AND deleted = 0";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getAllWithCategory()
    {
        $sql = "SELECT b.*, c.name AS category_name
            FROM books b
            JOIN categories c ON b.category_id = c.id
            ORDER BY b.created_at DESC";

        $stmt = $this->instance->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data): bool
    {
        $sql = "INSERT INTO books (title, author, description, published_year, pages, rating, cover_image, category_id) 
                VALUES (:title, :author, :description, :published_year, :pages, :rating, :cover_image, :category_id)";
        
        $stmt = $this->instance->prepare($sql);
        return $stmt->execute($data);
    }

    public function softDelete($id): bool
    {
        $stmt = $this->instance->prepare('UPDATE books SET deleted = 1 WHERE id = :id');
        return $stmt->execute(['id' => $id]);
    }

    public function restoreBook($id): bool
    {
        $stmt = $this->instance->prepare('UPDATE books SET deleted = 0 WHERE id = :id');
        return $stmt->execute(['id' => $id]);
    }
}

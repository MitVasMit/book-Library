<?php

class Category extends DB
{
    public function __construct()
    {
        parent::__construct();
    }
    public function getAll(): array
    {
        $sql = "SELECT * FROM categories ORDER BY name ASC";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $id): ?array
    {
        $sql = "SELECT * FROM categories WHERE id = :id";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(string $name, string $slug): bool
    {
        $sql = "INSERT INTO categories (name, slug) VALUES (:name, :slug)";
        $stmt = $this->instance->prepare($sql);
        return $stmt->execute(['name' => $name, 'slug' => $slug]);
    }

    public function update(int $id, string $name, string $slug): bool
    {
        $sql = "UPDATE categories SET name = :name, slug = :slug WHERE id = :id";
        $stmt = $this->instance->prepare($sql);
        return $stmt->execute(['id' => $id, 'name' => $name, 'slug' => $slug]);
    }

    public function delete(int $id): bool
    {
        // Check if category is being used by any books
        $sql = "SELECT COUNT(*) FROM books WHERE category_id = :id";
        $stmt = $this->instance->prepare($sql);
        $stmt->execute(['id' => $id]);
        $count = $stmt->fetchColumn();
        
        if ($count > 0) {
            return false; // cannot delete category that has books
        }
        
        $sql = "DELETE FROM categories WHERE id = :id";
        $stmt = $this->instance->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
} 
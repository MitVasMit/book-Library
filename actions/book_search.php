<?php
header('Content-Type: application/json');

require_once '../includes/autoload.php';

$searchQuery = $_GET['q'] ?? '';
$debug = $_GET['debug'] ?? false;
$results = [];

try {
    if (!empty($searchQuery)) {
        $apiUrl = 'https://openlibrary.org/search.json?title=' . urlencode($searchQuery);
        $apiResponse = file_get_contents($apiUrl);

        if ($apiResponse) {
            $apiData = json_decode($apiResponse, true);
            
            // Debug: Log the first book from API to see all available fields
            if (!empty($apiData['docs'])) {
                error_log('First API book data: ' . json_encode($apiData['docs'][0]));
            }

            // If debug mode is enabled, return the full API response
            if ($debug) {
                echo json_encode($apiData, JSON_PRETTY_PRINT);
                exit;
            }

            $filteredBooks = array_filter($apiData['docs'], function ($book) use ($searchQuery) {
                return isset($book['title']) && stripos($book['title'], $searchQuery) !== false;
            });

            foreach (array_slice($filteredBooks, 0, 6) as $book) {
                $results[] = [
                    'title'  => $book['title'] ?? 'No title',
                    'author' => $book['author_name'][0] ?? 'Unknown',
                    'source' => 'Open Library',
                    'cover_id' => $book['cover_i'] ?? null,
                    'rating' => $book['rating_average'] ?? $book['rating'] ?? 0,
                    'key' => $book['key'] ?? null // Add key for OpenLibrary
                ];
            }
        }

        // Test: Get all books with ratings to see if the database query works
        $bookModel = new Book();
        $allBooks = $bookModel->getAllWithCategory();
        error_log('All books with ratings: ' . json_encode(array_slice($allBooks, 0, 3)));

        if (isset($bookModel)) {
            $localBooks = $bookModel->searchBooks($searchQuery);

            foreach ($localBooks as $book) {
                $results[] = [
                    'title'    => $book['title'],
                    'author'   => $book['author'],
                    'cover_image' => $book['cover_image'] ?? null,
                    'source'   => 'Local DB',
                    'rating'   => $book['rating'] ?? 0,
                    'key'      => $book['key'] ?? null // Add key for local DB if available
                ];
            }
        } else {
            $bookModel = new Book();
            $localBooks = $bookModel->searchBooks($searchQuery);

            foreach ($localBooks as $book) {
                $results[] = [
                    'title'    => $book['title'],
                    'author'   => $book['author'],
                    'cover_image' => $book['cover_image'] ?? null,
                    'source'   => 'Local DB',
                    'rating'   => $book['rating'] ?? 0,
                    'key'      => $book['key'] ?? null // Add key for local DB if available
                ];
            }
        }
        
        // Debug: Log the results
        error_log('Search results: ' . json_encode($results));
    }

    echo json_encode($results);
} catch (Exception $e) {
    error_log('Search error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Search failed: ' . $e->getMessage()]);
}

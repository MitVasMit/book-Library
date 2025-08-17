<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once '../includes/autoload.php';
    
    $searchQuery = $_GET['q'] ?? '';
    $debug = $_GET['debug'] ?? false;
    $results = [];
    
    if (empty($searchQuery)) {
        echo json_encode([]);
        exit;
    }
    
    try {
        $bookModel = new Book();
        $testConnection = $bookModel->getAllWithCategory();
        error_log('Database connection test successful. Found ' . count($testConnection) . ' books.');
    } catch (Exception $e) {
        error_log('Database connection failed: ' . $e->getMessage());
        throw new Exception('Database connection failed: ' . $e->getMessage());
    }
    
    try {
        $localBooks = $bookModel->searchBooks($searchQuery);
        error_log('Local search found ' . count($localBooks) . ' books for query: ' . $searchQuery);
        
        foreach ($localBooks as $book) {
            $results[] = [
                'id'       => $book['id'],
                'title'    => $book['title'],
                'author'   => $book['author'],
                'cover_image' => $book['cover_image'] ?? null,
                'source'   => 'Local DB',
                'rating'   => $book['rating'] ?? 0,
                'key'      => null
            ];
        }
    } catch (Exception $e) {
        error_log('Local search failed: ' . $e->getMessage());
    }
    
    try {
        $apiUrl = 'https://openlibrary.org/search.json?title=' . urlencode($searchQuery);
        $apiResponse = file_get_contents($apiUrl);
        
        if ($apiResponse) {
            $apiData = json_decode($apiResponse, true);
            
            if (!empty($apiData['docs'])) {
                $filteredBooks = array_filter($apiData['docs'], function ($book) use ($searchQuery) {
                    if (!isset($book['title'])) return false;
                    
                    $title = strtolower($book['title']);
                    $queryLower = strtolower($searchQuery);
                    
                    $queryWords = explode(' ', $queryLower);
                    $queryWords = array_filter($queryWords, function($word) { return strlen($word) > 0; });
                    
                    return array_reduce($queryWords, function($carry, $word) use ($title) {
                        return $carry || strpos($title, $word) === 0 || 
                               strpos($title, ' ' . $word) !== false; 
                    }, false);
                });
                
                foreach (array_slice($filteredBooks, 0, 6) as $book) {
                    $results[] = [
                        'title'  => $book['title'] ?? 'No title',
                        'author' => isset($book['author_name'][0]) ? $book['author_name'][0] : 'Unknown',
                        'source' => 'Open Library',
                        'cover_id' => $book['cover_i'] ?? null,
                        'rating' => $book['rating_average'] ?? $book['rating'] ?? 0,
                        'key' => $book['key'] ?? null
                    ];
                }
            }
        }
    } catch (Exception $e) {
        error_log('API search failed: ' . $e->getMessage());
    }
    
    error_log('Final search results: ' . json_encode($results));
    echo json_encode($results);
    
} catch (Exception $e) {
    error_log('Search error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Search failed: ' . $e->getMessage()]);
}

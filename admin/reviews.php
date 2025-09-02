<?php
require_once '../includes/auth.php';
require_once '../includes/autoload.php';

requireAdmin();

$reviewModel = new Review();
$pendingReviews = $reviewModel->getPendingReviews();

include('../includes/header.php');
?>

<div class="flex min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
    <?php include_once '../includes/admin/admin_nav.php'; ?>

    <main class="flex-1 p-3 sm:p-6 min-w-0">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Review Management</h1>
        </div>

        <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav class="-mb-px flex space-x-8">
                <button onclick="showTab('pending')" id="pending-tab"
                    class="tab-button border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 py-2 px-1 text-sm font-medium">
                    Pending Reviews
                    <span class="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <?= count($pendingReviews) ?>
                    </span>
                </button>
                <button onclick="showTab('approved')" id="approved-tab"
                    class="tab-button border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-2 px-1 text-sm font-medium">
                    Approved Reviews
                </button>
                <button onclick="showTab('rejected')" id="rejected-tab"
                    class="tab-button border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-2 px-1 text-sm font-medium">
                    Rejected Reviews
                </button>
            </nav>
        </div>

        <div id="pending-content" class="tab-content hidden">
            <?php if (empty($pendingReviews)): ?>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                    <p class="text-gray-500 dark:text-gray-400 text-lg">No pending reviews to approve.</p>
                </div>
            <?php else: ?>
                <div class="grid gap-6">
                    <?php foreach ($pendingReviews as $review): ?>
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6" data-review-id="<?= $review['id'] ?>">
                            <div class="flex justify-between items-start mb-4">
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                        Book: <?= htmlspecialchars($review['book_title']) ?>
                                    </h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">
                                        by <?= htmlspecialchars($review['book_author']) ?>
                                    </p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="flex text-yellow-400">
                                        <?php for ($i = 1; $i <= 5; $i++): ?>
                                            <span class="<?= $i <= $review['rating'] ? 'text-yellow-400' : 'text-gray-300' ?>">★</span>
                                        <?php endfor; ?>
                                    </div>
                                    <span class="text-sm text-gray-600 dark:text-gray-400"><?= $review['rating'] ?>/5</span>
                                </div>
                            </div>

                            <div class="mb-4 space-y-2">
                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Reviewer:</strong> <?= htmlspecialchars($review['user_name']) ?>
                                </p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Date:</strong> <?= date('M j, Y', strtotime($review['created_at'])) ?>
                                </p>
                                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <p class="text-gray-800 dark:text-gray-200"><?= htmlspecialchars($review['comment']) ?></p>
                                </div>
                            </div>

                            <div class="flex justify-end gap-2">
                                <button onclick="approveReview(<?= $review['id'] ?>)"
                                    class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md transition-colors text-sm">
                                    Approve
                                </button>
                                <button onclick="rejectReview(<?= $review['id'] ?>)"
                                    class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors text-sm">
                                    Reject
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

        <div id="approved-content" class="tab-content hidden">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                <p class="text-gray-500 dark:text-gray-400 text-lg">Loading approved reviews...</p>
            </div>
        </div>

        <div id="rejected-content" class="tab-content hidden">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                <p class="text-gray-500 dark:text-gray-400 text-lg">Loading rejected reviews...</p>
            </div>
        </div>
    </main>
</div>

<script src="../assets/js/admin/admin-reviews.js"></script>
<script src="../assets/js/admin/admin.js"></script>
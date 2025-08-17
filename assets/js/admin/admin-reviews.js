async function approveReview(reviewId) {
    try {
        const response = await fetch('/book-Library/actions/admin/approve_review.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                review_id: reviewId
            })
        });

        const data = await response.json();

        if (data.success) {
            // Remove the review card from the page
            const reviewCard = document.querySelector(`[data-review-id="${reviewId}"]`);
            reviewCard.remove();

            // Check if no more reviews
            const remainingReviews = document.querySelectorAll('[data-review-id]');
            if (remainingReviews.length === 0) {
                location.reload(); // Reload to show "no pending reviews" message
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while approving the review');
    }
}

async function rejectReview(reviewId) {
    if (!confirm('Are you sure you want to reject this review? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch('/book-Library/actions/admin/reject_review.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                review_id: reviewId
            })
        });

        const data = await response.json();

        if (data.success) {
            // Remove the review card from the page
            const reviewCard = document.querySelector(`[data-review-id="${reviewId}"]`);
            reviewCard.remove();

            // Check if no more reviews
            const remainingReviews = document.querySelectorAll('[data-review-id]');
            if (remainingReviews.length === 0) {
                location.reload(); // Reload to show "no pending reviews" message
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while rejecting the review');
    }
}

// Tab Management Functions
function showTab(tabName) {
    console.log('Switching to tab:', tabName); // Debug log
    
    // Hide all tab contents first
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.add('hidden');
        console.log('Hiding content:', content.id); // Debug log
    });
    
    // Remove active state from all tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
        button.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(`${tabName}-content`);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
        console.log('Showing content:', selectedContent.id); // Debug log
    } else {
        console.error('Content not found for tab:', tabName); // Debug log
    }
    
    // Activate selected tab button
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        selectedTab.classList.add('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
    }
    
    // Load content for the selected tab
    loadTabContent(tabName);
}

async function loadTabContent(tabName) {
    const contentDiv = document.getElementById(`${tabName}-content`);
    console.log('Loading content for tab:', tabName, 'Content div:', contentDiv); // Debug log
    
    if (tabName === 'pending') {
        // Pending reviews are already loaded via PHP
        console.log('Pending tab - content already loaded via PHP'); // Debug log
        return;
    }
    
    try {
        let endpoint;
        if (tabName === 'approved') {
            endpoint = '/book-Library/actions/admin/get_approved_reviews.php';
        } else if (tabName === 'rejected') {
            endpoint = '/book-Library/actions/admin/get_rejected_reviews.php';
        }
        
        if (endpoint) {
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (data.success) {
                renderReviewsList(contentDiv, data.reviews, tabName);
            } else {
                contentDiv.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                    <p class="text-red-500 dark:text-red-400 text-lg">Error loading reviews: ${data.error}</p>
                </div>`;
            }
        }
    } catch (error) {
        console.error('Error loading tab content:', error);
        contentDiv.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p class="text-red-500 dark:text-red-400 text-lg">Error loading reviews. Please try again.</p>
        </div>`;
    }
}

function renderReviewsList(container, reviews, tabName) {
    if (!reviews || reviews.length === 0) {
        container.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p class="text-gray-500 dark:text-gray-400 text-lg">No ${tabName} reviews found.</p>
        </div>`;
        return;
    }
    
    const reviewsHTML = reviews.map(review => `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6" data-review-id="${review.id}">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Book: ${review.book_title}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        by ${review.book_author}
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <div class="flex text-yellow-400">
                        ${Array.from({length: 5}, (_, i) => 
                            `<span class="${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}">★</span>`
                        ).join('')}
                    </div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">${review.rating}/5</span>
                </div>
            </div>

            <div class="mb-4 space-y-2">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Reviewer:</strong> ${review.user_name}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Date:</strong> ${new Date(review.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    })}
                </p>
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p class="text-gray-800 dark:text-gray-200">${review.comment}</p>
                </div>
            </div>

            ${tabName === 'approved' ? `
                <div class="flex justify-end gap-2">
                    <button onclick="rejectReview(${review.id})"
                        class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors text-sm">
                        Reject
                    </button>
                </div>
            ` : tabName === 'rejected' ? `
                <div class="flex justify-end gap-2">
                    <button onclick="approveReview(${review.id})"
                        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md transition-colors text-sm">
                        Approve
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    container.innerHTML = `<div class="grid gap-6">${reviewsHTML}</div>`;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing tabs...'); // Debug log
    
    // Ensure all tabs are hidden initially
    const allTabContents = document.querySelectorAll('.tab-content');
    allTabContents.forEach(content => {
        content.classList.add('hidden');
        console.log('Initially hiding:', content.id); // Debug log
    });
    
    // Show pending tab by default
    showTab('pending');
    
    // Debug: Log all tab elements found
    console.log('Found tab contents:', allTabContents.length);
    allTabContents.forEach(content => console.log('Tab content:', content.id));
});

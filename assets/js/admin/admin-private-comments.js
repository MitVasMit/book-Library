function viewUserComments(userId, userName) {
    const modal = document.getElementById('userCommentsModal');
    const content = document.getElementById('userCommentsContent');
    
    content.innerHTML = '<div class="flex justify-center items-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>';
    modal.classList.remove('hidden');
    
    const userRow = document.querySelector(`tr[data-user-id="${userId}"]`);
    if (userRow) {
        const commentsData = userRow.dataset.comments;
        if (commentsData) {
            try {
                const comments = JSON.parse(commentsData);
                displayUserComments(comments, userName);
            } catch (e) {
                content.innerHTML = '<div class="text-center py-8 text-red-600">Error parsing comments data</div>';
            }
        } else {
            content.innerHTML = '<div class="text-center py-8 text-red-600">No comments data found</div>';
        }
    } else {
        content.innerHTML = '<div class="text-center py-8 text-red-600">User data not found</div>';
    }
}

function displayUserComments(comments, userName) {
    const content = document.getElementById('userCommentsContent');
    
    if (comments.length === 0) {
        content.innerHTML = '<div class="text-center py-8 text-gray-500">No comments found for this user.</div>';
        return;
    }
    
    let html = `<h4 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">${userName}'s Personal Notes</h4>`;
    html += '<div class="space-y-3 sm:space-y-4">';
    
    comments.forEach(comment => {
        html += `
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1 sm:gap-0">
                    <h5 class="font-medium text-gray-900 dark:text-white text-sm sm:text-base break-words">${comment.book_title}</h5>
                    <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">${new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">by ${comment.book_author}</p>
                <p class="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">${comment.comment}</p>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

function closeUserCommentsModal() {
    document.getElementById('userCommentsModal').classList.add('hidden');
}

// Close modal when clicking outside of it
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('userCommentsModal');
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            // Check if the click is on the modal backdrop (not on the modal content)
            // The modal content is the white rounded div, so we check if click is outside of it
            const modalContent = modal.querySelector('.bg-white, .dark\\:bg-gray-800');
            
            if (modalContent && !modalContent.contains(e.target)) {
                closeUserCommentsModal();
            }
        });
    }
});

async function loadRanking() {
    const rankingId = window.location.pathname.split('/').pop();
    const leaderboardElement = document.getElementById('leaderboard');
    
    try {
        const response = await fetch(`/.netlify/functions/api/ranking/${rankingId}`);
        if (!response.ok) {
            throw new Error('Ranking not found');
        }
        const data = await response.json();
        displayRanking(data);
    } catch (error) {
        leaderboardElement.innerHTML = `
            <div class="error" role="alert">
                <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <p>${error.message === 'Ranking not found' ? 
                    'This ranking does not exist.' : 
                    'Error loading ranking data.'}</p>
            </div>
        `;
    }
}

function displayRanking(data) {
    const sortedStudents = [...data.students].sort((a, b) => b.score - a.score);
    const topThree = sortedStudents.slice(0, 3);
    const others = sortedStudents.slice(3);
    
    const html = `
        <div class="top-three" role="list">
            ${topThree.map((student, index) => `
                <div class="student-card place-${index + 1}" 
                     role="listitem"
                     style="animation: slideIn ${0.3 + index * 0.1}s ease-out">
                    <div class="medal ${getMedalClass(index + 1)}" 
                         role="img" 
                         aria-label="Rank ${index + 1} medal">
                        ${index + 1}
                    </div>
                    <img src="https://i.pravatar.cc/150?img=${30 + index}" 
                         alt="${student.name}'s avatar" 
                         class="student-img"
                         loading="lazy">
                    <h3 title="${student.name}">${student.name}</h3>
                    <p>Score: ${student.score}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="other-rankings" role="list">
            ${others.map((student, index) => `
                <div class="student-row" 
                     role="listitem"
                     style="animation: slideIn ${0.6 + index * 0.1}s ease-out">
                    <span class="rank" aria-label="Rank ${index + 4}">${index + 4}</span>
                    <img src="https://i.pravatar.cc/150?img=${34 + index}" 
                         alt="${student.name}'s avatar" 
                         class="student-img-small"
                         loading="lazy">
                    <span class="name" title="${student.name}">${student.name}</span>
                    <span class="score" aria-label="Score: ${student.score}">${student.score}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('leaderboard').innerHTML = html;
}

function getMedalClass(rank) {
    switch(rank) {
        case 1: return 'gold';
        case 2: return 'silver';
        case 3: return 'bronze';
        default: return '';
    }
}

// Load ranking when page loads
document.addEventListener('DOMContentLoaded', loadRanking);

// Add error boundary
window.addEventListener('error', (event) => {
    document.getElementById('leaderboard').innerHTML = `
        <div class="error" role="alert">
            <p>An unexpected error occurred. Please try refreshing the page.</p>
        </div>
    `;
});
const { API_KEY } = process.env;

// In-memory storage for demo purposes
// In production, use a proper database
let rankings = {};

exports.handler = async (event, context) => {
  const path = event.path.replace('/.netlify/functions/api/', '');
  const rankingId = path.split('/').pop();

  try {
    switch (event.httpMethod) {
      case 'GET':
        if (path.startsWith('ranking/')) {
          if (!rankings[rankingId]) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Ranking not found' })
            };
          }
          return {
            statusCode: 200,
            body: JSON.stringify(rankings[rankingId])
          };
        }
        break;

      case 'POST':
        if (path === 'edit_ranking') {
          const providedApiKey = event.headers['x-api-key'];
          if (!providedApiKey || providedApiKey !== API_KEY) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Page not found' })
            };
          }

          const { ranking_id, students } = JSON.parse(event.body);
          if (!ranking_id || !students || !Array.isArray(students)) {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'Invalid input' })
            };
          }

          rankings[ranking_id] = {
            id: ranking_id,
            students: students.map((student, index) => ({
              ...student,
              rank: index + 1
            })),
            updatedAt: new Date().toISOString()
          };

          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              ranking: rankings[ranking_id]
            })
          };
        }
        break;
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
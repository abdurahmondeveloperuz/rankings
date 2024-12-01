export const API_KEY = '55c9d9ca-a9e4-45bf-8d82-f4501875745b';

export function validateApiKey(req, res, next) {
    const providedApiKey = req.headers['x-api-key'];
    
    if (!providedApiKey || providedApiKey !== API_KEY) {
        return res.status(404).json({ error: 'Page not found' });
    }
    
    next();
}
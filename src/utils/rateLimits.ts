import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

export default { globalLimiter };
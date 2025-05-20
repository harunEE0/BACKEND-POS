const fetch = require('node-fetch');

const u = 'http://localhost:5000/api/v1/auth/me';

// Create mock req and res objects
const mockReq = {
    cookies: {
        token: 'your-actual-token-here' // Replace with a real token
    }
};

const get = async (req) => {
    try {
        const got = await fetch(u, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.cookies.token}`  
            }
        });

        const data = await got.json();
        console.log("DATA:", data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

// Call with mock request object
get(mockReq).then(console.log).catch(console.error);
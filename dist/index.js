import { solveQuestionHandler } from './handlers/solveQuestion.js';
import { listQuestionsHandler } from './handlers/listQuestions.js';
import { generateQuestionHandler } from './handlers/generateQuestion.js';
import { createServer } from 'http';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables
const PORT = 3000; // Define the port for your local server
// Create a basic HTTP server
createServer(async (req, res) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const method = req.method || '';
    // Handle /solve-question endpoint
    if (url.pathname === '/solve-question' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', async () => {
            try {
                const response = await solveQuestionHandler(JSON.parse(body));
                res.writeHead(response.status, { 'Content-Type': 'application/json' });
                res.end(await response.text());
            }
            catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                res.end(JSON.stringify({ error: errorMessage }));
            }
        });
    }
    // Handle /list-questions endpoint
    else if (url.pathname === '/list-questions' && method === 'GET') {
        try {
            const response = listQuestionsHandler();
            res.writeHead(response.status, { 'Content-Type': 'application/json' });
            res.end(await response.text());
        }
        catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.end(JSON.stringify({ error: errorMessage }));
        }
    }
    // Handle /generate-question endpoint
    else if (url.pathname === '/generate-question' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', async () => {
            try {
                const response = await generateQuestionHandler(JSON.parse(body));
                res.writeHead(response.status, { 'Content-Type': 'application/json' });
                res.end(await response.text());
            }
            catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                res.end(JSON.stringify({ error: errorMessage }));
            }
        });
    }
    // Handle unknown routes
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}).listen(PORT, () => {
    console.log(`Server is running locally on http://localhost:${PORT}`);
});

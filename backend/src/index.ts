// backend/src/index.ts

import { solveQuestionHandler } from './handlers/solveQuestion.js';
import { listQuestionsHandler } from './handlers/listQuestions.js';
import { generateQuestionHandler } from './handlers/generateQuestion.js';
import { createServer } from 'http';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

const PORT = 3001; // Define the port for your local server

const corsOptions = {
  origin: 'http://localhost:3000', // React frontend running on this origin
  methods: ['GET', 'POST'], // Allowed HTTP methods
};

const app = express();
app.use(cors());
app.use(express.json());

// Create a basic HTTP server
createServer(async (req, res) => {
  const corsHandler = cors(corsOptions);
  corsHandler(req, res, async () => {
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
        } catch (error) {
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
      } catch (error) {
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
        } catch (error) {
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
  });
}).listen(PORT, () => {
  console.log(`Server is running locally on http://localhost:${PORT}`);
});

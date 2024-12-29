// src/handlers/listQuestions.ts
import { listQuestions } from '../storage/questionStore.js';
export function listQuestionsHandler() {
    // Retrieve all questions from JSON storage
    const questions = listQuestions();
    // Transform questions into a structured response
    const structuredQuestions = Object.values(questions).map(question => ({
        id: question.id, // Include the question ID
        topic: question.topic, // Include the question topic
        type: question.source, // Include the question source type
        difficulty: question.difficulty, // Include the question difficulty level
        preview: question.qtext.slice(0, 50) // Include the first 50 characters of the question text as a preview
    }));
    // Return the structured response
    return new Response(JSON.stringify(structuredQuestions), { status: 200 });
}

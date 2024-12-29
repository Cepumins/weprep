// src/storage/questionStore.ts
import fs from 'fs';
// File path for JSON storage
const QUESTIONS_FILE = './src/storage/questions.json';
// Ensure the questions.json file exists
function initializeStorage() {
    if (!fs.existsSync(QUESTIONS_FILE)) {
        fs.writeFileSync(QUESTIONS_FILE, JSON.stringify({}));
        console.log('Initialized questions.json file.');
    }
}
// Load questions from the JSON file
function loadQuestions() {
    initializeStorage();
    const fileContent = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
    return JSON.parse(fileContent);
}
// Save questions to the JSON file
function saveQuestions(questions) {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
    console.log('Questions saved to questions.json file.');
}
// In-memory JSON storage for questions
const questionStore = loadQuestions();
// Function to add a question to JSON storage
export function addQuestionToJson(question) {
    const { id } = question;
    if (questionStore[id]) {
        console.error(`Question with id ${id} already exists in storage.`);
        throw new Error(`Duplicate question id: ${id}`);
    }
    questionStore[id] = question;
    saveQuestions(questionStore);
    console.log(`Question with id ${id} successfully added to JSON storage.`);
}
// Function to get a question by id from JSON storage
export function getQuestionById(id) {
    return questionStore[id];
}
// Function to list all questions with their details
export function listQuestions() {
    return questionStore;
}
// Function to generate question IDs (for demonstration)
export function generateQuestionId(type, topic, difficulty, index) {
    return parseInt(`${type[0].charCodeAt(0)}${topic[0].charCodeAt(0)}${difficulty.charCodeAt(0)}${index}`);
}

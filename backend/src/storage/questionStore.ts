// backend/src/storage/questionStore.ts

import fs from 'fs';

// Define types for question structure
export type Topic = 'quant' | 'data' | 'language' | 'unknown';
export type Source = 'generated' | 'submitted';
export type Difficulty = 'e' | 'm' | 'h';

export interface Question {
  id: number;
  source: Source;
  topic: Topic;
  difficulty: Difficulty;
  qtext: string;
  hints: [string, string, string];
  calcs: [string, string, string]; // New property for hint calculations
  answers: [string, string, string, string, string];
}

// File path for JSON storage
const QUESTIONS_FILE = './src/storage/questions.json';

// Ensure the questions.json file exists
function initializeStorage(): void {
  if (!fs.existsSync(QUESTIONS_FILE)) {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify({}));
    console.log('Initialized questions.json file.');
  }
}

// Load questions from the JSON file
function loadQuestions(): Record<number, Question> {
  initializeStorage();
  const fileContent = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
  return JSON.parse(fileContent);
}

// Function to generate the next available question ID
function generateNextQuestionId(): number {
  const ids = Object.keys(questionStore).map(Number).sort((a, b) => a - b); // Get all existing IDs and sort them in ascending order
  let newId = 1; // Start checking from the smallest possible ID (1)

  for (const id of ids) {
    if (id !== newId) {
      // If there's a gap in the sequence, return the missing ID
      return newId;
    }
    newId += 1; // Increment to check the next possible ID
  }

  // If no gaps are found, return the next ID after the largest existing one
  return newId;
}

// Save questions to the JSON file
function saveQuestions(questions: Record<number, Question>): void {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
  console.log('Questions saved to questions.json file.');
}

// In-memory JSON storage for questions
const questionStore: Record<number, Question> = loadQuestions();

// Function to add a question to JSON storage
export function addQuestionToJson(question: Omit<Question, 'id'> | Partial<Question>): void {
  // Check if `id` exists on `question` and is a number
  // Safely access the `id` property using type narrowing
  const id =
    'id' in question && typeof question.id === 'number'
      ? question.id
      : generateNextQuestionId();

  if (questionStore[id]) {
    console.error(`Question with id ${id} already exists in storage.`);
    throw new Error(`Duplicate question id: ${id}`);
  }

  // Construct the complete question object
  const newQuestion: Question = {
    id,
    source: question.source === 'generated' || question.source === 'submitted' ? question.source : 'submitted', // Explicitly validate the source
    topic: question.topic || 'unknown', // Default to 'unknown' if topic is missing
    difficulty: question.difficulty || 'm', // Default to 'm' if difficulty is missing
    qtext: question.qtext || '', // Default to an empty string if qtext is missing
    hints: question.hints || ['', '', ''], // Default to empty hints
    calcs: question.calcs || ['', '', ''], // Default to empty calculations
    answers: question.answers || ['', '', '', '', ''], // Default to empty answers
  };

  questionStore[id] = newQuestion; // Add the question to in-memory storage
  saveQuestions(questionStore);
  console.log(`Question with id ${id} successfully added to JSON storage.`);
}

// Function to get a question by id from JSON storage
export function getQuestionById(id: number): Question | undefined {
  return questionStore[id];
}

// Function to list all questions with their details
export function listQuestions(): Record<number, Question> {
  return questionStore;
}

// Function to generate question IDs (for demonstration)
export function generateQuestionId(type: Source, topic: Topic, difficulty: Difficulty, index: number): number {
  return parseInt(`${type[0].charCodeAt(0)}${topic[0].charCodeAt(0)}${difficulty.charCodeAt(0)}${index}`);
}

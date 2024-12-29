// backend/src/handlers/generateQuestion.ts

import { addQuestionToJson, generateQuestionId } from '../storage/questionStore.js';
import { Env, OpenAIResponse } from '../types/env';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

export async function generateQuestionHandler(body: any): Promise<Response> {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in the environment.');
  }
  
  if (!body.content) {
    return new Response(JSON.stringify({ error: 'Question content is required.' }), { status: 400 });
  }

  try {
    const topic: 'quant' | 'data' | 'language' = 'quant'; // 'quant', 'data', or 'language'
    const difficulty: 'e' | 'm' | 'h' = 'm'; // 'e', 'm', or 'h'
    const source: 'generated' = 'generated';

    // body.content [Describe the core mathematical or logical concept here, e.g., "percentage calculations", "logical reasoning with data interpretation"]

    const combinedPrompt = `
      Given the following parameters, generate a new question that maintains the same core mathematical or logical concept as the original but uses a different context, structure, and numbers. Ensure the new question has the same difficulty level and falls within the specified topic classification ('quant', 'data', or 'language').

      **Parameters:**
        Topic: '${topic}'
        Difficulty: '${difficulty}'
        Original Question Concept: '${body.content}'

      **Requirements for New Question Generation:**
      1. Create a new question that:
        Maintains the same type of mathematical calculation or logical reasoning as the original.
        Uses a different, realistic context or scenario to avoid duplication.
        Retains the same complexity level as specified by the difficulty.
      2. Problem Breakdown:
        Decompose the new question into three distinct parts to guide the solution process.
      3. Hint and Answer Generation:
        Provide three hints to help the user solve the problem:
          Hint 1: A conceptual guide and step-by-step assistance for the first part of the problem.
          Hint 2: Builds on the first hint, guiding through an intermediate step.
          Hint 3: Guides the final step required to solve the question.
        Generate five answer choices:
          One correct answer, formatted precisely and symbolically if needed (e.g., \\( 1 - (0.95)^{12} \\)).
          Four incorrect answers (distractors) that reflect common logical traps or errors, formatted similarly to the correct answer (e.g., symbolic form, similar structure):
            Example distractors should include errors such as:
              Misinterpreting the probability to calculate (e.g., probability of all remaining operational instead of failure).
              Neglecting necessary steps (e.g., using \\( 0.95 \\) instead of raising it to the power).
              Forgetting to complement probabilities (e.g., calculating \\( 1 - 0.95 \\) instead of \\( 1 - (0.95)^{12} \\)).
            The distractors should appear logical but incorrect, mirroring common mistakes in reasoning.

      **Important Instructions for Calculations and Answers**:
        For complex mathematical operations such as high-power calculations, large factorials, or intricate probabilities, present the answer in unsolved or symbolic form (e.g., \`1 - (0.92)^8\`) rather than attempting exact decimal values.
        Simple arithmetic calculations (e.g., addition, subtraction, multiplication, division with small numbers) should be performed and displayed in simplified form.
        Ensure that any symbolic answers and calculations are presented clearly and accurately, aligned with proper mathematical notation, and logically sound.

      **Output Format**:
        New Question:
          [Insert newly generated question text]
        Problem Breakdown:
          Part 1: [Insert description]
          Part 2: [Insert description]
          Part 3: [Insert description]
        Hints:
          Hint 1:
            Conceptual Guide: [Insert hint]
            Calculation (if applicable): [Insert calculation]
          Hint 2:
            Conceptual Guide: [Insert hint]
            Calculation (if applicable): [Insert calculation]
          Hint 3:
            Conceptual Guide: [Insert hint]
            Calculation (if applicable): [Insert calculation]
        Answer Choices:
          ans0 (Correct): [Insert correct answer]
          ans1: [Insert distractor reflecting a common error, formatted similarly]
          ans2: [Insert distractor reflecting a different common error, formatted similarly]
          ans3: [Insert distractor reflecting another logical trap, formatted similarly]
          ans4: [Insert distractor reflecting another common error, formatted similarly]
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, // Use environment variable
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        //messages: [{ role: 'user', content: body.content }],
        messages: [{ role: 'user', content: combinedPrompt }],
        temperature: 0.4 // Reduced temperature for more precise answers
      }),
    });

    console.log('Received response from OpenAI API:', response.status); // Debug log for response status
    
    //const data = await response.json();
    const data: OpenAIResponse = await response.json() as OpenAIResponse;

    console.log("Response: ", data);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'OpenAI API error', details: data }), { status: 500 });
    }

    // Extract the newly generated question text
    const qtextMatch = data.choices[0].message?.content?.match(/New Question:\s*([\s\S]*?)\n\s*Problem Breakdown:/);
    const qtext = qtextMatch ? qtextMatch[1].trim() : '';

    console.log("Qtext: ", qtext);

    const hints: [string, string, string] = [
      data.choices[0].message?.content?.match(/Hint 1:\s*Conceptual Guide:\s*([\s\S]*?)\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Hint 2:/)?.[1]?.trim() || '',
      data.choices[0].message?.content?.match(/Hint 2:\s*Conceptual Guide:\s*([\s\S]*?)\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Hint 3:/)?.[1]?.trim() || '',
      data.choices[0].message?.content?.match(/Hint 3:\s*Conceptual Guide:\s*([\s\S]*?)\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Answer Choices:/)?.[1]?.trim() || ''
    ];

    console.log("Hints: ", hints);

    const calcs: [string, string, string] = [
      data.choices[0].message?.content?.match(/Hint 1:\s*Conceptual Guide:\s*[\s\S]*?\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Hint 2:/)?.[1]?.trim() || '',
      data.choices[0].message?.content?.match(/Hint 2:\s*Conceptual Guide:\s*[\s\S]*?\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Hint 3:/)?.[1]?.trim() || '',
      data.choices[0].message?.content?.match(/Hint 3:\s*Conceptual Guide:\s*[\s\S]*?\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Answer Choices:/)?.[1]?.trim() || ''
    ];

    console.log("Calcs: ", calcs);

    const answers: [string, string, string, string, string] = [
      data.choices[0].message?.content?.match(/ans0 \(Correct\): (.+)/)?.[1]?.trim() || '',
      data.choices[0].message?.content?.match(/ans1: (.+)/)?.[1]?.trim() || '',
      data.choices[0].message?.content?.match(/ans2: (.+)/)?.[1]?.trim() || '',
      data.choices[0].message?.content?.match(/ans3: (.+)/)?.[1]?.trim() || '',
      data.choices[0].message?.content?.match(/ans4: (.+)/)?.[1]?.trim() || ''
    ];

    console.log("Answers: ", answers);

    const questionData = {
      id: Math.floor(Math.random() * 1000), // Example ID generation
      source,
      topic,
      difficulty,
      qtext,
      hints,
      calcs,
      answers
    };

    console.log("questionData: ", questionData);

    //console.log('Question added to D1 database'); // Debug log for successful database addition

    //await addQuestionToD1(questionData, env.QDB);
    addQuestionToJson(questionData);

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: error }), { status: 500 });
  }
}

// src/handlers/solveQuestion.ts
import { addQuestionToJson } from '../storage/questionStore.js';
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;
export async function solveQuestionHandler(body) {
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set in the environment.');
    }
    if (!body.content) {
        return new Response(JSON.stringify({ error: 'Question content is required.' }), { status: 400 });
    }
    try {
        //console.log('Classifying and generating hints/answers for the question'); // Debug log for request
        const combinedPrompt = `
    Given the following question text, perform the following tasks:
    
    ### 1. Classification:
    Classify the question into one of three categories:
      - **'quant'**: Involves mathematical or quantitative reasoning, calculations, numeric relationships, or equations.
      - **'data'**: Focuses on analysis or interpretation of given data, tables, or logical puzzles involving specific information.
      - **'language'**: Pertains to reading comprehension, grammar, language usage, reasoning with passages, or critical analysis of written content.
    
    ### 2. Problem Breakdown:
    Decompose the problem into three sequential parts:
      - **Part 1**: Identify the first step needed to approach the problem.
      - **Part 2**: Build upon Part 1 to progress toward the solution.
      - **Part 3**: Finalize the solution, ensuring it logically follows from Part 2.
    
    ### 3. Hint and Answer Generation:
    - **Hints**: For each part identified in the breakdown, provide:
      - A conceptual guide to help the reader understand the logic.
      - A step-by-step calculation (if applicable).
    - **Answer Choices**: Create one correct answer and four distractors. Distractors should reflect common errors or misunderstandings.
    
    ### 4. Output Format:
    Your response must follow this exact format:
    \`\`\`
    Classification: [Insert classification]
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
      ans1: [Insert distractor]
      ans2: [Insert distractor]
      ans3: [Insert distractor]
      ans4: [Insert distractor]
    \`\`\`
    
    ### Question Text:
    \`\`\`
    ${body.content}
    \`\`\`
    `;
        //console.log('Making request to OpenAI API'); // Debug log before calling OpenAI API
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
                temperature: 0.2 // Reduced temperature for more precise answers
            }),
        });
        console.log('Received response from OpenAI API:', response.status); // Debug log for response status
        //const data = await response.json();
        const data = await response.json();
        if (!response.ok) {
            console.error('OpenAI API error:', data); // Debug log for API error
            return new Response(JSON.stringify({ error: 'OpenAI API error', details: data }), { status: 500 });
        }
        // Extract classification, hints, and answers from the response (assuming the response structure is provided correctly)
        const classificationMatch = data.choices[0]?.message?.content?.match(/Classification: (quant|data|language)/i);
        const topic = classificationMatch ? classificationMatch[1].toLowerCase() : 'unknown';
        //const topic: Topic = 'quant';
        const difficulty = 'm';
        const type = 'submitted';
        // Extract hints and calculations
        const hints = [
            data.choices[0].message?.content?.match(/Hint 1:\s*Conceptual Guide:\s*([\s\S]*?)\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Hint 2:/)?.[1]?.trim() || '',
            data.choices[0].message?.content?.match(/Hint 2:\s*Conceptual Guide:\s*([\s\S]*?)\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Hint 3:/)?.[1]?.trim() || '',
            data.choices[0].message?.content?.match(/Hint 3:\s*Conceptual Guide:\s*([\s\S]*?)\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Answer Choices:/)?.[1]?.trim() || ''
        ];
        const calcs = [
            data.choices[0].message?.content?.match(/Hint 1:\s*Conceptual Guide:\s*[\s\S]*?\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Hint 2:/)?.[1]?.trim() || '',
            data.choices[0].message?.content?.match(/Hint 2:\s*Conceptual Guide:\s*[\s\S]*?\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Hint 3:/)?.[1]?.trim() || '',
            data.choices[0].message?.content?.match(/Hint 3:\s*Conceptual Guide:\s*[\s\S]*?\n\s*Calculation \(if applicable\):\s*([\s\S]*?)\n\s*Answer Choices:/)?.[1]?.trim() || ''
        ];
        // Extract answers
        const answers = [
            data.choices[0].message?.content?.match(/ans0 \(Correct\): (.+)/)?.[1]?.trim() || '',
            data.choices[0].message?.content?.match(/ans1: (.+)/)?.[1]?.trim() || '',
            data.choices[0].message?.content?.match(/ans2: (.+)/)?.[1]?.trim() || '',
            data.choices[0].message?.content?.match(/ans3: (.+)/)?.[1]?.trim() || '',
            data.choices[0].message?.content?.match(/ans4: (.+)/)?.[1]?.trim() || ''
        ];
        // Construct the question data
        const questionData = {
            id: Math.floor(Math.random() * 1000), // Generate a unique ID
            source: 'submitted', // Indicate the source as 'submitted'
            topic, // Use the extracted topic classification
            difficulty: 'm', // Set the difficulty level
            qtext: body.content, // Use the input question content
            hints, // Include extracted hints
            calcs, // Include extracted calculations
            answers // Include extracted answers
        };
        // Add the question to JSON storage
        addQuestionToJson(questionData);
        return new Response(JSON.stringify(data), { status: 200 });
    }
    catch (error) {
        console.error('Error in solveQuestionHandler:', error); // Improved error logging
        return new Response(JSON.stringify({ error: 'Internal server error', details: error }), { status: 500 });
    }
}

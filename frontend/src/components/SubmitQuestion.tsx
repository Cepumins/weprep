// frontend/src/components/SubmitQuestion.tsx

import React, { useState } from 'react';
import axios from 'axios';

const backendPort = 3001;

// Pricing for models in USD per 1M tokens
const PRICING = {
  'gpt-4o-mini': {
    input: 0.15, // $0.150 per 1M input tokens
    output: 0.6, // $0.600 per 1M output tokens
  },
  'gpt-4o': {
    input: 2.5, // $2.50 per 1M input tokens
    output: 10.0, // $10.00 per 1M output tokens
  },
};

const SubmitQuestion: React.FC = () => {
  const [content, setContent] = useState('');
  const [response, setResponse] = useState<any | null>(null);
  const [fullDetails, setFullDetails] = useState<object | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [costDetails, setCostDetails] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:${backendPort}/solve-question`, { content });

      // Parse and store the response
      const extractedContent = res.data?.choices?.[0]?.message?.content || '';
      const responseData = parseResponse(extractedContent);
      setResponse(responseData);

      setFullDetails(res.data);

      // Calculate cost
      const model = res.data?.model || '';
      const promptTokens = res.data?.usage?.prompt_tokens || 0;
      const completionTokens = res.data?.usage?.completion_tokens || 0;

      let costInput = 0;
      let costOutput = 0;
      if (model.includes('gpt-4o-mini')) {
        costInput = (promptTokens / 1_000_000) * PRICING['gpt-4o-mini'].input;
        costOutput = (completionTokens / 1_000_000) * PRICING['gpt-4o-mini'].output;
      } else if (model.includes('gpt-4o')) {
        costInput = (promptTokens / 1_000_000) * PRICING['gpt-4o'].input;
        costOutput = (completionTokens / 1_000_000) * PRICING['gpt-4o'].output;
      }

      const totalCost = costInput + costOutput;

      setCostDetails(
        `Model: ${model}
        Input Tokens: ${promptTokens}
        Output Tokens: ${completionTokens}
        Cost (Input): $${costInput.toFixed(6)}
        Cost (Output): $${costOutput.toFixed(6)}
        Total Cost: $${totalCost.toFixed(6)}`
      );
    } catch (error) {
      console.error(error);
      setResponse(null);
      setFullDetails(null);
      setCostDetails(null);
    }
  };

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  const toggleHints = () => {
    setShowHints((prev) => !prev);
  };

  const parseResponse = (rawContent: string) => {
    const lines = rawContent.split('\n');
    const classification = lines.find(line => line.startsWith('Classification: '))?.replace('Classification: ', '').trim();

    const hintSectionStart = lines.indexOf('Hints:');
    const answerSectionStart = lines.indexOf('Answer Choices:');

    const hints = lines.slice(hintSectionStart + 1, answerSectionStart).join('\n');

    const answersOld = lines.slice(answerSectionStart + 1).join('\n');

    const answers = [
      rawContent.match(/ans0 \(Correct\): (.+)/)?.[1]?.trim() || '',
      rawContent.match(/ans1: (.+)/)?.[1]?.trim() || '',
      rawContent.match(/ans2: (.+)/)?.[1]?.trim() || '',
      rawContent.match(/ans3: (.+)/)?.[1]?.trim() || '',
      rawContent.match(/ans4: (.+)/)?.[1]?.trim() || '',
    ].map((answer, index) => ({
      choice: String.fromCharCode(97 + index), // Convert 0 to 'a', 1 to 'b', etc.
      text: answer,
    }));

    return {
      classification,
      hints,
      answersOld,
      answers,
    };
  };

  return (
    <div>
      <h2>Submit a Question</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your question here..."
        />
        <button type="submit">Submit</button>
      </form>

      {response && (
        <div>
          <h3>Classification: {response.classification}</h3>

          <h4>Question</h4>
          <p>{content}</p>

          <h4>Hints</h4>
          <button onClick={toggleHints}>{showHints ? 'Hide Hints' : 'Show Hints'}</button>
          {showHints && <pre style={{ whiteSpace: 'pre-wrap' }}>{response.hints}</pre>}

          <h4>Answer Choices (old)</h4>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{response.answersOld}</pre>

          <h4>Answer Choices</h4>
          <ul>
            {response.answers.map(answer => (
              <li key={answer.choice}>{answer.choice}: {answer.text}</li>
            ))}
          </ul>
        </div>
      )}

      {fullDetails && (
        <div>
          <button onClick={toggleDetails}>
            {showDetails ? 'Hide Prompt Details' : 'Show Prompt Details'}
          </button>
          {showDetails && (
            <div style={{ marginTop: '10px', backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
              <h4>Prompt Details</h4>
              <pre>{JSON.stringify(fullDetails, null, 2)}</pre>
              {costDetails && (
                <>
                  <h4>Cost Details</h4>
                  <pre>{costDetails}</pre>
                </>
              )}
              <h4>Full Response (Raw)</h4>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{fullDetails?.choices?.[0]?.message?.content || 'No content available'}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubmitQuestion;

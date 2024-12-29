// frontend/src/components/ListQuestions.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const backendPort = 3001;

const ListQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`http://localhost:${backendPort}/list-questions`);
        console.log('Fetched questions:', res.data); // Debug log
        setQuestions(res.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div>
      <h2>All Questions</h2>
      <ul>
        {questions.map((question) => (
          <li key={question.id}>
            <strong>ID:</strong> {question.id} - <strong>Preview:</strong>{' '}
            {question.preview || 'No preview available'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListQuestions;

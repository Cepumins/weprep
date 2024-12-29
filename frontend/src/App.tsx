// frontend/src/App.tsx

import React from 'react';
import SubmitQuestion from './components/SubmitQuestion.tsx';
import ListQuestions from './components/ListQuestions.tsx';

const App: React.FC = () => {
  return (
    <div>
      <h1>Question Solver</h1>
      <SubmitQuestion />
      <ListQuestions />
    </div>
  );
};

export default App;

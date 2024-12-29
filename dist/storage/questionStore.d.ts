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
    calcs: [string, string, string];
    answers: [string, string, string, string, string];
}
export declare function addQuestionToJson(question: Question): void;
export declare function getQuestionById(id: number): Question | undefined;
export declare function listQuestions(): Record<number, Question>;
export declare function generateQuestionId(type: Source, topic: Topic, difficulty: Difficulty, index: number): number;

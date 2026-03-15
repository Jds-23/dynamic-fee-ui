export const OSCAR_QUESTIONS: string[] = [
  "Will One Battle After Another win Best Picture at the 98th Academy Awards?",
  "Will Hamnet win Best Picture at the 98th Academy Awards?",
  "Will Sinners win Best Picture at the 98th Academy Awards?",
  "Will Sentimental Value win Best Picture at the 98th Academy Awards?",
  "Will Marty Supreme win Best Picture at the 98th Academy Awards?",
  "Will Bugonia win Best Picture at the 98th Academy Awards?",
  "Will Frankenstein win Best Picture at the 98th Academy Awards?",
  "Will F1 win Best Picture at the 98th Academy Awards?",
  "Will The Secret Agent win Best Picture at the 98th Academy Awards?",
  "Will Train Dreams win Best Picture at the 98th Academy Awards?",
  "Will Leonardo DiCaprio win Best Actor at the 98th Academy Awards?",
  "Will Timothée Chalamet win Best Actor at the 98th Academy Awards?",
  "Will Michael B. Jordan win Best Actor at the 98th Academy Awards?",
  "Will Wagner Moura win Best Actor at the 98th Academy Awards?",
  "Will Ethan Hawke win Best Actor at the 98th Academy Awards?",
  "Will Sean Penn win Best Supporting Actor at the 98th Academy Awards?",
  "Will Stellan Skarsgård win Best Supporting Actor at the 98th Academy Awards?",
  "Will Delroy Lindo win Best Supporting Actor at the 98th Academy Awards?",
  "Will Jacob Elordi win Best Supporting Actor at the 98th Academy Awards?",
  "Will Benicio Del Toro win Best Supporting Actor at the 98th Academy Awards?",
  "Will Jessie Buckley win Best Actress at the 98th Academy Awards?",
  "Will Renate Reinsve win Best Actress at the 98th Academy Awards?",
  "Will Rose Byrne win Best Actress at the 98th Academy Awards?",
  "Will Emma Stone win Best Actress at the 98th Academy Awards?",
  "Will Kate Hudson win Best Actress at the 98th Academy Awards?",
];

export function getRandomQuestion(): string {
  return OSCAR_QUESTIONS[Math.floor(Math.random() * OSCAR_QUESTIONS.length)];
}

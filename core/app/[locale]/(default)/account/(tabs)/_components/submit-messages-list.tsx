export const SubmitMessagesList = ({ messages }: { messages: string[] }) => (
  <ul className={messages.length === 1 ? 'list-none' : 'ms-2 list-disc'}>
    {messages.map((message) => (
      <li key={message}>{message}</li>
    ))}
  </ul>
);

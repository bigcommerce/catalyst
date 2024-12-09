export const SubmitErrorsList = ({ errors }: { errors: string[] }) => (
  <ul className={errors.length === 1 ? 'list-none' : 'ms-2 list-disc'}>
    {errors.map((error) => (
      <li key={error}>{error}</li>
    ))}
  </ul>
);

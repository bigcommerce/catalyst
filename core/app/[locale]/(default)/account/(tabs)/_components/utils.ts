interface GenericError {
  [p: string]: string | string[];
  message: string;
}

export const createErrorsList = (submitErrors: GenericError[]) =>
  submitErrors
    .map((error) => {
      if (submitErrors.length > 1) {
        return `\u2022 ${error.message}`;
      }

      return error.message;
    })
    .join('\n');

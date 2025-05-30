export class WishlistMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WishlistError';
  }
}

import { authenticatedAuthor } from '../domain/validation';
export default (context: { state: { user?: { id: number } } }) => {
  authenticatedAuthor(context.state.user);
  return true;
};

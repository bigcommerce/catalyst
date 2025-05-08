import { type SubmissionResult } from '@conform-to/react';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type ForgotPasswordAction = Action<
  { lastResult: SubmissionResult | null; successMessage?: string },
  FormData
>;

export interface ForgotPasswordData {
  action: ForgotPasswordAction;
}

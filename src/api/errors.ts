import axios from 'axios';
import type { ProblemDetails } from '../types/api';

export interface ApiError {
  /** HTTP status, or 0 when the server could not be reached. */
  status: number;
  /** A message that is ready to show to the user, in Hebrew. */
  message: string;
  correlationId?: string;
  /** Field name (camelCase) -> first validation message, for 400 responses. */
  fieldErrors: Record<string, string>;
}

const hasHebrew = (text: string) => /[֐-׿]/.test(text);

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'הפרטים שהוזנו אינם תקינים. אנא בדקי אותם ונסי שוב.',
  401: 'ההתחברות פגה או שאינה תקינה. אנא התחברי מחדש.',
  403: 'אין לך הרשאה לבצע פעולה זו.',
  404: 'הפריט המבוקש לא נמצא.',
  409: 'הפעולה מתנגשת עם המצב הנוכחי. אנא רענני ונסי שוב.',
};

const NETWORK_MESSAGE = 'לא ניתן להתחבר לשרת. ודאי שהשרת פועל ושהכתובת שלו נכונה.';
const SERVER_MESSAGE = 'אירעה שגיאה בשרת. אנא נסי שוב בעוד רגע.';

function toCamelCase(name: string): string {
  return name.length ? name.charAt(0).toLowerCase() + name.slice(1) : name;
}

/** Turns any thrown value (usually an AxiosError) into one predictable shape for the UI. */
export function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return { status: 0, message: 'אירעה שגיאה לא צפויה.', fieldErrors: {} };
  }
  if (!error.response) {
    return { status: 0, message: NETWORK_MESSAGE, fieldErrors: {} };
  }

  const status = error.response.status;
  const problem = (error.response.data ?? {}) as Partial<ProblemDetails>;

  const fieldErrors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(problem.errors ?? {})) {
    if (messages.length) fieldErrors[toCamelCase(field)] = messages[0];
  }

  let message: string;
  if (status >= 500) {
    message = SERVER_MESSAGE;
  } else if (status === 409 && problem.detail && hasHebrew(problem.detail)) {
    // The seat-conflict message is written in Hebrew by the server for exactly this purpose.
    message = problem.detail;
  } else {
    message = DEFAULT_MESSAGES[status] ?? 'אירעה שגיאה. אנא נסי שוב.';
  }

  return { status, message, correlationId: problem.correlationId, fieldErrors };
}

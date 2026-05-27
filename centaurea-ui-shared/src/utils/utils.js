export const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

export const toLocalDateTimeInputValue = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export const getNowLocalInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export const isFutureDateValue = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
};

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred.';

export function createApiError(status, data, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  const message = extractApiErrorMessage(data, fallbackMessage);
  const error = new Error(message);
  error.status = status;
  error.data = data;
  return error;
}

export function toUiError(error, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  if (typeof error === 'string' && error.trim()) {
    return { message: error, status: undefined, details: undefined, type: 'unknown' };
  }

  if (error instanceof Error) {
    const status = typeof error.status === 'number' ? error.status : undefined;
    const type = classifyErrorType(status, error.data);
    const isNetworkError = status === undefined && /failed to fetch|networkerror|load failed|fetch failed/i.test(error.message || '');
    const message = isNetworkError
      ? `${fallbackMessage}. Unable to reach the server.`
      : (error.message || fallbackMessage);

    return {
      message,
      status,
      details: error.data,
      type,
    };
  }

  return {
    message: fallbackMessage,
    status: undefined,
    details: undefined,
    type: 'unknown',
  };
}

export function extractApiErrorMessage(data, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  if (!data || typeof data !== 'object') {
    return fallbackMessage;
  }

  if (data.title && data.errors) {
    const messages = Object.entries(data.errors).flatMap(([field, value]) => (
      Array.isArray(value) ? value.map((message) => `${field}: ${message}`) : []
    ));

    if (messages.length > 0) {
      return `${data.title}\n${messages.join('\n')}`;
    }

    return data.title;
  }

  if (typeof data.error === 'string' && data.error.trim()) return data.error;
  if (typeof data.title === 'string' && data.title.trim()) return data.title;
  if (typeof data.message === 'string' && data.message.trim()) return data.message;

  return fallbackMessage;
}

function classifyErrorType(status, details) {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';

  if (status === 422 || details?.errors) {
    return 'validation';
  }

  if (status >= 500) {
    return 'server';
  }

  return 'unknown';
}

export const isValidRegexp = (pattern) => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

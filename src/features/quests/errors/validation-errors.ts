/**
 * Standardized error handling for quest validation
 */

/**
 * Custom error class for quest validation failures
 */
export class QuestValidationError extends Error {
  public readonly errors: ValidationFieldError[];
  public readonly type = 'QUEST_VALIDATION_ERROR';

  constructor(
    message: string,
    errors: ValidationFieldError[],
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'QuestValidationError';
    this.errors = errors;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QuestValidationError);
    }
  }

  /**
   * Get errors for a specific field
   */
  getFieldErrors(field: string): ValidationFieldError[] {
    return this.errors.filter((error) => error.field === field);
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ValidationErrorType): ValidationFieldError[] {
    return this.errors.filter((error) => error.type === type);
  }

  /**
   * Check if error exists for specific field
   */
  hasFieldError(field: string): boolean {
    return this.errors.some((error) => error.field === field);
  }

  /**
   * Get human-readable error summary
   */
  getSummary(): string {
    const requiredErrors = this.getErrorsByType('required');
    const invalidErrors = this.getErrorsByType('invalid');
    const dependencyErrors = this.getErrorsByType('dependency');

    let summary = '';
    if (requiredErrors.length > 0) {
      summary += `Missing ${requiredErrors.length} required field(s). `;
    }
    if (invalidErrors.length > 0) {
      summary += `${invalidErrors.length} field(s) have invalid values. `;
    }
    if (dependencyErrors.length > 0) {
      summary += `${dependencyErrors.length} dependency issue(s). `;
    }

    return summary.trim();
  }

  /**
   * Convert to JSON for logging/debugging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      errors: this.errors,
      summary: this.getSummary(),
      context: this.context,
    };
  }
}

/**
 * Field-specific validation error
 */
export interface ValidationFieldError {
  field: string;
  message: string;
  type: ValidationErrorType;
  code?: string;
  context?: Record<string, unknown>;
}

/**
 * Types of validation errors
 */
export type ValidationErrorType = 'required' | 'invalid' | 'dependency' | 'constraint';

/**
 * Error handler for quest operations
 */
export class QuestErrorHandler {
  /**
   * Handle validation errors with user-friendly messages
   */
  static handleValidationError(error: QuestValidationError): {
    title: string;
    message: string;
    details: string[];
    actions: string[];
  } {
    const requiredErrors = error.getErrorsByType('required');
    const invalidErrors = error.getErrorsByType('invalid');
    const dependencyErrors = error.getErrorsByType('dependency');

    let title = 'Quest Validation Failed';
    let message = error.getSummary();
    const details: string[] = [];
    const actions: string[] = [];

    // Handle required field errors
    if (requiredErrors.length > 0) {
      details.push('Required fields:');
      requiredErrors.forEach((err) => {
        details.push(`• ${err.message}`);
      });
      actions.push('Fill in all required fields');
    }

    // Handle invalid value errors
    if (invalidErrors.length > 0) {
      details.push('Invalid values:');
      invalidErrors.forEach((err) => {
        details.push(`• ${err.message}`);
      });
      actions.push('Correct invalid field values');
    }

    // Handle dependency errors
    if (dependencyErrors.length > 0) {
      details.push('Dependencies:');
      dependencyErrors.forEach((err) => {
        details.push(`• ${err.message}`);
      });
      actions.push('Resolve dependency issues');
    }

    // Specific error handling
    if (error.hasFieldError('blocking_task')) {
      title = 'Connect Quest Required';
      message = 'This quest requires a Connect quest to be created first.';
      actions.unshift('Create a Connect quest for this provider');
    }

    if (error.hasFieldError('child')) {
      title = 'Child Tasks Required';
      message = 'Multiple type quests must have at least one child task.';
      actions.unshift('Add at least one child task');
    }

    return { title, message, details, actions };
  }

  /**
   * Handle API errors
   */
  static handleAPIError(error: unknown): {
    title: string;
    message: string;
    isRetryable: boolean;
  } {
    if (error instanceof QuestValidationError) {
      const handled = this.handleValidationError(error);
      return {
        title: handled.title,
        message: handled.message,
        isRetryable: false,
      };
    }

    if (error instanceof Error) {
      // Handle specific API error patterns
      if (error.message.includes('blocking_task')) {
        return {
          title: 'Dependency Error',
          message: 'This quest has unresolved dependencies. Please check blocking tasks.',
          isRetryable: false,
        };
      }

      if (error.message.includes('uri')) {
        return {
          title: 'Invalid URL',
          message: 'The provided URL is invalid or inaccessible.',
          isRetryable: false,
        };
      }

      if (error.message.includes('network') || error.message.includes('timeout')) {
        return {
          title: 'Network Error',
          message: 'Failed to connect to the server. Please try again.',
          isRetryable: true,
        };
      }

      return {
        title: 'Quest Creation Failed',
        message: error.message,
        isRetryable: false,
      };
    }

    return {
      title: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again.',
      isRetryable: true,
    };
  }

  /**
   * Log validation errors for debugging
   */
  static logValidationError(error: QuestValidationError, context?: Record<string, unknown>): void {
    console.group('🔍 Quest Validation Error');
    console.error('Summary:', error.getSummary());
    console.table(error.errors);
    if (context) {
      console.log('Context:', context);
    }
    console.groupEnd();
  }

  /**
   * Create validation error from field errors
   */
  static createValidationError(
    errors: ValidationFieldError[],
    context?: Record<string, unknown>,
  ): QuestValidationError {
    const message = `Validation failed with ${errors.length} error(s)`;
    return new QuestValidationError(message, errors, context);
  }
}

/**
 * Helper functions for creating specific validation errors
 */
export const ValidationErrorFactory = {
  required: (field: string, customMessage?: string): ValidationFieldError => ({
    field,
    message: customMessage ?? `${field} is required`,
    type: 'required',
    code: 'FIELD_REQUIRED',
  }),

  invalid: (field: string, value: unknown, reason?: string): ValidationFieldError => ({
    field,
    message: `${field} has invalid value${reason ? `: ${reason}` : ''}`,
    type: 'invalid',
    code: 'FIELD_INVALID',
    context: { value },
  }),

  dependency: (field: string, dependency: string, action?: string): ValidationFieldError => ({
    field,
    message: `${field} requires ${dependency}${action ? `. ${action}` : ''}`,
    type: 'dependency',
    code: 'DEPENDENCY_MISSING',
    context: { dependency, action },
  }),

  constraint: (field: string, constraint: string): ValidationFieldError => ({
    field,
    message: `${field} violates constraint: ${constraint}`,
    type: 'constraint',
    code: 'CONSTRAINT_VIOLATION',
    context: { constraint },
  }),
};

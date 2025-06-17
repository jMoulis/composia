export class TriggerExecutionError extends Error {
  public readonly name = 'TriggerExecutionError';
  constructor(
    public message: string,
    public context?: Record<string, any>
  ) {
    super(message);
  }
}
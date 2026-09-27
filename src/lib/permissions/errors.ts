/**
 * Thrown by the `requireAdmin` guard when a STAFF profile touches an
 * admin-only server function. Carries `status: 403`; stable name/message so
 * callers can match it like `UnauthorizedError`.
 */
export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

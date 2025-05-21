/**
 * ResponseHelper class for standardizing API responses
 */
export class ResponseHelper {
  /**
   * Create a successful response with data
   * @param data The data to include in the response
   * @param status HTTP status code (default: 200)
   * @returns Response object
   */
  static success<T>(data: T, status = 200): Response {
    return new Response(
      JSON.stringify(
        data,
      ),
      {
        status,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }

  /**
   * Create an error response
   * @param message Error message
   * @param status HTTP status code (default: 400)
   * @param errors Additional error details (optional)
   * @returns Response object
   */
  static error(message: string, status = 400, errors?: any): Response {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message,
          ...(errors && { details: errors }),
        },
        timestamp: new Date().toISOString(),
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }

  /**
   * Create a not found response
   * @param message Custom message (optional)
   * @returns Response object
   */
  static notFound(message = "Resource not found"): Response {
    return this.error(message, 404)
  }

  /**
   * Create an unauthorized response
   * @param message Custom message (optional)
   * @returns Response object
   */
  static unauthorized(message = "Unauthorized"): Response {
    return this.error(message, 401)
  }

  /**
   * Create a forbidden response
   * @param message Custom message (optional)
   * @returns Response object
   */
  static forbidden(message = "Forbidden"): Response {
    return this.error(message, 403)
  }

  /**
   * Create a server error response
   * @param message Custom message (optional)
   * @returns Response object
   */
  static serverError(message = "Internal Server Error"): Response {
    return this.error(message, 500)
  }

  /**
   * Create a created response (201)
   * @param data The created resource data
   * @returns Response object
   */
  static created<T>(data: T): Response {
    return this.success(data, 201)
  }

  /**
   * Create a no content response (204)
   * @returns Response object
   */
  static noContent(): Response {
    return new Response(null, { status: 204 })
  }

  /**
   * Create a paginated response
   * @param data Array of items
   * @param page Current page number
   * @param limit Items per page
   * @param total Total number of items
   * @returns Response object
   */
  static paginated<T>(data: T[], page: number, limit: number, total: number): Response {
    const totalPages = Math.ceil(total / limit)

    return this.success({
      items: data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  }
}

export class ApiResponse<T = unknown> {
  public success: boolean;
  public message: string;
  public data?: T;

  constructor(statusCode: number, message: string = "Success", data?: T) {
    this.success = statusCode < 400;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }
}

export default ApiResponse;


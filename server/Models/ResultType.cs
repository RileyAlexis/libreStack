namespace Librestack.Models;

public enum ErrorType
{
    NotFound,
    Conflict,
    Forbidden,
    BadRequest,
    Unexpected
}

public class Result
{
    public bool IsSuccess { get; }
    public string? Error { get; }
    public ErrorType? ErrorType { get; }

    private Result(bool isSuccess, string? error, ErrorType? errorType)
    {
        IsSuccess = isSuccess;
        Error = error;
        ErrorType = errorType;
    }

    public static Result Success() => new(true, null, null);
    public static Result Failure(string error, ErrorType errorType) => new(false, error, errorType);
}

// And the generic version
public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public ErrorType? ErrorType { get; }

    private Result(bool isSuccess, T? value, string? error, ErrorType? errorType)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
        ErrorType = errorType;
    }

    public static Result<T> Success(T value) => new(true, value, null, null);
    public static Result<T> Failure(string error, ErrorType errorType) => new(false, default, error, errorType);
}
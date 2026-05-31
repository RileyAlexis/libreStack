# Agent Instructions

This file contains high-signal, repository-specific guidance for automated open-source development tasks in the LibreStack repository. Trust the executable evidence over prose documentation.

## ⚙️ Development & Build Workflow
*   **Database Setup:** Use Entity Framework Core migrations. Standard setup: `dotnet ef migrations add <MigrationName>` followed by `dotnet ef database update`.
*   **Service Dependencies:** The application relies on PostgreSQL via Npgsql and EF Core. Connection secrets must be managed using environment variables (check `.env` or `appsettings.Development.json`).
*   **Service Abstraction:** Be aware of service contracts. Use interfaces (e.g., `IlibraryService`, `IInterfaceLibraryTagService`) for dependency injection to maintain decoupling.

## 📚 Core Functionality Boundaries
*   **Library Management:** Core logic resides in the `Services/` directory (e.g., `LibraryService.cs`).
*   **Authentication:** Authentication must use ASP.NET Identity integrated with JWT Bearer Tokens. Related components are found in `Controllers/AuthController.cs` and `Services/AuthService.cs`.
*   **EPUB Processing:** The `VersOne.Epub` library is used for library file parsing, primarily handled by `EpubParserService.cs`.

## 💾 Technical Quirks & Gotchas
*   **Environment Variables:** The project uses `DotNetEnv` and relies heavily on environment variables for configuration (e.g., database connection strings, JWT secrets).
*   **Code Generation:** The repository utilizes EF Core migrations (`Migrations/` directory) and potentially code generators for context/schema updates.
*   **Testing:** Ensure all tests run with a clean database context, typically requiring setup that simulates calling `dotnet ef database update` prior to running unit/integration tests.

## 🚨 Exclusions
*   Do not assume generic web API/CRUD standards; always verify the service implementation against `Services/` and `Controllers/`.

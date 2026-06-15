# Stage 1: Build React Frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/client
copy client/package*.json ./
run npm ci
copy client ./
run npm run build

# Stage 2: Build .NET Backend and Publish
from mcr.microsoft.com/dotnet/sdk:10.0 as backend-build
WORKDIR /app
copy server/ ./
# Copy the built static assets from the frontend stage into a temporary location for later use
COPY --from=frontend-build /app/client/build ./wwwroot_assets

# Publish the API, ensuring it knows where to find the webroot content
RUN dotnet publish libreStack.csproj -c Release -o /publish --no-restore

# Stage 3: Production Image (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
# Copy published API code
COPY --from=backend-build /publish .
# Copy the static assets into the webroot directory for ASP.NET Core to serve them from root path (/)
COPY --from=frontend-build /app/client/build ./wwwroot_assets

# Expose port and set the custom entrypoint script
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
CMD []
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class things : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "language",
                table: "books",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "open_library_author_id",
                table: "books",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "open_library_cover_id",
                table: "books",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "open_library_edition_id",
                table: "books",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "open_library_work_id",
                table: "books",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "language",
                table: "books");

            migrationBuilder.DropColumn(
                name: "open_library_author_id",
                table: "books");

            migrationBuilder.DropColumn(
                name: "open_library_cover_id",
                table: "books");

            migrationBuilder.DropColumn(
                name: "open_library_edition_id",
                table: "books");

            migrationBuilder.DropColumn(
                name: "open_library_work_id",
                table: "books");
        }
    }
}

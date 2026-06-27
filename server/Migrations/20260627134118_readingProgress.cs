using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class readingProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_reading_progress_book_id",
                table: "reading_progress");

            migrationBuilder.CreateIndex(
                name: "ix_reading_progress_book_id",
                table: "reading_progress",
                column: "book_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_reading_progress_book_id",
                table: "reading_progress");

            migrationBuilder.CreateIndex(
                name: "ix_reading_progress_book_id",
                table: "reading_progress",
                column: "book_id");
        }
    }
}

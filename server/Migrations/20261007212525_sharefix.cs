using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class sharefix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_reading_progress_book_id",
                table: "reading_progress");

            migrationBuilder.DropIndex(
                name: "ix_book_shares_book_id",
                table: "book_shares");

            migrationBuilder.CreateIndex(
                name: "ix_reading_progress_book_id",
                table: "reading_progress",
                column: "book_id");

            migrationBuilder.CreateIndex(
                name: "ix_book_shares_book_id_user_id_to",
                table: "book_shares",
                columns: new[] { "book_id", "user_id_to" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_reading_progress_book_id",
                table: "reading_progress");

            migrationBuilder.DropIndex(
                name: "ix_book_shares_book_id_user_id_to",
                table: "book_shares");

            migrationBuilder.CreateIndex(
                name: "ix_reading_progress_book_id",
                table: "reading_progress",
                column: "book_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_book_shares_book_id",
                table: "book_shares",
                column: "book_id");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class userseries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_series_series_title",
                table: "series");

            migrationBuilder.CreateIndex(
                name: "ix_series_user_id_series_title",
                table: "series",
                columns: new[] { "user_id", "series_title" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_series_user_id_series_title",
                table: "series");

            migrationBuilder.CreateIndex(
                name: "ix_series_series_title",
                table: "series",
                column: "series_title",
                unique: true);
        }
    }
}

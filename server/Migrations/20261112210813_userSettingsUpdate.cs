using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class userSettingsUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cover_height",
                table: "user_settings");

            migrationBuilder.DropColumn(
                name: "cover_width",
                table: "user_settings");

            migrationBuilder.DropColumn(
                name: "line_height",
                table: "user_settings");

            migrationBuilder.DropColumn(
                name: "reading_font_size",
                table: "user_settings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "cover_height",
                table: "user_settings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "cover_width",
                table: "user_settings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "line_height",
                table: "user_settings",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "reading_font_size",
                table: "user_settings",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}

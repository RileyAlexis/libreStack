using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class groupBy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "group_by_collections",
                table: "user_settings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "group_byseries",
                table: "user_settings",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "group_by_collections",
                table: "user_settings");

            migrationBuilder.DropColumn(
                name: "group_byseries",
                table: "user_settings");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class percentComplete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "percent_complete",
                table: "reading_progress",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "percent_complete",
                table: "reading_progress");
        }
    }
}

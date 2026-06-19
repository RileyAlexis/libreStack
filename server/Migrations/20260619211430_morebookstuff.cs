using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class morebookstuff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "books",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "isbn13",
                table: "books",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "publish_date",
                table: "books",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "wikie_data_identifier",
                table: "books",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "description",
                table: "books");

            migrationBuilder.DropColumn(
                name: "isbn13",
                table: "books");

            migrationBuilder.DropColumn(
                name: "publish_date",
                table: "books");

            migrationBuilder.DropColumn(
                name: "wikie_data_identifier",
                table: "books");
        }
    }
}

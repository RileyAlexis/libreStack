using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class seriesCover : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "series_image",
                table: "series",
                type: "bytea",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "series_image",
                table: "series");
        }
    }
}

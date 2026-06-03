using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class Cover : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_inter_accessible",
                table: "libre_stack_config");

            migrationBuilder.AddColumn<string>(
                name: "cover_content_type",
                table: "library",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "cover_image",
                table: "library",
                type: "bytea",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cover_content_type",
                table: "library");

            migrationBuilder.DropColumn(
                name: "cover_image",
                table: "library");

            migrationBuilder.AddColumn<bool>(
                name: "is_inter_accessible",
                table: "libre_stack_config",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}

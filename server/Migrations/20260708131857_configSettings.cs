using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class configSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "allow_delete_from_disk",
                table: "libre_stack_config",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "allow_new_libraries",
                table: "libre_stack_config",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "allow_new_users",
                table: "libre_stack_config",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "allow_upload_to_library",
                table: "libre_stack_config",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "allow_delete_from_disk",
                table: "libre_stack_config");

            migrationBuilder.DropColumn(
                name: "allow_new_libraries",
                table: "libre_stack_config");

            migrationBuilder.DropColumn(
                name: "allow_new_users",
                table: "libre_stack_config");

            migrationBuilder.DropColumn(
                name: "allow_upload_to_library",
                table: "libre_stack_config");
        }
    }
}

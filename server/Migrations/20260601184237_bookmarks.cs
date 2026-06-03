using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class Bookmarks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "cfi_location",
                table: "reading_progress",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "bookmarks",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    library_id = table.Column<int>(type: "integer", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    cfi_location = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bookmarks", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_reading_progress_library_id",
                table: "reading_progress",
                column: "library_id");

            migrationBuilder.AddForeignKey(
                name: "fk_reading_progress_library_library_id",
                table: "reading_progress",
                column: "library_id",
                principalTable: "library",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_reading_progress_library_library_id",
                table: "reading_progress");

            migrationBuilder.DropTable(
                name: "bookmarks");

            migrationBuilder.DropIndex(
                name: "ix_reading_progress_library_id",
                table: "reading_progress");

            migrationBuilder.AlterColumn<string>(
                name: "cfi_location",
                table: "reading_progress",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}

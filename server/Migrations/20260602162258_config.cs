using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class Config : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "libre_stack_config",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    library_path = table.Column<string>(type: "text", nullable: false),
                    is_setup_complete = table.Column<bool>(type: "boolean", nullable: false),
                    is_inter_accessible = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_libre_stack_config", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_bookmarks_library_id",
                table: "bookmarks",
                column: "library_id");

            migrationBuilder.AddForeignKey(
                name: "fk_bookmarks_library_library_id",
                table: "bookmarks",
                column: "library_id",
                principalTable: "library",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_bookmarks_library_library_id",
                table: "bookmarks");

            migrationBuilder.DropTable(
                name: "libre_stack_config");

            migrationBuilder.DropIndex(
                name: "ix_bookmarks_library_id",
                table: "bookmarks");
        }
    }
}

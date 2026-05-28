using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "library",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    title = table.Column<string>(type: "text", nullable: false),
                    author = table.Column<string>(type: "text", nullable: false),
                    publisher = table.Column<string>(type: "text", nullable: false),
                    series_title = table.Column<string>(type: "text", nullable: true),
                    series_order = table.Column<int>(type: "integer", nullable: false),
                    series_total = table.Column<int>(type: "integer", nullable: false),
                    isbn = table.Column<string>(type: "text", nullable: false),
                    lccn = table.Column<string>(type: "text", nullable: true),
                    oclc_world_cat = table.Column<string>(type: "text", nullable: true),
                    amazon_id = table.Column<string>(type: "text", nullable: true),
                    work_id = table.Column<string>(type: "text", nullable: true),
                    collection_id = table.Column<int>(type: "integer", nullable: false),
                    epub_path = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_library", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "library_tags",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tag = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_library_tags", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "applied_library_tags",
                columns: table => new
                {
                    library_id = table.Column<int>(type: "integer", nullable: false),
                    tag_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_applied_library_tags", x => new { x.library_id, x.tag_id });
                    table.ForeignKey(
                        name: "fk_applied_library_tags_library_library_id",
                        column: x => x.library_id,
                        principalTable: "library",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_applied_library_tags_library_tags_tag_id",
                        column: x => x.tag_id,
                        principalTable: "library_tags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_applied_library_tags_tag_id",
                table: "applied_library_tags",
                column: "tag_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "applied_library_tags");

            migrationBuilder.DropTable(
                name: "library");

            migrationBuilder.DropTable(
                name: "library_tags");
        }
    }
}

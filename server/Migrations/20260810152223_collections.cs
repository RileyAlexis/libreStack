using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class collections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "collection_id",
                table: "books");

            migrationBuilder.CreateTable(
                name: "collections",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: true),
                    collection_title = table.Column<string>(type: "text", nullable: false),
                    collection_cover = table.Column<byte[]>(type: "bytea", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_collections", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "applied_collections",
                columns: table => new
                {
                    book_id = table.Column<int>(type: "integer", nullable: false),
                    collection_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_applied_collections", x => new { x.book_id, x.collection_id });
                    table.ForeignKey(
                        name: "fk_applied_collections_books_book_id",
                        column: x => x.book_id,
                        principalTable: "books",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_applied_collections_collections_collection_id",
                        column: x => x.collection_id,
                        principalTable: "collections",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_applied_collections_collection_id",
                table: "applied_collections",
                column: "collection_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "applied_collections");

            migrationBuilder.DropTable(
                name: "collections");

            migrationBuilder.AddColumn<int>(
                name: "collection_id",
                table: "books",
                type: "integer",
                nullable: true);
        }
    }
}

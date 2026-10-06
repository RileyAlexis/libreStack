using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class bookshare : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "book_shares",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id_from = table.Column<string>(type: "text", nullable: false),
                    user_id_to = table.Column<string>(type: "text", nullable: false),
                    book_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_book_shares", x => x.id);
                    table.ForeignKey(
                        name: "fk_book_shares_asp_net_users_user_id_from",
                        column: x => x.user_id_from,
                        principalTable: "AspNetUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_book_shares_asp_net_users_user_id_to",
                        column: x => x.user_id_to,
                        principalTable: "AspNetUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_book_shares_books_book_id",
                        column: x => x.book_id,
                        principalTable: "books",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_book_shares_book_id",
                table: "book_shares",
                column: "book_id");

            migrationBuilder.CreateIndex(
                name: "ix_book_shares_user_id_from",
                table: "book_shares",
                column: "user_id_from");

            migrationBuilder.CreateIndex(
                name: "ix_book_shares_user_id_to",
                table: "book_shares",
                column: "user_id_to");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "book_shares");
        }
    }
}

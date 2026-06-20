using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace libreStack.Migrations
{
    /// <inheritdoc />
    public partial class wikidata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "metadata_last_updated",
                table: "books",
                newName: "wikidata_meta_last_updated");

            migrationBuilder.AddColumn<DateTime>(
                name: "open_library_metadata_last_updated",
                table: "books",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "open_library_metadata_last_updated",
                table: "books");

            migrationBuilder.RenameColumn(
                name: "wikidata_meta_last_updated",
                table: "books",
                newName: "metadata_last_updated");
        }
    }
}

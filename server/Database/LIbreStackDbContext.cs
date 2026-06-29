using Librestack.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Librestack.Database;

public class LibrestackDbContext : IdentityDbContext<IdentityUser>
{
    public LibrestackDbContext(DbContextOptions<LibrestackDbContext> options) : base(options) { }

    public DbSet<Library> Libraries { get; set; }
    public DbSet<Book> Books { get; set; }
    public DbSet<BookTag> BookTags { get; set; }
    public DbSet<ReadingProgress> ReadingProgress { get; set; }
    public DbSet<BookmarkModel> Bookmarks { get; set; }
    public DbSet<LibreStackConfig> LibreStackConfig { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<UserSettings> UserSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Book>()
            .HasMany(lib => lib.BookTags)
            .WithMany(tag => tag.Books)
            .UsingEntity<Dictionary<string, object>>(
                "applied_book_tags",
                j => j
                    .HasOne<BookTag>()
                    .WithMany()
                    .HasForeignKey("tag_id"),
                j => j
                    .HasOne<Book>()
                    .WithMany()
                    .HasForeignKey("book_id"),
                j =>
                {
                    j.ToTable("applied_book_tags");
                    j.HasKey("book_id", "tag_id");
                });

        modelBuilder.Entity<Book>()
            .HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId);

        modelBuilder.Entity<Library>()
            .HasMany(lib => lib.Books)
            .WithMany(book => book.Libraries)
            .UsingEntity<Dictionary<string, object>>(
                "library_books",
                joinTable => joinTable
                    .HasOne<Book>()
                    .WithMany()
                    .HasForeignKey("book_id"),
                jointTable => jointTable
                    .HasOne<Library>()
                    .WithMany()
                    .HasForeignKey("library_id"),
                joinTable =>
                {
                    joinTable.ToTable("library_books");
                    joinTable.HasKey("book_id", "library_id");
                }
            );

        modelBuilder.Entity<UserSettings>()
            .HasIndex(s => s.UserId)
            .IsUnique();

        modelBuilder.Entity<UserSettings>()
            .HasOne(s => s.User)
            .WithOne()
            .HasForeignKey<UserSettings>(s => s.UserId);

    }
}
using Librestack.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Librestack.Database;

public class LibrestackDbContext : IdentityDbContext<IdentityUser>
{
    public LibrestackDbContext(DbContextOptions<LibrestackDbContext> options) : base(options) { }

    public DbSet<Library> Library { get; set; }
    public DbSet<LibraryTags> LibraryTags { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Library>()
            .HasMany(lib => lib.LibraryTags)
            .WithMany(tag => tag.Libraries)
            .UsingEntity<Dictionary<string, object>>(
                "applied_library_tags",
                j => j
                    .HasOne<LibraryTags>()
                    .WithMany()
                    .HasForeignKey("tag_id"),
                j => j
                    .HasOne<Library>()
                    .WithMany()
                    .HasForeignKey("library_id"),
                j =>
                {
                    j.ToTable("applied_library_tags");
                    j.HasKey("library_id", "tag_id");
                });

        modelBuilder.Entity<Library>()
            .HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId);
    }
}
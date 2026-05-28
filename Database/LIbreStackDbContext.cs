using Librestack.Models;
using Microsoft.EntityFrameworkCore;

namespace Librestack.Database;

public class LibrestackDbContext : DbContext
{
    public LibrestackDbContext(DbContextOptions<LibrestackDbContext> options) : base(options) { }

    public DbSet<Library> Library { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Library>().ToTable("library");
        modelBuilder.Entity<Library>().Property(l => l.Id).HasColumnName("id");
        modelBuilder.Entity<Library>().Property(l => l.Author).HasColumnName("author");
        modelBuilder.Entity<Library>().Property(l => l.Publisher).HasColumnName("publisher");
        modelBuilder.Entity<Library>().Property(l => l.SeriesTitle).HasColumnName("series_title");
        modelBuilder.Entity<Library>().Property(l => l.SeriesOrder).HasColumnName("series_order");
        modelBuilder.Entity<Library>().Property(l => l.SeriesTotal).HasColumnName("series_total");
        modelBuilder.Entity<Library>().Property(l => l.ISBN).HasColumnName("isbn");
        modelBuilder.Entity<Library>().Property(l => l.LCCN).HasColumnName("lccn");
        modelBuilder.Entity<Library>().Property(l => l.OCLCWorldCat).HasColumnName("oclc_world_cat");
        modelBuilder.Entity<Library>().Property(l => l.AmazonId).HasColumnName("amazon_id");
        modelBuilder.Entity<Library>().Property(l => l.WorkId).HasColumnName("work_id");
        modelBuilder.Entity<Library>().Property(l => l.CollectionId).HasColumnName("collection_id");
        modelBuilder.Entity<Library>().Property(l => l.epubPath).HasColumnName("epub_path");

        modelBuilder.Entity<LibraryTags>().ToTable("library_tags");
        modelBuilder.Entity<LibraryTags>().Property(l => l.Id).HasColumnName("id");
        modelBuilder.Entity<LibraryTags>().Property(l => l.Tag).HasColumnName("tag");

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
    }
}
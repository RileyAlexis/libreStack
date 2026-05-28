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

        modelBuilder.Entity<AppliedLibraryTags>().ToTable("applied_library_tags");
        modelBuilder.Entity<AppliedLibraryTags>().Property(l => l.Id).HasColumnName("id");
        modelBuilder.Entity<AppliedLibraryTags>().Property(l => l.LibraryId).HasColumnName("library_id");
        modelBuilder.Entity<AppliedLibraryTags>().Property(l => l.TagId).HasColumnName("tag_id");

        modelBuilder.Entity<AppliedLibraryTags>()
            .HasOne(applied => applied.LibraryTags)
            .WithMany(l => l.AppliedLibraryTags)
            .HasForeignKey(applied => applied.LibraryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AppliedLibraryTags>()
            .HasOne(applied => applied.LibraryTags)
            .WithMany(lt => lt.AppliedLibraryTags)
            .HasForeignKey(applied => applied.TagId)
            .OnDelete(DeleteBehavior.Cascade);





    }
}
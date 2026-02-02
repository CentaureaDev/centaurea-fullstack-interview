using Microsoft.EntityFrameworkCore;
using CentaureaAPI.Models;

namespace CentaureaAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<ExpressionHistory> ExpressionHistory { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ExpressionHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ComputedTime).IsRequired();
                entity.Property(e => e.Operation).IsRequired();
                entity.Property(e => e.FirstOperand).IsRequired();
                entity.Property(e => e.SecondOperand).IsRequired();
                entity.Property(e => e.Result).IsRequired();
                entity.Property(e => e.UserEmail).HasMaxLength(200);
                entity.HasOne<User>()
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.PasswordSalt).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
            });
        }
    }
}

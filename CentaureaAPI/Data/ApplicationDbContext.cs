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
                entity.Property(e => e.UserIdentifier).HasMaxLength(200);
            });
        }
    }
}

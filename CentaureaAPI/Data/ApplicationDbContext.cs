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

        public DbSet<WeatherRequestHistory> WeatherHistory { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<WeatherRequestHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.RequestTime).IsRequired();
                entity.Property(e => e.TemperatureC).IsRequired();
                entity.Property(e => e.Summary).HasMaxLength(100);
                entity.Property(e => e.TemperatureF).IsRequired();
            });
        }
    }
}

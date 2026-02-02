using CentaureaAPI.Data;
using CentaureaAPI.Services;
using CentaureaAPI.Infrastructure;
using CentaureaAPI.Handlers;
using CentaureaAPI.Settings;
using Microsoft.EntityFrameworkCore;

namespace CentaureaAPI
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite("Data Source=expressions.db"));

            // Register settings
            services.Configure<CultureSettings>(Configuration.GetSection("CultureSettings"));

            // Register event queue infrastructure
            services.AddSingleton<IEventQueue>(InMemoryEventQueue.BuildQueue());
            services.AddHostedService<InMemoryBackgroundExecutor>();

            // Register handlers
            services.AddTransient<IBackgroundHandler<StoreExpressionHistoryEvent>, StoreExpressionHistoryHandler>();
            
            // Register services
            services.AddScoped<IExpressionService, ExpressionService>();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowUIOrigins", builder =>
                {
                    builder.WithOrigins(
                        "http://localhost:3000",
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://127.0.0.1:3000",
                        "http://127.0.0.1:5173",
                        "http://127.0.0.1:5174")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
                });
            });

            services.AddControllers();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ApplicationDbContext dbContext)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
                
                // Create database and apply migrations
                dbContext.Database.EnsureCreated();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowUIOrigins");
            app.UseRouting();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}

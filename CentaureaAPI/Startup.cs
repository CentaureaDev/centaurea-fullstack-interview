using CentaureaAPI.Data;
using CentaureaAPI.Services;
using CentaureaAPI.Infrastructure;
using CentaureaAPI.Handlers;
using CentaureaAPI.Settings;
using CentaureaAPI.Events;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

            // Register handlers - one per operation type for strong typing
            services.AddTransient<IBackgroundHandler<AdditionEvent>, AdditionHandler>();
            services.AddTransient<IBackgroundHandler<SubtractionEvent>, SubtractionHandler>();
            services.AddTransient<IBackgroundHandler<MultiplicationEvent>, MultiplicationHandler>();
            services.AddTransient<IBackgroundHandler<DivisionEvent>, DivisionHandler>();
            services.AddTransient<IBackgroundHandler<RegexpEvent>, RegexpHandler>();
            services.AddTransient<IBackgroundHandler<FactorialEvent>, FactorialHandler>();
            services.AddTransient<IBackgroundHandler<SquareEvent>, SquareHandler>();
            services.AddTransient<IBackgroundHandler<SquareRootEvent>, SquareRootHandler>();
            services.AddTransient<IBackgroundHandler<NegateEvent>, NegateHandler>();
            services.AddTransient<IBackgroundHandler<StoreExpressionHistoryEvent>, StoreExpressionHistoryHandler>();
            
            // Register services
            services.AddScoped<IExpressionService, ExpressionService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IAdminService, AdminService>();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = Configuration["Jwt:Issuer"],
                    ValidAudience = Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Jwt:Key"] ?? string.Empty)),
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

            services.AddAuthorization();

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

            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowNamedFloatingPointLiterals;
                });
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ApplicationDbContext dbContext, IAdminService adminService)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
                
                // Recreate database to apply model changes in development
                dbContext.Database.EnsureDeleted();
                dbContext.Database.EnsureCreated();

                // Ensure admin user exists
                adminService.EnsureAdminUserExistsAsync().Wait();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowUIOrigins");
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}

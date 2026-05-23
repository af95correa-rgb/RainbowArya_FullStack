using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RainbowArya.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddPetNameToReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PetName",
                table: "Reviews",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PetName",
                table: "Reviews");
        }
    }
}

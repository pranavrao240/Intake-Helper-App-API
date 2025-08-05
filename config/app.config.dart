class AppConfig {
  // ✅ Base URL of your Node.js server
  static const String baseUrl =
      'http://localhost:3000'; // change for emulator or production

  // ✅ API Endpoints
  static const String nutritionByDishName =
      '/nutrition'; // will append /DishName
}

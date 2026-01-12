import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../domain/home_models.dart';
import '../../../common/models/product_model.dart';
import 'home_api_service.dart';

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  final dio = ref.read(dioProvider);
  return HomeRepository(dio);
});

class HomeRepository {
  final HomeApiService _apiService;

  HomeRepository(dio) : _apiService = HomeApiService(dio);

  Future<List<Banner>> getBanners() async {
    return await _apiService.getBanners({'status': 'ACTIVE'});
  }

  Future<List<Category>> getCategories() async {
    return await _apiService.getCategories({'status': 'ACTIVE'});
  }

  Future<PaginatedResponse<Product>> getFeaturedProducts({int page = 1, int limit = 10}) async {
    final response = await _apiService.getFeaturedProducts({
      'isFeatured': true,
      'status': 'ACTIVE',
      'page': page,
      'limit': limit,
    });

    final data = response['data'];
    final recordList = (data['recordList'] as List)
        .map((item) => Product.fromJson(item as Map<String, dynamic>))
        .toList();

    return PaginatedResponse(
      data: recordList,
      total: data['totalRecords'] as int,
      page: data['currentPage'] as int,
      limit: data['limit'] as int,
      totalPages: data['totalPages'] as int,
    );
  }

  Future<List<FlashDeal>> getActiveFlashDeals() async {
    try {
      return await _apiService.getActiveFlashDeals();
    } catch (e) {
      // Flash deals might not be implemented yet
      return [];
    }
  }

  Future<HomeData> getHomeData() async {
    final banners = await getBanners();
    final categories = await getCategories();
    final products = await getFeaturedProducts();
    final flashDeals = await getActiveFlashDeals();

    return HomeData(
      banners: banners,
      categories: categories,
      featuredProducts: products.data,
      flashDeals: flashDeals,
    );
  }
}

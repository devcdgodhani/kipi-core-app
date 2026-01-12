import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/home_repository.dart';
import '../domain/home_models.dart';
import '../../../common/models/product_model.dart';

part 'home_provider.g.dart';

@riverpod
Future<List<Banner>> banners(BannersRef ref) async {
  final repository = ref.read(homeRepositoryProvider);
  return await repository.getBanners();
}

@riverpod
Future<List<Category>> categories(CategoriesRef ref) async {
  final repository = ref.read(homeRepositoryProvider);
  return await repository.getCategories();
}

@riverpod
Future<PaginatedResponse<Product>> featuredProducts(FeaturedProductsRef ref) async {
  final repository = ref.read(homeRepositoryProvider);
  return await repository.getFeaturedProducts();
}

@riverpod
Future<List<FlashDeal>> flashDeals(FlashDealsRef ref) async {
  final repository = ref.read(homeRepositoryProvider);
  return await repository.getActiveFlashDeals();
}

@riverpod
Future<HomeData> homeData(HomeDataRef ref) async {
  final repository = ref.read(homeRepositoryProvider);
  return await repository.getHomeData();
}

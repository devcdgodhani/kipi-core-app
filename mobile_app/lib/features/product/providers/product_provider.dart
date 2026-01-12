import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/product_repository.dart';
import '../../../common/models/product_model.dart';

part 'product_provider.g.dart';

// Product filters state
class ProductFilters {
  final String? categoryId;
  final double? minPrice;
  final double? maxPrice;
  final String? sortBy;
  final String? sortOrder;
  final bool? isFeatured;
  final bool? isNewArrival;

  const ProductFilters({
    this.categoryId,
    this.minPrice,
    this.maxPrice,
    this.sortBy,
    this.sortOrder,
    this.isFeatured,
    this.isNewArrival,
  });

  ProductFilters copyWith({
    String? categoryId,
    double? minPrice,
    double? maxPrice,
    String? sortBy,
    String? sortOrder,
    bool? isFeatured,
    bool? isNewArrival,
  }) {
    return ProductFilters(
      categoryId: categoryId ?? this.categoryId,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      sortBy: sortBy ?? this.sortBy,
      sortOrder: sortOrder ?? this.sortOrder,
      isFeatured: isFeatured ?? this.isFeatured,
      isNewArrival: isNewArrival ?? this.isNewArrival,
    );
  }
}

// Product list provider with pagination
@riverpod
class ProductList extends _$ProductList {
  int _currentPage = 1;
  final List<Product> _allProducts = [];
  bool _hasMore = true;

  @override
  Future<PaginatedResponse<Product>> build({ProductFilters? filters}) async {
    final repository = ref.read(productRepositoryProvider);
    final response = await repository.getProducts(
      page: _currentPage,
      categoryId: filters?.categoryId,
      minPrice: filters?.minPrice,
      maxPrice: filters?.maxPrice,
      sortBy: filters?.sortBy,
      sortOrder: filters?.sortOrder,
      isFeatured: filters?.isFeatured,
      isNewArrival: filters?.isNewArrival,
    );

    _allProducts.clear();
    _allProducts.addAll(response.data);
    _hasMore = _currentPage < response.totalPages;

    return response;
  }

  Future<void> loadMore() async {
    if (!_hasMore) return;

    _currentPage++;
    final repository = ref.read(productRepositoryProvider);
    final response = await repository.getProducts(
      page: _currentPage,
      categoryId: filters?.categoryId,
      minPrice: filters?.minPrice,
      maxPrice: filters?.maxPrice,
      sortBy: filters?.sortBy,
      sortOrder: filters?.sortOrder,
      isFeatured: filters?.isFeatured,
      isNewArrival: filters?.isNewArrival,
    );

    _allProducts.addAll(response.data);
    _hasMore = _currentPage < response.totalPages;

    state = AsyncValue.data(
      PaginatedResponse(
        data: List.from(_allProducts),
        total: response.total,
        page: _currentPage,
        limit: response.limit,
        totalPages: response.totalPages,
      ),
    );
  }

  void reset() {
    _currentPage = 1;
    _allProducts.clear();
    _hasMore = true;
    ref.invalidateSelf();
  }
}

// Single product provider
@riverpod
Future<Product> product(ProductRef ref, String productId) async {
  final repository = ref.read(productRepositoryProvider);
  return await repository.getProductById(productId);
}

// Product SKUs provider
@riverpod
Future<List<SKU>> productSKUs(ProductSKUsRef ref, String productId) async {
  final repository = ref.read(productRepositoryProvider);
  return await repository.getProductSKUs(productId);
}

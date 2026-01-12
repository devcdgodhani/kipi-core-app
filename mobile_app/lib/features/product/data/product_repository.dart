import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../common/models/product_model.dart';
import 'product_api_service.dart';

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  final dio = ref.read(dioProvider);
  return ProductRepository(dio);
});

class ProductRepository {
  final ProductApiService _apiService;

  ProductRepository(dio) : _apiService = ProductApiService(dio);

  Future<PaginatedResponse<Product>> getProducts({
    int page = 1,
    int limit = 20,
    String? categoryId,
    double? minPrice,
    double? maxPrice,
    String? sortBy,
    String? sortOrder,
    bool? isFeatured,
    bool? isNewArrival,
  }) async {
    final filters = <String, dynamic>{
      'status': 'ACTIVE',
      'page': page,
      'limit': limit,
    };

    if (categoryId != null) filters['categoryId'] = categoryId;
    if (minPrice != null) filters['minPrice'] = minPrice;
    if (maxPrice != null) filters['maxPrice'] = maxPrice;
    if (sortBy != null) filters['sortBy'] = sortBy;
    if (sortOrder != null) filters['sortOrder'] = sortOrder;
    if (isFeatured != null) filters['isFeatured'] = isFeatured;
    if (isNewArrival != null) filters['isNewArrival'] = isNewArrival;

    final response = await _apiService.getWithPagination(filters);
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

  Future<Product> getProductById(String id) async {
    return await _apiService.getOne({'_id': id});
  }

  Future<Product> getProductBySlug(String slug) async {
    return await _apiService.getOne({'slug': slug});
  }

  Future<List<SKU>> getProductSKUs(String productId) async {
    return await _apiService.getSKUs({
      'productId': productId,
      'status': 'ACTIVE',
    });
  }

  Future<SKU> getSKUById(String skuId) async {
    return await _apiService.getSKU({'_id': skuId});
  }
}

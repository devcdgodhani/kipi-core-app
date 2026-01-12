// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$productHash() => r'0c33247cf8719c1028710488a088bab6eba63a47';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

/// See also [product].
@ProviderFor(product)
const productProvider = ProductFamily();

/// See also [product].
class ProductFamily extends Family<AsyncValue<Product>> {
  /// See also [product].
  const ProductFamily();

  /// See also [product].
  ProductProvider call(
    String productId,
  ) {
    return ProductProvider(
      productId,
    );
  }

  @override
  ProductProvider getProviderOverride(
    covariant ProductProvider provider,
  ) {
    return call(
      provider.productId,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'productProvider';
}

/// See also [product].
class ProductProvider extends AutoDisposeFutureProvider<Product> {
  /// See also [product].
  ProductProvider(
    String productId,
  ) : this._internal(
          (ref) => product(
            ref as ProductRef,
            productId,
          ),
          from: productProvider,
          name: r'productProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$productHash,
          dependencies: ProductFamily._dependencies,
          allTransitiveDependencies: ProductFamily._allTransitiveDependencies,
          productId: productId,
        );

  ProductProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.productId,
  }) : super.internal();

  final String productId;

  @override
  Override overrideWith(
    FutureOr<Product> Function(ProductRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: ProductProvider._internal(
        (ref) => create(ref as ProductRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        productId: productId,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<Product> createElement() {
    return _ProductProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is ProductProvider && other.productId == productId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, productId.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin ProductRef on AutoDisposeFutureProviderRef<Product> {
  /// The parameter `productId` of this provider.
  String get productId;
}

class _ProductProviderElement extends AutoDisposeFutureProviderElement<Product>
    with ProductRef {
  _ProductProviderElement(super.provider);

  @override
  String get productId => (origin as ProductProvider).productId;
}

String _$productSKUsHash() => r'64603f25c6544ad3ab463e790ed8cedcad8dbeb9';

/// See also [productSKUs].
@ProviderFor(productSKUs)
const productSKUsProvider = ProductSKUsFamily();

/// See also [productSKUs].
class ProductSKUsFamily extends Family<AsyncValue<List<SKU>>> {
  /// See also [productSKUs].
  const ProductSKUsFamily();

  /// See also [productSKUs].
  ProductSKUsProvider call(
    String productId,
  ) {
    return ProductSKUsProvider(
      productId,
    );
  }

  @override
  ProductSKUsProvider getProviderOverride(
    covariant ProductSKUsProvider provider,
  ) {
    return call(
      provider.productId,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'productSKUsProvider';
}

/// See also [productSKUs].
class ProductSKUsProvider extends AutoDisposeFutureProvider<List<SKU>> {
  /// See also [productSKUs].
  ProductSKUsProvider(
    String productId,
  ) : this._internal(
          (ref) => productSKUs(
            ref as ProductSKUsRef,
            productId,
          ),
          from: productSKUsProvider,
          name: r'productSKUsProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$productSKUsHash,
          dependencies: ProductSKUsFamily._dependencies,
          allTransitiveDependencies:
              ProductSKUsFamily._allTransitiveDependencies,
          productId: productId,
        );

  ProductSKUsProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.productId,
  }) : super.internal();

  final String productId;

  @override
  Override overrideWith(
    FutureOr<List<SKU>> Function(ProductSKUsRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: ProductSKUsProvider._internal(
        (ref) => create(ref as ProductSKUsRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        productId: productId,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<List<SKU>> createElement() {
    return _ProductSKUsProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is ProductSKUsProvider && other.productId == productId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, productId.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin ProductSKUsRef on AutoDisposeFutureProviderRef<List<SKU>> {
  /// The parameter `productId` of this provider.
  String get productId;
}

class _ProductSKUsProviderElement
    extends AutoDisposeFutureProviderElement<List<SKU>> with ProductSKUsRef {
  _ProductSKUsProviderElement(super.provider);

  @override
  String get productId => (origin as ProductSKUsProvider).productId;
}

String _$productListHash() => r'4508d45c05fbe9a4efc193bb4d0625dc20d200f2';

abstract class _$ProductList
    extends BuildlessAutoDisposeAsyncNotifier<PaginatedResponse<Product>> {
  late final ProductFilters? filters;

  FutureOr<PaginatedResponse<Product>> build({
    ProductFilters? filters,
  });
}

/// See also [ProductList].
@ProviderFor(ProductList)
const productListProvider = ProductListFamily();

/// See also [ProductList].
class ProductListFamily extends Family<AsyncValue<PaginatedResponse<Product>>> {
  /// See also [ProductList].
  const ProductListFamily();

  /// See also [ProductList].
  ProductListProvider call({
    ProductFilters? filters,
  }) {
    return ProductListProvider(
      filters: filters,
    );
  }

  @override
  ProductListProvider getProviderOverride(
    covariant ProductListProvider provider,
  ) {
    return call(
      filters: provider.filters,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'productListProvider';
}

/// See also [ProductList].
class ProductListProvider extends AutoDisposeAsyncNotifierProviderImpl<
    ProductList, PaginatedResponse<Product>> {
  /// See also [ProductList].
  ProductListProvider({
    ProductFilters? filters,
  }) : this._internal(
          () => ProductList()..filters = filters,
          from: productListProvider,
          name: r'productListProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$productListHash,
          dependencies: ProductListFamily._dependencies,
          allTransitiveDependencies:
              ProductListFamily._allTransitiveDependencies,
          filters: filters,
        );

  ProductListProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.filters,
  }) : super.internal();

  final ProductFilters? filters;

  @override
  FutureOr<PaginatedResponse<Product>> runNotifierBuild(
    covariant ProductList notifier,
  ) {
    return notifier.build(
      filters: filters,
    );
  }

  @override
  Override overrideWith(ProductList Function() create) {
    return ProviderOverride(
      origin: this,
      override: ProductListProvider._internal(
        () => create()..filters = filters,
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        filters: filters,
      ),
    );
  }

  @override
  AutoDisposeAsyncNotifierProviderElement<ProductList,
      PaginatedResponse<Product>> createElement() {
    return _ProductListProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is ProductListProvider && other.filters == filters;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, filters.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin ProductListRef
    on AutoDisposeAsyncNotifierProviderRef<PaginatedResponse<Product>> {
  /// The parameter `filters` of this provider.
  ProductFilters? get filters;
}

class _ProductListProviderElement
    extends AutoDisposeAsyncNotifierProviderElement<ProductList,
        PaginatedResponse<Product>> with ProductListRef {
  _ProductListProviderElement(super.provider);

  @override
  ProductFilters? get filters => (origin as ProductListProvider).filters;
}
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

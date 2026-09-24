import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Container from '../../components/UI/Container/Container';
import { useEcwidProducts } from '../../hooks/useEcwidProducts';
import LoadingState from '../../components/LoadingState/LoadingState';
import ErrorState from '../../components/ErrorState/ErrorState';
import heroLeafImg from '../../assets/hero_leaf_transparent.png';
import heroProductsImg from '../../assets/hero_products_mobile.png';
import './Store.css';

// 4 official store browsing categories mapped to Ecwid catalog IDs
const STORE_CATEGORY_TABS = [
  { id: 'all', label: 'All Products', ecwidId: null },
  { id: 'neem', label: 'Neem', ecwidId: '206710677' },
  { id: 'bamboo', label: 'Bamboo', ecwidId: '206706898' },
  { id: 'coconut-coir', label: 'Coconut Coir', ecwidId: '206708145', aliases: ['coconut', 'coconut-coir', 'coir'] }
];

const ITEMS_PER_PAGE = 12;

const Store = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogTopRef = useRef(null);

  // 1. URL State Parsing
  const rawCategory = (searchParams.get('category') || 'all').trim().toLowerCase();
  const keywordParam = (searchParams.get('keyword') || searchParams.get('search') || '').trim();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // Resolve current active tab (including aliases like 'coconut' -> 'coconut-coir')
  const currentTab = useMemo(() => {
    const matched = STORE_CATEGORY_TABS.find(
      (t) => t.id === rawCategory || (Array.isArray(t.aliases) && t.aliases.includes(rawCategory))
    );
    return matched || STORE_CATEGORY_TABS[0];
  }, [rawCategory]);

  const activeCategoryId = currentTab.id;

  // 2. Search query local state for input typing
  const [searchInput, setSearchInput] = useState(keywordParam);
  const [prevKeywordParam, setPrevKeywordParam] = useState(keywordParam);

  // Synchronize search input if URL changes externally without an effect warning
  if (prevKeywordParam !== keywordParam) {
    setPrevKeywordParam(keywordParam);
    setSearchInput(keywordParam);
  }

  // URL state update helper
  const updateUrlParams = useCallback((catId, newPage, kw) => {
    const nextParams = new URLSearchParams();
    if (catId && catId !== 'all') {
      nextParams.set('category', catId);
    }
    const cleanKw = (kw !== undefined ? kw : keywordParam).trim();
    if (cleanKw) {
      nextParams.set('keyword', cleanKw);
    }
    if (newPage && newPage > 1) {
      nextParams.set('page', String(newPage));
    }
    setSearchParams(nextParams);
  }, [keywordParam, setSearchParams]);

  // Debounced search query update: when query changes, update URL and reset to page 1
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== keywordParam) {
        updateUrlParams(activeCategoryId, 1, trimmed);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput, keywordParam, activeCategoryId, updateUrlParams]);

  // Tab change handler: category changes reset pagination to page 1
  const handleTabChange = (tabId) => {
    updateUrlParams(tabId, 1, searchInput);
  };

  // Search submit handler (instant on Enter)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams(activeCategoryId, 1, searchInput.trim());
  };

  // Search clear handler
  const handleClearSearch = () => {
    setSearchInput('');
    updateUrlParams(activeCategoryId, 1, '');
  };

  // 3. Live Ecwid Product Query with limit & offset pagination
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const ecwidCategoryArg = currentTab.id === 'all' ? null : currentTab.ecwidId;
  const ecwidKeywordArg = keywordParam || null;

  const { products, total, loading, error, refetch } = useEcwidProducts({
    category: ecwidCategoryArg,
    keyword: ecwidKeywordArg,
    limit: ITEMS_PER_PAGE,
    offset
  });

  // Calculate dynamic total pages from live Ecwid total product count
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  // Page change handler
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    updateUrlParams(activeCategoryId, newPage, searchInput);
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  return (
    <div className="store-page">
      {/* Top Store Hero Banner */}
      <section className="store-hero-banner" aria-label="Store Introduction">
        <img 
          src={heroLeafImg} 
          alt="" 
          aria-hidden="true" 
          className="store-hero-leaf-topleft" 
        />
        <Container>
          <div className="store-hero-grid">
            {/* Left Content */}
            <div className="store-hero-left">
              <nav className="store-breadcrumbs" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span className="breadcrumb-separator">&gt;</span>
                {currentTab.id === 'all' ? (
                  <span className="breadcrumb-current">Store</span>
                ) : (
                  <>
                    <Link to="/store">Store</Link>
                    <span className="breadcrumb-separator">&gt;</span>
                    <span className="breadcrumb-current">{currentTab.label}</span>
                  </>
                )}
              </nav>

              <h1 className="store-hero-title">
                Shop Natural
                <br />
                Everyday Essentials
              </h1>

              <p className="store-hero-subtitle">
                Thoughtfully crafted from Neem wood, Bamboo and Coconut Coir.
                <br />
                Natural choices for modern homes, made with care in India.
              </p>

              {/* 3 Value Pillars */}
              <div className="store-value-pillars">
                <div className="pillar-item">
                  <span className="pillar-icon" aria-hidden="true">🍃</span>
                  <div className="pillar-text">
                    <strong>Natural Materials</strong>
                    <small>Better for you, better for the planet.</small>
                  </div>
                </div>

                <div className="pillar-item">
                  <span className="pillar-icon" aria-hidden="true">🤍</span>
                  <div className="pillar-text">
                    <strong>Everyday Essentials</strong>
                    <small>For happier, healthier homes.</small>
                  </div>
                </div>

                <div className="pillar-item">
                  <span className="pillar-icon" aria-hidden="true">♻️</span>
                  <div className="pillar-text">
                    <strong>Made in India</strong>
                    <small>Supporting local, reducing plastic.</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Stage */}
            <div className="store-hero-right">
              <div className="store-visual-stage">
                <img
                  src={heroProductsImg}
                  alt="Handcrafted natural neem, bamboo, and coconut essentials"
                  className="store-hero-img"
                />
                <div className="store-handwritten-badge" aria-hidden="true">
                  <span>Small</span>
                  <span>Choices</span>
                  <span className="badge-highlight">Big Change</span>
                  <span className="badge-leaf">🍃</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Catalog Section */}
      <section className="store-catalog-section" aria-label="Products Catalog" ref={catalogTopRef}>
        <Container>
          {/* Controls Bar: Category Tabs & Search Box */}
          <div className="store-controls-bar">
            {/* Category Filter Tabs */}
            <div className="store-category-tabs" role="tablist" aria-label="Filter by category">
              {STORE_CATEGORY_TABS.map((tab) => {
                const isActive = activeCategoryId === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`store-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="store-search-box" role="search">
              <Search size={18} className="search-icon" aria-hidden="true" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products (e.g. hair comb, toothbrush...)"
                aria-label="Search products"
                className="store-search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="search-clear-btn"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </form>
          </div>

          {/* Product Cards Grid (4 columns) / Loading / Error */}
          {loading ? (
            <LoadingState message="Loading live products from Ecwid..." />
          ) : error ? (
            <ErrorState
              title="Unable to Load Catalog"
              message={error}
              onRetry={refetch}
            />
          ) : products && products.length > 0 ? (
            <div className="store-product-grid">
              {products.map((product) => {
                return (
                  <div
                    key={product.id}
                    className="store-product-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/product/${product.id}`);
                      }
                    }}
                  >
                    {/* Image Area with 1:1 Aspect Ratio & Safe Padding */}
                    <div className="card-img-container">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="card-product-img"
                        loading="lazy"
                      />
                    </div>

                    {/* Product Metadata */}
                    <div className="card-content">
                      <h3 className="card-product-name">{product.name}</h3>
                      <span className="card-category-label">
                        {product.categoryTag || product.categoryName}
                      </span>
                      
                      <div className="card-price-row">
                        <span className="card-price">₹{product.price}</span>
                        {product.compareToPrice && (
                          <span className="card-compare-price">₹{product.compareToPrice}</span>
                        )}
                        {product.discountPercent && (
                          <span className="card-discount-badge">{product.discountPercent}% OFF</span>
                        )}
                      </div>

                      {!product.inStock && (
                        <span className="card-out-of-stock-badge">Out of Stock</span>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      className="card-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                    >
                      <span>View Product</span>
                      <ArrowRight size={15} className="view-arrow" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="store-no-results">
              <p>
                {keywordParam
                  ? `No products found matching "${keywordParam}" in ${currentTab.label}.`
                  : currentPage > 1
                  ? `No products found on page ${currentPage}.`
                  : `No products currently available in ${currentTab.label}.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateUrlParams('all', 1, '');
                }}
                className="reset-filters-btn"
              >
                {currentPage > 1 ? 'Go to Page 1' : 'Clear Filters'}
              </button>
            </div>
          )}

          {/* Pagination Controls - completely hidden when only one page exists */}
          {totalPages > 1 && (
            <div className="store-pagination-wrapper">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="pagination-arrow-btn"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`pagination-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="pagination-arrow-btn"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
};

export default Store;


// Ecwid Store Configuration
export const ECWID_CONFIG = {
  storeId: import.meta.env.VITE_ECWID_STORE_ID || '141633269',
  instantSiteUrl: 'https://earthlifeco.company.site',
  adminStoreUrl: 'https://my.ecwid.com/store/141633269',
  categories: {
    all: { id: '0', name: 'All Products', type: 'all' },
    neem: { id: '206710677', name: 'Neem Products', type: 'neem' },
    bamboo: { id: '206706898', name: 'Bamboo Products', type: 'bamboo' },
    coconut: { id: '206708145', name: 'Coconut Coir Products', type: 'coconut' }
  }
};

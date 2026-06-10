import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import apiClient from '@/shared/lib/axios';
import PropertyCard from '@/features/properties/components/PropertyCard';
import PropertyFilters from '@/features/properties/components/PropertyFilters';
import Button from '@/shared/components/Button';
import useScrollReveal from '@/shared/hooks/useScrollReveal';

const PropertyListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contentRef, isContentRevealed] = useScrollReveal();
  const loadMoreRef = useRef(null);

  const location = searchParams.get('location') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const propertyType = searchParams.get('property_type') || '';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loading,
    isError
  } = useInfiniteQuery({
    queryKey: ['properties', location, minPrice, maxPrice, propertyType],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (propertyType) params.append('property_type', propertyType);
      
      const limit = 9;
      params.append('limit', limit);
      params.append('offset', pageParam);

      const { data } = await apiClient.get(`/properties?${params.toString()}`);
      return data.properties || data.data || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 9) return undefined;
      return allPages.length * 9;
    },
    initialPageParam: 0,
  });

  const properties = data?.pages.flat() || [];
  const hasData = properties.length > 0;

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const updateParam = (key, value) => {
    setSearchParams(prev => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[320px] md:h-[60vh] md:min-h-[500px] flex items-center justify-center overflow-hidden">
        <img 
          src="/villa1.jpg" 
          alt="Premium Properties" 
          className="absolute inset-0 w-full h-full object-cover animate-[ken-burns_20s_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/20 to-slate-950/40" />
        
        <div className="relative z-10 text-center px-6 mt-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 shadow-2xl mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">Exclusive Collection</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
            Premium <br/> <span className="text-indigo-300">Properties</span>
          </h1>
        </div>
      </section>
 
      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-24 -mt-12 md:-mt-32 relative z-20">
        
        {/* Modern Filter Bar */}
        <PropertyFilters 
          location={location}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onUpdateParam={updateParam}
          onClearFilters={clearFilters}
        />

        {/* Results */}
        <div ref={contentRef}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-pulse">
               {[1,2,3,4,5,6].map(i => <div key={i} className="h-[500px] bg-slate-100 rounded-[40px]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {properties.map((property, idx) => (
                <div 
                  key={property.id || property._id}
                  className={isContentRevealed ? 'animate-fade-in-up' : 'opacity-0'}
                  style={{ animationDelay: `${(idx % 6) * 100}ms` }}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
              {properties.length === 0 && (
                <div className="col-span-full text-center text-slate-500 py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100 animate-fade-in-up">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">No Properties Found</h3>
                  <p className="font-medium">Try adjusting your search criteria to find your perfect stay.</p>
                  <Button variant="outline" className="mt-8" onClick={clearFilters}>
                     Show All Listings
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="py-20 flex flex-col items-center justify-center">
            {isFetchingNextPage ? (
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Discovering more treasures...</p>
              </div>
            ) : hasNextPage ? (
              <div className="h-10 w-full" />
            ) : properties.length > 0 ? (
              <div className="flex flex-col items-center gap-4 opacity-50">
                 <div className="w-12 h-px bg-slate-200" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">You&apos;ve reached the end of the collection</p>
              </div>
            ) : null}
          </div>

          {!loading && properties.length === 0 && !isError && (
            <div className="text-center text-slate-500 py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Properties Found</h3>
              <p className="font-medium">Try adjusting your search criteria to find your perfect stay.</p>
              <Button variant="outline" className="mt-8" onClick={clearFilters}>
                 Show All Listings
              </Button>
            </div>
          )}
      </section>
    </div>
  );
};

export default PropertyListingPage;

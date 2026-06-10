import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '@/features/properties/hooks/useProperties';
import PropertyCard from '@/features/properties/components/PropertyCard';
import Button from '@/shared/components/Button';
import Hero from '../components/Hero';
import TopDestinations from '../components/TopDestinations';
import FeaturesSection from '../components/FeaturesSection';
import Testimonials from '../components/Testimonials';
import NewsletterCTA from '../components/NewsletterCTA';
import useScrollReveal from '@/shared/hooks/useScrollReveal';

const HomePage = () => {
  const { data: propertiesData, isLoading: loading } = useProperties();
  const navigate = useNavigate();
  const [featuredRef, featuredRevealed] = useScrollReveal();

  // Handle nested data structures if backend wraps it
  const properties = propertiesData?.properties || propertiesData?.data || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Hero />

      <TopDestinations />

      {/* Featured Properties */}
      <section ref={featuredRef} className={`px-6 py-12 md:py-24 max-w-7xl mx-auto opacity-0 ${featuredRevealed ? 'animate-fade-in-up' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
          <div className="max-w-xl text-left">
            <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">Our Collection</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Featured Properties</h2>
            <p className="text-slate-500 mt-4 font-medium text-lg">Handpicked selection of our finest homes, curated for absolute luxury and comfort.</p>
          </div>
          <Button variant="outline" className="!rounded-2xl shrink-0" onClick={() => navigate('/properties')}>
            Explore All Listings &rarr;
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-pulse">
             {[1,2,3].map(i => <div key={i} className="h-[500px] bg-slate-100 rounded-[40px]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
            {properties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id || property._id} property={property} />
            ))}
            {properties.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-2">No properties found in our collection yet.</h3>
                <p className="font-medium text-slate-400">Our curators are searching for the next extraordinary stay.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <FeaturesSection />
      
      <Testimonials />
      
      <NewsletterCTA />
    </div>
  );
};

export default HomePage;

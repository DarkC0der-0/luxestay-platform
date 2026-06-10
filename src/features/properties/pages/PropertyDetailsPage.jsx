import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProperty } from '@/features/properties/hooks/useProperties';
import { useAuthStore } from '@/features/auth/store/authStore';
import BookingWidget from '@/features/bookings/components/BookingWidget';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';
import ImageLightbox from '../components/ImageLightbox';
import PropertySpecs from '../components/PropertySpecs';
import PropertyHostCard from '../components/PropertyHostCard';
import PropertyMap from '../components/PropertyMap';
import LuxeAssuranceCard from '../components/LuxeAssuranceCard';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const { data: responseData, isLoading: loading, isError } = useProperty(id);
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const property = responseData?.property || responseData?.data || responseData;

  if (loading) return <div className="pt-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (isError || !property || (property && !property.title)) {
    return (
      <div className="pt-32 text-center space-y-4 px-6">
        <p className="text-red-500 font-bold text-xl">Property not found or failed to load.</p>
        <button onClick={() => navigate('/properties')} className="text-indigo-600 font-bold hover:underline">
          Return to listings
        </button>
      </div>
    );
  }

  const handleChat = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    navigate(`/messages?propertyId=${property.id}&hostId=${property.host_id}&hostName=${encodeURIComponent(property.host_name || 'Host')}&propertyTitle=${encodeURIComponent(property.title || 'Property')}`);
  };

  const openLightbox = (index) => setActiveImageIndex(index);
  const closeLightbox = () => setActiveImageIndex(null);
  
  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % property.image_urls.length);
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + property.image_urls.length) % property.image_urls.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Lightbox Modal */}
      <ImageLightbox 
        activeImageIndex={activeImageIndex}
        imageUrls={property.image_urls || []}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
      />

      {/* Hero Section */}
      <section className="relative h-[65vh] min-h-[550px] flex items-end pb-24 md:pb-36 overflow-hidden">
        <img 
          src={property.image_urls?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80'} 
          alt={property.title} 
          className="absolute inset-0 w-full h-full object-cover animate-[ken-burns_20s_infinite_alternate]"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 animate-fade-in-up">
          <button onClick={() => navigate(-1)} className="text-sm font-bold text-white/70 mb-6 hover:text-white transition-colors flex items-center">
            &larr; Back to Listings
          </button>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 shadow-2xl mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{property.property_type || 'Luxury Rental'}</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl mb-4 leading-none">
            {property.title}
          </h1>
          
          <div className="flex items-center text-xl font-bold text-slate-300 drop-shadow-md">
            <FaMapMarkerAlt className="mr-2 text-indigo-400" />
            <span>{property.location}</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16 -mt-12 md:-mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-12 animate-fade-in-up">
            
            {/* Features Bar */}
            <PropertySpecs 
              maxGuests={property.max_guests}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
            />

            {/* About Section */}
            <div className="bg-white p-8 sm:p-12 rounded-[40px] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <FiInfo className="text-xl" />
                </div>
                <h3 className="text-3xl font-black text-slate-900">The Experience</h3>
              </div>
              <p className="text-slate-600 text-xl leading-relaxed whitespace-pre-wrap">{property.description || 'No description available for this property.'}</p>
            </div>

            {/* Photo Gallery Section */}
            {property.image_urls && property.image_urls.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-slate-900">Gallery</h3>
                  <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest">
                    {property.image_urls.length} Photos
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {property.image_urls.map((url, index) => (
                    <div 
                      key={index} 
                      onClick={() => openLightbox(index)}
                      className={`overflow-hidden rounded-[32px] border border-slate-100 shadow-sm cursor-zoom-in group ${index === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square'}`}
                    >
                      <img 
                        src={url} 
                        alt={`${property.title} - ${index + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Host Section */}
            <PropertyHostCard 
              hostAvatar={property.host_avatar}
              hostName={property.host_name}
              onMessage={handleChat}
            />

            {/* Location Section */}
            <PropertyMap location={property.location} />

          </div>

          {/* Booking Widget Sidebar */}
          <div className="relative mt-8 lg:mt-0 animate-fade-in-up delay-200">
            <div className="lg:sticky lg:top-32">
              <BookingWidget property={property} />
              
              {/* Extra Info Card */}
              <LuxeAssuranceCard />
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default PropertyDetailsPage;

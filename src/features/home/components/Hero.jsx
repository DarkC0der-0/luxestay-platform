import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/shared/components/Button';
import Dropdown from '@/shared/components/Dropdown';
import { FiSearch, FiMapPin, FiChevronDown, FiHome, FiDollarSign } from 'react-icons/fi';
import apiClient from '@/shared/lib/axios';

const Hero = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [propertyType, setPropertyType] = useState('All Types');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  const [locations, setLocations] = useState([]);
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const propertyTypes = ['All Types', 'VILLA', 'RESIDENCE', 'PENTHOUSE', 'CHALET', 'APARTMENT'];

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data } = await apiClient.get('/properties/locations');
        if (data.success) {
          setLocations(data.locations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  const filteredLocations = useMemo(() => {
    if (!searchLocation.trim()) return [];
    return locations.filter(loc => 
      loc.toLowerCase().includes(searchLocation.toLowerCase())
    );
  }, [locations, searchLocation]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation.trim()) params.append('location', searchLocation);
    if (propertyType !== 'All Types') params.append('property_type', propertyType);
    if (priceRange.min) params.append('minPrice', priceRange.min);
    if (priceRange.max) params.append('maxPrice', priceRange.max);
    
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative h-screen min-h-[800px] w-full flex items-center justify-center overflow-visible">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/landing.jpg" 
          alt="Luxury Stay" 
          className="w-full h-full object-cover scale-105 animate-[ken-burns_20s_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/20 to-slate-950/80" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <div className="space-y-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 shadow-2xl animate-fade-in-up delay-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">The World&apos;s Finest Stays</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.8] filter drop-shadow-2xl animate-fade-in-up delay-200">
            OWN YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 py-2 block">MOMENT</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200/80 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg animate-fade-in-up delay-300">
            Curated architectural masterpieces handpicked for those who seek the extraordinary.
          </p>

          {/* Unified Search Dock */}
          <div className="max-w-5xl mx-auto mt-12 md:mt-20 p-2 bg-white/10 backdrop-blur-3xl rounded-[32px] lg:rounded-full border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] transition-all hover:bg-white/15 animate-fade-in-up delay-400">
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-0 relative">
              
              {/* Segment: Location */}
              <div 
                className={`flex-[1.8] w-full rounded-2xl lg:rounded-full transition-all duration-300 relative group py-4 px-8 cursor-text ${isLocDropdownOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <div className="text-left">
                  <span className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1 opacity-70 group-hover:opacity-100 transition-opacity">Location</span>
                  <div className="flex items-center text-white">
                    <FiMapPin className={`mr-2 transition-colors ${isLocDropdownOpen ? 'text-indigo-400' : 'text-white/40'}`} />
                    <input 
                      type="text" 
                      placeholder="Where to?" 
                      className="bg-transparent text-white font-black placeholder:text-white/20 focus:outline-none text-base w-full"
                      value={searchLocation}
                      onChange={(e) => {
                          const val = e.target.value;
                          setSearchLocation(val);
                          setIsLocDropdownOpen(val.trim().length > 0);
                      }}
                      onFocus={() => {
                        setIsTypeDropdownOpen(false);
                        setIsPriceDropdownOpen(false);
                      }}
                      autoComplete="off"
                    />
                  </div>
                </div>
                
                <Dropdown 
                  isOpen={isLocDropdownOpen} 
                  onClose={() => setIsLocDropdownOpen(false)}
                  width="w-full max-w-[calc(100vw-3rem)] md:w-[360px]"
                >
                  {searchLocation.trim() === '' ? (
                    <>
                      <div className="px-6 py-3 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Popular Destinations</div>
                      {locations.slice(0, 5).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSearchLocation(loc); setIsLocDropdownOpen(false); }}
                          className="w-full text-left px-6 py-4 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-3 group/item"
                        >
                          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover/item:bg-white transition-colors shadow-sm text-slate-300 group-hover/item:text-indigo-400">
                            <FiMapPin />
                          </div>
                          {loc}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="px-6 py-3 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Search Results</div>
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSearchLocation(loc); setIsLocDropdownOpen(false); }}
                            className="w-full text-left px-6 py-4 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-3 group/item"
                          >
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover/item:bg-white transition-colors shadow-sm text-slate-300 group-hover/item:text-indigo-400">
                              <FiMapPin />
                            </div>
                            {loc}
                          </button>
                        ))
                      ) : (
                        <div className="px-6 py-8 text-center">
                           <p className="text-sm font-bold text-slate-400">{`No matches for "${searchLocation}"`}</p>
                        </div>
                      )}
                    </>
                  )}
                </Dropdown>
              </div>

              <div className="hidden lg:block w-px h-10 bg-white/10" />

              {/* Segment: Type */}
              <div 
                className={`flex-1 w-full rounded-2xl lg:rounded-full transition-all duration-300 relative group py-4 px-8 cursor-pointer ${isTypeDropdownOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsTypeDropdownOpen(!isTypeDropdownOpen); 
                  setIsLocDropdownOpen(false); 
                  setIsPriceDropdownOpen(false); 
                }}
              >
                <div className="text-left">
                  <span className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1 opacity-70 group-hover:opacity-100 transition-opacity">Property Type</span>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center truncate">
                      <FiHome className={`mr-2 transition-colors ${isTypeDropdownOpen ? 'text-indigo-400' : 'text-white/40'}`} />
                      <span className="font-black text-base truncate">{propertyType}</span>
                    </div>
                    <FiChevronDown className={`ml-2 text-white/20 transition-transform duration-300 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                <Dropdown 
                  isOpen={isTypeDropdownOpen} 
                  onClose={() => setIsTypeDropdownOpen(false)}
                  width="w-full max-w-[calc(100vw-3rem)] md:min-w-[220px] md:w-auto"
                >
                  {propertyTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setPropertyType(type); 
                        setIsTypeDropdownOpen(false); 
                      }}
                      className={`w-full text-left px-6 py-4 text-sm font-bold transition-all ${propertyType === type ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {type}
                    </button>
                  ))}
                </Dropdown>
              </div>

              <div className="hidden lg:block w-px h-10 bg-white/10" />

              {/* Segment: Price */}
              <div 
                className={`flex-1 w-full rounded-2xl lg:rounded-full transition-all duration-300 relative group py-4 px-8 cursor-pointer ${isPriceDropdownOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsPriceDropdownOpen(!isPriceDropdownOpen); 
                  setIsLocDropdownOpen(false); 
                  setIsTypeDropdownOpen(false); 
                }}
              >
                <div className="text-left">
                  <span className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1 opacity-70 group-hover:opacity-100 transition-opacity">Price Range</span>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center truncate">
                      <FiDollarSign className={`mr-2 transition-colors ${isPriceDropdownOpen ? 'text-indigo-400' : 'text-white/40'}`} />
                      <span className="font-black text-base truncate">
                        {priceRange.min || priceRange.max ? `$${priceRange.min || 0}-$${priceRange.max || '∞'}` : 'Budget'}
                      </span>
                    </div>
                    <FiChevronDown className={`ml-2 text-white/20 transition-transform duration-300 ${isPriceDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                <Dropdown 
                  isOpen={isPriceDropdownOpen} 
                  onClose={() => setIsPriceDropdownOpen(false)}
                  width="w-full max-w-[calc(100vw-3rem)] md:w-[320px]"
                  align="right"
                >
                  <div className="p-4 space-y-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-slate-900 tracking-tight">Set Budget</span>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase">USD</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-900 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max</label>
                        <input 
                          type="number" 
                          placeholder="Any"
                          className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-900 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      size="md" 
                      className="w-full !rounded-2xl py-4" 
                      onClick={() => setIsPriceDropdownOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </Dropdown>
              </div>

              {/* Discover Button */}
              <div className="p-2 w-full lg:w-auto">
                <Button 
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full lg:w-16 h-16 lg:!p-0 !rounded-2xl lg:!rounded-full shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 group/btn"
                >
                  <div className="flex items-center justify-center">
                    <FiSearch className="text-2xl group-hover/btn:scale-110 transition-transform" />
                    <span className="lg:hidden ml-3 text-white">Discover Properties</span>
                  </div>
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

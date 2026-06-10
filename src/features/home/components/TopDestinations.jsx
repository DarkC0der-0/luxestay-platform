import React from 'react';
import { useNavigate } from 'react-router-dom';
import useScrollReveal from '@/shared/hooks/useScrollReveal';

const destinations = [
  {
    id: 1,
    name: 'Dubai',
    properties: '124 Properties',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop',
    colSpan: 'col-span-1 md:col-span-2 row-span-2'
  },
  {
    id: 2,
    name: 'Paris',
    properties: '86 Properties',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop',
    colSpan: 'col-span-1 md:col-span-1 row-span-1'
  },
  {
    id: 3,
    name: 'New York',
    properties: '210 Properties',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop',
    colSpan: 'col-span-1 md:col-span-1 row-span-1'
  },
  {
    id: 4,
    name: 'Tokyo',
    properties: '95 Properties',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1974&auto=format&fit=crop',
    colSpan: 'col-span-1 md:col-span-1 row-span-1'
  },
  {
    id: 5,
    name: 'Maldives',
    properties: '42 Properties',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1965&auto=format&fit=crop',
    colSpan: 'col-span-1 md:col-span-1 row-span-1'
  }
];

const TopDestinations = () => {
  const navigate = useNavigate();
  const [ref, isRevealed] = useScrollReveal();

  return (
    <section ref={ref} className={`px-6 py-12 md:py-20 max-w-7xl mx-auto opacity-0 ${isRevealed ? 'animate-fade-in-up' : ''}`}>
      <div className="mb-8 md:mb-12 text-left">
        <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">Explore the World</span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Top Destinations
        </h2>
        <p className="text-slate-500 mt-4 font-medium text-lg max-w-2xl">
          Discover our most popular locations worldwide, offering exclusive stays and unparalleled luxury.
        </p>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-2 gap-4 h-[1000px] md:h-[600px]">
        {destinations.map((dest) => (
          <div 
            key={dest.id} 
            className={`relative rounded-[30px] overflow-hidden group cursor-pointer ${dest.colSpan}`}
            onClick={() => navigate(`/properties?location=${dest.name}`)}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 z-10" />
            <img 
              src={dest.image} 
              alt={dest.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
            <div className="absolute bottom-0 left-0 p-8 z-20">
              <h3 className="text-white text-3xl font-black tracking-tight mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{dest.name}</h3>
              <p className="text-white/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{dest.properties}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopDestinations;

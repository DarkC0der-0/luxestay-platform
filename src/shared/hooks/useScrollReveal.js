import { useEffect, useRef, useState } from 'react';

export default function useScrollReveal(options = {}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    // If IntersectionObserver is not supported (e.g. Server Side Rendering or old browser)
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsRevealed(true);
        if (options.triggerOnce !== false && elementRef.current) {
          observer.unobserve(elementRef.current);
        }
      }
    }, {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px 0px -80px 0px',
    });

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [options.threshold, options.rootMargin, options.triggerOnce]);

  return [elementRef, isRevealed];
}

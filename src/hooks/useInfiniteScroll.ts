import { useEffect, useRef, useState, useCallback } from "react";

interface UseInfiniteScrollOptions {
  /** Callback a ejecutar cuando se detecta el final del scroll */
  onLoadMore: () => void;
  /** Si hay más datos para cargar */
  hasMore: boolean;
  /** Si está cargando actualmente */
  isLoading: boolean;
  /** Threshold para activar el callback (0-1, default: 0.1 = 10% del elemento visible) */
  threshold?: number;
  /** Root margin en px (default: "100px" = activar 100px antes del final) */
  rootMargin?: string;
}

/**
 * Hook para implementar infinite scroll usando IntersectionObserver
 * 
 * @example
 * ```tsx
 * const { observerRef } = useInfiniteScroll({
 *   onLoadMore: loadNextPage,
 *   hasMore: hasMoreData,
 *   isLoading: loading,
 * });
 * 
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={observerRef} />
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = "100px",
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      setIsIntersecting(entry.isIntersecting);
    },
    []
  );

  useEffect(() => {
    const currentObserverRef = observerRef.current;
    
    if (!currentObserverRef) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null, // viewport
      rootMargin,
      threshold,
    });

    observer.observe(currentObserverRef);

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [handleIntersection, rootMargin, threshold]);

  useEffect(() => {
    // Cuando el elemento observado es visible y hay más datos para cargar
    if (isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, isLoading, onLoadMore]);

  return { observerRef };
}







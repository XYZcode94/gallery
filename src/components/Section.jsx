import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const Section = () => {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // This ref generates a random starting point (1-50) only once per refresh.
  // It ensures the gallery feels "fresh" but remains sequential during scrolling.
  const randomOffset = useRef(Math.floor(Math.random() * 50) + 1);
  const observer = useRef();

  const getData = useCallback(async () => {
    if (!hasMore) return;

    try {
      setLoading(true);
      
      // Calculate the actual page to fetch based on our random starting point
      const targetPage = randomOffset.current + (page - 1);

      const res = await axios.get(
        `https://picsum.photos/v2/list?page=${targetPage}&limit=12`
      );

      if (res.data.length < 12) {
        setHasMore(false);
      }

      // Filter to prevent any accidental duplicate IDs
      setPhotos((prev) => {
        const newItems = res.data.filter(
          (newItem) => !prev.some((oldItem) => oldItem.id === newItem.id)
        );
        return [...prev, ...newItems];
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore]);

  // Trigger data fetch when page changes
  useEffect(() => {
    getData();
  }, [page, getData]);

  // Infinite scroll observer logic
  const lastImageRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navbar */}
      <nav className="w-full border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-md z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Photo<span className="text-blue-500">Gallery</span>
          </h1>
        </div>
      </nav>

      {/* Gallery Grid */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-8">
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {photos.map((photo, index) => {
            const isLast = photos.length === index + 1;

            return (
              <div
                ref={isLast ? lastImageRef : null}
                key={`${photo.id}-${index}`}
                className="relative group rounded-xl overflow-hidden bg-zinc-900 shadow-lg"
              >
                {/* Image Container */}
                <div className="w-full aspect-[4/5] overflow-hidden">
                  <img
                    src={photo.download_url}
                    alt={photo.author}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Info Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Captured by
                  </p>
                  <h3 className="text-sm sm:text-base font-bold truncate mb-3">
                    {photo.author}
                  </h3>
                  <a
                    href={photo.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white text-black text-center py-2 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors"
                  >
                    View Original
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading State / Skeleton */}
        {loading && (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="aspect-[4/5] bg-zinc-800 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}

        {/* End of Gallery Message */}
        {!hasMore && (
          <div className="text-center py-20">
            <p className="text-zinc-500 font-medium">You've reached the end of the collection.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Section;
import React, { useEffect, useRef, useState } from 'react';

interface ProductImageProps {
  scale: number; // Zoom scale
  size: string; // Image size (e.g., '320w', '640w', '1200w')
  src: string; // Base image URL to display
}

const ProductImage: React.FC<ProductImageProps> = ({ scale, size, src }) => {
  const imgRef = useRef<HTMLImageElement | null>(null); // Ref for the image
  const containerRef = useRef<HTMLDivElement | null>(null); // Ref for the image container
  const [showIcon, setShowIcon] = useState(false); // State to control the visibility of the search icon

  // Construct the full image URL based on the provided size
  const imageUrl = src.replace('{:size}', size);

  useEffect(() => {
    const imgElement = imgRef.current;
    const containerElement = containerRef.current;

    if (!imgElement || !containerElement) {
      console.error('Image or container reference is null');
      return; // Exit if imgElement or containerElement is not defined
    }

    const handleMouseOver = () => {
      imgElement.style.transition = 'transform 0.3s ease-in-out'; // Transition on hover
      imgElement.style.transform = `scale(${scale})`; // Scale the image
      setShowIcon(true); // Show the search icon when hovering
    };

    const handleMouseOut = () => {
      imgElement.style.transition = 'transform 0.3s ease-in-out'; // Transition on mouse out
      imgElement.style.transform = 'scale(1)'; // Reset scale
      setShowIcon(false); // Hide the search icon when not hovering
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = containerElement.getBoundingClientRect();
      const offsetX = ((e.clientX - left) / width) * 100; // Mouse position
      const offsetY = ((e.clientY - top) / height) * 100; // Mouse position
      imgElement.style.transformOrigin = `${offsetX}% ${offsetY}%`; // Set transform origin
      imgElement.style.transform = `scale(${scale})`; // Apply scale
    };

    containerElement.addEventListener('mouseover', handleMouseOver);
    containerElement.addEventListener('mouseout', handleMouseOut);
    containerElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      containerElement.removeEventListener('mouseover', handleMouseOver);
      containerElement.removeEventListener('mouseout', handleMouseOut);
      containerElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [scale]);

  return (
    <div
      className="product-img relative overflow-hidden w-full h-full float-left"
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'zoom-in', // Change cursor to magnifying glass when hovering
      }}
    >
      {/* Search Icon overlay */}
      {showIcon && (
        <div
          className="search-icon-overlay"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            borderRadius: '50%',
            padding: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Use a FontAwesome search icon or an SVG */}
          <i className="fas fa-search" style={{ color: 'white', fontSize: '24px' }} />
        </div>
      )}

      <img
        ref={imgRef}
        src={imageUrl} // Use the constructed image URL
        alt="Product"
        className="img1 object-fill absolute top-0 left-0 w-full h-full bg-center bg-cover bg-no-repeat transition-transform duration-500 ease-out"
        height={600} // Set the desired height
        width="original" // Set the desired width
        style={{ willChange: 'transform', transition: 'transform 0.3s ease-in-out' }} // Improve performance
      />
    </div>
  );
};

export default ProductImage;
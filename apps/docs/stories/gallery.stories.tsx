import {
  Gallery,
  GalleryContent,
  GalleryControls,
  GalleryImage,
  GalleryNextIndicator,
  GalleryPreviousIndicator,
  GalleryThumbnail,
  GalleryThumbnailItem,
  GalleryThumbnailList,
} from '@bigcommerce/components/gallery';
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

const meta: Meta<typeof Gallery> = {
  component: Gallery,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Gallery>;

const images = [
  { url: '/gallery-img-01.jpg', altText: 'Product image 1' },
  { url: '/gallery-img-02.jpg', altText: 'Product image 2' },
  { url: '/gallery-img-03.jpg', altText: 'Product image 3' },
  { url: '/gallery-img-01.jpg', altText: 'Product image 4' },
  { url: '/gallery-img-02.jpg', altText: 'Product image 5' },
  { url: '/gallery-img-03.jpg', altText: 'Product image 6' },
  { url: '/gallery-img-01.jpg', altText: 'Product image 7' },
  { url: '/gallery-img-02.jpg', altText: 'Product image 8' },
  { url: '/gallery-img-03.jpg', altText: 'Product image 9' },
  { url: '/gallery-img-01.jpg', altText: 'Product image 10' },
];

export const Example: Story = {
  render: () => (
    <Gallery defaultImageIndex={0} images={images}>
      <GalleryContent>
        <GalleryImage />
        <GalleryControls />
      </GalleryContent>
      <GalleryThumbnailList>
        {images.map((image, index) => (
          <GalleryThumbnailItem imageIndex={index} key={index}>
            <GalleryThumbnail alt={image.altText} src={image.url} />
          </GalleryThumbnailItem>
        ))}
      </GalleryThumbnailList>
    </Gallery>
  ),
};

export const CustomImageElement: Story = {
  render: () => (
    <Gallery defaultImageIndex={0} images={images}>
      <GalleryContent>
        <GalleryImage>
          {({ selectedImage }) =>
            selectedImage && <img alt={selectedImage.altText} src={selectedImage.url} />
          }
        </GalleryImage>
        <GalleryControls />
      </GalleryContent>
      <GalleryThumbnailList>
        {images.map((image, index) => (
          <GalleryThumbnailItem imageIndex={index} key={index}>
            <GalleryThumbnail alt={image.altText} src={image.url} />
          </GalleryThumbnailItem>
        ))}
      </GalleryThumbnailList>
    </Gallery>
  ),
};

export const CustomControls: Story = {
  render: () => (
    <Gallery defaultImageIndex={0} images={images}>
      <GalleryContent>
        <GalleryImage />
        <GalleryControls>
          <GalleryPreviousIndicator>
            <ArrowLeftCircle />
          </GalleryPreviousIndicator>
          <GalleryNextIndicator>
            <ArrowRightCircle />
          </GalleryNextIndicator>
        </GalleryControls>
      </GalleryContent>
      <GalleryThumbnailList>
        {images.map((image, index) => (
          <GalleryThumbnailItem imageIndex={index} key={index}>
            <GalleryThumbnail alt={image.altText} src={image.url} />
          </GalleryThumbnailItem>
        ))}
      </GalleryThumbnailList>
    </Gallery>
  ),
};

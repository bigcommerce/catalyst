import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNextIndicator,
  CarouselPagination,
  CarouselPaginationTab,
  CarouselPreviousIndicator,
} from '@bigcommerce/components/carousel';
import {
  ProductCard,
  ProductCardBadge,
  ProductCardImage,
  ProductCardInfo,
  ProductCardInfoBrandName,
  ProductCardInfoPrice,
  ProductCardInfoProductName,
} from '@bigcommerce/components/product-card';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Carousel> = {
  component: Carousel,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Carousel>;

export const MultipleSlides: Story = {
  render: () => (
    <Carousel aria-labelledby="title">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black lg:text-4xl" id="title">
          Related Products
        </h2>
        <span className="no-wrap flex">
          <CarouselPreviousIndicator />
          <CarouselNextIndicator />
        </span>
      </div>

      <CarouselContent>
        <CarouselItem aria-label="1 of 2" id="slide-1" index={0}>
          <ProductCard>
            <ProductCardImage>
              <div className="h-[180px] w-full bg-gray-200" />
            </ProductCardImage>
            <ProductCardBadge>On sale</ProductCardBadge>
            <ProductCardInfo>
              <ProductCardInfoBrandName>Nike</ProductCardInfoBrandName>
              <ProductCardInfoProductName>
                <a href="/">Air Jordans</a>
              </ProductCardInfoProductName>
              <ProductCardInfoPrice>$200</ProductCardInfoPrice>
            </ProductCardInfo>
          </ProductCard>
          <ProductCard>
            <ProductCardImage>
              <div className="h-[180px] w-full bg-gray-200" />
            </ProductCardImage>
            <ProductCardBadge>On sale</ProductCardBadge>
            <ProductCardInfo>
              <ProductCardInfoBrandName>Nike</ProductCardInfoBrandName>
              <ProductCardInfoProductName>
                <a href="/">Air Jordans</a>
              </ProductCardInfoProductName>
              <ProductCardInfoPrice>$200</ProductCardInfoPrice>
            </ProductCardInfo>
          </ProductCard>
          <ProductCard>
            <ProductCardImage>
              <div className="h-[180px] w-full bg-gray-200" />
            </ProductCardImage>
            <ProductCardBadge>On sale</ProductCardBadge>
            <ProductCardInfo>
              <ProductCardInfoBrandName>Nike</ProductCardInfoBrandName>
              <ProductCardInfoProductName>
                <a href="/">Air Jordans</a>
              </ProductCardInfoProductName>
              <ProductCardInfoPrice>$200</ProductCardInfoPrice>
            </ProductCardInfo>
          </ProductCard>
          <ProductCard>
            <ProductCardImage>
              <div className="h-[180px] w-full bg-gray-200" />
            </ProductCardImage>
            <ProductCardBadge>On sale</ProductCardBadge>
            <ProductCardInfo>
              <ProductCardInfoBrandName>Nike</ProductCardInfoBrandName>
              <ProductCardInfoProductName>
                <a href="/">Air Jordans</a>
              </ProductCardInfoProductName>
              <ProductCardInfoPrice>$200</ProductCardInfoPrice>
            </ProductCardInfo>
          </ProductCard>
        </CarouselItem>
        <CarouselItem aria-label="2 of 2" id="slide-2" index={1}>
          <ProductCard>
            <ProductCardImage>
              <div className="h-[180px] w-full bg-gray-200" />
            </ProductCardImage>
            <ProductCardBadge>On sale</ProductCardBadge>
            <ProductCardInfo>
              <ProductCardInfoBrandName>Nike</ProductCardInfoBrandName>
              <ProductCardInfoProductName>
                <a href="/">Air Jordans</a>
              </ProductCardInfoProductName>
              <ProductCardInfoPrice>$200</ProductCardInfoPrice>
            </ProductCardInfo>
          </ProductCard>
          <ProductCard>
            <ProductCardImage>
              <div className="h-[180px] w-full bg-gray-200" />
            </ProductCardImage>
            <ProductCardBadge>On sale</ProductCardBadge>
            <ProductCardInfo>
              <ProductCardInfoBrandName>Nike</ProductCardInfoBrandName>
              <ProductCardInfoProductName>
                <a href="/">Air Jordans</a>
              </ProductCardInfoProductName>
              <ProductCardInfoPrice>$200</ProductCardInfoPrice>
            </ProductCardInfo>
          </ProductCard>
          <ProductCard>
            <ProductCardImage>
              <div className="h-[180px] w-full bg-gray-200" />
            </ProductCardImage>
            <ProductCardBadge>On sale</ProductCardBadge>
            <ProductCardInfo>
              <ProductCardInfoBrandName>Nike</ProductCardInfoBrandName>
              <ProductCardInfoProductName>
                <a href="/">Air Jordans</a>
              </ProductCardInfoProductName>
              <ProductCardInfoPrice>$200</ProductCardInfoPrice>
            </ProductCardInfo>
          </ProductCard>
        </CarouselItem>
      </CarouselContent>
      <CarouselPagination>
        <CarouselPaginationTab aria-controls="slide-1" aria-label="Go to slide 1" index={0} />
        <CarouselPaginationTab aria-controls="slide-2" aria-label="Go to slide 2" index={1} />
      </CarouselPagination>
    </Carousel>
  ),
};

export const SingleSlide: Story = {
  render: () => (
    <Carousel aria-labelledby="title">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black lg:text-4xl" id="title">
          Related Products
        </h2>
        <span className="no-wrap flex">
          <CarouselPreviousIndicator />
          <CarouselNextIndicator />
        </span>
      </div>

      <CarouselContent>
        <CarouselItem aria-label="1 of 1" index={0}>
          <ProductCard>
            <ProductCardImage>
              <div className="h-[180px] w-full bg-gray-200" />
            </ProductCardImage>
            <ProductCardBadge>On sale</ProductCardBadge>
            <ProductCardInfo>
              <ProductCardInfoBrandName>Nike</ProductCardInfoBrandName>
              <ProductCardInfoProductName>
                <a href="/">Air Jordans</a>
              </ProductCardInfoProductName>
              <ProductCardInfoPrice>$200</ProductCardInfoPrice>
            </ProductCardInfo>
          </ProductCard>
          <ProductCard>
            <ProductCardImage>
              <div className="h-[180px] w-full bg-gray-200" />
            </ProductCardImage>
            <ProductCardBadge>On sale</ProductCardBadge>
            <ProductCardInfo>
              <ProductCardInfoBrandName>Nike</ProductCardInfoBrandName>
              <ProductCardInfoProductName>
                <a href="/">Air Jordans</a>
              </ProductCardInfoProductName>
              <ProductCardInfoPrice>$200</ProductCardInfoPrice>
            </ProductCardInfo>
          </ProductCard>
          <ProductCard>
            <ProductCardImage>
              <div className="h-[180px] w-full bg-gray-200" />
            </ProductCardImage>
            <ProductCardBadge>On sale</ProductCardBadge>
            <ProductCardInfo>
              <ProductCardInfoBrandName>Nike</ProductCardInfoBrandName>
              <ProductCardInfoProductName>
                <a href="/">Air Jordans</a>
              </ProductCardInfoProductName>
              <ProductCardInfoPrice>$200</ProductCardInfoPrice>
            </ProductCardInfo>
          </ProductCard>
        </CarouselItem>
      </CarouselContent>
      <CarouselPagination>
        <CarouselPaginationTab aria-label="Go to slide 1" index={0} />
      </CarouselPagination>
    </Carousel>
  ),
};

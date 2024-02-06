import {
  Carousel,
  CarouselContent,
  CarouselNextIndicator,
  CarouselPagination,
  CarouselPaginationTab,
  CarouselPreviousIndicator,
  CarouselSlide,
} from '@bigcommerce/components/Carousel';
import {
  ProductCard,
  ProductCardBadge,
  ProductCardImage,
  ProductCardInfo,
  ProductCardInfoBrandName,
  ProductCardInfoPrice,
  ProductCardInfoProductName,
} from '@bigcommerce/components/ProductCard';
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
        <h2 className="text-h3" id="title">
          Related Products
        </h2>
        <span className="no-wrap flex">
          <CarouselPreviousIndicator />
          <CarouselNextIndicator />
        </span>
      </div>

      <CarouselContent>
        <CarouselSlide aria-label="1 of 2" id="slide-1" index={0}>
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
        </CarouselSlide>
        <CarouselSlide aria-label="2 of 2" id="slide-2" index={1}>
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
        </CarouselSlide>
      </CarouselContent>
      <CarouselPagination>
        {({ selectedIndex, scrollTo }) => (
          <>
            <CarouselPaginationTab
              aria-controls="slide-1"
              aria-label="Slide 1"
              isSelected={selectedIndex === 0}
              onClick={() => scrollTo(0)}
            />
            <CarouselPaginationTab
              aria-controls="slide-2"
              aria-label="Slide 2"
              isSelected={selectedIndex === 1}
              onClick={() => scrollTo(1)}
            />
          </>
        )}
      </CarouselPagination>
    </Carousel>
  ),
};

export const SingleSlide: Story = {
  render: () => (
    <Carousel aria-labelledby="title">
      <div className="flex items-center justify-between">
        <h2 className="text-h3" id="title">
          Related Products
        </h2>
        <span className="no-wrap flex">
          <CarouselPreviousIndicator />
          <CarouselNextIndicator />
        </span>
      </div>

      <CarouselContent>
        <CarouselSlide aria-label="1 of 1" index={0}>
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
        </CarouselSlide>
      </CarouselContent>
      <CarouselPagination>
        {({ selectedIndex, scrollTo }) => (
          <CarouselPaginationTab
            aria-label="Slide 1"
            isSelected={selectedIndex === 0}
            onClick={() => scrollTo(0)}
          />
        )}
      </CarouselPagination>
    </Carousel>
  ),
};

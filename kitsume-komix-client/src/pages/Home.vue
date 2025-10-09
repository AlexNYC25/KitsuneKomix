<script setup lang="ts">
import { ref } from 'vue';
import { Galleria } from 'primevue';
import Carousel from 'primevue/carousel';

const responsiveOptions = ref([
    {
        breakpoint: '991px',
        numVisible: 4
    },
    {
        breakpoint: '767px',
        numVisible: 3
    },
    {
        breakpoint: '575px',
        numVisible: 1
    }
]);
const images = ref(
  [
    {
        itemImageSrc: 'https://placehold.co/1600x400/blue/white',
        thumbnailImageSrc: 'https://placehold.co/600x400/blue/white',
        alt: 'Description for Image 1',
        title: 'Title 1'
    },
    {
        itemImageSrc: 'https://placehold.co/1600x400/orange/white',
        thumbnailImageSrc: 'https://placehold.co/600x400/orange/white',
        alt: 'Description for Image 2',
        title: 'Title 2'
    },
    {
        itemImageSrc: 'https://placehold.co/1600x400/yellow/white',
        thumbnailImageSrc: 'https://placehold.co/600x400/yellow/white',
        alt: 'Description for Image 3',
        title: 'Title 3'
    },
    {
        itemImageSrc: 'https://placehold.co/1600x400/green/white',
        thumbnailImageSrc: 'https://placehold.co/600x400/green/white',
        alt: 'Description for Image 4',
        title: 'Title 4'
    },
    {
        itemImageSrc: 'https://placehold.co/1600x400/black/white',
        thumbnailImageSrc: 'https://placehold.co/600x400/black/white',
        alt: 'Description for Image 5',
        title: 'Title 5'
    },
    {
        itemImageSrc: 'https://placehold.co/1600x400/purple/white',
        thumbnailImageSrc: 'https://placehold.co/600x400/purple/white',
        alt: 'Description for Image 6',
        title: 'Title 6'
    }
  ]
)

const demoCarouselResponsiveOptions = ref([
    {
        breakpoint: '991px',
        numVisible: 4,
        numScroll: 1
    },
    {
        breakpoint: '767px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
]);
const demoCarouselItems = ref([
    { name: 'Product 1', category: 'Category 1', price: 10.00 },
    { name: 'Product 2', category: 'Category 2', price: 20.00 },
    { name: 'Product 3', category: 'Category 3', price: 30.00 },
    { name: 'Product 4', category: 'Category 4', price: 40.00 },
    { name: 'Product 5', category: 'Category 5', price: 50.00 },
    { name: 'Product 6', category: 'Category 6', price: 60.00 },
    { name: 'Product 7', category: 'Category 7', price: 70.00 },
    { name: 'Product 8', category: 'Category 8', price: 80.00 },
    { name: 'Product 9', category: 'Category 9', price: 90.00 },
    { name: 'Product 10', category: 'Category 10', price: 100.00 }
])

</script>

<template>
    <div class="home flex flex-col w-full overflow-auto p-4">
    <div class="card w-full">
        <Galleria :value="images" :responsiveOptions="responsiveOptions" :numVisible="5" :circular="false"
            :showItemNavigators="true" :showThumbnails="false" :showItemNavigatorsOnHover="true" :showIndicators="true">
            <template #item="slotProps">
                <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" />
            </template>
            <template #thumbnail="slotProps">
                    <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" />
            </template>
        </Galleria>
    </div>

    <div class="card w-full">
      <Carousel :value="demoCarouselItems" :numVisible="4" :numScroll="1" :circular="true" :autoplayInterval="3000"
          :responsiveOptions="demoCarouselResponsiveOptions">
          <template #item="slotProps">
              <div class="product-item">
                  <div class="product-item-content">
                      <div class="mb-3">
                          <img src="https://placehold.co/400x400/blue/white" :alt="slotProps.data.name" class="product-image" />
                      </div>
                      <div>
                          <h4 class="mb-1">{{ slotProps.data.name }}</h4>
                          <h6 class="mt-0 mb-3">{{ slotProps.data.category }}</h6>
                          <span class="product-badge status-instock">In Stock</span>
                          <span class="product-price">$ {{ slotProps.data.price }}</span>
                      </div>
                  </div>
              </div>
          </template>
      </Carousel>
    </div>

    <div class="card w-full">
      <Carousel :value="demoCarouselItems" :numVisible="4" :numScroll="1" :circular="true" :autoplayInterval="3000"
          :responsiveOptions="demoCarouselResponsiveOptions">
          <template #item="slotProps">
              <div class="product-item">
                  <div class="product-item-content">
                      <div class="mb-3">
                          <img src="https://placehold.co/400x400/purple/white" :alt="slotProps.data.name" class="product-image" />
                      </div>
                      <div>
                          <h4 class="mb-1">{{ slotProps.data.name }}</h4>
                          <h6 class="mt-0 mb-3">{{ slotProps.data.category }}</h6>
                          <span class="product-badge status-instock">In Stock</span>
                          <span class="product-price">$ {{ slotProps.data.price }}</span>
                      </div>
                  </div>
              </div>
          </template>
      </Carousel>
    </div>

    <div class="card w-full">
      <Carousel :value="demoCarouselItems" :numVisible="4" :numScroll="1" :circular="true" :autoplayInterval="3000"
          :responsiveOptions="demoCarouselResponsiveOptions">
          <template #item="slotProps">
              <div class="product-item">
                  <div class="product-item-content">
                      <div class="mb-3">
                          <img src="https://placehold.co/400x400/orange/white" :alt="slotProps.data.name" class="product-image" />
                      </div>
                      <div>
                          <h4 class="mb-1">{{ slotProps.data.name }}</h4>
                          <h6 class="mt-0 mb-3">{{ slotProps.data.category }}</h6>
                          <span class="product-badge status-instock">In Stock</span>
                          <span class="product-price">$ {{ slotProps.data.price }}</span>
                      </div>
                  </div>
              </div>
          </template>
      </Carousel>
    </div>
  </div>
</template>
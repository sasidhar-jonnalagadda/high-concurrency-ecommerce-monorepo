import { BaseEntity, PaginatedResponse } from './common';

export interface ProductResponse extends BaseEntity {
  name: string;
  slug: string;
  image: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  countInStock: number;
  rating: number;
  numReviews: number;
  isArchived: boolean;
  reviews?: ReviewResponse[];
}

export interface ReviewResponse extends BaseEntity {
  rating: number;
  comment: string;
  userId: string;
  userName?: string;
  user?: {
    id: string;
    name: string;
  };
  productId: string;
}

export type ProductListResponse = PaginatedResponse<ProductResponse>;


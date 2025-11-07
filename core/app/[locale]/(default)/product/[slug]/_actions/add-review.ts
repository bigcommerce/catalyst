'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { client } from '~/client';
import { graphql } from '~/client/graphql';

const AddProductReviewMutation = graphql(`
  mutation AddProductReview($input: AddProductReviewInput!, $reCaptchaV2: ReCaptchaV2Input) {
    catalog {
      addProductReview(input: $input, reCaptchaV2: $reCaptchaV2) {
        errors {
          __typename
          ... on CustomerAlreadyReviewedProductError {
            message
          }
          ... on NotAuthorizedToAddProductReviewError {
            message
          }
          ... on ProductIdNotFoundError {
            message
          }
          ... on InvalidInputFieldsError {
            message
          }
          ... on UnexpectedAddReviewError {
            message
          }
        }
      }
    }
  }
`);

export interface AddReviewInput {
  productEntityId: number;
  author: string;
  title: string;
  text: string;
  rating: number;
  email?: string;
  reCaptchaToken?: string;
}

export interface AddReviewResult {
  status: 'success' | 'error';
  message: string;
}

export async function addReview(input: AddReviewInput): Promise<AddReviewResult> {
  const t = await getTranslations('Product.Reviews.Form');

  console.log('🔵 addReview called with input:', {
    productEntityId: input.productEntityId,
    author: input.author,
    rating: input.rating,
    hasEmail: !!input.email,
  });

  try {
    // Validate required fields
    if (!input.author || input.author.trim().length === 0) {
      return {
        status: 'error',
        message: t('errors.authorRequired'),
      };
    }

    if (!input.title || input.title.trim().length === 0) {
      return {
        status: 'error',
        message: t('errors.titleRequired'),
      };
    }

    if (!input.text || input.text.trim().length === 0) {
      return {
        status: 'error',
        message: t('errors.textRequired'),
      };
    }

    if (input.rating < 1 || input.rating > 5) {
      return {
        status: 'error',
        message: t('errors.ratingRequired'),
      };
    }

    if (!input.email || input.email.trim().length === 0) {
      return {
        status: 'error',
        message: t('errors.emailRequired'),
      };
    }

    // Build mutation variables
    const variables = {
      input: {
        productEntityId: input.productEntityId,
        review: {
          author: input.author.trim(),
          title: input.title.trim(),
          text: input.text.trim(),
          rating: input.rating,
          ...(input.email && { email: input.email.trim() }),
        },
      },
      ...(input.reCaptchaToken && {
        reCaptchaV2: {
          token: input.reCaptchaToken,
        },
      }),
    };

    // Execute mutation
    console.log('🔵 Calling GraphQL mutation with variables:', JSON.stringify(variables, null, 2));

    const response = await client.fetch({
      document: AddProductReviewMutation,
      variables,
    });

    console.log('🔵 GraphQL response:', JSON.stringify(response, null, 2));

    const result = response.data.catalog.addProductReview;

    // Check for errors
    if (result.errors && result.errors.length > 0) {
      const error = result.errors[0];

      if (!error) {
        return {
          status: 'error',
          message: t('errors.unknown'),
        };
      }

      // Handle specific error types
      switch (error.__typename) {
        case 'CustomerAlreadyReviewedProductError':
          return {
            status: 'error',
            message: t('errors.alreadyReviewed'),
          };

        case 'NotAuthorizedToAddProductReviewError':
          return {
            status: 'error',
            message: t('errors.notAuthorized'),
          };

        case 'ProductIdNotFoundError':
          return {
            status: 'error',
            message: t('errors.productNotFound'),
          };

        case 'InvalidInputFieldsError':
          return {
            status: 'error',
            message: error.message || t('errors.invalidFields'),
          };

        default:
          return {
            status: 'error',
            message: error.message || t('errors.unknown'),
          };
      }
    }

    // Success - revalidate the product page to show the new review
    revalidatePath(`/product/[slug]`, 'page');

    return {
      status: 'success',
      message: t('success'),
    };
  } catch (error) {
    console.error('🔴 Error submitting review:', error);

    // Handle BigCommerceGQLError specifically
    if (error instanceof BigCommerceGQLError) {
      const gqlErrors = error.errors;

      console.error('🔴 BigCommerce GraphQL Error:', gqlErrors);

      if (gqlErrors && gqlErrors.length > 0) {
        const firstError = gqlErrors[0];

        if (firstError?.message) {
          // Return the specific error message from BigCommerce
          return {
            status: 'error',
            message: firstError.message,
          };
        }
      }
    }

    // Log more details about the error
    if (error instanceof Error) {
      console.error('🔴 Error message:', error.message);
      console.error('🔴 Error stack:', error.stack);
    }

    return {
      status: 'error',
      message: t('errors.network'),
    };
  }
}

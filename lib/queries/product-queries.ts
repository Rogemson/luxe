export const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
            }
          }
          collections(first: 1) {
            edges {
              node {
                title
              }
            }
          }
          featuredImage {
            url
            altText
          }
          availableForSale
          productType
          tags
        }
      }
    }
  }
`

export const GET_PRODUCT_BY_HANDLE_QUERY = `
  query getProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      productType
      tags
      availableForSale
      featuredImage {
        url
        altText
      }
      collections(first: 1) {
        edges {
          node {
            title
          }
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      options(first: 5) {
        id
        name
        values
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            sku
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`

export const GET_RELATED_PRODUCTS_QUERY = `
  query getRelatedProducts($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      handle
      title
      description
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        url
        altText
      }
      availableForSale
      productType
      tags
    }
  }
`

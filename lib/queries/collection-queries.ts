// GraphQL Queries
export const GET_COLLECTIONS_QUERY = `
  query GetCollections {
    collections(first: 20) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
          }
          products(first: 20) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`

export const GET_COLLECTION_BY_HANDLE_QUERY = `
  query GetCollectionByHandle($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
      }
      products(first: 50) {
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
                currencyCode
              }
            }
            featuredImage {
              url
              altText
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            availableForSale
            productType
            tags
          }
        }
      }
    }
  }
`
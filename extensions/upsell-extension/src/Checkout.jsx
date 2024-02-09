import React, { useEffect, useState } from "react";
import {
  useApi,
  reactExtension,
  Text,
  Divider,
  Image,
  Heading,
  Button,
  InlineLayout,
  BlockStack,
  useCartLines,
  useApplyCartLinesChange,
} from "@shopify/ui-extensions-react/checkout";
export default reactExtension("purchase.checkout.block.render", () => <Extension />);

const variantId = "gid://shopify/ProductVariant/44686337507566";

function Extension() {
  const { query } = useApi();
  const lines = useCartLines();
  const applyCartLinesChange = useApplyCartLinesChange();
  const [adding, setAdding] = useState(false);
  const [variantData, setVariantData] = useState({
    title: "",
    price: {
      amount: "",
      currencyCode: ""
    },
    image: {
      url: "",
      altText: ""
    },
    product: {
      title: "",
      featuredImage: {
        url: "",
        altText: ""
      }
    }
  });
  async function handleAddToCart(variantId) {
    setAdding(true);
    const result = await applyCartLinesChange({
      type: 'addCartLine',
      merchandiseId: variantId,
      quantity: 1,
    });
    setAdding(false);
    if (result.type === 'error') {
      // setShowError(true);
      console.error(result.message);
    }
  }
  useEffect(() => {
    async function getVariantData() {
      const queryResult = await query(`{
        node(id: "${variantId}"){
          ... on ProductVariant {
            title
            price {
                amount
                currencyCode
            }
            image {
              url
              altText
            }
            product {
              title
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }`);
      
      if (queryResult.data) {
        setVariantData({
          title: queryResult.data.node.title,
          price: queryResult.data.node.price,
          image: queryResult.data.node.image,
          product: queryResult.data.node.product
        });
      }
    }
    getVariantData();
  }, []);

  if (!variantData) {
    return null;
  }

  const cartLineId = lines.find(
    (cartLine) => cartLine.merchandise.id === variantId
  )?.id;

  if (cartLineId) {
    return null;
  }
  console.log(variantData); // Check the variantData object

  return (
    <BlockStack spacing='loose'>
      <Divider />
      <Heading level={2}>You might also like</Heading>
      <BlockStack spacing='loose'>
        <InlineLayout
          spacing='base'
          columns={[64, 'fill', 'auto']}
          blockAlignment='center'
        >
          <Image
            border='base'
            borderWidth='base'
            borderRadius='loose'
            source={variantData.image.url}
            description={variantData.image.altText}
            aspectRatio={1}
          />
          <BlockStack spacing='none'>
            <Text size='medium' emphasis='strong'>
              {variantData.product.title}
            </Text>
            <Text appearance='subdued'>{variantData.price.amount}</Text>
          </BlockStack>
          <Button
            kind='secondary'
            accessibilityLabel={`Add to cart`}
            onPress={() => handleAddToCart(variantId)}
          >
            Add
          </Button>
        </InlineLayout>
      </BlockStack>
    </BlockStack>
  );
}


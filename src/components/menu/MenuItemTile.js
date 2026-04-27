import AddToCartButton from "@/components/menu/AddToCartButton";
import Image from "next/image";

export default function MenuItemTile({ onAddToCart, ...item }) {
  const { image, name, description, basePrice, sizes, extraIngredientPrices } =
    item;
    const hasSizesOrExtras =
    (sizes?.length ?? 0) > 0 || (extraIngredientPrices?.length ?? 0) > 0;
  return (
    <div
      className="bg-gray-200 p-4 rounded-lg text-center hover:bg-white
    hover:shadow-md hover:shadow-black/25 transition-all font-josefin h-full flex flex-col"
    >
      <div className="text-center">
        <Image
          loading="lazy"
          src={image}
          width={280}
          height={200}
          className="max-h-44 block mx-auto"
          alt="pizza_item"
        />
      </div>
      <h4 className="font-semibold text-xl my-3">{name}</h4>
      <div className="flex-1 min-h-0 overflow-hidden">
        <p className="text-gray-500 text-sm line-clamp-3">{description}</p>
      </div>
      <AddToCartButton
        hasSizesOrExtras={hasSizesOrExtras}
        onClick={onAddToCart}
        basePrice={basePrice}
        image={image}
      />
    </div>
  );
}

import Image from "next/image";
import Trash from "@/components/icons/Trash";
import { cartProductPrice } from "../AppContext";

export default function CartProduct({ product, index, onRemove }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 border-b py-4">
      <div className="w-16 sm:w-24 shrink-0">
        <Image src={product.image} alt="product" width={240} height={240} />
      </div>
      <div className="grow">
        <h3 className="font-semibold">{product.name}</h3>
        {product.size && (
          <div className="text-sm">
            Size: <span>{product.size.name}</span>
          </div>
        )}
        {product.extras?.length > 0 && (
          <div className="text-sm text-gray-500">
            {product.extras.map((extra) => (
              <div key={extra.name}>
                {extra.name} ${extra.price}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="text-lg font-semibold">${cartProductPrice(product)}</div>
      {!!onRemove && (
        <div className="ml-2">
          <button type="button" onClick={() => onRemove(index)} className="p-2">
            <Trash />
          </button>
        </div>
      )}
    </div>
  );
}

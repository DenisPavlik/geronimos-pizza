"use client";
import { CartContext, cartProductPrice } from "@/components/AppContext";
import SectionHeaders from "@/components/layout/SectionHeaders";
import { useContext, useEffect, useState } from "react";
import AddressInputs from "@/components/layout/AddressInputs";
import { useProfile } from "@/components/UseProfile";
import toast from 'react-hot-toast'
import CartProduct from '@/components/menu/CartProduct'

export default function CartPage() {
  const { cartProducts, removeCartProduct } = useContext(CartContext);
  const [address, setAddress] = useState({});
  const { data: profileData } = useProfile();

  function handleAddressChange(propName, value) {
    setAddress((prevAddress) => ({ ...prevAddress, [propName]: value }));
  }

  useEffect(()=>{
    if (typeof window !== 'undefined') {
      if (window.location.href.includes('canceled=1')) {
        toast.error("Payment failed 😔")
      }
    }
  }, [])

  useEffect(() => {
    const checkParam =
      profileData?.phone ||
      profileData?.streetAddress ||
      profileData?.postalCode ||
      profileData?.city ||
      profileData?.country;
    if (checkParam) {
      const { phone, streetAddress, postalCode, city, country } = profileData;
      const addressFromProfile = {
        phone,
        streetAddress,
        postalCode,
        city,
        country,
      };
      setAddress(addressFromProfile);
    }
  }, [profileData]);

  let subtotal = 0;
  for (const p of cartProducts) {
    subtotal += cartProductPrice(p);
  }

  async function proceedToCheckout(ev) {
    ev.preventDefault();
    const promise = fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, cartProducts }),
    }).then(async (response) => {
      if (!response.ok) throw new Error("Checkout failed");
      window.location = await response.json();
    });

    await toast.promise(promise, {
      loading: "Preparing your order...",
      success: "Redirecting to payment...",
      error: "Something went wrong... Please try again later",
    });
  }

  if (cartProducts?.length === 0) {
    return (
      <section className="mt-8 text-center">
        <SectionHeaders mainHeader="Cart" />
        <p className="mt-4 font-josefin">Your shopping cart is empty 😔</p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="text-center">
        <SectionHeaders mainHeader="Cart" />
      </div>
      <div className="grid gap-8 md:grid-cols-2 grid-cols-1 mt-8">
        <div>
          {cartProducts?.length === 0 && <div>No products in your cart</div>}
          {cartProducts?.length > 0 &&
            cartProducts.map((product, index) => (
              <CartProduct key={index} product={product} index={index} onRemove={removeCartProduct} />
            ))}
          <div className="py-2 pr-16 flex justify-end items-center">
            <div className="text-gray-500">
              Subtotal:
              <br />
              Delivery:
              <br />
              Total:
            </div>
            <div className="font-semibold pl-2 text-right">
              ${subtotal}
              <br />
              $5
              <br />${subtotal + 5}
            </div>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-josefin text-xl font-semibold mb-4 text-gray-700">Checkout</h2>
          <form onSubmit={proceedToCheckout}>
            <AddressInputs
              addressProps={address}
              setAddressProp={handleAddressChange}
            />
            <button type="submit">Pay ${subtotal + 5}</button>
          </form>
        </div>
      </div>
    </section>
  );
}

"use client";
import SectionHeaders from "@/components/layout/SectionHeaders";
import MenuItem from "@/components/menu/MenuItem";
import Preloader from "@/components/Preloader";
import FadeIn from "@/components/layout/FadeIn";
import { useEffect, useState } from "react";

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  useEffect(() => {
    fetch("/api/categories").then((res) => {
      res.json().then((categories) => setCategories(categories));
    });
    fetch("/api/menu-items").then((res) => {
      res.json().then((menuItems) => setMenuItems(menuItems));
    });
  }, []);
  return (
    <section className="mt-8">
      {categories?.length > 0 ?
        categories.map((c) => (
          <div key={c._id}>
            <div className="text-center">
              <SectionHeaders mainHeader={c.name} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 mb-12">
              {menuItems?.length > 0 ?
                menuItems
                  .filter((item) => item.category === c._id)
                  .map((item, index) => (
                    <FadeIn key={item._id} delay={index * 80} className="h-full">
                      <MenuItem {...item} />
                    </FadeIn>
                  )) : <Preloader />}
            </div>
          </div>
        )) : <Preloader />}
    </section>
  );
}

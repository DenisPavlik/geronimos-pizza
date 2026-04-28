import SectionHeaders from "@/components/layout/SectionHeaders";
import FadeIn from "@/components/layout/FadeIn";
import Image from "next/image";

export default function AboutPage() {
  return (
    <section>
      <div className="relative mt-6">
        <div className="absolute inset-0 z-[-1]">
          <Image
            src="/bg_about.png"
            alt="bg"
            fill
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <div
          className="relative flex flex-col md:flex-row md:gap-4 md:min-h-[500px] md:max-h-[500px]"
        >
          <div className="md:w-[50%] p-2 px-8 md:px-8 lg:px-24 pt-14 md:pt-24 lg:pt-32 pb-10 text-zinc-100">
            <FadeIn delay={0}>
              <h1 className="font-lilita text-6xl leading-12">
                GERONIMO&apos;S <br />
                PIZZA HISTORY
              </h1>
            </FadeIn>
            <FadeIn delay={150}>
              <p className="font-josefin text-gray-100 font-normal text-xl mt-4">
                Since 1985, our all-you-can-eat pizza buffet has been a family
                favorite. Get to know our story and brand history.
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={100} className="md:w-[50%]">
            <Image
              src="/restaurant.png"
              width={400}
              height={400}
              alt="restaurant"
              className="object-cover w-full h-full"
            />
          </FadeIn>
        </div>
      </div>

      <div className="text-clip mt-12">
        <div className="text-center pb-10">
          <SectionHeaders
            subHeader={"Our story"}
            mainHeader={"Decades of Dough, Cheese & Love"}
          />
        </div>
        <div className="flex flex-col-reverse lg:flex-row gap-8">
          <div
            className="font-josefin text-gray-500 text-xl flex
          flex-col gap-4 lg:w-[50%]"
          >
            <FadeIn delay={0}>
              <p>
                In 1985, Geronimo&apos;s Pizza fired up its very first oven in the
                heart of Plano, Texas — and just like that, the original home of
                endless pizza, pasta, salad, and desserts was born. For nearly
                four decades, we&apos;ve been passionate about creating fun,
                welcoming spaces where families and friends can gather, laugh, and
                enjoy all their favorites at one unbeatable price.
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <p>
                As times changed, so did we. Geronimo&apos;s Pizza embraced the
                needs of our guests by introducing online ordering, fresh new menu
                items, and convenient takeout and delivery options. Now, fans
                across the country can bring The Best Pizza Value Anywhere™
                (TBPVA™) straight to their homes — or wherever the craving
                strikes.
              </p>
            </FadeIn>
            <FadeIn delay={200}>
              <p>
                Today, Geronimo&apos;s Pizza proudly serves up delicious
                experiences in over 300 locations across 30+ states. We&apos;ve
                been recognized by CNN Money as the #1 Casual Dining Pizza Chain
                for Value, named one of the Top 2 Most Kid-Friendly Chains by
                Technomic, and listed among the Top 200 Restaurant Chains by
                Nation&apos;s Restaurant News.
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <p>
                Join us, and taste why{" "}
                <span className="text-primary">Geronimo&apos;s</span> has become a
                favorite for generations.
              </p>
            </FadeIn>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-[50%]">
            <FadeIn delay={0} className="col-span-1">
              <Image
                src={"/pizzaeater2.jpg"}
                width={500}
                height={500}
                alt="eater2"
                className="w-full h-full object-cover rounded-xl"
              />
            </FadeIn>
            <FadeIn delay={80} className="col-span-2">
              <Image
                src={"/pizzaeater1.jpg"}
                width={500}
                height={500}
                alt="eater1"
                className="w-full h-full object-cover rounded-xl"
              />
            </FadeIn>
            <FadeIn delay={160} className="col-span-2">
              <Image
                src={"/pizzaeater3.jpg"}
                width={500}
                height={500}
                alt="eater3"
                className="w-full h-full object-cover rounded-xl"
              />
            </FadeIn>
            <FadeIn delay={240} className="col-span-1">
              <Image
                src={"/pizzaeater4.png"}
                width={500}
                height={500}
                alt="eater4"
                className="w-full h-full object-cover rounded-xl"
              />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

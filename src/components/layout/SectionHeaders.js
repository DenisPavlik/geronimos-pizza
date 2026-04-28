import FadeIn from "./FadeIn";

export default function SectionHeaders({ subHeader, mainHeader }) {
  return (
    <>
      {subHeader && (
        <FadeIn delay={0}>
          <h3 className="uppercase text-gray-500 font-josefin leading-4">
            {subHeader}
          </h3>
        </FadeIn>
      )}
      <FadeIn delay={subHeader ? 100 : 0}>
        <h2 className="text-primary font-lilita text-4xl italic">{mainHeader}</h2>
      </FadeIn>
    </>
  );
}

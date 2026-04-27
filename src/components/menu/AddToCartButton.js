"use client";

export default function AddToCartButton({
  hasSizesOrExtras,
  onClick,
  basePrice,
  image,
}) {
  function handleClick(ev) {
    const button = ev.currentTarget;
    const cartLink = Array.from(document.querySelectorAll("a[href='/cart']"))
      .find((el) => el.offsetWidth > 0 && el.offsetHeight > 0);
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (cartLink && image && !prefersReduced) {
      const cartRect = cartLink.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const startSize = 80;
      const endSize = 20;

      const flyImg = document.createElement("img");
      flyImg.src = image;
      flyImg.alt = "";
      Object.assign(flyImg.style, {
        position: "fixed",
        zIndex: "9999",
        width: startSize + "px",
        height: startSize + "px",
        borderRadius: "50%",
        objectFit: "cover",
        pointerEvents: "none",
        left: buttonRect.left + buttonRect.width / 2 - startSize / 2 + "px",
        top: buttonRect.top + buttonRect.height / 2 - startSize / 2 + "px",
        opacity: "1",
        transition: "none",
      });
      document.body.appendChild(flyImg);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          Object.assign(flyImg.style, {
            transition: [
              "left 0.9s cubic-bezier(0.2, 0.6, 0.4, 1)",
              "top 0.9s cubic-bezier(0.2, 0.6, 0.4, 1)",
              "width 0.9s ease",
              "height 0.9s ease",
              "opacity 0.9s ease",
            ].join(", "),
            left:
              cartRect.left + cartRect.width / 2 - endSize / 2 + "px",
            top:
              cartRect.top + cartRect.height / 2 - endSize / 2 + "px",
            width: endSize + "px",
            height: endSize + "px",
            opacity: "0",
          });
        });
      });

      setTimeout(() => flyImg.remove(), 1000);
    }

    onClick(ev);
  }

  if (!hasSizesOrExtras) {
    return (
      <button
        onClick={handleClick}
        className="mt-4 bg-primary text-white rounded-full px-8 py-2"
      >
        Add to cart ${basePrice}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="mt-4 bg-primary text-white rounded-full px-8 py-2"
    >
      Add to cart (from ${basePrice})
    </button>
  );
}

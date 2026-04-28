import Email from "@/components/icons/Email";
import Phone from "@/components/icons/Phone";
import Instagram from "@/components/icons/Instagram";
import Facebook from "@/components/icons/Facebook";
import Youtube from "@/components/icons/Youtube";

export default function ContactPage() {
  return (
    <section className="my-8">
      <div className="mt-8 md:mt-16 flex flex-col md:flex-row gap-10">
        <div className="flex flex-col gap-4">
          <div className="my-2">
            <h2 className="font-josefin text-center text-3xl font-bold text-gray-500 mb-4">
              Get in Touch
            </h2>
          </div>
          <div className="flex gap-4">
            <Email
              className={"w-12 bg-pink-200 text-pink-600 p-1 rounded-lg"}
            />
            <div className="flex flex-col text-start">
              <h3 className="text-lg text-gray-700">Email</h3>
              <a
                href="mailto:geronimospizza@gmail.com"
                className="text-gray-500 hover:text-pink-500 hover:scale-105 duration-300"
              >
                geronimospizza@gmail.com
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <Phone
              className={"w-12 text-emerald-600 bg-emerald-200 p-1 rounded-lg"}
            />
            <div className="flex flex-col text-start">
              <h3 className="text-lg text-gray-700">Phone</h3>
              <a
                href="tel:+46738123123"
                className="text-gray-500 hover:text-emerald-500 hover:scale-105 duration-300"
              >
                +46 738 123 123
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <Instagram
              className={"w-12 text-violet-600 bg-violet-200 p-1 rounded-lg"}
            />
            <div className="flex flex-col text-start">
              <h3 className="text-lg text-gray-700">Instagram</h3>
              <a
                href="https://www.instagram.com/"
                className="text-gray-500 hover:text-violet-500 hover:scale-105 duration-300"
              >
                geronimospizza
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <Facebook
              className={"w-12 text-sky-600 bg-sky-200 p-1 rounded-lg"}
            />
            <div className="flex flex-col text-start">
              <h3 className="text-lg text-gray-700">Facebook</h3>
              <a
                href="https://www.facebook.com/"
                className="text-gray-500 hover:text-sky-500 hover:scale-105 duration-300"
              >
                geronimospizza
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <Youtube
              className={"w-12 text-red-600 bg-red-200 p-1 rounded-lg"}
            />
            <div className="flex flex-col text-start">
              <h3 className="text-lg text-gray-700">Youtube</h3>
              <a
                href="https://www.youtube.com/"
                className="text-gray-500 hover:text-red-500 hover:scale-105 duration-300"
              >
                geronimospizza
              </a>
            </div>
          </div>
        </div>
        <div className="w-full h-[400px] md:h-[600px] rounded-lg overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5103.879963195662!2d-73.96668661501086!3d40.782241890556364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2589a018531e3%3A0xb9df1f7387a94119!2z0KbQtdC90YLRgNCw0LvRjNC90LjQuSDQv9Cw0YDQug!5e0!3m2!1suk!2sus!4v1745429918013!5m2!1suk!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

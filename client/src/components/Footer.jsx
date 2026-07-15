import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToFaq = (event) => {
    event.preventDefault();

    const faqSection = document.getElementById("faq");

    if (faqSection) {
      faqSection.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      window.location.href = "/#faq";
    }
  };

  return (
    <footer className="border-t border-gray-200 bg-gray-950 text-white dark:border-gray-800">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            <span className="text-2xl">🛍️</span>
            Local Marketplace
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-7 text-gray-400">
            Discover local stores, purchase quality products and
            support small businesses available near you.
          </p>

          <div className="mt-5 flex gap-3">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-sm transition hover:bg-primary-600"
              aria-label="Facebook"
            >
              f
            </a>

            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-sm transition hover:bg-primary-600"
              aria-label="Instagram"
            >
              ◎
            </a>

            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-sm transition hover:bg-primary-600"
              aria-label="LinkedIn"
            >
              in
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold">
            Quick Links
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-gray-400">
            <Link
              to="/"
              className="transition hover:text-white"
            >
              Home
            </Link>

            <Link
              to="/login"
              className="transition hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="transition hover:text-white"
            >
              Register
            </Link>

            <a
              href="/#faq"
              onClick={scrollToFaq}
              className="transition hover:text-white"
            >
              Frequently Asked Questions
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold">
            Marketplace
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-gray-400">
            <span>Browse Products</span>
            <span>Explore Local Stores</span>
            <span>Become a Vendor</span>
            <span>Order Management</span>
            <span>Secure Shopping</span>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold">
            Contact Us
          </h3>

          <div className="mt-5 space-y-4 text-sm leading-6 text-gray-400">
            <p className="flex gap-3">
              <span>📍</span>
              <span>
                Rath, Hamirpur,
                <br />
                Uttar Pradesh, India
              </span>
            </p>

            <p className="flex gap-3">
              <span>📞</span>
              <a
                href="tel:+919876543210"
                className="hover:text-white"
              >
                +91 9876543210
              </a>
            </p>

            <p className="flex gap-3">
              <span>✉️</span>
              <a
                href="mailto:support@localmarketplace.com"
                className="break-all hover:text-white"
              >
                support@localmarketplace.com
              </a>
            </p>

            <p className="flex gap-3">
              <span>🕐</span>
              <span>Monday–Saturday: 9 AM–7 PM</span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-gray-500 sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p>
            © {currentYear} Local Marketplace. All rights reserved.
          </p>

          <p>
            Built with MERN Stack
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
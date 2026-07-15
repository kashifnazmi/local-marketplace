import { useState } from "react";

const faqItems = [
  {
    question: "How do I place an order?",
    answer:
      "Browse products, open the required product, add it to your cart and complete checkout. You must be logged in as a customer to place an order.",
  },
  {
    question: "Can I purchase products from different stores?",
    answer:
      "Yes. Local Marketplace allows you to browse products from multiple approved local stores available on the platform.",
  },
  {
    question: "How can I become a vendor?",
    answer:
      "Register using the Vendor role. After registration, an administrator will review and approve your account. Once approved, you can create a store and add products.",
  },
  {
    question: "Can vendors add and manage products?",
    answer:
      "Yes. Approved vendors can add, edit and delete products from their Vendor Panel. Vendors can also manage stock quantity, prices and order status.",
  },
  {
    question: "Can I return a product?",
    answer:
      "A product can be returned only when it is marked as return eligible. Check the product details before placing your order.",
  },
  {
    question: "How can I check my order status?",
    answer:
      "Log in with your customer account and open the Orders page. You can see your order history and current order status there.",
  },
  {
    question: "How are stores verified?",
    answer:
      "Vendor accounts and stores are reviewed by the administrator before they become visible to customers.",
  },
  {
    question: "Is Local Marketplace mobile responsive?",
    answer:
      "Yes. The marketplace is designed to work on mobile phones, tablets, laptops and desktop screens.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleQuestion = (index) => {
    setOpenIndex((previousIndex) =>
      previousIndex === index ? null : index
    );
  };

  return (
    <section
      id="faq"
      className="border-t border-gray-200 bg-white py-14 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-9 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
            Help Center
          </p>

          <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base dark:text-gray-400">
            Find answers related to customers, vendors, stores,
            products and orders.
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={item.question}
                className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800"
              >
                <button
                  type="button"
                  onClick={() => toggleQuestion(index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
                    {item.question}
                  </span>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xl font-medium text-primary-600 dark:bg-gray-700">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-200 px-5 py-4 sm:px-6 dark:border-gray-700">
                    <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                      {item.answer}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
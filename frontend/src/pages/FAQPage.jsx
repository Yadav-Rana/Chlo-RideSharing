import {useState} from "react";
import {motion, AnimatePresence} from "framer-motion";

const FAQItem = ({question, answer}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 py-4">
      <button
        className="flex justify-between items-center w-full text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-orange-500">{question}</h3>
        <span
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.3}}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1 text-gray-300">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQPage = () => {
  const generalFAQs = [
    {
      question: "What is Chlo?",
      answer:
        "Chlo is your friendly neighborhood ride-sharing platform that connects you with nearby drivers in your local area. We provide safe, reliable, and affordable transportation options designed specifically for your community.",
    },
    {
      question: "How do I download the Chlo app?",
      answer:
        "Currently, Chlo is available as a web application. You can access it through any modern web browser on your desktop or mobile device. We're working on native mobile apps for iOS and Android, which will be available soon.",
    },
    {
      question: "Is Chlo available in my area?",
      answer:
        "Chlo is designed to work within your local area. The availability of rides depends on the number of active drivers in your neighborhood. We're continuously expanding our network of friendly drivers to improve coverage in your community.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "You can reach our customer support team through the 'Contact Us' page on our website, by emailing support@chlo.com, or by calling our helpline at +91 9876543210. Our support team is available Monday through Friday from 9:00 AM to 6:00 PM.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Yes, we take data security very seriously. All personal information is encrypted and stored securely. We have implemented industry-standard security measures to protect your data, and we never share your information with third parties without your consent.",
    },
  ];

  const passengerFAQs = [
    {
      question: "How do I book a ride?",
      answer:
        "To book a ride, log in to your Chlo account, enter your pickup and destination locations, select your preferred vehicle type, and click 'Find Rides'. Once a rider accepts your request, you'll receive a notification with the rider's details and estimated arrival time.",
    },
    {
      question: "How is the fare calculated?",
      answer:
        "Our fares are calculated based on the distance, duration, and vehicle type. We maintain transparent pricing with no hidden fees or surge pricing during peak hours. The fare is displayed before you confirm your booking.",
    },
    {
      question: "Can I schedule a ride in advance?",
      answer:
        "Currently, we only support on-demand ride bookings. However, we're working on implementing scheduled rides in the near future, which will allow you to book rides up to 7 days in advance.",
    },
    {
      question: "How do I pay for my ride?",
      answer:
        "Currently, Chlo supports cash payments directly to the rider. We're working on implementing digital payment options, including credit/debit cards, UPI, and digital wallets, which will be available soon.",
    },
    {
      question: "What if I need to cancel my ride?",
      answer:
        "You can cancel your ride at any time before the rider arrives. However, to ensure fairness to our riders, cancellations made after a rider has accepted your request may incur a small cancellation fee, especially if the rider is already on their way to your pickup location.",
    },
  ];

  const riderFAQs = [
    {
      question: "How do I become a rider on Chlo?",
      answer:
        "To become a rider, sign up on our platform, select 'Rider' as your account type, provide your vehicle information, and complete the verification process. Once approved, you can start accepting ride requests.",
    },
    {
      question: "What are the requirements to become a rider?",
      answer:
        "To become a rider, you must be at least 18 years old, have a valid driver's license, vehicle registration, and insurance. Your vehicle must meet our safety standards and be in good condition. You'll also need to pass a background check.",
    },
    {
      question: "How do I receive ride requests?",
      answer:
        "Once you're online as a rider, you'll receive notifications for nearby ride requests. You can view the pickup location, destination, and fare before deciding whether to accept or decline the request.",
    },
    {
      question: "How and when do I get paid?",
      answer:
        "Currently, passengers pay riders directly in cash at the end of the ride. We're working on implementing digital payment options, which will include automatic transfers to your linked bank account.",
    },
    {
      question: "Can I choose when to work?",
      answer:
        "Yes, one of the benefits of being a Chlo rider is the flexibility to choose your own hours. You can go online and offline whenever you want, allowing you to work around your schedule.",
    },
  ];

  return (
    <div className="page-container bg-app text-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
        >
          <h1 className="text-4xl font-bold text-center mb-8 text-orange-500">
            Frequently Asked Questions
          </h1>

          <div className="bg-[#1E2235] rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">
              General Questions
            </h2>

            <div className="divide-y divide-gray-200">
              {generalFAQs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </div>

          <div className="bg-[#1E2235] rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">
              For Passengers
            </h2>

            <div className="divide-y divide-gray-700">
              {passengerFAQs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </div>

          <div className="bg-[#1E2235] rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">
              For Riders
            </h2>

            <div className="divide-y divide-gray-700">
              {riderFAQs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 text-center bg-[#1E2235] rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-500">
              Still have questions?
            </h3>
            <p className="text-gray-300 mb-6">
              If you couldn't find the answer to your question, please feel free
              to contact our support team.
            </p>
            <a
              href="/contact"
              className="inline-block bg-gradient-primary text-white font-medium py-2 px-6 rounded-md transition-colors shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;

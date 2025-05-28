import {motion} from "framer-motion";

const AboutPage = () => {
  return (
    <div className="page-container bg-app text-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
        >
          <h1 className="text-4xl font-bold text-center mb-8 text-orange-500">
            About Chlo
          </h1>

          <div className="bg-[#1E2235] rounded-lg shadow-md p-8 mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">
              Our Mission
            </h2>
            <p className="text-gray-300 mb-6">
              At Chlo, our mission is to provide safe, reliable, and affordable
              transportation options for local communities. We believe that
              everyone deserves access to convenient mobility solutions that
              connect people to their destinations while supporting local
              drivers and reducing environmental impact.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-orange-500">
              Our Story
            </h2>
            <p className="text-gray-300 mb-6">
              Chlo was founded in 2025 by a group of transportation enthusiasts
              who recognized the need for a personalized ride-sharing platform
              that focuses on shorter trips within your local community. We
              noticed that while major ride-sharing companies dominated urban
              centers, many suburban and rural areas like yours remained
              underserved.
            </p>
            <p className="text-gray-300 mb-6">
              Our team set out to create a solution that would not only provide
              reliable transportation for you and your neighbors but also create
              flexible earning opportunities for drivers in your local
              community. By focusing on your neighborhood, we ensure that
              drivers can stay close to home while still providing essential
              services to their neighbors.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-orange-500">
              What Sets Us Apart
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#2A2F45] p-4 rounded-lg border border-orange-500/30">
                <h3 className="text-lg font-medium mb-2 text-orange-400">
                  Community Focus
                </h3>
                <p className="text-gray-300">
                  We prioritize building strong relationships within local
                  communities, supporting both riders and passengers in their
                  daily transportation needs.
                </p>
              </div>
              <div className="bg-[#2A2F45] p-4 rounded-lg border border-orange-500/30">
                <h3 className="text-lg font-medium mb-2 text-orange-400">
                  Safety First
                </h3>
                <p className="text-gray-300">
                  Our platform includes OTP verification, real-time tracking,
                  and a comprehensive rating system to ensure safety for
                  everyone.
                </p>
              </div>
              <div className="bg-[#2A2F45] p-4 rounded-lg border border-orange-500/30">
                <h3 className="text-lg font-medium mb-2 text-orange-400">
                  Transparent Pricing
                </h3>
                <p className="text-gray-300">
                  No surge pricing or hidden fees. We offer fair, consistent
                  rates based on distance and vehicle type.
                </p>
              </div>
              <div className="bg-[#2A2F45] p-4 rounded-lg border border-orange-500/30">
                <h3 className="text-lg font-medium mb-2 text-orange-400">
                  Local Support
                </h3>
                <p className="text-gray-300">
                  Our customer service team understands local needs and can
                  provide personalized assistance when you need it.
                </p>
              </div>
            </div>
          </div>

          {/* <motion.div
            className="bg-white rounded-lg shadow-md p-8"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.3, duration: 0.5}}
          >
            {/* <h2 className="text-2xl font-semibold mb-6 text-gray-700 text-center">Meet Our Team</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium">Rahul Sharma</h3>
              <p className="text-gray-600">Co-Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium">Priya Patel</h3>
              <p className="text-gray-600">Co-Founder & CTO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium">Amit Kumar</h3>
              <p className="text-gray-600">Head of Operations</p>
            </div>
          </div> */}

          {/* <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Join Our Journey</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              We're always looking for passionate individuals to join our team. If you're
              interested in helping us transform local transportation, check out our careers page.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors">
              View Careers
            </button>
          </div>
          </motion.div>
          */}
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;

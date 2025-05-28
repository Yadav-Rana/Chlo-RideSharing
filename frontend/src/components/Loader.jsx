import {motion} from "framer-motion";

const Loader = ({text = "Loading..."}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <motion.div
        className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full"
        animate={{rotate: 360}}
        transition={{duration: 1, repeat: Infinity, ease: "linear"}}
      />
      <motion.p
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 0.3}}
        className="mt-4 text-gray-700 font-medium"
      >
        {text}
      </motion.p>
    </div>
  );
};

export default Loader;

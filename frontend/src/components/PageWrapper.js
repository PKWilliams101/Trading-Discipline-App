import { motion } from 'framer-motion';

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Starts invisible and slightly pushed down
      animate={{ opacity: 1, y: 0 }}  // Fades in and slides up to normal position
      exit={{ opacity: 0, y: -20 }}   // Slides up and fades out when leaving
      transition={{ duration: 0.5, ease: "easeOut" }} // Smooth timing
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;